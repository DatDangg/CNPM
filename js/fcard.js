let idActive = 0;

// Firebase configuration
const firebaseConfig = {
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
const database = firebase.database();

const getData = async () => {
  try {
    const path = localStorage.getItem('selectedFlashcardPath');
    const snapshot = await database.ref(path).once('value');
    const data = snapshot.val();
    console.log("data", data);
    
    const listContent = Object.keys(data).map((key, index) => {
      const item = data[key];
      const frontText = item.tuloai ? `${key} (${item.tuloai})` : key;
      const phienamText = item.phienam ? `<p>${item.phienam}</p>` : '';

      return `<div class="container-card ${index === idActive ? "active" : ""}" data-id="${key}">
                <div class="container-card-inner" onclick="flipCard(this)">
                  <div class="container-card-front">
                    <h1>${frontText}</h1>
                    ${phienamText}
                  </div>
                  <div class="container-card-back">
                    <h1>${item.nghia}</h1>
                  </div>
                </div>
              </div>`;
    });

    document.querySelector(".container-slide").innerHTML = listContent.join(" ");
  } catch (error) {
    console.error("Error fetching data from Firebase", error);
  }
};

const resetAndAddNewActive = (newIndex) => {
  const containerCards = document.querySelectorAll(".container-card");

  containerCards.forEach((item) => {
    item.className = "container-card";
  });

  containerCards[newIndex].className = "container-card active";
};

function flipCard(card) {
  card.classList.toggle('flip');
}

const action = (value) => {
  const containerSlide = document.querySelector(".container-slide");
  console.log("containerCard", containerSlide.scrollLeft);
  const maxScrollLeft = containerSlide.scrollWidth - containerSlide.clientWidth;
  if (value === "next" && containerSlide.scrollLeft < maxScrollLeft) {
    containerSlide.scrollLeft += 316;
    idActive++;
    resetAndAddNewActive(idActive);
  }

  if (value === "prev" && containerSlide.scrollLeft > 0) {
    containerSlide.scrollLeft -= 316;
    idActive--;
    resetAndAddNewActive(idActive);
  }

  if (value === "flip") {
    const containerCardActive = document.querySelector(".container-card.active");
    const isFlip = containerCardActive.className.includes("flip");
    containerCardActive.className = `container-card active ${isFlip ? "" : "flip"}`;
  }

  console.log("maxScrollLeft", maxScrollLeft);
};

getData();

