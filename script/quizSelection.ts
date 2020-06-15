import { Quiz } from "./typeDeclarations";

export function ustawWyborQuizow(QUIZES : Quiz[]) {
  const container = document.getElementById("quizSelection") as HTMLElement;

  console.log(QUIZES);
  for (const quiz of QUIZES) {
    container.innerHTML +=
      `<input data-quiz-id="${quiz.id}" type="radio" name="qs" id="opt${quiz.id}">
      <label for="opt${quiz.id}" class="quizRadio">
        ${quiz.title}
        <span class="popup">
          ${quiz.intro}
        </span>
      </label>`;
  }
}
export function selectedQuiz() : number {
    const ramki = document.querySelectorAll('#quizSelection input[type="radio"]');
    for (const ramka of ramki) {
        if ((ramka as HTMLInputElement).checked) {
            return Number((ramka as HTMLElement).dataset.quizId);
        }
    }
    // return undefined;
}