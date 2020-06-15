/*import { initChosenQuiz } from './quizNavigation.js';
import { showResultsScreen } from './quizResults.js';
import { ustawWyborQuizow, selectedQuiz } from './quizSelection.js';
*/

import { ustawWyborQuizow, selectedQuiz } from "./quizSelection.js";
import { Quiz, Question } from "./typeDeclarations.js";

async function get_json(req: string): Promise<string> {
    return (await fetch(req)).json();
}

async function run() : Promise<void> {
    const QUIZES : Quiz[] = JSON.parse(await get_json("/quizlist"));
    console.log(typeof(QUIZES));
    ustawWyborQuizow(QUIZES as Quiz[]);
}


run();

document.getElementById("btnStart").addEventListener("click", () => {
    const quizNumber = selectedQuiz();
    console.log(quizNumber);
    /*if (quizNumber !== -1) {
        initChosenQuiz(quizNumber).then((stats) => {
            showResultsScreen(quizNumber, stats);
        });
    }*/
});

