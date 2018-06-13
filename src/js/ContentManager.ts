import { App } from './App';
import { DragDropManager } from './DragDropManager';
import { TrayWindowManager } from './TrayWindowManager';

/**
 * @interface AppInfo Interface for the Application Info loaded from the application metadata file
 */
export interface AppInfo {
    name: string;
    title: string;
    manifest_url: string;
    icon: string;
    images: Array<{url: string}>;
    description: string;
    hidden?: boolean;
    startup?: boolean;
}

/**
 * @interface ConfigFile Interface for the structure of the settings.json file
 */
interface ConfigFile {
    style?: ConfigInfo;
    applicationMetadata?: string[];
}

/**
 * @interface ConfigInfo Interface for the shape of the ConfigFile.style;
 */
interface ConfigInfo {
    windowTitle: string;
    icon: string;
    iconHover: string;
    iconBackground: string;
    systemTrayIcon: string;
    hotbarBackground: string;
    listBackground: string;
    listAppHover: string;
    listAppTextColor: string;
    searchBarBackground: string;
    searchBarTextColor: string;
    toolTipBackground: string;
    toolTipTextColor: string;
}

/**
 * @class ContentManager A manager to handle content additions to the DOM
 */
export class ContentManager {
    /**
     * @member INSTANCE Contains the instance of the ContentManager Class
     */
    private static INSTANCE: ContentManager;

    /**
     * @member _loadSettingsFileUrl The path to the default settings .json
     */
    private _localSettingsFileUrl: string = './config/settings.json';

    /**
     * @member _trayApps Holds all of the loaded applications.
     */
    private _trayApps: App[] = [];

    /**
     * @member _hasRenderedOnce Checks if we have rendered to the hotbar at least one time.
     */
    private _hasRenderedOnce: boolean = false;

    /**
     * @member _dragDropManager Sets the DragDropManager instance.
     */
    private _dragDropManager: DragDropManager = new DragDropManager();

