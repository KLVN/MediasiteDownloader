javascript:(function() {
    var page = window.location.href;
    if(new RegExp(".+Mediasite\/Play\/.+\?usehtml5=true", "i").test(page)) {
        var vidSource = (document.getElementById("MediaElement").children)[0].src;
        var a = document.createElement("a");
        a.href = vidSource;
        a.setAttribute("download", "");
        document.body.appendChild(a);
        a.click();
        a.remove();
    } else if(new RegExp(".+Mediasite\/Play\/.+", "i").test(page)) {
        alert("Redirecting to HTML5 website...\nClick again on Bookmarklet to download video.\n\nhttps://github.com/KLVN/MediasiteDownloader");
        location.href = page + "?usehtml5=true";
    }
})();
