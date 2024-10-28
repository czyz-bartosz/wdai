import { gates, wires } from "../main.js";
import { Output } from "./Output.js";

export class OutputsElement {
    outputs = [];
    element = document.createElement("div");
    constructor(amountOfOutputs, id=(gates.length + "-gate")) {
        this.amountOfOutputs = amountOfOutputs;
        this.id = id;
        this.generateOutputsCon();
        this.addOutputs();
    }
    generateOutputsCon() {
        this.element.classList.add("outputs-element");
    }
    addOutputs() {
        for(let i = 0; i < this.amountOfOutputs; i++) {
            this.outputs.push(new Output(i));
            this.outputs[i].outputEl.setAttribute("id", i+"-"+this.id+"-o");
            this.outputs[i].outputEl.addEventListener("dblclick", () => {
                this.outputs[i].toggleValue();
                const parentElement = this.element.parentElement;
                if(parentElement.classList.contains("n-outputs-element")) {
                    const id = parseInt(parentElement.id);
                    gates[id].changeNumber();
                }
                this.outputs[i].wires.forEach((el) => {
                    wires[el]?.transfer();
                });
            });
            this.element.appendChild(this.outputs[i].outputEl);
        }
    }
    move() {
        this.outputs.forEach((el, id) => {
            this.outputs[id]?.wires.forEach((el, idW) => {
                wires[this.outputs[id].wires[idW]]?.draw();
            });
        });
    }
    clone() {
        return new OutputsElement(1, (gates.length + "-gate"));
    }
    delete() {
        this.element.remove();
        this.outputs.forEach((output) => {
            output.wires.forEach((wireId) => {
                wires[wireId]?.delete();
            });
        });
    }
}