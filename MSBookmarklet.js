javascript: (function () {
  $.ajax({
    url: window.location.origin + document.getElementById('ServicePath').innerHTML + '/GetPlayerOptions',
    type: 'POST',
    data: JSON.stringify({
      'getPlayerOptionsRequest': {
        'ResourceId': document.getElementById('ResourceId').innerHTML,
        'QueryString': '',
        'UseScreenReader': 'false',
        'UrlReferrer': ''
      }
    }),
    contentType: 'application/json; charset=utf-8',
    dataType: 'json',
    success: function (playerOpts) {
      $('head').append('<style type=\'text/css\'>\
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
        $('body').append(
          '<div id="open-modal" class="modal-window"> \
            <div>\
              <a href="#" title="Close" class="modal-close">Close</a>\
              <p style="font-size: 20px;">Lecture is currently not available on-demand and therefore cannot be downloaded.<br>Try again later.</p>\
            </div>\
          </div>');
      } else {
        $('body').append(
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
      Mediasite.Player.API.pause();
      location.href = "#open-modal";
    }
  })
})()