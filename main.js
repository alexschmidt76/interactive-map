// get location
async function getCoords() {
    const pos = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
    });
    return [pos.coords.latitude, pos.coords.longitude];
}

// map object
const map = {
    coords: [],
    businesses: [],
    map: {},
    markers: L.layerGroup([]),

    // function to build map to be called after location info is grabbed
    buildMap() {
        // initialize map
        this.map = L.map('map', {
            center: this.coords,
            zoom: 11
        });
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            minZoom: '10',
		}).addTo(this.map);

        // make a 'you are here' marker using the red-pin.png icon and user location
        const marker = L.marker(this.coords, 
            {
                icon: L.icon({
                    iconUrl: '../assets/red-pin.png', 
                    iconSize: [38, 38], 
                    iconAnchor: [19, 38], 
                    popupAnchor: [1, -31]
                })
            })
            .addTo(this.map)
            .bindPopup('<p1><b>You are here</b><br></p1>')
            .openPopup();
    },

    // function to add markers to map based on which option is selected
    addMarkers() {
        this.markers.clearLayers(); // get rid of old markers
        this.businesses.forEach(e => {
            let pin = L.marker([e.lat, e.long]).bindPopup(`${e.name}`);
            this.markers.addLayer(pin);
        });
        this.markers.addTo(this.map); // add new markers to map
    }
}

// get foursquare info
async function getFoursquare(business) {
    // get 5 nearby businesses with foursquare
    const options = {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            Authorization: 'fsq3CFSn3nbKRM58raPD555PCvQbzbp4xXDVN9448TdU1R8='
        }
    };
    let limit = 5;
    let lat = map.coords[0];
    let long = map.coords[1];
    let response = await fetch(`https://api.foursquare.com/v3/places/search?&query=${business}&limit=${limit}&ll=${lat}%2C${long}`, options);
    let data = await response.json()
    
    // refactor the data array into usable info for the map markers
    let results = data.results.map(e => {
        let location = {
            name: e.name,
            lat: e.geocodes.main.latitude,
            long: e.geocodes.main.longitude
        };
        return location;
    });

    return results;
}

// build map and set location to user's location when page loads
window.onload = async () => {
	const pos = await getCoords();
	map.coords = pos;
	map.buildMap();
}

// get info from buisness selection and add the map markers
document.getElementById('submit').addEventListener('click', async (e) => {
    e.preventDefault();
    let business = document.getElementById('business').value;
    map.businesses = await getFoursquare(business);
    map.addMarkers();
});
