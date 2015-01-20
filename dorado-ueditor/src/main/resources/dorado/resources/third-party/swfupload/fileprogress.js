
function FileProgress(file, targetID) {
    this.fileProgressID = file.id;
    this.opacity = 100;
    this.height = 0;
    this.fileProgressWrapper = document.getElementById(this.fileProgressID);
    if (!this.fileProgressWrapper) {
        this.fileProgressWrapper = document.createElement("div");
        this.fileProgressWrapper.className = "progressWrapper";
        this.fileProgressWrapper.id = this.fileProgressID;
        this.fileProgressElement = document.createElement("div");
        this.fileProgressElement.className = "progressContainer";
        var progressCancel = document.createElement("a");
        progressCancel.className = "progressCancel";
        progressCancel.href = "#";
        progressCancel.style.visibility = "hidden";
        progressCancel.appendChild(document.createTextNode(" "));
        progressCancel.onclick = function () {
            alert(1);
        };
        var progressText = document.createElement("div");
        progressText.className = "progressName";
        progressText.appendChild(document.createTextNode(file.name));
        var progressBar = document.createElement("div");
        progressBar.className = "progressBarInProgress";
        var progressStatus = document.createElement("div");
        progressStatus.className = "progressBarStatus";
        progressStatus.innerHTML = "&nbsp;";
        this.fileProgressElement.appendChild(progressCancel);
        this.fileProgressElement.appendChild(progressText);
        this.fileProgressElement.appendChild(progressStatus);
        this.fileProgressElement.appendChild(progressBar);
        this.fileProgressWrapper.appendChild(this.fileProgressElement);
        document.getElementById(targetID).appendChild(this.fileProgressWrapper);
    } else {
        this.fileProgressElement = this.fileProgressWrapper.firstChild;
        this.reset();
    }
    this.height = this.fileProgressWrapper.offsetHeight;
    this.setTimer(null);
}
FileProgress.prototype.setTimer = function (timer) {
    this.fileProgressElement["FP_TIMER"] = timer;
};
FileProgress.prototype.getTimer = function (timer) {
    return this.fileProgressElement["FP_TIMER"] || null;
};
FileProgress.prototype.reset = function () {
    this.fileProgressElement.className = "progressContainer";
    this.fileProgressElement.childNodes[2].innerHTML = "&nbsp;";
    this.fileProgressElement.childNodes[2].className = "progressBarStatus";
    this.fileProgressElement.childNodes[3].className = "progressBarInProgress";
    this.fileProgressElement.childNodes[3].style.width = "0%";
    this.appear();
};
FileProgress.prototype.setProgress = function (percentage) {
    this.fileProgressElement.className = "progressContainer green";
    this.fileProgressElement.childNodes[3].className = "progressBarInProgress";
    this.fileProgressElement.childNodes[3].style.width = percentage + "%";
    this.appear();
};
FileProgress.prototype.setComplete = function () {
    this.fileProgressElement.className = "progressContainer blue";
    this.fileProgressElement.childNodes[3].className = "progressBarComplete";
    this.fileProgressElement.childNodes[3].style.width = "";
    var oSelf = this;
    this.setTimer(setTimeout(function () {
    }, 10000));
};
FileProgress.prototype.setError = function () {
    this.fileProgressElement.className = "progressContainer red";
    this.fileProgressElement.childNodes[3].className = "progressBarError";
    this.fileProgressElement.childNodes[3].style.width = "";
    var oSelf = this;
    this.setTimer(setTimeout(function () {
    }, 3000));
};
FileProgress.prototype.setCancelled = function () {
    this.fileProgressElement.className = "progressContainer";
    this.fileProgressElement.childNodes[3].className = "progressBarError";
    this.fileProgressElement.childNodes[3].style.width = "";
    var oSelf = this;
    this.setTimer(setTimeout(function () {
        oSelf.disappear();
    }, 1000));
};
FileProgress.prototype.setStatus = function (status) {
    this.fileProgressElement.childNodes[2].innerHTML = status;
};
FileProgress.prototype.toggleCancel = function (show, swfUploadInstance, message) {
    var cancelBtn = this.fileProgressElement.childNodes[0];
    cancelBtn.style.visibility = show ? "visible" : "hidden";
    cancelBtn.title = message ? message : "\u53d6\u6d88\u4e0a\u4f20";
    if (swfUploadInstance) {
        var me = this;
        var fileID = me.fileProgressID, e = me.fileProgressElement;
        e.children[0].onclick = function () {
            me.disappear();
            swfUploadInstance.cancelUpload(fileID);
            return false;
        };
    }
};
FileProgress.prototype.appear = function () {
    if (this.getTimer() !== null) {
        clearTimeout(this.getTimer());
        this.setTimer(null);
    }
    if (this.fileProgressWrapper.filters) {
        try {
            this.fileProgressWrapper.filters.item("DXImageTransform.Microsoft.Alpha").opacity = 100;
        }
        catch (e) {
            this.fileProgressWrapper.style.filter = "progid:DXImageTransform.Microsoft.Alpha(opacity=100)";
        }
    } else {
        this.fileProgressWrapper.style.opacity = 1;
    }
    this.fileProgressWrapper.style.height = "";
    this.height = this.fileProgressWrapper.offsetHeight;
    this.opacity = 100;
    this.fileProgressWrapper.style.display = "";
};
FileProgress.prototype.disappear = function () {
    var reduceOpacityBy = 15;
    var reduceHeightBy = 4;
    var rate = 30;
    if (this.opacity > 0) {
        this.opacity -= reduceOpacityBy;
        if (this.opacity < 0) {
            this.opacity = 0;
        }
        if (this.fileProgressWrapper.filters) {
            try {
                this.fileProgressWrapper.filters.item("DXImageTransform.Microsoft.Alpha").opacity = this.opacity;
            }
            catch (e) {
                this.fileProgressWrapper.style.filter = "progid:DXImageTransform.Microsoft.Alpha(opacity=" + this.opacity + ")";
            }
        } else {
            this.fileProgressWrapper.style.opacity = this.opacity / 100;
        }
    }
    if (this.height > 0) {
        this.height -= reduceHeightBy;
        if (this.height < 0) {
            this.height = 0;
        }
        this.fileProgressWrapper.style.height = this.height + "px";
    }
    if (this.height > 0 || this.opacity > 0) {
        var oSelf = this;
        this.setTimer(setTimeout(function () {
            oSelf.disappear();
        }, rate));
    } else {
        this.fileProgressWrapper.style.display = "none";
        this.setTimer(null);
    }
};

