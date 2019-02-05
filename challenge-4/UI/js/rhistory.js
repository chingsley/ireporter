if (!sessionStorage.token) {
    location.href = 'login.html';
}

const token = sessionStorage.token;
const reportSection = document.getElementById('section-reporthistory-wrapper')
const reportHistory = document.createElement('div');
reportHistory.className = 'flex-box-reporthistory';
const errorDisplay = document.getElementById('outerErrorDisplayBox');

const myHeaders = new Headers();
myHeaders.append('Content-Type', 'application/json');
myHeaders.append('x-auth-token', token);
const options = { method: 'GET', headers: myHeaders, };
const redflagsURL = `${root}/red-flags`;
const interventionsURL = `${root}/interventions`;


const getUserRecords = async () => {
   try {
       const redflagResponse = await fetch(redflagsURL, options);
       const interventionResponse = await fetch(interventionsURL, options);

       const redflags = await redflagResponse.json();
       const interventions = await interventionResponse.json();

       console.log(redflags.status);
       console.log(interventions.status);

       const userRecords = redflags.data.concat(interventions.data);

       return userRecords;

   } catch (err) {
       console.log(err);
       stopLoader();
       errorDisplay.style.display = 'block';
       handleError(err);
   }
};

const getDefaultImgPath = (record) => {
    if (record.type === 'red-flag') {
       return "../img/redflag-img.png";
    } else if(record.type === 'intervention') {
        return "../img/intervention-img.png";
    } else {
        throw new Error(`'${record.type}' is not a valid record type. Valid record type is 'red-flag' or 'intervention'`)
    }
};

const showNoRecordsFound = () => {
    let msg = '';
    const firstname = sessionStorage.firstname || '';
    const lastname = sessionStorage.lastname || '';
    if(sessionStorage.newUser) {
        msg = `
                <div class="div-welcome-user"><h1>Welcome ${firstname} ${lastname}</h1></div>
                <div class="div-no-records">
                    <h2> Excited to make a difference ?</h2>
                    <p> Then report a case now. Let us know what needs to be made right.</p>
                    <p> To report a case, click on 'NEW REPORT'
                    in the navigation bar. Let's make a change together.</p>
                </div>
                `;
    } else {
        msg = `
                <div class="div-welcome-user"><h1>Welcome ${firstname}</h1></div>
                <div class="div-no-records">
                     <h2> No reports found</h2>
                    <p> It seems you have not reported any case yet.</p>
                    <p> To report a case, click on 'NEW REPORT'
                    in the navigation bar. Let's make a change together</p>
                </div>
                `;
    }

    /** .......................... animation .......................*/
    // This block needs some additional css settings to work 
    // as expected. Therefore, see the '.div-welcome-user' in 
    // 'reporthistory section' of 'style.css' for the animation
    // properties of this div. To be specific, the animation duration 
    // in the css for this div is set to .5 seconds (.5s) and the opacity
    // is set to 0. But when the page loads, we wait for .6 seconds (600)
    // before setting the opacity to 1.
    const divWelcome = document.getElementsByClassName('div-welcome-user');
    setTimeout(() => {
        divWelcome[0].style.opacity = 1;
    }, 600);
    const divNoRecords = document.getElementsByClassName('div-no-records');
    setTimeout(() => {
        divNoRecords[0].style.opacity = 1;
    }, 600);
    /**................................................................ */
    reportSection.innerHTML = msg;
};

const deleteRecord = async (recordType, recordId) => {
    const myHeaders = new Headers();
    const uri = `${root}/${recordType}s/${recordId}`;

    myHeaders.append('x-auth-token', token);
    console.log(recordId, recordType);

    const options = { method: 'DELETE', mode: 'cors', headers: myHeaders, };

    const req = new Request(uri, options);

    try {
        const response = await fetch(req);
        console.log(response);
        const result = await response.json();
        console.log(result);
        console.log(result.status);
        if (result.status === 200) {
            return true;
        } else {
            handleResponseError(result);
        }
    } catch (err) {
        console.log(err);
        handleError(err);
        setTimeout(() => {
            // return false;
        }, 3000);
        // showDialogMsg(0, 'Error', err, 'center');
    }
};

