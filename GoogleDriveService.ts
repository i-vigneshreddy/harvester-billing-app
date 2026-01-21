
const SCOPES = 'https://www.googleapis.com/auth/drive.file';
const BACKUP_FILENAME = 'vigneshwara_auth_backup.json';

export class GoogleDriveService {
  private static accessToken: string | null = localStorage.getItem('harvester_gdrive_token');

  static isConnected(): boolean {
    return !!this.accessToken;
  }

  static async authenticate(): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const client = (window as any).google.accounts.oauth2.initTokenClient({
          client_id: '542616238382-35n48r8h68q01u0sc0eunm12q2q2q2q2.apps.googleusercontent.com', // Placeholder: Usually provided by user
          scope: SCOPES,
          callback: (response: any) => {
            if (response.error) {
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
        reject(e);
      }
    });
  }

  static disconnect() {
    this.accessToken = null;
    localStorage.removeItem('harvester_gdrive_token');
  }

  static async syncUsers() {
    if (!this.accessToken) return;

    const users = localStorage.getItem('harvester_users') || '[]';
    const metadata = {
      name: BACKUP_FILENAME,
      mimeType: 'application/json',
    };

    try {
      // 1. Search for existing file
      const searchRes = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=name='${BACKUP_FILENAME}' and trashed=false`,
        {
          headers: { Authorization: `Bearer ${this.accessToken}` },
        }
      );
      const searchData = await searchRes.json();
      const existingFileId = searchData.files?.[0]?.id;

      let url = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
      let method = 'POST';

      if (existingFileId) {
        url = `https://www.googleapis.com/upload/drive/v3/files/${existingFileId}?uploadType=multipart`;
        method = 'PATCH';
      }

      const boundary = 'foo_bar_baz';
      const body = [
        `--${boundary}\r\n`,
        `Content-Type: application/json; charset=UTF-8\r\n\r\n`,
        `${JSON.stringify(metadata)}\r\n`,
        `--${boundary}\r\n`,
        `Content-Type: application/json\r\n\r\n`,
        `${users}\r\n`,
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

      if (res.ok) {
        console.log('User registry synced to Google Drive successfully.');
        const settings = JSON.parse(localStorage.getItem('harvester_settings') || '{}');
        settings.googleDriveLastSync = new Date().toISOString();
        localStorage.setItem('harvester_settings', JSON.stringify(settings));
      } else if (res.status === 401) {
        // Token expired, clear it
        this.disconnect();
      }
    } catch (e) {
      console.error('Google Drive Sync Failed:', e);
    }
  }
}
