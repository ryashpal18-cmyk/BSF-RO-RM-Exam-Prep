# BSF RO/RM Exam Prep | BSF RO/RM परीक्षा तैयारी

Bilingual (English + Hindi) exam preparation PWA for BSF Head Constable Radio Operator (RO) and Radio Mechanic (RM) recruitment — syllabus tracking, practice mode, full mock tests, spaced revision, offline-first storage, and Capacitor-ready for Android APK builds.

> Exam pattern and syllabus should be verified with the latest official BSF recruitment notification.

## Tech Stack

React + TypeScript + Vite + Tailwind CSS + Dexie (IndexedDB) + React Router + Recharts + vite-plugin-pwa + Capacitor.

## Run locally

```bash
npm install
npm run dev
```

## Build the web app

```bash
npm run build
```

Output goes to `dist/`.

## Build the Android APK — automatic (recommended)

This repo already includes `.github/workflows/build-apk.yml`. Just push this repo to GitHub:

1. Create a new GitHub repository and push this project to it (or upload this folder as-is).
2. GitHub Actions will automatically:
   - Install dependencies and build the web app
   - Add the Capacitor Android platform
   - Auto-generate a release keystore (self-contained, no manual setup needed)
   - Build a signed release APK
   - Upload it as a build artifact **and** attach it to a GitHub Release

3. Go to the repo's **Actions** tab → open the latest run → download `bsf-ro-rm-exam-prep-apk` from Artifacts, or check the **Releases** page for the attached APK.

You can also trigger a build manually from the **Actions** tab using "Run workflow".

## Build the APK manually (local machine)

```bash
npm install
npm run build
npx cap add android      # first time only
npx cap sync android
cd android
./gradlew assembleDebug  # or assembleRelease with your own signing config
```

## Data & Question Bank

- All data is stored locally in IndexedDB — the app works fully offline after first load.
- Bundled questions are clearly marked **Sample Question / अभ्यास प्रश्न** — they are not official previous-year papers.
- A larger question bank can be imported anytime from **Settings → Data Backup → Import Question Bank JSON**, matching the `Question` shape in `src/types/index.ts`.
- Full backup/restore and reset options are available under **Data Backup**.

## Project Structure

```
src/
  data/            exam config, syllabus content, sample question bank
  db/              Dexie (IndexedDB) schema + seeding
  lib/             progress logic, scoring engine, backup/restore, utilities
  context/         app state (profile/settings) + toast notifications
  components/      shared UI + navigation
  pages/           all screens (Home, Syllabus, Practice, Mock Tests, Progress, etc.)
```

## Disclaimer

This app is an independent study tool and is not affiliated with, endorsed by, or connected to the Border Security Force or the Government of India.
