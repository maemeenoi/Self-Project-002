/*
We store our game status element here to allow us to more easily 
use it later on 
*/
const statusDisplay = document.querySelector(".game--status")
let gameActive = true
let currentPlayer = "X"
let gameState = ["", "", "", "", "", "", "", "", ""]
const winningMessage = () => `Player ${currentPlayer} has won!`
