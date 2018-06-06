import { AppInfo, ContentManager } from "./ContentManager";

/**
 * @class App Handles individual Application functionality
 */
export class App {
  private _appInfo: AppInfo;

  constructor(appInfo: AppInfo) {
    this._appInfo = appInfo;
  }

  /**
   * @method render Returns HTMLElement for this application
   */
  render(): HTMLElement {
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
      ContentManager.createFromManifestAndRun(this._appInfo.manifest);
    };

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