    /**
     * @constructor Constructor for the ContentManager Class
     */
    constructor() {
        if (ContentManager.INSTANCE) {
            return ContentManager.INSTANCE;
        }

        this._loadConfigFileAndProcess(this._localSettingsFileUrl);

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
     * @param e Keyboard Event captured from the keyup event listener.
     */
    private _handleSearchInput(e: KeyboardEvent): void {
        const searchQuery: string = (e.target as HTMLInputElement).value.toLocaleUpperCase();

        //if no search then render original list and escape.
        if (searchQuery.length === 0) {
            this._renderAppList(this._trayApps, true);
            return;
        }

        const searchedApps: App[] = this._trayApps.filter((app: App) => {
            if (!app.info.hidden) {
                if (app.info.title.toLocaleUpperCase().includes(searchQuery)) {
                    return true;
                }
            }

            return false;
        });

        this._renderAppList(searchedApps, true);
    }

    /**
     * @method _loadConfigurationFile Loads in the Configuration File and initates processing
     * @param fileUrl Url of metadata
     */
    // tslint:disable-next-line:no-any
    private async _loadConfigurationFile(fileUrl: string): Promise<any> {
        return await fetch(fileUrl)
            .then((response: Response) => response.json());
    }

    /**
     * @method _loadAppMetadataAndProcess Loads Application Metadata and Processes
     * @param fileUrl Url of Metadata
     */
    private _loadAppMetadataAndProcess(fileUrl: string){
        this._loadConfigurationFile(fileUrl)
            .then((appMetadata: AppInfo[]) => {
                this._processAppList(appMetadata);
            });
    }

    /**
     * @method _loadConfigFileAndProcess Loads Application Settings and Processes
     * @param fileUrl Url of Metadata
     */
    private _loadConfigFileAndProcess(fileUrl: string): void {
        this._loadConfigurationFile(fileUrl)
            .then((config: ConfigFile) => {
                if(config.style){
                    this._processAppConfigs(config.style);
                }

                if(config.applicationMetadata){
                    config.applicationMetadata.forEach((metadata: string) => {
                        this._loadAppMetadataAndProcess(metadata);
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
        const iconBackground: string = config.iconBackground || "";
        const systemTrayIcon: string = config.systemTrayIcon || "";
        const hotbarBackground: string = config.hotbarBackground || "";
        const listBackground: string = config.listBackground || "";
        const listAppHover: string = config.listAppHover || "";
        const listAppTextColor: string = config.listAppTextColor || "";
        const searchBarBackground: string = config.searchBarBackground || "";
        const searchBarTextColor: string = config.searchBarTextColor || "";
        const iconHover: string = config.iconHover || "";
        const toolTipBackground: string = config.toolTipBackground || "";
        const toolTipTextColor: string = config.toolTipTextColor || "";

        // set Window Title
        document.title = windowTitle;

        // set Icon Image
        document.getElementsByClassName('launch-bar-handle-img')[0].setAttribute("src", icon);

        // set Icon Background Image
        document.getElementById('launch-bar-handle')!.style.background = iconBackground;

        // set Tray Background Color
        document.body.style.background = listBackground;

        // set Hotbar Background Color
        document.getElementById('launch-bar-tearout')!.style.background = hotbarBackground;

        //set Search Bar Background Color
        document.getElementById('searchBar')!.style.background = searchBarBackground;

        //set Search Bar Text Color
        document.getElementById('searchBar')!.style.color = searchBarTextColor;
        
        // set Search Bar placeholder text color (matches text color)
        this._writeCSS(`input::-webkit-input-placeholder {color: ${searchBarTextColor}; opacity: 0.3; }`);

        // set System Tray Icon
        TrayWindowManager.instance.updateTrayIcon(systemTrayIcon);

        // set List App Hover Color
        this._writeCSS(`.app-list > .app-square:hover { background: ${listAppHover} }`);

        // set List App Text Color
        this._writeCSS(`.app-list > .app-square > .app-content > .app-name { color: ${listAppTextColor} !important; }`);

        // set action hover color (exit, expand)
        this._writeCSS(`:root {--highlight-color: ${iconHover}; !important}`);

        //sets tooltip defaults
        this._writeCSS(`.tooltip { color: ${toolTipTextColor} !important; background: ${toolTipBackground} !important }`);
    }

    /**
     * @method writeCSS Writes a raw CSS string into a style tag.
     * @param style CSS Style String
     */
    private _writeCSS(style: string): void {
        const head: HTMLElement = document.head;
        const styleTag: HTMLElement = document.createElement('style');

        styleTag.appendChild(document.createTextNode(style));
        head.appendChild(styleTag);
    }

    /**
     * @method _processAppList Process the Array of Applications and handles.
     * @param apps AppInfo Array
     */
    private _processAppList(apps: AppInfo[]): void {
        // Filter out hidden apps & start apps with startup flag
        const appsFiltered: AppInfo[] = apps.filter((app: AppInfo) => {
            if(app.startup) {
                ContentManager.createFromManifestAndRun(app.manifest_url);

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

        if (!this._hasRenderedOnce) {
            this._renderHotBar(appClassed);
            this._hasRenderedOnce = true;
        }

        this._renderAppList(appClassed);

        this._trayApps = this._trayApps.concat(appClassed);

        // Sets the App list to height relative to number of icons.

        const rowCount: number = (Math.ceil(this._trayApps.length / 4) - 1);
        document.getElementsByClassName('app-list')[0].setAttribute("style", `height: ${((rowCount > 4 ? 4 : rowCount) * 96 + 10)}px`);

        // Once all apps are loaded, dispatch an event for
        // any compnents that require this to be complete
        this._dragDropManager.initChildCount();
    }

    /**
     * @method _renderHotBar Renders the Hotbar Apps.
     * @param apps Array of Applications
     * @param clearExistingIcons Remove any existing Icons
     */
    private _renderHotBar(apps: App[], clearExistingIcons: boolean = false): void {
        // Trusting #app-hotbar is not null
        const hotBar: HTMLElement = document.getElementById("app-hotbar")!;

        // Gets any apps on the HotBar from previous application uses.
        const rememberedHotApps: Array<{ name: string }> = JSON.parse(localStorage.getItem('HotApps') as string) || [];

        if (hotBar) {

            // Render each applications HTML
            apps.forEach((app: App, index: number) => {

                // Loads first 5 apps in list if there are no rememeberedApps, or loads the rememeberedApps.
                if (((index < 5 && rememberedHotApps.length === 0) || rememberedHotApps.length > 0)) {

                    // Pluck out and renders the remembered apps
                    if (rememberedHotApps.length > 0) {
                        const found: number = rememberedHotApps.findIndex((rememberedApp: { name: string }) => {
                            return app.info.name === rememberedApp.name;
                        });

                        if (found > -1) {
                            this._renderTo(hotBar, app.render(true));
                        }
                    } else {
                        // No rememberedApps
                        this._renderTo(hotBar, app.render(true));
                    }
                }
            });
        }
    }

    /**
     * @method _renderAppList Renders Application from an array of applications.
     * @param apps Array of Applications
     * @param renderHotBar Boolean if we should consider the top bar items or render only to the tray.
     */
    private _renderAppList(apps: App[], clearExistingIcons: boolean = false): void {



        // Trusting .app-list is not null
        const trayElement: HTMLElement = document.getElementsByClassName("app-list")![0] as HTMLElement;

        if (clearExistingIcons) {
            trayElement.innerHTML = "";

            // Before re-rendering we also want to remove any/all existing tooltips
            const tooltips = Array.from(document.querySelectorAll('.tooltip')) as HTMLElement[];
            tooltips.forEach((element: Element) => {
                element.remove();
            });
        }

        if (trayElement) {
            apps.forEach((app: App, index: number) => {
                this._renderTo(trayElement, app.render());
            });
        }
    }

    /**
     * @method _renderTo A helper to render HTML to the DOM.
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
        if (ContentManager.INSTANCE) {
            return ContentManager.INSTANCE;
        } else {
            return new ContentManager();
        }
    }
}