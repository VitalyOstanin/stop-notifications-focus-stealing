# 0003 - Support GNOME 45-50 and verify the private method per release

Status: Accepted

## Context

The extension overrides a private GNOME Shell method (`_ensureBannerFocused`,
ADR 0001). Private methods carry no stability guarantee and may be renamed,
removed, or have their focus-grab path moved between major versions. Declaring a
`shell-version` range is only meaningful if the override is actually verified
against each version's source.

The ESM extension API (`Extension`, `InjectionManager`) was introduced in GNOME
45, which sets the lower bound. Per the extensions.gnome.org review guidelines,
only stable releases may appear in `shell-version` (no alpha/beta/rc).

## Decision

Declare `shell-version: ["45", "46", "47", "48", "49", "50"]` and treat the
range as verified, not assumed. Before adding any version, check its latest
stable gnome-shell tag and confirm that:

1. `_ensureBannerFocused()` still exists and its body is
   `this._notificationFocusGrabber.grabFocus()`;
2. `MessageTray` is exported as a `GObject.registerClass` class so
   `MessageTray.MessageTray.prototype` resolves;
3. `_ensureBannerFocused()` is still the only path to the focus grab — inspect
   every `grabFocus`, `grab_key_focus`, and `FocusGrabber` occurrence, including
   modules beyond `messageTray.js`.

The override path was verified identical in 45.10, 46.10, 47.10, 48.8, 49.7,
50.2; the extension itself was run on 46.2. The full step-by-step procedure
lives in [CLAUDE.md](../../CLAUDE.md).

## Consequences

- The declared range reflects verified compatibility.
- Adding a future version (e.g. 51) requires running the verification procedure,
  not just appending to the array.
- If a release changes the method or introduces a new grab path, the fix is to
  extend `extension.js` (an additional override or different target) and
  re-verify older branches, rather than dropping support.
