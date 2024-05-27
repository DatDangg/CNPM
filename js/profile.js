// Reference to the Firebase database
const database = firebase.database();

// Function to update profile information
function updateProfile() {
  // Get the logged-in user's username from local storage
  const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
  const username = loggedInUser.username;

  // Update username in the HTML
  document.querySelector('.content__title h1').innerText = username;

  // Get the test results from Firebase
  database.ref(`Users/${username}`).once('value', (snapshot) => {
    const userData = snapshot.val();

    // If user data exists, update the description in the HTML
    if (userData) {
      let testDescriptions = '<table><tr><th>Test</th><th>Sub Test</th><th>Score</th><th>View</th></tr>';
      
      // Loop through each test
      for (const testKey in userData) {
        // Check if the test starts with "Test"
        if (testKey.startsWith('Test')) {
          const test = userData[testKey];
          const testName = testKey.replace('_', ' ');
          
          // Loop through each subtest of the current test
          for (const subTestKey in test) {
            const subTest = test[subTestKey];
            const subTestName = subTestKey.replace('_', ' ');
            const score = subTest.score;
            console.log(testKey.slice(4))
            // Create the view link
            const viewLink = `../etest/results.html?test=${testKey.slice(4)}&username=${username}&attemptNumber=${subTestKey.slice(6)}`;
            
            // Append test name, subtest name, score, and view link to the description
            testDescriptions += `<tr><td>${testName}</td><td>${subTestName}</td><td>${score}</td><td><a href="${viewLink}">View</a></td></tr>`;
          }
        }
      }
      
      testDescriptions += '</table>';
      
      // Update the description in the HTML
      document.querySelector('.content__description').innerHTML = testDescriptions;
    }
  });
}

// Call the updateProfile function when the page loads
window.onload = updateProfile;