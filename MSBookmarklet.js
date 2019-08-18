javascript: (function () {
msbookmarklet = function() {
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
      .modal-window {position: fixed;\
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
        width: 400px;\
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
      </style>');

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
          '<div id="open-modal" class="modal-window"> \
          <div>\
            <a href="#" title="Close" class="modal-close">Close</a>\
            <ul style="list-style: inside;">\
              <li>Copy the title: <input type="text" onClick="this.select();" value="' + document.title + '"></li>\
              <li id="placeholder">\
              <li>Paste in to rename file correctly and save it</li>\
              <li>Click <a href="https://klvn.github.io/MediasiteDownloader/" target="_blank">here<a/> for more detailed instructions</li>\
            </ul>\
          </div>\
        </div>');

        var allMediaPresenter = playerOpts.d.Presentation.Streams[1].VideoUrls;
        for (var i = 0; i < allMediaPresenter.length; i++) {
          if (allMediaPresenter[i].MediaType == 'MP4') {
            var presenterMp4Url = allMediaPresenter[i].Location;
          }
        }

        if (playerOpts.d.Presentation.Streams[0].StreamType == 5) {
          var allMediaSlides = playerOpts.d.Presentation.Streams[0].VideoUrls;
          for (var i = 0; i < allMediaSlides.length; i++) {
            if (allMediaSlides[i].MediaType == 'MP4') {
              var slidesMp4Url = allMediaSlides[i].Location;
              $('#placeholder').replaceWith('<li>Right click on these links <a href=' + presenterMp4Url + ' target="_blank">[Presenter]</a> <a href=' + slidesMp4Url + ' target="_blank">[Slides]</a> and then "Save as..."</a></li>');
            }
          }
        } else {
          $('#placeholder').replaceWith('<li><a href=' + presenterMp4Url + ' target="_blank">Right click on this link and then "Save as..."</a></li>');
        }
      }
      location.href = "#open-modal";
    }
  })
}
if (!window.jQuery) {
  var script = document.createElement("script");
  script.onload = msbookmarklet;
  script.src = "//ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js";
  document.head.appendChild(script);
} else {
  msbookmarklet();
}
})()