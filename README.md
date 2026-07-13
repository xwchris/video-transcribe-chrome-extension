# Video Transcribe Chrome Extension by Videosays

A Chrome extension for turning public video links into transcripts with [Videosays](https://videosays.com).

It detects supported video pages, submits the link to Videosays with your API key, and lets you track the transcription task from the popup.

## Supported Platforms

- YouTube
- TikTok
- Douyin
- Bilibili
- Instagram
- X
- Xiaohongshu
- Kuaishou

## Quick Links

- [Try Videosays](https://videosays.com)
- [Get a Videosays API key](https://videosays.com/dashboard/developer)
- [API docs](https://videosays.com/docs)

## Development

```bash
npm install
npm test
npm run build
```

Load `dist/` as an unpacked extension in Chrome.

To create the Chrome Web Store upload package:

```bash
npm run package
```

## Compliance Boundary

- The extension submits user-selected or current-tab public video URLs to `https://api.videosays.com`.
- It uses the user's Videosays API key via `X-API-Key`.
- It does not download videos, remove watermarks, bypass login restrictions, or inject ads.
- It avoids broad host permissions and does not run content scripts in web pages.
