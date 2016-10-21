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

var socket = io();

function $(id){
	return document.getElementById(id);
}

function hasClass(ele,cls){
    return ele.className.match(new RegExp('(\\s|^)'+cls+'(\\s|$)'));
}

function removeClass(ele,cls){
    if(hasClass(ele,cls)){
		var reg = new RegExp('(\\s|^)'+cls+'(\\s|$)');
		ele.className=ele.className.replace(reg,' ');
    }
}

function addClass(ele, cls){
	ele.className = ele.className+" "+cls;
}

function getName(){
	var n = Math.floor(Math.random() * (10000000 - 1000000 + 1)) + 1000000;
	name = n.toString(36);
}


$("url").addEventListener("keyup", function(e){
	if(e.keyCode == 13){
		socket.emit("short", $("url").value);
	}
});

$("btn").addEventListener("click", function(){
	socket.emit("short", $("url").value);
});

socket.on("link", function(obj, bURL){
	console.log(obj);
	removeClass($("alert"), "hidden");
	removeClass($("alert"), "alert-danger");
	addClass($("alert"), "alert-success");
	$("alert").innerHTML = "Success! <a href='"+bURL+"/"+obj['code']+"'>"+bURL+"/"+obj['code']+"</a>";
});

socket.on("linkFail", function(){
	removeClass($("alert"), "hidden");
	removeClass($("alert"), "alert-success");
	addClass($("alert"), "alert-danger");
	$("alert").innerHTML = "That doesn't look like a valid URL!";
});