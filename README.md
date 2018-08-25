# MediasiteDownloader
A Bookmarklet (Favelet) for your browser to simply download lectures from a 'Mediasite' website, that is often used by colleges and universities.

## "Installation"
Go to [this website](https://klvn.github.io/MediasiteDownloader/) and drag & drop the button onto your browsers Bookmarks Bar.

Works best with Google Chrome.

## Usage
0. (Mobile devices are not supported)
1. Drag this button onto your browsers Bookmarks Bar
2. Open a Mediasite lecture
3. Click on Bookmarklet
4. A dialog will pop up: Copy the title of the lecture, right-click on the link, "Save as..." and paste in the copied title to rename the file
5. Download begins

## Known issues
* Firefox: Video is opening in browser instead of downloading it.  
Due to security reasons it's not possible to download files from cross-origins. You have to download it manually via right-click, "Save as...".

* Downloaded file has a long and weird name.  
Because cross-origin downloads are not allowed, it's not possible to use the `a.download` tag to rename downloaded files.

---

## Legal
This project is in no way affiliated with, authorized, maintained, sponsored or endorsed by Sonic Foundry Inc. or any of its affiliates or subsidiaries. This is an independent project. Use at your own risk.
