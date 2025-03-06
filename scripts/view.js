const animations = {
	out: [
		{ opacity: "1", transform: "translateY(0)" },
		{
			opacity: "0",
			transform: "translateY(50px)",
		},
	],
	in: [
		{
			opacity: "0",
			transform: "translateY(50px)",
		},
		{ opacity: "1", transform: "translateY(0)" },
	],
	animoptions: {
		duration: 200,
		fill: "forwards",
	},
};

let lastanim;

menubtn.addEventListener("click", () => {
	if (lastanim) lastanim.cancel();
	if (viewState === "menu") {
		mainel.style.display = "flex";
		lastanim = menu.animate(animations.out, animations.animoptions);
		lastanim.onfinish = () => {
			menu.style.display = "none";
		};
		menubtn.title = "Open Settings";
		menubtn.classList.remove("cross");
		viewState = "timer";
	} else {
		if (viewState !== "timer") return;
		menu.style.display = "flex";
		menu.scroll({ top: 0 });
		lastanim = menu.animate(animations.in, animations.animoptions);
		lastanim.onfinish = () => (mainel.style.display = "none");
		menubtn.classList.add("cross");
		menubtn.title = "Close Settings";
		viewState = "menu";
	}
});

document.getElementById("managetaskbtn").addEventListener("click", function () {
	if (lastanim) lastanim.cancel();
	if (viewState !== "timer") return;
	manageTasks.style.display = "flex";
	manageTasks.scroll({ top: 0 });
	lastanim = manageTasks.animate(animations.in, animations.animoptions);
	lastanim.onfinish = () => (mainel.style.display = "none");
	viewState = "tasks";
});

document.getElementById("closetasks").addEventListener("click", function () {
	if (lastanim) lastanim.cancel();
	if (viewState === "tasks") {
		mainel.style.display = "flex";
		lastanim = manageTasks.animate(animations.out, animations.animoptions);
		lastanim.onfinish = () => {
			manageTasks.style.display = "none";
		};
		viewState = "timer";
	}
});

import { loadStatistics } from "./profile_settings/stats.js";

document.getElementById("statbtn").addEventListener("click", function () {
	if (lastanim) lastanim.cancel();
	if (viewState !== "timer") return;
	statisticsDiv.style.display = "flex";
	statisticsDiv.scroll({ top: 0 });
	lastanim = statisticsDiv.animate(animations.in, animations.animoptions);
	lastanim.onfinish = () => (mainel.style.display = "none");
	viewState = "statistics";
	loadStatistics();
});

document.getElementById("closestats").addEventListener("click", function () {
	if (lastanim) lastanim.cancel();
	if (viewState === "statistics") {
		mainel.style.display = "flex";
		lastanim = statisticsDiv.animate(animations.out, animations.animoptions);
		lastanim.onfinish = () => {
			statisticsDiv.style.display = "none";
		};
		viewState = "timer";
	}
});
