// control blocks that are needed to show or hide in welcome page
const server_url = "http://ec2-18-216-206-156.us-east-2.compute.amazonaws.com:3456";
const chat_room_url = "http://ec2-18-216-206-156.us-east-2.compute.amazonaws.com/~sqilian/m6_group/chatroom_group.html";
const record_url = "http://ec2-18-216-206-156.us-east-2.compute.amazonaws.com/~sqilian/m6_group/chattingRecord.html";
mianPage = "http://ec2-18-216-206-156.us-east-2.compute.amazonaws.com/~sqilian/m6_group/welcome.html"
let sessionId =-1;
let username = "";

function welcome_init() {
    $("#room_pwd").hide();
    $("#options").hide();
    $("#create_div").hide();
    $("#find_div").hide();
    $("#room_list").hide();
}

function show_create_room_div() {
    $("#options").hide();
    $("#find_div").hide();
    $("#create_div").show();
    $("#room_list").hide();
}



// show current rooms list, combined with plot_room_list()
function show_room_list() {
    //const username_text = $("#find_div .user_name").val();

    // prevent the user name is null
    if (username == "") {
        alert("Please login first");
    } else {
        $("#options").hide();
        $("#create_div").hide();
        $("#find_div").hide();
        $("#room_list").show();
        $("#slogan").html("<p>Welcome on board, <b>" + username + "</b></p>");

        plot_room_list();
    }

}

function plot_room_list() {
    
    // $("body").append("<button id=\"login\" class=\"login-btn\">Login</button>");
    // $("body").append("<button id=\"create\" class=\"create-btn\">Create a chatroom</button>");

    $.post(server_url, { type: "room_list_request" },
        function (rooms) {
            for (i = 0; i < rooms.length; i++) {
                let room_id = rooms[i]["id"];
                let room_name = rooms[i]["name"];
                let room_owner = rooms[i]["owner"];
                const roomDiv = $("<div>", { id: "room" + room_id, name: 'room', class: "room-div" });
                $("#room_table").append(roomDiv)
                $("#room" + room_id).append("<hr />")
                $("#room" + room_id).append("<img id=\"theImg\" class=\"chatroom-icon\" src=\"images/chatroom-icon.png\" />")
                
                if (rooms[i].pwd_required) {
                    $("#room" + room_id).append("<p id=\"title\" class=\"chatroom-name\">  " + room_name + " (locked)</p>")
                    $("#room" + room_id).click(function (e) {
                        $("#room_pwd").show();
                        $("#room_pwd_cancel").click(function (e) {
                            $("#room_pwd").hide();
                        });
                        $("#join_locked_room").click(function (e) {
                            $.post(server_url, {
                                type: "room_join_validation",
                                roomId: room_id,
                                pwd: $("#roomPwd").val()
                            },
                            function (msg) {
                                if(msg.success){
                                    window.location.href = chat_room_url + "?roomId="+room_id+"&sess="+sessionId;
                                }
                                else{
                                    alert("Incorrect password!");
                                }
                                
                            }).fail(
                                function (jqXHR, textStatus, errorThrown) {
                                    alert("error:"+errorThrown);
                                }
                            );

                        })
                    })
                }
                else{
                    $("#room" + room_id).append("<p id=\"title\" class=\"chatroom-name\">  " + room_name + "</p>")
                    $("#room" + room_id).click(function (e) {
                        window.location.href = chat_room_url + "?roomId="+room_id+"&sess="+sessionId;
                    })
                }
                $("#room" + room_id).append("<p id=\"owner\" class=\"chatroom-owner\">  owner: " + room_owner + "</p>")
                
                
            }

            // when click on a room 
           

        }).fail(
            function (jqXHR, textStatus, errorThrown) {
                alert("roomListError: " + errorThrown);
            }
        );
    ;


    // sessionStorage.clear();
    // for (i = 1; i <= 10; i++) {
    //     sessionStorage.setItem('key' + i, 'room' + i);
    // }

    // for (i = 1; i <= sessionStorage.length; i++) {
    //     let value = sessionStorage.getItem('key' + i);
    //     $("#room_table").append("<hr>"
    //         + value
    //         + "</hr>")

    // }


}

