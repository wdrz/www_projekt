/*import { initChosenQuiz } from './quizNavigation.js';
import { showResultsScreen } from './quizResults.js';
import { ustawWyborQuizow, selectedQuiz } from './quizSelection.js';
*/
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { ustawWyborQuizow, selectedQuiz } from "./quizSelection.js";
function get_json(req) {
    return __awaiter(this, void 0, void 0, function* () {
        return (yield fetch(req)).json();
    });
}
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        const QUIZES = JSON.parse(yield get_json("/quizlist"));
        console.log(typeof (QUIZES));
        ustawWyborQuizow(QUIZES);
    });
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
//# sourceMappingURL=main.js.map