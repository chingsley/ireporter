// console.log(sessionStorage.recordId);
// console.log(sessionStorage.userId);
let msg = 'dialog message';

{// HANDLING GEOLOCATION
    let btn = document.getElementById('btn-get-current-location');
    let coords = document.getElementById('coords');
    function initMap() {
        let map = new google.maps.Map(document.getElementById('map'), {
            zoom: 8,
            center: { lat: 6.465422, lng: 3.406448 }
        });
        let geocoder = new google.maps.Geocoder();

        document.getElementById('address').addEventListener('change', function () {
            geocodeAddress(geocoder, map);
        });
    }

    function geocodeAddress(geocoder, resultsMap) {
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
        console.log(position.coords);
    }

    btn.addEventListener('click', function () {
        getLocation();
    });
}

{// HANDLING FETCH TO POST A NEW RECORD
    const reportForm = document.getElementById('report-form');
    const location = document.getElementById('coords');
    const comment = document.getElementById('comment');
    const sendBtn = document.getElementById('btn-send-report');
    const images = document.getElementById('pic');
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
                fd.append('images', images.files[i], `${sessionStorage.userId}_${images.files[i].name}`);
            }
        }
        if(videos.files.length > 0) {
            for (let i = 0; i < videos.files.length; i++) {
                fd.append('videos', videos.files[i], `${sessionStorage.userId}_${videos.files[i].name}`);
            }
        }

        const token = sessionStorage.token;
        const myHeaders = new Headers();
        // myHeaders.append('Content-Type', 'application/json'); // This results in error during fetch
        myHeaders.append('x-auth-token', token);

        const uri = `${root}/${reportForm.type.value}`
        const options = { method: 'POST', mode: 'cors', headers: myHeaders, body: fd, };
        const req = new Request(uri, options);

        createReport(req);
    });

    const createReport = (req) => {
        fetch(req)
            .then(response => {
                // console.log('line 134 report.js', response);
                return response.json();
            })
            .then(response => {
                // console.log('line 138 report.js, response = ', response);
                if (response.status === 201) {
                    sessionStorage.recordId = response.data[0].id;
                    showDialogMsg(2, 'Saved', response.data[0].message, 'center');
                } else {
                    // throw new Error(JSON.stringify(response.error));
                    handleResponseError(response);
                }
            })
            .catch(err => {
                handleError(err);
            });
    };

}

