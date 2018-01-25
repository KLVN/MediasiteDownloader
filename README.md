# MediasiteDownloader
A Bookmarklet (Favelet) for your browser to simply download lectures from a 'Mediasite' website, that is often used by colleges and universities.

## "Installation"
Go to [this website](https://klvn.github.io/MediasiteDownloader/) and drag & drop the button onto your browsers Bookmarks Bar.

Works best with Google Chrome.

## Usage
1. Open a Mediasite lecture
2. Click on Bookmarklet
3. (If not already happened, you will be redirected to the same lecture with HTML5 enabled. Then click again on Bookmarklet)
4. Download starts

## Known issues
* Firefox: Video is opening in browser instead of downloading it.  
Due to security reasons it's not possible to download files from cross-origins. You have to download it manually via right-click, "Save as...".

* Downloaded file has a long and weird name.  
Because cross-origin downloads are not allowed, it's not possible to use the `a.download` tag to rename downloaded files.

---

## Legal
This project is in no way affiliated with, authorized, maintained, sponsored or endorsed by Sonic Foundry Inc. or any of its affiliates or subsidiaries. This is an independent project. Use at your own risk.