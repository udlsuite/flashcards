//Object containing term and term definition for each flash card
let flashCards = [
    { term: "Accessible", definition: "The opportunity to acquire the same information, engage in the same interactions and enjoy the same services in an effective way with equivalent ease of use. Acessibility my require removing barriers so that environments are perceivable, operable and understandable to most users." },
    { term: "Acronym", definition: "An abbreviation formed by the initial letters of other words which are then pronounced as a new word. Eg - Ambition, Scholarship, Passion, Integrity, Respect, Excellence = ASPIRE" },
    { term: "Alt Text", definition: "Initialism for Alternative Text" },
    { term: "Captions", definition: "Text version of the spoken elements of television, film, theatre, animations or visual content"},
    { term: "Diversity", definition: "Diversity refers to the presence of difference within a given setting. This includes (but is not limited to) variations in race, ethnicity, gender, age, sexual orientation, socioeconomic status, physical abilities, religious beliefs, and other attributes." },
    { term: "Equality", definition: "The right of different groups of people to have similar social position and receive the same treatment" },
    { term: "Initialism", definition: "An abbreviation formed by the initial letters of other words which are not pronounced as a new word but separately by the letters used. Eg - FBI, QLD, USA" },
    { term: "Inclusion", definition: "Inclusion is creating an environment and culture that creates a sense of belonging for everyone. It is about ensuring each person feels valued and respected and can be their authenic self. " },
    { term: "Stereotypes", definition: "A set idea that people have about what someone or something is like, especially an idea that is wrong. UDL best practice involves challenging stereotypical or harmful portrayals of people and cultures." },
    { term: "Transcript", definition: "A text version of information provided through speech and non-speech means. eg. text version of video captions, or text version of information delivered visually through formats such as infographics" },
    { term: "Usable (UDL)", definition: "Refers to the ease with which learners can navigate and interact with educational materials and tools. It involves designing learning experiences that are intuitive, straightforward, and user-friendly. " },
    { term: "WCAG", definition: "WCAG is the Web Content Accessibility Guidelines. It is a set of internationally recognised standards for making web content more accessible for all." },
];


//Either retrieve array from local storage or initialise as an empty array
let iRemember = JSON.parse(localStorage.getItem("iRemember")) || [];

//Initialise available cards globally
let availableCards;

let individualSetFeedbackText = "You have completed this set of flashcards";
let overallFeedback = "Well done! You have remembered all of the term definitions.";
let buttonsText = []

const container = document.getElementById("cards-container");

const overallFeedbackPopup = document.createElement("div");
overallFeedbackPopup.id = "overall_dialog_feedback";
// overallFeedbackPopup.style.display = "none"; // hide initially
const dialogMessage = document.createElement("p");
dialogMessage.textContent = overallFeedback;
const refreshButton = document.createElement("button");
refreshButton.textContent = "Reset"
refreshButton.className = "refresh_button";
overallFeedbackPopup.appendChild(dialogMessage);
overallFeedbackPopup.appendChild(refreshButton);

const setFeedbackPopup = document.createElement("div");
setFeedbackPopup.id = "setdialog_feedback";
// setFeedbackPopup.style.display = "none"; // hide initially
const setDialogMessage = document.createElement("p");
setDialogMessage.textContent = individualSetFeedbackText;
const continueLearning = document.createElement("button");
continueLearning.textContent = "Continue"
continueLearning.className = "continue_button";
setFeedbackPopup.appendChild(setDialogMessage);
setFeedbackPopup.appendChild(continueLearning);

// container.appendChild(cardsColumn);
// container.appendChild(buttonColumn);

