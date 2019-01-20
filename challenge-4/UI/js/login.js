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
            sessionStorage.firstname = response.data[0].user.firstname;
            sessionStorage.userId = response.data[0].user.id;
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
        handleError(err);
    });
});