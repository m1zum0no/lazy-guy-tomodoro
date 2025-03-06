const themes = {
	dark: {
		props: {
			"color-scheme": "dark",
			"--focus": "#d64f4f",
			"--short": "#26baba",
			"--long": "#5fbbe6",
		},
		defaccent: "lavender",
	},
	light: {
		props: {
			"color-scheme": "light",
			"--focus": "#d64f4f",
			"--short": "#26baba",
			"--long": "#5fbbe6",
		},
		defaccent: "red",
	},
	black: {
		props: {
			"color-scheme": "dark",
			"--focus": "#d64f4f",
			"--short": "#26baba",
			"--long": "#5fbbe6",
		},
		defaccent: "lavender",
	},
	white: {
		props: {
			"color-scheme": "light",
			"--focus": "#d64f4f",
			"--short": "#26baba",
			"--long": "#5fbbe6",
		},
		defaccent: "red",
	},
};

const accents = {
	dark: {
		red: {
			"--bgcolor": "#252222",
			"--bgcolor2": "#403333",
			"--color": "#ffeeee",
			"--coloraccent": "#ffaaaa",
		},
		violet: {
			"--bgcolor": "#252225",
			"--bgcolor2": "#3a2a3a",
			"--color": "#ffeeff",
			"--coloraccent": "#ee82ee",
		},
		blue: {
			"--bgcolor": "#131320",
			"--bgcolor2": "#1d3752",
			"--color": "#eeeeff",
			"--coloraccent": "#9bb2ff",
		},
		lavender: {
			"--bgcolor": "#222230",
			"--bgcolor2": "#333340",
			"--color": "#eeeeff",
			"--coloraccent": "#b2b2ff",
		},
		green: {
			"--bgcolor": "#1d201d",
			"--bgcolor2": "#143814",
			"--color": "#eeffee",
			"--coloraccent": "#8dd48d",
		},
		teal: {
			"--bgcolor": "#111f1f",
			"--bgcolor2": "#334040",
			"--color": "#eeffff",
			"--coloraccent": "#00aaaa",
		},
		grey: {
			"--bgcolor": "#222222",
			"--bgcolor2": "#444444",
			"--color": "#dddddd",
			"--coloraccent": "#aaaaaa",
		},
	},
	black: {
		red: {
			"--bgcolor2": "#403333",
			"--color": "#ffeeee",
			"--coloraccent": "#ffaaaa",
			"--bgcolor": "#000000",
		},
		violet: {
			"--bgcolor": "#000000",
			"--bgcolor2": "#312131",
			"--color": "#ffeeff",
			"--coloraccent": "#ee82ee",
		},
		blue: {
			"--bgcolor2": "#1d3752",
			"--color": "#eeeeff",
			"--coloraccent": "#9bb2ff",
			"--bgcolor": "#000000",
		},
		lavender: {
			"--bgcolor2": "#333340",
			"--color": "#eeeeff",
			"--coloraccent": "#b2b2ff",
			"--bgcolor": "#000000",
		},
		green: {
			"--bgcolor2": "#143814",
			"--color": "#eeffee",
			"--coloraccent": "#8dd48d",
			"--bgcolor": "#000000",
		},
		teal: {
			"--bgcolor": "#000000",
			"--bgcolor2": "#303f3f",
			"--color": "#eeffff",
			"--coloraccent": "#00aaaa",
		},
		grey: {
			"--bgcolor2": "#444444",
			"--color": "#dddddd",
			"--coloraccent": "#aaaaaa",
			"--bgcolor": "#000000",
		},
	},
	light: {
		red: {
			"--bgcolor": "#fff3f3",
			"--bgcolor2": "#ffd2d2",
			"--color": "#222222",
			"--coloraccent": "#d64f4f",
		},
		violet: {
			"--bgcolor": "#fff3ff",
			"--bgcolor2": "#ffd2ff",
			"--color": "#222222",
			"--coloraccent": "#ee82ee",
		},
		blue: {
			"--bgcolor": "#f3f3ff",
			"--bgcolor2": "#d2d2ff",
			"--color": "#222222",
			"--coloraccent": "#4169e4",
		},
		lavender: {
			"--bgcolor": "#faf1ff",
			"--bgcolor2": "#e2d4ff",
			"--color": "#222222",
			"--coloraccent": "#8b51ff",
		},
		teal: {
			"--bgcolor": "#faffff",
			"--bgcolor2": "#cbebeb",
			"--color": "#222222",
			"--coloraccent": "#008080",
		},
		green: {
			"--bgcolor": "#f3fff3",
			"--bgcolor2": "#cafcc1",
			"--color": "#222222",
			"--coloraccent": "#39743d",
		},
		grey: {
			"--bgcolor": "#ffffff",
			"--bgcolor2": "#dddddd",
			"--color": "#333333",
			"--coloraccent": "#555555",
		},
	},
	white: {
		red: {
			"--bgcolor": "#ffffff",
			"--bgcolor2": "#ffd2d2",
			"--color": "#222222",
			"--coloraccent": "#ee7777",
		},
		violet: {
			"--bgcolor": "#ffffff",
			"--bgcolor2": "#ffd2ff",
			"--color": "#222222",
			"--coloraccent": "#ee82ee",
		},
		blue: {
			"--bgcolor": "#ffffff",
			"--bgcolor2": "#d2d2ff",
			"--color": "#222222",
			"--coloraccent": "#4169e4",
		},
		lavender: {
			"--bgcolor": "#ffffff",
			"--bgcolor2": "#e2d4ff",
			"--color": "#222222",
			"--coloraccent": "#8b51ff",
		},
		teal: {
			"--bgcolor": "#ffffff",
			"--bgcolor2": "#cbebeb",
			"--color": "#222222",
			"--coloraccent": "#008080",
		},
		green: {
			"--bgcolor": "#ffffff",
			"--bgcolor2": "#cafcc1",
			"--color": "#222222",
			"--coloraccent": "#39743d",
		},
		grey: {
			"--bgcolor": "#ffffff",
			"--bgcolor2": "#dddddd",
			"--color": "#333333",
			"--coloraccent": "#555555",
		},
	},
};