function generateCards() {
    container.innerHTML = "";

    // re-create columns each time
    const cardsColumn = document.createElement("div");
    cardsColumn.classList.add("cards_column");

    const buttonColumn = document.createElement("div");
    buttonColumn.classList.add("button_column");

    container.appendChild(cardsColumn);
    container.appendChild(buttonColumn);

    // --- BUTTON SET (always at top) ---
    const buttonSet = document.createElement("div");
    // buttonSet.className = "buttons_set";
    buttonSet.className = "buttons_set disabled";
    buttonSet.style.display = "none"; // hidden until first card is flipped
    buttonColumn.appendChild(buttonSet);

    const buttonConfigs = [
        { className: "remembered", text: "I remembered this" },
        { className: "partial", text: "I didn't quite remember" },
        { className: "forgot", text: "I do not remember this" }
    ];

    buttonConfigs.forEach(cfg => {
        const btn = document.createElement("button");
        btn.className = cfg.className;
        btn.textContent = cfg.text;
        buttonSet.appendChild(btn);

        btn.addEventListener("click", () => handleAnswer(cfg.className));
    });

    // Get available cards
    availableCards = flashCards.filter((card, index) => !iRemember.includes(`card_${index + 1}`));
    console.log(availableCards)

    // Select up to 3 random cards
    const selectedCards = [];
    const pool = [...availableCards];
    for (let i = 0; i < 3 && pool.length > 0; i++) {
        const idx = Math.floor(Math.random() * pool.length);
        selectedCards.push(pool[idx]);
        pool.splice(idx, 1);
    }

    // Create wrappers for cards
    selectedCards.forEach((cardData, index) => {
        const cardId = `card_${flashCards.indexOf(cardData) + 1}`;
        const card = document.createElement("div");
        card.className = "flash_card";
        card.id = cardId;
        if (index > 0) card.classList.add("hide");
        card.setAttribute("tabindex", "0");

        const cardInner = document.createElement("div");
        cardInner.className = "flash_card_inner";

        const cardFront = document.createElement("div");
        cardFront.className = "flash_card_front";
        cardFront.textContent = cardData.term;


        const cardBack = document.createElement("div");
        cardBack.className = "flash_card_back";
        cardBack.textContent = cardData.definition;

        cardInner.appendChild(cardFront);
        cardInner.appendChild(cardBack);
        card.appendChild(cardInner);

        // wrapper.appendChild(card);
        cardsColumn.appendChild(card);

        card.addEventListener("click", () => {
            toggleFlip(cardInner);
        });

        card.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault(); // prevent scrolling on space
                toggleFlip(cardInner);
            }
        });

        // factor out the flip logic so you don’t duplicate it
        function toggleFlip(cardInner) {
            cardInner.classList.toggle("flipped");

            // show buttons once first flip happens
            buttonSet.style.display = "flex";

            if (cardInner.classList.contains("flipped")) {
                // enable buttons
                buttonSet.classList.remove("disabled");
                 buttonSet.querySelectorAll("button").forEach(btn => btn.tabIndex = 0);
            } else {
                // disable buttons
                buttonSet.classList.add("disabled");
                buttonSet.querySelectorAll("button").forEach(btn => btn.tabIndex = -1);

            }
        }
    });

    let currentIndex = 0; // track which card is active

    function handleAnswer(choice) {
        const cards = container.querySelectorAll(".flash_card");
        const currentCard = cards[currentIndex];

        if (choice === "remembered") {
            iRemember.push(currentCard.id);
            localStorage.setItem("iRemember", JSON.stringify(iRemember));
        }

        // lock current card
        currentCard.style.opacity = "0.5";
        currentCard.style.pointerEvents = "none";

        // immediately disable buttons after answering
        buttonSet.classList.add("disabled");

        // reveal next
        currentIndex++;
        if (currentIndex < cards.length) {
            cards[currentIndex].classList.remove("hide");
        } else {
            // Recalculate availableCards here
            availableCards = flashCards.filter((card, index) => !iRemember.includes(`card_${index + 1}`));

            if (availableCards.length === 0) {
                container.appendChild(overallFeedbackPopup);
            } else {
                container.appendChild(setFeedbackPopup);
            }
            buttonSet.style.display = "none";
        }
    }

}

// Initial load
generateCards();

refreshButton.addEventListener("click", () => {
    // Clear the iRemember array and local storage
    iRemember = [];
    localStorage.removeItem("iRemember");
    // Hide feedback popup
    container.removeChild(overallFeedbackPopup);
    // Regenerate all cards
    generateCards();
});

continueLearning.addEventListener("click", () => {
    // Hide feedback popup
    container.removeChild(setFeedbackPopup);
    // Regenerate all cards
    generateCards();
});

