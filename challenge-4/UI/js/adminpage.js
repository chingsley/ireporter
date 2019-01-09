console.log('sessionStorage.token from reporthistory.js = ', sessionStorage.token);
const token = sessionStorage.token;
const myHeaders = new Headers();
myHeaders.append('Content-Type', 'application/json');
// myHeaders.append('x-auth-token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJOYW1lIjoibm9sbHkiLCJ1c2VyRW1haWwiOiJjaGluZ3NsZXlAZ21haWwuY29tIiwidXNlclN0YXR1cyI6ImFkbWluIiwiaWF0IjoxNTQ1MjExMjU2fQ.UYFA9N9tufof9CrMPB9EwzL43TfE80R1la9aFT7G19E');
myHeaders.append('x-auth-token', token);

const options = {
    method: 'GET',
    headers: myHeaders,
};
redflagsURL = 'http://localhost:3000/api/v1/red-flags';
interventinsURL = 'http://localhost:3000/api/v1/interventions';
const reqRed = fetch(redflagsURL, options);
const reqInt = fetch(interventinsURL, options);

Promise.all([reqRed, reqInt])
    .then((responseArr) => {
        console.log('responseArr', responseArr);
        responseArr.forEach(response => {
            process(response.json()); // the .json() method returns a promise
        });
    }).catch(err => {
        console.log('error message: ', err);
        // use DOM to construct a dialog box for error message
        // most likely error here will be a network failure
    });

const process = (promisedJson) => {
    promisedJson.then((dataArr) => {
        console.log('dataArr', dataArr);
        // use DOM to render the contents of 'dataArr' on reporthistory.html page
    });
};