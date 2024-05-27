firebaseConfig = {
  apiKey: "AIzaSyA1ztc1CsOdCqBoiegZcgSRevWaahaYRL4",
  authDomain: "toeic-4b09a.firebaseapp.com",
  databaseURL: "https://toeic-4b09a-default-rtdb.firebaseio.com",
  projectId: "toeic-4b09a",
  storageBucket: "toeic-4b09a.appspot.com",
  messagingSenderId: "394200216862",
  appId: "1:394200216862:web:0aa3bbfa97655dc5bec50f",
};

firebase.initializeApp(firebaseConfig);

localStorage.removeItem("selectedAnswers")
console.log();
const database = firebase.database();
const urlParams = new URLSearchParams(window.location.search);
const testNumber = urlParams.get("test");

const username = JSON.parse(localStorage.getItem('loggedInUser')).username; // Replace with the actual username or fetch from user context
console.log(username)
if (!testNumber) {
  console.error("Test number not provided!");
}

let selectedAnswers = {};
function loadData(questionNumber) {
  const testRef = database.ref(`Test${testNumber}/`).child(questionNumber);

  testRef.once("value", function (snapshot) {
    const data = snapshot.val();
    if (data) {
      let currentCheckValue = data.check;

      if (currentCheckValue === undefined || currentCheckValue === null) {
        currentCheckValue = questionNumber;
      }
      const relatedQuestionsRef = database
        .ref(`Test${testNumber}/`)
        .orderByChild("check")
        .equalTo(currentCheckValue);
      relatedQuestionsRef.once("value", function (relatedSnapshot) {
        const relatedQuestions = relatedSnapshot.val();
        if (relatedQuestions) {
          let htmlContent = "";
          let audioHTML = "";
          let imagesHTML = "";
          for (const key in relatedQuestions) {
            const relatedData = relatedQuestions[key];
            const questionNumber = key;

            if (!audioHTML && relatedData.audio) {
              audioHTML = `<div class="frame-4">
                <audio controls src="${relatedData.audio}"></audio>
              </div>`;
            }
            if (!imagesHTML && relatedData.image) {
              const images = relatedData.image
                .split(",")
                .map((url) => url.trim());
              imagesHTML = images
                .map(
                  (imageURL) =>
                    `<div class="img-wrapper"><img class="img-2" src="${imageURL}" /></div>`
                )
                .join("");
            }

            htmlContent += generateQuestionHTML(relatedData, questionNumber);
          }

          htmlContent = `${audioHTML}${imagesHTML}${htmlContent}`;
          document.querySelector(".frame-3").innerHTML = htmlContent;

          // Load and apply saved answers from localStorage
          applySavedAnswers(currentCheckValue);
        } else {
          console.error("No related questions found");
        }
      });
    } else {
      console.error("Data not found");
    }
  });
}

function applySavedAnswers(checkValue) {
  const storedAnswers = localStorage.getItem("selectedAnswers");
  if (storedAnswers) {
    selectedAnswers = JSON.parse(storedAnswers);
    for (const questionNumber in selectedAnswers[checkValue]) {
      const answer = selectedAnswers[checkValue][questionNumber];
      const answerElement = getAnswerElement(questionNumber, answer);
      if (answerElement) {
        updateAnswerElement(answerElement, true);
      }
    }
  }
}

function generateQuestionHTML(data, questionNumber) {
  const answerA = data.answers
    ? data.answers.A
      ? `${data.answers.A}`
      : ""
    : "";
  const answerB = data.answers
    ? data.answers.B
      ? `${data.answers.B}`
      : ""
    : "";
  const answerC = data.answers
    ? data.answers.C
      ? `${data.answers.C}`
      : ""
    : "";
  const answerD = data.answers
    ? data.answers.D
      ? `${data.answers.D}`
      : ""
    : "";

  return `
<div class="cau-TL" data-question="${questionNumber}" data-check="${
    data.check || questionNumber
  }">
  <div class="text-wrapper-6">${
    questionNumber + ". " + data.question || ""
  }</div>
  <div class="overlap-group-wrapper" onclick="selectAnswer(this, 'A')">
    <div class="overlap-group-2">
      <div class="rectangle"><div class="rectangle-2"></div></div>
      <div class="text-wrapper-8">(A) ${answerA}</div>
    </div>
  </div>
  <div class="overlap-group-wrapper" onclick="selectAnswer(this, 'B')">
    <div class="overlap-group-2">
      <div class="rectangle"><div class="rectangle-2"></div></div>
      <div class="text-wrapper-8">(B) ${answerB}</div>
    </div>
  </div>
  <div class="overlap-group-wrapper" onclick="selectAnswer(this, 'C')">
    <div class="overlap-group-2">
      <div class="rectangle"><div class="rectangle-2"></div></div>
      <div class="text-wrapper-8">(C) ${answerC}</div>
    </div>
  </div>
  <div class="overlap-group-wrapper" onclick="selectAnswer(this, 'D')">
    <div class="overlap-group-2">
      <div class="rectangle"><div class="rectangle-2"></div></div>
      <div class="text-wrapper-8">(D) ${answerD}</div>
    </div>
  </div>
</div>
`;
}

