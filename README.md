# TripSplit PWA

Static GitHub Pages PWA with Supabase Postgres/Auth. The admin creates a trip, creates one-time QR invitations, starts the trip, and members split expenses equally among selected joined travelers. **End trip** returns a final snapshot, downloads an Excel workbook, and permanently deletes the trip and its related rows.

## Important design choices

- QR-only invitation: no email or Edge Function is required.
- Anonymous Supabase Auth gives each installed browser/device a private identity.
- One QR token can be used once and expires after 30 days.
- Raw QR tokens are not stored; only SHA-256 hashes are stored.
- Tables are not directly available to the browser. Security-definer RPCs enforce trip membership/admin checks.
- The public browser app uses only the Supabase anon key. Never use the service-role key.
- Excel generation runs in the browser with SheetJS.

## 1. Create a new Supabase project

1. Open Supabase Dashboard and create a project.
2. In **Authentication > Providers > Anonymous Sign-Ins**, enable anonymous sign-ins.
3. Open **SQL Editor**, create a new query, paste the full contents of `supabase.sql`, and run it.
4. Open **Project Settings > API** and copy:
   - Project URL
   - `anon` public key or publishable key

The SQL is a clean installer for objects whose names start with `trip_` plus the `trips` table and the listed TripSplit functions. It does not drop unrelated application tables.

## 2. Configure the app

Edit `config.js`:

```js
window.TRIPSPLIT_CONFIG = {
  SUPABASE_URL: "https://YOUR-PROJECT.supabase.co",
  SUPABASE_ANON_KEY: "YOUR_PUBLIC_ANON_KEY"
};
```

Do not commit a service-role key.

## 3. Test locally

A service worker needs HTTP/HTTPS, not a `file://` URL.

```bash
python -m http.server 8080
```

Open `http://localhost:8080`.

Recommended test:

1. Create a trip.
2. Add a user and generate the QR.
3. Scan the QR on a different phone or open the join link in a private browser profile.
4. Tap **Join now**.
5. On the admin device, reopen the trip to see the joined traveler.
6. Start the trip.
7. Add expenses and choose the travelers included in each equal split.
8. Tap **End trip & export**. Confirm that the `.xlsx` file downloads and the trip disappears.

## 4. Deploy to GitHub Pages

1. Create an empty GitHub repository.
2. Upload all files and folders from this package, including `.github/workflows/pages.yml`, `.nojekyll`, and your configured `config.js`.
3. Commit to the `main` branch.
4. In the repository, open **Settings > Pages**.
5. Under **Build and deployment > Source**, select **GitHub Actions**.
6. Open the **Actions** tab and verify the `Deploy GitHub Pages` workflow succeeds.
7. Open the Pages URL shown by GitHub.

For a project Pages site, relative paths are already used, so no repository-name change is needed.

## 5. PWA installation

- Android/Chrome: open the deployed HTTPS URL and use **Install app**.
- iPhone/Safari: Share > **Add to Home Screen**.
- Desktop Chromium browsers: use the install icon in the address bar or the app's **Install app** button when available.

## Operational notes

- A traveler identity belongs to the browser profile/device that accepted the QR. Clearing site data creates a new anonymous identity.
- If the same phone must represent another traveler, use a separate browser profile or clear the app's site data after the prior trip is finished.
- `End trip` is irreversible. The RPC builds the export snapshot and deletes the trip in the same database transaction. The browser then generates the workbook from the returned snapshot.
- If workbook download is blocked by a browser, allow downloads for the site before ending the trip.
- The current build provides equal splitting among selected joined travelers. The workbook includes Summary, Members, Expenses, Shares, and Settlements sheets. Settlements is reserved and currently empty.

## Troubleshooting

### Anonymous sign-in failed
Enable **Anonymous Sign-Ins** in Supabase Authentication settings.

### `Invalid API key` or app remains on setup
Check `config.js`. Use the project URL and public anon/publishable key, then reload with cache cleared.

### QR opens but cannot join
The QR may already be used or older than 30 days. The admin should create a new invitation slot and QR.

### Old app version remains visible
The service worker caches app files. Close all installed instances, clear site data, or change `CACHE` in `sw.js` from `tripsplit-v1` to a new value before deployment.

### GitHub Pages shows 404
Confirm Pages is set to **GitHub Actions**, the workflow completed successfully, and `.nojekyll` is present.

## Files

- `index.html`: application shell and CDN libraries
- `styles.css`: responsive modern UI
- `app.js`: app behavior, QR, expense logic, Excel export
- `config.js`: Supabase connection values
- `supabase.sql`: schema, RLS posture, and RPCs
- `manifest.webmanifest`, `sw.js`, `icons/`: PWA assets
- `.github/workflows/pages.yml`: Pages deployment
