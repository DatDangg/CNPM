const dbRef = firebase.database().ref(`Test/`);
const adminRef = firebase.database().ref('Admin/');
const user = JSON.parse(localStorage.getItem('loggedInUser'));

const username = user.username; // Replace with the actual username or fetch from user context

// Check if the user is an admin
adminRef.once("value", function(snapshot) {
    const admins = snapshot.val();
    if (admins && admins[username]) {
        displayAdminPanel();
    } else {
        displayUserPanel();
    }
});

function displayAdminPanel() {
    document.querySelector('.testing').textContent = "ADMIN TESTING PANEL";
    const adminContainer = document.getElementById('admin-container');
    adminContainer.classList.remove('d-none');

    dbRef.once("value", function(snapshot) {
        const tests = snapshot.val();
        const adminTableBody = document.getElementById('admin-table-body');

        Object.keys(tests).forEach(testKey => {
            if (testKey.startsWith("Test")) {
                const test = tests[testKey];
                const row = document.createElement('tr');
                const testCell = document.createElement('td');
                testCell.textContent = testKey;
                const hiddenCell = document.createElement('td');
                const hiddenCheckbox = document.createElement('input');
                hiddenCheckbox.type = 'checkbox';
                hiddenCheckbox.checked = test.hide === 1;
                hiddenCell.appendChild(hiddenCheckbox);
                const lockedCell = document.createElement('td');
                const lockedCheckbox = document.createElement('input');
                lockedCheckbox.type = 'checkbox';
                lockedCheckbox.checked = !!test.key;
                lockedCell.appendChild(lockedCheckbox);
                
                row.appendChild(testCell);
                row.appendChild(hiddenCell);
                row.appendChild(lockedCell);
                adminTableBody.appendChild(row);

                hiddenCheckbox.addEventListener('change', function() {
                    updateTestVisibility(testKey, hiddenCheckbox.checked);
                });

                lockedCheckbox.addEventListener('change', function() {
                    updateTestLockStatus(testKey, lockedCheckbox.checked);
                });
            }
        });
    });
}

function displayUserPanel() {
    const userRef = firebase.database().ref(`Users/${username}`);
    let userTestKeys = [];

    userRef.once("value", function(userSnapshot) {
        const userData = userSnapshot.val();
        userTestKeys = userData.testkey ? userData.testkey.split(',').map(key => key.trim()) : [];

        dbRef.once("value", function(snapshot) {
            const tests = snapshot.val();
            const frame = document.createElement("div");
            frame.className = "frame";
            let frame2 = document.createElement("div");
            frame2.className = "frame-2";

            const filteredTests = Object.keys(tests).filter(key => key.startsWith("Test") && tests[key].hide === 0);

            for (let i = 0; i < filteredTests.length; i++) {
                const testKey = filteredTests[i];
                const testData = tests[testKey];

                const key = i + 1;
                const frame3 = document.createElement("div");
                frame3.className = "frame-3";
                frame3.setAttribute("data-test-number", i + 1);
                frame3.setAttribute("data-test-key", testData.key ? testData.key : "");
                frame3.addEventListener("click", function () {
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
}

function updateTestVisibility(testKey, isHidden) {
    dbRef.child(testKey).update({ hide: isHidden ? 1 : 0 });
}

function updateTestLockStatus(testKey, isLocked) {
    dbRef.child(testKey).update({ key: isLocked ? testKey : "" });
}

function openTestPage(testKey, testKeyValue, userTestKeys, userRef) {
    if (testKeyValue && !userTestKeys.includes(testKeyValue)) {
        showPaymentModal(testKeyValue, userRef);
    } else {
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
    };

    checkPaymentBtn.onclick = function () {
        Swal.fire({
            title: 'Payment Successful!',
            text: 'Access has been granted.',
            icon: 'success'
        });
        modal.style.display = "none";
        userRef.update({
            testkey: firebase.database.ServerValue.arrayUnion(testKeyValue)
        });
    };
    
    window.onclick = function (event) {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    };
}