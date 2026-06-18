import {Extension, InjectionManager} from 'resource:///org/gnome/shell/extensions/extension.js';
import * as MessageTray from 'resource:///org/gnome/shell/ui/messageTray.js';

// `_ensureBannerFocused()` is the only path reaching grabFocus() on hover,
// so a no-op override drops the focus grab while keeping other behaviour.
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
