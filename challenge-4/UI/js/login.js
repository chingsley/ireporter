const password = document.getElementById('password');
const email = document.getElementById('email');
const btnSubmit = document.getElementById('login-btn-submit');
const uri = `${root}/auth/login`;

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
            console.log(err);
            if (err.message === 'Failed to fetch') {
                showDialogMsg(0, 'Error', 'Connection failed. <br> Ensure you are well connected to the internet');
            } else {
                showDialogMsg(0, 'Error', err.message);
            }
            // showDialogMsg(1, 'Success', 'Udate successful');
        });
});