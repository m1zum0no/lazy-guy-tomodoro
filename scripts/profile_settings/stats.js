//#region Records
async function getRecords(time) {
	let result = [];
	return new Promise((resolve) => {
		if (filteredTasks.size === 0) {
			resolve(result);
		} else if (filteredTasks.size === tasks.length) {
			let tr = db.transaction("records", "readonly").objectStore("records").index("task").getAll();
			tr.onsuccess = () => resolve(tr.result);
		} else {
			let filteredArray = Array.from(filteredTasks);
			filteredArray.forEach((task, i) => {
				let tr = db
					.transaction("records", "readonly")
					.objectStore("records")
					.index("task")
					.getAll(IDBKeyRange.only(task));
				tr.onsuccess = (ev) => {
					result.push(...tr.result);

					if (i === filteredArray.length - 1) {
						resolve(result);
					}
				};
			});
		}
	});
}

function saveRecord(r) {
	let tr = db.transaction("records", "readwrite").objectStore("records").add(r);
	tr.onsuccess = () => console.log("Added new record!");
}

function deleteRecords(task) {
	db
		.transaction("records", "readwrite")
		.objectStore("records")
		.index("task")
		.openCursor(IDBKeyRange.only(task)).onsuccess = (ev) => {
		let cursor = ev.target.result;
		if (cursor) {
			cursor.delete();
			cursor.continue();
		}
	};
}

function deleteRecord(d) {
	db.transaction("records", "readwrite").objectStore("records").delete(d);
}

//#endregion

//#region Tasks (Miniapp)
let tasks = ["Default Task"];

let selectedTask = "Default Task";

let taskContainer = document.getElementById("task-container");
let filterContainer = document.getElementById("filters");
let filteredTasks = new Set();
let db;

let statTimeSelect = document.getElementById("stat-time-select");

function loadTasks() {
	navigator.storage.persist();
	if (localStorage.getItem("pomo-tasks")) {
		tasks = JSON.parse(localStorage.getItem("pomo-tasks"));
		if (!(tasks instanceof Array)) {
			localStorage.removeItem("pomo-tasks");
			tasks = ["Default Task"];
		}
	}
	if (localStorage.getItem("pomo-records")) {
		let records = JSON.parse(localStorage.getItem("pomo-records"));
		records.forEach((r) => saveRecord(r));
		localStorage.removeItem("pomo-records");
	}
	if (localStorage.getItem("pomo-selected-task")) {
		if (tasks.includes(localStorage.getItem("pomo-selected-task"))) {
			selectedTask = localStorage.getItem("pomo-selected-task");
			taskSelect.value = selectedTask;
		}
	}
	if (localStorage.getItem("pomo-stat-period")) {
		statTimeSelect.value = localStorage.getItem("pomo-stat-period");
	}
	return new Promise((resolve) => {
		let tr = indexedDB.open("pomo-db", 1);
		tr.onupgradeneeded = (ev) => {
			db = ev.target.result;
			let recordStore = db.createObjectStore("records", { keyPath: "d" });
			recordStore.createIndex("task", "n", { unique: false });
			recordStore.transaction.oncomplete = (event) => {
				resolve();
			};
		};
		tr.onsuccess = (ev) => {
			db = ev.target.result;
			resolve();
		};
	});
}
//#endregion

//#region Charts
function pieCardGenerator(task) {
	let el = document.createElement("div");
	el.className = "pie-card";
	let pieName = document.createElement("div");
	pieName.className = "pie-card-name";
	pieName.innerText = task;
	el.appendChild(pieName);
	let timeHolder = document.createElement("div");
	let text = document.createElement("span");
	text.innerText = "Time Spent: ";
	let timeSpan = document.createElement("span");
	timeSpan.className = "pie-card-time";
	let ee = document.createElement("div");
	ee.className = "pie-card-time-div";
	let totaltime = document.createElement("span");
	totaltime.className = "pie-card-time-text";
	ee.append(document.createTextNode("("), totaltime, document.createTextNode(")"));
	let roundno = document.createElement("div");
	roundno.className = "pie-card-rounds";
	let roundnospan = document.createElement("span");
	roundnospan.className = "pie-card-rounds-span";
	roundno.append(document.createTextNode("Number of Rounds: "), roundnospan);
	timeHolder.append(text, timeSpan, ee, roundno);
	el.appendChild(timeHolder);
	return el;
}

