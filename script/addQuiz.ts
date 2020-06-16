const frame = document.getElementById("frame") as HTMLElement;

let counter : number = 0;

function decideToAllow() {
  (document.getElementById("buttonDel") as HTMLButtonElement).disabled = counter <= 1;
}

function addQuestion() {
  frame.innerHTML += `
    <div class="borderframe" id="frame${counter}">
      <h3> Pytanie ${counter + 1} </h3>
      <label for="quest${counter}">Treść pytania</label>
      <input type="text" id="quest${counter}" name="quest${counter}">

      <label for="answ${counter}">Odpowiedź</label>
      <input class="smalltf" type="text" id="answ${counter}" name="answ${counter}">

      <label for="pena${counter}">Kara</label>
      <input class="smalltf" type="text" id="pena${counter}" name="pena${counter}">
    </div>
  `;
  counter++;
  decideToAllow();
}

function delQuestion() {
  if (counter <= 1) return;
  counter--;
  (document.getElementById(`frame${counter}`) as HTMLElement).remove();
  decideToAllow();
}

(document.getElementById("buttonAdd") as HTMLButtonElement).addEventListener("click", addQuestion);
(document.getElementById("buttonDel") as HTMLButtonElement).addEventListener("click", delQuestion);

addQuestion();