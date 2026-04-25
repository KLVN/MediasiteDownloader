javascript: (() => {
  /* In case a Mediasite Channel was detected (usually that is just the player embedded into another site),
     show an alert and redirect to the site with just the player */
  if (document.getElementById("player-iframe")) {
    alert("MediasiteDownloader: A Mediasite Channel was detected. After you click \"OK\" you will be redirected to the video. Click Play and then again on the MediasiteDownloader bookmark.\nNote: Your browser may block the redirect. Make sure to allow pop-ups for this website.");
    window.open(document.getElementById("player-iframe").src);
  }

  /* Insert custom CSS for modal */
  function injectStyles() {
    document.head.insertAdjacentHTML("beforeend", '<style>\
    .modal-window {\
      position: fixed;\
      display: flex;\
      justify-content: center;\
      align-items: center;\
      background-color: rgba(0, 0, 0, 0.6);\
      backdrop-filter: blur(4px);\
      top: 0;\
      right: 0;\
      bottom: 0;\
      left: 0;\
      z-index: 999;\
      opacity: 0;\
      pointer-events: none;\
      font-family: Arial, Helvetica, sans-serif !important;\
    }\
    .modal-window:target {\
      opacity: 1;\
      pointer-events: auto;\
    }\
    .modal-window > div {\
      width: 480px;\
      position: absolute;\
      padding: 2em 2.5em;\
      background: #ffffff;\
      color: #333333;\
      border-radius: 10px;\
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);\
    }\
    .modal-close {\
      color: #666;\
      font-size: 14px;\
      line-height: 32px;\
      position: absolute;\
      right: 12px;\
      text-align: center;\
      top: 12px;\
      width: 64px;\
      text-decoration: none;\
      border: 1px solid #ccc;\
      border-radius: 6px;\
      transition: background 0.2s, border-color 0.2s;\
    }\
    .modal-close:hover {\
      background: #f0f0f0;\
      border-color: #999;\
    }\
    .modal-window > div > ul > li,\
    .modal-window #MSDLinfo ul > li {\
      margin: 5px 0 !important;\
      padding: 0 !important;\
      line-height: 1.5 !important;\
    }\
    .MSDLthumbnail {\
      width: 350px;\
      vertical-align: middle;\
      margin-bottom: 4px;\
      border-radius: 4px;\
    }\
    div#MSDLinfo {\
      max-height: 70vh;\
      min-height: 5vh;\
      overflow-y: auto;\
    }\
    .MSDLtitle-input {\
      width: 100%;\
      box-sizing: border-box;\
      padding: 6px 8px;\
      margin-top: 4px;\
      border: 1px solid #ccc;\
      border-radius: 4px;\
      font-family: Arial, Helvetica, sans-serif !important;\
      font-size: 14px;\
      background-color: #fff;\
    }\
    .MSDLtitle-input:focus {\
      outline: none;\
      border-color: #666;\
    }\
    </style>');
  }

  function buildModal(playerOptions, pausePlayerFunction) {
    const presentation = playerOptions.d.Presentation;

    injectStyles();

    if (document.contains(document.getElementById("open-modal"))) {
      document.getElementById("open-modal").remove();
    }

    /* If video is NOT on demand, it is probably a livestream that cannot be downloaded yet */
    if (presentation.PlayStatus !== "OnDemand") {
      document.body.insertAdjacentHTML("beforeend",
          '<div id="open-modal" class="modal-window"> \
            <div>\
              <a href="#" title="Close" class="modal-close">Close</a>\
              <p style="font-size: 16px; line-height: 1.5;">Lecture is currently not available on-demand and therefore cannot be downloaded.<br>Try again later.</p>\
            </div>\
          </div>');
      return;
    }

    /* Otherwise video is available on demand, create modal that will be populated later on */
    document.body.insertAdjacentHTML("beforeend",
        '<div id="open-modal" class="modal-window">\
          <div>\
          <div style="font-size: 18px;line-height: 45px;position: absolute;left: 20px;top: 8px;">MediasiteDownloader (<a href="https://github.com/KLVN/MediasiteDownloader" target="_blank" style="color: #0066cc;">GitHub</a>)</div>\
            <a href="#" title="Close" class="modal-close">Close</a>\
            <div id="MSDLinfo">\
              <ul style="list-style: outside; !important">\
                <li>Copy the title:<br><input type="text" onClick="this.select();" value="' + document.title + '" class="MSDLtitle-input"></li>\
                <li>Right-click on the thumbnail(s) and choose "Save <span style="font-weight: bold;">link</span> as..."</li>\
                <div id="MSDLvideos"></div>\
                <li>Paste in to rename file correctly and save it</li>\
                <li>Click <a href="https://klvn.github.io/MediasiteDownloader/" target="_blank">here</a> for more detailed instructions</li>\
              </ul>\
            </div>\
          </div>\
        </div>');

    const origin = window.location.origin;
    const videosContainer = document.getElementById("MSDLvideos");
    let videosHtml = "";

    /* Go through all video streams and only keep MP4 files */
    presentation.Streams
      .flatMap((stream) => stream.VideoUrls
        .filter((url) => url.MimeType === "video/mp4")
        .map((url) => ({ thumbnail: origin + stream.ThumbnailUrl, videoUrl: url.Location }))
      )
      .forEach(({ thumbnail, videoUrl }) => {
        videosHtml += "<li><a href='" + videoUrl + "' target='_blank'><img class='MSDLthumbnail' src='" + thumbnail + "' alt='Video stream thumbnail'></a></li>";
      });

    /* Vodcasts are easier to deal with, so if it is one then just grab the URL for downloading */
    if (presentation.VodcastUrl != null) {
      videosHtml += "<li>Vodcast:<br><a href='" + presentation.VodcastUrl + "' target='_blank'><img class='MSDLthumbnail' src='" + origin + presentation.ThumbnailUrl + "' alt='Vodcast thumbnail'></a></li>";
    }

    if (videosHtml) {
      videosContainer.innerHTML = videosHtml;
    } else {
      /* No downloadable MP4 file was found */
      document.getElementById("MSDLinfo").innerHTML = "<li>Sorry, no video(s) available.</li>";
    }

    /* Pause player so it does not continue to run in the background */
    pausePlayerFunction();

    /* Open modal */
    location.href = "#open-modal";
  }

  /* If 'MediasitePlayer' does not exist, we are still running an older version (< 2022) of Mediasite.
     Grab service path and resource ID and make POST request to get data about current video. */
  function handleOldMediasite() {
    fetch(window.location.origin + document.getElementById('ServicePath').innerHTML + '/GetPlayerOptions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify({
        'getPlayerOptionsRequest': {
          'ResourceId': document.getElementById('ResourceId').innerHTML,
          'QueryString': '',
          'UseScreenReader': 'false',
          'UrlReferrer': ''
        }
      })
    })
    .then((response) => response.json())
    .then((playerOptions) => {
      console.log(playerOptions);
      buildModal(playerOptions, () => Mediasite.Player.API.pause());
    });
  }

  /* If 'MediasitePlayer' does exist, we are running a newer version (>= 2022) of Mediasite
     and have to use a few different variables. But essentially it is the same process. */
  function handleNewMediasite() {
    fetch(window.location.origin + SiteData.PlayerService + '/GetPlayerOptions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify({
        'getPlayerOptionsRequest': {
          'ResourceId': SiteData.PresentationId,
          'QueryString': '',
          'UseScreenReader': 'false',
          'UrlReferrer': ''
        }
      })
    })
    .then((response) => response.json())
    .then((playerOptions) => {
      console.log(playerOptions);
      buildModal(playerOptions, () => MediasitePlayer.pause());
    });
  }

  /* If 'MediasitePlayer' does not exist, we are still running an older version */
  if (typeof MediasitePlayer !== 'object') {
    handleOldMediasite();
  } else {
    handleNewMediasite();
  }
})()