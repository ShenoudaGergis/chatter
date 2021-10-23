let Utils = {
    validate(text, rule) {
        return (new RegExp(rule)).test(text);
    },
    getCurrentTime() {
    	return (new Date()).toISOString().substr(11 , 5);
    }
}

//-----------------------------------------------------------------------------

function UI() {
	this.timeInterval = null;
    this.typing       = {};
	try {
	    this.socket = new Socket();
	    this.socket.setContext(this);
	    this.hookEvents();
	} catch(e) {
		console.log("Error in conncetion");
	}
}

//-----------------------------------------------------------------------------

UI.prototype.swapFaces = function() {

    if (this.isFaceVisible("joinFace")) {
        this.setFaceHidden("joinFace");
        this.setFaceVisible("chatFace");
        this.setFaceVisible("liveUsersFace");
    } else {
        this.setFaceHidden("chatFace");
        this.setFaceHidden("liveUsersFace");
        this.setFaceVisible("joinFace");
    }
}

//-----------------------------------------------------------------------------

UI.prototype.isFaceVisible = function(id) {
    return (document.getElementById(id).style["display"] === "none") ? false : true;
}

//-----------------------------------------------------------------------------

UI.prototype.setFaceVisible = function(id) {
    document.getElementById(id).style["display"] = "";
}

//-----------------------------------------------------------------------------

UI.prototype.setFaceHidden = function(id) {
    document.getElementById(id).style["display"] = "none";
}

//-----------------------------------------------------------------------------

UI.prototype.joinBtn = function() {
    document.getElementById("joinBtn").addEventListener("click", () => {
        let name = document.getElementById("username").value.trim();
        let channelName = document.getElementById("channelName").value.trim();
        if (Utils.validate(name, "^[a-zA-Z]+ *( *[a-zA-Z]+)") &&
            Utils.validate(channelName, "^[a-zA-Z0-9]+$")) {
            this.socket.joinChannel(channelName , name);
        } else {
        	alert("Bad inputs entered");
        }
    });
}

//-----------------------------------------------------------------------------

UI.prototype.sendBtn = function() {
	document.getElementById("sendBtn").addEventListener("click" , () => {
        let textArea = document.getElementById("messageInput");
		let message  = textArea.value.trim();
		if(message === "") return;
		message = message.replace(/\n\r?/g, "<br />");
        textArea.value = "";
		clearInterval(this.timeInterval);
		this.startTimer(300);
		this.socket.writeMessage(message);
	});
}

//-----------------------------------------------------------------------------

UI.prototype.addLeftMessage = function(message , name) {
	document.getElementById("messagesHolder").innerHTML += `
        <div class="msg left-msg">
            <div class="msg-img" style="background-image: url(https://image.flaticon.com/icons/svg/145/145867.svg)"></div>
            <div class="msg-bubble">
                <div class="msg-info">
                    <div class="msg-info-name">${name}</div>
                    <div class="msg-info-time">${Utils.getCurrentTime()}</div>
                </div>
                <div class="msg-text">
                    ${message}
                </div>
            </div>
        </div>
	`
}

//-----------------------------------------------------------------------------

UI.prototype.addRighMessage = function(message , name) {
	document.getElementById("messagesHolder").innerHTML += `
        <div class="msg right-msg">
            <div class="msg-img" style="background-image: url(https://image.flaticon.com/icons/svg/327/327779.svg)"></div>
            <div class="msg-bubble">
                <div class="msg-info">
                    <div class="msg-info-name">${name}</div>
                    <div class="msg-info-time">${Utils.getCurrentTime()}</div>
                </div>
                <div class="msg-text">
                    ${message}
                </div>
            </div>
        </div>
    `
}

//-----------------------------------------------------------------------------

UI.prototype.logout = function() {
	this.socket.close();
	try {
	    this.socket = new Socket();
	    this.socket.setContext(this);
	} catch(e) {
		console.log("Error in conncetion");
	}
}

//-----------------------------------------------------------------------------

UI.prototype.logoutBtn = function() {
	document.getElementById("logoutSpan").addEventListener("click" , () => {
		clearInterval(this.timeInterval);
		this.logout();
		this.swapFaces();
	});
}

//-----------------------------------------------------------------------------

UI.prototype.addLiveUsersName = function(members) {
	let table = document.getElementById("liveUsers");
	table.innerHTML = "";
	members.forEach((member) => {
		table.innerHTML += `
			<tr>
				<td>${member}</td>
			</tr>
		`
	})
}

//-----------------------------------------------------------------------------

UI.prototype.addLiveUsersCount = function(count , channel) {
	document.getElementById("usersCount").innerHTML = `Live users ( ${channel} ) : ${count}`;
}

//-----------------------------------------------------------------------------

UI.prototype.startTimer = function(duration) {
    let timer = duration, minutes, seconds , display = document.getElementById("logoutSpan");
    this.timeInterval = setInterval(() => {
    	// console.log("live pulse");
        minutes = parseInt(timer / 60, 10);
        seconds = parseInt(timer % 60, 10);

        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        display.textContent = `Logout (${minutes + ":" + seconds})`;

        if (--timer < 0) {
        	clearInterval(this.timeInterval)
        	this.logout();
        	this.swapFaces();
        }
    }, 1000);
}

//-----------------------------------------------------------------------------

UI.prototype.keyEvents = function() {
	let textArea = document.getElementById("messageInput");
	textArea.addEventListener("keydown" , (event) => {
		if(event.keyCode === 13 && !event.altKey) {
			event.preventDefault();
			document.getElementById("sendBtn").click();
		}
		if(event.keyCode === 13 && event.altKey) {
			textArea.value += "\n";
		}
	});

    textArea.addEventListener("input" , () => {
        this.socket.pushIsTyping(this.socket.id);
    })

	document.getElementById("joinFace").addEventListener("keydown" , (event) => {
		if(event.keyCode === 13) {
			document.getElementById("joinBtn").click();
		}		
	})
}

//-----------------------------------------------------------------------------

UI.prototype.addTypingUser = function(id , name) {
    if(id in this.typing) {
        this.typing[id]["count"]++;
    } else {
        this.typing[id] = {
            count : 1,
            name  : name
        };
    }
    this.displayTyping();
    setTimeout(() => {
        let typing = this.typing[id];
        if(--typing["count"] === 0) delete this.typing[id];
        this.displayTyping();
    } , 3000);
}

//-----------------------------------------------------------------------------

UI.prototype.displayTyping = function() {
    let names = [] , element = document.getElementById("usersTyping");
    Object.getOwnPropertyNames(this.typing).forEach((id) => {
        names.push(this.typing[id]["name"]);
    });
    switch(names.length) {
        case 0 :
            element.innerText = "";
            break;

        case 1 :
            element.innerText = names[0] + " is typing";
            break;

        default :
            element.innerText = names.join(" , ") + " are typing";
            break;
    }
}

//-----------------------------------------------------------------------------

UI.prototype.hookEvents = function() {
    this.joinBtn();
    this.sendBtn();
    this.logoutBtn();
    this.keyEvents();
}

//-----------------------------------------------------------------------------

loadSounds().then((data) => {
    let ui   = new UI();
    ui.sound = data;
    console.log("All assets have been loaded" , ui.sound);
} , (error) => {
    console.log("Error in loading assets" , error);
})