function show_chat_space() {
    const room_name = $("#create_div .create_room_name").val();
    const pwd = $("#create_div .create_room_psw").val();
    const user_name_text = username;

    // prevent user_name and room_name is empty
    if (user_name_text == "") {
        alert("Please type in your room name");
        show_create_room_div();
    } else {
        let create_room_info = {
            type: "room_create_request",
            name: room_name,
            owner: user_name_text,
            pwd: pwd,
            pwd_required: false
        };
        
        // if there is pwd, it requires pwd
        if (pwd != "") {
            create_room_info["pwd_required"] = true;
        }
        // post a http request to server, ask it stores these values
        $.post(server_url, create_room_info,
            function (chat_room_url) {
                alert("You have successfully created a new room");
                // if successful, then directed to group chat html
                window.location.href = chat_room_url+"&sess="+sessionId;
            }).fail(
                function (jqXHR, textStatus, errorThrown) {
                    alert("error at passing info");
                }
            );
        ;
    }
}

function enter_room(room) {
    // alert("you click me");
    alert(room.target.id);
}



function home_init(){

    $("#cancel").hide();
    $("#login").hide();
    $("#logout").hide();
    $("#valInput").hide();
    $("#pwdComfirm").hide();
    $("#register").hide();
}



function show_login(){
    $("#login_home").hide();
    $("#register_home").hide();
    $("#valInput").show();
    $("#login").show();
    $("#cancel").show();
}

function show_register(){
    $("#login_home").hide();
    $("#register_home").hide();
    $("#valInput").show();
    $("#pwdComfirm").show();
    $("#register").show();
    $("#cancel").show();
}

function register(){
    const username_text = $("#username").val();
    const password_text = $("#password").val();
    const passwordComfirm_text = $("#password_comfirm").val();

    const usernameRegex = /^[\w_\.\-]+$/;
    const pwdRegex = /^[\w_\.\-]{6,}$/;
    if(username_text == ""||password_text == ""){
        alert("Please type in your username and password to register.");
    }
     else if(!usernameRegex.test(username_text)){
         alert("Please try a proper username without special characters.");
    }
    else if(!pwdRegex.test(password_text)){
        alert("Please try a proper password at least 6 characters long without special characters.");
    }
    else if(password_text != passwordComfirm_text){
        alert("Password does not match the confirm password");
    }
    else{
        $.post(server_url,
        {
            type:"register",
            username: username_text,
            password: password_text
        },
        function(data){
            if(data["success"]){
                sessionId = data["sessionId"];
                username = data["username"];
            }
            else{
                alert("Registion failed: " + data["msg"]);
            }
            recover_valInputs();
            show_room_list();
            $("#register_home").hide();
            $("#login_home").hide();
            $("#options").show();
        }).fail(
            function(jqXHR, textStatus, errorThrown) {
                recover_valInputs();
             }
        );
    }

    
}

function recover_valInputs(){
    $("#cancel").hide();
    $("#valInput").hide();
    $("#pwdComfirm").hide();
    $("#register").hide();
    $("#login").hide();
    $("#login_home").show();
    $("#register_home").show();
}


function login(){
    const username_text = $("#username").val();
    const password_text = $("#password").val();
    if(username_text == ""||password_text == ""){
        alert("Please type in your username and password to login.");
    }
    else{
        $.post(server_url,
        {
            type:"login",
            username: username_text,
            password: password_text
        },
        function(data){
            if(data["success"]){
                sessionId = data["sessionId"];
                username = data["username"];
                $("#options").show();
                recover_valInputs();
                show_room_list();
                $("#register_home").hide();
                $("#login_home").hide();
                $("#options").show();
                
            }
            else{
                alert(data["msg"]);
                window.location.href = mianPage;
            }
            
        }).fail(
            function(jqXHR, textStatus, errorThrown) {
                alert("error"+errorThrown);
                recover_valInputs();
             }
         );
    ;
    }
    
}

function logout(){
    $.post(server_url,
    {
        type: "logout",
        sessionId:sessionId
    },
    function(data){
        sessionId = -1;
        $("#logout").hide();
    }).fail(
        function(jqXHR, textStatus, errorThrown) {
            alert(errorThrown);
         }
     );
}




function getChattingRecords(){
    window.open(record_url + "?usr="+username);
}