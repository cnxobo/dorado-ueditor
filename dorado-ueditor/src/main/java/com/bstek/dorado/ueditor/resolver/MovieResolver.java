/**
 * 
 */
package com.bstek.dorado.ueditor.resolver;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLConnection;
import java.net.URLEncoder;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.web.servlet.ModelAndView;

import com.bstek.dorado.web.resolver.AbstractResolver;

/**
 * @author bean
 * 
 */
public class MovieResolver extends AbstractResolver {

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * com.bstek.dorado.web.resolver.WebContextSupportedController#doHandleRequest
	 * (javax.servlet.http.HttpServletRequest,
	 * javax.servlet.http.HttpServletResponse)
	 */
	@Override
	protected ModelAndView doHandleRequest(HttpServletRequest request,
			HttpServletResponse response) throws Exception {
		request.setCharacterEncoding("utf-8");
		response.setCharacterEncoding("utf-8");
		
		StringBuffer readOneLineBuff = new StringBuffer();
		String content = "";
		String searchkey = request.getParameter("searchKey");
		String videotype = request.getParameter("videoType");
		try {
			searchkey = URLEncoder.encode(searchkey, "utf-8");
			URL url = new URL("http://api.tudou.com/v3/gw?method=item.search&appKey=myKey&format=json&kw=" + searchkey + "&pageNo=1&pageSize=20&channelId=" + videotype + "&inDays=7&media=v&sort=s");
			URLConnection conn = url.openConnection();
			BufferedReader reader = new BufferedReader(new InputStreamReader(conn.getInputStream(), "utf-8"));
			String line = "";
			while ((line = reader.readLine()) != null) {
				readOneLineBuff.append(line);
			}
			content = readOneLineBuff.toString();
			reader.close();
		} catch (MalformedURLException e) {
			e.printStackTrace();
		} catch (IOException e2) {
			e2.printStackTrace();
		}
		response.getWriter().print(content);
		return null;
	}

}
