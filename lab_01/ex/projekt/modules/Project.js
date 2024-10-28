const projectList = document.querySelector("#projects-list");
const createProjectBtn = document.querySelector("#create-project");
const openCreateProjectMenu = document.querySelector("#open-create-project-menu");
const createProjectMenu = document.querySelector(".create-project-menu")
import { start, startMenu } from "../main.js";
import { deleteProject, projects, setName, setProjectIndex } from "./save.js"

class Project {
    con;
    nameEl;
    buttonCon;
    openProjectButton;
    deleteProjectButton;
    constructor(id, name="My project") {
        this.name = name;
        this.createElement();
        this.id = id;
    }
    createElement() {
        this.con = document.createElement("div");
        this.con.classList.add("project-con");
        this.nameEl = document.createElement("h2");
        this.nameEl.textContent = this.name;
        this.con.appendChild(this.nameEl);
        this.buttonCon = document.createElement("div");
        this.buttonCon.classList.add("project-button-con");
        this.openProjectButton = document.createElement("button");
        this.openProjectButton.addEventListener('click', this.openProject);
        this.openProjectButton.textContent = "open";
        this.openProjectButton.classList.add("open-project");
        this.openProjectButton.classList.add("vertical-button");
        this.deleteProjectButton = document.createElement("button");
        this.deleteProjectButton.addEventListener('click', this.deleteProject);
        this.deleteProjectButton.textContent = "delete";
        this.deleteProjectButton.classList.add("delete-project");
        this.deleteProjectButton.classList.add("vertical-button");
        this.buttonCon.appendChild(this.openProjectButton);
        this.buttonCon.appendChild(this.deleteProjectButton);
        this.con.appendChild(this.buttonCon);
        projectList.appendChild(this.con);
    }
    openProject = () => {
        setProjectIndex(this.id);
        start();
    }
    deleteProject = () => {
        deleteProject(this.id);
    }
}

export function showProjects() {
    projects.forEach( (obj, id) => {
        new Project(id, projects[id].name);
    });
}

openCreateProjectMenu.addEventListener('click', () => {
    createProjectMenu.style.display = 'flex';
    startMenu.classList.add("blured");
});

function createProject() {
    createProjectMenu.style.display = 'none';
    const newProjectIndex = projects.length;
    let name = document.querySelector("#project-name").value;
    if(name === "") {
        name = null;
    }
    setProjectIndex(newProjectIndex);
    setName(name);
    start();
}

createProjectMenu.addEventListener("submit", createProject);