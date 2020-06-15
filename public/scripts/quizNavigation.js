const QUESTS = JSON.parse(document.getElementById("data").innerText);
const STATS = new Array(QUESTS.length);
function initStats() {
    for (let i = 0; i < QUESTS.length; i++) {
        STATS[i] = { questionId: QUESTS[i].id, answer: undefined, "timeSpent": 0 };
    }
}
initStats();
let QUESTION_ON_DISPLAY = 0;
let ALL_QUESTIONS_EXCEPT_THIS_ANSWERED;
const elTextField = document.getElementById("ans");
const elExitButton = document.getElementById("btnExit");
const elClock = document.getElementById("clock_cont");
let TOTAL_TIME = 0;
const TIME = window.setInterval(() => {
    STATS[QUESTION_ON_DISPLAY].timeSpent++;
    TOTAL_TIME++;
    const hrs = ("0" + Math.floor(TOTAL_TIME / 3600).toString()).slice(-2);
    const min = ("0" + Math.floor((TOTAL_TIME / 60) % 60).toString()).slice(-2);
    const sec = ("0" + (TOTAL_TIME % 60).toString()).slice(-2);
    elClock.innerText = `${hrs} ${min} ${sec}`;
}, 1000);
function showErrorMessage(message) {
    const erField = document.getElementById("errorfield");
    erField.innerText = message;
    erField.hidden = false;
}
function hideErrorMessage() {
    const erField = document.getElementById("errorfield");
    erField.hidden = true;
}
function updateAllQuestionsExceptThisAnwered(questionNumber) {
    for (let i = 0; i < QUESTS.length; i++) {
        if (i !== questionNumber) {
            if (STATS[i].answer === undefined) {
                ALL_QUESTIONS_EXCEPT_THIS_ANSWERED = false;
                return;
            }
        }
    }
    ALL_QUESTIONS_EXCEPT_THIS_ANSWERED = true;
}
function all_questions_anwered() {
    return (ALL_QUESTIONS_EXCEPT_THIS_ANSWERED &&
        elTextField.value !== "" &&
        !isNaN(Number(elTextField.value)));
}
function decideToAllowExitButton() {
    const temp = all_questions_anwered();
    if (elExitButton.disabled === temp) {
        elExitButton.disabled = !temp;
    }
}
function changeFieldsValuesForQuestion(qNumber) {
    document.getElementById("nrPytania").innerText = (qNumber + 1).toString();
    document.getElementById("trescPytania").innerText = QUESTS[qNumber].text;
    document.getElementById("kara").innerText = QUESTS[qNumber].penalty.toString();
}
/// returns true if no errors occured
function rememberCurrentAnswer() {
    if (elTextField.value !== "") {
        if (isNaN(Number(elTextField.value))) {
            showErrorMessage("Odpowiedzią musi być liczba całkowita!");
            return false;
        }
        else {
            hideErrorMessage();
            STATS[QUESTION_ON_DISPLAY].answer = Number(elTextField.value);
        }
    }
    else {
        STATS[QUESTION_ON_DISPLAY].answer = undefined;
    }
    return true;
}
function changeQuestionOnDisplay(newQuestionNumber) {
    if (newQuestionNumber >= 0 && newQuestionNumber < QUESTS.length) {
        if (!rememberCurrentAnswer())
            return;
        QUESTION_ON_DISPLAY = newQuestionNumber;
        changeFieldsValuesForQuestion(newQuestionNumber);
        if (STATS[newQuestionNumber].answer === undefined) {
            elTextField.value = "";
        }
        else {
            elTextField.value = STATS[newQuestionNumber].answer.toString();
        }
        elTextField.focus();
        updateAllQuestionsExceptThisAnwered(newQuestionNumber);
        if (newQuestionNumber === 0) {
            document.getElementById("btnPrev").disabled = true;
        }
        else {
            document.getElementById("btnPrev").disabled = false;
        }
        if (newQuestionNumber === QUESTS.length - 1) {
            document.getElementById("btnNext").disabled = true;
        }
        else {
            document.getElementById("btnNext").disabled = false;
        }
    }
}
function addListenersToForm() {
    document.getElementById("btnPrev").addEventListener("click", () => { changeQuestionOnDisplay(QUESTION_ON_DISPLAY - 1); });
    document.getElementById("btnNext").addEventListener("click", () => { changeQuestionOnDisplay(QUESTION_ON_DISPLAY + 1); });
    elTextField.addEventListener("input", decideToAllowExitButton);
}
function finishQuiz() {
    if (all_questions_anwered()) {
        if (!rememberCurrentAnswer())
            return;
        // console.log("Zamykam moduł udzielanie odpowiedzi");
        clearTimeout(TIME);
    }
}
function initChosenQuiz() {
    return new Promise((resolve, reject) => {
        updateAllQuestionsExceptThisAnwered(0);
        decideToAllowExitButton();
        changeQuestionOnDisplay(0);
        addListenersToForm();
        // usage of enter button in the quiz
        document.getElementById("formularz").addEventListener("submit", (e) => {
            e.preventDefault();
            if (QUESTION_ON_DISPLAY === QUESTS.length - 1) {
                finishQuiz();
                resolve();
            }
            else {
                changeQuestionOnDisplay(QUESTION_ON_DISPLAY + 1);
            }
            ;
        });
        elExitButton.addEventListener("click", () => {
            finishQuiz();
            resolve();
        });
        document.getElementById("btnHalt").addEventListener("click", () => {
            clearTimeout(TIME);
            reject();
        });
    });
}
initChosenQuiz().then(() => {
    console.log("zakonczono quiz");
    fetch('', {
        method: 'post',
        redirect: 'follow',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(STATS)
    }).then((res) => {
        if (res.ok) {
            console.log("fetch successful");
            window.location.reload(true);
        }
        else {
            showErrorMessage("Fetch nie powiódł się. Spróbuj ponownie");
            console.log(res);
            console.log("fetch unsuccessful");
        }
    }).catch(() => console.log("fetch failed"));
}).catch(() => window.location.href = "/");
//# sourceMappingURL=quizNavigation.js.map