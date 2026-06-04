# Project rules: stop-notifications-focus-stealing

A GNOME Shell extension that disables the keyboard focus grab performed by
notification banners when the mouse pointer hovers over them.

## Language

- Project language is English. All files in this repository -- code, code
  comments, README, metadata.json, commit messages, GNOME Extensions store text,
  and internal working files (this CLAUDE.md, TODO.md, plans) -- are written in
  English, because the repository is public and the extension is published to
  the international store.
- Chat with the user is conducted in Russian (this applies only to the live
  conversation, not to files committed to the repository).

## Purpose and mechanism

- Interception point: `MessageTray.prototype._ensureBannerFocused` in
  gnome-shell. This is the only path to `FocusGrabber.grabFocus()`. Overriding it
  with a no-op removes the focus grab without changing any other notification
  behaviour.
- The grab is triggered by hovering the mouse over a banner
  (`_pointerInNotification` driven by `hover`), not by a click.
- Interception method: `InjectionManager.overrideMethod` (the official extension
  API), with restoration in `disable()`.

## Compatibility

- `_ensureBannerFocused` is a private method (leading `_`) and may change between
  gnome-shell versions. Before declaring support for a version in
  `metadata.json` (`shell-version`), ALWAYS verify the presence and signature of
  the method in the sources of the corresponding gnome-shell tag.
- Verified against sources: the method and its path to `grabFocus()` are
  identical in gnome-shell 45.10, 46.10, 47.10, 48.8, 49.7 (45--49 declared in
  `metadata.json`). The extension itself was run on 46.2. The lower bound is 45
  because the ESM extension API (`Extension`, `InjectionManager`) was introduced
  in gnome-shell 45.

## Publishing

- GitHub: https://github.com/VitalyOstanin/stop-notifications-focus-stealing
- License: GPL-2.0-or-later (same as gnome-shell itself).
- Commit and push only with the user's explicit permission.
