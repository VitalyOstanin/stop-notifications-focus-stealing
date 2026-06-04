# TODO

<!-- TOC -->
- [Compatibility with gnome-shell versions](#compatibility-with-gnome-shell-versions)
- [Publishing](#publishing)
- [Possible improvements](#possible-improvements)
<!-- /TOC -->

## Compatibility with gnome-shell versions

- [x] Verify the presence and signature of `MessageTray.prototype._ensureBannerFocused`
      in the gnome-shell sources for the versions to be declared in
      `metadata.json` -> `shell-version`.
  - Source for verification: `https://gitlab.gnome.org/GNOME/gnome-shell/-/blob/<tag>/js/ui/messageTray.js`
  - What to check: the method exists, is called from `_updateState` and
    `_expandBanner`, and leads to `FocusGrabber.grabFocus()` (i.e. the no-op
    override still removes the focus grab).
  - Verified against the latest point release of each branch: 45.10, 46.10,
    47.10, 48.8, 49.7, 50.2. In all versions the method, its body
    (`this._notificationFocusGrabber.grabFocus()`) and both call sites are
    identical. The class is exported as `export const MessageTray`, so
    `MessageTray.MessageTray.prototype` resolves the same way.
  - Lower bound 45: the ESM extension API (`Extension`, `InjectionManager`) was
    introduced in gnome-shell 45.
- [x] Extend the `shell-version` array in `metadata.json` to
      `["45", "46", "47", "48", "49", "50"]`.

## Publishing

- [ ] Prepare an icon/screenshot for the GNOME Extensions store page.
- [ ] Build the package: `gnome-extensions pack` and verify installation from
      the archive.
- [ ] Submit for review at https://extensions.gnome.org.

## Possible improvements

- [ ] Option to narrow the effect to notifications from a specific source only
      (check `this._notification?.source` in the override), in case the focus
      grab should be kept for other applications. Currently it applies globally.
