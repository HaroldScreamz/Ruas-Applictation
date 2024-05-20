let deck = [];
let playerHand = [];
let dealerHand = [];
const suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

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
    dealerHand = [drawCard(), drawCard()];
    displayHands();
    checkForBlackjack();
}

function drawCard() {
    return deck.pop();
}

function displayHands() {
    document.getElementById('player-hand').innerHTML = handToString(playerHand);
    document.getElementById('dealer-hand').innerHTML = handToString(dealerHand, true);
    updatePlayerTotal();
}

function handToHTML(hand, isDealer = false) {
    return hand.map((card, index) => {
        if (isDealer && index === 0 && !gameOver) {
            return `<img src="cards/back.png" alt="Card back">`;
        }
        return `<img src="cards/${card.value.toLowerCase()}_of_${card.suit.toLowerCase()}.png" alt="${card.value} of ${card.suit}">`;
    }).join('');
}

function hit() {
    playerHand.push(drawCard());
    displayHands();
    if (getHandValue(playerHand) > 21) {
        endGame('Bust! You lose.');
    }
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
        if (card.value === 'J' || card.value === 'Q' || card.value === 'K') {
            value += 10;
        } else if (card.value === 'A') {
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
    } else if (getHandValue(dealerHand) === 21) {
        endGame('Dealer has Blackjack! You lose.');
    }
}

function endGame(message) {
    gameOver = true;
    document.getElementById('message').textContent = message;
    document.getElementById('dealer-hand').innerHTML = handToString(dealerHand);
}

function resetGame() {
    gameOver = false;
    document.getElementById('message').textContent = '';
    startGame();
}

function updatePlayerTotal() {
    const total = getHandValue(playerHand);
    document.getElementById('player-total').textContent = `Player Total: ${total}`;
}

function upadteDealerTottal() {
    const total = getHandValue(dealerHand);
    document.getElementById('dealer-toatal').textContent = `Dealer Totoal: ${total}`;
}

let gameOver = false;
startGame();
