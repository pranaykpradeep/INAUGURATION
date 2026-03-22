# Remote Cursor Forms - Inauguration Sync

## What this project does
- Shows one main inauguration page.
- Opens Screen 2 from the bottom link (`Open Screen 2`) using `?screen=2`.
- Screen 1 button sends a trigger to Google Apps Script.
- Both screens poll Apps Script and start video together when triggered.

## Files
- `index.html`: UI and hidden fullscreen video element.
- `script.js`: trigger logic, polling logic, fullscreen playback.
- `style.css`: visual design and bottom Screen 2 link style.
- `backend.gs`: Google Apps Script backend.

## 1) Add your video
1. Put your final video file in this same folder:
   - `inauguration-video.mp4`
2. Current source is already set in `index.html`:
   - `<video src="inauguration-video.mp4" ...>`
3. If your filename is different, update `src` in `index.html`.

## 2) Set up Google Apps Script backend
1. Open https://script.google.com/.
2. Create a new project.
3. Replace default code with the content from `backend.gs`.
4. Click `Deploy` -> `New deployment`.
5. Select deployment type `Web app`.
6. Set:
   - `Execute as`: Me
   - `Who has access`: Anyone
7. Click `Deploy` and complete authorization.
8. Copy the generated `Web app URL`.

## 3) Connect frontend to Apps Script
1. Open `script.js`.
2. Find:
   - `const APP_SCRIPT_URL = "YOUR_APP_SCRIPT_URL_HERE";`
3. Replace with your deployed URL.
4. Save.

## 4) Run the project
You can host this folder with any static server. Example with VS Code Live Server or any local host.

## 5) Event day procedure
1. Open `index.html` on Screen 1.
2. Click `Open Screen 2` at the bottom to open the second window.
3. On both screens, click anywhere once to unlock autoplay permissions.
4. On Screen 1, click `COMMENCE`.
5. Apps Script trigger is set; both screens should detect status and start video fullscreen.

## 6) Re-test / reset trigger
Use this URL in browser once to reset state:
- `<YOUR_WEB_APP_URL>?action=reset`

After reset, repeat the event flow.

## Troubleshooting
- If button shows `MISSING APPS SCRIPT URL`, set `APP_SCRIPT_URL` in `script.js`.
- If Screen 2 does not start, confirm both screens can access the same Apps Script URL.
- If sound does not play, click once on the page before pressing `COMMENCE` (browser autoplay policy).
- If you changed access in Apps Script deployment, redeploy and update URL.
