const root = 'http://localhost:3000/api/v1';
const imgRoot = 'http://localhost:3000';

// const root = 'https://ireporter-db.herokuapp.com/api/v1';
// const imgRoot = 'https://ireporter-db.herokuapp.com';


console.log('token = ', sessionStorage.token);
console.log('type of token', typeof sessionStorage.token);


linkSignOut = document.querySelectorAll('.sign-out');
const btnConfirm = document.getElementsByClassName('btnConfirm');
const btnsReportCase = document.querySelectorAll('.report-a-case');
const closeBtn = document.getElementById('close-dialog-box');
const dialogBox = document.getElementById('dialog-box');
const dialogMsg = document.getElementById('dialog-msg');
const dialogTitle = document.getElementById('dialog-title');
const dialogWindow = document.getElementById('popup-dialog-window');
const divConfirmation = document.getElementById('div-confirmation');
const loader = document.getElementById('loader');
const loaderWindow = document.getElementById('loader-window');

const closeDialog = (target) => {

    // close the dialogbox if when the user clicks
    // on the 'x' button;
    closeBtn.onclick = () => {
        dialogWindow.style.display = "none";
        if (target) {
            location.href = target;
        }
    }

    // also close the dialog box if the user clicks
    // anywhere on the dialog window (which covers
    // the whole window), but not on the 
    // dialog box itself.
    window.onclick = (event) => {
        if (event.target === dialogWindow) {
            dialogWindow.style.display = "none";
        }
        if (target) {
            location.href = target;
        }
    }

    // The 'CANCEL' btn for the WARNING dialog box: 
    btnConfirm[0].onclick = () => {
        dialogWindow.style.display = "none";
    }

    // The 'PROCEED' btn for the WARNING dialog box: 
    // this is done in the click event of 'delete' to 
    // hide the dialog in addition to calling the function
    // to delete the record.

    // btnConfirm[1].onclick = () => {
    //     dialogWindow.style.display = "none";
    //     return true;
    // }


};

const startLoader = () => {
    loaderWindow.style.display = 'block';
    loader.style.display = 'block';
    console.log('loading ...');
};

const stopLoader = () => {
    loaderWindow.style.display = 'none';
    loader.style.display = 'none';
    console.log('loading stopped.');
};

const getErrString = (value) => {
    // const errObj = JSON.parse(value);
    const errObj = value;
    const errArr = Object.values(errObj);
    const errStr = errArr.join('<br>=> ');
    return `=> ${errStr}`;
}

const getImgUrl = async (imgPath) => {
    try {
        const response = await fetch(imgPath);
        const blob = await response.blob();
        const objectURL = await URL.createObjectURL(blob);
        return objectURL;

    } catch (err) {
        console.log(err);
    };
};

const showDialogMsg = (flag, title, msg, textAlign = 'left', target) => {

    dialogBox.style.textAlign = textAlign;

    if (typeof title !== 'string' || typeof msg !== 'string') {
        throw new Error(`showDialog() expects 'title' and 'msg' to be of type string`);
    }

    if(flag === 0) { // error
        dialogTitle.parentNode.style.backgroundColor = "crimson";
        dialogTitle.parentNode.style.borderBottom = "none";
        dialogBox.style.border = "1px solid crimson";
        dialogBox.style.animation = "moveInFromBelow .5s ease-in";
        dialogTitle.style.color = `white`;
        divConfirmation.style.display = 'none';
    } else if(flag === 1) { // warning
        dialogTitle.parentNode.style.backgroundColor = "rgba(247, 178, 49, 1)";
        dialogTitle.parentNode.style.borderBottom = "none";
        dialogBox.style.border = "1px rgba(247, 178, 49, 1)";
        dialogBox.style.animation = "moveInLeft .5s ease";
        dialogTitle.style.color = `black`;
        divConfirmation.style.display = 'flex';
    } else if(flag === 2) { // success
        dialogTitle.parentNode.style.backgroundColor = "lightgreen";
        dialogTitle.parentNode.style.borderBottom = "2px solid black";
        dialogBox.style.border = "1px solid darkgreen";
        dialogBox.style.animation = "slideDownFast .5s ease-in";
        dialogTitle.style.color = `black`;
        divConfirmation.style.display = 'none';
    } else {
        throw new Error(`showDialogMsg expects 'flag' to be 0, 1, or 2`);
    }
    
    dialogWindow.style.display = "block";
    dialogTitle.textContent = `${title} !!`;
    dialogMsg.innerHTML = msg;

    if(target) {
       return closeDialog(target);
    } else {
       return closeDialog();
    }

};

