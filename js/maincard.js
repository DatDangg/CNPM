
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
    // console.log("Opening path: ", path);
    // Store the path in localStorage
    localStorage.setItem('selectedFlashcardPath', path);
    // Open fcard.html
    window.location.href = 'fcard.html';
}

// Function to display flashcards from the 'nw' node
// JavaScript
// Function to display flashcards from the 'nw' node
function displayExploreFlashcards() {
    flashcardsGrid.innerHTML = ''; // Clear previous flashcards

    const nwRef = database.ref('nw');
    nwRef.once('value', (snapshot) => {
        const data = snapshot.val();
        for (const topic in data) {
            if (data.hasOwnProperty(topic)) {
                const hide = data[topic].hide || 0;
                if (hide === 1) continue; // Skip if topic is hidden
                const flashcard = document.createElement('div');
                flashcard.className = 'flashcard';
                flashcard.setAttribute('data-path', `nw/${topic}`);

                const topicData = data[topic];
                let wordCount = 0;

                for (const word in topicData) {
                    if (topicData.hasOwnProperty(word) && word !== 'hide' && topicData[word].hide !== 1) {
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


const adminUsers = ["admin1", "admin2"];

// Check if the logged-in user is an admin
function isAdminUser(username) {
    return adminUsers.includes(username);
}

// Function to update hide status in Firebase
function updateHideStatus(topic, hide) {
    const topicRef = database.ref(`nw/${topic}`);
    topicRef.update({ hide: hide ? 1 : 0 })
        .then(() => {
            console.log('Hide status updated successfully');
        })
        .catch((error) => {
            console.error('Error updating hide status: ', error);
        });
}

// Function to remove word from Firebase
function removeWordFromFirebase(topic, word) {
    const wordRef = database.ref(`nw/${topic}/${word}`);
    wordRef.remove()
        .then(() => {
            alert('Word removed successfully');
            displayTopicWords(topic); // Refresh the topic words table
        })
        .catch((error) => {
            console.error('Error removing word: ', error);
        });
}

// Function to display topics in admin view
function displayAdminTopics() {
    const adminTableBody = document.getElementById('admin-table-body');
    adminTableBody.innerHTML = ''; // Clear previous data

    const nwRef = database.ref('nw');
    nwRef.once('value', (snapshot) => {
        const data = snapshot.val();
        let index = 1;
        for (const topic in data) {
            if (data.hasOwnProperty(topic)) {
                const topicData = data[topic];
                const hide = topicData.hide === 1;
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${index}</td>
                    <td><a href="#" class="topic-link" data-topic="${topic}">${topic.replace(/topic\d+:/, '')}</a></td>
                    <td><input type="checkbox" class="hide-checkbox" data-topic="${topic}" ${hide ? 'checked' : ''}></td>
                `;
                adminTableBody.appendChild(row);
                index++
            }
        }

        // Add event listeners to hide checkboxes
        document.querySelectorAll('.hide-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                const topic = this.getAttribute('data-topic');
                const hide = this.checked;
                updateHideStatus(topic, hide);
            });
        });

        // Add event listeners to topic links
        document.querySelectorAll('.topic-link').forEach(link => {
            link.addEventListener('click', function(event) {
                event.preventDefault();
                const topic = this.getAttribute('data-topic');
                
                displayTopicWords(topic);
            });
        });
    });
}

const addTopicBtn = document.getElementById('add-topic-btn');
addTopicBtn.addEventListener('click', () => {
    const newTopicInput = document.getElementById('new-topic-input');
    const newTopic = newTopicInput.value.trim();
    if (newTopic !== '') {
        addTopicToFirebase(newTopic);
        newTopicInput.value = ''; // Clear the input field
    } else {
        alert('Please enter a topic name');
    }
});
function addTopicToFirebase(newTopic) {
    const topicRef = database.ref(`nw/${newTopic}`);
    topicRef.set({ hide: 0 }) // Initial hide status
        .then(() => {
            alert('Topic added successfully');
            displayAdminTopics(); // Refresh the topic list
        })
        .catch((error) => {
            console.error('Error adding topic: ', error);
        });
}

// Function to display words in a topic
// Function to add a new word to Firebase
function addWordToFirebase(topic, word, englishMeaning, vneseMeaning) {
    const meaning = `${englishMeaning} % ${vneseMeaning}`;
    const wordRef = database.ref(`nw/${topic}/${word}`);
    wordRef.set(meaning)
        .then(() => {
            alert('Word added successfully');
            displayTopicWords(topic); // Refresh the topic words table
        })
        .catch((error) => {
            console.error('Error adding word: ', error);
        });
}

// Function to display words in a topic
// Function to display words in a topic
function displayTopicWords(topic) {
    const adminGrid = document.querySelector('.admin-grid');
    const adminTopicWords = document.querySelector('.admin-topic-words');
    const topicTitle = document.getElementById('topic-title');
    const topicWordsBody = document.getElementById('topic-words-body');
    
    topicTitle.textContent = topic;
    topicWordsBody.innerHTML = ''; // Clear previous data

    const topicRef = database.ref(`nw/${topic}`);
    topicRef.once('value', (snapshot) => {
        const topicData = snapshot.val();
        for (const word in topicData) {
            if (topicData.hasOwnProperty(word) && word !== 'hide') {
                let meaning = topicData[word];
                if (typeof meaning !== 'string') {
                    meaning = ''; // Handle non-string meanings
                }
                const formattedMeaning = meaning.replace(/ % /g, '<br>'); // Replace % with line break
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${word}</td>
                    <td>${formattedMeaning}</td>
                    <td><button class="btn btn-danger remove-btn" data-topic="${topic}" data-word="${word}">Remove</button></td>
                `;
                topicWordsBody.appendChild(row);
            }
        }

        // Add event listeners to remove buttons
        document.querySelectorAll('.remove-btn').forEach(button => {
            button.addEventListener('click', function() {
                const topic = this.getAttribute('data-topic');
                const word = this.getAttribute('data-word');
                removeWordFromFirebase(topic, word);
            });
        });
    });

    adminGrid.classList.add('d-none');
    adminTopicWords.classList.remove('d-none');

    // Add event listener to add word form
    const addWordForm = document.getElementById('add-word-form');
    addWordForm.onsubmit = (e) => {
        e.preventDefault();
        const newWord = document.getElementById('new-word').value;
        const newEnglishMeaning = document.getElementById('new-english-meaning').value;
        const newVneseMeaning = document.getElementById('new-vnese-meaning').value;
        addWordToFirebase(topic, newWord, newEnglishMeaning, newVneseMeaning);
        addWordForm.reset(); // Clear the form
    };
}


// Function to display user view
function displayUserFlashcards() {
    const userContainer = document.querySelector('.user-container');
    const adminContainer = document.querySelector('.admin-container');
    userContainer.classList.remove('d-none');
    adminContainer.classList.add('d-none');
}

// Function to display admin view
function displayAdminPanel() {
    const userContainer = document.querySelector('.user-container');
    const adminContainer = document.querySelector('.admin-container');
    const adminGrid = document.querySelector('.admin-grid');
    const adminTopicWords = document.querySelector('.admin-topic-words');

    userContainer.classList.add('d-none');
    adminContainer.classList.remove('d-none');
    adminGrid.classList.remove('d-none');
    adminTopicWords.classList.add('d-none');

    displayAdminTopics();
}

// Event listener for admin panel button
const adminPanelBtn = document.querySelector('.admin-panel');
adminPanelBtn.addEventListener('click', () => {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    if (loggedInUser && isAdminUser(loggedInUser.username)) {
        displayAdminPanel();
    } else {
        alert('You do not have permission to access this page');
    }
});

// Event listener for back button in topic words view
const backToTopicsBtn = document.getElementById('back-to-topics');
backToTopicsBtn.addEventListener('click', displayAdminPanel);

// Initial display logic
function initialDisplay() {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    if (loggedInUser && isAdminUser(loggedInUser.username)) {
        displayAdminPanel();
    } else {
        displayUserFlashcards();
    }
}

// Call the initial display function
initialDisplay();
