import { mkdir, cp } from "node:fs/promises";
import { dirname } from "node:path";

const SRC = "vendor/winxp-icon-theme/winxp";
const DST = "public/icons/xp-selected";

// Essential icons used by the app
const files = [
  // Desktop icons (48px)
  "devices/48/computer.png",
  "devices/48/gnome-computer.png",
  "places/48/folder-documents.png",
  "places/48/default-folder-documents.png",
  "places/48/stock_folder.png",
  "actions/48/trash-empty.png",
  "places/48/emptytrash.png",
  "apps/48/preferences-system-network.png",
  
  // Start menu left panel (32px)
  "apps/32/internet-web-browser.png",
  "apps/32/internet-mail.png",
  "apps/32/multimedia-video-player.png",
  "apps/32/help-browser.png",
  "places/32/stock_folder.png",
  
  // Start menu right panel + taskbar (16px)
  "places/16/start-here.png",
  "places/16/desktop.png",
  "places/16/org.xfce.panel.showdesktop.png",
  "apps/16/internet-web-browser.png",
  "devices/16/computer.png",
  "devices/16/gnome-computer.png",
  "places/16/folder-documents.png",
  "places/16/default-folder-documents.png",
  "places/16/folder-pictures.png",
  "places/16/folder-music.png",
  "apps/16/gnome-control-center.png",
  "categories/16/gnome-control-center.png",
  "apps/16/preferences-system.png",
  "devices/16/printer.png",
  "apps/16/help-browser.png",
  "actions/16/edit-find.png",
  "actions/16/gtk-find.png",
  "actions/16/stock_search.png",
  "apps/16/system-search.png",
  "actions/16/system-run.png",
  "apps/16/multimedia-volume-control.png",
  "apps/16/preferences-system-network.png",
  
  // File manager navigation (16px)
  "actions/16/go-previous.png",
  "actions/16/go-next.png",
  "actions/16/go-up.png",
  "actions/16/go-home.png",
  "actions/16/view-refresh.png",
  "actions/16/view-list.png",
  "actions/16/view-list-details.png",
  "actions/16/view-grid.png",
  "actions/16/edit-copy.png",
  "actions/16/edit-cut.png",
  "actions/16/edit-delete.png",
  "actions/16/folder-new.png",
  "actions/16/document-new.png",
  "places/16/stock_folder.png",
  "places/16/gnome-folder.png",
  
  // MIME types (16px)
  "mimes/16/application-text.png",
  "mimes/16/image-x-generic.png",
  "mimes/16/audio-x-generic.png",
  "mimes/16/video-x-generic.png",
  "mimes/16/application-pdf.png",
  "mimes/16/application-zip.png",
  
  // Apps (32px for window icons)
  "apps/32/text-editor.png",
  "apps/32/accessories-text-editor.png",
  "apps/32/kolourpaint.png",
  "apps/32/mtpaint.png",
  "apps/32/accessories-calculator.png",
  "apps/32/gnome-calculator.png",
  "apps/32/gnome-system-monitor.png",
  "apps/32/utilities-system-monitor.png"
];

try {
  await mkdir(DST, { recursive: true });
  
  let copied = 0;
  let skipped = 0;
  
  for (const rel of files) {
    const srcPath = `${SRC}/${rel}`;
    const destPath = `${DST}/${rel}`;
    
    try {
      await mkdir(dirname(destPath), { recursive: true });
      await cp(srcPath, destPath, { force: true });
      copied++;
    } catch (err) {
      console.warn(`[icons] Skip ${rel}: ${err.message}`);
      skipped++;
    }
  }
  
  console.log(`[icons] Copied ${copied} icons to ${DST}, skipped ${skipped}`);
} catch (err) {
  console.error(`[icons] Error: ${err.message}`);
  process.exit(1);
}
