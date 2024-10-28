import { gates } from "../main.js";

export class Input {
    inputEl = document.createElement("div");
    currentValue = false;
    id = null;
    wire;
    constructor(id) {
        this.createElement();
        this.id = id + "-i";
    }
    createElement() {
        this.inputEl.classList.add("input");
        this.inputEl.classList.add("false");
    }
    setInputValue(value, parentId) {
        this.currentValue = value;
        if(this.currentValue) {
            this.inputEl.classList.add("true");
            this.inputEl.classList.remove("false");
        }else {
            this.inputEl.classList.add("false");
            this.inputEl.classList.remove("true");
        }
        gates[parentId].changeStatus();
    }
}