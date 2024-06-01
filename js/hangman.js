window.onload = function() {
    startNewGame();
};

var level;
const startGameButton = document.querySelector('.start-game');
startGameButton.addEventListener('click', () => {
    level = document.querySelector('#level').value;
    startNewGame();
});

// Get a reference to the database service
const db = firebase.database();

const adminRef = firebase.database().ref('Admin/');
const user = JSON.parse(localStorage.getItem('loggedInUser'));

const username = user.username; // Replace with the actual username or fetch from user context

// Check if the user is an admin
adminRef.once("value", function(snapshot) {
    const admins = snapshot.val();
    if (admins && admins[username]) {
        document.querySelector('#admin-container').classList.remove('d-none');
        document.querySelector('#game-container').classList.add('d-none');
    }
});


function startNewGame() {
    db.ref(`game/hangman/${level}`).once('value').then((snapshot) => {
        const data = snapshot.val();
        const wordsArray = data.words;
        const categoryArray = data.categories;

        let btnWrapper = document.querySelector(".button-wrapper");
        let winMessage = document.getElementById("statusMessage");
        let wrongLetters = document.querySelector("#wrongLetters span");
        let warningText = document.getElementById("warningText");
        let hiddenHangman = Array.from(document.querySelectorAll("svg .bodyPart"));
        let hiddenLives = Array.from(document.querySelectorAll(".lives"));
        let guessWrapper = document.getElementById("guessWrapper");
        let category = document.getElementById("categoryName");

        for (let bodyPart of hiddenHangman) {
            hideElements("hidden", bodyPart);
        }

        for (let life of hiddenLives) {
            unhideElements("hiddenLife", life);
        }

        wrongLetters.innerHTML = "";
        unhideElements("hidden", btnWrapper);
        hideElements("hidden", wrongLetters.parentNode, warningText);
        winMessage.innerHTML = "Hangman Game";
        winMessage.style.color = "black";
        let oldP = document.getElementById("placeholderP");
        if (oldP) {
            guessWrapper.removeChild(oldP);
        }

        hideElements("hidden", guessWrapper, category);

        let newGame = new Hangman(wordsArray, categoryArray);
        newGame.setupNewWord();
    });
}

class Hangman {
    constructor(wordsArray, categoryArray) {
        this.wordsArray = wordsArray;
        this.categoryArray = categoryArray;
        this.random = Math.floor(Math.random() * this.wordsArray.length);
        this.wordToGuess = this.wordsArray[this.random];
        this.category = this.categoryArray[this.random];
        this.placeholderArray = Array(this.wordToGuess.length).fill("_");
        this.guessed = [];
        this.lives = 6;
    }
    setupNewWord() {
        let guessWrapper = document.getElementById("guessWrapper");
        let placeholderP = document.createElement("p");
        let category = document.getElementById("categoryName");
        category.innerHTML = this.category;

        placeholderP.setAttribute("id", "placeholderP");
        placeholderP.innerHTML = this.placeholderArray.join("");
        guessWrapper.appendChild(placeholderP);

        unhideElements("hidden", guessWrapper, category);

        let userLetter = document.getElementById("userLetter");
        userLetter.onkeypress = this.handleKeyPress.bind(this);

        let guessButton = document.getElementById("guessButton");
        guessButton.onclick = this.handleClick.bind(this);
    }
    handleClick() {
        let userLetterInput = document.getElementById("userLetter");
        let userLetter = userLetterInput.value.toUpperCase();
        let placeholderP = document.getElementById("placeholderP");
        let warningText = document.getElementById("warningText");
        let wrongLetters = document.querySelector("#wrongLetters span");

        if (!/[a-zA-Z]/.test(userLetter)) {
            unhideElements("hidden", warningText);
            warningText.innerHTML = "Please enter a letter from A-Z";
        } else {
            hideElements("hidden", warningText);

            if (this.wordToGuess.indexOf(userLetter) > -1 && this.guessed.indexOf(userLetter) == -1) {
                checkGuess(this.wordToGuess, userLetter);
                hideElements("hidden", warningText);
            } else if (this.wordToGuess.indexOf(userLetter) == -1 && this.guessed.indexOf(userLetter) == -1) {
                hideElements("hidden", warningText);
                unhideElements("hidden", wrongLetters.parentNode);
                wrongLetters.innerHTML += userLetter;
                this.lives--;
                hangerDraw(this.lives);
                hideLives(this.lives);
            } else {
                unhideElements("hidden", warningText);
                warningText.innerHTML = "";
                warningText.innerHTML += "Already typed " + userLetter;
            }
            if (this.guessed.indexOf(userLetter) == -1) {
                this.guessed.push(userLetter);
            }

            if (Array.from(placeholderP.innerHTML).indexOf("_") == -1) {
                gameOver(true, this.wordToGuess);
            } else if (this.lives == 0) {
                gameOver(false, this.wordToGuess);
            }
        }
        userLetterInput.value = "";
    }
    handleKeyPress(e) {
        var guessButton = document.getElementById("guessButton");
        if (e.keyCode === 13) {
            guessButton.click();
        }
    }
}

