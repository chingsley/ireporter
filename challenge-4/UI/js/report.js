const address = document.getElementById('address');
const token = sessionStorage.token;

let msg = 'dialog message';
let geocoder;
let infowindow;
let map;

{// HANDLING GEOLOCATION
    let btnGetCurrentLocation = document.getElementById('btn-get-current-location');
    let coords = document.getElementById('coords');

    function initMap() {
         map = new google.maps.Map(document.getElementById('map'), {
            zoom: 8,
            center: { lat: 6.465422, lng: 3.406448 }
        });
        geocoder = new google.maps.Geocoder();
        infowindow = new google.maps.InfoWindow();

        document.getElementById('address').addEventListener('change', function () {
            startLoader();
            geocodeAddress(geocoder, map, infowindow);
        });
    }

    function geocodeAddress(geocoder, resultsMap, infowindow) {
        try {
            geocoder.geocode({ 'address': address.value }, function (results, status) {
                if (status === 'OK') {
                    coords.value = `${results[0].geometry.location.lat()}, ${results[0].geometry.location.lng()}`;
                    resultsMap.setCenter(results[0].geometry.location);
                    let marker = new google.maps.Marker({
                        map: resultsMap,
                        position: results[0].geometry.location
                    });
                    infowindow.setContent(results[0].formatted_address);
                    infowindow.open(map, marker);
                    stopLoader();
                } else {
                    stopLoader();
                    if (status === 'ERROR') {
                        msg = `${status}<br>
                            Theres was a problem with geolocation.
                            <br>Please check your internet connection and <strong>try again</strong> `;
                        showDialogMsg(0, 'Geolocation Error', msg, 'center');
                    } else {
                        // msg = 'The address you entered is unknown: ' + status;
                        msg = `${status}<br> Unknown address. Please enter a valid address.`;
                        showDialogMsg(0, 'Geolocation Error', msg, 'center');
                    }
                    // msg = `Please enter a valid address.`
                    // showDialogMsg(0, 'Geolocation Error', msg, 'center');
                    // alert('The address you entered is unknown: ' + status);
                }
            });
        } catch(err) {
            stopLoader();
            handleGeolocationNetworkError();
        };
        
    }

    function showError(error) {
        switch (error.code) {
            case error.PERMISSION_DENIED:
                stopLoader();
                msg = "User denied the request for Geolocation.";
                showDialogMsg(0, 'Geolocation Error', msg, 'center');
                break;
            case error.POSITION_UNAVAILABLE:
                stopLoader();
                msg = `Location information is unavailable. Ensure your are connected to the internet, 
                        then <strong>try again</strong>`;
                showDialogMsg(0, 'Geolocation Error', msg, 'center');
                break;
            case error.TIMEOUT:
                stopLoader();
                msg = "The request to get user location timed out.";
                showDialogMsg(0, 'Geolocation Error', msg, 'center');
                break;
            case error.UNKNOWN_ERROR:
                stopLoader();
                msg = "An unknown error occurred while trying to locate the your address on google map";
                showDialogMsg(0, 'Geolocation Error', msg, 'center');
                break;
        }
    }


    function geocodeLatLng(geocoder, resultsMap, infowindow) {
        let input = coords.value;
        let latlngStr = input.split(',', 2);
        let latlng = { lat: parseFloat(latlngStr[0]), lng: parseFloat(latlngStr[1]) };
        try {
            geocoder.geocode({ 'location': latlng }, function (results, status) {
                if (status === 'OK') {
                    resultsMap.setCenter(results[0].geometry.location);
                    let marker = new google.maps.Marker({
                        map: resultsMap,
                        position: results[0].geometry.location
                    });
                    infowindow.setContent(results[0].formatted_address);
                    address.value = results[0].formatted_address;
                    // address.value = recordAddress;
                    infowindow.open(map, marker);
                    stopLoader();
                } else {
                    stopLoader();
                    handleGeolocationNetworkError();
                    // alert('The address you entered is unknown: ' + status);
                }
            });
        } catch (err) {
            console.log(err);
            stopLoader();
            handleGeolocationNetworkError();
        };
    }

    function getLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(showPosition, showError);
        } else {
            msg = "Geolocation is not supported by this browser.";
            showDialogMsg(0, 'Geolocation Error', msg, 'center');
            // alert("Geolocation is not supported by this browser.");
        }
    }

    async function showPosition(position) {
        coords.value = await `${position.coords.latitude}, ${position.coords.longitude}`;
        geocodeLatLng(geocoder, map, infowindow);
        return true;
    }

    btnGetCurrentLocation.addEventListener('click',  async (event) => {
        event.preventDefault();

        startLoader();
        const res = await getLocation();
        console.log(res);
    });
}

