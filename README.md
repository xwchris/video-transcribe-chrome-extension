# Videosays Chrome Extension

Private Chrome extension repository for submitting public video links to Videosays transcription.

## Development

```bash
npm install
npm test
npm run build
```

Load `dist/` as an unpacked extension in Chrome.

## Compliance Boundary

- The extension submits user-selected or current-tab public video URLs to `https://api.videosays.com`.
- It uses the user's Videosays API key via `X-API-Key`.
- It does not download videos, remove watermarks, bypass login restrictions, or inject ads.
- It avoids broad host permissions and does not run content scripts in web pages.
