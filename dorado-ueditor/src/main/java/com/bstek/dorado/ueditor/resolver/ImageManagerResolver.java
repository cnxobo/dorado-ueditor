package com.bstek.dorado.ueditor.resolver;

import java.io.File;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Iterator;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.web.servlet.ModelAndView;

import com.bstek.dorado.web.resolver.AbstractResolver;

public class ImageManagerResolver extends AbstractResolver{
	private String imagePath = "ueditorupload/image";	
	private String diskFileDownloadUrl = "/dorado/ueditor/imagedownload";
	
	public String getImagePath() {
		return imagePath;
	}

	public void setImagePath(String imagePath) {
		this.imagePath = imagePath;
	}		

	public String getDiskFileDownloadUrl() {
		return diskFileDownloadUrl;
	}

	public void setDiskFileDownloadUrl(String diskFileDownloadUrl) {
		this.diskFileDownloadUrl = diskFileDownloadUrl;
	}

	public List<File> getFiles(String realpath, List<File> files) {

		File realFile = new File(realpath);
		if (realFile.isDirectory()) {
			File[] subfiles = realFile.listFiles();
			for (File file : subfiles) {
				if (file.isDirectory()) {
					getFiles(file.getAbsolutePath(), files);
				} else {
					if (!getFileType(file.getName()).equals("")) {
						files.add(file);
					}
				}
			}
		}
		return files;
	}

	public String getRealPath(HttpServletRequest request) {				
		String dir;
		if (this.imagePath.startsWith("file:")) {
			dir = imagePath.substring(5);
		} else {
			String realPath = request.getSession().getServletContext().getRealPath("/");
			dir = new File(realPath) + File.separator + this.imagePath + File.separator;
		}
		
		if (!dir.endsWith(File.separator)) {
			dir += File.separator;
		}
		
		return dir;
	}

	public String getFileType(String fileName) {
		String[] fileType = { ".gif", ".png", ".jpg", ".jpeg", ".bmp" };
		Iterator<String> type = Arrays.asList(fileType).iterator();
		while (type.hasNext()) {
			String t = type.next();
			if (fileName.endsWith(t)) {
				return t;
			}
		}
		return "";
	}
	
	@Override
	protected ModelAndView doHandleRequest(HttpServletRequest request, HttpServletResponse response) throws Exception {
		//仅做示例用，请自行修改
		String imgStr = "";
		
		String realpath = getRealPath(request);
		
		List<File> files = getFiles(realpath, new ArrayList<File>());
		
		String imgPrefix;
		
		if (this.imagePath.startsWith("file:")) {
			imgPrefix = request.getContextPath() + this.diskFileDownloadUrl + "?file=";
		} else {
			imgPrefix = request.getContextPath() + "/" + this.imagePath;
			if (!imgPrefix.endsWith("/")) {
				imgPrefix += "/";
			}
		}
		
		String realPath = getRealPath(request);
		
		for (File file : files) {
			imgStr += imgPrefix + file.getPath().replace(realPath, "") + "ue_separate_ue";
		}
		
		if (imgStr != "") {
			imgStr = imgStr.substring(0, imgStr.lastIndexOf("ue_separate_ue")).replace(File.separator, "/").trim();
		}
		
		response.getWriter().print(imgStr);
		
		return null;
	}

}
