import { QUIZES } from './typeDeclarations.js';

/*/// <reference path="typeDeclarations.ts" />*/



// namespace Poczatek {
    export function ustawWyborQuizow() {
        const container = document.getElementById("quizSelection") as HTMLElement;
        let inputAdd : HTMLInputElement;
        let labelAdd : HTMLLabelElement;
        let popup : HTMLElement;

        for (let i : number = 0; i<QUIZES.length; i++) {
            inputAdd = document.createElement("input");
            inputAdd.type = "radio";
            inputAdd.name = "qs";
            inputAdd.id = "opt" + i.toString();
            if (i === 0) {
                inputAdd.checked = true;
            }
            container.appendChild(inputAdd);
            labelAdd = document.createElement("label");
            labelAdd.htmlFor = "opt" + i.toString();
            labelAdd.className = "quizRadio";
            labelAdd.innerHTML = QUIZES[i].tytul;
            container.appendChild(labelAdd);

            popup = document.createElement("span");
            popup.className = "popup";
            popup.innerText = QUIZES[i].wstep;
            labelAdd.appendChild(popup);

        }
    }
    export function selectedQuiz() : number {
        const ramki = document.querySelectorAll('#quizSelection input[type="radio"]');
        for (let i : number = 0; i<ramki.length; i++) {
            if ((ramki[i] as HTMLInputElement).checked) {
                return i;
            }
        }
        return -1;
    }
// }