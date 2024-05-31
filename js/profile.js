// Reference to the Firebase database
const database = firebase.database();

function updateProfile() {
  const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
  const username = loggedInUser.username;

  document.querySelector('.content__title h1').innerText = username;

  database.ref(`Users/${username}`).once('value', (snapshot) => {
    const userData = snapshot.val();

    if (userData) {
      testDescriptions = '<table class = "table"><thead><tr><th>Test</th><th>Test Times</th><th>Score</th><th>View</th></tr></thead>';

      for (const testKey in userData) {
        if (testKey.startsWith('Test')) {
          const test = userData[testKey];
          const testName = testKey.replace('_', ' ');

          for (const subTestKey in test) {
            const subTest = test[subTestKey];
            const subTestName = subTestKey.replace('_', ' ');
            const score = subTest.score;
            const viewLink = `../etest/results.html?test=${testKey.slice(4)}&username=${username}&attemptNumber=${subTestKey.slice(6)}`;

            testDescriptions += `<tr><th scope="row">${testName}</th><td>${subTestName.slice(6)}</td><td>${score}</td><td><a href="${viewLink}">👀</a></td></tr>`;
          }
        }
      }

      testDescriptions += '</table>';
      document.querySelector('.content__description').innerHTML = testDescriptions;
    }
  });
}

function showEditModal() {
  const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
  const username = loggedInUser.username;

  database.ref(`Users/${username}`).once('value', (snapshot) => {
    const userData = snapshot.val();
    if (userData) {
      document.getElementById('editUsername').value = username;
      document.getElementById('editEmail').value = userData.email;
    }
  });

  const editProfileModal = new bootstrap.Modal(document.getElementById('editProfileModal'));
  editProfileModal.show();
}

function saveProfile() {
  const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
  const username = loggedInUser.username;

  const newEmail = document.getElementById('editEmail').value;

  const currentPassword = document.getElementById('currentPassword').value;
  const newPassword = document.getElementById('newPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  if (newPassword && newPassword !== confirmPassword) {
    Swal.fire({
      icon: 'error',
      title: 'Lỗi',
      text: 'Mật khẩu xác nhận không khớp!'
    });
    return;
  }

  database.ref(`Users/${username}`).once('value', (snapshot) => {
    const userData = snapshot.val();

    // Check if the current password is correct
    if (userData && userData.password === currentPassword) {
      const updates = {
        email: newEmail,
      };

      if (newPassword) {
        updates.password = newPassword;
      }

      database.ref(`Users/${username}`).update(updates).then(() => {
        Swal.fire({
          icon: 'success',
          title: 'Thành công',
          text: 'Mật khẩu đã được cập nhật!'
        }).then(() => {
          localStorage.setItem('loggedInUser', JSON.stringify({ username: username, email: newEmail }));
          window.location.reload();
        });
      });
    } else if (!newPassword) {
      // If the password is not being changed, just update the email
      database.ref(`Users/${username}`).update({
        email: newEmail,
      }).then(() => {
        Swal.fire({
          icon: 'success',
          title: 'Thành công',
          text: 'Email đã được cập nhật!'
        }).then(() => {
          localStorage.setItem('loggedInUser', JSON.stringify({ username: username, email: newEmail }));
          window.location.reload();
        });
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: 'Mật khẩu hiện tại không đúng!'
      });
    }
  });
}

window.onload = updateProfile;
