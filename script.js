(function(){
  const rowColumnCount = 7
  const rowColumnCenter = Math.floor(rowColumnCount / 2.0)
  const gameContainerEl = document.querySelector('.game-container')
  const newGameMessageEl = document.querySelector('.new-game-message')
  const restartGameMessageEl = document.querySelector('.restart-game-message')
  const scoreEl = document.querySelector('.score')
  const tickMilliseconds = 600
  const keyCodesToDirections = {
    '38': 'up',
    '40': 'down',
    '37': 'left',
    '39': 'right'
  }

  let activeGame = false
  let eggPositions = {}
  let fruitPositions = {}
  let firePositions = {}
  let playerPosition
  let eggs
  let playerDirection
  let lastPlayerDirection
  let interval
  
  main()
  
  function main () {
    clearGame()
    initializePlayer()
    drawGame()
    document.onkeydown = checkKeyForDirection
  }

  function clearGame () {
    let documentFragment = document.createDocumentFragment()

    for (let count = 0; count < Math.pow(rowColumnCount, 2); count++) {
      let newDiv = document.createElement('div')
      newDiv.id = `box-${count}`
      documentFragment.appendChild(newDiv)
    }

    gameContainerEl.innerHTML = ''
    gameContainerEl.appendChild(documentFragment)
  }

  function initializePlayer () {
    playerPosition = twoDtoOneD(rowColumnCenter, rowColumnCenter)
    eggs = []
    updateEggPositions()
  }

  function updateEggPositions () {
    eggPositions = {}

    for (let eggIndex = eggs.length - 1; eggIndex >= 0; eggIndex--) {
      let position = eggs[eggIndex]
      eggPositions[position] = 'egg'
    }
  }

  function drawGame () {
    removeClasses(gameContainerEl, 'active')
    drawIcon(playerPosition, 'snake')
    drawIcons(eggPositions)
    drawIcons(fruitPositions)
    drawIcons(firePositions)
  }

  function drawIcon (position, icon) {
    document.getElementById(`box-${position}`).classList.add('active', `twa-${icon}`)
  }

  function drawIcons (positions) {
    for (let position in positions) {
      drawIcon(position, positions[position])
    }
  }

  function checkKeyForDirection (e) {
    let direction

    e = e || window.event

    direction = keyCodesToDirections[e.keyCode]

    if (direction) {
      if (eggs.length === 0 ||
          (
            !(lastPlayerDirection === 'up' && direction === 'down') &&
            !(lastPlayerDirection === 'down' && direction === 'up') &&
            !(lastPlayerDirection === 'left' && direction === 'right') &&
            !(playerDirection === 'right' && direction === 'left')
          )
      ) {
        playerDirection = direction
      }

      if (!activeGame) {
        newGame()
      }
    }
  }

  function newGame () {
    activeGame = true
    newGameMessageEl.classList.add('hidden')
    restartGameMessageEl.classList.add('hidden')
    gameContainerEl.classList.remove('paused')
    
    clearGame()
    initializePlayer()
    initializeFruit()
    initializeFire()
    drawGame()
    
    interval = setInterval(onTick, tickMilliseconds)
  }

  function onTick () {
    updateGame()
    drawGame()
  }

  function initializeFruit () {
    fruitPositions = {}
    addFruit()
  }

  function addFruit () {
    let fruitPosition = generateRandomPosition()

    while (fruitPosition === playerPosition || eggPositions[fruitPosition] || firePositions[fruitPosition]) {
      fruitPosition = generateRandomPosition()
    }

    fruitPositions[fruitPosition] = 'watermelon'
  }
  
  function initializeFire() {
    firePositions = {}; 
  }
  
  function updateGame () {
    const playerPosition2D = oneDtoTwoD(playerPosition)

    let playerRow = playerPosition2D.row
    let playerColumn = playerPosition2D.column
    let newPlayerPosition

    switch (playerDirection) {
      case 'up':
        playerRow -= 1
        break
      case 'down':
        playerRow += 1
        break
      case 'left':
        playerColumn -= 1
        break
      case 'right':
        playerColumn += 1
        break
      default:
        break
    }

    if (playerRow < 0 || playerRow === rowColumnCount || playerColumn < 0 || playerColumn === rowColumnCount) {
      endGame()
    } else {
      newPlayerPosition = twoDtoOneD(playerRow, playerColumn)

      if (fruitPositions[newPlayerPosition]) {
        delete fruitPositions[newPlayerPosition]

        eggs = [playerPosition, ...eggs]
        updateEggPositions()

        addFruit()
        
        if (eggs.length % 5 === 0) {
          addFire(); 
        }

        clearInterval(interval)
        interval = setInterval(onTick, Math.max(tickMilliseconds - (eggs.length * 10), 200))
      } else {
        eggs = [playerPosition, ...eggs].slice(0, -1)
        updateEggPositions()
      }

      playerPosition = newPlayerPosition
      lastPlayerDirection = playerDirection

      if (eggPositions[playerPosition] || firePositions[playerPosition]) {
        endGame()
      }
    }
  }
  
  function addFire () {
    let firePosition = generateRandomPosition()

    while (firePosition === playerPosition || eggPositions[firePosition] || firePositions[firePosition]) {
      firePosition = generateRandomPosition()
    }

    firePositions[firePosition] = 'fire'
  }

  function endGame () {
    clearInterval(interval)

    playerDirection = undefined
    lastPlayerDirection = undefined
    
    scoreEl.innerHTML = eggs.length
    gameContainerEl.classList.add('paused')
    restartGameMessageEl.classList.remove('hidden')
    
    setTimeout(() => { activeGame = false }, 500)
  }

  /* ---Utility functions---  */
  function twoDtoOneD (row, column) {
    return row * rowColumnCount + column
  }

  function oneDtoTwoD (position) {
    return {
      row: Math.floor(position / rowColumnCount),
      column: position % rowColumnCount
    }
  }

  function generateRandomPosition () {
    return Math.floor(Math.random() * Math.pow(rowColumnCount, 2))
  }

  // from https://clubmate.fi/remove-a-class-name-from-multiple-elements-with-pure-javascript/
  function removeClasses (container = document, className) {
    let els = container.getElementsByClassName(className)

    if (els[0]) _removeClasses()

    function _removeClasses () {
      els[0].className = ''
      if (els[0]) _removeClasses()
    }
  }
})()