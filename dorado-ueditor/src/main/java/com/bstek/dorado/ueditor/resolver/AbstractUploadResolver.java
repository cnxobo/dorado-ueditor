package com.bstek.dorado.ueditor.resolver;

import com.bstek.dorado.web.resolver.AbstractResolver;

public abstract class AbstractUploadResolver extends AbstractResolver {
	private String allowedExtensions;
	private String savePath = "ueditorupload";
	private int maxUploadSize = 10240;
	private String diskFileDownloadUrl = "/dorado/ueditor/fileupload";
	
	public int getMaxUploadSize() {
		return maxUploadSize;
	}

	public void setMaxUploadSize(int maxUploadSize) {
		this.maxUploadSize = maxUploadSize;
	}
	
	public String getAllowedExtensions() {
		return allowedExtensions;
	}

	public void setAllowedExtensions(String allowedExtensions) {
		this.allowedExtensions = allowedExtensions;
	}
			
	public String getSavePath() {
		return savePath;
	}

	public void setSavePath(String saveFolderName) {
		this.savePath = saveFolderName;
	}
	
	protected String[] getFileTypes() {
		if (this.allowedExtensions != null) {
			return this.allowedExtensions.split("\\|");			
		}
		return new String[] { ".rar", ".doc", ".docx", ".zip", ".pdf", ".txt", ".swf", ".wmv", ".gif", ".png", ".jpg", ".jpeg", ".bmp" };
	}

	public String getDiskFileDownloadUrl() {
		return diskFileDownloadUrl;
	}

	public void setDiskFileDownloadUrl(String diskFileDownloadUrl) {
		this.diskFileDownloadUrl = diskFileDownloadUrl;
	}
		
}
