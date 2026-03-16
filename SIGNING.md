# Persistent Firefox Install: Mozilla Unlisted Signing

This add-on can be self-distributed after Mozilla signs it as an **unlisted** extension.

## What changed in this repo

- `manifest.json` now declares `browser_specific_settings.gecko.data_collection_permissions.required = ["none"]`.
- `icons/blockshorts.svg` provides a real extension icon for the signed package.
- `sign-unlisted.ps1` wraps `web-ext lint` and `web-ext sign` for the local signing flow.
- `build-package.ps1` creates a Firefox-safe `.xpi` for manual AMO uploads.

## Option A: CLI signing with `web-ext`

1. Create a Mozilla add-on developer account and open the AMO developer hub.
2. Create AMO API credentials for `web-ext` signing.
3. Install Node.js LTS.
4. Install `web-ext` globally:

```powershell
npm install --global web-ext
```

5. In PowerShell, set your AMO credentials for the current shell:

```powershell
$env:WEB_EXT_API_KEY = "your-api-key"
$env:WEB_EXT_API_SECRET = "your-api-secret"
```

6. Run the helper script from this repo:

```powershell
powershell -ExecutionPolicy Bypass -File .\sign-unlisted.ps1
```

7. The signed `.xpi` will be written to `web-ext-artifacts\`.

## Option B: Manual upload in AMO

1. Create a Mozilla add-on developer account.
2. Open the AMO developer hub and start a new unlisted submission.
3. Build a fresh upload package:

```powershell
powershell -ExecutionPolicy Bypass -File .\build-package.ps1
```

4. Upload the generated `blockshorts-firefox.xpi`.
5. Download the signed `.xpi` once Mozilla finishes processing it.

## Install the signed add-on persistently

1. Open Firefox.
2. Open `about:addons`.
3. Click the gear menu.
4. Choose **Install Add-on From File...**
5. Select the signed `.xpi` from `web-ext-artifacts\` or the AMO download.

## Later updates

- Increase the version in `manifest.json` before each new signing submission.
- Re-run the signing command.
- Install the newly signed `.xpi`.