function barGenerator(task) {
	let taskBarContainer = document.createElement("div");
	taskBarContainer.className = "task-bar-container";
	let legend = document.createElement("div");
	legend.className = "legend";
	legend.innerText = task;
	let barContainer = document.createElement("div");
	barContainer.className = "bar-container";
	let bar = document.createElement("div");
	bar.className = "bar";
	barContainer.appendChild(bar);
	let tooltip = document.createElement("div");
	tooltip.className = "tooltip";
	tooltip.innerText = task;
	let valueEl = document.createElement("div");
	valueEl.className = "stat-value";
	bar.append(tooltip, valueEl);
	taskBarContainer.append(legend, barContainer);
	taskBarContainer.dataset.task = task;
	return taskBarContainer;
}

let format = new Intl.DateTimeFormat(undefined, {
	dateStyle: "full",
	timeStyle: "short",
});

function roundEntryGen(entry) {
	let roundEntry = document.createElement("div");
	roundEntry.className = "round-entry";
	let roundEntryName = document.createElement("div");
	roundEntryName.className = "round-entry-name";
	roundEntryName.innerText = entry.n;
	let roundEntryDuration = document.createElement("round-entry-duration");
	roundEntryDuration.className = "round-entry-duration";
	roundEntryDuration.innerText = hmstrFull(entry.t);
	let roundEntryTime = document.createElement("div");
	roundEntryTime.className = "round-entry-time";
	roundEntryTime.innerText = format.format(entry.d);
	let entryDelete = document.createElement("button");
	entryDelete.className = "entry-delete";
	entryDelete.innerText = "Delete";
	entryDelete.addEventListener("click", () => {
		let p = confirm("Are you sure you want to delete this record? This cannot be undone.");
		if (!p) return;
		deleteRecord(entry.d);
		roundEntry.remove();
		loadStatistics(false);
	});
	roundEntry.append(roundEntryName, roundEntryDuration, roundEntryTime, entryDelete);
	return roundEntry;
}

let hourlyNames = ["0-6", "6-12", "12-18", "18-24"];

let hourlyFullNames = ["00:00 - 00:06", "06:00 - 12:00", "12:00 - 18:00", "18:00 - 24:00"];

let hourlyBars = hourlyNames.map((d) => document.getElementById("hourly-" + d));

let dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

let dayBars = dayNames.map((d) => document.getElementById("day-" + d));

let monthNames = [
	"january",
	"february",
	"march",
	"april",
	"may",
	"june",
	"july",
	"august",
	"september",
	"october",
	"november",
	"december",
];

let monthBars = monthNames.map((d) => document.getElementById("month-" + d));

let pieSVG = document.querySelector("#pie svg");
let statSummaryTotal = document.getElementById("stat-summary-total");
let statSummaryRounds = document.getElementById("stat-summary-rounds");
let statSummaryAverage = document.getElementById("stat-summary-average");
let statSummaryShortest = document.getElementById("stat-summary-shortest");
let statSummaryLongest = document.getElementById("stat-summary-longest");

let remarkHourly = document.getElementById("remark-hourly");
let remarkMonthly = document.getElementById("remark-monthly");
let remarkDaily = document.getElementById("remark-daily");
let roundEntries = document.getElementById("round-entries");

