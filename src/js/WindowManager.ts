import * as openfinLayouts from 'openfin-layouts';
import { ContentManager } from './ContentManager';
import { TrayWindowManager } from './TrayWindowManager';

/**
 * @class WindowManager Handles all Window Related Functionality
 */
export class WindowManager {
    private static INSTANCE: WindowManager;

    private _application: fin.OpenFinApplication = fin.desktop.Application.getCurrent();
    private _window: fin.OpenFinWindow = fin.desktop.Window.getCurrent();
    private _isTrayOpen: boolean = false;

    /**
     * @member _hotBarHeight The height of the hotbar when minimized.  Rounded up to the nearest 10th.  Real value is 67. 70 Used due to bug.
     */
    private readonly _hotBarHeight: number = 70;

    constructor() {
        if(WindowManager.INSTANCE) {
            return WindowManager.INSTANCE;
        }

        this.setWindowDefaults();

        WindowManager.INSTANCE = this;

        /* 
         * Sets _isTrayOpen based on the window height
         * (This needs to be here to stop drag and drop breaking when 
         * the window is reloaded while the tray is expanded)
         */
        this._isTrayOpen = (window.innerHeight > this._hotBarHeight ? true : false);
    }

    /**
     * @method setWindowDefaults Sets default window attributes and Event Listeners
     */
    private setWindowDefaults(): void {
        openfinLayouts.deregister();
        this.createEventListeners();
    }

    /**
     * @method createEventListeners Creates Windows Event Listeners
     */
    private createEventListeners(): void {
        // @ts-ignore openfin type incorrectly handling windowResized param
        this._window.addEventListener('bounds-changed', this.windowResized.bind(this));
        this._window.addEventListener('close-requested', this.handleWindowClose.bind(this));
        this._window.getNativeWindow().addEventListener('beforeunload', this.handleUnload.bind(this));
    }

    /**
     * @method handleUnload Fires before the DOM is unloaded. 
     * Removes the current tray icon, then allows the reload to continue
     */
    private async handleUnload() {
        const trayWindowManager = TrayWindowManager.instance;
        
        await trayWindowManager.destroyTrayWindow();

        return;
    }

    /**
     * @method handleWindowClose Fires when the window is attempted to be closed
     */
    private handleWindowClose(): void {
        this._window.minimize();
        this._moveTray(false);
    }

    /**
     * @method windowResized Fires on the windows bounds-changed event
     * @param e fin.WindowsBoundsEvent
     */
    private windowResized(e: fin.WindowBoundsEvent): void {
        this._isTrayOpen = (e.height > this._hotBarHeight ? true : false);
    }

    /**
     * @method toggleTray Toggles the tray open or close depending on current state.
     */
    public toggleTray(): void {
        this._moveTray(this._isTrayOpen ? false : true);
    }

    /**
     * @method openTray Opens the tray regardless of current state.
     */
    public openTray(): void {
        this._moveTray(true);
    }

    /**
     * @method closeTray Closes the tray regardless of current state.
     */
    public closeTray(): void {
        this._moveTray(false);
    }

    /**
     * @method _moveTray Opens or Closes the tray based on param.
     * @param open True if the tray should open, False if should close.
     */
    private _moveTray(open: boolean): void {
        // 67px = top bar, 96 = row height, 20 = footer space
        this._window.animate(
            {
                size: {
                    height: (open ? this._calculateTrayHeight() : 67),
                    duration: 100
                }
            }, { interrupt: false }
        );
    }

    /**
     * @method _calculateTrayHeight Calculates the height that the tray should stretch out to. 
     */
    private _calculateTrayHeight(): number {
        let numRows = Math.ceil(ContentManager.instance.getTrayApps.length / 4);

        if (numRows > 4) {
            numRows = 4;
        }

        return (67 + (numRows * 96) + 50);
    }

    /**
     * @method isTrayOpen Returns if the tray is currently open or not.
     * @returns boolean
     */
    public get isTrayOpen(): boolean {
        return this._isTrayOpen;
    }

    public closeWindow(): void {
        this._window.close();
    }

    /**
     * @method instance returns the Window Manager INSTANCE
     * @returns WindowManager
     */
    public static get instance(): WindowManager {
        if(WindowManager.INSTANCE){
            return WindowManager.INSTANCE;
        } else {
            return new WindowManager();
        }
    }
}