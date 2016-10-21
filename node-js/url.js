/*

Copyright Mackan <mackan@discorddungeons.me>

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.


*/

var bodyParser = require('body-parser'),
    app = require('express')(),
    http = require('http').Server(app),
    io = require('socket.io')(http),
    config = require("./config.js"),
    fs = require("fs");


var port = config.port;
var bID = 1000000;
var bURL = config.bURL;
var links = config.links;
var api = config.api;
var url = [
  {
    "link": "http://example.com",
    "code": "example",
    "id": 0,
    "created": 0
  }
];

function getOb(myArray, searchTerm, property){
  for(var i=0, len=myArray.length; i<len; i++){
      if(myArray[i][property]=== searchTerm) return i;
  }
  return -1;
}



function load(){
  fs.exists("./data/links.json", function(exists){
    if(!exists){
      save();
    }else{
      fs.readFile("./data/links.json", "utf8", function(err, data){
        if(err) throw err;
        url = JSON.parse(data);
      });
    }
  });
}

function save(){
  fs.exists("./data/", function(exists){
    if(!exists){ fs.mkdir("./data");}
  });

  fs.exists("./data/links.json", function(exists){
    if(!exists){
      fs.appendFile("./data/links.json", JSON.stringify(url), 'utf8', function(err){
        if(err) throw err;
        console.log("Saved links");
      });
    }else{
      fs.writeFile("./data/links.json", JSON.stringify(url), 'utf8', function(err){
        if(err) throw err;
        console.log("Saved links");
      });
    }
  });
}

