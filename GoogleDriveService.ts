
const SCOPES = 'https://www.googleapis.com/auth/drive.file';
const BACKUP_FILENAME = 'vigneshwara_harvester_full_backup.json';

export class GoogleDriveService {
  private static accessToken: string | null = localStorage.getItem('harvester_gdrive_token');

  static isConnected(): boolean {
    return !!this.accessToken;
  }

  /**
   * Helper to get the current Client ID from user settings
   */
  private static getClientId(): string {
    const sessionUser = JSON.parse(localStorage.getItem('harvester_session') || '{}');
    const userPrefix = sessionUser.id ? `u_${sessionUser.id}_` : 'harvester_';
    const settingsRaw = localStorage.getItem(`${userPrefix}settings`);
    if (settingsRaw) {
      const settings = JSON.parse(settingsRaw);
      return settings.googleClientId || '';
    }
    return '';
  }

  static async authenticate(): Promise<string> {
    return new Promise((resolve, reject) => {
      const google = (window as any).google;
      if (!google || !google.accounts || !google.accounts.oauth2) {
        const errorMsg = "Auth library not loaded. Ensure you are online and refresh.";
        alert(errorMsg);
        reject(new Error(errorMsg));
        return;
      }

      const clientId = this.getClientId();
      if (!clientId) {
        const errorMsg = "Google Client ID not configured. Please go to Settings > Cloud Setup and enter your Client ID from Google Cloud Console.";
        alert(errorMsg);
        reject(new Error(errorMsg));
        return;
      }

      try {
        const client = google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: SCOPES,
          prompt: 'select_account',
          callback: (response: any) => {
            if (response.error) {
              console.error('Google OAuth Error:', response.error);
              if (response.error === 'idpiframe_initialization_failed') {
                alert("The domain you are using is not authorized in your Google Cloud Project settings.");
              }
              reject(response);
            } else {
              this.accessToken = response.access_token;
              localStorage.setItem('harvester_gdrive_token', response.access_token);
              resolve(response.access_token);
            }
          },
        });
        client.requestAccessToken();
      } catch (e) {
        console.error('Auth Init Fail:', e);
        reject(e);
      }
    });
  }

  static disconnect() {
    this.accessToken = null;
    localStorage.removeItem('harvester_gdrive_token');
  }

  static async syncUsers(currentUserId?: string) {
    if (!this.accessToken) return;

    const fullState: Record<string, string> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('u_') || key.startsWith('harvester_'))) {
        if (key === 'harvester_gdrive_token') continue;
        fullState[key] = localStorage.getItem(key) || '';
      }
    }

    const payload = {
      timestamp: new Date().toISOString(),
      sourceUserId: currentUserId,
      fullState: fullState,
    };

    const metadata = {
      name: BACKUP_FILENAME,
      description: `Full Vigneshwara Harvester Backup`,
      mimeType: 'application/json',
    };

    try {
      const q = encodeURIComponent(`name='${BACKUP_FILENAME}' and trashed=false`);
      const searchRes = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=${q}`,
        { headers: { Authorization: `Bearer ${this.accessToken}` } }
      );
      
      if (searchRes.status === 401) {
        this.disconnect();
        return;
      }

      const searchData = await searchRes.json();
      const existingFileId = searchData.files?.[0]?.id;

      let url = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
      let method = 'POST';

      if (existingFileId) {
        url = `https://www.googleapis.com/upload/drive/v3/files/${existingFileId}?uploadType=multipart`;
        method = 'PATCH';
      }

      const boundary = 'sync_boundary';
      const body = [
        `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n`,
        `--${boundary}\r\nContent-Type: application/json\r\n\r\n${JSON.stringify(payload)}\r\n`,
        `--${boundary}--`
      ].join('');

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': `multipart/related; boundary=${boundary}`,
        },
        body,
      });

      if (res.ok && currentUserId) {
        const userPrefix = `u_${currentUserId}_`;
        const settingsRaw = localStorage.getItem(`${userPrefix}settings`);
        if (settingsRaw) {
          const settings = JSON.parse(settingsRaw);
          settings.googleDriveLastSync = payload.timestamp;
          localStorage.setItem(`${userPrefix}settings`, JSON.stringify(settings));
        }
      }
    } catch (e) {
      console.error('Sync failed', e);
    }
  }

  static async restoreData(currentUserId: string): Promise<boolean> {
    if (!this.accessToken) return false;

    try {
      const q = encodeURIComponent(`name='${BACKUP_FILENAME}' and trashed=false`);
      const searchRes = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=${q}`,
        { headers: { Authorization: `Bearer ${this.accessToken}` } }
      );
      
      const searchData = await searchRes.json();
      const fileId = searchData.files?.[0]?.id;

      if (!fileId) return false;

      const downloadRes = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
        { headers: { Authorization: `Bearer ${this.accessToken}` } }
      );

      if (!downloadRes.ok) return false;

      const payload = await downloadRes.json();
      if (!payload.fullState) return false;

      Object.keys(payload.fullState).forEach(key => {
        localStorage.setItem(key, payload.fullState[key]);
      });

      return true;
    } catch (e) {
      return false;
    }
  }
}
