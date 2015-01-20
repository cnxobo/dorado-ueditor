package com.bstek.dorado.ueditor.resolver;

import java.io.File;
import java.io.FileInputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.springframework.util.FileCopyUtils;
import org.springframework.web.bind.ServletRequestUtils;
import org.springframework.web.servlet.ModelAndView;

import com.bstek.dorado.web.resolver.AbstractResolver;

public class FileDownloadResolver  extends AbstractResolver {
	private String savePath;
	
	private String getRealPath(HttpServletRequest request) {
		String dir;
		if (this.savePath.startsWith("file:")) {
			dir = savePath.substring(5);
		} else {
			String realPath = request.getSession().getServletContext().getRealPath("/");
			dir = new File(realPath) + File.separator + this.savePath + File.separator;
		}
		
		if (!dir.endsWith(File.separator)) {
			dir += File.separator;
		}
		
		return dir;
	}
	
	private String getFileName(String fileName) {
		if (fileName == null) return null;
		
		String result = fileName;
		
		if (fileName.indexOf("/") != -1) {
			result = fileName.substring(fileName.lastIndexOf("/"));
		}
		
		return result;
	}	
	
	@Override
	protected ModelAndView doHandleRequest(HttpServletRequest request, HttpServletResponse response) throws Exception {
		String fileName = ServletRequestUtils.getRequiredStringParameter(request, "file");
		
		if (this.savePath == null) throw new Exception("savePath is not allowed null."); 
		if (fileName == null || fileName.indexOf("..") != -1) throw new Exception("file Parameter is required, value is not allowed '..' in path");
		
		
        File file = new File(this.getRealPath(request) + fileName);
        
        response.setContentType("application/octet-stream");
        response.setContentLength((int) file.length());
        response.setHeader("Content-Disposition","attachment; filename=\"" + this.getFileName(file.getName()) +"\"");
        
        FileCopyUtils.copy(new FileInputStream(file), response.getOutputStream());
		
		return null;
	}

	public String getSavePath() {
		return savePath;
	}

	public void setSavePath(String savePath) {
		this.savePath = savePath;
	}
	
}
