
(function () {
    editor.setOpt({videoFieldName:"upfile"});
    var video = {}, uploadVideoList = [], isModifyUploadVideo = false;
    window.onload = function () {
        $focus($G("videoUrl"));
        initTabs();
        initVideo();
        initUpload();
    };
    function initTabs() {
        var tabs = $G("tabHeads").children;
        for (var i = 0; i < tabs.length; i++) {
            domUtils.on(tabs[i], "click", function (e) {
                var target = e.target || e.srcElement;
                for (var j = 0; j < tabs.length; j++) {
                    if (tabs[j] == target) {
                        tabs[j].className = "focus";
                        $G(tabs[j].getAttribute("data-content-id")).style.display = "block";
                    } else {
                        tabs[j].className = "";
                        $G(tabs[j].getAttribute("data-content-id")).style.display = "none";
                    }
                }
            });
        }
    }
    function initVideo() {
        createAlignButton(["videoFloat", "upload_alignment"]);
        addUrlChangeListener($G("videoUrl"));
        addOkListener();
        (function () {
            var img = editor.selection.getRange().getClosedNode(), url;
            if (img && img.className) {
                var hasFakedClass = (img.className == "edui-faked-video"), hasUploadClass = img.className.indexOf("edui-upload-video") != -1;
                if (hasFakedClass || hasUploadClass) {
                    $G("videoUrl").value = url = img.getAttribute("_url");
                    $G("videoWidth").value = img.width;
                    $G("videoHeight").value = img.height;
                    var align = domUtils.getComputedStyle(img, "float"), parentAlign = domUtils.getComputedStyle(img.parentNode, "text-align");
                    updateAlignButton(parentAlign === "center" ? "center" : align);
                }
                if (hasUploadClass) {
                    isModifyUploadVideo = true;
                }
            }
            createPreviewVideo(url);
        })();
    }
    function addOkListener() {
        dialog.onok = function () {
            $G("preview").innerHTML = "";
            var currentTab = findFocus("tabHeads", "tabSrc");
            switch (currentTab) {
              case "video":
                return insertSingle();
                break;
              case "videoSearch":
                return insertSearch("searchList");
                break;
              case "upload":
                return insertUpload();
                break;
            }
        };
        dialog.oncancel = function () {
            $G("preview").innerHTML = "";
        };
    }
    function selectTxt(node) {
        if (node.select) {
            node.select();
        } else {
            var r = node.createTextRange && node.createTextRange();
            r.select();
        }
    }
    function updateAlignButton(align) {
        var aligns = $G("videoFloat").children;
        for (var i = 0, ci; ci = aligns[i++]; ) {
            if (ci.getAttribute("name") == align) {
                if (ci.className != "focus") {
                    ci.className = "focus";
                }
            } else {
                if (ci.className == "focus") {
                    ci.className = "";
                }
            }
        }
    }
    function insertSingle() {
        var width = $G("videoWidth"), height = $G("videoHeight"), url = $G("videoUrl").value, align = findFocus("videoFloat", "name");
        if (!url) {
            return false;
        }
        if (!checkNum([width, height])) {
            return false;
        }
        editor.execCommand("insertvideo", {url:convert_url(url), width:width.value, height:height.value, align:align}, isModifyUploadVideo ? "upload" : null);
    }
    function insertSearch(id) {
        var imgs = domUtils.getElementsByTagName($G(id), "img"), videoObjs = [];
        for (var i = 0, img; img = imgs[i++]; ) {
            if (img.getAttribute("selected")) {
                videoObjs.push({url:img.getAttribute("ue_video_url"), width:420, height:280, align:"none"});
            }
        }
        editor.execCommand("insertvideo", videoObjs);
    }
    function findFocus(id, returnProperty) {
        var tabs = $G(id).children, property;
        for (var i = 0, ci; ci = tabs[i++]; ) {
            if (ci.className == "focus") {
                property = ci.getAttribute(returnProperty);
                break;
            }
        }
        return property;
    }
    function convert_url(s) {
        return s.replace(/http:\/\/www\.tudou\.com\/programs\/view\/([\w\-]+)\/?/i, "http://www.tudou.com/v/$1").replace(/http:\/\/www\.youtube\.com\/watch\?v=([\w\-]+)/i, "http://www.youtube.com/v/$1").replace(/http:\/\/v\.youku\.com\/v_show\/id_([\w\-=]+)\.html/i, "http://player.youku.com/player.php/sid/$1").replace(/http:\/\/www\.56\.com\/u\d+\/v_([\w\-]+)\.html/i, "http://player.56.com/v_$1.swf").replace(/http:\/\/www.56.com\/w\d+\/play_album\-aid\-\d+_vid\-([^.]+)\.html/i, "http://player.56.com/v_$1.swf").replace(/http:\/\/v\.ku6\.com\/.+\/([^.]+)\.html/i, "http://player.ku6.com/refer/$1/v.swf");
    }
    function checkNum(nodes) {
        for (var i = 0, ci; ci = nodes[i++]; ) {
            var value = ci.value;
            if (!isNumber(value) && value) {
                alert(lang.numError);
                ci.value = "";
                ci.focus();
                return false;
            }
        }
        return true;
    }
    function isNumber(value) {
        return /(0|^[1-9]\d*$)/.test(value);
    }
    function createAlignButton(ids) {
        for (var i = 0, ci; ci = ids[i++]; ) {
            var floatContainer = $G(ci), nameMaps = {"none":lang["default"], "left":lang.floatLeft, "right":lang.floatRight, "center":lang.block};
            for (var j in nameMaps) {
                var div = document.createElement("div");
                div.setAttribute("name", j);
                if (j == "none") {
                    div.className = "focus";
                }
                div.style.cssText = "background:url(images/" + j + "_focus.jpg);";
                div.setAttribute("title", nameMaps[j]);
                floatContainer.appendChild(div);
            }
            switchSelect(ci);
        }
    }
    function switchSelect(selectParentId) {
        var selects = $G(selectParentId).children;
        for (var i = 0, ci; ci = selects[i++]; ) {
            domUtils.on(ci, "click", function () {
                for (var j = 0, cj; cj = selects[j++]; ) {
                    cj.className = "";
                    cj.removeAttribute && cj.removeAttribute("class");
                }
                this.className = "focus";
            });
        }
    }
    function addUrlChangeListener(url) {
        if (browser.ie) {
            url.onpropertychange = function () {
                createPreviewVideo(this.value);
            };
        } else {
            url.addEventListener("input", function () {
                createPreviewVideo(this.value);
            }, false);
        }
    }
    function createPreviewVideo(url) {
        if (!url) {
            return;
        }
        var matches = url.match(/youtu.be\/(\w+)$/) || url.match(/youtube\.com\/watch\?v=(\w+)/) || url.match(/youtube.com\/v\/(\w+)/), youku = url.match(/youku\.com\/v_show\/id_(\w+)/), youkuPlay = /player\.youku\.com/ig.test(url);
        if (!youkuPlay) {
            if (matches) {
                url = "https://www.youtube.com/v/" + matches[1] + "?version=3&feature=player_embedded";
            } else {
                if (youku) {
                    url = "http://player.youku.com/player.php/sid/" + youku[1] + "/v.swf";
                } else {
                    if (!endWith(url, [".swf", ".flv", ".wmv"])) {
                        $G("preview").innerHTML = lang.urlError;
                        return;
                    }
                }
            }
        } else {
            url = url.replace(/\?f=.*/, "");
        }
        $G("preview").innerHTML = "<embed type=\"application/x-shockwave-flash\" pluginspage=\"http://www.macromedia.com/go/getflashplayer\"" + " src=\"" + url + "\"" + " width=\"" + 420 + "\"" + " height=\"" + 280 + "\"" + " wmode=\"transparent\" play=\"true\" loop=\"false\" menu=\"false\" allowscriptaccess=\"never\" allowfullscreen=\"true\" ></embed>";
    }
    function endWith(str, endStrArr) {
        for (var i = 0, len = endStrArr.length; i < len; i++) {
            var tmp = endStrArr[i];
            if (str.length - tmp.length < 0) {
                return false;
            }
            if (str.substring(str.length - tmp.length) == tmp) {
                return true;
            }
        }
        return false;
    }
    function getMovie() {
        var keywordInput = $G("videoSearchTxt");
        if (!keywordInput.getAttribute("hasClick") || !keywordInput.value) {
            selectTxt(keywordInput);
            return;
        }
        $G("searchList").innerHTML = lang.loading;
        var keyword = keywordInput.value, type = $G("videoType").value, str = "";
        ajax.request(editor.options.getMovieUrl, {searchKey:keyword, videoType:type, onsuccess:function (xhr) {
            try {
                var info = eval("(" + xhr.responseText + ")");
            }
            catch (e) {
                return;
            }
            var videos = info.multiPageResult.results;
            var html = ["<table width='530'>"];
            for (var i = 0, ci; ci = videos[i++]; ) {
                html.push("<tr>" + "<td><img title='" + lang.clickToSelect + "' ue_video_url='" + ci.outerPlayerUrl + "' alt='" + ci.tags + "' width='106' height='80' src='" + ci.picUrl + "' /> </td>" + "<td>" + "<p><a target='_blank' title='" + lang.goToSource + "' href='" + ci.itemUrl + "'>" + ci.title.substr(0, 30) + "</a></p>" + "<p style='height: 62px;line-height: 20px' title='" + ci.description + "'> " + ci.description.substr(0, 95) + " </p>" + "</td>" + "</tr>");
            }
            html.push("</table>");
            $G("searchList").innerHTML = str = html.length == 2 ? lang.noVideo : html.join("");
            var imgs = domUtils.getElementsByTagName($G("searchList"), "img");
            if (!imgs) {
                return;
            }
            for (var i = 0, img; img = imgs[i++]; ) {
                domUtils.on(img, "click", function () {
                    changeSelected(this);
                });
            }
        }});
    }
    function changeSelected(o) {
        if (o.getAttribute("selected")) {
            o.removeAttribute("selected");
            o.style.cssText = "filter:alpha(Opacity=100);-moz-opacity:1;opacity: 1;border: 2px solid #fff";
        } else {
            o.setAttribute("selected", "true");
            o.style.cssText = "filter:alpha(Opacity=50);-moz-opacity:0.5;opacity: 0.5;border:2px solid blue;";
        }
    }
    function insertUpload() {
        var videoObjs = [], uploadDir = editor.options.videoPath, width = $G("upload_width").value || 420, height = $G("upload_height").value || 280, align = findFocus("upload_alignment", "name") || "none";
        for (var key in uploadVideoList) {
            var file = uploadVideoList[key];
            videoObjs.push({url:uploadDir + file.url, width:width, height:height, align:align});
        }
        editor.execCommand("insertvideo", videoObjs, "upload");
    }
    function initUpload() {
        var settings = {upload_url:editor.options.videoUrl, file_post_name:editor.options.videoFieldName, flash_url:"../../third-party/swfupload/swfupload.swf", flash9_url:"../../third-party/swfupload/swfupload_fp9.swf", post_params:{"PHPSESSID":"<?php echo session_id(); ?>", "fileNameFormat":editor.options.fileNameFormat}, file_size_limit:"100 MB", file_types:"*.*", file_types_description:"Video Files", file_upload_limit:100, file_queue_limit:10, custom_settings:{progressTarget:"fsUploadProgress", startUploadId:"startUpload"}, debug:false, button_image_url:"../../themes/default/images/filescan.png", button_width:"100", button_height:"25", button_placeholder_id:"spanButtonPlaceHolder", button_text:"<span class=\"theFont\">" + lang.browseFiles + "</span>", button_text_style:".theFont { font-size:14px;}", button_text_left_padding:10, button_text_top_padding:4, swfupload_preload_handler:preLoad, swfupload_load_failed_handler:loadFailed, file_queued_handler:fileQueued, file_queue_error_handler:fileQueueError, file_dialog_complete_handler:function (numFilesSelected, numFilesQueued) {
            var me = this;
            if (numFilesQueued > 0) {
                dialog.buttons[0].setDisabled(true);
                var start = $G(this.customSettings.startUploadId);
                start.style.display = "";
                start.onclick = function () {
                    me.startUpload();
                    start.style.display = "none";
                };
            }
        }, upload_start_handler:uploadStart, upload_progress_handler:uploadProgress, upload_error_handler:uploadError, upload_success_handler:function (file, serverData) {
            try {
                var info = eval("(" + serverData + ")");
            }
            catch (e) {
            }
            var progress = new FileProgress(file, this.customSettings.progressTarget);
            if (info.state == "SUCCESS") {
                progress.setComplete();
                progress.setStatus("<span style='color: #0b0;font-weight: bold'>" + lang.uploadSuccess + "</span>");
                uploadVideoList.push({url:info.url, type:info.fileType, original:info.original});
                progress.toggleCancel(true, this, lang.delSuccessFile);
            } else {
                progress.setError();
                progress.setStatus(info.state);
                progress.toggleCancel(true, this, lang.delFailSaveFile);
            }
        }, upload_complete_handler:uploadComplete, queue_complete_handler:function (numFilesUploaded) {
            dialog.buttons[0].setDisabled(false);
        }};
        var swfupload = new SWFUpload(settings);
    }
})();