export async function loadStatistics(updateEntryCards = true) {
	let timeValue = statTimeSelect.value;
	let rec = await getRecords();
	if (!(timeValue === "all")) {
		if (parseInt(timeValue) === 0) {
			// Today
			// Get the current date without the time component
			const currentDate = new Date();
			currentDate.setHours(0, 0, 0, 0);

			// Calculate the start and end timestamps for the current day
			const startOfDay = currentDate.getTime();
			const endOfDay = startOfDay + 24 * 60 * 60 * 1000;

			rec = rec.filter((r) => {
				// Check if the task is within the current day
				return r.d >= startOfDay && r.d < endOfDay && filteredTasks.has(r.n);
			});
		} else {
			let tt = Date.now() - parseInt(timeValue) * 24 * 60 * 60 * 1000;
			rec = rec.filter((r) => r.d >= tt && filteredTasks.has(r.n));
		}
	}
	let charts = [];
	let maxvalue = 0;
	let minRoundValue = 0;
	let maxRoundValue = 0;
	let totalValue = 0;
	let hourlyTimes = new Array(4).fill(0);
	let dayTimes = new Array(7).fill(0);
	let monthTimes = new Array(12).fill(0);
	for (let task of filteredTasks) {
		let chart = {
			t: 0,
			task: task,
			n: 0,
		};
		rec.filter((r) => r.n === task).forEach((r) => {
			chart.t += r.t;
			totalValue += r.t;
			let d = new Date(r.d);
			hourlyTimes[Math.floor(d.getHours() / 6)] += r.t;
			dayTimes[d.getDay()] += r.t;
			monthTimes[d.getMonth()] += r.t;
			chart.n++;
			if (minRoundValue === 0) {
				minRoundValue = r.t;
			} else {
				minRoundValue = minRoundValue > r.t ? r.t : minRoundValue;
			}
			maxRoundValue = maxRoundValue < r.t ? r.t : maxRoundValue;
		});
		maxvalue = maxvalue < chart.t ? chart.t : maxvalue;

		charts.push(chart);
	}
	statSummaryTotal.innerText = hmstrFull(totalValue);
	statSummaryRounds.innerText = rec.length;
	statSummaryAverage.innerText = hmstrFull(totalValue / (rec.length === 0 ? 1 : rec.length));
	statSummaryShortest.innerText = hmstrFull(minRoundValue);
	statSummaryLongest.innerText = hmstrFull(maxRoundValue);

	if (totalValue === 0) {
		remarkDaily.style.display = remarkHourly.style.display = remarkMonthly.style.display = "none";
	} else {
		remarkDaily.style.display = remarkHourly.style.display = remarkMonthly.style.display = "block";
		let maxH = 1;
		let maxHV = 0;
		hourlyTimes.forEach((v, i) => {
			if (v > maxHV) {
				maxHV = v;
				maxH = i;
			}
		});
		remarkHourly.querySelector(".remark-value").innerText = hourlyFullNames[maxH];

		let maxD = 1;
		let maxDV = 0;
		dayTimes.forEach((v, i) => {
			if (v > maxDV) {
				maxDV = v;
				maxD = i;
			}
		});
		remarkDaily.querySelector(".remark-value").innerText = dayNames[maxD] + "s";

		let maxM = 1;
		let maxMV = 0;
		monthTimes.forEach((v, i) => {
			if (v > maxMV) {
				maxMV = v;
				maxM = i;
			}
		});
		remarkMonthly.querySelector(".remark-value").innerText = monthNames[maxM];
	}

	pieSVG.innerHTML = "";
	let sumOfPrev = 0;
	charts
		.sort((a, b) => b.t - a.t)
		.forEach((chart, i) => {
			taskBars[chart.task].querySelector(".stat-value").innerText = hmstr(chart.t);
			taskBars[chart.task].querySelector(".bar").style.width = (chart.t / maxvalue) * 100 + "%";
			taskBars[chart.task].style.order = i + 1;
			pieCards[chart.task].style.order = i + 1;
			pieCards[chart.task].querySelector(".pie-card-time").innerText = `${(
				(chart.t / (totalValue === 0 ? 1 : totalValue)) *
				100
			).toFixed(2)}%`;
			pieCards[chart.task].querySelector(".pie-card-time-text").innerText = hmstrFull(chart.t);
			pieCards[chart.task].querySelector(".pie-card-rounds-span").innerText = chart.n;

			let pie = document.createElementNS("http://www.w3.org/2000/svg", "path");
			let a = (sumOfPrev / totalValue) * Math.PI * 2;

			let p1 = [60 + Math.sin(a) * 50, 60 - Math.cos(a) * 50];
			let b = ((sumOfPrev + chart.t) / totalValue) * Math.PI * 2;

			let p2 = [60 + Math.sin(b) * 50, 60 - Math.cos(b) * 50];

			let normal = (a + b) / 2;
			if (totalValue === chart.t) {
				pie.setAttribute("d", `M60,10 A50 50 0 1 1 60 110 A50 50 0 1 1 60 10 z`);
				pie.dataset.circle = true;
			} else {
				pie.setAttribute(
					"d",
					`M60,60 L${p1.join(",")} A50 50 0 ${b - a > Math.PI ? 1 : 0} 1 ${p2.join(" ")} L60,60 z`
				);
			}
			let title = document.createElementNS("http://www.w3.org/2000/svg", "title");
			title.innerHTML = `${chart.task} ${((chart.t / (totalValue === 0 ? 1 : totalValue)) * 100).toFixed(2)}%`;
			pie.appendChild(title);
			pie.dataset.normal = normal;
			pie.dataset.task = chart.task;
			pie.addEventListener("pointerenter", pathPointerEnter);
			pie.addEventListener("pointerleave", pathPointerLeave);
			pieSVG.appendChild(pie);
			sumOfPrev += chart.t;
		});

	let hourlyMax = 1;
	hourlyTimes.forEach((t) => (hourlyMax = hourlyMax < t ? t : hourlyMax));
	hourlyTimes.forEach((t, i) => {
		hourlyBars[i].querySelector(".stat-value").innerText = hmstr(t);
		hourlyBars[i].style.width = (t / hourlyMax) * 100 + "%";
	});

	let dayMax = 1;
	dayTimes.forEach((t) => (dayMax = dayMax < t ? t : dayMax));
	dayTimes.forEach((t, i) => {
		dayBars[i].querySelector(".stat-value").innerText = hmstr(t);
		dayBars[i].style.width = (t / dayMax) * 100 + "%";
	});

	let monthMax = 1;
	monthTimes.forEach((t) => (monthMax = monthMax < t ? t : monthMax));
	monthTimes.forEach((t, i) => {
		monthBars[i].querySelector(".stat-value").innerText = hmstr(t);
		monthBars[i].style.width = (t / monthMax) * 100 + "%";
	});

	if (updateEntryCards) {
		roundEntries.innerHTML = "";
		rec.sort((a, b) => b.d - a.d).forEach((e) => {
			roundEntries.appendChild(roundEntryGen(e));
		});
	}
}

