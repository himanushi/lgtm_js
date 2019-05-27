var lgiftm = {};
( function(){

    "use strict";

    var giphyRoot = "https://api.giphy.com/v1/gifs/",

        apiKey = "XjzmnEJkbFnEcmdahDyu10jaC6T1Mw1r",

        apiUrl = "&api_key=",

        searchUrl = "search?q=",

        trendUrl = "trending?",

        limitUrl = "&limit=",

        offsetUrl = "&offset=",

        lgtmId = "#lgtm_images",

        offsetValue = 0,

        count = 0;

    lgiftm.setMoreGiphySearchImage = function(){
        this.setGiphySearchImage( $( "#word" ).val(),
            $( "#limit" ).val() +
            offsetUrl + offsetValue)
    };

    lgiftm.setGiphySearchImage = function( word, conditions ){

        var url = "";
        if ( $( "#trending" ).prop( "checked" ) ) {
            url = giphyRoot + trendUrl + apiUrl +
                apiKey + limitUrl + conditions;
        } else {
            url = giphyRoot + searchUrl + word + apiUrl +
                apiKey + limitUrl + conditions;
        }

        $.getJSON(

            url,

            function(data) {
                $.each(data.data, function( key, val ) {
                    var div = document.createElement("div");
                    div.style.position = "relative";
                    div.style.float    = "left";
                    var img = document.createElement("img");
                    img.id = "lgtm" + count;
                    img.src = val.images.fixed_width_small.url;
                    img.className = "copy";
                    img.addEventListener('click', function(event) {
                        new LGTMImageBuilder(val.images.fixed_width.url, event.target.id);
                    });
                    div.append(img);
                    $( lgtmId ).append(div);
                    count++;
                });
            }

        );

        offsetValue += parseInt( $( "#limit" ).val() );

    };

    lgiftm.clear = function(){
        $( "div" + lgtmId ).empty();
        offsetValue = 0;
    }
})();

( function(){

    "use strict";

    // 初期表示用
    lgiftm.setGiphySearchImage( "good", 10 );

    $( "#btn" ).click( function( e ) {

        // 表示初期化してから検索画像を表示しまっせ
        lgiftm.clear();
        lgiftm.setGiphySearchImage( $( "#word" ).val(), $( "#limit" ).val() );

    });

    $( "#more_btn" ).click( function( e ) {

        // 検索画像をもっと表示しまっせ
        lgiftm.setMoreGiphySearchImage();

    });

})();