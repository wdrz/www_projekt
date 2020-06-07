import { initChosenQuiz } from './quizNavigation.js';
import { showResultsScreen } from './quizResults.js';
import { ustawWyborQuizow, selectedQuiz } from './quizSelection.js';

ustawWyborQuizow();

document.getElementById("btnStart").addEventListener("click", () =>{
    const quizNumber = selectedQuiz();
    if (quizNumber !== -1) {
        initChosenQuiz(quizNumber).then((stats) => {
            showResultsScreen(quizNumber, stats);
        });
    }
});

