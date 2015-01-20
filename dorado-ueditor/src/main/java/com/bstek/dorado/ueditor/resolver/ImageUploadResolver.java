/**
 * 
 */
package com.bstek.dorado.ueditor.resolver;

import java.util.Arrays;
import java.util.Iterator;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.web.servlet.ModelAndView;

import com.bstek.dorado.ueditor.Uploader;

/**
 * @author bean
 *
 */
public class ImageUploadResolver extends AbstractUploadResolver {

	/* (non-Javadoc)
	 * @see com.bstek.dorado.web.resolver.WebContextSupportedController#doHandleRequest(javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse)
	 */
	@Override
	protected ModelAndView doHandleRequest(HttpServletRequest request, HttpServletResponse response) throws Exception {
		request.setCharacterEncoding("utf-8");
		response.setCharacterEncoding("utf-8");
		response.setHeader("contentType", "application/json; charset=utf-8");
		
		List<String> savePath = Arrays.asList( this.getSavePath().split( "," ) );
		
		//获取存储目录结构
		if ( request.getParameter( "fetch" ) != null ) {

		    response.setHeader( "Content-Type", "text/javascript" );
		    //构造json数据
		    Iterator<String> iterator = savePath.iterator();

		    String dirs = "[";
		    int i = 0;
		    while ( iterator.hasNext() ) {
		    	iterator.next();
		        dirs += "'" + "dir_" + i +"'";
		        if ( iterator.hasNext() ) {
		            dirs += ",";
		        }
		        i++;
		    }
		    dirs += "]";
		    response.getWriter().print( "updateSavePath( "+ dirs +" );" );
		    return null;
		}
		
		Uploader uploader = new Uploader(request, this.getDiskFileDownloadUrl());
		// 获取前端提交的path路径
		String dir = request.getParameter( "dir" );
		//普通请求中拿不到参数， 则从上传表单中拿
		if ( dir == null ) {
			dir = uploader.getParameter("dir");
		}
		
		//没有选择目前的能力
		if ( true || dir == null || "".equals( dir ) ) {
		    //赋予默认值
		    dir = savePath.get(0);
		    //安全验证
		} 
//		else if ( !savePath.contains( dir ) ) {
//		    response.getWriter().print( "{'state':'\\u975e\\u6cd5\\u4e0a\\u4f20\\u76ee\\u5f55'}" );
//		    return null;
//		}
		
		uploader.setSavePath(dir);		
		uploader.setAllowFiles(this.getFileTypes());
		uploader.setMaxSize(this.getMaxUploadSize()); //单位KB
		uploader.upload();
		response.getWriter().print("{'original':'" + uploader.getOriginalName() + "','url':'" + uploader.getUrl() + "','title':'" + uploader.getTitle() + "','state':'" + uploader.getState() + "'}");
		
		return null;
	}

}
