export class Output {
    outputEl = document.createElement("div");
    currentValue = false;
    id = null;
    wires = [];
    constructor(id) {
        this.createElement();
        this.id = id + "-o";
    }
    createElement() {
        this.outputEl.classList.add("output");
        this.outputEl.classList.add("false");
    }
    toggleValue() {
        if(this.currentValue) {
            this.currentValue = false;
        }else {
            this.currentValue = true;
        }
        this.outputEl.classList.toggle("true");
        this.outputEl.classList.toggle("false");
    }
}