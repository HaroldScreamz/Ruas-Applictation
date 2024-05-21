let deck = [];
let playerHand = [];
let dealerHand = [];
const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'j', 'q', 'k', 'a'];

document.getElementById('hit').addEventListener('click', hit);
document.getElementById('stand').addEventListener('click', stand);
document.getElementById('reset').addEventListener('click', resetGame);

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
    createDeck();
    playerHand = [drawCard(), drawCard()];
    dealerHand = [drawCard()];
    displayHands();
    checkForBlackjack();
}

function drawCard() {
    return deck.pop();
}

function displayHands() {
    console.log('Player Hand:', playerHand);
    console.log('Dealer Hand:', dealerHand);
    document.getElementById('player-hand').innerHTML = handToHTML(playerHand);
    document.getElementById('dealer-hand').innerHTML = handToHTML(dealerHand);
   updateTotals();
}

function handToHTML(hand) {
    return hand.map(card => {
        return `<img src="cards/${card.value}_of_${card.suit}.png" alt="${card.value} of ${card.suit}">`;
    }).join('');
}

function hit() {
    playerHand.push(drawCard());
    displayHands();
    if (getHandValue(playerHand) > 21) {
        endGame('Bust! You lose.');
    }
    updateTotals();
}

function stand() {
    while (getHandValue(dealerHand) < 17) {
        dealerHand.push(drawCard());
    }
    displayHands();
    if (getHandValue(dealerHand) > 21) {
        endGame('Dealer busts! You win!');
    } else if (getHandValue(dealerHand) > getHandValue(playerHand)) {
        endGame('Dealer wins!');
    } else if (getHandValue(dealerHand) < getHandValue(playerHand)) {
        endGame('You win!');
    } else {
        endGame('Push! It\'s a tie.');
    }
}

function getHandValue(hand) {
    let value = 0;
    let numAces = 0;
    for (let card of hand) {
        if (card.value === 'j' || card.value === 'q' || card.value === 'k') {
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
        endGame('Blackjack! You win!');
    }
}

function endGame(message) {
    gameOver = true;
    document.getElementById('message').textContent = message;
    document.getElementById('dealer-hand').innerHTML = handToHTML(dealerHand);
    updateTotals();
}

function resetGame() {
    gameOver = false;
    document.getElementById('message').textContent = '';
    startGame();
}

function updateTotals() {
    const playerTotal = getHandValue(playerHand);
    const dealerTotal = getHandValue(dealerHand);
    console.log('Player Total:', playerTotal);
    console.log('Dealer Total:', dealerTotal);
    document.getElementById('player-total').textContent = `Player Total: ${playerTotal}`;
    document.getElementById('dealer-total').textContent = `Dealer Total: ${dealerTotal}`;
}

let gameOver = false;
startGame();