function is_valid_url(url){
  return url.match(/^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,}))\.?)(?::\d{2,5})?(?:[/?#]\S*)?$/i);
}

function addClick(code){
  url[getOb(url, code, "code")]["clicks"]++;
  console.log(getOb(url, code, "code")["clicks"]);
  save();
}

function getCode(id){

  var code;
  var base = 36;

  if(links["type"] == "default"){
    return id.toString(36);
  }else if(links["type"] == "custom"){
    if(links.hasOwnProperty("base")){
      base = links["base"];
      if(base > 36){
        base = 36;
      }
      if(base < 2){
        base = 2;
      }
    }
    if(links.hasOwnProperty("prefix")){
      code = links["prefix"]+id.toString(base);
    }
    if(links.hasOwnProperty("suffix")){
      code += links["suffix"];
    }

    return code;
  }
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

app.get("/docs", function(req, res){
  res.sendFile(__dirname+"/web/docs/index.html");
});

app.get("/docs/", function(req, res){
  res.redirect("/docs");
});

app.get("/docs/:file", function(req, res){
  res.sendFile(__dirname+"/web/docs/"+req.params.file+".html");
});

app.get("/:code", function(req, res){
  if(getOb(url, req.params.code, "code") > -1){
      addClick(req.params.code);
      res.redirect(url[getOb(url, req.params.code, "code")]['link']);
    }else{
      res.redirect("./");
    }
});

app.get("/", function(req, res){
  res.sendFile(__dirname+"/web/index.html");
});

app.get("/js/:file", function(req, res){
  res.sendFile(__dirname+"/web/js/"+req.params.file);
});

app.get("/css/:file", function(req, res){
  res.sendFile(__dirname+"/web/css/"+req.params.file);
});



app.get("/api/", function(req, res){
  res.send("API Thing");
});

app.get("/api/:field/", function(req, res){
  if(api.get){
    res.send("Correct usage: /api/"+req.params.field+"/:code");
  }else{
    res.send("API Disabled");
  }
});

app.get("/api/:field/:code", function(req, res){
  if(api.get){
    switch(req.params.field){
      case "link":
        if(getOb(url, req.params.code, "code") > -1){
          var obj = {"status": 200, "link": url[getOb(url, req.params.code, "code")]["link"]};
          res.send(JSON.stringify(obj));
        }else{
          var obj = {"status": 1001, "error": "No such code!"};
          res.send(JSON.stringify(obj));
        }
        break;
      case "id":
        if(getOb(url, req.params.code, "code") > -1){
          var obj = {"status": 200, "id": url[getOb(url, req.params.code, "code")]["id"]};
          res.send(JSON.stringify(obj));
        }else{
          var obj = {"status": 1001, "error": "No such code!"};
          res.send(JSON.stringify(obj));
        }
        break;
      case "created":
        if(getOb(url, req.params.code, "code") > -1){
          var obj = {"status": 200, "created": url[getOb(url, req.params.code, "code")]["created"]};
          res.send(JSON.stringify(obj));
        }else{
          var obj = {"status": 1001, "error": "No such code!"};
          res.send(JSON.stringify(obj));
        }
        break;
      case "clicks":
        if(getOb(url, req.params.code, "code") > -1){
          var obj = {"status": 200, "clicks": url[getOb(url, req.params.code, "code")]["clicks"]};
          res.send(JSON.stringify(obj));
        }else{
          var obj = {"status": 1001, "error": "No such code!"};
          res.send(JSON.stringify(obj));
        }
        break;
      default:
        if(getOb(url, req.params.code, "code") > -1){
          res.send(url[getOb(url, req.params.code, "code")]);
        }else{
          var obj = {"status": 1001, "error": "No such code!"};
          res.send(JSON.stringify(obj));
        }
        break;
    }
  }else{
    var obj = {"status": 1004, "error": "API Disabled"};
    res.send(JSON.stringify(obj));
  }
});

app.post("/api/create/", function(req, res){
  if(api.post){
    if(req.body.hasOwnProperty("url")){
      if(is_valid_url(req.body.url)){
        if(getOb(url, req.body.url, "link") > -1){
          var obj = {"status": 200, "code": code, "link": bURL+"/"+url[getOb(url, req.body.url, "link")]["code"]}
          res.send(JSON.stringify(obj));
        }else{
          var id = bID+url.length+1;
          var code = getCode(id);
          var ob = {"link": req.body.url, "code": code, "id": id, "created": Date.now(), "clicks": 0};
          url.push(ob);
          var obj = {"status": 200, "code": code, "link": bURL+"/"+url[getOb(url, req.body.url, "link")]["code"]}
          res.send(JSON.stringify(obj));
          save();
        }
      }else{
        var obj = {"status": 1002, "error": "Invalid URL"};
        res.send(JSON.stringify(obj));
      }
    }else{
      var obj = {"status": 1003, "error": "No URL Specified"};
      res.send(JSON.stringify(obj));
    }
  }else{
    var obj = {"status": 1004, "error": "API Disabled"};
    res.send(JSON.stringify(obj));
  }
});

io.on("connection", function(socket){
  socket.on("short", function(link){
    if(is_valid_url(link)){
      if(getOb(url, link, "link") > -1){
        socket.emit("link", url[getOb(url, link, "link")], bURL);
      }else{
        var id = bID+url.length+1;
        var code = getCode(id);
        var ob = {"link": link, "code": code, "id": id, "created": Date.now(), "clicks": 0};
        url.push(ob);
        socket.emit("link", ob, bURL);
        save();
      }
      }else{
        socket.emit("linkFail");
      }
    });
});

http.listen(port, function(){
  load();
  console.log('listening on *:'+port);
});

var stdin = process.openStdin();

stdin.addListener("data", function(d) {
  var inp = d.toString().substring(0, d.length-1);
    args = inp.split(' ');
    if(args.length >= 3){
      args[2] = args[2].replace("\r", "");
    }
    if(args[0] == "delete"){
      switch(args[1]){
        case "code":
          if(args[2].length > 0){
            if(getOb(url, args[2], "code") > -1){
              url.splice(getOb(url, args[2], "code"), 1);
              console.log("Deleted link with code "+args[2]);
              save();
            }else{
              console.log("No such code!");
            }
          }else{
            console.log("Usage: delete code <code>");
          }
        break;
        case "url":
          if(args[2].length > 0){
            if(getOb(url, args[2], "link") > -1){
              url.splice(getOb(url, args[2], "link"), 1);
              console.log("Deleted link with URL "+args[2]);
              save();
            }else{
              console.log("No such URL!");
            }
          }else{
            console.log("Usage: delete url <url>");
          }
        break;
        default:
          console.log("Usage: delete <method> <param>");
      }
    }
});

process.on("uncaughtException", function(err){
  console.log("Error! \n"+err.stack);
});