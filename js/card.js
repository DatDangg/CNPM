
const database = firebase.database();

function shuffle(array) {
    let currentIndex = array.length, randomIndex;
    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
}

// Get random 8 pairs of word and their meanings
function getRandomPairs(data) {
    const keys = Object.keys(data);
    const shuffledKeys = shuffle(keys);
    const selectedKeys = shuffledKeys.slice(0, 8);
    const pairs = [];
    selectedKeys.forEach((key, index) => {
        pairs.push([index + 1, key], [index + 1, data[key]]);
    });
    return shuffle(pairs);
}

let data;
let shuffledCards;

function loadGameData(level) {
    database.ref(`game/cardmatch/${level}`).once('value').then((snapshot) => {
        data = snapshot.val();
        shuffledCards = getRandomPairs(data);
        createCards(shuffledCards);
    });
}

function createCards(shuffledCards) {
    const deck = document.querySelector('.deck');
    deck.innerHTML = ''; // Clear existing cards
    shuffledCards.forEach(card => {
        const li = document.createElement("LI");
        li.classList.add("card_match");
        const span = document.createElement("span");
        span.textContent = card[1]; // Display the card type as text
        li.appendChild(span);
        deck.appendChild(li);
    });
    initGame();
}

const ul = document.querySelector('.deck');
let moves = document.querySelector(".moves");
let movesCounter = 0;
let stars = 3;
let match = 0;
let isfirstClick = true;
let timerID;
let isRestart = false;
let cardTest = [];

function initGame() {
    const card = document.querySelectorAll('.card_match');
    for (let i = 0; i < card.length; i++) {
        card[i].addEventListener("click", function (event) {
            if (card[i] !== event.target) return;
            if (event.target.classList.contains("show")) return;
            if (isfirstClick) {
                timerID = setInterval(timer, 1000);
                isfirstClick = false;
            }
            showCard(event.target);
            setTimeout(addCard, 550, shuffledCards[i], event.target, cardTest, i);
        }, false);
    }
}

function showCard(card) {
    card.classList.add('show_match');
}

function addCard(card, cardHTML, testList, pos) {
    if (isRestart) {
        testList.length = 0;
        isRestart = false;
    }
    testList.push(card);
    testList.push(cardHTML);
    testList.push(pos);
    if (testList.length === 6) {
        updateMoveCounter();
        testCards(testList[0], testList[1], testList[2], testList[3], testList[4], testList[5]);
        testList.length = 0;
    }
}

function testCards(card1, html1, x1, card2, html2, x2) {
    if (card1[0] === card2[0] && x1 != x2) {
        cardsMatch(html1, html2);
    } else {
        cardsDontMatch(html1, html2);
    }
}

function cardsMatch(card1, card2) {
    card1.classList.add('match');
    card2.classList.add('match');
    match++;
    if (match === 8) {
        win();
    }
}

function cardsDontMatch(card1, card2) {
    card1.classList.toggle('no-match');
    card2.classList.toggle('no-match');
    setTimeout(function () {
        card1.classList.toggle('no-match');
        card2.classList.toggle('no-match');
        card1.classList.toggle('show_match');
        card2.classList.toggle('show_match');
    }, flipDelay);
}

function win() {
    clearInterval(timerID);
    toggleModal();
    const stats = document.querySelector(".stats");
    if (s % 60 < 10) {
        stats.textContent = "You won with: " + stars + " stars in " + movesCounter + " moves with time: " + m + ":0" + s % 60;
    } else {
        stats.textContent = "You won with: " + stars + " stars in " + movesCounter + " moves with time: " + m + ":" + s % 60;
    }
}

function updateMoveCounter() {
    movesCounter++;
    moves.textContent = "Moves: " + movesCounter;
    if (movesCounter === 13) {
        let star = document.querySelector("#star3");
        star.classList.toggle("fa-star");
        star.classList.add("fa-star-o");
        stars--;
    } else if (movesCounter === 25) {
        let star = document.querySelector("#star2");
        star.classList.toggle("fa-star");
        star.classList.add("fa-star-o");
        stars--;
    } else if (movesCounter === 35) {
        let star = document.querySelector("#star1");
        star.classList.toggle("fa-star");
        star.classList.add("fa-star-o");
        stars--;
    }
}

let s = 0;
let m = 0;
function timer() {
    ++s;
    m = Math.floor(s / 60);
    let timer = document.querySelector(".timer");
    if (s % 60 < 10) {
        timer.textContent = "Elapsed Time: " + m + ":0" + s % 60;
    } else {
        timer.textContent = "Elapsed Time: " + m + ":" + s % 60;
    }
}

let restart = document.querySelector(".restart");
restart.addEventListener("click", restartGame, false);
function restartGame() {
    clearInterval(timerID);
    movesCounter = 0;
    match = 0;
    s = 0;
    m = 0;
    isfirstClick = true;
    isRestart = true;
    const deck = document.querySelector('.deck');
    var elements = deck.getElementsByClassName("card_match");

    while (elements[0]) {
        elements[0].parentNode.removeChild(elements[0]);
    }
    shuffledCards = getRandomPairs(data); // Re-shuffle the cards
    createCards(shuffledCards); // Call createCards to reinitialize the game
    let timer = document.querySelector(".timer");
    timer.textContent = "Elapsed Time: 0:00";
    moves.textContent = "Moves: " + movesCounter;

    resetStars();
    initGame();
}

function resetStars() {
    stars = 3;
    let star = document.querySelector("#star3");
    star.classList.remove("fa-star");
    star.classList.remove("fa-star-o");
    star.classList.add("fa-star");

    star = document.querySelector("#star2");
    star.classList.remove("fa-star");
    star.classList.remove("fa-star-o");
    star.classList.add("fa-star");

    star = document.querySelector("#star1");
    star.classList.remove("fa-star");
    star.classList.remove("fa-star-o");
    star.classList.add("fa-star");
}

const newGameButton = document.querySelector(".new-game");
newGameButton.addEventListener("click", newGame);
function newGame() {
    toggleModal();
    restartGame();
}

function toggleModal() {
    const modal = document.querySelector(".modal_match");
    modal.classList.toggle("show-modal");
}
const startGameButton = document.querySelector('.start-game');
startGameButton.addEventListener('click', () => {
    // Reset moves counter
    movesCounter = 0;
    moves.textContent = "Moves: " + movesCounter;

    // Reset match count
    match = 0;

    // Reset timer
    clearInterval(timerID);
    s = 0;
    m = 0;
    let timer = document.querySelector(".timer");
    timer.textContent = "Elapsed Time: 0:00";

    // Reset stars
    resetStars();

    // Reset the first click flag
    isfirstClick = true;

    // Get selected level and load game data
    const level = document.querySelector('#level').value;
    if (level === 'A1') {
        flipDelay = 100; 
    } else if (level === 'A2') {
        flipDelay = 200; 
    } else if (level === 'B1') {
        flipDelay = 400; 
    } else if (level === 'B2') {
        flipDelay = 600; 
    } else if (level === 'C1') {
        flipDelay = 800; 
    } else {
        flipDelay = 1000; // 2 seconds
    }
    loadGameData(level);
});



  