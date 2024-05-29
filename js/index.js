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
    const loginForm = document.getElementById('form1');
    const navUserAction = document.getElementById('nav-user-action');
    const heroSection = document.getElementById('hero');
    
    // Kiểm tra xem đã có thông tin đăng nhập trong Local Storage chưa
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (loggedInUser) {
        // Nếu có, tự động đăng nhập người dùng
        const username = JSON.parse(loggedInUser).username;
        updateUIForLoggedInUser(username);
    }
    
    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        const email = document.getElementById('exampleInputEmail1').value;
    const password = document.getElementById('inputPassword1').value;

    console.log('Email:', email);
    console.log('Password:', password);
            
        firebase.database().ref('Users/').orderByChild('email').equalTo(email).once('value')
    .then(function(snapshot) {
        if (snapshot.exists()) {
            const userData = snapshot.val();
            console.log('User data:', userData); // Thêm dòng này để kiểm tra dữ liệu

            const username = Object.keys(userData)[0];
            const user = userData[username];
            
            if (user.password === password) {
                // Đăng nhập thành công
                const modal = bootstrap.Modal.getInstance(document.getElementById('exampleModal'));
                modal.hide();
                
                // Lưu thông tin đăng nhập vào Local Storage
                localStorage.setItem('loggedInUser', JSON.stringify({ username: username }));
                
                // Thực hiện các hành động sau khi đăng nhập thành công
                updateUIForLoggedInUser(username);
            } else {
                alert('Mật khẩu không đúng. Vui lòng thử lại.');
            }
        } else {
            alert('Email không tồn tại trong hệ thống. Vui lòng đăng ký trước.');
        }
    })
    .catch(function(error) {
        console.error('Lỗi khi kiểm tra email trong Firebase: ', error);
        alert('Đã xảy ra lỗi. Vui lòng thử lại sau.');
    });

    });

    const signupForm = document.getElementById('form2');
    const usernameInput = document.getElementById('InputUsername2');
    const errorText = document.createElement('div');
    errorText.classList.add('small','error-message');
    errorText.textContent = 'User already exists!';
    
    signupForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        const username = usernameInput.value;
        const email = document.getElementById('InputEmail2').value;
        const contact = document.getElementById('inputContact2').value;
        const password = document.getElementById('inputPassword2').value;
        const confirmPassword = document.getElementById('inputCpass2').value;
        
        if (password !== confirmPassword) {
            alert('Mật khẩu không trùng khớp!');
            return;
        }
        
        firebase.database().ref('Users/' + username).once('value')
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
                    
                    firebase.database().ref('Users/' + username).set(newUser)
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
    });

    function updateUIForLoggedInUser(username) {
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
        
        heroSection.innerHTML = `
            <div class="container-fluid">
                <div class="row">
                    <div class="col-md-8 col-lg-3 offset-md-2 padding-large ps-lg-0 pe-lg-5">
                        <h2 class="display-2 fw-semibold">Xin chào, ${username}</h2>
                        <p class="secondary-font my-4 pb-2">Chào mừng bạn đến với nền tảng học tập trực tuyến của chúng tôi.</p>
                    </div>
                    <div class="col-md-6 col-lg-7 d-block d-md-none d-lg-block p-0">
                        <img src="images/billboard-img.jpg" alt="img" class="img-fluid">
                    </div>
                </div>
            </div>
        `;
    }
});
(function() {
    emailjs.init('S55P341Zxv_KDoxYg');  // Thay YOUR_PUBLIC_KEY bằng public key thực tế của bạn
})();

// Function to generate random code
function generateRandomCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Function to send email with EmailJS
function sendEmail(email, code) {
    emailjs.send("service_n57axpe", "template_c5nvl8w", {  // Thay YOUR_SERVICE_ID và YOUR_TEMPLATE_ID bằng service ID và template ID thực tế của bạn
        to_email: email,
        verification_code: code
    })
    .then(() => {
        document.getElementById('message').textContent = "Mã xác nhận đã được gửi!";
        document.getElementById('verifyCodeForm').style.display = 'block';
        document.getElementById('passwordResetForm').style.display = 'none';
    })
    .catch((error) => {
        document.getElementById('message').textContent = "Đã xảy ra lỗi: " + error.message;
    });
}

// Event listener for form submission
document.getElementById('passwordResetForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const code = generateRandomCode();
    sendEmail(email, code);
    localStorage.setItem('verificationCode', code);
});

