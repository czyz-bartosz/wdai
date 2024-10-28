import { wires, gates, workArea, selectElement, scale } from "../main.js";
import { setWireToDeleted } from "./save.js";

function getPosition(el) {
    const eleRect = el.getBoundingClientRect();
    const targetRect = workArea.getBoundingClientRect();

    const y = (eleRect.top - targetRect.top) / scale;
    const x = (eleRect.left - targetRect.left) / scale;
    
    return {x, y};
}

export class Wire {
    id = wires.length;
    el = document.createElementNS("http://www.w3.org/2000/svg", "path");;
    con = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    nextGateId;
    width;
    height;
    isDeleted = false;
    constructor(el1, el2, isDeleted=false) {
        this.el1 = {element: el1, position: {...getPosition(el1)}};
        this.el2 = {element: el2, position: {...getPosition(el2)}};
        this.array1 = el1.id.split("-");
        this.array2 = el2.id.split("-");
        this.isDeleted = isDeleted;
        if(!isDeleted) {
            gates[this.array1[1]]?.outputs[this.array1[0]].wires.push(this.id);
            gates[this.array2[1]].inputs[this.array2[0]].wire = this.id;
            this.nextGateId = +this.array2[1];
            this.transfer();
            this.draw();
            this.addElement();
        }
    }
    setPosition() {
        this.el1.position = {...getPosition(this.el1.element)};
        this.el2.position = {...getPosition(this.el2.element)};
    }
    transfer() {
        const id = +this.array2[0];
        if(this.el1.element.classList.contains("true")){
            this.el.classList.add("true");
            this.el.classList.remove("false");
            gates[this.nextGateId].inputs[id].setInputValue(true, this.nextGateId);
        }else if(this.el1.element.classList.contains("false")) {
            gates[this.nextGateId].inputs[id].setInputValue(false, this.nextGateId);
            this.el.classList.remove("true");
            this.el.classList.add("false");
        }
    }
    draw() {
        this.setPosition();
        if(this.el1.position.x > this.el2.position.x - 60) {
            this.width = this.el1.position.x - this.el2.position.x + 120;
        }else {
            this.width = this.el2.position.x - this.el1.position.x;
        }
        if(this.el1.position.y > this.el2.position.y) {
            this.height = this.el1.position.y - this.el2.position.y;
        }else if(this.el1.position.y < this.el2.position.y){
            this.height = this.el2.position.y - this.el1.position.y;
        }else {
            this.height = 0;
        }
        this.height += 20;
        this.width += 20;
        this.con.setAttribute("width", this.width);
        this.con.setAttribute("height", this.height);
        if(this.el1.position.x < this.el2.position.x - 60) {
            if(this.el1.position.y > this.el2.position.y) {
                this.el.setAttribute("d", `M 0 ${this.height - 10} H ${this.width/2} V 10 H ${this.width}`);
                this.con.setAttribute("style", `top: ${this.el2.position.y}px; left: ${this.el1.position.x}px`);
            }else if(this.el1.position.y < this.el2.position.y){
                this.el.setAttribute("d", `M 0 10 H ${this.width/2} V ${this.height - 10} H ${this.width}`);
                this.con.setAttribute("style", `top: ${this.el1.position.y}px; left: ${this.el1.position.x}px`);
            }else {
                this.el.setAttribute("d", `M 0 ${this.height / 2} H ${this.width}`);
                this.con.setAttribute("style", `top: ${this.el1.position.y}px; left: ${this.el1.position.x}px`);
            }
        }else {
            if(this.el1.position.y >= this.el2.position.y) {
                this.el.setAttribute("d", `M 60 10 H 6 V ${this.height / 2} H ${this.width - 6} V ${this.height - 10} H ${this.width - 60}`);
                this.con.setAttribute("style", `top: ${this.el2.position.y}px; left: ${this.el2.position.x - 60}px`);
            }else if(this.el1.position.y < this.el2.position.y){
                this.el.setAttribute("d", `M ${this.width - 60} 10 H ${this.width - 6} V ${this.height / 2} H 6 V ${this.height - 10} H 60`);
                this.con.setAttribute("style", `top: ${this.el1.position.y}px; left: ${this.el2.position.x - 60}px`);
            }
        }
    }
    addElement() {
        this.con.appendChild(this.el);
        workArea.appendChild(this.con);
        this.el.id = this.id + "-wire";
        this.el.addEventListener("click", (event) => {
            event.stopPropagation();
            this.el.classList.add("selected");
            selectElement(this.el);
        });
    }
    delete() {
        this.isDeleted = true;
        setWireToDeleted(this.id);
        this.con.remove();
        const arrayOutputsWires = gates[this.array1[1]]?.outputs[this.array1[0]].wires;
        const index = arrayOutputsWires.indexOf(this.id);
        if (index > -1) {
            arrayOutputsWires[index] = undefined;
        }
        gates[this.array2[1]].inputs[this.array2[0]].setInputValue(false, this.nextGateId);
        gates[this.array2[1]].inputs[this.array2[0]].wire = undefined;
    }
}