# 🌾 Harvester Billing - Vigneshwara Harvester

[![Netlify Status](https://api.netlify.com/api/v1/badges/YOUR_NETLIFY_ID/deploy-status)](https://www.netlify.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react)](https://react.dev/)
[![Gemini AI](https://img.shields.io/badge/Gemini_AI-Flash-4285F4?style=flat&logo=google-gemini)](https://ai.google.dev/)

A professional, field-ready billing and fleet management suite designed specifically for **Vigneshwara Harvester**.

---

## 👤 Business Profile
- **Company:** Vigneshwara Harvester
- **Proprietor:** Palwai Mahendher Reddy
- **Contact Support:** Palwaimahi@gmail.com

---

## 🚀 Deploying to Netlify

This app is pre-configured for **Netlify**. Follow these steps to deploy your own instance:

1. **Push to GitHub**: Upload this code to a private or public GitHub repository.
2. **Connect to Netlify**:
   - Log in to [Netlify](https://app.netlify.com/).
   - Click **Add new site** > **Import an existing project**.
   - Select your GitHub repository.
3. **Configure Environment Variables**:
   - In the Netlify UI, go to **Site settings** > **Environment variables**.
   - Add a variable named `API_KEY`.
   - Set the value to your **Google Gemini API Key** (get one at [aistudio.google.com](https://aistudio.google.com/)).
4. **Deploy**: Netlify will automatically detect the `netlify.toml` and `_redirects` files and deploy the app perfectly.

---

## 🛡️ Security & Routing
- **SPA Friendly**: Uses `_redirects` to ensure deep links (like `/history` or `/settings`) work on refresh.
- **Secure Headers**: Configured via `netlify.toml` to prevent Clickjacking and XSS attacks.
- **Local Persistence**: Business data is stored securely in the local browser context for high speed in low-connectivity areas.

---

## 🛠️ Tech Stack
- **Framework**: React 19 (ESM)
- **Styling**: Tailwind CSS (JIT)
- **AI Engine**: Google Gemini 3 Flash
- **Icons**: Lucide React
- **Hosting**: Netlify Edge

---
© 2024 Vigneshwara Harvester. All Rights Reserved. Authorized by Palwai Mahendher Reddy.