function checkGuess(wordToGuess, userLetter) {
    let placeholderP = document.getElementById("placeholderP");
    let placeholderArray = Array.from(placeholderP.innerHTML);
    placeholderArray = placeholderArray.map((el, i) => {
        if (wordToGuess[i] == userLetter) {
            return (el = userLetter);
        } else {
            return el;
        }
    });

    placeholderP.innerHTML = placeholderArray.join("");
}

function gameOver(win, word) {
    let winMessage = document.getElementById("statusMessage");
    let btnWrapper = document.querySelector(".button-wrapper");
    hideElements("hidden", btnWrapper);
    if (win) {
        winMessage.innerHTML = `You Win! The word was: ${word.join('')}`;
        winMessage.style.color = "green";
    } else {
        winMessage.innerHTML = `Game Over. The word was: ${word.join('')}`;
        winMessage.style.color = "rgb(239, 83, 80)";
    }
}

function hangerDraw(num) {
    let show = document.getElementById(`show${num}`);
    unhideElements("hidden", show);
}

function hideLives(num) {
    let life = document.getElementById(`life${num}`);
    hideElements("hiddenLife", life);
}

function hideElements(myclass, ...els) {
    for (let el of els) {
        el.classList.add(myclass);
    }
}

function unhideElements(myclass, ...els) {
    for (let el of els) {
        el.classList.remove(myclass);
    }
}

document.getElementById("newGame").addEventListener("click", startNewGame);

document.getElementById("loadLevelData").addEventListener("click", loadLevelData);

function loadLevelData() {
    const selectedLevel = document.getElementById("adminLevel").value;
    const tableBody = document.getElementById("adminTableBody");
    tableBody.innerHTML = ''; // Clear existing table rows

    db.ref(`game/hangman/${selectedLevel}`).once('value').then((snapshot) => {
        const data = snapshot.val();
        const wordsArray = data.words || [];
        const categoryArray = data.categories || [];

        const indices = Object.keys(categoryArray); // Get the indices

        indices.forEach(index => {
            const row = document.createElement("tr");

            const levelCell = document.createElement("td");
            levelCell.textContent = selectedLevel;
            row.appendChild(levelCell);

            const categoryCell = document.createElement("td");
            categoryCell.textContent = categoryArray[index];
            row.appendChild(categoryCell);

            const wordCell = document.createElement("td");
            wordCell.textContent = wordsArray[index].join('');
            row.appendChild(wordCell);

            const removeCell = document.createElement("td");
            const removeButton = document.createElement("button");
            removeButton.textContent = "Remove";
            removeButton.addEventListener("click", () => {
                removeWord(selectedLevel, index);
            });
            removeCell.appendChild(removeButton);
            row.appendChild(removeCell);

            tableBody.appendChild(row);
        });
    });
}

function addNewCategoryWord(event) {
    event.preventDefault();

    const selectedLevel = document.getElementById("adminLevel").value;
    const newCategory = document.getElementById("newCategory").value;
    const newWords = document.getElementById("newWords").value;

    // Split newWords by comma and format them for Firebase
    const formattedWords = newWords.split(',').map(word => word.trim().toUpperCase());

    db.ref(`game/hangman/${selectedLevel}/categories`).once('value').then((snapshot) => {
        const categories = snapshot.val() || [];
        const words = formattedWords;

        // Add new category and word to the arrays
        categories.push(newCategory);
        db.ref(`game/hangman/${selectedLevel}/categories`).set(categories);

        // Retrieve the current words array and update it
        db.ref(`game/hangman/${selectedLevel}/words`).once('value').then((snapshot) => {
            const currentWords = snapshot.val() || [];
            currentWords.push(words);

            db.ref(`game/hangman/${selectedLevel}/words`).set(currentWords).then(() => {
                alert('Category added successfully');
                loadLevelData(); // Refresh the table
                document.getElementById("addForm").reset(); // Reset the form
            });
        });
    });
}

function removeWord(level, index) {
    db.ref(`game/hangman/${level}/words/${index}`).remove().then(() => {
        db.ref(`game/hangman/${level}/categories/${index}`).remove().then(() => {
            loadLevelData(); // Refresh the table
        });
    });
}