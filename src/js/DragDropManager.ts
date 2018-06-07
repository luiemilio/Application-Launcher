
import dragula from 'dragula';

const MAX_CHILD_COUNT = 5;


export class DragDropManager {

    public static instance: DragDropManager;

    private _maxChildren:number;

    private _hotBarChildCount:number;

    private _appHotBar = document.querySelector('#app-hotbar') as Element;
    private _appList = document.querySelector('.app-list') as Element;

    private _drake: dragula.Drake;

    constructor(maxChildren:number = MAX_CHILD_COUNT ) {
        this._maxChildren = maxChildren;
        // Initialize _childCount to the max allowed., preventing apps
        // from being added to the hot bar. This will be set correctly once  
        // the content is fully loaded.
        this._hotBarChildCount = this._maxChildren;
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
                // than _maxChildren existing children
                console.log(`Current children: ${this._hotBarChildCount}; Max children: ${this._maxChildren}`);
                
                return this._hotBarChildCount < MAX_CHILD_COUNT;

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
                this._hotBarChildCount ++;
                console.log('Child count initialized to : ' + this._hotBarChildCount);
                
            }
        });

        // Decrement the child counter when an app is removed from the top bar
        drake.on('remove', (el: Element, source: Element) => {
            if (source === this._appHotBar) {
                this._hotBarChildCount --;
                console.log('Child count decremented to : ' + this._hotBarChildCount);
                
            }
        });

        // Override default copy behavior to ensure onclick listeners are preserved
        drake.on('cloned', (clone: HTMLDivElement, original: HTMLDivElement, type: string) => {
            if (type === 'copy') {
                clone.onclick = original.onclick;
            }
        });
    }

    public initChildCount() {
          this._hotBarChildCount = document.getElementById("app-hotbar")!.childNodes.length;
          console.log('Child count initialized to : ' + this._hotBarChildCount);
          
    }
    
}


