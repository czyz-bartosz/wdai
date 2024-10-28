import { gates, wires } from "../main.js";
import { Input } from "./Input.js";

export class InputsElement {
    inputs = [];
    element = document.createElement("div");
    constructor(amountOfInputs, id=(gates.length + "-gate")) {
        this.amountOfInputs = amountOfInputs;
        this.id = id;
        this.generateInputsCon();
        this.addInputs();
    }
    generateInputsCon() {
        this.element.classList.add("inputs-element");
    }
    addInputs() {
        for(let i = 0; i < this.amountOfInputs; i++) {
            this.inputs.push(new Input(i));
            this.inputs[i].inputEl.setAttribute("id", (i+"-"+this.id+"-i"));
            this.inputs[i].id = this.inputs[i].inputEl.getAttribute("id");
            this.element.appendChild(this.inputs[i].inputEl);
        }
    }
    move() {
        this.inputs.forEach((el, id) => {
            wires[this.inputs[id].wire]?.draw();
        });
    }
    changeStatus() {
        const parent = this.element.parentElement;
        if(parent?.classList?.contains("n-inputs-element")) {
            const id = parseInt(parent.id);
            gates[id].changeNumber();
        }
    }
    clone() {
        return new InputsElement(1, (gates.length + "-gate"));
    }
    delete() {
        this.element.remove();
        this.inputs.forEach((input) => {
            wires[input.wire]?.delete();
        });
    }
}