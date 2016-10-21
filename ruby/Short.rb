require "socket"
require "uri"
require "json"
require "timeout"
require "digest"

Links = Hash.new

Struct.new("Response", :code, :status)

STATUS_CODES = {
	200 => "200 OK",
	301 => "301 Moved Permanently",
	400 => "400 Bad Request",
	403 => "403 Forbidden",
	404 => "404 Not Found",
	405 => "405 Method Not Allowed"
}

server = TCPServer.new('0.0.0.0', 2345)

def requestType(request_line)
	request_uri = request_line.split(" ")[0]
end

def getPath(request_line)
	request_uri = request_line.split(" ")[1]
	path = URI.unescape(URI(request_uri).path)
end

def sendRedirect(socket, url, response)
	socket.print "HTTP/1.1 "+getStatus(301)+"\r\n"+
				 "Location: "+url+"\r\n"+
				 "Content-Type: text/html\r\n"+
				 "Content-Length: #{response.bytesize}\r\n"+
				 "Connection: close\r\n"

	socket.print "\r\n"

	socket.close
end

def sendResponse(socket, response, code)
	socket.print "HTTP/1.1 "+code+"\r\n"+
				 "Content-Type: application/json\r\n"+
				 "Content-Length: #{response.bytesize}\r\n"+
				 "Connection: close\r\n"

	socket.print "\r\n"
	socket.print response

	socket.close
end

def getStatus(status)
	code = STATUS_CODES.fetch(status, "500 Internal Server Error")
end

def getLink(code)
	if code == ""
		return ""
	else
		puts code
		link = Links.fetch(code, "")
	end
end

def getData(str)
	hs = Hash.new
	str.split("\n").map do |s|
		b = s.split(": ")
		hs[b[0]] = b[1]
	end
end

def getCode(url)
	Links.each do |key, value|
		return key if value["url"] == url
	end
	t = Time.now.to_i.to_s
	x = Digest::MD5.hexdigest t
	code = x[-5..-1]
	Links[code] = {"url" => url}
	return code
end

loop do
	socket = server.accept
	request = socket.gets

	path = getPath(request)

	reqType = requestType(request)

	if path == "/generate"
		if reqType == "POST"
			lines = []
			begin
				st = timeout(1) {
					while line = socket.gets
						if line == nil
							puts "meme"
						elsif line == ""
							puts "lol"
							break
						else
							lines.insert(-1, line.to_s)
						end
					end
				}
			rescue => error
				begin
					if lines == nil
						puts "nil lines"
						sendResponse(socket, Struct::Response.new(500, "500 Internal Server Error").to_h.to_json, getStatus(500))
					else
						p = lines.join("").to_s
						if p == nil
							sendResponse(socket, Struct::Response.new(500, "500 Internal Server Error").to_h.to_json, getStatus(500))
						else
							p = "{"+p.split("{")[1]
							if p == nil
								sendResponse(socket, Struct::Response.new(400, "400 Bad Request").to_h.to_json, getStatus(400))
							else
								data = JSON.parse(p)
								if data
									if data["url"] == nil
										sendResponse(socket, Struct::Response.new(400, "400 Bad Request").to_h.to_json, getStatus(400))
									elsif data["url"] == ""
										sendResponse(socket, Struct::Response.new(400, "400 Bad Request").to_h.to_json, getStatus(400))
									else
										sendResponse(socket, Struct::Response.new(200, getCode(data["url"])).to_h.to_json, getStatus(200))
									end
								else
									sendResponse(socket, Struct::Response.new(400, "400 Bad Request").to_h.to_json, getStatus(400))
								end
							end
						end
					end
				rescue => error
					puts error.message
					puts error.backtrace
					sendResponse(socket, Struct::Response.new(500, "500 Internal Server Error").to_h.to_json, getStatus(500))
				end
			end
		else
			sendResponse(socket, Struct::Response.new(405, "405 Method Not Allowed").to_h.to_json, getStatus(405))
		end
	else
		path.sub! '/', ''
		link = getLink(path)
		if link == ""
			sendResponse(socket, Struct::Response.new(404, "404 Not Found").to_h.to_json, getStatus(404))
		else
			sendRedirect(socket, "#{link['url']}", "301 Moved Permanently")
		end
	end
end
