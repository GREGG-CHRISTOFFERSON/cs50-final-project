// Execute when the DOM is fully loaded
$(document).ready(function() {

    // get map center

    // initialize map and set it's center view
    // documentation at https://leafletjs.com/examples/quick-start/
    var mymap = L.map('mapid').setView([51.505, -0.09], 13);

    // add tile layer to map
    //https://www.mapbox.com/
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.streets',
        accessToken: 'pk.eyJ1IjoiZ2NocmlzdG8yNyIsImEiOiJjamx6dDhrbGcwaHYyM3ZwYXBraWx4aGd4In0.FvDvvPy5xE59eni6x_xJ5Q'
    }).addTo(mymap);

    // add marker
    var marker = L.marker([51.5, -0.09]).addTo(mymap);

    // add popup
    // marker.bindPopup("<b>Hello world!</b><br>I am a popup.").openPopup();

    // var popup = L.popup();

    function onMapClick(e) {
        marker
            // .setLatLng(e.latlng)
            .bindPopup("<b>Hello world!</b><br>I am a popup.")
            .openPopup();
    }

    mymap.on('click', onMapClick);

});


