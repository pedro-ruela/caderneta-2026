# World Cup 2026 Sticker Tracker (Personal Edition) 🏆

A premium, high-performance web application to track your 2026 World Cup sticker collection, manage duplicates, and find trade matches. This version is designed to be forked and customized for your own personal use.

![Tracker Preview](https://raw.githubusercontent.com/fghenriques99/caderneta-2026/main/public/preview.png)

## 🚀 How to Use This for Yourself

Want to use this tracker for your own collection? Follow these simple steps:

### 1. Fork this Repository
Click the **Fork** button at the top right of this page to create your own copy of the project.

### 2. Connect Your Own Data
The app fetches the list of stickers from a Google Sheet. To use your own:
1.  Open [this template Google Sheet](https://docs.google.com/spreadsheets/d/1_q13F2KfncPjbYjFezvBJHugJ-_yY-qg9I1y9lhc3Bc/edit?usp=sharing).
2.  Go to **File > Make a copy** to save it to your own Google Drive.
3.  In your new sheet, go to **File > Share > Publish to web**.
4.  Change "Entire Document" to your specific sheet (e.g., "Caderneta COMP") and set the format to **CSV**.
5.  Copy the generated URL.
6.  In this code, open `src/services/dataService.js` and replace the `CSV_URL` with your new link.

### 3. Customize Your Profile
Open `src/App.jsx` and search for the following to update them with your info:
*   **LinkedIn Link**: Search for `linkedin.com/in/`
*   **Email**: Search for `fghenriques99@outlook.com`
*   **Location**: Search for `Lisbon, Portugal`

### 4. Deploy to GitHub Pages
To put your tracker online:
1.  In your terminal, run: `npm install`
2.  Open `vite.config.js` and change the `base` path to match your repository name:
    ```javascript
    base: '/your-repo-name/',
    ```
3.  Run the deployment command:
    ```bash
    npm run deploy
    ```
Your site will be live at `https://your-username.github.io/your-repo-name/`!

## 🛠 Features
*   **Interactive Grid**: Click to mark stickers as owned or add duplicates.
*   **Trade Engine**: Compare your duplicates against another user's collection (via paste or file upload).
*   **Persistence**: Your collection is automatically saved to your browser's local storage.
*   **Export/Import**: Save your progress as CSV or Excel files.

## 📦 Tech Stack
*   React 19 + Vite
*   Tailwind CSS 4
*   Framer Motion (Animations)
*   Lucide React (Icons)
*   PapaParse (CSV processing)

---
Created with ❤️ for the collecting community.
