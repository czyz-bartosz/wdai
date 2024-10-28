import { header, makeConnection, scale, workArea, footer, resetConnection } from "../main.js";

export function addDragging(ele, dragzone, dragFunction, moveFunction, dropFunction) {
    function dragStart( event ) {
        event.stopPropagation();
        ele.style.zIndex = "100";
        const top = ele.style.top;
        const left = ele.style.left;
        if(dragFunction) {
            dragFunction();
        }
        let shiftX;
        let shiftY;

        if( window.TouchEvent && event instanceof TouchEvent) {
            shiftX = event.touches[0].clientX - ele.getBoundingClientRect().left;
            shiftY = event.touches[0].clientY - ele.getBoundingClientRect().top;
        }else {
            shiftX = event.clientX - ele.getBoundingClientRect().left;
            shiftY = event.clientY - ele.getBoundingClientRect().top;
        }

        
        function moveAt(pageX, pageY) {
            ele.style.left = (pageX - shiftX) / scale + 'px';
            ele.style.top = (pageY - shiftY) / scale + 'px';
        }

        onMouseMove(event);

        function onMouseMove(event) {
            const rect = dragzone.getBoundingClientRect();
            let x;
            let y;
            if( window.TouchEvent && event instanceof TouchEvent) {
                x = event.touches[0].clientX - rect.left;
                y = event.touches[0].clientY - rect.top;
            }else {
                x = event.clientX - rect.left;
                y = event.clientY - rect.top;
            }
            
            moveAt(x, y);
            if(moveFunction) {
                moveFunction();
            }
        }

        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("touchmove", onMouseMove);

        function drop() {
            const eleRect = ele.getBoundingClientRect();
            const workAreaRect = workArea.getBoundingClientRect();
            ele.style.zIndex = "1";
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("touchmove", onMouseMove);
            document.removeEventListener("mouseup", drop);
            document.removeEventListener("touchend", drop);
            if(eleRect.top > workAreaRect.top && eleRect.bottom < workAreaRect.bottom && eleRect.left > workAreaRect.left && eleRect.right < workAreaRect.right) {
                dropFunction();
            }else {
                ele.style.top = top;
                ele.style.left = left;
                moveFunction();
            }
        }

        document.addEventListener("mouseup", drop);
        document.addEventListener("touchend", drop);
    }
    ele.addEventListener("touchstart", dragStart);
    ele.addEventListener("mousedown", dragStart);
    ele.addEventListener("dragstart", () => false );
}

export function dragDrop(ele, dragzone, dragFunction, moveFunction, dropFunction) {
    function dragStart( event ) {
        let x;
        let y;
        const copyEle = dragFunction();
        copyEle.classList.remove("draggable-gate");
        copyEle.classList.add("work");
        dragzone.appendChild(copyEle);
        copyEle.style.zIndex = "100";
        copyEle.style.position = "absolute";
        copyEle.style.transform = `scale(${scale})`;
        const copyEleRect = copyEle.getBoundingClientRect();

        const shiftX = (copyEle.offsetWidth - copyEleRect.width) / 2;
        const shiftY = (copyEle.offsetHeight - copyEleRect.height) / 2;

        function moveAt(pageX, pageY) {
            copyEle.style.left = pageX - shiftX + 'px';
            copyEle.style.top = pageY - shiftY + 'px';
        }

        onMouseMove(event);
        
        function onMouseMove(event) {
            if( window.TouchEvent && event instanceof TouchEvent) {
                x = event.touches[0].clientX;
                y = event.touches[0].clientY;
            }else {
                x = event.clientX;
                y = event.clientY;
            }
            moveAt(x, y);
            if(moveFunction) {
                moveFunction();
            }
        }

        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("touchmove", onMouseMove);

        function drop(event) {
            const copyEleRect = copyEle.getBoundingClientRect();
            const workAreaRect = workArea.getBoundingClientRect();
            const footerRect = footer.getBoundingClientRect();
            copyEle.remove();
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("touchmove", onMouseMove);
            document.removeEventListener("mouseup", drop);
            document.removeEventListener("touchend", drop);
            if(copyEleRect.top > workAreaRect.top && copyEleRect.bottom < workAreaRect.bottom && copyEleRect.left > workAreaRect.left && copyEleRect.right < workAreaRect.right) {
                if(isInScreen(copyEleRect)) {
                    dropFunction(event); 
                }
            }
        }
        document.addEventListener("mouseup", drop);
        document.addEventListener("touchend", drop);
    }
    ele.addEventListener("touchstart", dragStart);
    ele.addEventListener("mousedown", dragStart);
    ele.addEventListener("dragstart", () => false );
}

