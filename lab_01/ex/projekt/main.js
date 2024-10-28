import { NOTGate, ANDGate, MyGate, prepareGate } from "./modules/Gate.js";
import { Wire } from "./modules/Wire.js";
import { OutputsElement } from "./modules/OutputsElement.js";
import { InputsElement } from "./modules/InputsElement.js";
import { nOutputsElement } from "./modules/nOutputsElement.js";
import { nInputsElement } from "./modules/nInputsElement.js";
import { editSavedPresetsGate, getWorkAreaGates, getWorkAreaWires, loadProject, loadSave, saveGate, saveMode, savePresetsGate, saveToLocalStorage, saveWire } from "./modules/save.js";
import { showProjects } from "./modules/Project.js";
import { dragDrop, workAreaMove } from "./modules/dragDrop.js";
export { gates, wires, workArea, presetsGates, selectElement, makeConnection, enterToEditMode, isEditMode, editGateId, changeMode, scale, header, footer, resetConnection, startMenu };

const startMenu = document.querySelector(".start-menu");
const main = document.querySelector("main");
const workArea = document.querySelector("#work-area");
const gatesToolbox = document.querySelector("footer");
const header = document.querySelector("header.app");
const footer = document.querySelector('footer');
const createGateMenuButton = document.querySelector("#create-gate-menu-button");
const createGateButton = document.querySelector("#create-gate-button");
const createBlockMenu = document.querySelector("#create-block-menu");
const deleteButton = document.querySelector("#delete-button");
const plusBttn = document.querySelector("#plus");
const minusBttn = document.querySelector("#minus");
const closeFrameBttn = document.querySelectorAll(".close-frame");
const forms = document.querySelectorAll("form");
const presetsGates = [];
const gates = [];
const wires = [];
const outputsSet = new Set();
let selectedOutput;
let selectedInput;
let selectedElement;
let editGateId;
let isEditMode = false;
let scale = 1.0;

forms.forEach( (el) => {
    el.addEventListener("submit", ( e ) => {
        e.preventDefault();
    });
});

function changeMode() {
    if(isEditMode) {
        isEditMode = false;
    }else {
        isEditMode = true;
    }
}

function enterToEditMode(id) {
    isEditMode = true;
    const idP = parseInt(id);
    presetsGates[idP].element.classList.add("edit");
    const editButtons = document.querySelectorAll(".edit-button");
    editButtons.forEach(el => {
        el.style.display = "none";
    });
    createGateMenuButton.textContent = "edit gate";
    createGateButton.textContent = "edit gate";
    editGateId = idP;
    saveMode();
}

function exitFromEditMode() {
    isEditMode = false;
    const editButtons = document.querySelectorAll(".edit-button");
    editButtons.forEach(el => {
        el.style.display = "block";
    });
    createGateMenuButton.textContent = "create gate";
    createGateButton.textContent = "create gate";
    saveToLocalStorage();
}

function unselectElement() {
    selectedElement?.classList.remove("selected");
    selectedElement = null;
}

function selectElement(element) {
    if(selectedElement === element) {
        return;
    }
    selectedElement?.classList.remove("selected");
    selectedElement = element;
}

workArea.addEventListener("click", () => {
    unselectElement();
})

function resetConnection() {
    selectedOutput = undefined;
    selectedInput = undefined;
}

function makeConnection(el) {
    if(el.classList.contains("output")) {
        selectedOutput = el;
    }else {
        const gateId = el.id.split("-")[1];
        const inputId = el.id.split("-")[0];
        const wire = gates[gateId].inputs[inputId].wire;
        if(wire === undefined) {
            selectedInput = el;
        }
    }
    const outputGate = selectedOutput?.id.split("-")[1];
    const inputGate = selectedInput?.id.split("-")[1];
    if(selectedInput && selectedOutput && outputGate !== inputGate) {
        const wireIndex = wires.push(new Wire(selectedOutput, selectedInput)) - 1;
        saveWire(selectedOutput, selectedInput, wireIndex);
        selectedOutput = selectedInput = null;
    }
}

function makePresetsGate(gate, index) {
    if(gate instanceof MyGate) {
        gate.addEditButton();
    }
    gate.element.classList.add("draggable-gate");
    gate.element.setAttribute("id", index + "drag");
    gate.element.style.order = index + 1;
    gatesToolbox.appendChild(gate.element);
    dragDrop(gate.element, document.body, dragFunction, undefined, dropFunction);

    function dragFunction() {
        const id = index;
        return presetsGates[id].clone("-g").element;
    }

    function dropFunction(event) {
        const id = index;
        const mousePosition = getMousePositionRelativToWorkArea(event);
        const gatesIndex = gates.length;
        gates[gatesIndex] = presetsGates[id].clone();
        const gate = gates[gatesIndex];
        prepareGate(gate);
        gate.element.style.top = mousePosition.y;
        gate.element.style.left = mousePosition.x;
        saveGate(gate);
    }
}

