const main = document.querySelector("#main");
const container = document.querySelector("#container");
const side = document.querySelector("#side");
const forms = document.querySelectorAll("form");

const controlsElem = document.querySelector("#controls");
const colorsElem = document.querySelector("#colors");

const numbersElem = document.querySelector("#numbers");
const memoElem = document.querySelector("#memo");
const fadeElem = document.querySelector("#fade");

const gridElems = [document.querySelector("#sizew"), document.querySelector("#sizeh")];

let rows = 4;
let columns = 4;

let board;

let tiles = [];

let state = false;

let current = 0;

let timeout;

let customTileBackground = false;

let colorsList = ["#fff", "#d90000", "#00d900", "#0000d9", "#d9d900", "#00d9d9", "#d900d9", "rgb(255, 127, 0)", "#006d00", "#88888b"];

let currentTimer = 0;

let scores = [];

const resetBoard = () => {
  board = new Array(rows);
  for (let i = 0; i < rows; i++) {
    board[i] = new Array(columns);
    board[i].fill(0);
  }
};

resetBoard();

if (localStorage.numbers) numbersElem.value = localStorage.numbers;
if (localStorage.memo) memoElem.value = localStorage.memo;
if (localStorage.fade) fadeElem.value = localStorage.fade;
if (localStorage.controls) controlsElem.value = localStorage.controls;
if (localStorage.colors) colorsElem.value = localStorage.colors;
if (localStorage.scores) scores = JSON.parse(localStorage.scores);

let numbers = numbersElem.value;
let memo = memoElem.value;
let fade = fadeElem.value;
let controls = controlsElem.value;
let colors = colorsElem.value;

const scoreBoard = (scores) => {
	localStorage.scores = JSON.stringify(scores);
	let scoreEl = document.querySelector("#score");
	scoreEl.innerHTML = "";
	for (let i = 0; i < scores.length; i++) {
		let row = document.createElement("tr");
		row.innerHTML = `<td width="40px">${i + 1}</td><td width="120px">${scores[i].score} (${(scores[i].time / 1000).toFixed(3)})</td>`;
		scoreEl.append(row);
	}
}

scoreBoard(scores);

const manageInput = (input) => {
  input.value ? (input.value = parseFloat(input.value)) : (input.value = 0);
  if (parseFloat(input.value) > parseFloat(input.dataset.max))
    input.value = input.dataset.max;
  if (parseFloat(input.value) < parseFloat(input.dataset.min))
    input.value = input.dataset.min;
  switch (input.id) {
    case "numbers":
      if (input.value > rows * columns) input.value = rows * columns;
      localStorage.numbers = input.value;
      numbers = localStorage.numbers;
      break;
    case "memo":
      localStorage.memo = input.value;
      memo = localStorage.memo;
      break;
    case "fade":
      localStorage.fade = input.value;
      fade = localStorage.fade;
      break;
  }
};

const getNum = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

const timer = (memo, duration, tiles) => {
  return setTimeout(() => {
    for (const tile of tiles) {
			tile.childNodes[1].style.animation = "";
      tile.childNodes[1].offsetHeight;
			tile.childNodes[1].style.opacity = "1";
      tile.childNodes[1].style.animation = `fadeIn ${duration}s linear`;
			tile.childNodes[1].onanimationend = () => {
				tile.childNodes[0].style.opacity = "0";
				currentTimer = performance.now();
			}
    }
    state = "playing";
  }, memo * 1000);
}

const init = (b, n) => {
  let put = 0;
  while (put < n) {
    const index = [getNum(0, b.length - 1), getNum(0, b[0].length - 1)];
    if (!b[index[0]][index[1]]) {
      b[index[0]][index[1]] = {
        value: put + 1
      };
      put++;
    }
  }
};

const reset = () => {
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
  current = 0;
  tiles = [];
	currentTimer = 0;
  resetBoard();
  state = false;
};

const start = (b, n) => {
  init(b, n);
  drawBoard(b);
  setupTiles(tiles);
  timeout = timer(memo, fade, tiles);
  current = 1;
  state = "before";
};

const fail = (tiles, score, time) => {
  for (const tile of tiles) {
		tile.childNodes[1].style.animation = "";
    tile.childNodes[1].offsetHeight;
    tile.childNodes[1].style.opacity = "0";
		tile.childNodes[0].style.opacity = "1";
  }
	scores.push({ score: score, time: time });
	scoreBoard(scores);
  state = false;
}

