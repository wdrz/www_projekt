import { QUIZES, AnswerToOne, Question, Quiz } from './typeDeclarations.js';

/*/// <reference path="typeDeclarations.ts" />*/


// namespace Nawigacja {
    let QUESTION_ON_DISPLAY : number;
    let ALL_QUESTIONS_EXCEPT_THIS_ANSWERED : boolean;

    const elTextField = document.getElementById("ans") as HTMLInputElement;
    const elExitButton = document.getElementById("btnExit") as HTMLInputElement;
    const elClock =  document.getElementById("clock_cont") as HTMLInputElement;

    let TIME : number;
    let TOTAL_TIME : number = 0;

    function showErrorMessage (message : string) : void {
        const erField = document.getElementById("errorfield") as HTMLElement;
        erField.innerText = message;
        erField.hidden = false;
    }

    function hideErrorMessage () {
        const erField = document.getElementById("errorfield") as HTMLElement;
        erField.hidden = true;
    }

    function updateAllQuestionsExceptThisAnwered(stats : AnswerToOne[], questionNumber : number, currQuiz : Quiz): void {
        for (let i : number = 0; i < currQuiz.zawartosc.length; i++) {
            if (i !== questionNumber) {
                if (stats[i].answer === undefined) {
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

    function changeFieldsValuesForQuestion(toQuestion: Question, questionNumber : number) {
        document.getElementById("nrPytania").innerText = (questionNumber + 1).toString();
        document.getElementById("trescPytania").innerText = toQuestion.pytanie;
        document.getElementById("kara").innerText = toQuestion.kara.toString();
    }

    /// returns true if no errors occured
    function rememberCurrentAnswer(stats : AnswerToOne[]) : boolean {
        if (elTextField.value !== "") {
            if (isNaN(Number(elTextField.value))) {
                showErrorMessage("Odpowiedzią musi być liczba całkowita!");
                return false;
            } else {
                hideErrorMessage();
                stats[QUESTION_ON_DISPLAY].answer = Number(elTextField.value);
            }
        } else {
            stats[QUESTION_ON_DISPLAY].answer = undefined;
        }
        return true;
    }

    function changeQuestionOnDisplay(currQuiz : Quiz, newQuestionNumber : number, stats : AnswerToOne[]): void {
        if (newQuestionNumber >= 0 && newQuestionNumber < currQuiz.zawartosc.length) {
            if (! rememberCurrentAnswer(stats)) return;

            QUESTION_ON_DISPLAY = newQuestionNumber;
            changeFieldsValuesForQuestion(currQuiz.zawartosc[newQuestionNumber], newQuestionNumber);
            if (stats[newQuestionNumber].answer === undefined) {
                elTextField.value = "";
            } else {
                elTextField.value = stats[newQuestionNumber].answer.toString();
            }
            elTextField.focus();
            updateAllQuestionsExceptThisAnwered(stats, newQuestionNumber, currQuiz);
        }
    }

    function initStats (currQuiz: Quiz) : AnswerToOne[] {
        const statistics = new Array<AnswerToOne>(currQuiz.zawartosc.length);
        for (let i : number = 0; i < currQuiz.zawartosc.length; i++) {
            statistics[i] = {"answer" : undefined, "timeSpent" : 0};
        }
        return statistics;
    }

    function changeFrontToQuestionScreen() : void {
        document.getElementById("poczatekQuizu").hidden = true;
        (document.getElementById("formularz") as HTMLElement).hidden = false;
    }

    function changeFieldValuesForFirstQuestion(currQuiz : Quiz) : void {
        QUESTION_ON_DISPLAY = 0;
        hideErrorMessage();
        document.getElementById("liczbaPytan").innerText = currQuiz.zawartosc.length.toString();
        document.getElementById("tytulQuizu").innerText = currQuiz.tytul;
        document.getElementById("wstep").innerText = currQuiz.wstep;
        changeFieldsValuesForQuestion(currQuiz.zawartosc[0], 0);
    }

    function addListenersToForm(currQuiz : Quiz, stats : AnswerToOne[]) {
        document.getElementById("btnHalt").addEventListener("click", () => {window.location.reload(false);});
        document.getElementById("btnPrev").addEventListener("click", () => {changeQuestionOnDisplay(currQuiz, QUESTION_ON_DISPLAY - 1, stats);});
        document.getElementById("btnNext").addEventListener("click", () => {changeQuestionOnDisplay(currQuiz, QUESTION_ON_DISPLAY + 1, stats);});
        elTextField.addEventListener("input", decideToAllowExitButton);
        // elTextField.addEventListener("keypress", )
    }

    function finishQuiz(stats : AnswerToOne[], resolve: (value?: AnswerToOne[] | PromiseLike<AnswerToOne[]>) => void) {
        if (all_questions_anwered()) {
            if (!rememberCurrentAnswer(stats)) return;
            // console.log("Zamykam moduł udzielanie odpowiedzi");
            clearTimeout(TIME);
            document.getElementById("formularz").style.display = "none";
            resolve(stats);
        }
    }


    export function initChosenQuiz(selQuizNumber : number) : Promise<AnswerToOne[]> {
        return new Promise((resolve, reject) => {
            const currQuiz : Quiz = QUIZES[selQuizNumber];
            const stats : AnswerToOne[] = initStats(currQuiz);
            changeFieldValuesForFirstQuestion(currQuiz);
            updateAllQuestionsExceptThisAnwered(stats, 0, currQuiz);
            decideToAllowExitButton();
            changeFrontToQuestionScreen();
            elTextField.focus();

            TIME = window.setInterval( () => {
                stats[QUESTION_ON_DISPLAY].timeSpent++;
                TOTAL_TIME++;
                const hrs : string = ("0" + Math.floor(TOTAL_TIME / 360).toString()).slice(-2);
                const min : string = ("0" + Math.floor((TOTAL_TIME / 60) % 60).toString()).slice(-2);
                const sec : string = ("0" + (TOTAL_TIME % 60).toString()).slice(-2);
                elClock.innerText = `${hrs} ${min} ${sec}`;
            }, 1000);

            addListenersToForm(currQuiz, stats);

            (document.getElementById("formularz") as HTMLElement).addEventListener("submit", (e : Event) => {
                e.preventDefault();
                if (QUESTION_ON_DISPLAY === currQuiz.zawartosc.length - 1) {
                    finishQuiz(stats, resolve);
                } else {
                    changeQuestionOnDisplay(currQuiz, QUESTION_ON_DISPLAY + 1, stats);
                };
            });

            elExitButton.addEventListener("click", () => {
                finishQuiz(stats, resolve);
            });
        });
    }
// }