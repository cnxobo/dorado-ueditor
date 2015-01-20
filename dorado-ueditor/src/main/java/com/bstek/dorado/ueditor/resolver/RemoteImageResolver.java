/**
 * 
 */
package com.bstek.dorado.ueditor.resolver;

import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Arrays;
import java.util.Date;
import java.util.Iterator;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.web.servlet.ModelAndView;

import com.bstek.dorado.web.resolver.AbstractResolver;

/**
 * @author frank.zhang
 * 
 */
public class RemoteImageResolver extends AbstractResolver {
	private String savePath = "ueditorupload/image";
	private String diskFileDownloadUrl = "/dorado/ueditor/remoteimagedownload";
	
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
	
	private String getUrl(HttpServletRequest request, String saveName) {
		if (this.savePath.startsWith("file:")) {
			return request.getContextPath() + this.diskFileDownloadUrl + "?file=" + saveName;
		} else {
			String dir = this.savePath;
			if (!dir.endsWith("/")) {
				dir += "/";
			}
			return request.getContextPath() + "/" + dir + saveName;
		}
	}
	
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
		
		response.setCharacterEncoding("utf-8");
		response.setHeader("contentType", "application/json; charset=utf-8");
		String url = request.getParameter("upfile");
		String state = "远程图片抓取成功！";
		
		String[] arr = url.split("ue_separate_ue");
		String[] outSrc = new String[arr.length];
		for (int i = 0; i < arr.length; i++) {
			// 保存文件路径			
			String savePath = getRealPath(request);
			// 格式验证
			String type = getFileType(arr[i]);
			if (type.equals("")) {
				state = "图片类型不正确！";
				continue;
			}
			String saveName = Long.toString(new Date().getTime()) + type;
			// 大小验证
			HttpURLConnection.setFollowRedirects(false);
			HttpURLConnection conn = (HttpURLConnection) new URL(arr[i]).openConnection();
			if (conn.getContentType().indexOf("image") == -1) {
				state = "请求地址头不正确";
				continue;
			}
			if (conn.getResponseCode() != 200) {
				state = "请求地址不存在！";
				continue;
			}
			File dir = new File(savePath);
			if (!dir.exists()) {
				dir.mkdirs();
			}
			File saveFile = new File(savePath + "/" + saveName);
			outSrc[i] = getUrl(request, saveName);
			try {
				InputStream is = conn.getInputStream();
				OutputStream os = new FileOutputStream(saveFile);
				int b;
				while ((b = is.read()) != -1) {
					os.write(b);
				}
				os.close();
				is.close();
				// 这里处理 inputStream
			} catch (Exception e) {
				e.printStackTrace();
				System.err.println("页面无法访问");
			}
		}
		String outstr = "";
		for (int i = 0; i < outSrc.length; i++) {
			outstr += outSrc[i] + "ue_separate_ue";
		}
		outstr = outstr.substring(0, outstr.lastIndexOf("ue_separate_ue"));
		response.getWriter().print("{'url':'" + outstr + "','tip':'" + state + "','srcUrl':'" + url + "'}");

		return null;
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

	public String getSavePath() {
		return savePath;
	}

	public void setSavePath(String savePath) {
		this.savePath = savePath;
	}

	public String getDiskFileDownloadUrl() {
		return diskFileDownloadUrl;
	}

	public void setDiskFileDownloadUrl(String diskFileDownloadUrl) {
		this.diskFileDownloadUrl = diskFileDownloadUrl;
	}		
	
}