{// HANDLING FETCH TO POST A NEW RECORD
    const comment = document.getElementById('comment');
    const formRadio = document.getElementsByClassName('form-radio-input');
    console.log(formRadio);
    const images = document.getElementById('pic');
    const location = document.getElementById('coords');
    const MEDIA_MAX_COUNT = 3;
    const reportForm = document.getElementById('report-form');
    const sendBtn = document.getElementById('btn-send-report');
    const videos = document.getElementById('video');

    sendBtn.addEventListener('click', (event) => {
        event.preventDefault();

        const requiredFields = [
            reportForm.type.value, location.value, comment.value
        ];
        const missingFields = requiredFields.map((field, index) => {
            const keys = {
                0: `<strong>type of report:</strong> red-flag or intervention [select one of the radio buttons]`,
                1: `<strong>location:</strong> enter your address and we will get the coordinates`,
                2: `<strong>comment:</strong> tell us more about the case you are reporting`,
            };
            return (field === undefined || field === '') ? `=> ${keys[index]}` : null;
        }).filter(field => field !== null).join('<br />');

        if (reportForm.type.value === '' || location.value === ''|| comment.value === '') {
            msg = `Please provide values for:<br/>${missingFields}`;
            showDialogMsg(0, 'Incomplete Form', msg, 'left');
            return false;
        }

        let fd = new FormData();
        fd.append('location', location.value);
        fd.append('comment', comment.value);

        if(images.files.length > 0) {
            for (let i = 0; i < images.files.length; i++) {
                // fd.append('images', images.files[i], `${sessionStorage.userId}_${images.files[i].name}`);
                // fd.append('images', images.files[i], `${sessionStorage.userId}_${images.files[i]}`);
                fd.append('images', images.files[i]);
            }
        }
        if(videos.files.length > 0) {
            for (let i = 0; i < videos.files.length; i++) {
                // fd.append('videos', videos.files[i], `${sessionStorage.userId}_${videos.files[i]}`);
                fd.append('videos', videos.files[i]);
            }
        }

        const token = sessionStorage.token;
        const myHeaders = new Headers();
        // myHeaders.append('Content-Type', 'application/json'); // This results in error during fetch
        myHeaders.append('x-auth-token', token);

        const uri = `${root}/${reportForm.type.value}`
        const options = { method: 'POST', mode: 'cors', headers: myHeaders, body: fd, };
        const req = new Request(uri, options);

        startLoader();
        createReport(req);
    });

    const createReport = (req) => {
        fetch(req)
            .then(response => {
                return response.json();
            })
            .then(response => {
                stopLoader();
                if (response.status === 201) {
                    sessionStorage.recordId = response.data[0].id;
                    showDialogMsg(2, 'Saved', response.data[0].message, 'center');
                    // reportForm.type.checked = false;
                    formRadio[0].checked = false;
                    formRadio[1].checked = false;
                    location.value = "";
                    address.value = "";
                    comment.value = "";
                    images.value = "";
                    videos.value = "";
                } else {
                    handleResponseError(response);
                }
            })
            .catch(err => {
                stopLoader();
                handleError(err);
            });
    };

    images.addEventListener('change', () => {
        const files = images.files;
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        for (let i = 0; i < files.length; i += 1) {
            if (!allowedTypes.includes(files[i].type)) {
                msg = `"${files[i].name}" of type "${files[i].type}" is not supported
                    </br> Supported formats are ${allowedTypes.join(', ')}`;
                showDialogMsg(0, 'Unsupported Image Format', msg, 'center');

                images.value = ""; // clear the content of the the file input element
                return;
            }
        }

        if (files.length > MEDIA_MAX_COUNT) {
            msg = `Maximum number of image upload is ${MEDIA_MAX_COUNT}`;
            showDialogMsg(0, 'Image Upload Error', msg, 'center');

            imgFileInput.value = "";
            return;
        }
    });

    videos.addEventListener('change', () => {
        const files = videos.files;
        const allowedTypes = ['video/mp4'];
        for (let i = 0; i < files.length; i += 1) {
            if (!allowedTypes.includes(files[i].type)) {
                msg = `"${files[i].name}" of type "${files[i].type}" is not supported
                    </br> Supported formats are ${allowedTypes.join(', ')}`;
                showDialogMsg(0, 'Unsupported Video Format', msg, 'center');
                videos.value = ""; // clear the content of the the file input element
                return;
            } else if (files[i].size > 10000000) {
                msg = `${files[i].name} exceeds the limit of allowed video size <br>
                    MAXIMUM ALLOWED SIZE PER VIDEO IS 10MB`;
                showDialogMsg(0, 'Large Video detected', msg, 'center');
                videos.value = "";
                return;
            }
        }

        if (files.length > MEDIA_MAX_COUNT) {
            msg = `Maximum number of video upload is ${MEDIA_MAX_COUNT}`;
            showDialogMsg(0, 'Video Upload Error', msg, 'center');

            videos.value = "";
            return;
        }
    });
}

