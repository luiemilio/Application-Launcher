import { WindowManager } from './js/WindowManager';
import { ContentManager } from './js/ContentManager';
import { TrayWindowManager } from './js/TrayWindowManager';
 
(window as any).WindowManager = new WindowManager();
(window as any).ContentManager = new ContentManager();
(window as any).TrayWindowManager = new TrayWindowManager();