const handleError = (err) => {
    if (err.message === 'Failed to fetch') {
        msg = `<ul class="dialog-box-ul">Try:
                            <li>Checking the network cables, modem, and router</li>
                            <li>Reconnecting to Wi-Fi</li>
                            </ul>`;
        showDialogMsg(0, 'Connection failure', msg);
    } else {
        showDialogMsg(0, 'Error', err.message, 'center');
    }
};

const handleResponseError = (response) => {
    if ((typeof response.error === 'string')) {
        showDialogMsg(0, 'Error', response.error, 'center');
    } else {
        const errStr = getErrString(response.error);
        showDialogMsg(0, 'Error', errStr);
    }
};

const handleGeolocationNetworkError = () => {
    msg = `
        <p style='text-align: center;'>Failed to locate the address on google map due to network error</p>
        <ul class="dialog-box-ul">
        Try:
        <li>Checking the network cables, modem, and router</li>
        <li>Reconnecting to Wi-Fi</li>
        <li>Also ensure the address is correct</li>
        </ul>
        <p style='text-align: center;'><strong>Then Resfresh the page</strong></p>
        `;
    showDialogMsg(0, 'Geolocation Error', msg);
};
const handleGeolocationNetworkErrorForEditPage = () => {
    msg = `
        <p style='text-align: center;'>Failed to locate the address on google map due to network error</p>
        <p style='text-align: center;'>Ensure you are properly connected to the internet, <strong>then Resfresh the page</strong></p>
        `;
    showDialogMsg(0, 'Geolocation Error', msg);
};

btnsReportCase.forEach(btn => {
    btn.addEventListener('click', (event) => {
        event.preventDefault();

        if(sessionStorage.token) {
            location.href = 'report.html';
        } else {
            location.href = 'login.html';
        }

    });
});

// The 'sign-out' operation can be performed thus:
linkSignOut.forEach(link => {
    link.addEventListener('click', () => {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('firstname');
        sessionStorage.removeItem('lastname');
        sessionStorage.removeItem('username');
        sessionStorage.removeItem('userId');
        sessionStorage.removeItem('userEmail');
        sessionStorage.removeItem('userPicture');
        if(sessionStorage.newUser === true) {
            sessionStorage.removeItem('newUser');
        }
    });
});

{// Another way to implement the 'sign-out' operation
    // // The 'sign-out' operation can also be performed using the a tags, selected in line 1
    // // the a tags selected above an HTMLcollection, therefore a.forEach or a.addEventListener
    // // would fail because an HTMLCollection is not an array. To use it as an array, you can 
    // // use Array.from() to convert it into an array as shown below: 

    // const a = document.getElementsByTagName('a');
    // console.log(a);
    // console.log(Array.from(a));
    // (Array.from(a)).forEach(link => {
    //     link.addEventListener('click', (event) => {
    //         event.preventDefault();
    //         console.log(typeof event.target.className);
    //         if (event.target.className.split(' ').includes('sign-out')) {
    //             console.log(event.target);
    //             alert('present Sir');
    //             sessionStorage.removeItem('token');
    //         }
    //     });
    // });
}



/******** FUNCTION TO DELETE A ROW FROM A TABLE**************** */
const deleteTableRow = () => {// I thinkd you need to pass 'event' as the argument in the function
    // event.target is the input button element. 
    // event.target.parentNode is the td cell containing the button
    const td = event.target.parentNode;
    const tr = td.parentNode; // the row to be removed
    const table = tr.parentNode; 
    table.removeChild(tr);
}
/************************************************************ */


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
