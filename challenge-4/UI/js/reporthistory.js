const reportSection = document.getElementById('section-reporthistory-wrapper')
const reportHistory = document.createElement('div');
reportHistory.className = 'flex-box-reporthistory';

const token = sessionStorage.token;
console.log('sessionStorage.token from reporthistory.js = ', token);

const myHeaders = new Headers();
myHeaders.append('Content-Type', 'application/json');
myHeaders.append('x-auth-token', token);

const options = { method: 'GET', headers: myHeaders, };

const redflagsURL = `${root}/red-flags`;
const interventionsURL = `${root}/interventions`;
const reqRedflags = fetch(redflagsURL, options);
const reqInterventions = fetch(interventionsURL, options);

Promise.all([reqRedflags, reqInterventions])
.then((responseArr) => {
    console.log('responseArr', responseArr);
    responseArr.forEach(response => {
        process(response.json()); // the .json() method returns a promise
    });
}).catch(err => {
    console.log('error message: ', err);
    // use DOM to construct a dialog box for error message
    // most likely error here will be a network failure
    showDialogMsg(0, 'Error', err.message);
});


const process = (promisedJson) => {
    promisedJson.then((responseObj) => {
        const records = responseObj.data;
        
        records.forEach(record => {
            console.log(record);
            const reportCard = document.createElement('div');
            reportCard.className = 'report';
           
            const reportDetails = document.createElement('div');
            reportDetails.className = 'report-details';
            reportCard.appendChild(reportDetails);

            const table = document.createElement('table');
            table.className = 'report-details-table';
            reportDetails.appendChild(table);

            let type, createdOn, details, status;
            let typeValue, createdOnValue, detailsValue, statusValue;
            let typeRow, createdOnRow, detailsRow, statusRow;
           
            typeRow = document.createElement('tr');
            createdOnRow = document.createElement('tr');
            detailsRow = document.createElement('tr');
            statusRow = document.createElement('tr');

            type = document.createElement('td');
            createdOn = document.createElement('td');
            details = document.createElement('td');
            status = document.createElement('td');
            
            typeValue = document.createElement('td');
            createdOnValue = document.createElement('td');
            detailsValue = document.createElement('td');
            statusValue = document.createElement('td');
            statusValue.className = `td-status-${record.status}`;

            const df = new DocumentFragment();
            type.textContent = 'type:';
            typeValue.textContent = record.type;
            typeRow.appendChild(type);
            typeRow.appendChild(typeValue);
            df.appendChild(typeRow);
           
            const date = record.createdOn;
            const strDate = JSON.stringify(date);
            const clippedDate = strDate.slice(1, 11);
            
            createdOn.textContent = 'created On:';
            createdOnValue.textContent = clippedDate;
            createdOnRow.appendChild(createdOn);
            createdOnRow.appendChild(createdOnValue);
            df.appendChild(createdOnRow);
            
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
                console.log(popupText);
                popupText[0].textContent = record.comment;

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
            
            status.textContent = 'status:';
            statusValue.textContent = record.status;
            statusRow.appendChild(status);
            statusRow.appendChild(statusValue);
            df.appendChild(statusRow);

            table.appendChild(df);

            
            reportHistory.appendChild(reportCard);
        });
    });
    reportSection.appendChild(reportHistory);
};