function getMousePositionRelativToWorkArea(e) {
    const rect = workArea.getBoundingClientRect();
    let x;
    let y;
    if( window.TouchEvent && e instanceof TouchEvent) {
        x = (e.changedTouches[0].clientX - rect.left) / scale;
        y = (e.changedTouches[0].clientY - rect.top) / scale;
    }else {
        x = (e.clientX - rect.left) / scale;
        y = (e.clientY - rect.top) / scale;
    }

    return { x: x + "px", y: y + "px"};
}

function getPreviousGate(input) {
    const wire = wires[input.wire];
    return gates[wire.array1[1]];
}

function getWhichOutput(input) {
    const wire = wires[input.wire];
    return wire.array1[0];
}

createGateButton.addEventListener("click", () => {
    const inputsElementArray = Array.from(document.querySelectorAll("#work-area .inputs-element"));
    const outputsElementArray = Array.from(document.querySelectorAll("#work-area .outputs-element"));
    const functionStringArray = [];
    const idInputsElement = inputsElementArray.map((el) => {
        return parseInt(el.id);
    });
    const outputsArray = outputsElementArray.map((el) => {
        const id = parseInt(el.id);
        return gates[id].outputs[0].outputEl.id;
    });
    try {
        idInputsElement.forEach((value) => {
            if(getPreviousGate(gates[value].inputs[0]) instanceof OutputsElement) {
                throw "Connection without gates is not possible. Do it with AND GATE";
            }
            const stringFun = prepareString(goThroughTheGates(getPreviousGate(gates[value].inputs[0]), getWhichOutput(gates[value].inputs[0])));
            functionStringArray.push(stringFun);
        });
        const outputsArr = outputsArray.filter((value) => {
            return outputsSet.has(value);
        });
        const workAreaGates = getWorkAreaGates();
        const workAreaWires = getWorkAreaWires();
        workArea.innerHTML = null;
        if(isEditMode) {
            editMyGate(functionStringArray, outputsArr, workAreaGates, workAreaWires);
        }else {
            createMyGate(functionStringArray, outputsArr, workAreaGates, workAreaWires);
        }
    }
    catch(error) {
        if(error === "Connection without gates is not possible. Do it with AND GATE") {
            alert(error);
        }else {
            alert('ERROR! check that everything is properly connected and that there are no unnecessary elements');
        }
    }
    outputsSet.clear();
});

function editMyGate(functionStringArray, outputsArray, workAreaGates, workAreaWires) {
    const amountOfInputs = outputsArray.length;
    const amountOfOutputs = functionStringArray.length;
    const colorInput = document.querySelector("#color");
    const nameInput = document.querySelector("#name");
    const name = nameInput.value;
    const color = colorInput.value;
    presetsGates[editGateId].element.remove();
    presetsGates[editGateId] = new MyGate(editGateId, amountOfInputs, amountOfOutputs, functionStringArray, outputsArray, name, color);
    createBlockMenu.style.display = "none";
    const gate = presetsGates[editGateId];
    gate.gatesId = [ ...workAreaGates ];
    gate.wiresId = [ ...workAreaWires ];
    editSavedPresetsGate(gate, editGateId);
    makePresetsGate(gate, editGateId);
    exitFromEditMode();
}

function createMyGate(functionStringArray, outputsArray, workAreaGates, workAreaWires) {
    const amountOfInputs = outputsArray.length;
    const amountOfOutputs = functionStringArray.length;
    const colorInput = document.querySelector("#color");
    const nameInput = document.querySelector("#name");
    const name = nameInput.value;
    const color = colorInput.value;
    presetsGates.push(new MyGate(presetsGates.length + "-pre", amountOfInputs, amountOfOutputs, functionStringArray, outputsArray, name, color));
    createBlockMenu.style.display = "none";
    const gate = presetsGates[presetsGates.length - 1];
    gate.gatesId = [ ...workAreaGates ];
    gate.wiresId = [ ...workAreaWires ];
    savePresetsGate(gate);
    makePresetsGate(gate, presetsGates.length - 1);
}

function addStringAtPosition(string, stringToAdd, index) {
    return string.slice(0, index) + stringToAdd + string.slice(index, string.length);
}

function prepareString(str) {
    const regEx = /\51[a-zA-Z0-9]/g;
    let string = str;
    while(regEx.test(string)) {
        const index = string.search(regEx) + 1;
        string = addStringAtPosition(string, ",", index);
    }
    if(string[string.length - 1] === ',') {
        string = string.slice(0, -1);
    }
    return string;
}

