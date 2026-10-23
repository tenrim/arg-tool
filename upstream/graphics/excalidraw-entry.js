// Build-time host adapter: render only the official upstream editor component.
// Site headings, file management and dialogs remain shared native components.
import React from 'react';
import {createRoot} from 'react-dom/client';
import {Excalidraw} from '@excalidraw/excalidraw';
export {exportToBlob,exportToSvg,convertToExcalidrawElements,restoreElements,CaptureUpdateAction} from '@excalidraw/excalidraw';
export function mount(host,props){const root=createRoot(host);root.render(React.createElement(Excalidraw,props));return()=>root.unmount();}
