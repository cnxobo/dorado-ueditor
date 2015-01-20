/**
 * 
 */
package com.bstek.dorado.ueditor.resolver;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.web.servlet.ModelAndView;

import com.bstek.dorado.ueditor.Uploader;

/**
 * @author bean
 * 
 */
public class FileUploadResolver extends AbstractUploadResolver {

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * com.bstek.dorado.web.resolver.WebContextSupportedController#doHandleRequest
	 * (javax.servlet.http.HttpServletRequest,
	 * javax.servlet.http.HttpServletResponse)
	 */
	@Override
	protected ModelAndView doHandleRequest(HttpServletRequest request, HttpServletResponse response) throws Exception {
		request.setCharacterEncoding("utf-8");
		response.setCharacterEncoding("utf-8");
		response.setHeader("contentType", "application/json; charset=utf-8");
		
		
		Uploader uploader = new Uploader(request, this.getDiskFileDownloadUrl());
		uploader.setSavePath(this.getSavePath()); // 保存路径		
		uploader.setAllowFiles(this.getFileTypes());
		uploader.setMaxSize(this.getMaxUploadSize()); // 允许的文件最大尺寸，单位KB
		uploader.upload();
		
		response.getWriter().print("{'url':'" + uploader.getUrl() + "','fileType':'" + uploader.getType() + "','state':'" + uploader.getState() + "','original':'" + uploader.getOriginalName() + "'}");
		
		return null;
	}

}
