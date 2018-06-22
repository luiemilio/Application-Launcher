
import dragula from 'dragula';
import { WindowManager } from './WindowManager';

// Default max number of hotbar icons
const MAX_CHILD_COUNT = 5;

/**
 * Helper class that initiates and manages drag and drop functionality
 */
export class DragDropManager {

    /** Maximum number of hotbar icons */
    private _maxChildren: number;

    /** Current number of icons in the hotbar */
    private _hotBarChildCount: number;

    /** Pointers to the two container elements */
    private _appHotBar: HTMLElement;
    private _appList: HTMLElement;

    /** Instance of the dragula drake class which actually does the DnD logic */
    private _drake: dragula.Drake;

    /**
     * @param {number} maxChildren Maximum number of hotbar icons allowed
     */
    constructor(maxChildren: number = MAX_CHILD_COUNT) {

        this._maxChildren = maxChildren;
        // Initialize _childCount to the max allowed., preventing apps
        // from being added to the hot bar. This will be set correctly once  
        // the content is fully loaded.
        this._hotBarChildCount = this._maxChildren;

        // Initialize the pointers to the container elements
        this._appHotBar = document.querySelector('#app-hotbar') as HTMLElement;
        this._appList = document.querySelector('.app-list') as HTMLElement;

        // This is the bulk of the drag and drop functionality
        this._drake = this._initializeDragula();
        this._registerListeners(this._drake);
    }

    /**
     * Initializes the dragula library to manage drag and drop
     */
    private _initializeDragula(): dragula.Drake {

        return dragula({
            // Array of elements that will be managed by dragula
            containers: [
                this._appList,
                this._appHotBar,
            ],
            // Determines when the dragged object is copied vs moved
            copy: (el, source): boolean => {
                // All drags originating from the app library are copied
                return source === this._appList;
            },
            // Determines when a container will accept a drop
            accepts: (el, target, source): boolean => {
                // Not allowed to add anything to the main list
                if (target === this._appList) {
                    return false;
                }

                // Internal moves within the hot bar are always allowed
                if (source === this._appHotBar) {
                    return true;
                }

                // Otherwise (moving from list to hotbar) there must be fewer
                // than _maxChildren existing children
                return this._hotBarChildCount < MAX_CHILD_COUNT;
            },
            // Determines when an app can not be picked up
            invalid: (el, handle): boolean => {

                // Block all drag and drop actions if the tray is minimized
                return !WindowManager.instance.isTrayOpen;
            },
            // If the object is dropped where there is no valid 
            // position, it is removed (e.g. off window)
            removeOnSpill: true,
        });

    }

    /** Registers listeners against the drake object to customise behaviour */
    private _registerListeners(drake: dragula.Drake): void {
        // Increment the child counter when an app is added to the top bar
        drake.on('drop', (el: Element, target: Element, source: Element, sibling: Element): void => {
            if (target === this._appHotBar && source === this._appList) {
                this._hotBarChildCount++;
            }
        });

        // Decrement the child counter when an app is removed from the top bar
        drake.on('remove', (el: Element, source: Element): void => {
            if (source === this._appHotBar) {
                this._hotBarChildCount--;
            }
        });

        // Override default copy behavior to ensure onclick listeners are preserved
        drake.on('cloned', (clone: HTMLDivElement, original: HTMLDivElement, type: string): void => {
            if (type === 'copy') {
                clone.onclick = original.onclick;
            }
        });
    }

    /**
     * Initializes the hotbar count tracker to the number of icons in the hotbar when called.
     * Should be called once the app lists are fully rendered, but before any drag and drop
     * functionality is required.
     */
    public initChildCount(): void {
        this._hotBarChildCount = document.getElementById("app-hotbar")!.childNodes.length;
    }

}


