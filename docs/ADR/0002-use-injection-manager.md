# 0002 - Use the official InjectionManager with restore on disable

Status: Accepted

## Context

The extension needs to replace a GNOME Shell method (`_ensureBannerFocused`,
see ADR 0001) and fully undo the replacement when disabled. GNOME Shell enables
and disables extensions repeatedly (for example on lock/unlock), so the original
method must be restored reliably; a hand-rolled monkey patch that saves and
reassigns the method is easy to get wrong (lost original, double-patching,
leaks).

Since GNOME 45 the ESM extension API provides `InjectionManager`, the official
helper for overriding methods with automatic tracking and restoration.

## Decision

Use `InjectionManager.overrideMethod(...)` in `enable()` to replace
`_ensureBannerFocused` with a no-op, and call `InjectionManager.clear()` in
`disable()` to restore the original method. Create the manager in `enable()` and
drop the reference in `disable()`.

## Consequences

- Restoration is handled by the official API; `disable()` returns GNOME Shell to
  its original behaviour even across repeated enable/disable cycles.
- No manual bookkeeping of the original method.
- Ties the extension to the ESM extension API, which sets the GNOME 45 lower
  bound (see ADR 0003).
