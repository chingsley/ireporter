
const countRedflags = document.getElementById('count-redflags');
const countIntervenions = document.getElementById('count-interventions');
const email = document.getElementById('email');
const userFirstname = sessionStorage.firstname;
const userLastname = sessionStorage.lastname;
const userUsername = sessionStorage.username;
const userEmail = sessionStorage.userEmail;
const userPicture = sessionStorage.userPicture;
console.log(userPicture);
const fullname = document.getElementById('fullname');
const img = document.createElement('img');
const imgUsername = document.createElement('img');
const imgUsernameContainer = document.getElementById('pic-for-username');
const imgContainer = document.getElementById('picture-div-img');
const profilePicture = document.getElementById('profile-picture');
const token = sessionStorage.token;
const username = document.getElementById('username');

const draftInterventions = document.getElementById('draft-interventions');
const uiInterventions = document.getElementById('ui-interventions');
const resolvedInterventions = document.getElementById('resolved-interventions');
const rejectedInterventions = document.getElementById('rejected-interventions');

const draftRedflags = document.getElementById('draft-redflags');
const uiRedflags = document.getElementById('ui-redflags');
const resolvedRedflags = document.getElementById('resolved-redflags');
const rejectedRedflags = document.getElementById('rejected-redflags');

// The date atop the profile page
const date = document.getElementById('date');
date.innerHTML = (new Date()).toLocaleString();


const getAllRecords = async () => {
    const myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    myHeaders.append('x-auth-token', token);

    const options = { method: 'GET', headers: myHeaders, };

    const redflagsURL = `${root}/red-flags`;
    const interventionsURL = `${root}/interventions`;
 
    try {
        const redflagsResponse = await fetch(redflagsURL, options);
        const redflags = await redflagsResponse.json();
        const interventionsResponse = await fetch(interventionsURL, options);
        const interventions = await interventionsResponse.json();
        const obj = {redflags: redflags.data, interventions: interventions.data};
        return obj;
    } catch(err) {
        console.log(err);
        handleError(err);
    };
};

const displayContents = async () => {
    const records = await getAllRecords();
    const interventions = records.interventions;
    const redflags = records.redflags;
    img.src = `${imgRoot}/${userPicture}`;
    imgContainer.appendChild(img);
    imgUsername.src = `${imgRoot}/${userPicture}`;
    imgUsernameContainer.appendChild(imgUsername);
    fullname.textContent = `${userFirstname} ${userLastname}`;
    email.textContent = userEmail;
    if(!userUsername || userUsername === 'unspecified') {
        username.textContent = userEmail.slice(0, userEmail.indexOf('@'));
    } else {
        username.textContent = userUsername;
    }

    countRedflags.textContent = redflags.length;
    countIntervenions.textContent = interventions.length;
    draftRedflags.textContent = get('draft', redflags);
    rejectedRedflags.textContent = get('rejected', redflags);
    resolvedRedflags.textContent = get('resolved', redflags);
    uiRedflags.textContent = get('under investigation', redflags);

    draftInterventions.textContent = get('draft', interventions);
    rejectedInterventions.textContent = get('rejected', interventions);
    resolvedInterventions.textContent = get('resolved', interventions);
    uiInterventions.textContent = get('under investigation', interventions);
};

const get = (status, arr) => {
    return arr.filter(element => element.status === status).length;
}; 

displayContents();
