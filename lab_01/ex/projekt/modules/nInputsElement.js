import { gates } from "../main.js";
import { InputsElement } from "./InputsElement.js";

export class nInputsElement {
    element = document.createElement("div");
    valueEl = document.createElement("h2");
    changeModeButton = document.createElement("button");
    numberMode = 0;
    inputsElementsId = [];
    constructor(n, id=(gates.length + "-gate")) {
        this.element.classList.add("n-inputs-element");
        this.element.appendChild(this.valueEl);
        this.n = n;
        this.id = id;
        this.addInputsElements(n);
    }
    addInputsElements(n) {
        const id = parseInt(this.id);
        const idString = this.id.toString();
        if(idString.includes("gate")) {
            for(let i = 1; i <= n; i++) {
                gates[id + i] = new InputsElement(1, (id + i + "-gate"));
                const inputsEl = gates[id + i];
                inputsEl.element.id = inputsEl.id;
                this.inputsElementsId.push(id + i);
                this.element.appendChild(inputsEl.element);    
            }
            this.changeModeButton.textContent = "2's";
            this.changeModeButton.addEventListener("click", () => {
                if(this.numberMode) {
                    this.numberMode = 0;
                }else {
                    this.numberMode = 1;
                }
                this.changeNumber();
            });
            this.element.appendChild(this.changeModeButton);
            this.valueEl.textContent = 0;
            this.changeNumber();
        }else if(idString.includes("g")) {
            for(let i = 1; i <= n; i++) {
                const input = new InputsElement(1, (id + i + "-gate"));
                const inputsEl = input.element
                this.element.appendChild(inputsEl);
            }
            this.valueEl.textContent = 0;
        }else {
            this.valueEl.textContent = n;
        }
    }
    changeNumber() {
        let i = 0;
        let sum = 0;
        for(let j = this.inputsElementsId.length - 1; j >= 0; j--) {
            const id = this.inputsElementsId[j];
            gates[id].inputs.forEach((el) => {
                const value = el.currentValue;
                if(j === 0 && this.numberMode === 1) {
                    if(value) {
                        sum += Math.pow(2, i) * -1;
                    }
                }else {
                    if(value) {
                        sum += Math.pow(2, i);
                    }
                }
                i++;
            });
        };
        this.valueEl.textContent = sum;
    }
    move() {
        this.inputsElementsId.forEach((id) => {
            const el = gates[id];
            el.move();
        });
    }
    delete() {
        this.element.remove();
        this.inputsElementsId.forEach((id) => {
            const el = gates[id];
            el.delete();
        });
    }
    clone(name="-gate") {
        return new nInputsElement(this.n, (gates.length + name))
    }
}