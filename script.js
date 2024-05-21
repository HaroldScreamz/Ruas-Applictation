let deck = [];
let playerHand = [];
let dealerHand = [];
let playerChips = 100;
let currentBet = 0;
let splitBet = 0;
let splitHandActive = false;
let playerHand2 = [];
let gameOver = false;

const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'j', 'q', 'k', 'a'];

document.getElementById('hit').addEventListener('click', hit);
document.getElementById('stand').addEventListener('click', stand);
document.getElementById('reset').addEventListener('click', resetGame);
document.getElementById('place-bet').addEventListener('click', placeBet);
document.getElementById('double').addEventListener('click', doubleDown);
document.getElementById('split').addEventListener('click', splitHand);

function createDeck() {
    deck = [];
    for (let suit of suits) {
        for (let value of values) {
            deck.push({ suit, value });
        }
    }
    deck = shuffle(deck);
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function startGame() {
    if (currentBet === 0) {
        alert("Please place a bet to start the game.");
        return;
    }
    gameOver = false;
    splitHandActive = false;
    playerHand2 = [];
    document.getElementById('hit').disabled = false;
    document.getElementById('stand').disabled = false;
    document.getElementById('double').disabled = true;
    document.getElementById('split').disabled = true;
    document.getElementById('place-bet').disabled = true;
    createDeck();
    playerHand = [drawCard(), drawCard()];
    dealerHand = [drawCard()];
    displayHands();
    checkForBlackjack();
    checkForDoubleAndSplit();
}

function drawCard() {
    return deck.pop();
}

function displayHands() {
    if (splitHandActive) {
        document.getElementById('player-hand').innerHTML = handToHTML(playerHand) + "<br>" + handToHTML(playerHand2);
    } else {
        document.getElementById('player-hand').innerHTML = handToHTML(playerHand);
    }
    document.getElementById('dealer-hand').innerHTML = handToHTML(dealerHand);
    updateTotals();
}

function handToHTML(hand) {
    return hand.map(card => {
        return `<img src="cards/${card.value}_of_${card.suit}.png" alt="${card.value} of ${card.suit}">`;
    }).join('');
}

function hit() {
    if (gameOver) return;

    if (splitHandActive && playerHand2.length > 0) {
        playerHand2.push(drawCard());
        displayHands();
        if (getHandValue(playerHand2) > 21) {
            endGame('Bust on second hand! You lose.');
        }
    } else {
        playerHand.push(drawCard());
        displayHands();
        if (getHandValue(playerHand) > 21) {
            endGame('Bust! You lose.');
        }
    }
}

function stand() {
    if (gameOver) return;

    if (splitHandActive && playerHand2.length === 0) {
        playerHand2.push(drawCard());
        displayHands();
    } else {
        while (getHandValue(dealerHand) < 17) {
            dealerHand.push(drawCard());
        }
        displayHands();
        determineWinner();
    }
}

function determineWinner() {
    if (getHandValue(dealerHand) > 21) {
        endGame('Dealer busts! You win!');
    } else if (splitHandActive) {
        const playerValue1 = getHandValue(playerHand);
        const playerValue2 = getHandValue(playerHand2);
        const dealerValue = getHandValue(dealerHand);

        if (dealerValue > playerValue1 && dealerValue > playerValue2) {
            endGame('You lose both hands!');
        } else if (dealerValue < playerValue1 && dealerValue < playerValue2) {
            endGame('You win both hands!');
        } else if (dealerValue > playerValue1) {
            endGame('You lose first hand, push second hand.');
        } else if (dealerValue > playerValue2) {
            endGame('You win first hand, lose second hand.');
        } else {
            endGame('Push on both hands!');
        }
    } else {
        if (getHandValue(dealerHand) > getHandValue(playerHand)) {
            endGame('You lose!');
        } else if (getHandValue(dealerHand) < getHandValue(playerHand)) {
            endGame('You win!');
        } else {
            endGame('Push! It\'s a tie.');
        }
    }
}

function doubleDown() {
    if (gameOver || playerChips < currentBet) return;
    playerChips -= currentBet;
    currentBet *= 2;
    updateChipsAndBet();
    hit();
    document.getElementById('double').disabled = true;
    if (!gameOver) {
        stand();
    }
}

function splitHand() {
    if (gameOver || playerChips < currentBet) return;
    splitHandActive = true;
    playerChips -= currentBet;
    splitBet = currentBet;
    playerHand2 = [playerHand.pop()];
    playerHand.push(drawCard());
    playerHand2.push(drawCard());
    updateChipsAndBet();
    displayHands();
    document.getElementById('split').disabled = true;
    document.getElementById('double').disabled = true;
}

function getHandValue(hand) {
    let value = 0;
    let numAces = 0;
    for (let card of hand) {
        if (['j', 'q', 'k'].includes(card.value)) {
            value += 10;
        } else if (card.value === 'a') {
            value += 11;
            numAces += 1;
        } else {
            value += parseInt(card.value);
        }
    }
    while (numAces > 0 && value > 21) {
        value -= 10;
        numAces -= 1;
    }
    return value;
}

function checkForBlackjack() {
    if (getHandValue(playerHand) === 21) {
        endGame('Blackjack! You win!', true);
    }
}

function checkForDoubleAndSplit() {
    const playerTotal = getHandValue(playerHand);
    if (playerTotal === 9 || playerTotal === 10 || playerTotal === 11) {
        document.getElementById('double').disabled = false;
    }
    if (playerHand.length === 2 && playerHand[0].value === playerHand[1].value) {
        document.getElementById('split').disabled = false;
    }
}

function endGame(message, isBlackjack = false) {
    gameOver = true;
    document.getElementById('message').textContent = message;
    document.getElementById('dealer-hand').innerHTML = handToHTML(dealerHand);
    document.getElementById('hit').disabled = true;
    document.getElementById('stand').disabled = true;
    document.getElementById('double').disabled = true;
    document.getElementById('split').disabled = true;

    if (message.includes('win') && isBlackjack) {
        playerChips += currentBet * 2.5; // Winning with Blackjack gives 1.5x bet plus original bet
    } else if (message.includes('win')) {
        playerChips += currentBet * 2; // Winning returns the bet and the same amount as winnings
    } else if (message.includes('Push')) {
        playerChips += currentBet; // In a tie, the bet is returned
    } // No need to change chips for losing, as the bet is already deducted

    if (splitHandActive) {
        if (message.includes('win')) {
            playerChips += splitBet * 2;
        } else if (message.includes('Push')) {
            playerChips += splitBet;
        }
    }

    currentBet = 0;
    splitBet = 0;
    updateChipsAndBet();
    document.getElementById('place-bet').disabled = false;
}

function resetGame() {
    playerChips = 100; // Reset chips to 100
    currentBet = 0;
    splitBet = 0;
    gameOver = false;
    splitHandActive = false;
    playerHand2 = [];
    updateChipsAndBet();
    document.getElementById('message').textContent = '';
    document.getElementById('hit').disabled = true;
    document.getElementById('stand').disabled = true;
    document.getElementById('double').disabled = true;
    document.getElementById('split').disabled = true;
    document.getElementById('place-bet').disabled = false;
    document.getElementById('player-hand').innerHTML = '';
    document.getElementById('dealer-hand').innerHTML = '';
    document.getElementById('player-total').textContent = 'Player Total: 0';
    document.getElementById('dealer-total').textContent = 'Dealer Total: 0';
}

function updateTotals() {
    const playerTotal = getHandValue(playerHand);
    const dealerTotal = getHandValue(dealerHand);
    document.getElementById('player-total').textContent = `Player Total: ${playerTotal}`;
    document.getElementById('dealer-total').textContent = `Dealer Total: ${dealerTotal}`;
    if (splitHandActive) {
        const playerTotal2 = getHandValue(playerHand2);
        document.getElementById('player-total').textContent += `, Split Hand Total: ${playerTotal2}`;
    }
}

function updateChipsAndBet() {
    document.getElementById('player-chips').textContent = `Chips: ${playerChips}`;
    document.getElementById('current-bet').textContent = `Current Bet: ${currentBet}`;
}

function placeBet() {
    const betAmount = parseInt(document.getElementById('bet-amount').value);
    if (isNaN(betAmount) || betAmount <= 0) {
        alert("Please enter a valid bet amount.");
        return;
    }
    if (betAmount > playerChips) {
        alert("You don't have enough chips to place that bet.");
        return;
    }
    currentBet = betAmount;
    playerChips -= betAmount; // Deduct the bet amount from player's chips
    updateChipsAndBet();
    startGame();
}

updateChipsAndBet();
