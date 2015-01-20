package com.bstek.dorado.ueditor;

import com.bstek.dorado.annotation.ClientObject;
import com.bstek.dorado.annotation.ClientProperty;
import com.bstek.dorado.view.annotation.Widget;
import com.bstek.dorado.view.widget.form.AbstractDataEditor;

@Widget(name = "UEditor", category = "Advance",
		dependsPackage = "u-editor")
@ClientObject(prototype = "dorado.widget.UEditor",
		shortTypeName = "UEditor")
public class UEditor extends AbstractDataEditor {
	private String mode = "full";
	private String defaultFontFamily = "宋体";
	private String defaultFontSize = "16px";
	private String fileUploadURL = ">dorado/ueditor/fileupload";
	private String imageUploadURL = ">dorado/ueditor/imageupload";
	private String scrawUploadURL = ">dorado/ueditor/scrawupload";
	private String getRemoteImageUploadURL = ">dorado/ueditor/getremoteimage"; 
	private String imageManagerURL = ">dorado/ueditor/imagemanager";
	private ImageUploadMode imageUploadMode = ImageUploadMode.full;

	@ClientProperty(escapeValue = "宋体")
	public String getDefaultFontFamily() {
		return defaultFontFamily;
	}

	public void setDefaultFontFamily(String defaultFontFamily) {
		this.defaultFontFamily = defaultFontFamily;
	}

	@ClientProperty(escapeValue = "16px")
	public String getDefaultFontSize() {
		return defaultFontSize;
	}

	public void setDefaultFontSize(String defaultFontSize) {
		this.defaultFontSize = defaultFontSize;
	}

	@ClientProperty(escapeValue = "full")
	public String getMode() {
		return mode;
	}

	public void setMode(String mode) {
		this.mode = mode;
	}

	@ClientProperty(escapeValue = ">dorado/ueditor/fileupload")
	public String getFileUploadURL() {
		return fileUploadURL;
	}

	public void setFileUploadURL(String fileUploadURL) {
		this.fileUploadURL = fileUploadURL;
	}

	@ClientProperty(escapeValue = ">dorado/ueditor/imageupload")
	public String getImageUploadURL() {
		return imageUploadURL;
	}

	public void setImageUploadURL(String imageUploadURL) {
		this.imageUploadURL = imageUploadURL;
	}
	
	@ClientProperty(escapeValue = ">dorado/ueditor/scrawupload")
	public String getScrawUploadURL() {
		return scrawUploadURL;
	}

	public void setScrawUploadURL(String scrawUploadURL) {
		this.scrawUploadURL = scrawUploadURL;
	}
	
	@ClientProperty(escapeValue = ">dorado/ueditor/getremoteimage")
	public String getGetRemoteImageUploadURL() {
		return getRemoteImageUploadURL;
	}

	public void setGetRemoteImageUploadURL(String getRemoteImageUploadURL) {
		this.getRemoteImageUploadURL = getRemoteImageUploadURL;
	}
	
	@ClientProperty(escapeValue = ">dorado/ueditor/imagemanager")
	public String getImageManagerURL() {
		return imageManagerURL;
	}

	public void setImageManagerURL(String imageManagerURL) {
		this.imageManagerURL = imageManagerURL;
	}

	@ClientProperty(escapeValue = "full")
	public ImageUploadMode getImageUploadMode() {
		return imageUploadMode;
	}

	public void setImageUploadMode(ImageUploadMode imageUploadMode) {
		this.imageUploadMode = imageUploadMode;
	}

}