function pathPointerEnter(ev) {
	let el = pieCards[ev.target.dataset.task];
	if (!ev.target.dataset.circle) {
		let a = parseFloat(ev.target.dataset.normal);
		ev.target.style.transform = `translate(${Math.sin(a) * 5}px, ${-Math.cos(a) * 5}px)`;
	}
	pieCardContainer.scrollTo({
		left: el.offsetLeft,
		top: el.offsetTop,
		behavior: "smooth",
	});
	el.classList.add("pie-card-active");
}

function pathPointerLeave(ev) {
	let el = pieCards[ev.target.dataset.task];
	ev.target.style.transform = `translate(0px, 0px)`;
	el.classList.remove("pie-card-active");
}

function hmstr(t) {
	let h = Math.floor(t / 60);
	let m = t - h * 60;
	return h.toString().padStart(2, "0") + ":" + m.toString().padStart(2, "0");
}

function hmstrFull(t) {
	let r = hmstr(t)
		.split(":")
		.map((i) => parseInt(i));
	if (r[0] === 0) return r[1] + " Minutes";
	if (r[1] === 0) return r[0] + " Hour" + (r[0] === 1 ? "" : "s");
	return `${r[0]} Hour${r[0] > 1 ? "s" : ""} & ${r[1]} Minute${r[1] > 1 ? "s" : ""}`;
}
//#endregion

//#region Tasks (UI)
function saveTasks() {
	localStorage.setItem("pomo-tasks", JSON.stringify(tasks));
}

let allCheckbox = document.getElementById("all");
let pieCardContainer = document.getElementById("pie-card-container");
let timeSpentChart = document.getElementById("timespent");
// let timeSixHourlyChart = document.getElementById("timesixhourly");
// let timeDailyChart = document.getElementById("timedaily");
// let timeMonthlyChart = document.getElementById("timemonthly");
// let timeYearlyChart = document.getElementById("timeyearly");
statTimeSelect.addEventListener("change", () => {
	localStorage.setItem("pomo-stat-period", statTimeSelect.value);
	loadStatistics();
});

let taskBars = {};
let pieCards = {};

