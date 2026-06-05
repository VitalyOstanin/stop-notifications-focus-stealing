# 0001 - Override `_ensureBannerFocused` as the single grab point

Status: Accepted

## Context

GNOME Shell grabs keyboard focus onto a notification banner when the mouse
pointer hovers over it. Verified against `js/ui/messageTray.js`, the path is:

```
MessageTray._updateState()          // state === SHOWN && _pointerInNotification
  -> MessageTray._expandBanner(false) / _ensureBannerFocused()
    -> FocusGrabber.grabFocus()      // actor.grab_key_focus()
```

`_pointerInNotification` is driven by the banner's `hover` state, so hovering
alone redirects keystrokes away from the focused window. Several interception
points are possible:

- Disable hover tracking / `_pointerInNotification` — changes more behaviour
  than intended (expansion, dismissal timing).
- Override `FocusGrabber.grabFocus()` or `actor.grab_key_focus()` — too broad;
  the focus grabber is a generic mechanism that may be used elsewhere.
- Override `_ensureBannerFocused()` — the single, dedicated entry point that
  leads to the banner focus grab.

## Decision

Override `MessageTray.prototype._ensureBannerFocused` with a no-op. It is the
only path that reaches `_notificationFocusGrabber.grabFocus()`, so replacing it
removes the focus grab while leaving every other notification behaviour
(appearance, message tray, click handling, expansion) intact.

## Consequences

- Minimal, targeted change: only the focus grab is removed.
- `_ensureBannerFocused` is a private method (leading `_`) and may change across
  GNOME versions, so each supported version must be verified (see ADR 0003).
- The override covers all current call sites that go through
  `_ensureBannerFocused` (`_updateState`, `_expandBanner`). A future GNOME
  release that reaches the grab through a different path would not be covered and
  must be detected during verification.
