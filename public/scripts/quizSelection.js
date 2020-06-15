export function ustawWyborQuizow(QUIZES) {
    const container = document.getElementById("quizSelection");
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
export function selectedQuiz() {
    const ramki = document.querySelectorAll('#quizSelection input[type="radio"]');
    for (const ramka of ramki) {
        if (ramka.checked) {
            return Number(ramka.dataset.quizId);
        }
    }
    // return undefined;
}
//# sourceMappingURL=quizSelection.js.map