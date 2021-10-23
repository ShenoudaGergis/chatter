function Socket() {
	this.ws      = new WebSocket("ws://localhost:8080");
	this.id      = null;
	this.context = null;
	this.onConnection();
}

//-----------------------------------------------------------------------------

Socket.prototype.send = function(data) {
	if((this.id === null) || !(this.ws.readyState === this.ws.OPEN)) return;
	this.ws.send(JSON.stringify(data));
}

//-----------------------------------------------------------------------------

Socket.prototype.joinChannel = function(channel , name) {
	this.send({
		type    : "join",
		id      : this.id,
		name    : name,
		channel : channel
	});
}

//-----------------------------------------------------------------------------

Socket.prototype.writeMessage = function(message) {
	this.send({
		type    : "message",
		id      : this.id,
		message : message
	});
}

//-----------------------------------------------------------------------------

Socket.prototype.pushIsTyping = function(id) {
	this.send({
		type : "write",
		id   : id 
	});
}

//-----------------------------------------------------------------------------

Socket.prototype.onMessage = function() {
	this.ws.onmessage = (d) => {
		let data = JSON.parse(d.data);

		switch(data["type"]) {
			case "id" :
				this.id = data["id"];
				console.log("recieved new ID");	
				break;

			case "join" :
				if(data["status"] === "accepted") {
					this.context.swapFaces();
					this.context.startTimer(300);
					this.context.sound["join"].play();					
					console.log("connected to channel");
				} else if(data["status"] === "refused") {
					console.log("can't connect to channel");
					alert("Can't connect to channel");
				}
				break;

			case "message" :
				if(data["id"] === this.id) {
					this.context.addRighMessage(data["message"] , data["name"]);
				} else {
					this.context.addLeftMessage(data["message"] , data["name"]);
					this.context.sound["notification"].play();					
				}
				break;

			case "member" :
				console.log("channel clients" , data);
				this.context.addLiveUsersName(data["member"]);
				this.context.addLiveUsersCount(data["member"].length , data["channel"]);
				break;

			case "write" :
				this.context.addTypingUser(data["id"] , data["name"]);
				break;
		}
	}
}

//-----------------------------------------------------------------------------

Socket.prototype.onClose = function() {
	this.ws.onclose = () => {
		console.log("closing");
	}
}

//-----------------------------------------------------------------------------

Socket.prototype.onConnection = function() {
	this.ws.onopen = () => {
		this.onMessage();
		this.onClose();
	}
}

//-----------------------------------------------------------------------------

Socket.prototype.close = function() {
	this.ws.close();
}

//-----------------------------------------------------------------------------

Socket.prototype.setContext = function(context) {
	this.context = context;
}

// let s = new Socket();