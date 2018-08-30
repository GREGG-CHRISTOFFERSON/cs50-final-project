// Google Map
let map;

// Markers for map
let markers = [];

// Info window
// let info = new google.maps.InfoWindow;

// Open Info window
let prev_infoWindow = false;


// Execute when the DOM is fully loaded
$(document).ready(function() {

    // get location
    getLocation();


});

// set maps center
let center;

// track winners
let winners = [];


// Get users position
function getLocation()
{
    var options = {
      enableHighAccuracy: true,
      maximumAge: 0
    };

    let lat;
    let long;
    let location;



    // post location to server
    function post(location) {
        console.log(location);
        $.ajax("/location", {
            data: location,
            contentType : 'application/json',
            type: 'POST'
        });
    }



    // user allowed geolocation
    function success(pos) {
      var crd = pos.coords;

      lat = crd.latitude.toFixed(4);
      long = crd.longitude.toFixed(4);

      console.log('Your current position is:');
      console.log(`Latitude : ${crd.latitude}`);
      console.log(`Longitude: ${crd.longitude}`);
      console.log(`More or less ${crd.accuracy} meters.`);
      location = { "latitude": lat, "longitude": long };
      location = JSON.stringify(location);
      post(location);
    }



    // user denied geolocation
    function error(err) {
      console.warn(`ERROR(${err.code}): ${err.message}`);
      console.log("Using IP Address for approximate location")
    }


    /**
     * Returns an array with arrays of the given size.
     *
     * @param myArray {Array} array to split
     * @param chunk_size {Integer} Size of every group
     *
     * https://ourcodeworld.com/articles/read/278/how-to-split-an-array-into-chunks-of-the-same-size-easily-in-javascript
     */
    function chunkArray(myArray, chunk_size){
        var index = 0;
        var arrayLength = myArray.length;
        var tempArray = [];

        for (index = 0; index < arrayLength; index += chunk_size) {
            myChunk = myArray.slice(index, index+chunk_size);
            // Do something if you want with the group
            tempArray.push(myChunk);
        }

        return tempArray;
    }



    // merge two arrays and remove duplicates
    // https://stackoverflow.com/questions/1584370/how-to-merge-two-arrays-in-javascript-and-de-duplicate-items
    function arrayUnique(array) {
        var a = array.concat();
        for(var i=0; i<a.length; ++i) {
            for(var j=i+1; j<a.length; ++j) {
                if(a[i] === a[j])
                    a.splice(j--, 1);
            }
        }

        return a;
    }



    let lenDetails;
    let businessDetails;
    let photosArray = [];

    function buildPhotoObjArray(businessPhotos, businessName) {
        let lenPhotos = businessPhotos.length;

        // add each photo and business name to it's own object
        for (let j = 0; j < lenPhotos; j++) {
            let photo = businessPhotos[j].toString().replace(/[\[\]' ]/g, "");

            let photoObj = {
                name: businessName,
                nameStripped: businessName.replace(/[" ",';:&*^$!@#()]/g, ""),
                photo: photo,
            }

            // push object to array
            photosArray.push(photoObj);

        }
    }



    // clear page and reconstruct slides using winners array
    function rebuildPage(array) {

        // empty winners array
        winners = [];

        // clear page
        $("div.carousel-inner1").html("");
        $("div.carousel-inner2").html("");

        // reconstruct page
        // build the slides
        function buildSlides(splitArray, length, groupNumString) {
            for (let k = 0; k < length; k++) {
                $("div.carousel-inner" + groupNumString).append(
                    '<div class="carousel-item">' +
                      '<img id="' + splitArray[k].nameStripped + k.toString() + '" class="d-block w-100" src="' + splitArray[k].photo.toString().replace(/[\[\]' ]/g, "") + '">' +
                    '</div>'
                    );

                // add click listener
                $("#" + splitArray[k].nameStripped + k).click(function() {
                    for (let i = 0; i < lenDetails; i++) {

                        // track which image the user clicked on
                        if (businessDetails[i].name == splitArray[k].name) {
                            businessDetails[i].wins++;
                            console.log(businessDetails[i].name + " has " + businessDetails[i].wins);

                            // track number of views of this slide
                            resultViews++;

                            // push winner to winners array
                            winners.push(splitArray[k]);
                        }
                    }

                    y = resultViews;

                    // if all slides have been viewed and winners length is > 1, repeat the above html building, using winners array
                    if (y == x && winners.length > 1) {
                        // call function passing winners array.
                        rebuildPage(winners);
                    }

                    // otherwise, if all slides have been viewed and winners length is 0, set all views to 0 and advance to next slide
                    else if (y == x && winners.length == 0) {
                        resultViews = 0;
                        $(".carousel-control-next").click();
                    }

                    // otherwise, if length doesn't equal 1 advance to next slide.
                    else if (winners.length != 1) {
                        $(".carousel-control-next").click();
                    }

                    // otherwise post winner and redirect to map in back end
                    else if (winners.length == 1 && y == x) {
                        businessDetails.sort(function(a,b) {
                            return parseFloat(b.wins) - parseFloat(a.wins);
                        });

                        // check if we have a tie
                        let index = 0;
                        while (businessDetails[index].wins != null && businessDetails[index + 1].wins != null &&
                               businessDetails[index].wins == businessDetails[index + 1].wins) {
                            console.log("We have a tie!");
                            console.log(businessDetails[index].name + ": " + businessDetails[index].wins);
                            console.log(businessDetails[index + 1].name + ": " + businessDetails[index + 1].wins);

                            // build photoArrayObj for each business and add to array
                            let businessPhotos = businessDetails[index].photos.split(",");
                            buildPhotoObjArray(businessPhotos, businessDetails[index].name);
                            businessPhotos = businessDetails[index + 1].photos.split(",");
                            buildPhotoObjArray(businessPhotos, businessDetails[index + 1].name);

                            index++;
                        }

                        console.log(photosArray);

                        // if we have a tie, repeat html building using tied array
                        if (photosArray.length != 0) {

                            rebuildPage(photosArray);
                        }

                        // otherwise we must have a winner
                        // post winner
                        else {
                            alert("We have a winner!  " + businessDetails[0].name + "\n" +
                                  "views: " + y + "\n" +
                                  "length: " + x + "\n" +
                                  "winners length: " + winners.length);
                        }
                    }

                    else {
                        $(".carousel-control-next").click();
                    }
                });
            }
            console.log("SUCCESS!");
        }

        // Split the array into 2 groups
        let result = chunkArray(array, array.length/2);

        let lenResults0 = result[0].length;
        let lenResults1 = result[1].length;

        let resultViews = 0;

        let x = Math.round((lenResults0 + lenResults1) / 2);
        let y;

        // build the html for 1st slider on index page
        buildSlides(result[0], lenResults0, "1");

        // empty photosArray
        photosArray = [];

        // build the html for the 2nd slider on index page
        buildSlides(result[1], lenResults1, "2");

        // activate slides
        $(".carousel-item:first-child").addClass("active");

        // add click listener to skip button
        $("button").click(function() {

            // track slide views
            resultViews++;

            // advance to next slide
            $(".carousel-control-next").click();
        });
    }



    // load businesses from users location
    $.getJSON("https://api.ipify.org/?format=json", function(e) {
        let ip = e.ip;
        $.getJSON('https://json.geoiplookup.io/' + ip, function(data) {
            lat = data.latitude;
            long = data.longitude;
            console.log('Your current position is approximately:');
            console.log(`Latitude : ${lat}`);
            console.log(`Longitude: ${long}`);
            location = { "latitude": lat, "longitude": long };
            center = {lat: Number(`${lat}`), lng: Number(`${long}`)};

            // post location
            location = JSON.stringify(location);
            post(location);

            // empty photosArray
            photosArray = [];

            // get location businesses
            $.getJSON("/businesses?location=" + location, function(data) {
            businessDetails = data;
            lenDetails = businessDetails.length;

            for (let i = 0; i < lenDetails; i++) {

                // keep track of user clicks to on business photos
                businessDetails[i].wins = 0;

                let name = businessDetails[i].name;
                name = name.replace(/[" ",';:&*^$!@#()]/g, "");

                // get the business photos
                let photos = businessDetails[i].photos.split(",");

                // build photo object array
                buildPhotoObjArray(photos, businessDetails[i].name);

            }

            // build html page from photosArray
            rebuildPage(photosArray);

            });
        });
    });

    // deactivate auto slide
    $('.carousel').carousel({
        interval: false
    });

    // promt user to allow for geolocation
    navigator.geolocation.getCurrentPosition(success, error, options);
}