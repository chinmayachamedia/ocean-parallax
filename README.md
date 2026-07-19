# Descent — Ocean Depth Parallax

A single-page parallax site that scrolls from the sunlit surface (0m) down
through five real ocean zones to the hadal trenches (11,000m). Every visual
is CSS/SVG — gradients, blurred blobs, and clip-path silhouettes — so there
are no image assets to load.

## 1. Folder structure

```
ocean-parallax/
├── index.html        # all markup: nav, depth gauge, 6 sections
├── css/
│   └── style.css     # tokens, layout, parallax shapes, responsive rules
├── js/
│   └── script.js      # scroll handling, parallax, fade-ins, nav state
└── README.md
```

Plain HTML/CSS/JS was used on purpose — a one-page scrolling site doesn't
need a build step, a framework, or any npm dependency, and it keeps the
whole thing readable in three files.

## 2. Run it locally

No build tools or installs are required.

**Option A — just open it**
Double-click `index.html`, or drag it into a browser tab.

**Option B — local server (recommended, avoids any file:// quirks)**
```bash
cd ocean-parallax
python3 -m http.server 8000
# then open http://localhost:8000
```
or, with Node installed:
```bash
npx serve .
```

## 3. Deploy to Vercel

**Fastest — Vercel CLI**
```bash
npm install -g vercel   # skip if already installed
cd ocean-parallax
vercel                  # follow the prompts, accept defaults
vercel --prod           # promote to your production URL
```
No framework preset, build command, or output directory is needed — Vercel
serves the static files as-is.

**Alternative — Git + Vercel dashboard**
1. Push this folder to a GitHub/GitLab/Bitbucket repo.
2. In the Vercel dashboard: **Add New → Project → Import** your repo.
3. Framework Preset: **Other** (static site). Leave Build Command and
   Output Directory blank.
4. Click **Deploy**.

## Notes on the implementation

- **Parallax**: elements carry a `data-speed` attribute (0–1). A single
  scroll listener, throttled with `requestAnimationFrame`, offsets each
  element's `translate3d` by `scrollDistance * speed`, so lower speeds
  visually lag and read as "further back."
- **Depth gauge** (right edge, hidden on mobile to keep small screens
  uncluttered): doubles as the required scroll-progress indicator, but
  reports it in the site's own units — metres and zone name — instead of
  a generic percentage bar. The top hairline bar is the plain percentage
  version, kept for mobile and for anyone who prefers it.
- **Fade-ins**: handled by `IntersectionObserver`, not scroll math, so
  off-screen sections cost nothing until they're about to appear.
- **Accessibility**: `prefers-reduced-motion` disables parallax offsets
  and shortens transitions; focus states are visible; nav is keyboard
  reachable.
- **No libraries**: no jQuery, no animation framework, no GSAP — every
  effect is native CSS transitions/keyframes or a few lines of vanilla JS.
