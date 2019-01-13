const firstname = document.getElementById('firstname');
const lastname = document.getElementById('lastname');
const othernames = document.getElementById('othernames');
const username = document.getElementById('reg-username');
const email = document.getElementById('email');
const password = document.getElementById('password');
const phonenumber = document.getElementById('phonenumber');
const picture = document.getElementById('input-file-pic');
const btnRegister = document.getElementById('btn-reg');

btnRegister.addEventListener('click', (event) => {
    event.preventDefault();
    
    let formdata = new FormData();
    formdata.append('firstname', firstname.value);
    formdata.append('lastname', lastname.value);
    formdata.append('othernames', othernames.value);
    formdata.append('username', username.value);
    formdata.append('email', email.value);
    formdata.append('password', password.value);
    formdata.append('phoneNumber', phonenumber.value);
    formdata.append('picture', picture.files[0], `${email.value}.jpeg`);
    
    const uri = `${root}/auth/signup`
    const options = { method: 'POST', mode: 'cors', body: formdata };
    const req = new Request(uri, options);
    fetch(req)
        .then(response => {
            return response.json();
        })
        .then(response => {
            console.log('response = ', response);
            if(response.status === 201) {
                sessionStorage.token = response.data[0].token;
                const msg = `You have been successfully Registered !
                            <br>
                            You can now sign in and start reporting cases.
                            <br><br>
                            * Great to have you on board.`;
                showDialogMsg(2, 'Congratulations', msg);
            } else {
                // throw new Error(JSON.stringify(response.error));
                if ((typeof response.error === 'string')) {
                    showDialogMsg(0, 'Error', response.error, 'center');
                } else {
                    const errStr = getErrString(response.error);
                    showDialogMsg(0, 'Error', errStr);
                }
            }
        })
        .catch(err => {
            if (err.message === 'Failed to fetch') {
                const msg = `<ul class="dialog-box-ul">Try:
                                <li>Checking the network cables, modem, and router</li>
                                <li>Reconnecting to Wi-Fi</li>
                             </ul>`;
                showDialogMsg(0, 'Connection failure', msg);
            } else {
                showDialogMsg(0, 'Error', err.message, 'center');
            }
        });
});