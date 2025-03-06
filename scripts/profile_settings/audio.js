function volumeSliderDisplay() {
	if (audioType === "noise") {
		volumeContainer.classList.remove("disabled");
	} else {
		volumeContainer.classList.add("disabled");
	}
	volumeValue.textContent = volume;
	volumeSlider.value = volume;
}

let audioSelect = document.getElementById("audio-select");
if (localStorage.getItem("pomo-audio-type")) {
	let audioTypeL = localStorage.getItem("pomo-audio-type");
	if (audioTypes.includes(audioTypeL)) {
		audioType = audioTypeL;
		audioSelect.value = audioType;
	}
} else {
	audioSelect.value = "disabled";
}

if (localStorage.getItem("pomo-audio-volume")) {
	volume = parseFloat(localStorage.getItem("pomo-audio-volume")) || 80;
}

volumeSliderDisplay();

let audioCtx;
let noiseSource;
let gain;
let noiseTimeout;

let isWhiteNoiseRunning = false;
let isFadingOut = false;

audioSelect.addEventListener("change", () => {
	audioType = audioSelect.value;
	if (audioType !== "noise" && isWhiteNoiseRunning) {
		fadeOut();
	} else if (roundInfo.running) {
		if (roundInfo.current === "focus" && audioType === "noise") {
			fadeIn();
		}
	}
	volumeSliderDisplay(audioType);
	localStorage.setItem("pomo-audio-type", audioType);
});

function initNoise() {
	if (!audioCtx) {
		audioCtx = new AudioContext();
	}
	const bufferSize = audioCtx.sampleRate * 3;
	const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
	let data = buffer.getChannelData(0);

	for (let i = 0; i < bufferSize; i++) {
		data[i] = Math.random() * 2 - 1;
	}

	noiseSource = audioCtx.createBufferSource();
	noiseSource.buffer = buffer;

	gain = audioCtx.createGain();
	gain.gain = volume / 100;

	noiseSource.connect(gain);
	gain.connect(audioCtx.destination);
}

volumeSlider.addEventListener("input", () => {
	volume = parseFloat(volumeSlider.value);
	volumeValue.textContent = volume;
	if (volume === 0) {
		volumeContainer.classList.add("muted");
	} else {
		volumeContainer.classList.remove("muted");
	}
	if (gain) gain.gain.linearRampToValueAtTime(volume / 100, audioCtx.currentTime);
	localStorage.setItem("pomo-audio-volume", volume);
});

function playNoise() {
	noiseSource.loop = true;
	noiseSource.start();
	isWhiteNoiseRunning = true;
}

function stopNoise() {
	noiseSource.stop();
	isWhiteNoiseRunning = false;
	isFadingOut = false;
}

function fadeOut() {
	if (!isWhiteNoiseRunning) return;
	isFadingOut = true;
	gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 1);
	noiseTimeout = setTimeout(stopNoise, 1000);
}

function fadeIn() {
	clearTimeout(noiseTimeout);
	if (!isFadingOut) {
		initNoise();
		gain.gain.setValueAtTime(0, audioCtx.currentTime);
		gain.gain.linearRampToValueAtTime(volume / 100, audioCtx.currentTime + 1);
		playNoise(0);
	} else {
		gain.gain.setValueAtTime(gain.gain.value, audioCtx.currentTime);
		gain.gain.linearRampToValueAtTime(volume / 100, audioCtx.currentTime + 1);
	}
}
