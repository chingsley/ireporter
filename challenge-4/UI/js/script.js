const root = 'http://localhost:3000/api/v1';
// const root = 'https://ireporter-db.herokuapp.com/api/v1';

const getErrString = (value) => {
    const errObj = JSON.parse(value);
    const errArr = Object.values(errObj);
    const errStr = errArr.join('<br>* ');
    return `* ${errStr}`;
}

const showDialogMsg = (flag, title, msg) => {
    const dialogWindow = document.getElementById('popup-dialog-window');
    const dialogBox = document.getElementById('dialog-box');
    const closeBtn = document.getElementById('close-dialog-box');
    const dialogTitle = document.getElementById('dialog-title');
    const dialogMsg = document.getElementById('dialog-msg');

    if (typeof title !== 'string' || typeof msg !== 'string') {
        throw new Error(`showDialog() expects 'title' and 'msg' to be of type string`);
    }

    if(flag === 0) { // error
        dialogTitle.parentNode.style.backgroundColor = "crimson";
        dialogTitle.parentNode.style.borderBottom = "none";
        dialogBox.style.border = "1px solid crimson";
        dialogBox.style.animation = "moveInFromBelow .5s ease-in";
        dialogTitle.style.color = `white`;
    } else { // success
        dialogTitle.parentNode.style.backgroundColor = "lightgreen";
        dialogTitle.parentNode.style.borderBottom = "2px solid black";
        dialogBox.style.border = "1px solid darkgreen";
        dialogBox.style.animation = "slideDownFast .5s ease-in";
        dialogTitle.style.color = `black`;
    }
    
    dialogWindow.style.display = "block";
    dialogTitle.textContent = `${title} !!`;
    dialogMsg.innerHTML = msg;

    // close the dialogbox if when the user clicks
    // on the 'x' button;
    closeBtn.onclick = () => {
        dialogWindow.style.display = "none";
    }
    
    // also close the dialog box if the user clicks
    // anywhere on the dialog window (which covers
    // the whole window), but not on the 
    // dialog box itself.
    window.onclick = (event) => {
        if(event.target === dialogWindow) {
            dialogWindow.style.display = "none";
        }
    }

};

const deleteTableRow = () => {
    // event.target is the input button element. 
    // event.target.parentNode is the td cell containing the button
    const td = event.target.parentNode;
    const tr = td.parentNode; // the row to be removed
    const table = tr.parentNode; 
    table.removeChild(tr);
}

/******************* FOR THE HAMBURGER MENU ****************/
function myFunction() {
    let x = document.getElementById("nav-div");
    if (x.className === 'nav-div') {
        x.className += " responsive";
    } else {
        x.className = "nav-div";
    }
}
/********************************************************* */
