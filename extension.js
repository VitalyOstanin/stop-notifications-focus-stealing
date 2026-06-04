import {Extension, InjectionManager} from 'resource:///org/gnome/shell/extensions/extension.js';
import * as MessageTray from 'resource:///org/gnome/shell/ui/messageTray.js';

/**
 * GNOME Shell grabs keyboard focus onto a notification banner when the pointer
 * hovers over it. The path is:
 *
 *   MessageTray._updateState()        // state === SHOWN && _pointerInNotification
 *     -> MessageTray._expandBanner(false) / _ensureBannerFocused()
 *       -> FocusGrabber.grabFocus()   // actor.grab_key_focus()
 *
 * `_pointerInNotification` is driven by the banner's `hover` state, so simply
 * moving the mouse over a banner redirects keystrokes away from the focused
 * window. `_ensureBannerFocused()` is the single entry point that reaches
 * `grabFocus()`, so overriding it with a no-op removes the focus grab while
 * leaving every other notification behaviour intact.
 */
export default class StopNotificationsFocusStealing extends Extension {
    enable() {
        this._injectionManager = new InjectionManager();
        this._injectionManager.overrideMethod(
            MessageTray.MessageTray.prototype,
            '_ensureBannerFocused',
            () => function () {}
        );
    }

    disable() {
        this._injectionManager.clear();
        this._injectionManager = null;
    }
}
