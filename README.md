OpenFin Application Launcher
=============

# Overview

The Application Launcher is a reference implementation of a launch bar built on OpenFin OS. The Launcher centralizes app discovery and can be customized with your own branding.  


## Features
* Customizable Look and Feel
* Supports Custom Application Manifests from local and remote environments.
* Searchable Application Directory

# Launch

## Run Locally

```
npm install
npm start
```

This will place the built files into the `./dist/` directory.  You can then copy these files to your web server to serve.  Be sure to update the app.json accordingly.

# Getting Started

Setting up and customizing the OpenFin Application Launcher is easy.

## Settings Manifest

The settings manifest can be found under `./src/config/settings.json`.  Here you can customize the images and colors found in the launcher.  This manifest takes the following shape:

```
{
    "style": {
        "windowTitle": string - The title of the window.
        "icon": string - Image Url or path for the Icon found prominently on the launcher hotbar.
        "iconHover": string - Hover color of the expand tray and close buttons.  Can be hex color string or url/path.  See CSS notes below.
        "iconBackground": string - Background for the hotbar icon. Can be hex color string or url/path.  See CSS notes below.
        "systemTrayIcon": string - Icon to be used in the system tray menu.
        "hotbarBackground": string - Background for the hotbar icon. Can be hex color string or url/path.  See CSS notes below.
        "listBackground": string -Background for the app list. Can be hex color string or url/path.  See CSS notes below.
        "listAppHoverBackground": string - Color of when an app is hovered. Can be hex color string or url/path.  See CSS notes below.
        "listAppTextColor": string - Color of the text under an application. Can be hex color string or url/path.  See CSS notes below.
        "searchBarBackground": string - Background for search. Can be hex color string or url/path.  See CSS notes below.
        "searchBarTextColor": string - Search bar text color. Can be hex color string or url/path.  See CSS notes below.
        "toolTipBackground": string - Background for the tooltip. Can be hex color string or url/path.  See CSS notes below.
        "toolTipTextColor": string - Color of the text within the tooltip.
    },
    "applicationMetadata": string[] - An array of urls pointing to your application metadata stores.
}
```

### CSS Notes:

Anything denoted with a CSS Note can have a valid CSS property:

```
url('someimage.png') | "blue" | "#FFFFFF"
```

# Application Metadata

The application metadata file contains an array of various settings about your applications.  An example metadata file can be found under `./src/config/application-metadata/`. The file takes the following shape:

```
[
    {
    "name": string - Name of your application.
    "title": string - Title of your application.  Used in the app list.
    "manifest_url": string - Url to the application's manifest file.
    "description": string - A brief description of your application.
    "icon": string - Url to your applications icon.
    "images": [{"url": string - Url to screenshots of your application. }].
    }
]
```
# Project Structure

All code lives under the src directory.


## Build

The project is built and staged to the ./dist directory.  This directory is exactly what would be deployed to the production CDN.

You initiate the build process with the following command: `npm run build`.

* dist
  * index.html - the primary index html.
  * tray.html - the tray window html.
  * dist/ - the built typescript files.
  * config/ - contains default settings.json
  * css/ - contains the project css and font.
  * image/ contains project images.

# Known Issues

# License
This project uses the [Apache2 license](https://www.apache.org/licenses/LICENSE-2.0)

# Support
This is an open source project and all are encouraged to contribute.
Please enter an issue in the repo for any questions or problems. For further inqueries, please contact us at support@openfin.co
