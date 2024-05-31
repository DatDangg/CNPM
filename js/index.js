firebaseConfig = {
    apiKey: "AIzaSyA1ztc1CsOdCqBoiegZcgSRevWaahaYRL4",
    authDomain: "toeic-4b09a.firebaseapp.com",
    databaseURL: "https://toeic-4b09a-default-rtdb.firebaseio.com",
    projectId: "toeic-4b09a",
    storageBucket: "toeic-4b09a.appspot.com",
    messagingSenderId: "394200216862",
    appId: "1:394200216862:web:0aa3bbfa97655dc5bec50f"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

document.addEventListener('DOMContentLoaded', function() {
    const navLinks = {
        "index.html": "home",
        "etest.html": "test",
        "test.html": "test",
        "maincard.html": "flashcard",
        "fcard.html": "flashcard",
        "hangmangame.html": "game",
        "flipcardgame.html": "game"
    };

    const currentPath = window.location.pathname.split("/").pop();

    if (navLinks[currentPath]) {
        document.getElementById(navLinks[currentPath]).classList.add("active");
    }

    const loginForm = document.getElementById('form1');
    const navUserAction = document.getElementById('nav-user-action');
    const heroSection = document.getElementById('hero');

    const loggedInUser = localStorage.getItem('loggedInUser');
    if (loggedInUser) {
        const { username, isAdmin } = JSON.parse(loggedInUser);
        updateUIForLoggedInUser(username, isAdmin);
    }

    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const loginIdentifier = document.getElementById('exampleInputEmail1').value;
        const password = document.getElementById('inputPassword1').value;

        // Check if the email is in the Users collection
        firebase.database().ref('Users/').orderByChild('email').equalTo(loginIdentifier).once('value')
        .then(function(snapshot) {
            if (snapshot.exists()) {
                const userData = snapshot.val();
                const username = Object.keys(userData)[0];
                const user = userData[username];

                if (user.password === password) {
                    handleSuccessfulLogin(username, false);
                } else {
                    alert('Mật khẩu không đúng. Vui lòng thử lại.');
                }
            } else {
                // If not found in Users, check in Admin
                firebase.database().ref('Admin/').once('value')
                .then(function(snapshot) {
                    if (snapshot.exists()) {
                        const admins = snapshot.val();
                        console.log(admins)
                        let adminFound = false;

                        for (const admin in admins) {
                            console.log(admins[admin].email, loginIdentifier)
                            console.log(admins[admin].password, password)
                            if (admins[admin].email == loginIdentifier && admins[admin].password == password) {
                                adminFound = true;
                                handleSuccessfulLogin(admin, true); // Pass true to indicate admin
                                break;
                            }
                        }

                        if (!adminFound) {
                            alert('Thông tin đăng nhập không đúng. Vui lòng thử lại.');
                        }
                    } else {
                        alert('Thông tin đăng nhập không đúng. Vui lòng thử lại.');
                    }
                })
                .catch(function(error) {
                    console.error('Lỗi khi kiểm tra Admin trong Firebase: ', error);
                    alert('Đã xảy ra lỗi. Vui lòng thử lại sau.');
                });
            }
        })
        .catch(function(error) {
            console.error('Lỗi khi kiểm tra email trong Firebase: ', error);
            alert('Đã xảy ra lỗi. Vui lòng thử lại sau.');
        });
    });

    const signupForm = document.getElementById('form2');
    const usernameInput = document.getElementById('InputUsername2');
    const emailInput = document.getElementById('InputEmail2');
    const pwInput = document.getElementById('inputCpass2');
    const errorText = document.createElement('div');
    const errorTxt = document.createElement('div');
    const errorTx = document.createElement('div');
    errorText.classList.add('small', 'error-message');
    errorText.textContent = 'User already exists!';
    errorTxt.classList.add('small', 'error-message');
    errorTxt.textContent = 'Email already exists!';
    errorTx.classList.add('small', 'error-message');
    errorTx.textContent = 'Password do not match!';

    signupForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const username = usernameInput.value;
        const email = emailInput.value;
        const contact = document.getElementById('inputContact2').value;
        const password = document.getElementById('inputPassword2').value;
        const confirmPassword = pwInput.value;

        if (password !== confirmPassword) {
            pwInput.parentNode.appendChild(errorTx);
            return;
        }

        firebase.database().ref('Users/').orderByChild('email').equalTo(email).once('value')
        .then(function(snapshot) {
            if (snapshot.exists()) {
                emailInput.parentNode.appendChild(errorTxt);
            } else {
                const sanitizedUsername = sanitizeUsername(username);
                firebase.database().ref('Users/' + sanitizedUsername).once('value')
                .then(function(snapshot) {
                    if (snapshot.exists()) {
                        usernameInput.parentNode.appendChild(errorText);
                    } else {
                        const newUser = {
                            username: username,
                            email: email,
                            contact: contact,
                            password: password
                        };

                        firebase.database().ref('Users/' + sanitizedUsername).set(newUser)
                        .then(function() {
                            alert('Đăng ký thành công!');
                            signupForm.reset();
                        })
                        .catch(function(error) {
                            console.error('Lỗi khi thêm người dùng vào Firebase: ', error);
                            alert('Đã xảy ra lỗi. Vui lòng thử lại sau.');
                        });
                    }
                })
                .catch(function(error) {
                    console.error('Lỗi khi kiểm tra username trong Firebase: ', error);
                    alert('Đã xảy ra lỗi. Vui lòng thử lại sau.');
                });
            }
        })
        .catch(function(error) {
            console.error('Lỗi khi kiểm tra email trong Firebase: ', error);
            alert('Đã xảy ra lỗi. Vui lòng thử lại sau.');
        });
    });

    function handleSuccessfulLogin(username, isAdmin = false) {
        const modal = bootstrap.Modal.getInstance(document.getElementById('exampleModal'));
        modal.hide();

        localStorage.setItem('loggedInUser', JSON.stringify({ username: username, isAdmin: isAdmin }));

        updateUIForLoggedInUser(username, isAdmin);
    }

    function updateUIForLoggedInUser(username, isAdmin = false) {
        navUserAction.innerHTML = `
            <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" href="#" id="userDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <iconify-icon icon="healthicons:person" class="fs-4 me-2"></iconify-icon>
                </a>
                <ul class="dropdown-menu" aria-labelledby="userDropdown">
                    <li><a class="dropdown-item" href="../Profile/profile.html">Profile</a></li>
                    <li><a class="dropdown-item" href="#" id="logoutButton">Logout</a></li>
                </ul>
            </li>
        `;

        const logoutButton = document.getElementById('logoutButton');
        logoutButton.addEventListener('click', function() {
            localStorage.removeItem('loggedInUser');
            location.reload();
        });

        let welcomeMessage = `Xin chào, ${username}`;
        if (isAdmin) {
            welcomeMessage += ' (Admin)';
        }

        heroSection.innerHTML = `
            <div class="container-fluid">
                <div class="row">
                    <div class="col-md-8 col-lg-3 offset-md-2 padding-large ps-lg-0 pe-lg-5">
                        <h2 class="display-2 fw-semibold">${welcomeMessage}</h2>
                        <p class="secondary-font my-4 pb-2">Chào mừng bạn đến với nền tảng học tập trực tuyến của chúng tôi.</p>
                    </div>
                    <div class="col-md-6 col-lg-7 d-block d-md-none d-lg-block p-0">
                        <img src="images/billboard-img.jpg" alt="img" class="img-fluid">
                    </div>
                </div>
            </div>
        `;
    }

    function sanitizeUsername(username) {
        return username.replace(/[.#$/[\]]/g, ',');
    }
});
