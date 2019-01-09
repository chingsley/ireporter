const password = document.getElementById('password');
const email = document.getElementById('email');
const btnSubmit = document.getElementById('login-btn-submit');
const uri = 'http://localhost:3000/api/v1/auth/login';
// const uri = 'https://ireporter-db.herokuapp.com/api/v1/auth/login';
const dialogWindow = document.getElementById('popup-dialog-window');
const closeBtn = document.getElementById('close-dialog-box');
const dialogTitle = document.getElementById('dialog-title');
const dialogMsg = document.getElementById('dialog-msg');


btnSubmit.addEventListener('click', (event) => {
    event.preventDefault();


    let formdata = new FormData();
    formdata.append('email', email.value);
    formdata.append('password', password.value);
    const options = {
        method: 'POST',
        mode: 'cors',
        body: formdata
    };

    let req = new Request(uri, options);

    fetch(req)
        .then(response => {
            return response.json();
            // if (response.ok) {
            //     return response.json();
            // } else {
            //     return response.json();
            //     // throw new Error(response.json());
            // }
        })
        .then(response => {
            if(response.status === 200) {
                sessionStorage.token = response.data[0].token;
                if(response.data[0].user.isAdmin) {
                    location.href = 'adminpage.html';
                } else {
                    location.href = 'reporthistory.html';
                }
                const jsonData = JSON.stringify(response); // in case you want to display the response as is on a html page
            } else {
                throw new Error(response.error);
            }
        })
        .catch(err => {
            dialogWindow.style.display = "block";
            dialogTitle.textContent = "Error !!";
            dialogMsg.textContent = err.message;

            // close the dialogbox if when the user clicks
            // on the 'x' button;
            closeBtn.onclick = () => {
                dialogWindow.style.display = "none";
            }
            
            // also close the dialog box if the user clicks
            // anywhere on the dialog box (which covers
            // the whole window [remember!]), except on the 
            // content.
            window.onclick = (event) => {
                if(event.target === dialogWindow) {
                    dialogWindow.style.display = "none";
                }
            }

        });

});