# WC 2026 Sticker Tracker

> A web app to track your 2026 FIFA World Cup sticker collection — compare with the owner to swap duplicates, follow a page-by-page sticking guide, and log your pack spend. Designed to be **forked and personalised in under 10 minutes**.

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white&style=flat-square)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white&style=flat-square)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38BDF8?logo=tailwindcss&logoColor=white&style=flat-square)](https://tailwindcss.com)
[![Deployed on GitHub Pages](https://img.shields.io/badge/Deploy-GitHub%20Pages-222?logo=github&style=flat-square)](https://fghenriques99.github.io/caderneta-2026/)

**[Live Demo →](https://fghenriques99.github.io/caderneta-2026/)**

---

## Features

| Tab | What it does |
|-----|-------------|
| **Trade & Compare** | Enter your collection (paste, interactive grid, or CSV upload) and instantly see mutual trade opportunities with the album owner |
| **Collection Progress** | Browse all stickers in a full interactive grid (click to toggle ownership) or switch to a per-team progress breakdown |
| **Available Duplicates** | See exactly which stickers the owner has available to trade, with duplicate counts |
| **Sticking Guide** | Paste codes from a new pack — stickers are sorted by album page so you can stick them in order without flipping back and forth. Mark each one done as you go. |
| **Cost** | Configure your pack price and size to track total spend, packs opened, and packing efficiency |

**Additional highlights:**

- 🌍 **English / Portuguese** toggle with flag buttons — auto-detects from browser language, persisted to `localStorage`
- 📊 **Google Sheets** as master data source — update ownership in a spreadsheet, the app reflects it on next load
- ✍️ **Three input modes** — paste text (`ARG 1, BRA 5`), click the mini grid, or upload a CSV
- 📋 **Pre-filled trade message** copied to clipboard in one click
- 💾 **Auto-saves** your collection and sticking progress to `localStorage`
- ♿ **Fully accessible** — ARIA roles, skip navigation, keyboard navigation, `focus-visible` rings, `prefers-reduced-motion` support
- ✨ **Responsive dark-theme UI** with glassmorphism and Framer Motion animations

---

## Fork & Personalise in 4 Steps

### 1. Fork this repository

Click **Fork** at the top right of this page. You'll have your own copy in seconds - do not copy only main.

### 2. Edit the one config file

Open **`src/config.js`** — this is the **only file you need to change**. Everything else (header, footer, contact card, trade message, stats labels) automatically uses these values.

```js
export const config = {
  // ── Your profile ──────────────────────────────────────────────────────────
  ownerName:         'Francisco',                    // Your display name
  ownerEmail:        'you@example.com',              // Contact email
  ownerLinkedIn:     'https://www.linkedin.com/in/your-handle/',
  ownerGitHub:       'https://github.com/you/your-repo',
  ownerLocation:     'Lisbon, Portugal',
  ownerLocationFlag: '🇵🇹',

  // ── Google Sheet ──────────────────────────────────────────────────────────
  googleSheetId:          'YOUR_SHEET_ID',
  googleSheetGid:         'YOUR_SHEET_GID',
  googleSheetTemplateUrl: 'https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit',

  // ── Investment defaults ───────────────────────────────────────────────────
  defaultPricePerPack:    1.20,   // € per sticker pack
  defaultStickersPerPack: 7,      // stickers per pack
};
```

### 3. Connect your Google Sheet

The app reads your sticker data live from a Google Sheet published as CSV. Here's how to set it up:

**3a. Make a copy of the template sheet**

Open the [template Google Sheet](https://docs.google.com/spreadsheets/d/1_q13F2KfncPjbYjFezvBJHugJ-_yY-qg9I1y9lhc3Bc/edit?usp=sharing) → **File → Make a copy**.

**3b. Fill in your data**

The sheet has these columns:

| Column | Required | Description |
|--------|----------|-------------|
| `SEL` | ✅ | Three-letter team code (e.g. `ARG`, `BRA`, `POR`) |
| `NO` | ✅ | Sticker number within that team |
| `Own` | ✅ | `TRUE` if you own it, `FALSE` otherwise |
| `Duplicate` | ✅ | How many extra copies you have (0 if none) |
| `Page` | ⭐ | Album page number — **required for the Sticking Guide** |

**3c. Make the sheet publicly accessible**

This step is **required** — without it the app cannot fetch your data.

1. **File → Share → Publish to web**
2. Select your data sheet tab from the first dropdown
3. Set the format to **CSV**
4. Click **Publish**

Then go to **File → Share → Share with anyone** and set access to **Viewer** (this covers both the direct export URL the app uses and the published CSV).

To find your `SHEET_ID` and `SHEET_GID`, look at the URL of your sheet:
```
https://docs.google.com/spreadsheets/d/SHEET_ID/edit#gid=SHEET_GID
```

Paste both values into `src/config.js`.

### 4. Deploy to GitHub Pages

**4a. Set your repo name in `vite.config.js`**

Open `vite.config.js` and update the `base` field to match **your** repository name — this is required or all assets will 404:

```js
base: '/your-repo-name/',   // e.g. '/stickers-2026/'
```

**4b. (Optional) Update social preview tags in `index.html`**

If you want a preview image when sharing your link on LinkedIn, WhatsApp etc., update the three `og:` lines near the bottom of `index.html` with your username, repo name, and image.

**4c. Build and publish**

```bash
npm install
npm run deploy
```

**4d. Enable GitHub Pages (first time only)**

1. Go to your repository on GitHub → **Settings → Pages**
2. Under **Branch**, select `gh-pages` and click **Save**

Your tracker will be live at `https://your-username.github.io/your-repo-name/` within a minute.

> For every future update just run `npm run deploy` again. The `main` branch holds your source code; `gh-pages` holds the compiled site — never edit it directly.

---

## Sticking Guide — How it works

The **Sticking Guide** tab makes physically sticking new stickers into your album effortless:

1. Enter your stickers in the **Trade & Compare** tab (paste, grid, or CSV)
2. Switch to **Sticking Guide** — your stickers are grouped by album page number
3. Open your album to each page and place the stickers shown
4. Click a sticker card to mark it as stuck (it disappears from the guide)
5. Use **Mark page as done** to clear a whole page at once
6. The tab badge shows how many stickers still need placing
7. **New pack / Reset** clears the stuck state so you can run through the process again

> For this to work, your Google Sheet must have a `Page` column with the album page number for each sticker.

---

## Local Development

```bash
npm install
npm run dev
```

Then open [http://localhost:5173/caderneta-2026/](http://localhost:5173/caderneta-2026/) (or whatever path matches `base` in your `vite.config.js`).

```bash
npm run lint    # ESLint check
npm run build   # Production build
npm run deploy  # Build + push to gh-pages
```

---

## Tech Stack

| Library | Version | Role |
|---------|---------|------|
| React | 19 | UI framework |
| Vite | 8 | Build tool + dev server |
| Tailwind CSS | 4 | Utility-first styling |
| Framer Motion | — | Animations and transitions |
| Lucide React | — | Icon set |
| PapaParse | — | CSV parsing and export |
| clsx + tailwind-merge | — | Conditional class merging |
| gh-pages | — | GitHub Pages deployment |

---

## Project Structure

```
src/
├── config.js            ← ✏️  Edit this to personalise
├── App.jsx              ← Main component — all UI and state
├── i18n.js              ← English / Portuguese translations
├── index.css            ← Tailwind imports, CSS variables, accessibility
├── main.jsx             ← React entry point
└── services/
    └── dataService.js   ← Google Sheets CSV fetch + TEAM_NAMES map
```

---

## Accessibility

This app is built with accessibility as a first-class concern:

- **Skip navigation** link for keyboard users
- **ARIA roles**: `tablist`, `tab`, `tabpanel`, `progressbar`, `alert`, `group`
- **`aria-selected`**, **`aria-pressed`**, **`aria-label`** on all interactive elements
- **`aria-hidden`** on all decorative icons
- **`focus-visible`** rings on every interactive element (keyboard navigation friendly)
- **`prefers-reduced-motion`** media query disables animations for users who prefer it
- Semantic HTML (`<header>`, `<main>`, `<footer>`, `<nav>`, `<ul>`, `<ol>`)

---

*Built with ❤️ for the collecting community.*
