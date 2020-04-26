import { QUIZES, Result } from './typeDeclarations.js';

/*/// <reference path="typeDeclarations.ts" />*/


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

let mem : Result[];
if (localStorage.getItem("wyniki") !== null) {
    mem = JSON.parse(localStorage.getItem("wyniki"));
    let row : HTMLElement;
    for (const x of mem) {
        row = document.createElement("tr");
        row.innerHTML = `
            <td>Wynik</td>
            <td>${x.total}</td>
        `;
        lista[dict[x.quizId]].appendChild(row);
    }
}