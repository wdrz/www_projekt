import { AnswerToOne, Question, Quiz } from './typeDeclarations.js';

const QUESTS: Question[] = JSON.parse(document.getElementById("data").innerText);
const STATS: AnswerToOne[] = new Array<AnswerToOne>(QUESTS.length);

function initStats(): void {
  for (let i : number = 0; i < QUESTS.length; i++) {
    STATS[i] = {questionId: QUESTS[i].id, answer : undefined, "timeSpent" : 0};
  }
}

initStats();

let QUESTION_ON_DISPLAY : number = 0;
let ALL_QUESTIONS_EXCEPT_THIS_ANSWERED : boolean;

const elTextField = document.getElementById("ans") as HTMLInputElement;
const elExitButton = document.getElementById("btnExit") as HTMLInputElement;
const elClock =  document.getElementById("clock_cont") as HTMLInputElement;

let TOTAL_TIME : number = 0;
const TIME : number = window.setInterval( () => {
  STATS[QUESTION_ON_DISPLAY].timeSpent++;
  TOTAL_TIME++;
  const hrs : string = ("0" + Math.floor(TOTAL_TIME / 3600).toString()).slice(-2);
  const min : string = ("0" + Math.floor((TOTAL_TIME / 60) % 60).toString()).slice(-2);
  const sec : string = ("0" + (TOTAL_TIME % 60).toString()).slice(-2);
  elClock.innerText = `${hrs} ${min} ${sec}`;
}, 1000);

function showErrorMessage(message : string) : void {
  const erField = document.getElementById("errorfield") as HTMLElement;
  erField.innerText = message;
  erField.hidden = false;
}

function hideErrorMessage() {
  const erField = document.getElementById("errorfield") as HTMLElement;
  erField.hidden = true;
}

function updateAllQuestionsExceptThisAnwered(questionNumber : number): void {
  for (let i : number = 0; i < QUESTS.length; i++) {
    if (i !== questionNumber) {
      if (STATS[i].answer === undefined) {
        ALL_QUESTIONS_EXCEPT_THIS_ANSWERED = false;
        return;
      }
    }
  }
  ALL_QUESTIONS_EXCEPT_THIS_ANSWERED = true;
}

function all_questions_anwered(): boolean {
  return (ALL_QUESTIONS_EXCEPT_THIS_ANSWERED &&
    elTextField.value !== "" &&
    !isNaN(Number(elTextField.value)))
}

function decideToAllowExitButton(): void {
  const temp : boolean = all_questions_anwered();
  if (elExitButton.disabled === temp) {
    elExitButton.disabled = !temp;
  }
}

function changeFieldsValuesForQuestion(qNumber : number) {
  document.getElementById("nrPytania").innerText = (qNumber + 1).toString();
  document.getElementById("trescPytania").innerText = QUESTS[qNumber].text;
  document.getElementById("kara").innerText = QUESTS[qNumber].penalty.toString();
}

/// returns true if no errors occured
function rememberCurrentAnswer() : boolean {
  if (elTextField.value !== "") {
    if (isNaN(Number(elTextField.value))) {
      showErrorMessage("Odpowiedzią musi być liczba całkowita!");
      return false;
    } else {
      hideErrorMessage();
      STATS[QUESTION_ON_DISPLAY].answer = Number(elTextField.value);
    }
  } else {
    STATS[QUESTION_ON_DISPLAY].answer = undefined;
  }
  return true;
}

function changeQuestionOnDisplay(newQuestionNumber : number): void {
  if (newQuestionNumber >= 0 && newQuestionNumber < QUESTS.length) {
    if (!rememberCurrentAnswer()) return;

    QUESTION_ON_DISPLAY = newQuestionNumber;
    changeFieldsValuesForQuestion(newQuestionNumber);
    if (STATS[newQuestionNumber].answer === undefined) {
      elTextField.value = "";
    } else {
      elTextField.value = STATS[newQuestionNumber].answer.toString();
    }
    elTextField.focus();
    updateAllQuestionsExceptThisAnwered(newQuestionNumber);
    if (newQuestionNumber === 0) {
      (document.getElementById("btnPrev") as HTMLInputElement).disabled = true;
    } else {
      (document.getElementById("btnPrev") as HTMLInputElement).disabled = false;
    }

    if (newQuestionNumber === QUESTS.length - 1) {
      (document.getElementById("btnNext") as HTMLInputElement).disabled = true;
    } else {
      (document.getElementById("btnNext") as HTMLInputElement).disabled = false;
    }
  }
}

function addListenersToForm() {
  document.getElementById("btnPrev").addEventListener("click", () => {changeQuestionOnDisplay(QUESTION_ON_DISPLAY - 1);});
  document.getElementById("btnNext").addEventListener("click", () => {changeQuestionOnDisplay(QUESTION_ON_DISPLAY + 1);});
  elTextField.addEventListener("input", decideToAllowExitButton);
}

function finishQuiz(): void {
  if (all_questions_anwered()) {
    if (!rememberCurrentAnswer()) return;
    // console.log("Zamykam moduł udzielanie odpowiedzi");
    clearTimeout(TIME);
  }
}


function initChosenQuiz() : Promise<void> {
  return new Promise((resolve, reject) => {
    updateAllQuestionsExceptThisAnwered(0);
    decideToAllowExitButton();

    changeQuestionOnDisplay(0);
    addListenersToForm();

    // usage of enter button in the quiz
    (document.getElementById("formularz") as HTMLElement).addEventListener("submit", (e : Event) => {
      e.preventDefault();
      if (QUESTION_ON_DISPLAY === QUESTS.length - 1) {
        finishQuiz();
        resolve();
      } else {
        changeQuestionOnDisplay(QUESTION_ON_DISPLAY + 1);
      };
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
    } else {
      showErrorMessage("Fetch nie powiódł się. Spróbuj ponownie");
      console.log(res);
      console.log("fetch unsuccessful");
    }
  }).catch(() => console.log("fetch failed"))
  }).catch(() => window.location.href = "/");