const rowColumnCount = 7;
const rowColumnCenter = Math.floor(rowColumnCount / 2.0);
const gameContainerEl = document.querySelector('.game-container');
const newGameMessageEl = document.querySelector('.new-game-message');
const restartGameMessageEl = document.querySelector('.restart-game-message');
const scoreEl = document.querySelector('.score');
const tickMilliseconds = 600;
const keyCodesToDirections = {
  '38': 'up',
  '40': 'down',
  '37': 'left',
  '39': 'right'
};

let activeGame = false,
    eggPositions = {},
    fruitPositions = {},
    firePositions = {},
    playerPosition,
    contact = false,
    eggs,
    playerDirection,
    lastPlayerDirection,
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
  while (fruitPosition === playerPosition || eggPositions[fruitPosition]) {
    fruitPosition = generateRandomPosition();
  }

  fruitPositions[fruitPosition] = 'watermelon';
}

function updateEggPositions() {
  eggPositions = {};
  
  for (let eggIndex = eggs.length - 1; eggIndex >= 0 ; eggIndex--) {
    let position = eggs[eggIndex];
    eggPositions[position] = 'egg';
  }
}

function initializePlayer() {
  playerPosition = twoDtoOneD(rowColumnCenter, rowColumnCenter)
  eggs = [];
  updateEggPositions();
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

function endGame() {
  playerDirection = undefined;
  lastPlayerDirection = undefined;
  clearInterval(interval);
  scoreEl.innerHTML = eggs.length;
  gameContainerEl.classList.add('paused');
  restartGameMessageEl.classList.remove('hidden');
  setTimeout(() => {activeGame = false;}, 500);
}

function updateGame() {
  const playerPosition2D = oneDtoTwoD(playerPosition);
  
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
    endGame();
  } else {
    newPlayerPosition = twoDtoOneD(playerRow, playerColumn);
    
    if (fruitPositions[newPlayerPosition]) {
      delete fruitPositions[newPlayerPosition];
      
      eggs = [playerPosition, ...eggs];
      updateEggPositions();
      
      addFruit();
      
      clearInterval(interval);
      interval = setInterval(onTick, Math.max(tickMilliseconds - (eggs.length * 10), 200));
    } else {
      eggs = [playerPosition, ...eggs].slice(0, -1);
      updateEggPositions();
    }
    
    playerPosition = newPlayerPosition;
    lastPlayerDirection = playerDirection;
    
    if (eggPositions[playerPosition]){
      endGame();
    }
  }
  
}

function drawGame() {
  removeClasses(gameContainerEl, 'active');
  drawIcon(playerPosition, 'snake');
  drawIcons(eggPositions);
  drawIcons(fruitPositions);
}

function newGame() {
  activeGame = true;
  newGameMessageEl.classList.add('hidden');
  restartGameMessageEl.classList.add('hidden');
  gameContainerEl.classList.remove('paused');
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

function checkKeyForDirection(e) {
  let direction;
  
  e = e || window.event;
  
  direction = keyCodesToDirections[e.keyCode];
  
  if (direction) {
    if (eggs.length === 0
        || (
          !(lastPlayerDirection === 'up' && direction === 'down') 
          && !(lastPlayerDirection === 'down' && direction === 'up') 
          && !(lastPlayerDirection === 'left' && direction === 'right') 
          && !(playerDirection === 'right' && direction === 'left')
        )
    ){
      playerDirection = direction;
    }
    
    if (!activeGame){
      newGame();
    }
  }
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