function createTaskEl(task) {
	filteredTasks.add(task);
	let op = document.createElement("option");
	op.value = op.innerText = task;
	taskSelect.appendChild(op);

	let tel = document.createElement("div");
	tel.className = "task";
	let tname = document.createElement("div");
	tname.className = "task-name";
	tname.innerText = task;
	tel.appendChild(tname);

	let chip = document.createElement("label");
	chip.className = "task-chip";
	let chipCheckbox = document.createElement("input");
	chipCheckbox.className = "task-checkbox";
	chipCheckbox.type = "checkbox";
	chipCheckbox.defaultChecked = true;
	let namespan = document.createElement("span");
	namespan.className = "chip-task-name";
	namespan.innerText = task;

	chip.append(chipCheckbox, namespan);
	filterContainer.appendChild(chip);

	taskBars[task] = barGenerator(task);
	timeSpentChart.appendChild(taskBars[task]);

	pieCards[task] = pieCardGenerator(task);
	pieCardContainer.appendChild(pieCards[task]);

	chipCheckbox.addEventListener("change", function () {
		if (this.checked) {
			filteredTasks.add(task);
			taskBars[task].style.display = "flex";
			pieCards[task].style.display = "block";
			if (filteredTasks.size === tasks.length) allCheckbox.checked = true;
		} else {
			filteredTasks.delete(task);
			taskBars[task].style.display = "none";
			pieCards[task].style.display = "none";
			if (filteredTasks.size < tasks.length) allCheckbox.checked = false;
		}
		loadStatistics();
	});

	let tdel = document.createElement("button");
	tdel.className = "task-delete-btn crossbtn";
	tdel.title = "Delete this task";
	tdel.addEventListener("click", () => {
		let p = confirm(
			'Are you sure you want to delete the task "' +
				task +
				'"? All the data related to this task will be deleted.'
		);
		if (!p) return;
		tasks.splice(tasks.indexOf(task), 1);
		op.remove();
		tel.remove();
		chip.remove();
		filteredTasks.delete(task);
		if (filteredTasks.size === 0) {
			allCheckbox.checked = false;
		}
		if (filteredTasks.size === tasks.length) {
			allCheckbox.checked = true;
		}
		taskBars[task].remove();
		delete taskBars[task];
		pieCards[task].remove();
		delete pieCards[task];
		if (selectedTask === task) {
			if (tasks.length > 0) {
				selectedTask = tasks[0];
				taskSelect.value = selectedTask;
			}
		}
		noTaskManager();
		deleteRecords(task);
		saveTasks();
	});
	tel.appendChild(tdel);

	taskContainer.appendChild(tel);
}

let noTaskTitle = document.getElementById("no-task-title");

function noTaskManager() {
	if (tasks.length === 0) {
		taskSelect.style.display = "none";
		noTaskTitle.style.display = "block";
	} else {
		taskSelect.style.display = "initial";
		noTaskTitle.style.display = "none";
	}
}

async function taskInit() {
	await loadTasks();
	taskSelect.innerHTML = "";
	noTaskManager();
	tasks.forEach((task) => createTaskEl(task));
	allCheckbox.addEventListener("change", function () {
		if (this.checked) {
			document.querySelectorAll(".task-checkbox").forEach((el) => (el.checked = true));
			tasks.forEach((task) => {
				filteredTasks.add(task);
				taskBars[task].style.display = "flex";
				pieCards[task].style.display = "block";
			});
		} else {
			document.querySelectorAll(".task-checkbox").forEach((el) => (el.checked = false));
			tasks.forEach((task) => {
				filteredTasks.delete(task);
				taskBars[task].style.display = "none";
				pieCards[task].style.display = "none";
			});
		}
		loadStatistics();
	});
}

taskInit();

document.getElementById("newtask").addEventListener("submit", function (ev) {
	ev.preventDefault();
	let formdata = new FormData(this);
	let tname = formdata.get("taskname").trim();
	if (tname === "") {
		alert("Please Enter a Valid Name!");
		this.reset();
		return;
	}
	if (tasks.includes(tname)) {
		alert("Task already exists!");
		return;
	}
	tasks.push(tname);
	createTaskEl(tname);
	if (!tasks.includes(selectedTask)) {
		selectedTask = tname;
		taskSelect.value = tname;
	}
	saveTasks();
	noTaskManager();
	this.reset();
});

taskSelect.addEventListener("change", function () {
	selectedTask = this.value;
	localStorage.setItem("pomo-selected-task", selectedTask);
});

//#endregion
