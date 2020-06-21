import { Quiz } from './typeDeclarations.js';

fetch(`/quizlist`, {
  method: 'get',
  headers: {
    'Accept': 'application/json, text/plain, */*'
  }
}).then(async (response) => {
  const { login, quizes } = JSON.parse(await response.json());

  document.getElementById("login").innerText = login;

  const container = document.getElementById("container") as HTMLElement;
  const lastChild = document.getElementById("frameAdd") as HTMLElement;

  quizes.forEach((quiz: Quiz) => {
    const div: HTMLElement = document.createElement('div');
    div.classList.add(quiz.points ? "solved" : "item");
    div.dataset.quiz_id = quiz.id.toString();
    div.innerHTML = `
      <h2>${quiz.title}</h2>
      <p>${quiz.intro}</p>
    `;

    if (quiz.points) {
      div.innerHTML += `
        <p>Quiz solved. Your score: ${quiz.points}s</p>
        <a class="startQuiz" href="/quiz/${quiz.id}">Details</a>
      `;
    } else {
      div.innerHTML += `
        <a class="startQuiz" href="/quiz/${quiz.id}">Start</a>
      `;
    }
    container.insertBefore(div, lastChild);
  });

});