import { gates } from "../main.js";
import { OutputsElement } from "./OutputsElement.js";

export class nOutputsElement {
    element = document.createElement("div");
    valueEl = document.createElement("h2");
    changeModeButton = document.createElement("button");
    numberMode = 0;
    outputsElementsId = [];
    constructor(n, id=(gates.length + "-gate")) {
        this.element.classList.add("n-outputs-element");
        this.element.appendChild(this.valueEl);
        this.n = n;
        this.id = id;
        this.addOutputsElements(n);
    }
    addOutputsElements(n) {
        const id = parseInt(this.id);
        const idString = this.id.toString();
        if(idString.includes("gate")) {
            for(let i = 1; i <= n; i++) {
                gates[id + i] = new OutputsElement(1, (id + i + "-gate"));
                const outputsEl = gates[id + i];
                outputsEl.element.id = outputsEl.id;
                this.outputsElementsId.push(id + i);
                this.element.appendChild(outputsEl.element);
            }
            this.valueEl.textContent = 0;
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
            this.changeNumber();
        }else if(idString.includes("g")) {
            for(let i = 1; i <= n; i++) {
                const output = new OutputsElement(1, (id + i + "-gate"));
                const outputsEl = output.element
                this.element.appendChild(outputsEl);
            }
            this.valueEl.textContent = 0;
        }else {
            this.valueEl.textContent = n;
        }
    }
    changeNumber() {
        let i = 0;
        let sum = 0;
        for(let j = this.outputsElementsId.length - 1; j >= 0; j--) {
            const id = this.outputsElementsId[j];
            gates[id].outputs.forEach((el) => {
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
        this.outputsElementsId.forEach((id) => {
            const el = gates[id];
            el.move();
        });
    }
    delete() {
        this.element.remove();
        this.outputsElementsId.forEach((id) => {
            const el = gates[id];
            el.delete();
        });
    }
    clone(name="-gate") {
        return new nOutputsElement(this.n, (gates.length + name));
    }
}