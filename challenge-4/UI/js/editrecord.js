// DECLARE VARIABLES
const address = document.getElementById('address');
const addressContainer = document.getElementById('rep-field-for-address');
const btnAddImages = document.getElementById('btn-add-images');
const btnAddVideos = document.getElementById('btn-add-videos');
const btnChangeLocation = document.getElementById('btn-change-location');
const btnGetCurrentLocation = document.getElementById('btn-get-current-location');
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
const vidFileInput = document.querySelector('.vid-file-input');
const vidFileInputContainer = document.querySelector('.vid-file-input-container');
const vidUploadInfo = document.querySelector('.vid-upload-info');

let allowedUploadCount = 0;
let geocoder;
let infowindow;
let map;
let msg = '';
let recordAddress = '';
let x = 0;
let y = 0;

btnAddVideos.title = 'no videos selected';
btnAddImages.title = 'no images selected'
btnSaveComment.title = 'no changes made yet';
btnSaveLocation.title = 'no changes made yet';
coords.title = 'readOnly';
spanRecordId.innerText = recordId;
spanRecordType.innerText = recordType.toString().toUpperCase();


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
    function initMap() {
        map = new google.maps.Map(document.getElementById('map'), {
            zoom: 8,
            center: { lat: 6.465422, lng: 3.406448 }
        });

        geocoder = new google.maps.Geocoder();
        infowindow = new google.maps.InfoWindow();
    }

    function geocodeAddress(geocoder, resultsMap, infowindow) {
        let p1 = new Promise((resolve, reject) => {
            try {
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
                        if (status === 'ERROR') {
                            msg = `Theres was a problem with geolocation. <br>Please check your internet connection: ` + status;
                            reject({ message: msg, errType: 'network error' })
                        } else {
                            msg = 'The address you entered is unknown: ' + status;
                            msg = `${status}: unknown address. <br> Please enter a valid address.`;
                            reject({ message: msg, errType: 'Geolocation error' })
                        }
                    }
                });
            }
            catch(err) {
                handleGeolocationNetworkError();
            }
        });

        return p1;
    }

    function geocodeLatLng(geocoder, resultsMap, infowindow) {
        let input = coords.value;
        let latlngStr = input.split(',', 2);
        let latlng = {lat: parseFloat(latlngStr[0]), lng: parseFloat(latlngStr[1])};
        try {
            geocoder.geocode({ 'location': latlng }, function (results, status) {
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
                    handleGeolocationNetworkError();
                    // alert('The address you entered is unknown: ' + status);
                }
            });
        } catch(err){
            console.log(err);
            handleGeolocationNetworkError();
        };
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

}



