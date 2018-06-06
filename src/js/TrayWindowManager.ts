import * as openfinLayouts from 'openfin-layouts';
import { ContentManager } from './ContentManager';
/**
 * @class TrayWindowManager Handles Tray menu functionality.
 */
export class TrayWindowManager {
    private static INSTANCE: TrayWindowManager;

    private _window!: fin.OpenFinWindow;
    private _icon!: string;

    constructor(){
        if(TrayWindowManager.INSTANCE) {
            return TrayWindowManager.INSTANCE;
        }

        this._createTrayWindow();

        TrayWindowManager.INSTANCE = this;
    }

    /**
     * @method _createTrayWindow Creates the tray menu window
     */
    private _createTrayWindow(): void {        
        this._window = new fin.desktop.Window({
            'name': 'LauncherTray',
            'url': 'tray.html',
            'defaultWidth': 300,
            'defaultHeight': 35,
            'defaultTop': 0,
            'defaultLeft': 0,
            'frame': false,
            'saveWindowState': false,
            'autoShow': false,
            // @ts-ignore No smallWindow in openfin types
            'smallWindow': true,
            'showTaskbarIcon': false,
            'alwaysOnTop': true,
            'state': 'normal',
        }, () => {
            openfinLayouts.deregister({ uuid: fin.desktop.Application.getCurrent().uuid, name: 'LauncherTray' });
        }, (e: string) => {
            console.error('Failed to create LauncherTrayIcon Window', e);
            this._window = fin.desktop.Window.wrap(fin.desktop.Application.getCurrent().uuid, 'LauncherTray');
        });
    }

    /**
     * @method _createTrayIcon Sets Tray Icon and sets up menu event
     */
    private _createTrayIcon(): void {
        fin.desktop.Application.getCurrent().setTrayIcon(this._icon, this._trayMenuHandler.bind(this));
    }

    /**
     * @method _trayMenuHandler Handles events for when the tray menu is activated.  Fired from tray icon click.
     * @param e fin.TrayIconClickedEvent
     */
    private _trayMenuHandler(e: fin.TrayIconClickedEvent): void {
        /* Right Click */
        if(e.button === 2) {
            this._window.moveTo(e.x, e.y - this._window.getNativeWindow().outerHeight);
            this._window.show();
            this._window.setAsForeground();
            this._window.focus();
        }
    }


    /**
     * @method updateTrayIcon Updates Tray Icon
     * @param imageURL Image URL
     */
    public updateTrayIcon(imageURL: string): void {
        fin.desktop.Application.getCurrent().setTrayIcon(imageURL, this._trayMenuHandler.bind(this));
        this._icon = imageURL;
    }

    /**
     * @method instance Returns the TrayWindowManager INSTANCE
     */
    public static get instance(): TrayWindowManager {
        if(TrayWindowManager.INSTANCE){
            return TrayWindowManager.INSTANCE;
        } else {
            return new TrayWindowManager();
        }
    }
}