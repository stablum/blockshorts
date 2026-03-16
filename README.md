# Block YouTube Shorts Sections

Firefox extension that hides YouTube Shorts shelves and Shorts cards on:

- `https://www.youtube.com/`
- `https://www.youtube.com/feed/subscriptions`

## Temporary install in Firefox

1. Open `about:debugging#/runtime/this-firefox`.
2. Click **Load Temporary Add-on...**
3. Select the `manifest.json` file from this folder.

This install is removed when Firefox restarts.

## Persistent install in Firefox

Use Mozilla unlisted signing, then install the signed `.xpi` from `about:addons`.

See `SIGNING.md` for the exact steps.

## What it does

- Removes Shorts shelves such as the horizontal carousel modules.
- Hides individual Shorts cards if YouTube injects them into the grid/feed.
- Reapplies the filter after YouTube client-side navigation and lazy loading.

## License

Licensed under the GNU General Public License v3.0. See `LICENSE`.
