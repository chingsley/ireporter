const deleteTableRow = () => {
    // event.target is the input button element. 
    // event.target.parentNode is the td cell containing the button
    const td = event.target.parentNode;
    const tr = td.parentNode; // the row to be removed
    const table = tr.parentNode; 
    table.removeChild(tr);
}

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



/******************* FOR THE HAMBURGER MENU ****************/
function myFunction() {
    let x = document.getElementById("nav-div");
    if (x.className === 'nav-div') {
        x.className += " responsive";
    } else {
        x.className = "nav-div";
    }
}
/********************************************************* */
