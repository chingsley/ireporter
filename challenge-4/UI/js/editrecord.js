// DECLARE VARIABLES
const btnChangeLocation = document.getElementById('btn-change-location');
const btnSaveLocation = document.getElementById('btn-save-location');
const btnSaveComment = document.getElementById('btn-save-comment');
const addressContainer = document.getElementById('rep-field-for-address');
const coordsContainer = document.getElementById('rep-field-for-coords');
const spanRecordId = document.getElementById('record-id');
const spanRecordType = document.getElementById('record-type');
const coords = document.getElementById('coords');
const address = document.getElementById('address');
const comment = document.getElementById('comment');
const recordId = localStorage.recordId;
const recordType = localStorage.recordType;
const token = sessionStorage.token;
let recordAddress = '';
let msg = '';
spanRecordId.innerText = recordId;
spanRecordType.innerText = recordType.toString().toUpperCase();
coords.value = localStorage.recordLocation;
coords.title = 'readOnly';
comment.value = localStorage.recordComment;

{// HANDLING GEOLOCATION (NOTE: THE CALL FOR THE 'PATCH' OPERATION HAPPENS WITHING THE 'geocodeAddress' FUNCTION
    // let btn = document.getElementById('btn-get-current-location');
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

    // Use this to allow the user generate the coordinates of the current location
    // btn.addEventListener('click', function () {
    //     getLocation();
    // });
}

{// POPULATE THE FIELDS WITH THE RECORD DETAILS WITH SOME ANIMATIONS

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
                msg = `<ul class="dialog-box-ul">Try:
                            <li>Checking the network cables, modem, and router</li>
                            <li>Reconnecting to Wi-Fi</li>
                            </ul>`;
                showDialogMsg(0, 'Connection failure', msg);
            } else {
                showDialogMsg(0, 'Error', err.message, 'center');
            }
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
                msg = `<ul class="dialog-box-ul">Try:
                            <li>Checking the network cables, modem, and router</li>
                            <li>Reconnecting to Wi-Fi</li>
                            </ul>`;
                showDialogMsg(0, 'Connection failure', msg);
            } else {
                showDialogMsg(0, 'Error', err.message, 'center');
            }
        });
};

{// PATCH COMMENT
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
