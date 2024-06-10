let deck = [];
let playerHand = [];
let playerHand2 = [];
let dealerHand = [];
let playerChips = 100;
let currentBet = 0;
let splitBet = 0;
let splitHandActive = false;
let activeHand = 1;  // 1 for the first hand, 2 for the second hand
let gameOver = false;

const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'j', 'q', 'k', 'a'];
const face_cards = {
    'j' : 10,
    'q' : 10,
    'k' : 10
};

document.getElementById('hit').addEventListener('click', hit);
document.getElementById('stand').addEventListener('click', stand);
document.getElementById('reset').addEventListener('click', resetGame);
document.getElementById('place-bet').addEventListener('click', placeBet);
document.getElementById('double').addEventListener('click', doubleDown);
document.getElementById('split').addEventListener('click', splitHand);

function createDeck() {
    deck = [];
    for (let d = 0; d < 8; d++) { // Create 8 decks
        for (let suit of suits) {
            for (let value of values) {
                deck.push({ suit, value });
            }
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
    activeHand = 1;
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
        document.getElementById('player-hand').innerHTML = `${handToHTML(playerHand)} <div class="spacer_split"></div> ${handToHTML(playerHand2)}`;
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

    if (splitHandActive && activeHand === 2) {
        playerHand2.push(drawCard());
        displayHands();
        if (getHandValue(playerHand2) > 21) {
            stand(); // Automatically stand if hand 2 busts
        }
    } else {
        playerHand.push(drawCard());
        displayHands();
        if (getHandValue(playerHand) > 21) {
            if (splitHandActive) {
                activeHand = 2;  // Move to the second hand
                document.getElementById('message').textContent = 'First hand bust! Playing second hand...';
                document.getElementById('hit').disabled = false;
                document.getElementById('stand').disabled = false;
            } else {
                endGame('Bust! You lose.');
            }
        }
    }
}

function stand() {
    if (gameOver) return;

    if (splitHandActive && activeHand === 1) {
        activeHand = 2;  // Move to the second hand
        document.getElementById('message').textContent = 'Playing second hand...';
        document.getElementById('hit').disabled = false;
        document.getElementById('stand').disabled = false;
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
        // Dealer busts
        if (splitHandActive) {
            let message = 'Dealer busts! ';
            if (getHandValue(playerHand) <= 21) {
                message += 'First hand wins! ';
            }
            if (getHandValue(playerHand2) <= 21) {
                message += 'Second hand wins!';
            }
            endGame(message);
        } else {
            endGame('Dealer busts! You win!');
        }
    } else if (splitHandActive) {
        const playerValue1 = getHandValue(playerHand);
        const playerValue2 = getHandValue(playerHand2);
        const dealerValue = getHandValue(dealerHand);

        let message = '';

        // Determine the result for the first hand
        if (playerValue1 > 21) {
            message += 'First hand busts. ';
        } else if (dealerValue > playerValue1) {
            message += 'First hand loses. ';
        } else if (dealerValue < playerValue1) {
            message += 'First hand wins! ';
        } else {
            message += 'First hand pushes. ';
        }

        // Determine the result for the second hand
        if (playerValue2 > 21) {
            message += 'Second hand busts.';
        } else if (dealerValue > playerValue2) {
            message += 'Second hand loses.';
        } else if (dealerValue < playerValue2) {
            message += 'Second hand wins!';
        } else {
            message += 'Second hand pushes.';
        }

        endGame(message);
    } else {
        const playerValue = getHandValue(playerHand);
        const dealerValue = getHandValue(dealerHand);

        if (dealerValue > playerValue) {
            endGame('You lose!');
        } else if (dealerValue < playerValue) {
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
        if (face_cards[card.value]) {
            value += face_cards[card.value];
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

function getCardNumericValue(card) {
    switch (card.value) {
        case 'j':
        case 'q':
        case 'k':
            return 10;
        case 'a':
            return 11;  // Use 11 for Aces in split checks, adjust as needed for other purposes
        default:
            return parseInt(card.value);
    }
}

function checkForBlackjack() {
    if (getHandValue(playerHand) === 21) {
        endGame('Blackjack! You win!', true);
    }
}

function areCardsSplittable(card1, card2) {
    return getCardNumericValue(card1) === getCardNumericValue(card2);
}

function checkForDoubleAndSplit() {
    const playerTotal = getHandValue(playerHand);
    if (playerTotal === 9 || playerTotal === 10 || playerTotal === 11) {
        document.getElementById('double').disabled = false;
    }
    if (playerHand.length === 2 && (areCardsSplittable(card1, card2))) {
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

    // Calculate payouts for the first hand
    if (message.includes('First hand wins') || message.includes('Dealer busts! First hand wins!')) {
        playerChips += currentBet * 2;
    } else if (message.includes('First hand pushes')) {
        playerChips += currentBet;
    }

    // Calculate payouts for the second hand
    if (splitHandActive) {
        if (message.includes('Second hand wins') || message.includes('Dealer busts! Second hand wins!')) {
            playerChips += splitBet * 2;
        } else if (message.includes('Second hand pushes')) {
            playerChips += splitBet;
        }
    } else {
        // Single hand scenario
        if (isBlackjack) {
            playerChips += currentBet * 2.5; // Winning with Blackjack gives 1.5x bet plus original bet
        } else if (message.includes('win')) {
            playerChips += currentBet * 2;
        } else if (message.includes('Push')) {
            playerChips += currentBet;
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
    document.getElementById('current-bet').textContent = `Current Bet: ${currentBet + splitBet}`;
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
    document.getElementById('message').textContent = '';
    currentBet = betAmount;
    playerChips -= betAmount; // Deduct the bet amount from player's chips
    updateChipsAndBet();
    startGame();
}

updateChipsAndBet();
