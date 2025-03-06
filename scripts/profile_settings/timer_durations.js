import { setTime } from '../timer.js';

if (localStorage.getItem("pomo-config")) {
	config = JSON.parse(localStorage.getItem("pomo-config"));
	setTime();
}

function saveConfig() {
	localStorage.setItem("pomo-config", JSON.stringify(config));
	setTime();
}

timerInputs.focus.value = config.focus / 60;
timerInputs.short.value = config.short / 60;
timerInputs.long.value = config.long / 60;
timerInputs.rounds.value = config.longGap;

function timerInput(name, value) {
	if (value > 180) {
		config[name] = 10800;
		timerInputs[name].value = 180;
	} else if (value < 1) {
		config[name] = 60;
		timerInputs[name].value = 1;
	} else {
		config[name] = value * 60;
	}
	saveConfig();
}

function incrementTimer(name) {
	if (config[name] < 10800) {
		config[name] += 60;
		timerInputs[name].value = config[name] / 60;
	}
	saveConfig();
}

function decrementTimer(name) {
	if (config[name] > 60) {
		config[name] -= 60;
		timerInputs[name].value = config[name] / 60;
	}
	saveConfig();
}

timerInputs.focus.addEventListener("input", function () {
	timerInput("focus", this.value);
});
timerInputs.short.addEventListener("input", function () {
	timerInput("short", this.value);
});
timerInputs.long.addEventListener("input", function () {
	timerInput("long", this.value);
});
timerInputs.rounds.addEventListener("input", function () {
	if (this.value > 18) {
		config.longGap = 18;
		this.value = 18;
	} else if (this.value < 1) {
		config.longGap = 1;
		this.value = 1;
	} else {
		config.longGap = parseInt(this.value);
	}
	saveConfig();
});

document.getElementById("focus-inc").addEventListener("click", () => incrementTimer("focus"));
document.getElementById("short-inc").addEventListener("click", () => incrementTimer("short"));
document.getElementById("long-inc").addEventListener("click", () => incrementTimer("long"));

document.getElementById("focus-dec").addEventListener("click", () => decrementTimer("focus"));
document.getElementById("short-dec").addEventListener("click", () => decrementTimer("short"));
document.getElementById("long-dec").addEventListener("click", () => decrementTimer("long"));

document.getElementById("rounds-inc").addEventListener("click", () => {
	config.longGap = config.longGap < 18 ? config.longGap + 1 : 18;
	timerInputs.rounds.value = config.longGap;
	roundnoDiv.innerText = roundInfo.focusNum + "/" + config.longGap;
	saveConfig();
});

document.getElementById("rounds-dec").addEventListener("click", () => {
	config.longGap = config.longGap > 1 ? config.longGap - 1 : 1;
	timerInputs.rounds.value = config.longGap;
	roundnoDiv.innerText = roundInfo.focusNum + "/" + config.longGap;
	saveConfig();
});
