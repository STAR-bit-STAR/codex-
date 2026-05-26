import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("desktopPet", {
  setAlwaysOnTop(enabled) {
    return ipcRenderer.invoke("set-always-on-top", enabled);
  },
  setIgnoreMouseEvents(enabled) {
    return ipcRenderer.invoke("set-ignore-mouse-events", enabled);
  }
});
