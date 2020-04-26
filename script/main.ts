import { initChosenQuiz } from './quizNavigation.js';
import { showResultsScreen } from './quizResults.js';
import { ustawWyborQuizow, selectedQuiz } from './quizSelection.js';

/*
/// <reference path="quizSelection.ts" />
/// <reference path="typeDeclarations.ts" />
/// <reference path="quizNavigation.ts" />
/// <reference path="quizResults.ts" />*/

ustawWyborQuizow();

document.getElementById("btnStart").addEventListener("click", () =>{
    const quizNumber = selectedQuiz();
    if (quizNumber !== -1) {
        initChosenQuiz(quizNumber).then((stats) => {
            showResultsScreen(quizNumber, stats);
        });
    }
});

