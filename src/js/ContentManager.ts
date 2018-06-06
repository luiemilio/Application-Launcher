import { App } from './App';
import { DragDropManager } from './DragDropManager';
import { TrayWindowManager } from './TrayWindowManager';

export interface AppInfo {
    name: string;
    title: string;
    manifest: string;
    icon: string;
    hidden?: boolean;
    startup?: boolean;
}

interface ConfigFile {
    apps: AppInfo[];
    config: ConfigInfo;
}

interface ConfigInfo {
    windowTitle: string;
    icon: string;
    iconBackgroundImage: string;
    systemTrayIcon: string;
    hotbarBackgroundColor: string;
    trayBackgroundColor: string;
    trayAppHoverColor: string;
    trayAppTextColor: string;
}

/**
 * @method ContentManager A manager to handle content additions to the DOM
 */
export class ContentManager {
    private _configFileUrl: string = './config/application-manifest.json';
    private _trayApps: App[] = [];
    private static INSTANCE: ContentManager;

    private _dragDropManager: DragDropManager = new DragDropManager();

    constructor() {
        if(ContentManager.INSTANCE) {
            return ContentManager.INSTANCE;
        }

        this._loadConfigurationFile();
        this._createEventListeners();

        ContentManager.INSTANCE = this;
    }

    private _createEventListeners(): void {
        document.getElementById("searchBar")!.addEventListener("keyup", this._handleSearchInput.bind(this));
    }

    private _handleSearchInput(e: KeyboardEvent): void {
        const searchQuery: string = (e.target as HTMLInputElement).value.toLocaleUpperCase();

        //if no search then render original list and escape.
        if(searchQuery.length === 0) {
            this._renderAppList(this._trayApps, false);
            return;
        }

        const searchedApps: App[] = this._trayApps.filter((app: App) => {
            if(!app.info.hidden){
                if(app.info.title.toLocaleUpperCase().includes(searchQuery)) {
                    return true;
                }
            }

            return false;
        });

        this._renderAppList(searchedApps, false);
    }

    /**
     * @method _loadConfigurationFile Loads in the Configuration File and initates processing
     */
    private _loadConfigurationFile(): void {
        fetch(this._configFileUrl)
            .then((response: Response) => response.json())
            .then((configJson: ConfigFile) => {
                this._processAppConfigs(configJson.config);
                this._processAppList(configJson.apps);
            });
    }

    /**
     * @method _processAppConfigs Process the Application configuration and handles.
     * @param config ConfigInfo
     */
    private _processAppConfigs(config: ConfigInfo): void {
        const windowTitle: string = config.windowTitle || "";
        const icon: string = config.icon || "";
        const iconBackgroundImage: string = config.iconBackgroundImage || "";
        const systemTrayIcon: string = config.systemTrayIcon || "";
        const hotbarBackgroundColor: string = config.hotbarBackgroundColor || "";
        const trayBackgroundColor: string = config.trayBackgroundColor || "";
        const trayAppHoverColor: string = config.trayAppHoverColor || "";
        const trayAppTextColor: string = config.trayAppTextColor || "";

        // set Window Title
        document.title = windowTitle;

        // set Icon Image
        document.getElementsByClassName('launch-bar-handle-img')[0].setAttribute("src", icon);

        // set Icon Background Image
        document.getElementById('launch-bar-handle')!.style.backgroundImage = `url(${iconBackgroundImage})`;

        // set Tray Background Color
        document.body.style.backgroundColor = trayBackgroundColor;

        // set Hotbar Background Color
        document.getElementById('launch-bar-tearout')!.style.backgroundColor = hotbarBackgroundColor;

        // set System Tray Icon
        TrayWindowManager.instance.updateTrayIcon(systemTrayIcon);

        function writeCSS(style: string): void {
            const head: HTMLElement = document.head;
            const styleTag: HTMLElement = document.createElement('style');

            styleTag.appendChild(document.createTextNode(style));
            head.appendChild(styleTag);
        }

        writeCSS(`.app-list > .app-square:hover { background-color: ${trayAppHoverColor } }`);
        writeCSS(`.app-list > .app-square > .app-content > .app-name { color: ${trayAppTextColor} !important; }`);
    }

    /**
     * @method _processAppList Process the Array of Applications and handles.
     * @param apps AppInfo Array
     */
    private _processAppList(apps: AppInfo[]): void {
        // Filter out hidden apps & start apps with startup flag
        const appsFiltered: AppInfo[] = apps.filter((app: AppInfo) => {
            if(app.startup) {
                ContentManager.createFromManifestAndRun(app.manifest);
            }

            if (app.hidden) {
                return false;
            }

            return true;
        });

        // Create an array of App objects from the filtered array
        const appClassed: App[] = appsFiltered.map((app: AppInfo): App => {
            return new App(app);
        });

        this._renderAppList(appClassed);

        this._trayApps = appClassed;
        document.getElementsByClassName('app-list')[0].setAttribute("style", `height: ${((Math.ceil(this._trayApps.length / 4) - 1) * 96)}px`);        
       
        // Once all apps are loaded, dispatch an event for
        // any compnents that require this to be complete
        this._dragDropManager.initChildCount();         
    }

    /**
     * @method _renderAppList Renders Application from an array of applications.
     * @param apps Array of Applications
     * @param renderHotBar Boolean if we should consider the top bar items or render only to the tray.
     */
    private _renderAppList(apps: App[], renderHotBar: boolean = true): void {
         // Trusting .app-list is not null
         const trayElement: HTMLElement = document.getElementsByClassName("app-list")![0] as HTMLElement;
         trayElement.innerHTML = "";

        // Render each applications HTML
        apps.forEach((app: App, index: number) => {
           // 5 Items in the launcher bar
           if( index < 5 && renderHotBar) {
               // Trusting #app-hotbar is not null
               const topBar: HTMLElement = document.getElementById("app-hotbar")!;

               if(topBar){
                   this._renderTo(topBar, app.render());
               }
           }

           if(trayElement) {
               this._renderTo(trayElement, app.render());
           }

        });

    }

    /**
     * 
     * @param toElement Element to Render to.
     * @param renderElement Element to Render.
     */
    private _renderTo(toElement: HTMLElement, renderElement: HTMLElement): void {
        toElement.appendChild(renderElement);
    }




    /**
     * @method getTrayApps Returns an Array of items from Tray
     * @returns {App[]} App[]
     */
    public get getTrayApps(): App[] {
        return this._trayApps;
    }

    /**
     * @method _createFromManifestAndRun Creates an Openfin Application from Manifest and runs it.
     * @param manifest A URL to the Application Manifest.
     */
    public static createFromManifestAndRun(manifest: string): void {
        fin.desktop.Application.createFromManifest(manifest, (createdApp: fin.OpenFinApplication): void => {
            createdApp.run((): void => {
                console.info("Launched Successfully: ", createdApp);
            }, (): void => {
                console.info("Launch Error: ", createdApp);
            });
        });
    }

    /**
     * @method instance returns the Content Manager INSTANCE
     * @returns ContentManager
     */
    public static get instance(): ContentManager {
        if(ContentManager.INSTANCE){
            return ContentManager.INSTANCE;
        } else {
            return new ContentManager();
        }
    }
}