// DECLARE VARIABLES
const address = document.getElementById('address');
const addressContainer = document.getElementById('rep-field-for-address');
const btnChangeLocation = document.getElementById('btn-change-location');
const btnSaveComment = document.getElementById('btn-save-comment');
const btnSaveChanges = document.getElementById('btn-save-changes');
const btnSaveLocation = document.getElementById('btn-save-location');
const comment = document.getElementById('comment');
const coords = document.getElementById('coords');
const coordsContainer = document.getElementById('rep-field-for-coords');
const imgContainer = document.querySelector('.img-collection');
const imgFileInput = document.querySelector('.img-file-input'); 
const imgFileInputContainer = document.querySelector('.img-file-input-container');
const imgUploadInfo = document.querySelector('.img-upload-info');
const MEDIA_MAX_COUNT = 3;
const recordId = localStorage.recordId;
const recordType = localStorage.recordType;
const spanRecordId = document.getElementById('record-id');
const spanRecordType = document.getElementById('record-type');
const token = sessionStorage.token;
const vidContainer = document.querySelector('.vid-collection');
const vidFileInputContainer = document.querySelector('.vid-file-input-container');
const vidUploadInfo = document.querySelector('.vid-upload-info');

let allowedUploadCount = 0;
let x = 0;
let y = 0;
let msg = '';
let recordAddress = '';

coords.title = 'readOnly';
spanRecordId.innerText = recordId;
spanRecordType.innerText = recordType.toString().toUpperCase();

// console.log(imgFileInput);
// console.log(imgUploadInfo);
// console.log(imgContainer);

{// FETCH THE SPECIFIC RECORD OF THE GIVEN recordId
    const uri = `${root}/${recordType}s/${recordId}`;
    const newHeaders = new Headers();
    newHeaders.append('Content-Type', 'application/json');
    newHeaders.append('x-auth-token', token);
    const options = { method: 'GET', headers: newHeaders, };
    req = new Request(uri, options);

    fetch(req)
    .then(response => {
        return response.json();
    })
    .then(response => {
        if(response.status === 200) {
            displayContents(response);
        } else {
            handleResponseError(response);
        }
    })
    .catch(err => {
        handleError(err);
    });

}

{// HANDLING GEOLOCATION (NOTE: THE CALL FOR THE 'PATCH' OPERATION HAPPENS WITHING THE 'geocodeAddress' FUNCTION
    // let btnGetCurrentLocation = document.getElementById('btn-get-current-location');
    function initMap() {
        let map = new google.maps.Map(document.getElementById('map'), {
            zoom: 8,
            center: { lat: 6.465422, lng: 3.406448 }
        });

        let geocoder = new google.maps.Geocoder();
        let infowindow = new google.maps.InfoWindow();

        window.addEventListener('load',() => {
                geocodeLatLng(geocoder, map, infowindow);
        }, false);
        
        btnSaveLocation.addEventListener('click', (event) => {
            event.preventDefault();
            geocodeAddress(geocoder, map, infowindow);
        });

        // // Use this to allow the user generate the coordinates of the current location
        // btnGetCurrentLocation.addEventListener('click', function (event) {
        //     event.preventDefault();
        //     // getLocation();
        //     // let outcome = getLocation();
        //     let p1 = new Promise((resolve, reject) => {
        //        let outcome =  getLocation();
        //         if(outcome === true) {
        //             resolve(outcome);
        //         } else {
        //             reject("Geolocation is not supported by this browser.");
        //         }
        //     });
        //     p1.then(result => {
        //         console.log(result);
        //         console.log(coords.value);
        //         geocodeLatLng(geocoder, map, infowindow);
        //     }).catch(err => {
        //         showDialogMsg(0, 'Error', err, 'center');
        //     });
        // });

    }

    function geocodeAddress(geocoder, resultsMap, infowindow) {
        // let address = document.getElementById('address').value;
        let p1 = new Promise((resolve, reject) => {
            geocoder.geocode({ 'address': address.value }, function (results, status) {
                if (status === 'OK') {
                    // isValidCoords = true;
                    coords.value = `${results[0].geometry.location.lat()}, ${results[0].geometry.location.lng()}`;
                    resultsMap.setCenter(results[0].geometry.location);
                    let marker = new google.maps.Marker({
                        map: resultsMap,
                        position: results[0].geometry.location
                    });
                    infowindow.setContent(results[0].formatted_address);
                    recordAddress = results[0].formatted_address;
                    infowindow.open(map, marker);
                    resolve(true);
                } else {
                    // isValidCoords = false;
                    // alert('The address you entered is unknown: ' + status);
                    if (status === 'ERROR') {
                        msg = `Theres was a problem with geolocation. <br>Please check your internet connection: ` + status;
                        // reject(`Theres was a problem with geolocation. <br>Please check your internet connection: ` + status);
                        reject({message: msg, errType: 'network error'})
                    } else {
                        msg = 'The address you entered is unknown: ' + status;
                        reject({ message: msg, errType: 'Geolocation error' })
                    }
                    // reject('The address you entered is unknown: ' + status);
                }
            });
        });

        p1.then((result) => {
            console.log('result', result); // true (because: resolve(true))
            const uri = `${root}/${recordType}s/${recordId}/location`; // notice to the addition of 's' to make interventions and red-flags

            const formdata = new FormData();
            formdata.append('location', coords.value);

            const myHeaders = new Headers();
            // myHeaders.append('Content-Type', 'application/json'); // This results in error during fetch
            myHeaders.append('x-auth-token', token);

            const options = { method: 'PATCH', mode: 'cors', headers: myHeaders, body: formdata, };
            const req = new Request(uri, options);
            // patchLocation(req);
            setTimeout(() => { patchLocation(req); }, 1000);
        }).catch(err => {
            showDialogMsg(0, err.errType, err.message, 'center');
        });
    }

    function geocodeLatLng(geocoder, resultsMap, infowindow) {
        let input = coords.value;
        let latlngStr = input.split(',', 2);
        let latlng = {lat: parseFloat(latlngStr[0]), lng: parseFloat(latlngStr[1])};
        geocoder.geocode({'location': latlng}, function(results, status) {
            if (status === 'OK') {
                resultsMap.setCenter(results[0].geometry.location);
                let marker = new google.maps.Marker({
                    map: resultsMap,
                    position: results[0].geometry.location
                });
                infowindow.setContent(results[0].formatted_address);
                recordAddress = results[0].formatted_address;
                address.value = recordAddress;
                infowindow.open(map, marker);
            } else {
                alert('The address you entered is unknown: ' + status);
            }
        });

    }

    function getLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(showPosition);
        } else {
            alert("Geolocation is not supported by this browser.");
        }
    }

    function showPosition(position) {
        coords.value = `${position.coords.latitude}, ${position.coords.longitude}`;
    }

    // // Use this to allow the user generate the coordinates of the current location
    // btnGetCurrentLocation.addEventListener('click', function (event) {
    //     event.preventDefault();
    //     getLocation();
    //     geocodeLatLng(geocoder, map, infowindow);
    // });
}

