const database = firebase.database();
const urlParams = new URLSearchParams(window.location.search);
const testNumber = urlParams.get("test");
const username = urlParams.get("username");
const attemptNumber = urlParams.get("attemptNumber");

if (!testNumber || !username) {
  console.error("Test number or username not provided!");
  document.getElementById("results").innerHTML =
    "Error: Missing test number or username.";
}

const userTestRef = database.ref(
  `Users/${username}/Test${testNumber}/Test${testNumber}_${attemptNumber}`
);
const testRef = database.ref(`Test/Test${testNumber}/`);

Promise.all([userTestRef.once("value"), testRef.once("value")])
  .then(([userSnapshot, testSnapshot]) => {
    const userData = userSnapshot.val();
    
    const testData = testSnapshot.val();
    let score = 0;
    let totalQuestions = 0;
    let lastCheck = null;

    let htmlContent = "";
    let summaryContent = "";
    for (const questionNumber in testData) {
      if (questionNumber === 'key' || questionNumber === 'hide') continue;
      const question = testData[questionNumber];
      if (!question) continue;

      totalQuestions++;
      const userAnswer = userData[questionNumber] || "N/A";
      const correctAnswer = question.key || "N/A";
      const isCorrect = userAnswer === correctAnswer;
      if (isCorrect) score++;

      const questionText = question.question
        ? `<p class="question-text">${question.question}</p>`
        : "";
      const answers = question.answers
        ? `
        <p class="answers">
          ${question.answers.A ? `A: ${question.answers.A}<br>` : ""}
          ${question.answers.B ? `B: ${question.answers.B}<br>` : ""}
          ${question.answers.C ? `C: ${question.answers.C}<br>` : ""}
          ${question.answers.D ? `D: ${question.answers.D}<br>` : ""}
        </p>`
        : "";

      let questionImage = "";
      if (question.check !== lastCheck) {
        lastCheck = question.check;
        if (question.image) {
          questionImage = `<div class="question-image"><img src="${question.image}" alt="Question Image"></div>`;
        }
      }

      const trans = question.trans
        ? question.trans
            .split("%")
            .map((line) => `<span>${line.trim()}</span>`)
            .join("<br>")
        : "";

      const explain = question.explain
        ? question.explain
            .split("%")
            .map((line) => `<span>${line.trim()}</span>`)
            .join("<br>")
        : "";

        htmlContent += `
        <div class="question" id="question-${questionNumber}">
          <p class="question-number">Question ${questionNumber}</p>
          ${questionImage}
          ${questionText}
          ${answers}
          <p class="user-answer ${
            isCorrect ? "correct" : "incorrect"
          }">Your answer: ${userAnswer}</p>
          <p class="correct-answer">Correct answer: ${correctAnswer}</p>
          ${
            trans
              ? `<span class="toggle-button" onclick="toggleVisibility('trans-${questionNumber}')">Show Transcript <i class="fas fa-caret-down"></i></span>
          <div id="trans-${questionNumber}" class="trans">${trans}</div>`
              : ""
          }
          ${
            explain
              ? `<span class="toggle-button" onclick="toggleVisibility('explain-${questionNumber}')">Show Explanation <i class="fas fa-caret-down"></i></span>
          <div id="explain-${questionNumber}" class="explain">${explain}</div>`
              : ""
          }
        </div>
      `;

      summaryContent += `
        <div class="question-summary ${isCorrect ? "correct" : "incorrect"}" onclick="scrollToQuestion(${questionNumber})">
          ${questionNumber}
        </div>
      `;
    }

    document.getElementById("results").innerHTML = htmlContent;
    document.getElementById("questions-summary").innerHTML =
      summaryContent;
    document.getElementById(
      "score"
    ).innerHTML = `Score: ${score} / ${totalQuestions}`;

    // Save the score to Firebase
    const scoreRef = database.ref(`Users/${username}/Test${testNumber}/Test${testNumber}_${attemptNumber}`);
    scoreRef.update({
      score: score
    })
    // .then(() => {
    //   console.log("Score saved successfully.");
    // }).catch((error) => {
    //   console.error("Error saving score:", error);
    // });
  })
  .catch((error) => {
    console.error("Error fetching test data:", error);
    document.getElementById("results").innerHTML =
      "Error fetching test data.";
  });

function toggleVisibility(id) {
  const element = document.getElementById(id);
  if (element.style.display === "none" || element.style.display === "") {
    element.style.display = "block";
  } else {
    element.style.display = "none";
  }
}
function scrollToQuestion(questionNumber) {
  const element = document.getElementById(`question-${questionNumber}`);
  const headerOffset = 100;
  const elementPosition = element.getBoundingClientRect().top;
  const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

  window.scrollTo({
    top: offsetPosition,
    behavior: "smooth"
  });
}