export function dragWire(ele, dragzone) {
    function dragStart(event) {
        event.stopPropagation();
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        const con = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        con.appendChild(path);
        workArea.appendChild(con);
        
        function getPosition(ele) {
            const eleRect = ele.getBoundingClientRect();
            const targetRect = workArea.getBoundingClientRect();
        
            const y = (eleRect.top - targetRect.top) / scale;
            const x = (eleRect.left - targetRect.left) / scale;
            
            return {x, y};
        }
        const elePosition = getPosition(ele);
        const mousePosition = {};


        function onMouseMove(event) {
            const rect = dragzone.getBoundingClientRect();
            let x;
            let y;
            if( window.TouchEvent && event instanceof TouchEvent) {
                x = (event.touches[0].clientX - rect.left) / scale;
                y = (event.touches[0].clientY - rect.top) / scale;
            }else {
                x = (event.clientX - rect.left) / scale;
                y = (event.clientY - rect.top) / scale;
            }

            mousePosition.x = x;
            mousePosition.y = y;
            if(ele.classList.contains("input")) {
                draw(elePosition, mousePosition);
            }else {
                draw(mousePosition, elePosition);
            }
        }

        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("touchmove", onMouseMove);

        function drop(event) {
            event.stopPropagation();
            let elemBelow;
            if( window.TouchEvent && event instanceof TouchEvent) {
                elemBelow = document.elementFromPoint(event.changedTouches[0].clientX, event.changedTouches[0].clientY);
            }else {
                elemBelow = document.elementFromPoint(event.clientX, event.clientY);
            }
            con.remove();
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("touchmove", onMouseMove);
            document.removeEventListener("mouseup", drop);
            document.removeEventListener("touchend", drop);
            if(elemBelow === ele) {
                resetConnection();
                return;
            }
            if(elemBelow?.classList.contains("input") || elemBelow?.classList.contains("output")) {
                makeConnection(ele);
                makeConnection(elemBelow);
            }else {
                resetConnection();
            }
        }

        document.addEventListener("mouseup", drop);
        document.addEventListener("touchend", drop);

        function draw(el1, ele2) {
            let width;
            let height;
            if(ele2.x > el1.x - 60) {
                width = ele2.x - el1.x + 120;
            }else {
                width = el1.x - ele2.x;
            }
            if(ele2.y > el1.y) {
                height = ele2.y - el1.y;
            }else if(ele2.y < el1.y){
                height = el1.y - ele2.y;
            }else {
                height = 0;
            }
            height += 20;
            width += 20;
            con.setAttribute("width", width);
            con.setAttribute("height", height);
            if(ele2.x < el1.x - 60) {
                if(ele2.y > el1.y) {
                    path.setAttribute("d", `M 0 ${height - 10} H ${width/2} V 10 H ${width - 20}`);
                    con.setAttribute("style", `top: ${el1.y}px; left: ${ele2.x}px`);
                }else if(ele2.y < el1.y){
                    path.setAttribute("d", `M 0 10 H ${width/2} V ${height - 10} H ${width - 20}`);
                    con.setAttribute("style", `top: ${ele2.y}px; left: ${ele2.x}px`);
                }else {
                    path.setAttribute("d", `M 0 ${height / 2} H ${width}`);
                    con.setAttribute("style", `top: ${ele2.y}px; left: ${ele2.x}px`);
                }
            }else {
                if(ele2.y >= el1.y) {
                    path.setAttribute("d", `M 60 10 H 6 V ${height / 2} H ${width - 6} V ${height - 10} H ${width - 80}`);
                    con.setAttribute("style", `top: ${el1.y}px; left: ${el1.x - 60}px`);
                }else if(ele2.y < el1.y){
                    path.setAttribute("d", `M ${width - 80} 10 H ${width - 6} V ${height / 2} H 6 V ${height - 10} H 60`);
                    con.setAttribute("style", `top: ${ele2.y}px; left: ${el1.x - 60}px`);
                }
            }
        }
    }
    ele.addEventListener("touchstart", dragStart);
    ele.addEventListener("mousedown", dragStart);
    ele.addEventListener("dragstart", () => false );
}

export function workAreaMove(workArea, main) {
    function dragStart(event) {
        let shiftX;
        let shiftY;

        if( window.TouchEvent && event instanceof TouchEvent) {
            shiftX = event.touches[0].clientX - workArea.offsetLeft;
            shiftY = event.touches[0].clientY - workArea.offsetTop;
        }else {
            shiftX = event.clientX - workArea.offsetLeft;
            shiftY = event.clientY - workArea.offsetTop;
        }

        const headerHeight = header.offsetHeight;
        function moveAt(mainX, mainY) {
            workArea.style.left = (mainX - shiftX) + "px";
            workArea.style.top = (mainY - shiftY + headerHeight) + "px";
        }
        onMouseMove(event);
        function onMouseMove(event) {
            const mainRect = main.getBoundingClientRect();
            let mainX;
            let mainY;
            if( window.TouchEvent && event instanceof TouchEvent) {
                mainX = event.touches[0].clientX - mainRect.left;
                mainY = event.touches[0].clientY - mainRect.top;
            }else {
                mainX = event.clientX - mainRect.left;
                mainY = event.clientY - mainRect.top;
            }

            moveAt(mainX, mainY);
        }
        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("touchmove", onMouseMove);

        function onDrop() {
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("touchmove", onMouseMove);
            document.removeEventListener("mouseup", onDrop);
            document.removeEventListener("touchend", onDrop);
        }

        document.addEventListener("mouseup", onDrop);
        document.addEventListener("touchend", onDrop);
    }

    workArea.addEventListener("touchstart", dragStart);
    workArea.addEventListener("mousedown", dragStart);
    workArea.addEventListener("dragstart", () => false);
}

function isInScreen(position) {
    const y = document.documentElement.offsetHeight;
    const x = document.documentElement.offsetWidth;
    const headerHeight = header.offsetHeight;
    const footerHeight = footer.offsetHeight;
    if(position.y > headerHeight && position.y < y - footerHeight && position.x < x) {
        return true;
    }
    return false;
}