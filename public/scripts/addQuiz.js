const frame = document.getElementById("frame");
const message = document.getElementById("ermessage");
let counter = 0;
function atChange() {
    document.getElementById("numberOfQuestions").value = counter.toString();
    document.getElementById("buttonDel").disabled = counter <= 1;
}
function addQuestion() {
    const div = document.createElement('div');
    div.classList.add("borderframe");
    div.id = `frame${counter}`;
    div.innerHTML = `
    <h3> Pytanie ${counter + 1} </h3>
    <label for="quest${counter}">Treść pytania</label>
    <input type="text" id="quest${counter}" name="quest${counter}">

    <label for="answ${counter}">Odpowiedź</label>
    <input class="smalltf" type="text" id="answ${counter}" name="answ${counter}">

    <label for="pena${counter}">Kara</label>
    <input class="smalltf" type="text" id="pena${counter}" name="pena${counter}">
  `;
    frame.appendChild(div);
    counter++;
    atChange();
}
function delQuestion() {
    if (counter <= 1)
        return;
    counter--;
    document.getElementById(`frame${counter}`).remove();
    atChange();
}
function showMessage(text) {
    message.innerText = text;
    message.hidden = false;
}
function hideMessage() {
    message.hidden = true;
}
function isFieldNotNumeric(domId) {
    return isNaN(Number(document.getElementById(domId).value));
}
function isFieldEmpty(domId) {
    return document.getElementById(domId).value === "";
}
function validateForm() {
    if (isFieldEmpty("title")) {
        showMessage(`Tytuł quizu nie może być pusty`);
        return false;
    }
    if (isFieldEmpty("intro")) {
        showMessage(`Wstęp do quizu nie może być pusty`);
        return false;
    }
    for (let i = 0; i < counter; i++) {
        if (isFieldNotNumeric("answ" + i.toString())) {
            showMessage(`Odpowiedź na pytanie ${i + 1} nie może być pusta`);
            return false;
        }
        if (isFieldEmpty(`pena${i}`)) {
            showMessage(`Kara za pytanie ${i + 1} nie może być pusta`);
            return false;
        }
        if (isFieldEmpty(`quest${i}`)) {
            showMessage(`Treść pytania ${i + 1} nie może być pusta`);
            return false;
        }
        if (isFieldNotNumeric(`answ${i}`)) {
            showMessage(`Odpowiedź na pytanie ${i + 1} musi być liczbą`);
            return false;
        }
        if (isFieldNotNumeric(`pena${i}`)) {
            showMessage(`Kara za pytanie ${i + 1} musi być liczbą`);
            return false;
        }
    }
    hideMessage();
    return true;
}
addQuestion();
document.getElementById("buttonAdd").addEventListener("click", addQuestion);
document.getElementById("buttonDel").addEventListener("click", delQuestion);
document.getElementById("form").addEventListener("submit", (ev) => {
    if (!validateForm()) {
        console.log("preventing...");
        ev.preventDefault();
    }
});
//# sourceMappingURL=addQuiz.js.map