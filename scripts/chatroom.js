var socketio;

url = "http://ec2-18-216-206-156.us-east-2.compute.amazonaws.com:3456";

mianPage = "http://ec2-18-216-206-156.us-east-2.compute.amazonaws.com/~sqilian/m6_group/welcome.html"
let messages = new Array();
let room_id = 0;
let sessionId = -1;
let user = "";
let message_id = 1;
let isOwner = false;

function init_groupChat(){
    $("#inputGroupContent2").hide();
    $("#inputGroupBtn2").hide();
    $("#remove-btn").hide();
    $("#ban-btn").hide();
    $("#cancel-btn").hide();
    var localUrl = location.search; 
    room_id = getUrlParam('roomId');
    sessionId = getUrlParam('sess');
    socketio = io.connect(url);
    $.post(url,
        {
            type:"user_status",
            sessionId:sessionId
        },
        function(data){
            if(data["success"]){
                user = data["username"];
                socketio.emit("join_room_request", {
                    user: user,
                    room_id: room_id
                });
            }
            else{
                alert("Invalid User Status. Please login again.");
                window.open(welcome.html)
            }
            
        }).fail(
            function(jqXHR, textStatus, errorThrown) {
                alert("error"+errorThrown);
             }
        );

    socketio.on("group_info",function(data) {
        if(data["success"] == true){
            if(user == data["rooms"]["owner"]){
                isOwner = true;
            }
            newMembers = data["rooms"]["members"];
            displayMembers(newMembers);

        }
        else{
            alert("Sorry, you've been banned from entering this room.");
            window.location.href = mianPage
        }
       

    });


    socketio.on("members_refresh",function(newMembers) {
        displayMembers(newMembers);
    });

    socketio.on("being_removed",function(data) {
        alert("You've been removed from the chatting room by the owner!")
        window.location.href = mianPage;
    });


    socketio.on("message_to_client",function(data) {
        if(message_id >5){
            $("#groupChattingMsgZone").empty();
            for(i=1;i<5;i++){
                messages[i] = messages[i+1];
                if(messages[i].type == 1){
                    myMessage(messages[i].user,messages[i].text,i); 
                }
                else{
                    showMessage(messages[i].user,messages[i].text,i);
                }
            }
            
            
            if(data["username"] == user||data["username"] == user+" (private message)"){
                messages[5] = {
                    text: data['message'],
                    user: data["username"],
                    type: 1
                }
                myMessage(data["username"],data['message'],5);  
            }
            else{
                messages[5] = {
                    text: data['message'],
                    user: data["username"],
                    type: 0
                }
                showMessage(data["username"],data['message'],5); 
            }
            message_id ++;


        }
        else{
            if(data["username"] == user||data["username"] == user+" (private message)"){
                myMessage(data["username"],data['message'],message_id);  
                message_id++;
                messages[message_id] = {
                    text: data['message'],
                    user: data["username"],
                    type: 1
                }
            }
            else{
                showMessage(data["username"],data['message'],message_id); 
                message_id++;
                messages[message_id] = {
                    text: data['message'],
                    user: data["username"],
                    type: 0
                }
            }
            
            
        }
       
     });

    
}

function init_individualChat(){

}

function showMessage(user,msg,MsgId){

    let  msgDiv = $("<div>", {id: "user"+MsgId, name: 'msg', class: "container"});

    msgDiv.css({top:100*(MsgId-1)+'px'});

    $("#groupChattingMsgZone").append(msgDiv)
 
    msgDiv.append("<img id=\"theImg\" class=\"img\" src=\"images/user-icon.png\" />")

    msgDiv.append("<p id=\"msg\"+MsgId>"+msg+"</p>")

    msgDiv.append("<span class=\"username-chat\">"+user+"</span>");

}