{// ADD EVENT LISTENER TO THE ADDRESS INPUT WITH SOME ANIMATIONS

    // show the 'save changes' button when the user changes the address
    address.addEventListener('input', () => {
        address.style.backgroundColor = 'transparent';
        btnSaveLocation.style.display = 'block';
        btnSaveLocation.style.animation = 'moveInLeft 1s ease';
    });
    address.addEventListener('blur', () =>{
        address.style.backgroundColor = 'rgba(128, 128, 128, .5)';
    })
}

{// SET UP FOR PATCH COMMENT
    comment.addEventListener('input', () => {
        btnSaveComment.style.display = 'block';
        btnSaveComment.style.animation = 'moveInLeft 1s ease';
        comment.style.backgroundColor = 'transparent';
    });
    comment.addEventListener('blur', () => {
        comment.style.backgroundColor = 'rgba(128, 128, 128, .5)';
    });

    btnSaveComment.addEventListener('click', (event) => {
        event.preventDefault();

        const uri = `${root}/${recordType}s/${recordId}/comment`; // notice to the addition of 's' to make interventions and red-flags
        const formdata = new FormData();
        formdata.append('comment', comment.value);
        const myHeaders = new Headers();
        myHeaders.append('x-auth-token', token);
        const options = { method: 'PATCH', mode: 'cors', headers: myHeaders, body: formdata, };
        const req = new Request(uri, options);
        patchComment(req);
    });
}


const addImg = () => {
    const formdata = new FormData();
    const myHeaders = new Headers();
    const uri = `${root}/${recordType}s/${recordId}/addImage`;
    console.log(uri);
    const images = imgFileInput.files;
    

    myHeaders.append('x-auth-token', token);
    if(images.length > 0 ) {
        for(let i = 0; i < images.length; i += 1) {
            formdata.append('images', images[i], `${recordId}_${images[i].name}`);
        }
    }

    const options = { 
         method: 'PATCH',
         mode: 'cors', 
         headers: myHeaders, 
         body: formdata, 
    };

    const req = new Request(uri, options);

    fetch(req)
    .then(response => {
        return response.json();
    })
    .then(response => {
        if(response.status === 200) {
            showDialogMsg(2, 'Upload Successful', response.data[0].message, 'center');
            setTimeout(() => {
                window.location.reload(false);
            }, 2000);
        } else {
            handleResponseError(response);
        }
    })
    .catch(err => {
        handleError(err);
    });

};

const getAllowedUploadCount = (mediaArr) => {
    return MEDIA_MAX_COUNT - mediaArr.length;
}

