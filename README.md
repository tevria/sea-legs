# Sea Legs

Breathe with a steady horizon at sea. One web app, packaged for iPhone and Android with Capacitor. It works fully offline and collects no data.

- Web version: https://tevria.github.io/sea-legs/
- Launch checklist: [docs/LAUNCH.md](docs/LAUNCH.md)
- Store listing copy: [docs/STORE_LISTING.md](docs/STORE_LISTING.md)

## How it's put together

| Path | What it is |
| --- | --- |
| `src/index.html` | The whole app: layout, styles and code |
| `src/legal/` | Privacy policy, terms of use and support page text |
| `src/config.json` | App name, support contact, website address, legal effective date |
| `scripts/build.mjs` | Builds everything below from `src/` |
| `www/` | The app Capacitor packages (made by the build, not committed) |
| `index.html`, `privacy.html`, `terms.html`, `support.html` | The website GitHub Pages serves (made by the build) |
| `ios/`, `android/` | The native iPhone and Android projects |
| `assets/` | Source art for the app icon and splash screen |
| `.github/workflows/build.yml` | Cloud builds on every push: an Android test APK and an iOS build check |
| `codemagic.yaml` | Signed iPhone builds to TestFlight without a Mac |

## Commands

```
npm install        # once
npm run build      # rebuild the app and the website from src/
npm run sync       # build, then copy into the iOS and Android projects
npm run assets     # regenerate icons and splash screens from assets/
```

Edit files in `src/`, run `npm run build`, commit and push. The website updates on its own, and the Actions tab builds the apps.

## Native features

Haptics on each breath, keeping the screen awake during a session, the Android back button, and the motion sensors without a permission prompt. The app is locked to portrait so the ship's roll doesn't spin the screen.

All rights reserved. This code is not open source.