function selectQuestion(questionNumber) {
  loadData(questionNumber);
}
window.onload = () => {
  loadAnswersFromLocal();
  const totalQuestions = 200,
    questionsPerPage = 20,
    columns = 5,
    rows = 4;
  const totalPages = Math.ceil(totalQuestions / questionsPerPage);
  const bngCuHi = document.querySelector(".bng-cu-hi");
  let currentPage = 1;

  function renderPage(page) {
    bngCuHi.innerHTML = "";
    const startQuestion = (page - 1) * questionsPerPage + 1;
    const endQuestion = Math.min(page * questionsPerPage, totalQuestions);
    const frame9 = document.createElement("div");
    frame9.classList.add("frame-9");

    for (let i = startQuestion; i <= endQuestion; i++) {
      const column = (i - 1) % columns,
        row = Math.floor((i - 1) / columns) % rows;
      if (column === 0) {
        const frame10 = document.createElement("div");
        frame10.classList.add("frame-10");
        frame9.appendChild(frame10);
      }
      const frame10s = frame9.querySelectorAll(".frame-10");
      const currentFrame10 = frame10s[frame10s.length - 1];
      const numberButton = document.createElement("div");
      numberButton.classList.add("number-button");
      numberButton.setAttribute("onclick", `selectQuestion(${i})`);
      numberButton.setAttribute("data-question", i);
      const textWrapper11 = document.createElement("div");
      textWrapper11.classList.add("text-wrapper-11");
      textWrapper11.textContent = i;
      numberButton.appendChild(textWrapper11);
      currentFrame10.appendChild(numberButton);
    }

    bngCuHi.appendChild(frame9);

    const prePageButton = document.createElement("div");
    prePageButton.classList.add("pre-page-button");
    prePageButton.textContent = "<";

    const nextPageButton = document.createElement("div");
    nextPageButton.textContent = ">";
    nextPageButton.classList.add("next-page-button");
    const pageButtonsWrapper = document.createElement("div");
    pageButtonsWrapper.classList.add("page-buttons-wrapper");

    pageButtonsWrapper.appendChild(prePageButton);
    pageButtonsWrapper.appendChild(nextPageButton);
    bngCuHi.appendChild(pageButtonsWrapper);

    if (page > 1) {
      prePageButton.addEventListener("click", () => {
        currentPage--;
        renderPage(currentPage);
      });
    }

    if (page < totalPages) {
      nextPageButton.addEventListener("click", () => {
        currentPage++;
        renderPage(currentPage);
      });
    }
  }

  renderPage(currentPage);
};

function loadAnswersFromLocal() {
  const storedAnswers = localStorage.getItem("selectedAnswers");
  if (storedAnswers) {
    selectedAnswers = JSON.parse(storedAnswers);
  }
}

function selectAnswer(answerElement, answer) {
  const questionNumber = getQuestionNumberFromAnswerElement(answerElement);
  const currentCheck = getCurrentCheck(questionNumber);
  if (!selectedAnswers[currentCheck]) {
    selectedAnswers[currentCheck] = {};
  }

  if (!selectedAnswers[currentCheck][questionNumber]) {
    selectedAnswers[currentCheck][questionNumber] = answer;
    updateAnswerElement(answerElement, true);
    saveAnswerToLocal(currentCheck, questionNumber, answer);
  } else {
    if (selectedAnswers[currentCheck][questionNumber] === answer) {
      delete selectedAnswers[currentCheck][questionNumber];
      updateAnswerElement(answerElement, false);
      saveAnswerToLocal(currentCheck, questionNumber, null);
    } else {
      const previousAnswerElement = getAnswerElement(
        questionNumber,
        selectedAnswers[currentCheck][questionNumber]
      );
      updateAnswerElement(previousAnswerElement, false);
      selectedAnswers[currentCheck][questionNumber] = answer;
      updateAnswerElement(answerElement, true);
      saveAnswerToLocal(currentCheck, questionNumber, answer);
    }
  }
}

function saveAnswerToLocal(checkValue, questionNumber, answer) {
  if (!selectedAnswers[checkValue]) {
    selectedAnswers[checkValue] = {};
  }
  if (answer) {
    selectedAnswers[checkValue][questionNumber] = answer;
  } else {
    delete selectedAnswers[checkValue][questionNumber];
  }
  localStorage.setItem("selectedAnswers", JSON.stringify(selectedAnswers));
}

function getQuestionNumberFromAnswerElement(answerElement) {
  return answerElement.closest(".cau-TL").getAttribute("data-question");
}

function updateAnswerElement(answerElement, isSelected) {
  if (isSelected) {
    answerElement.classList.add("selected");
  } else {
    answerElement.classList.remove("selected");
  }
}

function getCurrentCheck(questionNumber) {
  const questionElement = findQuestionElementByNumber(questionNumber);
  return questionElement
    ? questionElement.getAttribute("data-check")
    : questionNumber;
}