const displayContents = (response) => {
    coords.value = response.data[0].location;
    comment.value = response.data[0].comment;
    
    let images = response.data[0].Images;
    let videos = response.data[0].Videos;

    displayMedia(images, 'image');
    displayMedia(videos, 'video');

    // console.log(videos);
    // let info = '';
    // if(images.length === MEDIA_MAX_COUNT) {
    //     info = `you have reached the maximum upload of ${MEDIA_MAX_COUNT} images`;
    //     imgFileInputContainer.style.display = 'none'; // hide the img file input element
    // } else if (images.length < MEDIA_MAX_COUNT) {
    //     allowedUploadCount = MEDIA_MAX_COUNT - images.length;
    //     info = `you have uploaded ${images.length}/${MEDIA_MAX_COUNT} images`;
    // } else {
    //     info = `you have exceeded the maximum upload count of ${MEDIA_MAX_COUNT}`;
    //     imgFileInputContainer.style.display = 'none';
    // }

    // imgUploadInfo.innerHTML = info;
    // images.forEach(image => {
    //     const imgDiv = document.createElement('div');
    //     imgDiv.classList.add('ic_image-div');
    //     imgContainer.appendChild(imgDiv);
    //     const img = document.createElement('img');
    //     img.classList.add('record-img');
    //     img.src = `${imgRoot}/${image}`;
    //     imgDiv.appendChild(img);
    // });
};

const displayMedia = (mediaArr, mediaType) => {
    console.log(mediaType, mediaArr);
    let info = '';
    let mediaContainer;
    let mediaFileInputDiv;
    let mediaUploadInfo;

    
    if (mediaType === 'image') {
        x = getAllowedUploadCount(mediaArr);
        mediaFileInputDiv = imgFileInputContainer;
        mediaUploadInfo = imgUploadInfo;
        mediaContainer = imgContainer;
        console.log(imgContainer);
        console.log(mediaContainer);
    } else if (mediaType === 'video') {
        y = getAllowedUploadCount(mediaArr);
        mediaFileInputDiv = vidFileInputContainer;
        mediaUploadInfo = vidUploadInfo;
        mediaContainer = vidContainer;
        console.log(vidContainer);
        console.log(mediaContainer);
    } else {
        throw new Error(`displayMedia() expects mediaType to 'image' or 'video' `);
    }

    if (mediaArr.length < MEDIA_MAX_COUNT) {
        info = `you have uploaded ${mediaArr.length}/${MEDIA_MAX_COUNT} ${mediaType}s`;
    } else {
        info = `you have reached the maximum upload of ${MEDIA_MAX_COUNT} ${mediaType}s`;
        mediaFileInputDiv.style.display = 'none';
    }

    mediaUploadInfo.innerHTML = info;
    mediaArr.forEach(file => {
        const mediaDiv = document.createElement('div');
        let media;
        if (mediaType === 'image') {
            mediaDiv.classList.add('ic_image-div');
            media = document.createElement('img');
            console.log(media);
            media.classList.add('record-img');
        } else {
            mediaDiv.classList.add('vc_video-div');
            media = document.createElement('video');
            console.log(media);
            media.classList.add('record-vid');
        }
        mediaContainer.appendChild(mediaDiv);
        media.src = `${imgRoot}/${file}`;
        mediaDiv.appendChild(media);
    });
};

const patchComment = (req) => {
    fetch(req)
        .then(response => {
            return response.json();
        })
        .then(response => {
            if (response.status === 200) {
                msg = `<p>${response.data[0].message}</p>`;
                showDialogMsg(2, 'Saved', msg, 'center');
            } else {
                handleResponseError(response);
            }
        })
        .catch(err => {
            handleError(err);
        });
};

const patchLocation = (req) => {
    fetch(req)
        .then(response => {
            return response.json();
        })
        .then(response => {
            if (response.status === 200) {
                // sessionStorage.recordId = response.data[0].id;
                msg = `<p>${response.data[0].message}</p>
                       <p>Closest landmark: ${recordAddress}</p>`;
                showDialogMsg(2, 'Saved', msg, 'center');
            } else {
                handleResponseError(response);
            }
        })
        .catch(err => {
            handleError(err);
        });
};


btnSaveChanges.addEventListener('click', (event) => {
    event.preventDefault();

    addImg();
});

imgFileInput.addEventListener('change', () => {
    const files = imgFileInput.files;
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    for(let i = 0; i < files.length; i += 1) {
        if(!allowedTypes.includes(files[i].type)) {
            msg = `${files[i].name} is not supported
                    </br> Supported formats are ${allowedTypes.join(', ')}`;
            showDialogMsg(0, 'Unsupported Image Format', msg, 'center');

            imgFileInput.value = ""; // clear the content of the the file input element
        }
    }

    if(files.length > x) {
        msg = `Maximum image upload is ${MEDIA_MAX_COUNT} <br>
               You can only upload ${x} more image`;
        showDialogMsg(0, 'Image Upload Error', msg, 'center');
         
        imgFileInput.value = "";
    }
    console.log(files);
});
