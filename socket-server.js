let { WebSocketServer } = require("ws");
let getTCPport = require("./ports.js");

//-----------------------------------------------------------------------------

function Server(port) {
	this.wss = new WebSocketServer({ port : port });
	this.clients = {};
	this.hookEvents();
}

//-----------------------------------------------------------------------------

Server.prototype.hookEvents = function() {
	this.onConnection();
}

//-----------------------------------------------------------------------------

Server.prototype.onConnection = function() {
	this.wss.on("connection" , (ws) => {
		let id = (new Date).getTime();
		this.clients[id] = {
			socket  : ws ,
			channel : null ,
			name    : null 
		};
		this.onDestroy(ws , id);
		this.onRequest(ws);

		this.send(ws , {
			type : "id" ,
			id   : id
		});
	});
}

//-----------------------------------------------------------------------------

Server.prototype.onDestroy = function(ws , id) {
	ws.on("close" , () => {
		let client = this.clients[id];
		delete this.clients[id];
		if(client["channel"] !== null) this.pushChannelMembers(client["channel"]);
	});
}

//-----------------------------------------------------------------------------

Server.prototype.send = function(ws , data = {}) {
	ws.send(JSON.stringify(data));
}

//-----------------------------------------------------------------------------

Server.prototype.onRequest = function(ws) {
	ws.on("message" , (data) => {
		data = JSON.parse(data);
		if(!this.isIdFound(data["id"])) return this.closeSocketConnection(ws);
		switch(data["type"]) {
			case "join" :
				this.joinChannel(data);
				break;

			case "message" :
				this.writeMessage(data);
				break;

			case "write" :
				this.pushIsTyping(data);
				break;
		}
	});
}

//-----------------------------------------------------------------------------

Server.prototype.validateChannelName = function(name) {
	return new RegExp("^[a-zA-Z0-9]+$").test(name);
}

//-----------------------------------------------------------------------------

Server.prototype.joinChannel = function(info) {
	let client = this.clients[info["id"]];
	if(this.validateChannelName(info["channel"])) {
		client["channel"] = info["channel"].toLowerCase();
		client["name"]    = info["name"];
		this.send(client["socket"] , {
			type    : "join" ,
			status  : "accepted" ,
		})
		this.pushChannelMembers(client["channel"]);

	} else {
		this.send(client["socket"] , {
			type    : "join" ,
			status  : "refused",
		})
	}
}

//-----------------------------------------------------------------------------

Server.prototype.writeMessage = function(info) {
	let sender = this.clients[info["id"]];
	if(sender["channel"] === null) this.closeSocketConnection(info["socket"]);
	Object.getOwnPropertyNames(this.clients).forEach((clientID) => {
		let item = this.clients[clientID];
		if(item["channel"] === sender["channel"]) {
			this.send(item["socket"] , {
				type    : "message",
				id      : info["id"],
				name    : (info["id"] == clientID) ? "You" : sender["name"],
				message : info["message"]
			});
		}
	})
}

//-----------------------------------------------------------------------------

Server.prototype.pushIsTyping = function(info) {
	let sender = this.clients[info["id"]];
	if(sender["channel"] === null) this.closeSocketConnection(info["socket"]);
	Object.getOwnPropertyNames(this.clients).forEach((clientID) => {
		if(clientID == info["id"]) return;
		let item = this.clients[clientID];
		if(item["channel"] === sender["channel"]) {
			this.send(item["socket"] , {
				type    : "write",
				id      : info["id"],
				name    : sender["name"],
			});
		}
	})	
}

//-----------------------------------------------------------------------------

Server.prototype.pushChannelMembers = function(channel) {
	let members = [] , sockets = [];
	Object.getOwnPropertyNames(this.clients).forEach((clientID) => {
		let client = this.clients[clientID];
		if(client["channel"] === channel) {
			members.push(client["name"]);
			sockets.push(client["socket"]);
		}
	})
	sockets.forEach((socket) => {
		this.send(socket , {
			type    : "member",
			member  : members ,
			channel : channel
		});
	})
}

//-----------------------------------------------------------------------------

Server.prototype.isIdFound = function(id) {
	return (id === null) ? false : (id in this.clients) ? true : false;
}

//-----------------------------------------------------------------------------

Server.prototype.closeSocketConnection = function(ws) {
	ws.close();
}

//-----------------------------------------------------------------------------

let port = null;
if(process.env.PORT) {
    port = Promise.resolve(process.env.PORT);
} else {
    port = getTCPport(3000);
}
port.then((port) => {
	new Server(port);
	console.log(":: socket server starts :" , port);
})