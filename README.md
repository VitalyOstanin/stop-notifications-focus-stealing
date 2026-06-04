# Stop Notifications Focus Stealing

A GNOME Shell extension that prevents notification banners from stealing
keyboard focus when the mouse pointer hovers over them.

<!-- TOC -->
- [Problem](#problem)
- [What this extension does](#what-this-extension-does)
- [How it works](#how-it-works)
- [Installation](#installation)
  - [From source](#from-source)
- [Compatibility](#compatibility)
- [Limitations](#limitations)
- [License](#license)
<!-- /TOC -->

## Problem

When a notification banner is shown and the mouse pointer moves over it, GNOME
Shell grabs the keyboard focus onto the banner. As a result, keystrokes are
redirected away from the window you are typing in and into the notification —
characters are lost until you click back on your window. This happens on hover,
without any click, which makes it easy to trigger by accident, especially with
long-lived (`critical` urgency) banners.

## What this extension does

It disables that single focus grab and nothing else. Notifications still appear,
stay in the message tray, remain clickable, and keep all their normal behaviour
— they simply no longer take keyboard focus on hover.

The change is global: it applies to all notifications, not a specific
application.

## How it works

In GNOME Shell the focus grab is reached through one path:

```
MessageTray._updateState()          // state === SHOWN && _pointerInNotification
  -> MessageTray._expandBanner(false) / _ensureBannerFocused()
    -> FocusGrabber.grabFocus()      // actor.grab_key_focus()
```

`_pointerInNotification` is driven by the banner's `hover` state, so hovering is
enough to trigger the grab. `_ensureBannerFocused()` is the only entry point
that reaches `grabFocus()`. The extension overrides it with a no-op using the
official `InjectionManager` API, and restores the original method on disable.

Reference: [`js/ui/messageTray.js`](https://gitlab.gnome.org/GNOME/gnome-shell/-/blob/46.2/js/ui/messageTray.js)
in GNOME Shell.

## Installation

### From source

```sh
git clone https://github.com/VitalyOstanin/stop-notifications-focus-stealing.git
cp -r stop-notifications-focus-stealing \
  ~/.local/share/gnome-shell/extensions/stop-notifications-focus-stealing@VitalyOstanin
```

Then restart GNOME Shell (on X11: <kbd>Alt</kbd>+<kbd>F2</kbd>, type `r`,
<kbd>Enter</kbd>; on Wayland: log out and back in) and enable the extension:

```sh
gnome-extensions enable stop-notifications-focus-stealing@VitalyOstanin
```

## Compatibility

Supports GNOME Shell 45 through 49. The overridden method
`_ensureBannerFocused()` and its single path to `FocusGrabber.grabFocus()` were
verified to be identical in the latest point release of each branch (45.10,
46.10, 47.10, 48.8, 49.7); the extension itself was run on 46.2. GNOME 45 is the
lower bound because the ESM-based extension API (`Extension`,
`InjectionManager`) was introduced in that release. New versions are added only
after checking that the overridden method still exists in their source (see
`TODO.md`).

## Limitations

The extension overrides a private method (`_ensureBannerFocused`), so a future
GNOME Shell release may rename or remove it. If that happens the extension stops
having an effect, but it does not break GNOME Shell — `disable()` restores the
original method, and the override is re-evaluated against whatever the new
version provides.

## License

GPL-2.0-or-later. See [LICENSE](LICENSE).
