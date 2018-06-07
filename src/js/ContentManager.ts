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
    apps?: AppInfo[];
    styleConfig?: ConfigInfo;
    remoteManifests?: string[];
}

interface ConfigInfo {
    windowTitle: string;
    icon: string;
    iconBackgroundImage: string;
    systemTrayIcon: string;
    hotbarBackgroundColor: string;
    listBackgroundColor: string;
    listAppHoverColor: string;
    listAppTextColor: string;
    searchBarColor: string;
    searchBarTextColor: string;
}

/**
 * @method ContentManager A manager to handle content additions to the DOM
 */
export class ContentManager {
    private _localConfigFileUrl: string = './config/application-manifest.json';
    private _trayApps: App[] = [];
    private static INSTANCE: ContentManager;
    private _hasRenderedOnce: boolean = false;

    private _dragDropManager: DragDropManager = new DragDropManager();

    constructor() {
        if(ContentManager.INSTANCE) {
            return ContentManager.INSTANCE;
        }

        this._loadConfigFileAndProcess(this._localConfigFileUrl);

        this._createEventListeners();

        ContentManager.INSTANCE = this;
    }

    /**
     * @method _createEventListeners Creates Event Listeners 
     */
    private _createEventListeners(): void {
        document.getElementById("searchBar")!.addEventListener("keyup", this._handleSearchInput.bind(this));
    }

    /**
     * @method _handleSearchInput Handles input from the search bar.  
     * @param e Keyboard Event
     */
    private _handleSearchInput(e: KeyboardEvent): void {
        const searchQuery: string = (e.target as HTMLInputElement).value.toLocaleUpperCase();

        //if no search then render original list and escape.
        if(searchQuery.length === 0) {
            this._renderAppList(this._trayApps, false, true);
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

        this._renderAppList(searchedApps, false, true);
    }

    /**
     * @method _loadConfigurationFile Loads in the Configuration File and initates processing
     */
    private async _loadConfigurationFile(fileUrl: string): Promise<ConfigFile> {
        return await fetch(fileUrl)
            .then((response: Response) => response.json());
    }

    /**
     * 
     * @param fileUrl Url of Manifest
     * @param recursive If we are in a recursive loop then we should not load in app setting configs.
     */
    private _loadConfigFileAndProcess(fileUrl: string, recursive: boolean = false): void {
        this._loadConfigurationFile(fileUrl)
        .then((config: ConfigFile) => {
            if(!recursive && config.styleConfig){
                 this._processAppConfigs(config.styleConfig);
            }
           
            if(config.apps) {
                this._processAppList(config.apps);
            }

            if(config.remoteManifests){
                config.remoteManifests.forEach((manifest: string) => {
                    this._loadConfigFileAndProcess(manifest, true);
                });
            }
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
        const listBackgroundColor: string = config.listBackgroundColor || "";
        const listAppHoverColor: string = config.listAppHoverColor || "";
        const listAppTextColor: string = config.listAppTextColor || "";
        const searchBarColor: string = config.searchBarColor || "";
        const searchBarTextColor: string = config.searchBarTextColor || "";

        // set Window Title
        document.title = windowTitle;

        // set Icon Image
        document.getElementsByClassName('launch-bar-handle-img')[0].setAttribute("src", icon);

        // set Icon Background Image
        document.getElementById('launch-bar-handle')!.style.background = `url(${iconBackgroundImage})`;

        // set Tray Background Color
        document.body.style.background = listBackgroundColor;

        // set Hotbar Background Color
        document.getElementById('launch-bar-tearout')!.style.background = hotbarBackgroundColor;

        //set Search Bar Background Color
        document.getElementById('searchBar')!.style.background = searchBarColor;

        //set Search Bar Text Color
        document.getElementById('searchBar')!.style.color = searchBarTextColor;

        // set System Tray Icon
        TrayWindowManager.instance.updateTrayIcon(systemTrayIcon);

        /**
         * @method writeCSS Writes a raw CSS string into a style tag.
         * @param style CSS Style String
         */
        function writeCSS(style: string): void {
            const head: HTMLElement = document.head;
            const styleTag: HTMLElement = document.createElement('style');

            styleTag.appendChild(document.createTextNode(style));
            head.appendChild(styleTag);
        }

        // set List App Hover Color
        writeCSS(`.app-list > .app-square:hover { background: ${listAppHoverColor } }`);

        // set List App Text Color
        writeCSS(`.app-list > .app-square > .app-content > .app-name { color: ${listAppTextColor} !important; }`);
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

        if(this._hasRenderedOnce){
            this._renderAppList(appClassed, false);
        } else {
            this._renderAppList(appClassed);
            this._hasRenderedOnce = true;
        }
       
        this._trayApps = this._trayApps.concat(appClassed);

        // Sets the App list to height relative to number of icons.

        const rowCount: number = (Math.ceil(this._trayApps.length / 4) - 1);
        document.getElementsByClassName('app-list')[0].setAttribute("style", `height: ${((rowCount > 4 ? 4 : rowCount) * 96 + 10)}px`);        
       
        // Once all apps are loaded, dispatch an event for
        // any compnents that require this to be complete
        this._dragDropManager.initChildCount();         
    }

    /**
     * @method _renderAppList Renders Application from an array of applications.
     * @param apps Array of Applications
     * @param renderHotBar Boolean if we should consider the top bar items or render only to the tray.
     */
    private _renderAppList(apps: App[], renderHotBar: boolean = true, clearExistingIcons: boolean = false): void {
         // Trusting .app-list is not null
         const trayElement: HTMLElement = document.getElementsByClassName("app-list")![0] as HTMLElement;

         // Trusting #app-hotbar is not null
         const hotBar: HTMLElement = document.getElementById("app-hotbar")!;
         let rememberedHotApps: Array<{name: string}> = [];

         if(clearExistingIcons){
             trayElement.innerHTML = "";
         }

         if(renderHotBar) {
            rememberedHotApps = JSON.parse(localStorage.getItem('HotApps') as string) || [];
         }
         
        // Render each applications HTML
        apps.forEach((app: App, index: number) => {
            // 5 Items in the launcher bar
            if( ((index < 5 && rememberedHotApps.length === 0) || rememberedHotApps.length > 0) && renderHotBar && hotBar) {
                
                if (rememberedHotApps.length > 0) {
                    const found: number = rememberedHotApps.findIndex((rememberedApp: {name: string}) => {
                        return app.info.name === rememberedApp.name;
                    });

                    if(found > -1) {
                        this._renderTo(hotBar, app.render());
                    }
                } else {
                    this._renderTo(hotBar, app.render());
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