let theme = "dark";
let themeAccent = "lavender";

function setTheme(basetheme = "dark", accent) {
	if (!accent) accent = themes[basetheme].defaccent;
	if (basetheme !== "custom") {
		for (let prop in themes[basetheme].props) {
			root.style.setProperty(prop, themes[basetheme].props[prop]);
		}
		document.getElementById("t-" + theme).removeAttribute("selected");
		addColorButtons(basetheme);
		document.getElementById("t-" + basetheme).setAttribute("selected", true);
		setAccent(basetheme, accent);
	}
}

let colorBtns = [];

function addColorButtons(basetheme) {
	colorsDiv.innerHTML = "";
	colorBtns = [];
	for (let accent in accents[basetheme]) {
		let btn = document.createElement("button");
		btn.className = "color";
		btn.style.backgroundColor = accents[basetheme][accent]["--coloraccent"];
		btn.dataset.color = basetheme + "-" + accent;
		btn.addEventListener("click", () => {
			setAccent(basetheme, accent);
		});
		btn.title = accent;
		colorBtns.push(btn);
		colorsDiv.appendChild(btn);
	}
}

let themeMeta = document.getElementById("theme-meta");

function setAccent(basetheme, accent) {
	for (let prop in accents[basetheme][accent]) {
		root.style.setProperty(prop, accents[basetheme][accent][prop]);
	}
	themeMeta.setAttribute("content", accents[basetheme][accent]["--bgcolor"]);
	colorBtns.forEach((btn) => {
		if (btn.dataset.active === "true") {
			btn.dataset.active = "false";
		}
		if (btn.dataset.color === basetheme + "-" + accent) {
			btn.dataset.active = "true";
		}
	});

	localStorage.setItem("pomo-theme", basetheme);
	localStorage.setItem("pomo-theme-accent", accent);
	theme = basetheme;
	themeAccent = accent;
}

document.getElementById("theme-select").addEventListener("change", function () {
	setTheme(this.value);
});

if (localStorage.getItem("pomo-theme")) {
	theme = localStorage.getItem("pomo-theme");
	if (localStorage.getItem("pomo-theme-accent")) {
		themeAccent = localStorage.getItem("pomo-theme-accent");
	}
}
setTheme(theme, themeAccent);
