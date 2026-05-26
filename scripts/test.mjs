import { readFileSync } from "node:fs";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const html = readFileSync("index.html", "utf8");
const manifest = JSON.parse(readFileSync("manifest.webmanifest", "utf8"));
const app = readFileSync("src/app.js", "utf8");
const desktopHtml = readFileSync("desktop.html", "utf8");
const desktopApp = readFileSync("src/desktop.js", "utf8");
const mainProcess = readFileSync("main.js", "utf8");
const preload = readFileSync("preload.js", "utf8");
const serviceWorker = readFileSync("sw.js", "utf8");

assert(html.includes("rel=\"manifest\""), "index.html should link the web app manifest");
assert(html.includes("id=\"installButton\""), "index.html should expose an install button");
assert(manifest.display === "standalone", "manifest should install as a standalone app");
assert(manifest.icons?.length > 0, "manifest should include an icon");
assert(app.includes("beforeinstallprompt"), "app should handle the PWA install prompt");
assert(app.includes("localStorage"), "app should persist bond progress locally");
assert(app.includes("pointerdown"), "pet should support pointer dragging");
assert(serviceWorker.includes("cache.addAll"), "service worker should precache app assets");
assert(desktopHtml.includes("Mate 模式控制台"), "desktop mode should expose a Mate-style control panel");
assert(desktopHtml.includes(`id="modelInput"`), "desktop mode should include a model import slot");
assert(desktopApp.includes("setIgnoreMouseEvents"), "desktop mode should support focus click-through");
assert(desktopApp.includes("dancing"), "desktop mode should support dance interactions");
assert(mainProcess.includes("transparent: true"), "Electron shell should use a transparent overlay window");
assert(mainProcess.includes("alwaysOnTop: true"), "Electron shell should stay above desktop windows");
assert(preload.includes("contextBridge"), "preload should expose a safe desktop bridge");

console.log("All product smoke tests passed.");
