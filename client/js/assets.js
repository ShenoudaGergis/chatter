const assets = {
	"sounds" : 
			[
				{"path" : "assets/sounds/notification.mp3" , "name" : "notification"},
				{"path" : "assets/sounds/join.mp3" , "name" : "join"}
		    ]
}

//-----------------------------------------------------------------------------

function loadSounds() {
	let promises = [];
	assets["sounds"].forEach((item) => {
		promises.push(new Promise((resolve , reject) => {
			let audio = new Audio(item["path"]);
			audio.onloadeddata = function() {
				resolve({
					name : item["name"],
					obj  : audio
				});
			}
			audio.onerror = function() {
				reject(item["path"]);
			}
		}))
	})
	return Promise.all(promises).then((data) => {
		let sounds = {};
		data.forEach((item) => {
			sounds[item["name"]] = new Sound(item["obj"]);
		})
		return sounds;
	})
}

//-----------------------------------------------------------------------------

Sound.prototype.play = function() {
    this.sound.play();
    this.sound.currentTime = 0;
};

Sound.prototype.pause = function() {
    this.sound.pause();
};

Sound.prototype.stop = function() {
    this.pause();
    this.sound.currentTime = 0;
};

function Sound(audio) {
    this.sound = audio;
}