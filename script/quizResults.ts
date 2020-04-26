import { QUIZES, AnswerToOne, Quiz, Result } from './typeDeclarations.js';

/*/// <reference path="typeDeclarations.ts" />*/



// namespace Koniec {
    function createDivPopup (userAnswer : number, corrAnswer : number,
        numberOfQuestion : number, punishment : number, time : number) : HTMLElement {

        const frame : HTMLElement = document.createElement("div");

        if (userAnswer === corrAnswer) {
            frame.innerHTML =
            `<span class="popup">
                <p>Pytanie: ${numberOfQuestion + 1}</p>
                <p>Odpowiedź: ${userAnswer}</p>
                <p>Czas: ${time}s </p>
            </span>`;
            frame.className = "answerDiv anscorrect";
        } else {
            frame.innerHTML =
            `<span class="popup">
                <p>Pytanie: ${numberOfQuestion + 1}</p>
                <p>Twoja odpowiedź: ${userAnswer}</p>
                <p>Poprawna odpowiedź: ${corrAnswer}</p>
                <p>Kara: ${punishment} </p>
                <p>Czas: ${time}s </p>
            </span>`;
            frame.className = "answerDiv answrong";
        }
        return frame;
    }

    function displayFramesOfQuestions(stats : AnswerToOne[], currQuiz : Quiz) : void {
        const contAnswers = document.getElementById("answers") as HTMLElement;
        for (let i : number = 0; i < currQuiz.zawartosc.length; i++) {
            contAnswers.appendChild(createDivPopup(stats[i].answer, currQuiz.zawartosc[i].odpowiedz,
                i, currQuiz.zawartosc[i].kara, stats[i].timeSpent));
        }
    }

    function calculateNumericalResult(currQuiz : Quiz, stats : AnswerToOne[]) : number {
        let wynik : number = 0;
        for (let i : number = 0; i < currQuiz.zawartosc.length; i++) {
            if (currQuiz.zawartosc[i].odpowiedz !== stats[i].answer) {
                wynik += currQuiz.zawartosc[i].kara;
            }
            wynik += stats[i].timeSpent;
        }
        return wynik;
    }

    function getResult (currQuiz : Quiz, stats : AnswerToOne[]) : [Result, Result] {
        const numRes : number = calculateNumericalResult(currQuiz, stats);
        return [{quizId : currQuiz.id, total : numRes, statistics : stats} as Result,
            {quizId : currQuiz.id, total : numRes} as Result];
    }

    function saveInMemory(result : Result) : void {
        let mem : Result[];
        if (localStorage.getItem("wyniki") === null) {
            mem  = [result];
        } else {
            mem = JSON.parse(localStorage.getItem("wyniki"));
            mem.push(result);
        }
        localStorage.setItem("wyniki", JSON.stringify(mem));
        (document.getElementById("btnSave1") as HTMLInputElement).disabled = true;
        (document.getElementById("btnSave2") as HTMLInputElement).disabled = true;
    }

    function addListeners(resStats : Result, result : Result) : void {
        (document.getElementById("btnSave1") as HTMLInputElement).disabled = false;
        (document.getElementById("btnSave2") as HTMLInputElement).disabled = false;
        document.getElementById("btnRerun").addEventListener("click", () => {window.location.reload(false);});
        document.getElementById("btnSave1").addEventListener("click", () => {saveInMemory(result);});
        document.getElementById("btnSave2").addEventListener("click", () => {saveInMemory(resStats);});
    }


    export function showResultsScreen(selectedQuizNumber : number, stats : AnswerToOne[]) {
        const currQuiz = QUIZES[selectedQuizNumber];
        displayFramesOfQuestions(stats, currQuiz);
        const [resStats, result] = getResult(currQuiz, stats);
        document.getElementById("wynik").innerText = result.total.toString();
        document.getElementById("quizEnded").hidden = false;
        addListeners(resStats, result);
    }



// }