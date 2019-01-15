// DECLARE VARIABLES
const btnChangeLocation = document.getElementById('btn-change-location');
const btnSaveLocation = document.getElementById('btn-save-location');
const addressContainer = document.getElementById('rep-field-for-address');
const coordsContainer = document.getElementById('rep-field-for-coords');
const coords = document.getElementById('coords');
const address = document.getElementById('address');
const comment = document.getElementById('comment');
const recordId = localStorage.recordId;
const recordType = localStorage.recordType;
const token = sessionStorage.token;
// console.log(token);
// console.log('id:', recordId);
// console.log('type:', recordType);
// console.log('location:', localStorage.recordLocation);
// console.log('comment:', localStorage.recordComment);
// console.log('Images:', localStorage.recordImages);
// console.log('Videos:', localStorage.recordVideos);

let recordAddress = '';

{// HANDLING GEOLOCATION
    // let btn = document.getElementById('btn-get-current-location');
    let coords = document.getElementById('coords');
    function initMap() {
        let map = new google.maps.Map(document.getElementById('map'), {
            zoom: 8,
            center: { lat: 6.465422, lng: 3.406448 }
        });
        let geocoder = new google.maps.Geocoder();
        let infowindow = new google.maps.InfoWindow();

        document.getElementById('address').addEventListener('change', function () {
            geocodeAddress(geocoder, map, infowindow);
        });
        btnChangeLocation.addEventListener('click', function () {
            geocodeLatLng(geocoder, map, infowindow);
        });
    }

    function geocodeAddress(geocoder, resultsMap, infowindow) {
        let address = document.getElementById('address').value;
        geocoder.geocode({ 'address': address }, function (results, status) {
            if (status === 'OK') {
                coords.value = `${results[0].geometry.location.lat()}, ${results[0].geometry.location.lng()}`;
                resultsMap.setCenter(results[0].geometry.location);
                // console.log(coords.value);
                let marker = new google.maps.Marker({
                    map: resultsMap,
                    position: results[0].geometry.location
                });
                infowindow.setContent(results[0].formatted_address);
                recordAddress = results[0].formatted_address;
                console.log('recordAddress', recordAddress);
                console.log('typeof of recordAddress', typeof recordAddress);
                infowindow.open(map, marker);
            } else {
                alert('The address you entered is unknown: ' + status);
            }
        });
    }

    function geocodeLatLng(geocoder, resultsMap, infowindow) {
        let input = coords.value;
        console.log('input', input);
        let latlngStr = input.split(',', 2);
        console.log('latlngStr', latlngStr);
        let latlng = {lat: parseFloat(latlngStr[0]), lng: parseFloat(latlngStr[1])};
        console.log(latlng);
        geocoder.geocode({'location': latlng}, function(results, status) {
            if (status === 'OK') {
                // coords.value = `${results[0].geometry.location.lat()}, ${results[0].geometry.location.lng()}`;
                resultsMap.setCenter(results[0].geometry.location);
                // console.log(coords.value);
                let marker = new google.maps.Marker({
                    map: resultsMap,
                    position: results[0].geometry.location
                });
                infowindow.setContent(results[0].formatted_address);
                recordAddress = results[0].formatted_address;
                address.value = recordAddress;
                // console.log('recordAddress', recordAddress);
                // console.log('typeof of recordAddress', typeof recordAddress);
                infowindow.open(map, marker);
            } else {
                alert('The address you entered is unknown: ' + status);
            }
        });

    }

    // const x = document.getElementById("demo");
    function getLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(showPosition);
        } else {
            alert("Geolocation is not supported by this browser.");
        }
    }

    function showPosition(position) {
        coords.value = `${position.coords.latitude}, ${position.coords.longitude}`;
        // console.log(position.coords);
    }

    // Use this to allow the user generate the coordinates of the current location
    // btn.addEventListener('click', function () {
    //     getLocation();
    // });
}

{// POPULATE THE FIELDS WITH THE RECORD DETAILS WITH SOME ANIMATIONS
    coords.value = localStorage.recordLocation;
    comment.value = localStorage.recordComment;

    // display address field when user clicks on 'chage location'
    btnChangeLocation.addEventListener('click', (event) => {
        event.preventDefault();
        addressContainer.style.display = 'block';
        addressContainer.style.animation = 'moveInFromTop 1.5s ease';
        coordsContainer.style.animation = 'moveInLeft .5s ease';
    });

    // show the 'save changes' button when the user changes the address
    address.addEventListener('input', () => {
        btnSaveLocation.style.display = 'block';
        btnSaveLocation.style.animation = 'moveInLeft 1s ease';
    });
}

{// PATCH LOCATION
    btnSaveLocation.addEventListener('click', (event) => {
        event.preventDefault();

        const uri = `${root}/${recordType}s/${recordId}/location`; // notice to the addition of 's' to make interventions and red-flags
        // console.log(uri);

        let formdata = new FormData();
        formdata.append('location', coords.value);

        const myHeaders = new Headers();
        // myHeaders.append('Content-Type', 'application/json'); // This results in error during fetch
        myHeaders.append('x-auth-token', token);

        const options = { method: 'PATCH', mode: 'cors', headers: myHeaders, body: formdata, };
        const req = new Request(uri, options);

        patchLocation(req);
    });

    const patchLocation = (req) => {
        fetch(req)
            .then(response => {
                return response.json();
            })
            .then(response => {
                if (response.status === 200) {
                    // sessionStorage.recordId = response.data[0].id;
                    showDialogMsg(2, 'Saved', response.data[0].message, 'center');
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
    };
}
