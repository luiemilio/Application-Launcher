import { AppInfo, ContentManager } from "./ContentManager";
import Tooltip from 'tooltip.js';

/**
 * @class App Handles individual Application functionality
 */
export class App {
  /**
   * @member _appInfo Contains the information for this application
   */
  private _appInfo: AppInfo;

  /**
   * @constructor Constructor for App Class.
   * @param appInfo Contains the information for this application.
   */
  constructor(appInfo: AppInfo) {
    this._appInfo = appInfo;
  }

  /**
   * @method render Returns HTMLElement for this application
   */
  public render(hotbar: boolean = false): HTMLElement {
    // Creates <div class="app-square"></div>
    const appSquare: HTMLElement = document.createElement("div");
    appSquare.className = "app-square";

    // Creates <div class="app-content"></div>
    const appContent: HTMLElement = document.createElement("div");
    appContent.className = "app-content";

    // Creates <img class="app-icon" draggable="false", src="[application icon path]" />
    const appIcon: HTMLElement = document.createElement("img");
    appIcon.className = "app-icon";
    appIcon.setAttribute("draggable", "false");
    appIcon.setAttribute("src", `${this._appInfo.icon}`);

    // Creates <span class="app-name">[application title]</span>
    const appName: HTMLElement = document.createElement("span");
    appName.className = "app-name";
    appName.innerHTML = `${this._appInfo.title}`;

    // Appends appIcon, appName to appContent
    appContent.appendChild(appIcon);
    appContent.appendChild(appName);

    // Appends appContent to appSquare
    appSquare.appendChild(appContent);

    // Creates onclick event for the appSquare to launch application
    appSquare.onclick = (): void => {
      ContentManager.createFromManifestAndRun(this._appInfo.manifest_url);
    };

    // Adds a tooltip object to appContent
    if (!hotbar) {
      const toolTip = new Tooltip(appContent, {
        // Will default to right of the object, unless the window is to narrow to fit
        placement: 'right-start',
        // Tooltip is rendered in the body, so as to not mess with the other elements
        container: document.body,
        delay: { show: 1000, hide: 50 },
        title: this._appInfo.title,
        // HTML template which is rendered into the tooltip. 
        // NOTE: The tooltip title will be auto inserted into the tooltip-inner div
        template: `
        <div class="tooltip" role="tooltip">
            <div class="tooltip-arrow">
            </div>
            <div class="tooltip-inner">
            </div>
            <div class="tooltip-description">
                <p> 
                  ${this._appInfo.description}
                </p>
            </div>
            <div class="tooltip-images">
              ${this._appInfo.images.map((img) => {
            return `<img src="${img.url}" width="170">`;
          }).join('\n')}
            </div>
        </div>`
      });
    }

    return appSquare;

    /* appSquare Shape: 
        <div class="app-square">
            <div class="app-content">
                <img class="app-icon" src="${app.icon}"/>
                <span class="app-name">${app.title}</span>
            </div>
        </div>
    */
  }

  /**
   * @method info Returns information about the application
   */
  public get info(): AppInfo {
    return this._appInfo;
  }

}