const createReportCard = async (record) => {
    const reportCard = document.createElement('div');
    reportCard.className = 'report';

    const divReportImg = document.createElement('div');
    divReportImg.className = "div-report-img";

    const defaultImg = getDefaultImgPath(record);
    const reportImg = document.createElement('img');
    reportImg.className = "report-img";
    if (record.Images[0]) {
        // function getImgUrl() is in script.js file;
        const res = await getImgUrl(record.Images[0]); 
        console.log(record.id, ' = ', record.Images[0]);
        reportImg.setAttribute('src', res)
    } else {
        reportImg.src = await getImgUrl(getDefaultImgPath(record));
    }

    divReportImg.appendChild(reportImg);
    reportCard.appendChild(divReportImg);

    const reportDetails = document.createElement('div');
    reportDetails.className = 'report-details';
    reportCard.appendChild(reportDetails);

    const table = document.createElement('table');
    table.className = 'report-details-table';
    reportDetails.appendChild(table);

    let id, type, createdOn, details, status;
    let idValue, typeValue, createdOnValue, detailsValue, statusValue;
    let idRow, typeRow, createdOnRow, detailsRow, statusRow;

    // create the rows for the table corresponding 
    // to the record properties
    idRow = document.createElement('tr');
    typeRow = document.createElement('tr');
    createdOnRow = document.createElement('tr');
    detailsRow = document.createElement('tr');
    statusRow = document.createElement('tr');

    // create the left cell, to contain the titles
    id = document.createElement('td');
    type = document.createElement('td');
    createdOn = document.createElement('td');
    details = document.createElement('td');
    status = document.createElement('td');

    // create the Right cell, to contain the values
    idValue = document.createElement('td');
    typeValue = document.createElement('td');
    createdOnValue = document.createElement('td');
    detailsValue = document.createElement('td');
    statusValue = document.createElement('td');

    // I will append the rows to a document fragment (df),
    // then, when when the rows are complete, 
    // append the document fragment to the table
    const df = new DocumentFragment();

    // 1st row: record id
    id.textContent = 'id';
    idValue.textContent = record.id;
    idRow.appendChild(id);
    idRow.appendChild(idValue);
    df.appendChild(idRow);

    // 2nd row: record type
    type.textContent = 'type:';
    typeValue.textContent = record.type;
    typeRow.appendChild(type);
    typeRow.appendChild(typeValue);
    df.appendChild(typeRow);

    // 3rd row: date created
    createdOn.textContent = 'created on:';
    const date = record.createdOn;
    const strDate = JSON.stringify(date);
    const clippedDate = strDate.slice(1, 11);
    createdOnValue.textContent = clippedDate;
    createdOnRow.appendChild(createdOn);
    createdOnRow.appendChild(createdOnValue);
    df.appendChild(createdOnRow);

    // 4th row: record details (comments and images)
    details.textContent = 'details:';
    detailsValue.classList.add('animated-link');
    detailsValue.classList.add('td-details');
    let a = document.createElement('a');
    a.textContent = '...';
    a.classList.add('report-card-comments-and-media');
    a.addEventListener('click', () => {
        // display the popup with record comments and images
        const popup = document.getElementById('popup');
        const popupContent = document.getElementById('popup-content');
        popup.style.opacity = 1;
        popup.style.visibility = 'visible';
        popupContent.style.opacity = 1;
        popupContent.style.transform = 'translate(-50%, -50%) scale(1)';

        // replace popup comments with record's comment
        const popupText = document.getElementsByClassName('popup-text');
        const popupImg = document.getElementsByClassName('popup-img');

        popupText[0].textContent = record.comment;
        // popupImg[0].src = record.Images[0] ? `${imgRoot}/${record.Images[0]}` : defaultImg;
        popupImg[0].src = record.Images[0] ? record.Images[0] : defaultImg;
        // popupImg[1].src = record.Images[1] ? `${imgRoot}/${record.Images[1]}` : defaultImg;
        popupImg[1].src = record.Images[1] ? record.Images[1] : defaultImg;

        // close popup
        const popupClose = document.getElementById('popup-close');
        popupClose.addEventListener('click', () => {
            popup.style.opacity = 0;
            popup.style.visibility = 'hidden';
            popupContent.style.opacity = 0;
            popupContent.style.transform = 'translate(-50%, -50%) scale(.25)';
        });
    });
    detailsValue.appendChild(a);
    detailsRow.appendChild(details);
    detailsRow.appendChild(detailsValue);
    df.appendChild(detailsRow);

    // 5th row: record status
    status.textContent = 'status:';
    // add class to the statusValue td cell, and set the value to 'investigatin' if status is 'under-investigation
    if (record.status === 'under investigation') {
        statusValue.className = `td-status-ui`;
        statusValue.textContent = `investigating`;
    } else {
        statusValue.className = `td-status-${record.status}`;
        statusValue.textContent = record.status;
    }
    statusRow.appendChild(status);
    statusRow.appendChild(statusValue);
    df.appendChild(statusRow);

    // with the rows complete, append the df to the table;
    table.appendChild(df);

    // create the 'edit button'
    const divBtnEdit = document.createElement('div');
    divBtnEdit.className = 'report-details-div-btn';
    divBtnEdit.style.marginBottom = '1rem';
    const btnEdit = document.createElement('button');
    btnEdit.className = 'btn';
    btnEdit.id = 'btn-edit-report';
    btnEdit.textContent = 'Edit';
    divBtnEdit.appendChild(btnEdit);

    // create the 'delete button';
    const btnDelete = document.createElement('span');
    btnDelete.className = 'delete-report';
    btnDelete.innerHTML = '&times;';

    // attach the 'buttons' if record status is 'draft';
    if (record.status === 'draft') {
        reportCard.appendChild(divBtnEdit);
        reportCard.appendChild(btnDelete);
    }

    // add click event to 'edit button';
    btnEdit.addEventListener('click', () => {
        localStorage.recordId = record.id;
        localStorage.recordType = record.type;
        localStorage.recordLocation = record.location;
        localStorage.recordComment = record.comment;
        localStorage.recordImages = record.Images;
        localStorage.recordVideos = record.Videos;
        location.href = 'editrecord.html'; // should be 'editrecord.html'
    });

    // add click event to 'delete button'
    btnDelete.addEventListener('click', (event) => {
        //    sessionStorage.recordId = record.id;
        const msg = `
                        Are you sure you want to delete this record ?
                        <br><br>
                        NOTE: This operation is not reversible !
                        `;

        setTimeout(() => {
            showDialogMsg(1, 'WARNING', msg, 'center');
        }, 700);

        // The 'PROCEED' btn for the WARNING dialog box: 
        //    btnConfirm[1].onclick = () => {
        btnConfirm[1].addEventListener('click', async () => {
            startLoader();
            try {
                const successfulDelete = await deleteRecord(record.type, record.id);
                stopLoader()
                if (successfulDelete) {
                    dialogWindow.style.display = "none";
                    console.log(record.id);
                    console.log(event.target);
                    console.log(event.target.parentNode);
                    reportHistory.removeChild(event.target.parentNode);
                    showDialogMsg(2, 'Deleted', `Record ${record.id} has been deleted`, 'center');
                    return true;
                } else {
                    const msg = `Failed to delete record<br>
                                    Please check your internet connection or try reconnecting to the wi-fi.`;
                    showDialogMsg(0, 'Error', msg, 'center');
                }
            } catch (err) {
                stopLoader();
                console.log(err);
                handleError(err);
            };
        });
    });

    return reportCard;
};

const displayRecords = async () => {
    startLoader();

    const records = await getUserRecords();
    if (records.length > 0) {
        records.sort((a, b) => Number(a.id) - Number(b.id)); 
        for (let i = 0; i < records.length; i += 1) {// note: With the sorting, the records are rendered in order if for() is used (but not with forEach);
            const reportCard = await createReportCard(records[i]);
            reportHistory.appendChild(reportCard);
        }

        reportSection.appendChild(reportHistory);

    } else {
        showNoRecordsFound();
    }

    stopLoader();
};

displayRecords();

