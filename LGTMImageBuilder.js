/* MIT LICENCE */
LGTMImageBuilder = function(gifUrl, imgId) {

    "use strict";

    var imgEle = document.getElementById(imgId);
    var copyButton = document.createElement('input');
    copyButton.id = "" + imgId + "Button";
    copyButton.type = "button";
    copyButton.value = "LOADING...";
    copyButton.name = "lgtmCopyButton";
    copyButton.disabled = "FALSE";
    copyButton.style.position = "absolute";
    copyButton.style.top = "0px";
    copyButton.style.left = "0px";
    imgEle.after(copyButton);

    let canvas  = document.createElement('canvas');
    let context = canvas.getContext('2d');

    let gifEncoder, gifDecoder, delay, lgtmHeight;

    let fileReader = new FileReader();
    let imgurUrl   = "https://api.imgur.com/3/image";

    let resultUint8Array;
    let resultImageSrc;
    let resultUpload;
    let resultLink;

    let gifUrlToUint8Array = function(gifUrl) {
        return new Promise(function(resolve, reject){
            let xhr = new XMLHttpRequest();
            xhr.open('GET', gifUrl, true);
            xhr.responseType = 'arraybuffer';
            xhr.onload = function() {
                resultUint8Array = new Uint8Array(this.response);
                return resolve(resultUint8Array);
            };
            xhr.send();
        });
    };

    this.getResultUint8Array = function(){ return resultUint8Array };

    let uint8ArrayToBase64 = function(uint8Array){
        return new Promise(function(resolve, reject){
            gifDecoder = new GifReader(uint8Array);
            let imgCanvas  = document.createElement('canvas');
            let imgContext = imgCanvas.getContext('2d');

            let i;
            for (i = 0; i < gifDecoder.numFrames(); i++) {
                let frameInfo = gifDecoder.frameInfo(i);

                // 初回実行
                if(i == 0) {
                    delay = (frameInfo.delay || 0.5) * 10;
                    gifEncoder = new GIF({
                        worker: 5,
                        quality: 1,
                        width:   canvas.width = gifDecoder.width,
                        height:  canvas.height = gifDecoder.height,
                    });
                    lgtmHeight = (canvas.height / 2) + 15;
                }

                imgCanvas.width  = gifDecoder.width;
                imgCanvas.height = gifDecoder.height;

                let imgData = imgContext.createImageData(gifDecoder.width, gifDecoder.height);
                gifDecoder.decodeAndBlitFrameRGBA(i, imgData.data);
                imgContext.putImageData(imgData, 0, 0);

                context.drawImage(imgCanvas, 0, 0);
                context.font = "bold 30pt verdana";
                context.fillStyle = 'rgba(255,255,255)';
                context.fillText("LGTM", 40, lgtmHeight);
                // context.strokeStyle = 'black';
                // context.strokeText("LGTM", 41, lgtmHeight + 1);

                gifEncoder.addFrame(context, {copy: true, delay: delay});
            }

            gifEncoder.on('finished', function(blob) {
                fileReader.addEventListener("load", function () {
                    // base64
                    resultImageSrc = fileReader.result;
                    resolve(resultImageSrc);
                }, false);

                fileReader.readAsDataURL(blob);
            });

            gifEncoder.render();
        });
    };

    this.getResultImageSrc = function(){ return resultImageSrc };

    let uploadImage = function(imageSrc) {
        let data = new FormData();
        data.append('image', imageSrc.slice("data:image/gif;base64,".length));
        data.append('type', 'base64');
        data.append('album', '90fHzyu5ZWnlvI3');
        data.append('name', 'lgtm');
        data.append("description", "himakan.net");

        let config = {
            method: 'POST',
            headers: {
                Authorization: "Client-ID 38ae325f6afd775",//"Bearer 9e01198c056ec3a194e6fea5c913c106a456bcf0",
                Accept: 'application/json',
            },
            body: data,
            mimeType: 'multipart/form-data',
        };

        return fetch(imgurUrl, config).then(function(response){
            resultUpload = response.json();
            copyButton.value = "OK!";
            return resultUpload;
        });
    };

    this.getResultUpload = function(){ return resultUpload };

    let setCopyButton = function(json) {
        return new Promise(function (resolve, reject) {
            resultLink = json.data.link;
            copyButton.onclick = function copy() {
                var text = document.createElement("input");
                text.type = "text";
                document.body.append(text);
                text.value = "[![LGTM](" + resultLink + ")](" + gifUrl + ")";
                text.select();
                document.execCommand("Copy");
                text.remove();
            };
            copyButton.value = "COPY!!!";
            copyButton.disabled = "";
        });
    };

    Promise.resolve()
        .then(function(){ return gifUrlToUint8Array(gifUrl) })
        .then(function(uint8Array){ return uint8ArrayToBase64(uint8Array) })
        .then(function(imageSrc){ return uploadImage(imageSrc) })
        .then(function(response){ return setCopyButton(response) })
        .catch(function(){ copyButton.value = "FAILED...;<" });

    return this;

};
