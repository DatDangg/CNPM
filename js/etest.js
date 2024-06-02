const dbRef = firebase.database().ref(`Test/`);
const adminRef = firebase.database().ref('Admin/');
const user = JSON.parse(localStorage.getItem('loggedInUser'));

const username = user.username; // Replace with the actual username or fetch from user context
let userTestKeys = [];
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

        // Sort the test keys numerically
        const sortedTestKeys = Object.keys(tests).filter(key => key.startsWith("Test")).sort((a, b) => {
            const numA = parseInt(a.replace("Test", ""));
            const numB = parseInt(b.replace("Test", ""));
            return numA - numB;
        });

        sortedTestKeys.forEach(testKey => {
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
        });
    });
}


function displayUserPanel() {
    const userRef = firebase.database().ref(`Users/${username}`);
    
    userRef.once("value", function(userSnapshot) {
        const userData = userSnapshot.val();
        userTestKeys = userData.testkey ? userData.testkey.split(',').map(key => key.trim()) : [];

        dbRef.once("value", function(snapshot) {
            const tests = snapshot.val();
            const frame = document.querySelector(".frame");
            const testsPerPage = 9;
            let filteredTests = Object.keys(tests).filter(key => key.startsWith("Test") && tests[key].hide === 0);

            // Sort the test keys numerically
            filteredTests = filteredTests.sort((a, b) => {
                const numA = parseInt(a.replace("Test", ""));
                const numB = parseInt(b.replace("Test", ""));
                return numA - numB;
            });

            const totalPages = Math.ceil(filteredTests.length / testsPerPage);
            let currentPage = 1;

            function renderTests(page) {
                frame.innerHTML = "";
                const startIndex = (page - 1) * testsPerPage;
                const endIndex = startIndex + testsPerPage;
                const testsToDisplay = filteredTests.slice(startIndex, endIndex);

                for (let i = 0; i < testsToDisplay.length; i++) {
                    const testKey = testsToDisplay[i];
                    const testData = tests[testKey];

                    const frame3 = document.createElement("div");
                    frame3.className = "frame-3";
                    frame3.setAttribute("data-test-number", startIndex + i + 1);
                    frame3.setAttribute("data-test-key", testData.key ? testData.key : "");
                    frame3.addEventListener("click", function () {
                        openTestPage(startIndex + i + 1, testData.key, userTestKeys, userRef);
                    });
                    const rectangleImg = document.createElement("img");
                    rectangleImg.className = "rectangle";
                    rectangleImg.src = "../images/rectangle-38-2.png";
                    const textWrapper2 = document.createElement("div");
                    textWrapper2.className = "text-wrapper-2";
                    textWrapper2.textContent = testKey;
                    frame3.appendChild(rectangleImg);
                    frame3.appendChild(textWrapper2);
                    frame.appendChild(frame3);
                }

                renderPagination();
            }

            function renderPagination() {
                const pageNumbers = document.getElementById("page-numbers");
                pageNumbers.innerHTML = "";

                for (let i = 1; i <= totalPages; i++) {
                    const pageDiv = document.createElement("div");
                    pageDiv.className = "group-wrapper";
                    const pageButton = document.createElement("div");
                    pageButton.className = "group-2";
                    pageButton.innerHTML = `<div class="element">${i}</div>`;
                    pageButton.addEventListener("click", function () {
                        currentPage = i;
                        renderTests(currentPage);
                    });
                    pageDiv.appendChild(pageButton);
                    pageNumbers.appendChild(pageDiv);
                }
            }

            document.getElementById("previous-page").addEventListener("click", function () {
                if (currentPage > 1) {
                    currentPage--;
                    renderTests(currentPage);
                }
            });

            document.getElementById("next-page").addEventListener("click", function () {
                if (currentPage < totalPages) {
                    currentPage++;
                    renderTests(currentPage);
                }
            });

            renderTests(currentPage);
        });
    });
}


function openTestPage(testKey, testKeyValue, userTestKeys, userRef) {
    if (testKeyValue && !userTestKeys.includes(testKeyValue)) {
        console.log("Showing payment modal for test:", testKey);
        showPaymentModal(testKeyValue, userRef);
    } else {
        console.log("Navigating to test page for test:", testKey);
        window.location.href = `test.html?test=${testKey}`;
    }
}

function updateTestVisibility(testKey, isHidden) {
    const updates = {};
    updates[`Test/${testKey}/hide`] = isHidden ? 1 : 0;
    firebase.database().ref().update(updates);
}

function updateTestLockStatus(testKey, isLocked) {
    const keyRef = firebase.database().ref(`Test/${testKey}/key`);
    if (isLocked) {
        const newKey = prompt("Please enter a key to lock this test:");
        if (newKey) {
            keyRef.set(newKey);
        }
    } else {
        keyRef.remove();
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
            console.log("Payment data:", data);
            if (data.transactions && data.transactions.length > 0) {
                for (let i = 0; i < data.transactions.length; i++) {
                    const transaction = data.transactions[i];
                    if (parseFloat(transaction.amount_in) > 2000) {
                        const transactionDate = new Date(transaction.transaction_date);
                        // console.log(transactionDate)
                        const currentDate = new Date();
                        const timeDifference = Math.abs(currentDate - transactionDate) / 1000; 

                        if (timeDifference <= 3000000000) { 
                            Swal.fire({
                                icon: 'success',
                                title: 'Thanh toán thành công',
                                text: 'Giao dịch của bạn đã được xác nhận.',
                                confirmButtonText: 'OK'
                            }).then(() => {
                                userTestKeys.push(testKeyValue);
                        const updatedTestKeys = userTestKeys.join(', ');
                        // console.log(testKeyValue.slice(4))
                        userRef.update({ testkey: updatedTestKeys }).then(() => {
                            window.location.href = `test.html?test=${testKeyValue}`;
                        });
                            });
                            return;
                        } else {
                            alert('time-out');
                            return;
                        }
                    }
                }
                alert('failed');
            } else {
                alert('failed');
            }
        })
        .catch(error => {
            console.error('Error checking payment status:', error);
            setPaymentStatus('error');
        });
}