const chat_room_url = "http://ec2-18-216-206-156.us-east-2.compute.amazonaws.com/~sqilian/m6_group/chatroom_group.html";

// Require the packages we will use:
var http = require("http"),
	socketio = require("socket.io"),
	crypto = require('crypto');
	mysql = require('mysql');
	qs = require('querystring');

let rooms = new Array();
let members_socket_ids = new Array();
let sessions = new Array();
let sessionId = 0;
let roomId = 2;
let pwds = new Array();
let banedList = new Array();


rooms[0] = {
	type: "room_create_request",
	id: 0,
	name: "testRoom1",
	owner: "Amon",
	pwd_required: false,
	members: ["Amon", "zeratul", "Raynor", "Tychus"]
}
pwds[0] = "";
banedList[0] = new Array();

rooms[1] = {
	type: "room_create_request",
	id: 1,
	name: "testRoom2",
	owner: "Raynor",
	pwd_required: false,
	members: ["Raynor", "Tychus"]
}
pwds[1] = "";
banedList[1] = ["lsq"];

rooms[2] = {
	type: "room_create_request",
	id: 2,
	name: "testRoom3",
	owner: "zeratul",
	pwd_required: true,
	members: ["zeratul"]
}
pwds[2] = "222";
banedList[2] = new Array();



var con = mysql.createConnection({
	host: "localhost",
	user: "m6_admin",
	password: "m6_pass",
	database: "m6"
});
con.connect();




// Listen for HTTP connections. 
var app = http.createServer(function (req, resp) {
	// This callback runs when a new connection is made to our HTTP server.

	if (req.method === 'POST') {
		let body = '', req_type = '';

		req.on('data', data => {
			body += data.toString();
			req_type += qs.parse(body).type;
		});
		req.on('end', () => {
			console.log(req_type);
			// if login request come in
			if (req_type == 'login'){
					validateUser(qs.parse(body)["username"],qs.parse(body)["password"],function(result){
						resp.writeHead(200, { 'Content-Type': 'application/json', "Access-Control-Allow-Origin": "*" });
						console.log(result);
						if(result == true){
							sessionId = genRandomString(8);
							while(typeof(sessions[sessionId]) != 'undefined')
							{
								sessionId = genRandomString(8);
							}
							sessions[sessionId] =  qs.parse(body)["username"];
							console.log("session"+sessionId+"user"+qs.parse(body)["username"]);
							resp.write(JSON.stringify({
								success:true,
								sessionId :sessionId,
								username:qs.parse(body)["username"]
							}));
							
						}
						else{
							resp.write(JSON.stringify({
								success:false,
								msg:"Login failed. Wrong username or password."
							}));
							
						}
						resp.end();
					});
					
				 
			}
			else if (req_type == 'register'){
					newUserInsert(qs.parse(body)["username"],qs.parse(body)["password"],function(result){
						resp.writeHead(200, { 'Content-Type': 'application/json', "Access-Control-Allow-Origin": "*" });
						if(result["success"]){
							sessionId = genRandomString(8);
							while(typeof(sessions[sessionId]) != 'undefined')
							{
								sessionId = genRandomString(8);
							}
							sessions[sessionId] =  qs.parse(body)["username"];
							console.log("session"+sessionId+"user"+qs.parse(body)["username"]);
							resp.write(JSON.stringify({
								success:true,
								sessionId :sessionId,
								username:qs.parse(body)["username"]
							}))
							console.log("succeeded, "+result.message);
						}
						else{
							resp.write(JSON.stringify({
								success:false,
								msg:result.message
							}));
							console.log("failed, "+result.message);
						}
						resp.end();
				 });
				
			}
			else if (req_type == 'user_status'){
				resp.writeHead(200, { 'Content-Type': 'application/json', "Access-Control-Allow-Origin": "*" });
				console.log(qs.parse(body)["sessionId"]);
				console.log(sessions[qs.parse(body)["sessionId"]]);
				if(typeof(sessions[qs.parse(body)["sessionId"]]) == 'undefined'){
					resp.write(JSON.stringify({
						success:false
					}))
				}
				else{
					resp.write(JSON.stringify({
						success:true,
						username:sessions[qs.parse(body)["sessionId"]]
					}))
				}
				resp.end();
			
			}

			else if (req_type == 'logout'){
				sessions[qs.parse(body)["username"]] =  "";
			}

			else if (req_type == 'room_join_validation'){
				resp.writeHead(200, { 'Content-Type': 'application/json', "Access-Control-Allow-Origin": "*" });
				if(pwds[qs.parse(body)["roomId"]] == qs.parse(body)["pwd"]){
					console.log("validation success");
					resp.write(JSON.stringify({
						success:true
					}))
				}
				else{
					console.log("validation failed");
					resp.write(JSON.stringify({
						success:false
					}))
				}
				resp.end();
			}
			
			else if (req_type == 'room_create_request') {
				console.log("creating room request received ");
				var room_info = qs.parse(body);
				room_info.id = ++roomId;
				banedList[roomId] = new Array();
				room_info["members"] = [room_info.owner];
				if(room_info.pwd == "") room_info.pwd_required = false;
				pwds[roomId] = room_info.pwd;
				delete room_info.pwd;
				rooms.push(room_info)
				resp.writeHead(200, { 'Content-Type': 'application/json', "Access-Control-Allow-Origin": "*" });
				
				resp.write(JSON.stringify(chat_room_url + "?roomId="+roomId));
				resp.end();
			}

			else if (req_type == "room_list_request") {
				console.log("listing room request received ");

				resp.writeHead(200, { 'Content-Type': 'application/json', "Access-Control-Allow-Origin": "*" });

				resp.write(JSON.stringify(rooms));
				
				resp.end();
			}

			else if (req_type == "get_record") {
				console.log("record request received "+qs.parse(body)["username"]);

				resp.writeHead(200, { 'Content-Type': 'application/json', "Access-Control-Allow-Origin": "*" });

				con.query("SELECT * FROM records WHERE members LIKE '%*" + qs.parse(body)["username"] + "*%'", function (err, result, fields) {

					
					resp.write(JSON.stringify({
						success: true,
						records: result
					}));
					resp.end();
					
					if (err) throw err;
			
				});

				
				
				
			}

			


		});

	}
});
app.listen(3456);
console.log("listening on port 3456, chatting room");


