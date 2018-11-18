const rowColumnCount = 11;
const rowColumnCenter = Math.floor(rowColumnCount / 2.0);
const gameContainerEl = document.querySelector('.game-container');
const tickMilliseconds = 800;
const keyCodesToDirections = {
  '38': 'up',
  '40': 'down',
  '37': 'left',
  '39': 'right'
};

let activeGame = false,
    gameOver = false,
    playerPositions = {},
    fruitPositions = {},
    firePositions = {},
    player,
    playerDirection,
    interval;

function clearGame() {
  
  let documentFragment = document.createDocumentFragment();
  
  for(let count = 0; count < Math.pow(rowColumnCount, 2); count++) {
    let newDiv = document.createElement("div")
    newDiv.id = `box-${count}`
    documentFragment.appendChild(newDiv);
  }
  gameContainerEl.innerHTML = '';
  gameContainerEl.appendChild(documentFragment);
}

function addFruit() {
  let fruitPosition = generateRandomPosition()
  while (playerPositions[fruitPosition]) {
    fruitPosition = generateRandomPosition();
  }

  fruitPositions[fruitPosition] = 'watermelon';
}

function updatePlayerPositions() {
  playerPositions = {};
  
  for (let playerIndex = player.length - 1; playerIndex >= 0 ; playerIndex++) {
    let position = player[playerIndex];
    playerPositions[position] = playerIndex === 0  ? 'snake' : 'egg'; 
  } 
}

function initializePlayer() {
  
  player = [
    twoDtoOneD(rowColumnCenter, rowColumnCenter),
  ];
  
  updatePlayerPositions();
}

function initializeFruit() {
  fruitPositions = {};
  addFruit();
}

function drawIcon(position, icon) {
  document.getElementById(`box-${position}`).classList.add('active', `twa-${icon}`); 
}

function drawIcons(positions) {
  for (let position in positions) {
    drawIcon(position, positions[position]);
  }
}

function updateGame() {
  console.log("tick");  
  
  const playerPosition2D = oneDtoTwoD(player[0]);
  
  let playerRow = playerPosition2D.row;
  let playerColumn = playerPosition2D.column;
  let newPlayerPosition;
  
  switch (playerDirection) {
    case 'up':
      playerRow -= 1;
      break;
    case 'down':
      playerRow += 1;
      break;
    case 'left':
      playerColumn -= 1;
      break;
    case 'right':
      playerColumn += 1;
      break;
    default:
      break;
  }
  
  if (playerRow < 0 || playerRow === rowColumnCount || playerColumn < 0 || playerColumn === rowColumnCount) {
    activeGame = false;
    gameOver = true; 
  } else {
    newPlayerPosition = twoDtoOneD(playerRow, playerColumn);
    
    if (fruitPositions[newPlayerPosition]) {
      delete fruitPositions[newPlayerPosition];
      player = [newPlayerPosition, ...player];
      addFruit();
    } else {
      player = [newPlayerPosition, ...player].slice(0, -1);
    }
    
    updatePlayerPositions();
  }
  
  if (gameOver) {
    clearInterval(interval);
  }
}

function drawGame() {
  removeClasses(gameContainerEl, 'active');
  drawIcons(playerPositions);
  drawIcons(fruitPositions);
}

function newGame() {
  activeGame = true;
  gameOver = false;
  clearGame();
  initializePlayer();
  initializeFruit();
  drawGame();
  interval = setInterval(onTick, tickMilliseconds);
}

function onTick() {
  updateGame();
  drawGame();
}

function main() {
  clearGame();
  initializePlayer();
  drawGame();
  document.onkeydown = checkKeyForDirection;
}

/****** Utility functions ******/
function twoDtoOneD (row, column) {
  return row * rowColumnCount + column;
}

function oneDtoTwoD (position) {
  return {
    row: Math.floor( position / rowColumnCount),
    column: position % rowColumnCount
  }
}

function generateRandomPosition() {
 return  Math.floor(Math.random() * Math.pow(rowColumnCount, 2));
}

// from https://clubmate.fi/remove-a-class-name-from-multiple-elements-with-pure-javascript/
function removeClasses(container = document, className) {
  let els = container.getElementsByClassName(className)
  
  if (els[0]) _removeClasses();
  
  function _removeClasses() {
    els[0].className = '';
    if (els[0]) _removeClasses()
  }
}


main();

function checkKeyForDirection(e) {
  let direction;
  
  e = e || window.event;
  
  direction = keyCodesToDirections[e.keyCode];
  
  if (direction) {
    playerDirection = direction;
    
    if (!activeGame){
      newGame();
    }
  }
}