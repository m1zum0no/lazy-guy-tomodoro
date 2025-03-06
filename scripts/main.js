if ("serviceWorker" in navigator) {
	navigator.serviceWorker.register("./sw.js");
}

let timerWorker = new Worker("./worker.js");

let root = document.documentElement;

let mainel = document.getElementById("main");
let statisticsDiv = document.getElementById("statistics");
let menu = document.getElementById("menu");
let manageTasks = document.getElementById("managetasks");

let timediv = document.getElementById("time");
let timer = document.getElementById("timer");
let roundnoDiv = document.getElementById("roundno");
let pauseplaybtn = document.getElementById("pauseplay");
let progress = document.getElementById("progress");

let nextbtn = document.getElementById("next");
let menubtn = document.getElementById("menubtn");
let taskSelect = document.getElementById("task-select");

let volumeContainer = document.getElementById("slider-container");
let volumeSlider = document.getElementById("volume-slider");
let volumeValue = document.getElementById("volume-value");

const timerInputs = {
	focus: document.getElementById("focus-input"),
	short: document.getElementById("short-input"),
	long: document.getElementById("long-input"),
	rounds: document.getElementById("rounds-input"),
};

let colorsDiv = document.getElementById("colors");

let pipActive = false;

const fullname = {
	focus: "Focus",
	short: "Short Break",
	long: "Long Break",
};

let viewState = "timer";

let config = {
	focus: 1500,
	short: 300,
	long: 900,
	longGap: 4,
};

let audioType = "";

let volume = 80;

const audioTypes = ["noise"];

let roundInfo = {
	t: 0,
	focusNum: 1,
	current: "focus",
	running: false,
};


// Load information 
let versionNo = 1;

let savedNo = parseInt(localStorage.getItem("pomo-version"));

if (!savedNo) {
	if (localStorage.getItem("pomo-notfirstload")) {
		localStorage.removeItem("pomo-notfirstload");
	}
}

if (savedNo !== versionNo) {
	document.getElementById("firstload").style.display = "block";
	mainel.style.display = "none";
	document.getElementById("closeintro").addEventListener("click", () => {
		document.getElementById("firstload").style.display = "none";
		localStorage.setItem("pomo-version", versionNo);
		mainel.style.display = "flex";
	});
}