function findQuestionElementByNumber(questionNumber) {
  const questionElements = document.querySelectorAll(".cau-TL");
  for (let i = 0; i < questionElements.length; i++) {
    const textWrapper = questionElements[i].querySelector(".text-wrapper-6");
    if (
      textWrapper &&
      textWrapper.textContent.startsWith(`${questionNumber}.`)
    ) {
      return questionElements[i];
    }
  }
  return null;
}

function getAnswerElement(questionNumber, answer) {
  const questionElement = findQuestionElementByNumber(questionNumber);
  return questionElement
    ? questionElement.querySelector(
        `.overlap-group-wrapper[onclick="selectAnswer(this, '${answer}')"]`
      )
    : null;
}

function saveAnswerToFirebase(questionNumber, answer) {
  const userTestRef = database.ref(`Users/${username}/Test${testNumber}`);
  userTestRef.child(questionNumber).set(answer, (error) => {
    if (error) {
      console.error("Error saving answer:", error);
    } else {
      console.log("Answer saved successfully");
    }
  });
}

function getNewTestAttempt(callback) {
  const userTestRef = database.ref(`Users/${username}/Test${testNumber}`);
  userTestRef.once("value", (snapshot) => {
    const data = snapshot.val();
    let attemptNumber = 1;
    if (data) {
      attemptNumber = Object.keys(data).length + 1;
    }
    callback(attemptNumber);
  });
}


function loadSavedAnswers(checkValue) {
  const userTestRef = database.ref(`Users/${username}/Test${testNumber}`);
  userTestRef.once("value", function (snapshot) {
    const data = snapshot.val();
    if (data) {
      for (const questionNumber in data) {
        const questionElement = findQuestionElementByNumber(questionNumber);
        if (
          questionElement &&
          questionElement.getAttribute("data-check") === checkValue
        ) {
          const answer = data[questionNumber];
          if (answer) {
            const answerElement = getAnswerElement(questionNumber, answer);
            if (answerElement) {
              updateAnswerElement(answerElement, true);
              selectedAnswers[checkValue] = selectedAnswers[checkValue] || {};
              selectedAnswers[checkValue][questionNumber] = answer;
            }
          }
        }
      }
    }
  });
}

function formatTrans(trans) {
  // Thay thế dấu "|" bằng các thẻ <br> để tạo dòng mới
  return trans.replace(/\|/g, "<br>");
}

function getCurrentQuestionNumber() {
  // Lấy số câu hỏi hiện tại từ button được chọn
  const selectedButton = document.querySelector(".number-button.selected");
  if (selectedButton) {
    return parseInt(selectedButton.getAttribute("data-question"));
  } else {
    return null;
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const deContainer = document.querySelector(".de");
  // Lắng nghe sự kiện chuột phải trong phần "de"
  deContainer.addEventListener("contextmenu", function (event) {
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();
    // Kiểm tra xem đã chọn văn bản nào chưa
    if (selectedText !== "") {
      // Hiển thị modal
      const modal = document.getElementById("flashcardModal");
      modal.style.display = "block";
      document.getElementById("vocabulary").textContent = selectedText;
      // Ngăn chặn hành động mặc định của trình duyệt khi chuột phải
      event.preventDefault();
    }
  });

  // Lắng nghe sự kiện click vào nút đóng modal
  document.querySelector(".close").addEventListener("click", function () {
    document.getElementById("flashcardModal").style.display = "none";
  });

  // Lắng nghe sự kiện click vào nút "Thêm vào Flashcard"
  document
    .getElementById("submitFlashcard")
    .addEventListener("click", function () {
      const vocabulary = document.getElementById("vocabulary").textContent;
      const meaning = document.getElementById("meaning").value;
      const flashcardRef = firebase
        .database()
        .ref("MyFlashCard")
        .child(vocabulary);
      flashcardRef.set({
        meaning: meaning,
      });
      // Thêm logic xử lý khi click vào đây, ví dụ: thêm từ và nghĩa vào Flashcard
      alert(
        "Đã thêm từ '" +
          vocabulary +
          "' với nghĩa '" +
          meaning +
          "' vào Flashcard!"
      );
      // Ẩn modal sau khi thêm vào Flashcard thành công
      document.getElementById("flashcardModal").style.display = "none";
    });
});
function submitTest() {
  getNewTestAttempt((attemptNumber) => {
    const userTestRef = database.ref(
      `Users/${username}/Test${testNumber}/Test${testNumber}_${attemptNumber}`
    );

    // Create a new object to store the answers in the correct format
    const formattedAnswers = {};
    for (const checkValue in selectedAnswers) {
      for (const questionNumber in selectedAnswers[checkValue]) {
        formattedAnswers[questionNumber] =
          selectedAnswers[checkValue][questionNumber];
      }
    }

    userTestRef.set(formattedAnswers, (error) => {
      if (error) {
        console.error("Error saving answer:", error);
      } else {
        console.log("Answer saved successfully");
        localStorage.removeItem("selectedAnswers");
        const urlParams = new URLSearchParams({
          test: testNumber,
          username: username,
          attemptNumber: attemptNumber,
        });
        window.location.href = `results.html?${urlParams.toString()}`;
      }
    });
  });
}
