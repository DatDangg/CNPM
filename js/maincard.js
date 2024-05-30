
const firebaseConfig = {
    apiKey: "AIzaSyA1ztc1CsOdCqBoiegZcgSRevWaahaYRL4",
    authDomain: "toeic-4b09a.firebaseapp.com",
    databaseURL: "https://toeic-4b09a-default-rtdb.firebaseio.com",
    projectId: "toeic-4b09a",
    storageBucket: "toeic-4b09a.appspot.com",
    messagingSenderId: "394200216862",
    appId: "1:394200216862:web:0aa3bbfa97655dc5bec50f"
};

// Initialize Firebase
// app = firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// DOM Elements
const flashcardsGrid = document.getElementById('flashcards-grid');
const exploreBtn = document.querySelector('.explore-btn');
const myFlashcardBtn = document.querySelector('.my-flashcard');

// Function to open fcard.html with the given path
function openFlashcardDetail(path) {
    console.log("Opening path: ", path);
    // Store the path in localStorage
    localStorage.setItem('selectedFlashcardPath', path);
    // Open fcard.html
    window.location.href = 'fcard.html';
}

// Function to display flashcards from the 'nw' node
function displayExploreFlashcards() {
    flashcardsGrid.innerHTML = ''; // Clear previous flashcards

    const nwRef = database.ref('nw');
    nwRef.once('value', (snapshot) => {
        const data = snapshot.val();
        for (const topic in data) {
            if (data.hasOwnProperty(topic)) {
                const flashcard = document.createElement('div');
                flashcard.className = 'flashcard';
                flashcard.setAttribute('data-path', `nw/${topic}`);

                const topicData = data[topic];
                let wordCount = 0;

                for (const word in topicData) {
                    if (topicData.hasOwnProperty(word)) {
                        wordCount++;
                    }
                }

                flashcard.innerHTML = `
                    <h2>${topic.replace(/topic\d+:/, '')}</h2>
                    <p>${wordCount} từ</p>
                `;
                flashcardsGrid.appendChild(flashcard);
            }
        }

        // Add click event listeners to flashcards
        document.querySelectorAll('.flashcard').forEach(card => {
            card.addEventListener('click', function() {
                const path = this.getAttribute('data-path');
                openFlashcardDetail(path);
            });
        });
    });
}

// Function to display flashcards for the logged-in user
function displayMyFlashcards() {
    flashcardsGrid.innerHTML = ''; // Clear previous flashcards

    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    if (loggedInUser && loggedInUser.username) {
        const userRef = database.ref(`Users/${loggedInUser.username}/fcard`);
        userRef.once('value', (snapshot) => {
            const data = snapshot.val();
            if (data) {
                for (const flashcardId in data) {
                    if (data.hasOwnProperty(flashcardId)) {
                        const flashcard = document.createElement('div');
                        flashcard.className = 'flashcard';
                        flashcard.setAttribute('data-path', `Users/${loggedInUser.username}/fcard/${flashcardId}`);

                        const flashcardData = data[flashcardId];
                        let wordCount = 0;

                for (const word in flashcardData) {
                    if (flashcardData.hasOwnProperty(word)) {
                        wordCount++;
                    }
                }
                        
                                flashcard.innerHTML += `
                                    <h2>${flashcardId}</h2>
                                    <p>${wordCount} từ</p>
                                `;
                            
                        
                        flashcardsGrid.appendChild(flashcard);
                    }
                }
            }

            // Add click event listeners to flashcards
            document.querySelectorAll('.flashcard').forEach(card => {
                card.addEventListener('click', function() {
                    const path = this.getAttribute('data-path');
                    openFlashcardDetail(path);
                });
            });
        });
    } else {
        alert('User not logged in');
    }
}

// Event Listeners
exploreBtn.addEventListener('click', displayExploreFlashcards);
myFlashcardBtn.addEventListener('click', displayMyFlashcards);

// Initial display
displayExploreFlashcards();
