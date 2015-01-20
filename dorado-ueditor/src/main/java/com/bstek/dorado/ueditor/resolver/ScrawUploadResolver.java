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
public class ScrawUploadResolver extends AbstractUploadResolver {

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

		String param = request.getParameter("action");
		Uploader uploader = new Uploader(request, this.getDiskFileDownloadUrl());		
		uploader.setSavePath(this.getSavePath());
		uploader.setAllowFiles(this.getFileTypes());
		uploader.setMaxSize(this.getMaxUploadSize()); // 单位KB

		if (param != null && param.equals("tmpImg")) {
			uploader.upload();
			response.getWriter().print("<script>parent.ue_callback('" + uploader.getUrl() + "','" + uploader.getState() + "')</script>");
		} else {
			uploader.uploadBase64("content");
			response.getWriter().print("{'url':'" + uploader.getUrl() + "',state:'" + uploader.getState() + "'}");
		}
		return null;
	}
}