function myMessage(user,msg,MsgId){

    let  msgDiv = $("<div>", {id: "user"+MsgId, name: 'msg', class: "container"});

    $("#groupChattingMsgZone").append(msgDiv)

    msgDiv.css({top:100*(MsgId-1)+'px'});

    msgDiv.append("<img id=\"theImg\" class=\"right\" src=\"images/user-icon.png\" />")

    msgDiv.append("<p id=\"msg\"+MsgId>"+msg+"</p>")

    msgDiv.append("<span class=\"username-mychat\">"+user+"</span>");

}

function showMessage_individual(user,msg,MsgId){

    let  msgDiv = $("<div>", {id: "user"+MsgId, name: 'msg', class: "container"});

    $("#individualChattingZone").append(msgDiv)

    msgDiv.css({top:100*(MsgId-1)+'px'});

    msgDiv.append("<img id=\"theImg\" class=\"img\" src=\"images/user-icon.png\" />")

    msgDiv.append("<p id=\"msg\"+MsgId>"+msg+"</p>")

    msgDiv.append("<span class=\"username-chat\">"+user+"</span>");

}


function myMessage_individual(user,msg,MsgId){

    let  msgDiv = $("<div>", {id: "user"+MsgId, name: 'msg', class: "container"});

    $("#individualChattingZone").append(msgDiv)

    msgDiv.css({top:100*(MsgId-1)+'px'});

    msgDiv.append("<img id=\"theImg\" class=\"right\" src=\"images/user-icon.png\" />")

    msgDiv.append("<p id=\"msg\"+MsgId>"+msg+"</p>")

    msgDiv.append("<span class=\"username-mychat\">"+user+"</span>");

}

function getUrlParam(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); 
    var r = window.location.search.substr(1).match(reg);  
    if (r != null) return unescape(r[2]); return null; 
}

function displayMembers(newMembers){
    $("#groupChattingList").empty();
        $("#groupChattingList").append("<br>");
        for (i = 0; i < newMembers.length; i++) { 
            let userName = newMembers[i];
            const  userDiv = $("<div>", {id: "user"+i, name: 'user', class: "chat-member"});
            $("#groupChattingList").append(userDiv)
            

            $("#user"+i).append("<img id=\"theImg\" class=\"user-icon\" src=\"images/user-icon.png\" />")

            $("#user"+i).append("<p id=\"title\" class=\"user-name\">  "+userName+"</p><br><br>")

            $("#user"+i).click(function(){
                $("#inputGroupContent2").show();
                $("#inputGroupBtn2").show();
                $("#inputGroupBtn2").text("Send to "+userName);
                $("#inputGroupBtn2").click(function(){
                    socketio.emit("message_to_server_private", {
                        type:"private_msg",
                        room_id:room_id,
                        from:user,
                        to:userName,
                        message:$("#inputGroupContent2").val()
    
                    });
                });

                $("#cancel-btn").click(function(){
                    $("#inputGroupContent2").hide();
                    $("#inputGroupBtn2").hide();
                    $("#remove-btn").hide();
                    $("#ban-btn").hide();
                    $("#cancel-btn").hide();
                });
                if(isOwner){
                    $("#remove-btn").click(function(){
                        socketio.emit("remove_user", {
                            type:"remove_user",
                            user:userName,
                            room_id: room_id
                        });
                        alert("User "+userName+" has been removed from this room")
    
                        $("#inputGroupContent2").hide();
                        $("#inputGroupBtn2").hide();
                        $("#remove-btn").hide();
                        $("#ban-btn").hide();
                        $("#cancel-btn").hide();
                    })

                    $("#ban-btn").click(function(){
                        socketio.emit("ban_user", {
                            type:"ban_user",
                            user:userName,
                            room_id: room_id
                        });
                        alert("User "+userName+" has been banned from this room")
    
                        $("#inputGroupContent2").hide();
                        $("#inputGroupBtn2").hide();
                        $("#remove-btn").hide();
                        $("#ban-btn").hide();
                        $("#cancel-btn").hide();
                    })
                    $("#remove-btn").show();
                    $("#ban-btn").show();
                }
                $("#cancel-btn").show();
		    });
            $("#groupChattingList").append("<br><br>")
        
        }
}