function goThroughTheGates(gate, outputIndex) {
    if(!gate.element.classList.contains("outputs-element")) {
        const gateArray = [];
        const outputIndexArray = [];
        let string = "";
        gate.inputs.forEach((el) => {
            gateArray.push(getPreviousGate(el));
            outputIndexArray.push(getWhichOutput(el));
        });
        if(gate instanceof ANDGate || gate instanceof NOTGate) {
            gateArray.forEach((el, index) => {
                string += `goThroughTheGates(gates[${parseInt(el.id)}], ${outputIndexArray[index]})+`
            });
            string = string.slice(0, (string.length - 1));
            return (gate.functionStringHead + eval(string) + gate.functionStringTail);
        }else {
            const stringIndexArr = gate.stringIndexArr[outputIndex];
            let functionString = gate.makeStringArr[outputIndex];
            for(let i = 0; i <= stringIndexArr.length; i++) {
                let start;
                let end;
                if(i === 0) {
                    start = -1;
                    end = stringIndexArr[i][0];
                }else if(i === stringIndexArr.length){
                    start = stringIndexArr[i-1][1];
                    end = functionString.length;
                }else {
                    start = stringIndexArr[i-1][1];
                    end = stringIndexArr[i][0];
                }
                if(i !== stringIndexArr.length) {
                    string += `functionString.slice(${start+1},${end})+goThroughTheGates(gates[parseInt(gateArray[${parseInt(functionString.slice(stringIndexArr[i][0]+1, stringIndexArr[i][1]))}].id)], ${outputIndexArray[parseInt(functionString.slice(stringIndexArr[i][0]+1, stringIndexArr[i][1]))]})+`;
                }else {
                    string += `functionString.slice(${start+1},${end})`;
                }
            }
            return eval(string);
        }
    }else {
        const id = gate.outputs[0].outputEl.getAttribute("id");
        outputsSet.add(id);
        return id + ",";
    }
}

createGateMenuButton.addEventListener("click", () => {
    function randomColor() {
        const deg = Math.random() * 360;
        function hslToHex(h, s=60, l=50) {
            l /= 100;
            const a = s * Math.min(l, 1 - l) / 100;
            const f = n => {
                const k = (n + h / 30) % 12;
                const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
                return Math.round(255 * color).toString(16).padStart(2, '0');
            };
            return `#${f(0)}${f(8)}${f(4)}`;
        }
        return hslToHex(deg);
    }
    const colorInput = document.querySelector("#color");
    colorInput.value = randomColor();
    createBlockMenu.style.display = "flex";
});

closeFrameBttn.forEach(( ele ) => {
    ele.addEventListener("click", () => {
        ele.parentElement.style.display = "none";
        startMenu.classList.remove("blured");
    });
});

deleteButton.addEventListener("click", () => {
    const id = selectedElement?.id?.split("-");
    if(id) {
        if(id[1] === "gate") {
            gates[id[0]].delete();
        }else if(id[1] === "wire"){
            wires[id[0]].delete();
        }
    }

    saveToLocalStorage();
})

window.addEventListener("resize", () => {
    const width = workArea.offsetWidth * scale;
    const height = workArea.offsetHeight * scale;
    workArea.style.top = (workArea.offsetHeight - height) / 2 * -1 + "px";
    workArea.style.left = (workArea.offsetWidth - width) / 2 * -1 + "px";
});

function changeScale(a) {
    const step = 0.1;
    if(a === 1) {
        if(scale < 2.0) {
            scale += step;
        }
    }else {
        if(scale > 0.25) {
            scale -= step;
        }
    }
    workArea.style.transform = `scale(${scale})`;
}

plusBttn.addEventListener("click", () => {
    changeScale(1);
});
minusBttn.addEventListener("click", () => {
    changeScale(-1);
});

loadSave();

showProjects();

export function start() {
    startMenu.style.display = 'none';
    workAreaMove(workArea, main);

    presetsGates.push(new OutputsElement(1, presetsGates.length + "-pre"));
    presetsGates.push(new nOutputsElement(2, presetsGates.length + "-pre"));
    presetsGates.push(new nOutputsElement(4, presetsGates.length + "-pre"));
    presetsGates.push(new nOutputsElement(8, presetsGates.length + "-pre"));
    presetsGates.push(new InputsElement(1, presetsGates.length + "-pre"));
    presetsGates.push(new nInputsElement(2, presetsGates.length + "-pre"));
    presetsGates.push(new nInputsElement(4, presetsGates.length + "-pre"));
    presetsGates.push(new nInputsElement(8, presetsGates.length + "-pre"));
    presetsGates.push(new ANDGate(presetsGates.length + "-pre"));
    presetsGates.push(new NOTGate(presetsGates.length + "-pre"));

    loadProject();

    presetsGates.forEach((gate, index) => {
        makePresetsGate(gate, index);
    });

    if(isEditMode) {
        const editButtons = document.querySelectorAll(".edit-button");
        editButtons.forEach(el => {
            el.style.display = "none";
        });
    }

    saveToLocalStorage();

    window.addEventListener("wheel", (event) => {
        if(event.deltaY < 0) {
            changeScale(1);
        }else {
            changeScale(-1);
        }
    });
}