// Do the Socket.IO magic:
var io = socketio.listen(app);
io.sockets.on("connection", function (socket) {
	// This callback runs when a new Socket.IO connection is established.

	socket.on('join_room_request', function (data) {
		const room_id = data["room_id"];

		if(banedList[room_id].includes(data["user"])){
			io.to(socket.id).emit("group_info", {
				success: false,
				msg: "Sorry, you have been banned from entering this room"
			});
			return;
		}
		else{
			io.to(socket.id).emit("group_info", {
				success: true,
				rooms:rooms[room_id]
			});
		}

		

		if(typeof(rooms[room_id])=='undefined'){
			console.log("invalid room request");
			return;
		}
		if(!rooms[room_id]["members"].includes(data["user"])){
			rooms[room_id]["members"].push(data["user"]);
		}
		if (typeof (members_socket_ids[room_id]) == 'undefined') {
			members_socket_ids[room_id] = new Array();
			members_socket_ids[room_id][data["user"]] = socket.id;
			
			console.log("room joined:*" + data["user"] +"*"+ room_id+socket.id);
		}
		else {
			members_socket_ids[room_id][data["user"]] = socket.id;
			console.log("room joined:*" + data["user"] +"*"+ room_id+socket.id);
		}


		for (var i in members_socket_ids[data["room_id"]]) {
			io.to(members_socket_ids[data["room_id"]][i]).emit("members_refresh", rooms[room_id]["members"]);
		}
	});

	socket.on("remove_user", function (data) {
		var index = rooms[data["room_id"]]["members"].indexOf(data["user"]);
		if (index !== -1) rooms[data["room_id"]]["members"].splice(index, 1);
		io.to(members_socket_ids[data["room_id"]][data["user"]]).emit("being_removed",data["room_id"])
		for (var i in members_socket_ids[data["room_id"]]) {
			io.to(members_socket_ids[data["room_id"]][i]).emit("members_refresh", rooms[data["room_id"]]["members"]);
		}
	})

	socket.on("ban_user", function (data) {
		var index = rooms[data["room_id"]]["members"].indexOf(data["user"]);
		if (index !== -1) rooms[data["room_id"]]["members"].splice(index, 1);
		io.to(members_socket_ids[data["room_id"]][data["user"]]).emit("being_removed",data["room_id"])
		for (var i in members_socket_ids[data["room_id"]]) {
			io.to(members_socket_ids[data["room_id"]][i]).emit("members_refresh", rooms[data["room_id"]]["members"]);
		}

		banedList[data["room_id"]].push(data["user"]);
	})

	socket.on("message_to_server_private", function (data) {
		if(typeof(members_socket_ids[data["room_id"]][data["to"]])!='undefined'){
			io.to(members_socket_ids[data["room_id"]][data["to"]]).emit("message_to_client", {
				username: data["from"]+" (private to you)",
				message: data["message"]
			})
		}

		if(typeof(members_socket_ids[data["room_id"]][data["from"]])!='undefined'){
			io.to(members_socket_ids[data["room_id"]][data["from"]]).emit("message_to_client", {
				username: data["from"]+" (private message)",
				message: data["message"]
			})
		}
		var msg_time = new Date();

		msg_time.setHours((msg_time.getHours() - 5));
		msg_time = msg_time.toISOString().slice(0, 19).replace('T', ' ');
		var sql = "INSERT INTO records (title, speaker, msg, msg_time, members) VALUES ('private message', '" + data["from"] + "', '" + data["message"] + "', '" + msg_time + "', '*" + data["to"]+ "*')";
		con.query(sql, function (err, result) {
			if (err) throw err;
		});

	});

	socket.on('message_to_server', function (data) {
		// This callback runs when the server receives a new message from the client.
		for (var i in members_socket_ids[data["room_id"]]) {
			console.log("room:" + data["room_id"]);
			console.log(members_socket_ids[data["room_id"]].length + "message: " + members_socket_ids[data["room_id"]][i]); // log it to the Node.JS output
			io.to(members_socket_ids[data["room_id"]][i]).emit("message_to_client", {
				username: data["username"],
				message: data["message"]
			}) // send the message to other users in the room
		}
		var memberList = "*";
		var msg_time = new Date();

		msg_time.setHours((msg_time.getHours() - 5));
		msg_time = msg_time.toISOString().slice(0, 19).replace('T', ' ');
		for (var i in rooms[data["room_id"]]["members"]) {
			memberList += rooms[data["room_id"]]["members"][i] + "*";
		}

		var sql = "INSERT INTO records (title, speaker, msg, msg_time, members) VALUES ('" + rooms[data["room_id"]]["name"] + "', '" + data["username"] + "', '" + data["message"] + "', '" + msg_time + "', '" + memberList + "')";
		con.query(sql, function (err, result) {
			if (err) throw err;
		});


	});
});


