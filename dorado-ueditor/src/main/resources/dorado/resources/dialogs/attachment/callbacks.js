
function preLoad() {
    if (!this.support.loading) {
        alert(lang.flashVersionError);
        return false;
    }
    return true;
}
function loadFailed() {
    alert(lang.flashLoadingError);
}
function fileQueued(file) {
    try {
        var progress = new FileProgress(file, this.customSettings.progressTarget);
        progress.setStatus(lang.fileUploadReady);
        progress.toggleCancel(true, this, lang.delUploadQueue);
    }
    catch (ex) {
        this.debug(ex);
    }
}
function fileQueueError(file, errorCode, message) {
    try {
        if (errorCode === SWFUpload.QUEUE_ERROR.QUEUE_LIMIT_EXCEEDED) {
            alert(lang.limitPrompt1 + message + lang.limitPrompt2);
            return;
        }
        var progress = new FileProgress(file, this.customSettings.progressTarget);
        progress.setError();
        progress.toggleCancel(true, this, lang.delFailFile);
        switch (errorCode) {
          case SWFUpload.QUEUE_ERROR.FILE_EXCEEDS_SIZE_LIMIT:
            progress.setStatus(lang.fileSizeLimit);
            this.debug("Error Code: File too big, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
            break;
          case SWFUpload.QUEUE_ERROR.ZERO_BYTE_FILE:
            progress.setStatus(lang.emptyFile);
            this.debug("Error Code: Zero byte file, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
            break;
          case SWFUpload.QUEUE_ERROR.INVALID_FILETYPE:
            progress.setStatus(lang.fileTypeError);
            this.debug("Error Code: Invalid File Type, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
            break;
          default:
            if (file !== null) {
                progress.setStatus(lang.unknownError);
            }
            this.debug("Error Code: " + errorCode + ", File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
            break;
        }
    }
    catch (ex) {
        this.debug(ex);
    }
}
function uploadStart(file) {
    try {
        var progress = new FileProgress(file, this.customSettings.progressTarget);
        progress.setStatus(lang.fileUploading);
        progress.toggleCancel(true, this, lang.cancelUpload);
    }
    catch (ex) {
    }
    return true;
}
function uploadProgress(file, bytesLoaded, bytesTotal) {
    try {
        var percent = Math.ceil((bytesLoaded / bytesTotal) * 100);
        var progress = new FileProgress(file, this.customSettings.progressTarget);
        progress.setProgress(percent);
        progress.setStatus(lang.fileUploading);
    }
    catch (ex) {
        this.debug(ex);
    }
}
function uploadError(file, errorCode, message) {
    try {
        var progress = new FileProgress(file, this.customSettings.progressTarget);
        progress.setError();
        switch (errorCode) {
          case SWFUpload.UPLOAD_ERROR.HTTP_ERROR:
            progress.setStatus(lang.netError + message);
            this.debug("Error Code: HTTP Error, File name: " + file.name + ", Message: " + message);
            break;
          case SWFUpload.UPLOAD_ERROR.UPLOAD_FAILED:
            progress.setStatus(lang.failUpload);
            this.debug("Error Code: Upload Failed, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
            break;
          case SWFUpload.UPLOAD_ERROR.IO_ERROR:
            progress.setStatus(lang.serverIOError);
            this.debug("Error Code: IO Error, File name: " + file.name + ", Message: " + message);
            break;
          case SWFUpload.UPLOAD_ERROR.SECURITY_ERROR:
            progress.setStatus(lang.noAuthority);
            this.debug("Error Code: Security Error, File name: " + file.name + ", Message: " + message);
            break;
          case SWFUpload.UPLOAD_ERROR.UPLOAD_LIMIT_EXCEEDED:
            progress.setStatus(lang.fileNumLimit);
            this.debug("Error Code: Upload Limit Exceeded, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
            break;
          case SWFUpload.UPLOAD_ERROR.FILE_VALIDATION_FAILED:
            progress.setStatus(lang.failCheck);
            this.debug("Error Code: File Validation Failed, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
            break;
          case SWFUpload.UPLOAD_ERROR.FILE_CANCELLED:
            progress.setStatus(lang.fileCanceling);
            progress.setCancelled();
            break;
          case SWFUpload.UPLOAD_ERROR.UPLOAD_STOPPED:
            progress.setStatus(lang.stopUploading);
            break;
          default:
            progress.setStatus(lang.unknownError + errorCode);
            this.debug("Error Code: " + errorCode + ", File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
            break;
        }
    }
    catch (ex) {
        this.debug(ex);
    }
}
function uploadComplete(file) {
}
function queueComplete(numFilesUploaded) {
    var status = document.getElementById("divStatus");
    var num = status.innerHTML.match(/\d+/g);
    status.innerHTML = ((num && num[0] ? parseInt(num[0]) : 0) + numFilesUploaded) + lang.statusPrompt;
}

