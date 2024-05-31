(function() {
    emailjs.init("S55P341Zxv_KDoxYg");
  })();
  var resetCode; // To store the reset code
  var email; // To store the email

  document.getElementById('forgotPasswordForm').addEventListener('submit', function(event) {
    event.preventDefault();
    email = document.getElementById('forgotPasswordEmail').value;
    resetCode = Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit random number

    var templateParams = {
      to_email: email,
      verification_code: resetCode
    };

    emailjs.send('service_n57axpe', 'template_c5nvl8w', templateParams)
      .then(function(response) {
        alert('Reset code sent successfully to ' + email);
        document.getElementById('forgotPasswordStep1').classList.add('d-none');
        document.getElementById('forgotPasswordStep2').classList.remove('d-none');
      }, function(error) {
        console.error('FAILED...', error);
        alert('Failed to send reset code. Please try again later.');
      });
  });

  document.getElementById('verifyResetCodeForm').addEventListener('submit', function(event) {
    event.preventDefault();

    var enteredCode = document.getElementById('resetCodeInput').value;
    var newPassword = document.getElementById('newPasswordInput').value;
    var confirmNewPassword = document.getElementById('confirmNewPasswordInput').value;

    if (enteredCode == resetCode) {
      if (newPassword === confirmNewPassword) {
        var database = firebase.database();
        var usersRef = database.ref('Users');
        
        // Find user by email and update the password
        usersRef.orderByChild('email').equalTo(email).once('value', function(snapshot) {
          if (snapshot.exists()) {
            var userData = snapshot.val();
            var userKey = Object.keys(userData)[0]; // Get the key of the user
            usersRef.child(userKey).update({
              password: newPassword
            }).then(function() {
              alert('Password updated successfully.');
              // Hide modal
              $('#forgotPasswordModal').modal('hide');
            }).catch(function(error) {
              console.error('Error updating password:', error);
              alert('Failed to update password. Please try again later.');
            });
          } else {
            alert('User not found.');
          }
        });
      } else {
        alert('Passwords do not match.');
      }
    } else {
      alert('Invalid reset code.');
    }
  });