const addImg = () => {
    const req = getRequestObj('addImage');
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

const addVideo = () => {
    const req = getRequestObj('addVideo');
    fetch(req)
    .then(response => {
        return response.json();
    })
    .then(response => {
        if(response.status === 200) {
            showDialogMsg(2, 'Upload Successful', response.data[0].message, 'center');
            setTimeout(() => {
                window.location.reload(false); // reload the page after 2 seconds
            }, 2000);
        } else {
            handleResponseError(response);
        }
    })
    .catch(err => {
        handleError(err);
    });

};

const displayContents = (response) => {
    coords.value = response.data[0].location;
    comment.value = response.data[0].comment;
    
    let images = response.data[0].Images;
    let videos = response.data[0].Videos;

    displayMedia(images, 'image');
    displayMedia(videos, 'video');
};

const displayMedia = (mediaArr, mediaType) => {
    // console.log(mediaType, mediaArr);
    let info = '';
    let mediaContainer;
    let mediaFileInputDiv;
    let mediaUploadInfo;
    let btnAddMedia;

    
    if (mediaType === 'image') {
        x = getAllowedUploadCount(mediaArr);
        mediaFileInputDiv = imgFileInputContainer;
        mediaUploadInfo = imgUploadInfo;
        mediaContainer = imgContainer;
        btnAddMedia = btnAddImages;
    } else if (mediaType === 'video') {
        y = getAllowedUploadCount(mediaArr);
        mediaFileInputDiv = vidFileInputContainer;
        mediaUploadInfo = vidUploadInfo;
        mediaContainer = vidContainer;
        btnAddMedia = btnAddVideos;
    } else {
        throw new Error(`displayMedia() expects mediaType to be 'image' or 'video' `);
    }

    if (mediaArr.length < MEDIA_MAX_COUNT) {
        info = `you have uploaded ${mediaArr.length}/${MEDIA_MAX_COUNT} ${mediaType}s`;
    } else {
        info = `you have reached the maximum upload of ${MEDIA_MAX_COUNT} ${mediaType}s`;
        mediaFileInputDiv.style.display = 'none';
        btnAddMedia.style.display = 'none';
        mediaUploadInfo.style.color = '#e8491d';
    }

    mediaUploadInfo.innerHTML = info;
    mediaArr.forEach(file => {
        const mediaDiv = document.createElement('div');
        let media;
        if (mediaType === 'image') {
            mediaDiv.classList.add('ic_image-div');
            media = document.createElement('img');
            // console.log(media);
            media.classList.add('record-img');
        } else {
            mediaDiv.classList.add('vc_video-div');
            media = document.createElement('video');
            media.controls = true;
            // console.log(media);
            media.classList.add('record-vid');
        }
        mediaContainer.appendChild(mediaDiv);
        media.src = `${imgRoot}/${file}`;
        mediaDiv.appendChild(media);
    });
};

const getAllowedUploadCount = (mediaArr) => {
    return MEDIA_MAX_COUNT - mediaArr.length;
}

const getRequestObj = (str) => {
    const formdata = new FormData();
    const myHeaders = new Headers();
    const uri = `${root}/${recordType}s/${recordId}/${str}`;
    const images = imgFileInput.files;
    const videos = vidFileInput.files;

    myHeaders.append('x-auth-token', token);

    switch(str) {
        case('location'):
            formdata.append('location', coords.value);
            break;
        case('comment') : 
            formdata.append('comment', comment.value);
            break;
        case('addImage') :
            if (images.length > 0) {
                for (let i = 0; i < images.length; i += 1) {
                    formdata.append('images', images[i], `${recordId}_${images[i].name}`);
                }
            }
            break;
        case('addVideo') : 
            if (videos.length > 0) {
                for (let i = 0; i < videos.length; i += 1) {
                    formdata.append('videos', videos[i], `${recordId}_${videos[i].name}`);
                }
            }
            break;
    }

    const options = {
        method: 'PATCH',
        mode: 'cors',
        headers: myHeaders,
        body: formdata,
    };

    const req = new Request(uri, options);

    return req;
};

const patchComment = () => {
    const req = getRequestObj('comment');
    fetch(req)
        .then(response => {
            return response.json();
        })
        .then(response => {
            if (response.status === 200) {
                msg = `<p>${response.data[0].message}</p>`;
                showDialogMsg(2, 'Saved', msg, 'center');

                // reload the page after 3 seconds
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

const patchLocation = () => {
    const req = getRequestObj('location');
    fetch(req)
    .then(response => {
        return response.json();
    })
    .then(response => {
        if (response.status === 200) {
            msg = `<p>${response.data[0].message}</p>
                    <p>Closest landmark: ${recordAddress}</p>`;
            showDialogMsg(2, 'Location Updated', msg, 'center');

            // reload the page after 3 seconds
            setTimeout(() => {
                window.location.reload(false);
            }, 3000);
        } else {
            handleResponseError(response);
        }
    })
    .catch(err => {
        handleError(err);
    });
};


address.addEventListener('blur', () => {
    address.style.backgroundColor = 'rgba(128, 128, 128, .5)';
});

address.addEventListener('input', () => {
    address.style.backgroundColor = 'transparent';
    btnSaveLocation.disabled = false;
    btnSaveLocation.title = '';
});

btnAddImages.addEventListener('click', (event) => {
    event.preventDefault();
    addImg();
});

btnAddVideos.addEventListener('click', (event) => {
    event.preventDefault();
    addVideo();
});

btnSaveComment.addEventListener('click', (event) => {
    event.preventDefault();
    patchComment();
});

btnSaveLocation.addEventListener('click', (event) => {
    event.preventDefault();
    let p1 = geocodeAddress(geocoder, map, infowindow);

    p1.then((result) => {
        // console.log('result', result); // true (because: resolve(true))

        setTimeout(() => { patchLocation(); }, 1000);
    }).catch(err => {
        showDialogMsg(0, err.errType, err.message, 'center');
    });
});

comment.addEventListener('blur', () => {
    comment.style.backgroundColor = 'rgba(128, 128, 128, .5)';
});

comment.addEventListener('input', () => {
    comment.style.backgroundColor = 'transparent';
    btnSaveComment.disabled = false;
    btnSaveComment.title = '';
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
            return;
        }
    }

    if(files.length > x) {
        msg = `Maximum number of image upload is ${MEDIA_MAX_COUNT} <br>
               You can only upload ${x} more`;
        showDialogMsg(0, 'Image Upload Error', msg, 'center');
         
        imgFileInput.value = "";
        return;
    }
    // console.log(files);
    btnAddImages.disabled = false;
    btnAddImages.title = '';
});

vidFileInput.addEventListener('change', () => {
    const files = vidFileInput.files;
    const allowedTypes = ['video/mp4'];
    for(let i = 0; i < files.length; i += 1) {
        if(!allowedTypes.includes(files[i].type)) {
            msg = `${files[i].name} is not supported
                    </br> Supported formats are ${allowedTypes.join(', ')}`;
            showDialogMsg(0, 'Unsupported Video Format', msg, 'center');
            vidFileInput.value = ""; // clear the content of the the file input element
            return;
        } else if(files[i].size > 10000000) {
            msg = `${files[i].name} exceeds the limit of allowed video size <br>
                    MAXIMUM ALLOWED SIZE : 10MB`;
            showDialogMsg(0, 'Large Video detected', msg, 'center');
            vidFileInput.value = "";
            return;
        }
    }

    if(files.length > y) {
        msg = `Maximum number of video upload is ${MEDIA_MAX_COUNT} <br>
               You can only upload ${y} more`;
        showDialogMsg(0, 'Video Upload Error', msg, 'center');
         
        vidFileInput.value = "";
        return;
    }

    btnAddVideos.disabled = false;
    btnAddVideos.title = '';
});

window.addEventListener('load', () => {
    geocodeLatLng(geocoder, map, infowindow);
}, false);




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
        // console.log(result);
        // console.log(coords.value);
//         geocodeLatLng(geocoder, map, infowindow);
//     }).catch(err => {
//         showDialogMsg(0, 'Error', err, 'center');
//     });
// });


 // // Use this to allow the user generate the coordinates of the current location
// btnGetCurrentLocation.addEventListener('click', function (event) {
//     event.preventDefault();
//     getLocation();
//     geocodeLatLng(geocoder, map, infowindow);
// });



// btnSaveChanges.addEventListener('click', (event) => {
//     event.preventDefault();

//     let p1 = geocodeAddress(geocoder, map, infowindow);

//     p1.then((result) => {
//         console.log('result', result); // true (because: resolve(true))

//         setTimeout(() => { saveChanges(); }, 1000);
//     }).catch(err => {
//         console.log(err);
//         showDialogMsg(0, err.errType, err.message, 'center');
//     });
//     // saveChanges();
// });



// let resultArr = [];
// let count;
// const saveChanges = () => {
//     count = 0;
//     resultArr = [];
//     msg = '';
//     const saveLocation = fetch(getRequestObj('location'));
//     const saveComment = fetch(getRequestObj('comment'));
//     const saveImages = fetch(getRequestObj('addImage'));
//     const saveVideos = fetch(getRequestObj('addVideo'));

//     promiseArr = [saveLocation, saveComment, saveImages, saveVideos];

//     Promise.all(promiseArr)
//         .then(responseArr => {
//             console.log(responseArr);
//             responseArr.forEach(response => {
//                 process(response.json());
//             });
//         })
//         .catch(err => {
//             console.log(err);
//             showDialogMsg(0, 'Error', err.message, 'center');
//         });
// };


// const process = (jsonResult) => {
//     jsonResult.then((responseObj) => {
//         console.log(responseObj);
//         resultArr.push(responseObj);
//         console.log(count, promiseArr.length - 1);
//         if (count === promiseArr.length - 1) { // 3 fetch operations : 0 , 1, 2
//             console.log(resultArr);
//             let errorResponse = checkForErrors(resultArr);
//             if (errorResponse.length > 0) {
//                 errorResponse.forEach(response => {
//                     msg += `${response.error}<br>`;
//                 })
//             }
//             showDialogMsg(0, 'Error', msg, 'center');
//         }
//         count += 1;
//     });
// };

// const checkForErrors = (resultArr) => {
//     let errResults = resultArr.filter(result => {
//         if (!(result.status >= 200 && result.status < 400)) {
//             return result;
//         }
//     });
//     console.log(errResults);
//     return errResults;
// };