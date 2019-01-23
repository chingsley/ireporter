const token = sessionStorage.token;
const reportSection = document.getElementById('section-reporthistory-wrapper')
const reportHistory = document.createElement('div');
reportHistory.className = 'flex-box-reporthistory';

const myHeaders = new Headers();
myHeaders.append('Content-Type', 'application/json');
myHeaders.append('x-auth-token', token);

const options = { method: 'GET', headers: myHeaders, };

const redflagsURL = `${root}/red-flags`;
const interventionsURL = `${root}/interventions`;
const reqRedflags = fetch(redflagsURL, options);
const reqInterventions = fetch(interventionsURL, options);
const errorDisplay = document.getElementById('outerErrorDisplayBox');


Promise.all([reqInterventions, reqRedflags])
.then((responseArr) => {
    responseArr.forEach(response => {
        process(response.json()); // the .json() method returns a promise
    });
}).catch(err => {
    errorDisplay.style.display = 'block';
    console.log(err);
    handleError(err);
});

let count = 0;
let records = [];
const process = (promisedJson) => {
    promisedJson.then((responseObj) => {
        // const records = responseObj.data;
        count += 1;
        records = records.concat(responseObj.data); // merge new array with the existing one.
        // console.log(records);
        console.log('records.length', records.length);
        console.log('count', count);

       if(count > 1) { // i. if process() function has been called twice, since we are making two requests
           if (records.length > 0) {
               records.forEach(record => {
                   // console.log(record);
                   const defaultImg = (record.type === 'red-flag') ?
                       "../img/redflag-img.png" :
                       "../img/intervention-img.png";

                   const reportCard = document.createElement('div');
                   reportCard.className = 'report';

                   const divReportImg = document.createElement('div');
                   divReportImg.className = "div-report-img";
                   const reportImg = document.createElement('img');
                   reportImg.className = "report-img";
                   if (record.Images[0]) {
                       reportImg.src = `${imgRoot}/${record.Images[0]}`;
                   } else if (record.Images[1]) {
                       reportImg.src = `${imgRoot}/${record.Images[1]}`;
                   } else if (record.Images[2]) {
                       reportImg.src = `${imgRoot}/${record.Images[2]}`;
                   } else {
                       reportImg.src = defaultImg;
                   }
                   // reportImg.src = `${imgRoot}/${record.Images[0]}` || `${imgRoot}/${record.Images[1]}` || defaultImg;
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

                   // I will append the rows to the document fragment,
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
                       popupImg[0].src = record.Images[0] ? `${imgRoot}/${record.Images[0]}` : defaultImg;
                       popupImg[1].src = record.Images[1] ? `${imgRoot}/${record.Images[1]}` : defaultImg;

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
                            try {
                                const successfulDelete = await deleteRecord(record.type, record.id);
                                if(successfulDelete) {
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
                            } catch(err) {
                                console.log(err);
                                handleError(err);
                            };
                       });
                   });

                   reportHistory.appendChild(reportCard);
               });
               reportSection.appendChild(reportHistory);
           } else {
               const firstname = sessionStorage.firstname || '';
               const msg = `
                <div class="div-welcome-user"><h1>Welcome ${firstname}</h1></div>
                <div class="div-no-records">
                    <h2> No Records Found.</h2>
                    <p> It seems you have not reported any case yet.</p>
                    <p> To report a case, click on the 'report a case' link
                    in the navigation bar and start making reports.</p>
                </div>
                `;

               /************************** animation ************************ */
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
               /****************************************************************** */
               reportSection.innerHTML = msg;
           }
       }
    });
};

const deleteRecord = async (recordType, recordId) => {
    const myHeaders = new Headers();
    const uri = `${root}/${recordType}s/${recordId}`;

    myHeaders.append('x-auth-token', token);
    console.log(recordId, recordType);

    const options = { method: 'DELETE', mode: 'cors', headers: myHeaders,};

    const req = new Request(uri, options);

    try {
        const response = await fetch(req);
        console.log(response);
        const result = await response.json();
        console.log(result);
        console.log(result.status);
        if(result.status === 200) {
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