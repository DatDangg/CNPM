

const dbRef = firebase.database().ref(`Test/`);

const username = JSON.parse(localStorage.getItem('loggedInUser')).username; // Replace with the actual username or fetch from user context

// Get user's data
const userRef = firebase.database().ref(`Users/${username}`);
let userTestKeys = [];

userRef.once("value", function(userSnapshot) {
    const userData = userSnapshot.val();
    // console.log("Retrieved user data from Firebase:", userData);
    userTestKeys = userData.testkey ? userData.testkey.split(',').map(key => key.trim()) : [];
    // console.log("User's test keys:", userTestKeys);

    // Get tests data
    dbRef.once("value", function(snapshot) {
        const tests = snapshot.val();
        // console.log("Retrieved tests from Firebase:", tests);
        const frame = document.createElement("div");
        frame.className = "frame";
        let frame2 = document.createElement("div");
        frame2.className = "frame-2";

        // Filter tests with keys starting with "Test"
        const filteredTests = Object.keys(tests).filter(key => key.startsWith("Test"));
        // console.log("Filtered tests:", filteredTests);

        for (let i = 0; i < filteredTests.length; i++) {
            const testKey = filteredTests[i];
            const testData = tests[testKey];
            // console.log(`Processing ${testKey}:`, testData);

            const key = i + 1;
            const frame3 = document.createElement("div");
            frame3.className = "frame-3";
            frame3.setAttribute("data-test-number", i + 1);
            frame3.setAttribute("data-test-key", testData.key ? testData.key : "");
            frame3.addEventListener("click", function () {
                // console.log(`Clicked on test ${key}, key:`, testData.key);
                openTestPage(key, testData.key, userTestKeys, userRef);
            });
            const rectangleImg = document.createElement("img");
            rectangleImg.className = "rectangle";
            rectangleImg.src = "../images/rectangle-38-2.png";
            const textWrapper2 = document.createElement("div");
            textWrapper2.className = "text-wrapper-2";
            textWrapper2.textContent = testKey;
            const divWrapper = document.createElement("div");
            frame3.appendChild(rectangleImg);
            frame3.appendChild(textWrapper2);
            frame3.appendChild(divWrapper);
            frame2.appendChild(frame3);

            if ((i + 1) % 3 === 0 || i === filteredTests.length - 1) {
                frame.appendChild(frame2);
                document.querySelector(".frame").appendChild(frame);
                frame2 = document.createElement("div");
                frame2.className = "frame-2";
            }
        }
    });
});

function openTestPage(testKey, testKeyValue, userTestKeys, userRef) {
    if (testKeyValue && !userTestKeys.includes(testKeyValue)) {
        // console.log("Showing payment modal for test:", testKey);
        showPaymentModal(testKeyValue, userRef);
    } else {
        // console.log("Navigating to test page for test:", testKey);
        window.location.href = `test.html?test=${testKey}`;
    }
}

function showPaymentModal(testKeyValue, userRef) {
    const modal = document.getElementById("payment-modal");
    const closeBtn = document.getElementsByClassName("close")[0];
    const checkPaymentBtn = document.getElementById("check-payment-btn");

    modal.style.display = "block";

    closeBtn.onclick = function () {
        modal.style.display = "none";
    }

    window.onclick = function (event) {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    }

    checkPaymentBtn.onclick = function () {
        checkPayment(testKeyValue, userRef);
    }
}

function checkPayment(testKeyValue, userRef) {
    fetch('https://dangkyhoctlu.000webhostapp.com/test.php')
        .then(response => response.json())
        .then(data => {
            // console.log("Payment data:", data);
            if (data.success) {
                const transaction = data.transactions.find(transaction => transaction.account_number === '4220112003' && parseFloat(transaction.amount_in) >= 50000);
                if (transaction) {
                    swal.fire({
                        title: 'Payment Successful',
                        text: 'You can now access the test.',
                        icon: 'success'
                    }).then(() => {
                        // Update user's test keys
                        userTestKeys.push(testKeyValue);
                        const updatedTestKeys = userTestKeys.join(', ');
                        // console.log(testKeyValue.slice(4))
                        userRef.update({ testkey: updatedTestKeys }).then(() => {
                            window.location.href = `test.html?test=${testKeyValue.slice(4)}`;
                        });
                    });
                } else {
                    swal.fire({
                        title: 'Payment Not Found',
                        text: 'Please make sure the payment was successful.',
                        icon: 'error'
                    });
                }
            } else {
                swal.fire({
                    title: 'Payment Check Failed',
                    text: 'Unable to verify payment. Please try again later.',
                    icon: 'error'
                });
            }
        })
        .catch(error => {
            console.error("Error fetching payment data:", error);
            swal.fire({
                title: 'Error',
                text: 'Unable to check payment. Please try again later.',
                icon: 'error'
            });
        });
}