
const createCell = (arrOfClassNames, textContent) => {
    let td = document.createElement('td');
    arrOfClassNames.forEach(className => {
        td.classList.add(className);
    });
    td.textContent = textContent;
    return td;
}

const displayRecords = async () => {
    records = await getAllRecords();
    console.log(records);

    const table = document.getElementById('table-admin');

    records.forEach(record => {
        const tr = document.createElement('tr');
        tr.classList.add('row');

        const id = createCell(['cell', 'id'], record.id);
        const dateCreated = JSON.stringify(record.createdOn).slice(1, 11);
        const createdOn = createCell(['cell', 'createdon'], dateCreated);
        const createdBy = createCell(['cell', 'createdby'], record.createdBy);
        const type = createCell(['cell', 'type'], record.type);
        const location = createCell(['cell', 'location'], record.location);
        const commentAndMedia = createCell(['cell', 'comment-and-media']);
        commentAndMedia.appendChild(popup(record));
        const status = createCell(['cell', 'status']);
        status.id = record.status === 'under investigation' ? 'under-investigation' : record.status;
        console.log(status);

        const select = document.createElement('select');
        select.id = 'status';
        const statusOptions = ['draft', 'under investigation', 'resolved', 'rejected'];
        statusOptions.forEach(status => {
            const option = document.createElement('option');
            option.setAttribute('value', status);
            option.textContent = status;
            select.appendChild(option);
        });
        select.selectedIndex = statusOptions.indexOf(record.status);
        status.appendChild(select);

        // create the row for each record
        tr.appendChild(id);
        tr.appendChild(type);
        tr.appendChild(commentAndMedia);
        tr.appendChild(location);
        tr.appendChild(createdOn);
        tr.appendChild(createdBy);
        tr.appendChild(status);
        table.appendChild(tr);
    });
} 

const getAllRecords = async () => {

    const token = sessionStorage.token;

    const myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    myHeaders.append('x-auth-token', token);

    const options = { method: 'GET', headers: myHeaders, };

    redflagsURL = `${root}/red-flags`;
    interventionsURL = `${root}/interventions`;

    try {
        const redflagsResponse = await fetch(redflagsURL, options);
        const redflags = await redflagsResponse.json();
        const interventionsResponse = await fetch(interventionsURL, options)
        const interventions = await interventionsResponse.json();
  
        return redflags.data.concat(interventions.data) ;

    } catch(err) {
        console.log(err);
        handleError(err);
    }
    
};

const popup = (record) => {
    const defaultImg = (record.type === 'red-flag') ?
        "../img/redflag-img.png" :
        "../img/intervention-img.png";

    let a = document.createElement('a');

    console.log(record.comment.slice(0,record.comment.indexOf(' ')));
    const firstWord = record.comment.slice(0, record.comment.indexOf(' '));
    const slicedComment = record.comment.slice(0, 10);
    a.textContent = (firstWord.length < 10) ? `${firstWord} ...` : `${slicedComment}...`;
    a.classList.add('comment-and-media-link');
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

    return a;
};



displayRecords();

