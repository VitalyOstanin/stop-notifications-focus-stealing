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
  identical in gnome-shell 45.10, 46.10, 47.10, 48.8, 49.7, 50.2 (45--50 declared
  in `metadata.json`). The extension itself was run on 46.2. The lower bound is
  45 because the ESM extension API (`Extension`, `InjectionManager`) was
  introduced in gnome-shell 45.

## Updating for a new gnome-shell release

When a new stable gnome-shell version is released, follow these steps before
adding it to `shell-version`. Run commands without an HTTP proxy
(`unset http_proxy https_proxy`).

1. Find the latest stable tag of the new branch (ignore `alpha`/`beta`/`rc`;
   only stable releases may go into `shell-version`, per the review guidelines):

   ```sh
   curl -s "https://gitlab.gnome.org/api/v4/projects/GNOME%2Fgnome-shell/repository/tags?per_page=20&order_by=updated" \
     | jq -r '.[] | "\(.name)\t\(.commit.created_at)"'
   ```

2. Download `js/ui/messageTray.js` for that tag (replace `<tag>`):

   ```sh
   curl -s -o "messageTray-<tag>.js" \
     "https://gitlab.gnome.org/GNOME/gnome-shell/-/raw/<tag>/js/ui/messageTray.js"
   ```

3. Verify all of the following still hold (the override only works if they do):
   - `_ensureBannerFocused()` exists and its body is
     `this._notificationFocusGrabber.grabFocus()`;
   - the class is exported as `export const MessageTray = GObject.registerClass(...)`
     so `MessageTray.MessageTray.prototype` resolves;
   - `_ensureBannerFocused()` is STILL THE ONLY path to the focus grab. The
     override replaces this one method, so it covers every call site that goes
     through it (currently `_updateState` and `_expandBanner`) -- new call sites
     to `_ensureBannerFocused()` are harmless. What breaks the extension is a NEW
     path that reaches `grabFocus()` / `grab_key_focus()` WITHOUT going through
     `_ensureBannerFocused()`. So inspect every `grabFocus`, `grab_key_focus` and
     `FocusGrabber` occurrence and confirm the only caller of
     `_notificationFocusGrabber.grabFocus()` is `_ensureBannerFocused()`.

   ```sh
   # Method body, export, and all call sites of the method:
   rg -n "_ensureBannerFocused|export const MessageTray = GObject.registerClass" "messageTray-<tag>.js"
   # All focus-grab paths -- there must be no grab outside _ensureBannerFocused:
   rg -n "grabFocus|grab_key_focus|FocusGrabber" "messageTray-<tag>.js"
   ```

   Also scan beyond `messageTray.js`: a focus grab for banners could be added in
   another module (e.g. `js/ui/messageList.js`, `js/ui/calendar.js`, or a
   notification banner widget). If `rg` across the gnome-shell tree shows a new
   `grab_key_focus()` on a notification/banner actor outside `messageTray.js`,
   the single-method override is no longer sufficient.

4. If the method changed, a new focus-grab path appeared, or the grab moved to
   another module, do NOT just add the version: update `extension.js` to also
   cover the new entry point (an additional override, or a different target) and
   re-verify against the older supported branches so nothing regresses there.

5. If everything matches, add the new major version (e.g. `"51"`) to
   `shell-version` in `metadata.json`, and update the verified-versions list in
   the Compatibility section above, in `README.md`, and in `TODO.md`.

6. Never declare a version that is not yet a stable release, and never claim
   support for future/unreleased versions.

## Publishing

- GitHub: https://github.com/VitalyOstanin/stop-notifications-focus-stealing
- License: GPL-2.0-or-later (same as gnome-shell itself).
- Commit and push only with the user's explicit permission.
