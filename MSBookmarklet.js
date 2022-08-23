javascript: (() => {
  // In case a Mediasite Channel was detected (usually that is just the player embedded into another site),
  // show an alert and redirect to the site with just the player
  if (document.getElementById("player-iframe")) {
    alert("MediasiteDownloader: A Mediasite Channel was detected. After you click \"OK\" you will be redirected to the video. Click Play and then again on the MediasiteDownloader bookmark.\nNote: Your browser may block the redirect. Make sure to allow pop-ups for this website.");
    window.open(document.getElementById("player-iframe").src);
  }

  // If 'MediasitePlayer' does not exist, we are still running an older version of Mediasite
  if(typeof MediasitePlayer !== 'object') {
    // Grab service path and resource ID and make POST request to get data about current video
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
    .then((playerOpts) => {
      // Insert custom CSS for modal
      document.head.insertAdjacentHTML("beforeend", '<style type=\'text/css\'>\
      .modal-window {\
        position: fixed;\
        display: flex;\
        justify-content: center;\
        align-items: center;\
        background-color: rgba(0, 0, 0, 0.75);\
        top: 0;\
        right: 0;\
        bottom: 0;\
        left: 0;\
        z-index: 999;\
        opacity: 0;\
        pointer-events: none;\
      }\
      .modal-window:target {\
        opacity: 1;\
        pointer-events: auto;\
      }\
      .modal-window > div {\
        width: 450px;\
        position: absolute;\
        padding: 3em;\
        background: #ffffff;\
        color: #333333;\
        border-radius: 5px;\
      }\
      .modal-window header {\
        font-weight: bold;\
      }\
      .modal-window h1 {\
        font-size: 150%;\
        margin: 0 0 15px;\
        color: #333333;\
      }\
      .modal-close {\
        color: #4c4c4c;\
        line-height: 35px;\
        position: absolute;\
        right: 5px;\
        text-align: center;\
        top: 5px;\
        width: 70px;\
        text-decoration: none;\
        border: #4c4c4c;\
        border-style: solid;\
        border-radius: 5px;\
        border-width: 1px;\
      }\
      .modal-window > div > ul > li {\
      margin: 10px 0;\
      }\
      .MSDLthumbnail {\
        width: 350px;\
        vertical-align: middle;\
        margin-bottom: 4px;\
      }\
      div#MSDLinfo {\
        max-height: 70vh;\
        min-height: 5vh;\
        overflow-y: auto;\
      }\
      </style>');

      // If modal was already inserted, remove it
      if (document.contains(document.getElementById("open-modal"))) {
        document.getElementById("open-modal").remove();
      }

      // If video is NOT on demand, it is probably a livestream that cannot be downloaded yet
      if (playerOpts.d.Presentation.PlayStatus != "OnDemand") {
        document.body.insertAdjacentHTML("beforeend", 
          '<div id="open-modal" class="modal-window"> \
            <div>\
              <a href="#" title="Close" class="modal-close">Close</a>\
              <p style="font-size: 20px;">Lecture is currently not available on-demand and therefore cannot be downloaded.<br>Try again later.</p>\
            </div>\
          </div>');
      } else {
      // If video is available on demand, create modal that will be populated later on
        document.body.insertAdjacentHTML("beforeend", 
          '<div id="open-modal" class="modal-window">\
            <div>\
            <div style="font-size: 20px;line-height: 45px;position: absolute;left: 20px;top: 5px;">MediasiteDownloader (<a href="https://github.com/KLVN/MediasiteDownloader" target="_blank">GitHub</a>)</div>\
              <a href="#" title="Close" class="modal-close">Close</a>\
              <div id="MSDLinfo">\
                <ul style="list-style: outside; !important">\
                  <li>Copy the title: <input type="text" onClick="this.select();" value="' + document.title + '"></li>\
                  <li>Right-click on the thumbnail(s) and choose "Save <span style="font-weight: bold;">link</span> as..."</li>\
                  <div id="MSDLvideos"></div>\
                  <li>Paste in to rename file correctly and save it</li>\
                  <li>Click <a href="https://klvn.github.io/MediasiteDownloader/" target="_blank">here</a> for more detailed instructions</li>\
                </ul>\
              </div>\
            </div>\
          </div>');

        // Grab all video streams
        var allPresentations = playerOpts.d.Presentation.Streams;
        // Just a flag to record if any video is available
        var videoAvailable = false;
        // Go through all video streams
        for (var i = 0; i < allPresentations.length; i++) {
          if (allPresentations[i].VideoUrls.length) {
            for (var j = 0; j < allPresentations[i].VideoUrls.length; j++) {
              // Only look for MP4 files
              if (allPresentations[i].VideoUrls[j].MimeType == "video/mp4") {
                // Set flag because there is at least one MP4 file
                videoAvailable = true;
                var thumbnail = window.location.origin + allPresentations[i].ThumbnailUrl;
                var videoUrl = allPresentations[i].VideoUrls[j].Location;
                // Populate modal that lists all downloadable video streams
                document.getElementById("MSDLvideos").innerHTML += "<li><a href='" + videoUrl + "' target='_blank'><img class='MSDLthumbnail' src='" + thumbnail + "'></a></li>";
              }
            }
          }
        }
        // Vodcasts are easier to deal with, so if it is one then just grab the URL for downloading
        if (playerOpts.d.Presentation.VodcastUrl != null) {
          videoAvailable = true;
          var thumbnail = window.location.origin + playerOpts.d.Presentation.ThumbnailUrl;
          var videoUrl = playerOpts.d.Presentation.VodcastUrl;
          document.getElementById("MSDLvideos").innerHTML += "<li>Vodcast:<br><a href='" + videoUrl + "' target='_blank'><img class='MSDLthumbnail' src='" + thumbnail + "'></a></li>";
        }
        // If flag was not set, no downloadable MP4 file was found
        if (!videoAvailable) document.getElementById("MSDLinfo").innerHTML = "<li>Sorry, no video(s) available.</li>";
      }
      // Pause player so it does not continue to run in the background
      Mediasite.Player.API.pause();
      // Open modal
      location.href = "#open-modal";
    })
  // If 'MediasitePlayer' does exist, we are running a newer version (2022) of Mediasite
  // and have to use a few different variables. But essentially it is the same process.
  } else {
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
    .then((playerOpts) => {
      document.head.insertAdjacentHTML("beforeend", '<style type=\'text/css\'>\
      .modal-window {\
        position: fixed;\
        display: flex;\
        justify-content: center;\
        align-items: center;\
        background-color: rgba(0, 0, 0, 0.75);\
        top: 0;\
        right: 0;\
        bottom: 0;\
        left: 0;\
        z-index: 999;\
        opacity: 0;\
        pointer-events: none;\
      }\
      .modal-window:target {\
        opacity: 1;\
        pointer-events: auto;\
      }\
      .modal-window > div {\
        width: 450px;\
        position: absolute;\
        padding: 3em;\
        background: #ffffff;\
        color: #333333;\
        border-radius: 5px;\
      }\
      .modal-window header {\
        font-weight: bold;\
      }\
      .modal-window h1 {\
        font-size: 150%;\
        margin: 0 0 15px;\
        color: #333333;\
      }\
      .modal-close {\
        color: #4c4c4c;\
        line-height: 35px;\
        position: absolute;\
        right: 5px;\
        text-align: center;\
        top: 5px;\
        width: 70px;\
        text-decoration: none;\
        border: #4c4c4c;\
        border-style: solid;\
        border-radius: 5px;\
        border-width: 1px;\
      }\
      .modal-window > div > ul > li {\
      margin: 10px 0;\
      }\
      .MSDLthumbnail {\
        width: 350px;\
        vertical-align: middle;\
        margin-bottom: 4px;\
      }\
      div#MSDLinfo {\
        max-height: 70vh;\
        min-height: 5vh;\
        overflow-y: auto;\
      }\
      </style>');
  
      if (document.contains(document.getElementById("open-modal"))) {
        document.getElementById("open-modal").remove();
      }
  
      if (playerOpts.d.Presentation.PlayStatus != "OnDemand") {
       document.body.insertAdjacentHTML("beforeend", 
          '<div id="open-modal" class="modal-window"> \
            <div>\
              <a href="#" title="Close" class="modal-close">Close</a>\
              <p style="font-size: 20px;">Lecture is currently not available on-demand and therefore cannot be downloaded.<br>Try again later.</p>\
            </div>\
          </div>');
      } else {
       document.body.insertAdjacentHTML("beforeend", 
          '<div id="open-modal" class="modal-window">\
          <div>\
          <div style="font-size: 20px;line-height: 45px;position: absolute;left: 20px;top: 5px;">MediasiteDownloader (<a href="https://github.com/KLVN/MediasiteDownloader" target="_blank">GitHub</a>)</div>\
            <a href="#" title="Close" class="modal-close">Close</a>\
            <div id="MSDLinfo">\
              <ul style="list-style: outside; !important">\
                <li>Copy the title: <input type="text" onClick="this.select();" value="' + document.title + '" style="background-color: #FFF"></li>\
                <li>Right-click on the thumbnail(s) and choose "Save <span style="font-weight: bold;">link</span> as..."</li>\
                <div id="MSDLvideos"></div>\
                <li>Paste in to rename file correctly and save it</li>\
                <li>Click <a href="https://klvn.github.io/MediasiteDownloader/" target="_blank">here</a> for more detailed instructions</li>\
              </ul>\
            </div>\
          </div>\
        </div>');
  
        var allPresentations = playerOpts.d.Presentation.Streams;
        var videoAvailable = false;
        for (var i = 0; i < allPresentations.length; i++) {
          if (allPresentations[i].VideoUrls.length) {
            for (var j = 0; j < allPresentations[i].VideoUrls.length; j++) {
              if (allPresentations[i].VideoUrls[j].MimeType == "video/mp4") {
                videoAvailable = true;
                var thumbnail = window.location.origin + allPresentations[i].ThumbnailUrl;
                var videoUrl = allPresentations[i].VideoUrls[j].Location;
                document.getElementById("MSDLvideos").innerHTML += "<li><a href='" + videoUrl + "' target='_blank'><img class='MSDLthumbnail' src='" + thumbnail + "'></a></li>";
              }
            }
          }
        }
        if (playerOpts.d.Presentation.VodcastUrl != null) {
          videoAvailable = true;
          var thumbnail = window.location.origin + playerOpts.d.Presentation.ThumbnailUrl;
          var videoUrl = playerOpts.d.Presentation.VodcastUrl;
          document.getElementById("MSDLvideos").innerHTML += "<li>Vodcast:<br><a href='" + videoUrl + "' target='_blank'><img class='MSDLthumbnail' src='" + thumbnail + "'></a></li>";
        }
        if (!videoAvailable) document.getElementById("MSDLinfo").innerHTML = "<li>Sorry, no video(s) available.</li>";
      }
      MediasitePlayer.pause();
      location.href = "#open-modal";
    })
  }
})()