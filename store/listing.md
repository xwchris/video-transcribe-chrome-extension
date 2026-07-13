# Chrome Web Store Listing Draft

## Short Description

Turn the current public video page into transcript text with Videosays.

## Long Description

Videosays helps creators, researchers, and operators turn public video links into clean transcript text. Open a supported video page, click the Videosays extension, and submit the link to your Videosays account. The extension creates a transcription task, shows task status, and links back to your Videosays dashboard.

Supported link types include YouTube, TikTok, Douyin, Bilibili, Xiaohongshu, Kuaishou, Instagram, X, and Twitter public video links.

Videosays is intended for videos you own, created, or have permission to process. It does not download videos, remove watermarks, bypass login restrictions, or redistribute media.

## Permissions

- `activeTab`: reads the URL of the current tab only after the user opens the extension.
- `contextMenus`: adds a user-triggered "Transcribe with Videosays" action.
- `storage`: stores the user's API key and last task metadata locally.
- `https://api.videosays.com/*`: submits tasks and checks status through the Videosays API.

## Notes

An active Videosays account and API key are required. Some tasks require available Videosays credits.
