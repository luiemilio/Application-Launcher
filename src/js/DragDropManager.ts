
import dragula from 'dragula';

export class DragDropManager {

    public static instance: DragDropManager;

    private _appHotBar = document.querySelector('#app-hotbar') as Element;
    private _appList = document.querySelector('.app-list') as Element;

    private _drake: dragula.Drake;

    constructor() {
        this._drake = this._initializeDragula();
        this._registerListeners(this._drake);
    }

    private _initializeDragula() {
        // Initialize the drag and drop api
        return dragula({
            // Array of elements that will be managed by dragula
            containers: [
                this._appList,
                this._appHotBar,
            ],
            // Determines when the dragged object is copied vs moved
            copy: (el, source) => {
                // All drags originating from the app library are copied
                return source === this._appList;
            },
            // Determines when a container will accept a drop
            accepts: (el, target, source) => {
                // Not allowed to add anything to the main list
                if (target === this._appList) {
                    return false;
                }

                // Internal moves within the hot bar are always allowed
                if (source === this._appHotBar) {
                    return true;
                }

                // Otherwise (moving from list to hotbar) there must be fewer
                // than 5 existing children
                return Number(this._appHotBar.getAttribute('childCount')) < 5;

            },
            // If the object is dropped where there is no valid 
            // position, it is removed (e.g. off window)
            removeOnSpill: true,
        });

    }

    /** Registers listeners against the drake object to customise behaviour */
    private _registerListeners(drake: dragula.Drake) {
        // Increment the child counter when an app is added to the top bar
        drake.on('drop', (el: Element, target: Element, source: Element, sibling: Element) => {
            if (target === this._appHotBar && source === this._appList) {
                incrementHotbarChildCount(target);
            }
        });

        // Decrement the child counter when an app is removed from the top bar
        drake.on('remove', (el: Element, source: Element) => {
            if (source === this._appHotBar) {
                decrementHotbarChildCount(source);
            }
        });

        // Override default copy behavior to ensure onclick listeners are preserved
        drake.on('cloned', (clone: HTMLDivElement, original: HTMLDivElement, type: string) => {
            if (type === 'copy') {
                clone.onclick = original.onclick;
            }
        });
    }

}

function getHotbarChildCount(appHotBar: Element): number {
    return Number(appHotBar.getAttribute('childCount'));
}

function incrementHotbarChildCount(target: Element): void {
    target.setAttribute('childCount',
        (getHotbarChildCount(target) + (1)).toString()
    );
    console.log(`Incremeneting childCount. Value now ${target.getAttribute('childCount')}`);

}

function decrementHotbarChildCount(source: Element): void {
    source.setAttribute('childCount',
        (getHotbarChildCount(source) - 1).toString()
    );
    console.log(`Decrementing childCount. Value now ${source.getAttribute('childCount')}`);

}

function setChildCount() {
    // Set a custom attribute against the hotbar that will be used to track whether
    // apps can be dragged into it
    document.getElementById("app-hotbar")!
        .setAttribute('childCount',
            document.getElementById("app-hotbar")!.childNodes.length.toString());
}