var genRandomString = function (length) {
	return crypto.randomBytes(Math.ceil(length / 2))
		.toString('hex') /** convert to hexadecimal format */
		.slice(0, length);   /** return required number of characters */
};



/**
 * hash password with sha512.
 * @function
 * @param {string} password - List of required fields.
 * @param {string} salt - Data to be validated.
 */
var sha512 = function (password, salt) {
	var hash = crypto.createHmac('sha512', salt); /** Hashing algorithm sha512 */
	hash.update(password);
	var value = hash.digest('hex');
	return {
		salt: salt,
		passwordHash: value
	};
};

function validateUser(username, password, callback) {
	console.log("SELECT * FROM users WHERE username ='" + username + "'");
	con.query("SELECT * FROM users WHERE username ='" + username + "'", function (err, result, fields) {
		if (result.length == 0) return callback(false);
		if (err) throw err;
		console.log("db:" + (sha512(password, result[0].salt).passwordHash == result[0].hashed_password))
		return callback(sha512(password, result[0].salt).passwordHash == result[0].hashed_password);

	});


}

function newUserInsert(username, password, callback) {
	var funcResult;
	console.log("DB Connected!");
	con.query("SELECT * FROM users WHERE username ='" + username + "'", function (err, result, fields) {
		if (err) throw err;
		if (result.length > 0) {
			funcResult = {
				success: false,
				message: "User name already exists!"
			}
			return callback(funcResult);
		}
		else {
			var salt = genRandomString(16); /** Gives us salt of length 16 */
			var hasdedPwd = sha512(password, salt).passwordHash;
			// salt_hash_pwd in node.js https://ciphertrick.com/2016/01/18/salt-hash-passwords-using-nodejs-crypto/
			var sql = "INSERT INTO users (username, hashed_password, salt) VALUES ('" + username + "', '" + hasdedPwd + "', '" + salt + "')";
			//console.log(sql);
			con.query(sql, function (err, result) {
				if (err) throw err;
				funcResult = {
					success: true,
					message: "User successfully registered!"
				}
				return callback(funcResult);
			})
		}


	});


}

