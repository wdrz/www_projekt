import { QUIZES, Result } from './typeDeclarations.js';

const dict : Record<number, number> = {};
const lista : HTMLElement[] = [];

const elCont : HTMLElement = document.getElementById("container");

for (let i : number = 0; i < QUIZES.length; i++) {
    lista.push(document.createElement("table"));
    dict[QUIZES[i].id] = i;
    const hdr = document.createElement("h2");
    hdr.innerText = QUIZES[i].tytul;
    elCont.appendChild(hdr);
    elCont.appendChild(lista[i]);
}

Object.keys(localStorage).forEach((key) => {
    if (key.startsWith("quiz_result")) {
        const value : string = localStorage.getItem(key);
        const result : Result = JSON.parse(value);
        const row : HTMLElement = document.createElement("tr");
        row.innerHTML = `
            <td>Wynik</td>
            <td>${result.total}</td>
        `;
        lista[dict[result.quizId]].appendChild(row);
    }
});