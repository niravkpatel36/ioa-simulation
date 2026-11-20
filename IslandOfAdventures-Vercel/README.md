# Island of Adventures – simple guide

## Put it online (one time, ~5 minutes)
Easiest: **GitHub + Vercel**
1. Create a free account on github.com and vercel.com (sign in to Vercel with GitHub).
2. On GitHub: *New repository* -> *uploading an existing file* -> drag in everything from this folder (index.html, screen.html, engine.js, and the videos folder) -> Commit.
3. On Vercel: *Add New > Project* -> pick that repository -> **Deploy** (leave every setting as is).
You get a link like `https://your-project.vercel.app`.

(Alternative if you have Node installed: open Terminal in this folder, run `npx vercel --prod`, answer Enter to the questions.)

## Running the show
1. On the MacBook, open your link in **Chrome**. Wait until it says **Videos ready**.
2. Click **1 · Open audience screen**. Drag that window onto the LED screen.
3. **Click once on the audience screen** -> it goes fullscreen and sound turns on. (Press Esc to leave fullscreen.)
4. Use the three big buttons: **WAIT**, **ROW**, **ARRIVE**. Switch between WAIT and ROW as often as you like.
   **ARRIVE** plays once, then stays on the island picture. **Start over** resets everything.

Tips: open it 10+ minutes early; keep both windows open and **don't refresh**; plug the Mac in. If anything looks wrong, close both windows and start again from step 1. A red message tells you if a video fails to load.

## Changing videos later
Replace the files in `videos/` (keep the names `wait.mp4`, `row.mp4`, `arrive.mp4`), upload to GitHub again; Vercel redeploys automatically.
