# Launch checklist

Everything in the repo is ready for the App Store and Google Play. What's left needs your accounts, your money or your decisions. Work top to bottom.

## 1. Decide the name first

"Sea-Legs" is already the name of a motion-sickness tablet sold in pharmacies in New Zealand and elsewhere. Launching a motion-sickness app with the same name invites a trademark complaint and could get the listing pulled, especially in New Zealand, Australia, the UK and Ireland.

- Pick a name and check it on the Canadian trademark database (CIPO), the US one (USPTO), and by searching the App Store and Google Play.
- Or keep Sea Legs only after a trademark lawyer says it's fine where you plan to sell.

To rename, change `appName` in `src/config.json` and `capacitor.config.json`, then `CFBundleDisplayName` in `ios/App/App/Info.plist` and `app_name` and `title_activity_main` in `android/app/src/main/res/values/strings.xml`. Run `npm run build`. The bundle ID `com.tevria.sealegs` is never shown to users and can stay.

## 2. Fill in your details

In `src/config.json`:

- `supportEmail`: a real inbox for support. Until it's set, the privacy policy and terms point people to the repo's Issues page.
- Then run `npm run build` and push. The privacy, terms and support pages on the website update with it.

## 3. Have a lawyer read the legal pages

The terms, privacy policy and safety wording are written to keep Sea Legs a general wellness app rather than a medical device, but they haven't been reviewed by a lawyer. Get a BC lawyer to read `src/legal/terms.html`, `src/legal/privacy.html` and the app name before you charge money. Do it again before signing any deal with a cruise line.

Rules the copy follows, so keep to them in ads and the store listing too:

- Say "breathe", "relax", "feel steadier", "more comfortable at sea".
- Never say it treats, cures, prevents or relieves seasickness or motion sickness.
- Keep the "not a medical device" line and the advice to talk to a doctor or pharmacist.
- The motion readings are "for interest only", never for navigation or stability.

## 4. Apple

1. Join the Apple Developer Program ($99 US a year) at developer.apple.com. As an individual, your own name shows as the seller. As a business, you need a registered company and a D-U-N-S number.
2. In App Store Connect: accept the Paid Apps agreement and fill in tax (Canadians use the W-8BEN form) and banking. You can't charge until this is done.
3. Create the app: My Apps > New App, bundle ID `com.tevria.sealegs`, a SKU like `sealegs-ios`.

## 5. Build the iPhone app without a Mac (Codemagic)

1. Sign up at codemagic.io with your GitHub account and add the `tevria/sea-legs` repo.
2. In App Store Connect, go to Users and Access > Integrations > App Store Connect API, create a key with the App Manager role, and download it (you only get one chance).
3. In Codemagic, add that key under Team settings > Integrations > Developer Portal and name it `Sea Legs ASC key`.
4. Start the `iOS to TestFlight` workflow. It builds, signs and uploads the app.
5. Install the TestFlight app on your iPhone and test Sea Legs on the dredge before you submit.

## 6. Store listing and submit

- Copy is in `docs/STORE_LISTING.md`.
- Privacy policy URL: https://tevria.github.io/sea-legs/privacy.html
- Support URL: https://tevria.github.io/sea-legs/support.html
- App Privacy: answer "Data Not Collected".
- Screenshots: take them from the TestFlight build on your phone.
- Price: Apple uses a fixed list of price points that step by 10 cents under $10. Pick the one closest to $4.20 in your base country.
- Submit for review.

## 7. Android (later)

1. Google Play Console has a one-time $25 US fee.
2. A new personal account has to run a closed test with at least 12 testers for 14 days in a row before it can publish. Business accounts with a D-U-N-S number skip that.
3. Make an upload key (keystore) and keep it somewhere safe. If you lose it, you can't update the app.
4. Data safety form: no data collected or shared. Fill in the health apps declaration as a wellness app, not a medical one.
5. Every push already builds a test APK: GitHub > Actions > Build apps > the latest run > Artifacts.

## 8. Before you charge money

The full app is free on GitHub Pages right now, and GitHub doesn't allow Pages to be used to run a business. When the paid app goes live, swap the web version for a simple landing page that links to the stores, and keep the privacy, terms and support pages there.