const createTile = (value) => {
  let tile = document.createElement("div");
	let text = document.createElement("div");
  let background = document.createElement("div");
	background.classList.add("tileBackground");
  tile.classList.add("tile");
	if (value) {
			tile.dataset.value = value;
		if (!colors) {
			text.innerText = value;
			background.style.backgroundColor = colorsList[0];
		} else {
			text.innerText = value % 9 === 0 ? 9 : value % 9;
			let i = Math.floor((value - 1) / 9);
			text.style.color = colorsList[i];
			background.style.backgroundColor = colorsList[i];
		}
		tile.append(text);
		tile.append(background);
	  tiles.push(tile);
  }
  container.append(tile);
};

const drawBoard = (board) => {
  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[i].length; j++) {
      switch (board[i][j]) {
        case 0:
          createTile();
          break;
        default:
          createTile(board[i][j].value);
          break;
      }
    }
  }
};

const changeBoard = (w, h) => {
  // columns and rows are switched, temp fix, will find a permanent fix later
  if (w) {
    rows = parseInt(w);
    container.style.width = (50 * rows) + (8 * (rows + 1)) + "px";
    document.querySelector(':root').style.setProperty("--columns", `repeat(${rows}, 1fr)`);
  } else {
    columns = parseInt(h);
    container.style.height = (50 * columns) + (8 * (columns + 1)) + "px";
    document.querySelector(':root').style.setProperty("--rows", `repeat(${columns}, 1fr)`);
  }
  if (numbersElem.value > rows * columns) {
    numbersElem.value = rows * columns;
    numbers = rows * columns;
  }
  reset();
}

const setupTiles = (tiles) => {
  for (const tile of tiles) {
    tile.addEventListener("mousedown", () => {
      manageClick(tile, tile.dataset.value);
    })
  }
}

const manageGrid = (value) => {
  if (value.id === "sizew") {
    changeBoard(value.value, false);
  } else {
    changeBoard(false, value.value);
  }
}

const manageClick = (tile, value) => {
	if (!state) return;
	for (const tile of tiles) {
		tile.childNodes[1].style.animation = "";
		tile.childNodes[1].offsetHeight;
	}
  if (state === "playing") {
	  if (value == current) {
	    if (current === parseInt(numbers)) {
				scores.push({ score: `${current}/${numbers}`, time: performance.now() - currentTimer });
				scoreBoard(scores);
				return reset();
			}
	    current++;
			tile.dataset.value = "";
			tile.childNodes[0].innerText = "";
	    tile.childNodes[1].style.opacity = "0";
	  } else {
	    if (!value) return;
	    fail(tiles, `${current - 1}/${numbers}`, performance.now() - currentTimer);
	  }
	} else {
		tile.childNodes[0].style.opacity = "0";
		tile.childNodes[1].style.opacity = "1";
		clearTimeout(timeout);
    state = "playing";
		currentTimer = performance.now();
		manageClick(tile, value);
	}
}

if (localStorage.grid) {
  let g = localStorage.grid.split(",");
  gridElems[0].value = g[0];
  gridElems[1].value = g[1];
  manageGrid(gridElems[0]);
  manageGrid(gridElems[1]);
  localStorage.grid = [rows, columns];
}

gridElems.forEach(elem => {
  elem.addEventListener("input", () => {
    manageGrid(elem);
    localStorage.grid = [rows, columns];
  })
})

for (const form of forms) {
  form.addEventListener("keydown", (e) => {
    if (e.key.toLowerCase() === "enter") {
      e.preventDefault();
      form[0].blur();
      return false;
    }
  });
  if (form[0].id === "controls") {
    controlsElem.oninput = () => {
      localStorage.controls = controlsElem.value;
      if (localStorage.controls) controlsElem.value = localStorage.controls;
      controls = controlsElem.value;
    };
  }
	if (form[0].id === "colors") {
    colorsElem.oninput = () => {
      localStorage.colors = colorsElem.value;
      if (localStorage.colors) colorsElem.value = localStorage.colors;
      colors = colorsElem.value;
    };
  }
  if (form[0].nodeName === "INPUT") form[0].onblur = () => manageInput(form[0]);
}

window.addEventListener("keydown", (e) => {
  const key = e.key.toLowerCase();
  if (key === "escape") {
    reset();
  } else if (key === " " && state === false) {
    reset();
    start(board, numbers);
  }
});

main.onmousedown = (e) => {
  if (e.button === 2 && state === false) {
    reset();
    start(board, numbers);
  }
}

main.oncontextmenu = (e) => {
  e.preventDefault();
}
