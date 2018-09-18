// remember center latitude & longitude for map
let centerLat;
let centerLong;

// remember winning businesses details
let winnerCategory;
let winnerName;
let winnerPhone;
let winnerPrice;
let winnerRating;
let winnerReviewCount;
let winnerUrl;



// Execute when the DOM is fully loaded
$(document).ready(function() {

    // load the page
    loadPage();

});


// track winners
let winners = [];



// load map and markers
function loadMap(lat, long) {

    // replace html with map
    // clear page, fade to
    $("body").html("");

    $("body").append('<div id="mapid"></div>');

    // data for the pop up
    let winnerDetails = "<b>Category: </b>" + winnerCategory.toString() + "<br>" +
                        "<b>Name: </b>" + winnerName + "<br>" +
                        "<b>Phone: </b>" + winnerPhone + "<br>" +
                        "<b>Price: </b>" + winnerPrice + "<br>" +
                        "<b>Rating: </b>" + winnerRating + "<br>" +
                        "<b>Review Count: </b>" + winnerReviewCount + "<br>" +
                        "<b><a href='" + winnerUrl + "' target='_blank'>View Business on Yelp</a>";


    // initialize map and set it's center view
    // documentation at https://leafletjs.com/examples/quick-start/
    // check if we are on the right page
    if ($("#mapid").length) {
        let mymap = L.map('mapid').setView([lat, long], 15);

        // add tile layer to map
        //https://www.mapbox.com/
        L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
            attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
            maxZoom: 18,
            id: 'mapbox.streets',
            accessToken: 'pk.eyJ1IjoiZ2NocmlzdG8yNyIsImEiOiJjamx6dDhrbGcwaHYyM3ZwYXBraWx4aGd4In0.FvDvvPy5xE59eni6x_xJ5Q'
        }).addTo(mymap);

        // add marker
        let marker = L.marker([lat, long]).addTo(mymap);

        // add popup
        marker.bindPopup(winnerDetails).openPopup();

    }
}



// check for odd numbers
function isOdd(num) {
    return num % 2;
}



// Get users position
function loadPage()
{

    // declare loadPage function scope variables
    let lat; // latitude
    let long; // longitude
    let location; // location we are getting businesses data from
    let lenDetails; // length of businesses data
    let businessDetails; // businesses data
    let photosArray = []; // array of objects used to build slides
    let imageSelector = 1; // track selector of current image so we can check it
    let tie = false; // track whether we have a tie
    let tieCount = 0; // track how many times we have tied in a row
    let x; // length of array used to build slides
    let y = 0; // equal to number of views or clicks
    let winnersLength = 0; // size of new array used to build next round of slides



    // post to server
    function post(url, data) {
        $.ajax(url, {
            data: data,
            contentType : 'application/json',
            type: 'POST'
        });
    }


// update progress bar
let percentageLeft = 100; // how far we have to go
let totalClicks; // total clicks to get to 100 percent progress
let clicks = 0; // current number of clicks
let endPercentage = 0; // how far to go after current round of slides is done
let rounds = 0; // number of times we've reloaded the slides
let lastWidth = 0; // keep track of width from last round
let width = 0;



function updateProgress(clicks, totalClicks, percentageLeft) {

    // remember the last width
    lastWidth = width;

    // set new width
    width = Math.round(((clicks / totalClicks) * percentageLeft), 2);
    if (rounds > 1 && width + endPercentage <= 99) {
        width = width + endPercentage;
    }
    else if (rounds > 1) {
        width = lastWidth;
    }

    lastWidth = lastWidth;


    // animate the new width
    move(lastWidth, width);
    function move(oldWidth, newWidth) {
        var elem = $(".progress-bar");
        var width = oldWidth;
        var id = setInterval(frame, 100);
        function frame() {
            if (width >= newWidth) {
                clearInterval(id);
            }
            else {
                width++;
                elem.attr("style", "width:" + width + "%");
                elem.html(width * 1 + "%");
            }
        }
    }
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



    // create an object for every photo
    function buildPhotoObjArray(businessPhotos, businessName) {
        let lenPhotos = businessPhotos.length;

        // add each photo and business name to it's own object
        for (let j = 0; j < lenPhotos; j++) {
            let photo = businessPhotos[j].toString().replace(/[\[\]' ]/g, "");

            let photoObj = {
                name: businessName,
                photo: photo,
            };

            // push object to array
            photosArray.push(photoObj);

        }
    }



    // check conditions for rebuilding slides
    function checkRebuildConditions(imageSelector) {

        winnersLength = winners.length;

        // if all slides have been viewed and winners length is > 1, repeat the above html building, using winners array
        if (y == x && winnersLength > 1) {

            // call function passing winners array.
            rebuildPage(winners);
        }

        // otherwise, if all slides have been viewed and winners length is 0 user didn't choose any images. Start over
        else if (y == x && winnersLength == 0) {
            imageSelector = 1;
            rebuildPage(photosArray);
        }

        // otherwise check for tie or post winner
        else if (winnersLength == 1 && x == y) {
            // sort businessDetails by number of wins
            businessDetails.sort(function(a,b) {
                return parseFloat(b.wins) - parseFloat(a.wins);
            });

            // check if we have a tie
            let index = 0;
            let tied = new Set();
            photosArray = [];

            // while two businesses have same number of wins, add businesses to tied set
            while (businessDetails[index].wins != null && businessDetails[index + 1].wins != null &&
                   businessDetails[index].wins == businessDetails[index + 1].wins) {
                tie = true;
                tied.add(businessDetails[index]);
                tied.add(businessDetails[index + 1]);

                // build photoArrayObj for each business and add to array
                let businessPhotos = businessDetails[index].photos.split(",");
                buildPhotoObjArray(businessPhotos, businessDetails[index].name);
                businessPhotos = businessDetails[index + 1].photos.split(",");
                buildPhotoObjArray(businessPhotos, businessDetails[index + 1].name);
                index++;

                // convert tied set to array
                tied = Array.from(tied);

                // if same businesses have tied more than once, post all tied businesses as winners
                if (tie == true && tieCount > 0) {
                    alert("we have a tie!");
                    let winners = JSON.stringify(tied);

                    // for each winner, set latitude and longitude for markers
                    alert("Developer hasn't added support for a tie so this app isn't going to work now.  Sorry!  I thought this would never happen! :-(")

                    // load map
                    loadMap(centerLat, centerLong);
                }
            }

            // track if we have tied more than once
            if (tie == true) {
                tieCount++;
            }

            // if we have a tie, repeat html building using tied array if this is the first time tieing
            if (tied.length != 0 && tie == true) {
                tie = false;
                imageSelector = 1;
                rebuildPage(photosArray);
            }

            // otherwise we must have a winner
            else {

                // update progress to 100%
                $(".progress-bar").attr("style", "width:100%");

                // update the aria-valuenow attribute to 100
                $(".progress-bar").attr("aria-valuenow", "100%");

                // update progress test to 100
                $(".progress-bar").html("100%");

                alert("We have a winner!  " + businessDetails[0].name);
                let winner = [];
                winner.push(businessDetails[0]);
                winner = JSON.stringify(winner);

                // set center latitude and longitude for map view
                let str = JSON.stringify(businessDetails[0].coordinates).split(",");
                let str0 = str[0].split(":");
                let str1 = str[1].split(":");
                str1 = str1[1].split("}");
                centerLat = str0[1];
                centerLong = str1[0];

                // set business details for map popup
                let categories = eval(businessDetails[0].categories);
                winnerCategory = categories[0].title;
                winnerName = businessDetails[0].name;
                winnerPhone = businessDetails[0].phone;
                winnerPrice = businessDetails[0].price;
                winnerRating = businessDetails[0].rating;
                winnerReviewCount = businessDetails[0].review_count;
                winnerUrl = businessDetails[0].url;

                // load map
                setTimeout(function() {
                    loadMap(centerLat, centerLong);
                }, 1000);
            }

            // convert tied array back to set
            tied = new Set();
        }

        else {

            // advance to next slide
            $(".carousel-control-next").click();

            // update progress
            winnersLength = winners.length;
            totalClicks = x + winnersLength;
            clicks++;
            // percentageLeft = percentageLeft - endPercentage;
            updateProgress(clicks, totalClicks, percentageLeft);

            checkImages(imageSelector);

        }
    }



    // check if images are the same and if true advance one slides
    function checkImages(selector) {
        let image1 = $("." + selector + "1").attr("src");
        let image2 = $("." + selector + "2").attr("src");

        if (image1 == image2 && image1 != undefined && image2 != undefined) {

            // advance to next slide
            checkRebuildConditions(selector.toString());
            imageSelector++;
        }
    }



    // clear page and reconstruct slides using winners array
    function rebuildPage(array) {

        // empty winners array
        winners = [];

        rounds++;

        clicks = 0;
        console.log("******************");
        console.log("Percentage Left: " + percentageLeft);
        console.log("End Percentage: " + endPercentage);

        if (percentageLeft - endPercentage >= 0) {
            percentageLeft = percentageLeft - endPercentage;
        }

        console.log("Percentage Left: " + percentageLeft);
        console.log("******************");

        // clear page
        $("div.carousel-inner1").html("");
        $("div.carousel-inner2").html("");



        // build the slides
        function buildSlides(splitArray, length, groupNumString) {

            // save generated ids
            let lastID = [];
            let imageID;



            // generate random unique id
            function generateID() {
                imageID = Math.floor(Math.random()*1000) + 1;
                lastID.push(imageID);
            }


            // iterate over the splitArray and build slides using objects in array
            for (let k = 0; k < length; k++) {

                generateID();

                // ensure we have a unique id
                lastID.sort(function(a,b) {
                    return parseFloat(a.wins) - parseFloat(b.wins);
                });

                while (lastID[0] == lastID[1]) {
                    generateID();
                }

                // inject the html for the slides
                $("div.carousel-inner" + groupNumString).append(
                    '<div class="carousel-item">' +
                      '<img id="' + imageID + '" class="d-block w-100 ' +
                      k.toString() + groupNumString + '" src="' + splitArray[k].photo.toString().replace(/[\[\]' ]/g, "") + '">' + '<p>' + splitArray[k].name + '</p>' +
                    '</div>'
                    );

                // add click listener to images
                $("#" + imageID).click(function() {
                    for (let i = 0; i < lenDetails; i++) {

                        // track which image the user clicked on
                        if (businessDetails[i].name == splitArray[k].name) {
                            businessDetails[i].wins++;

                            // define the selector for the images we will check later
                            imageSelector = k + 1;

                            // track number of views of this slide
                            resultViews++;

                            // push winner to winners array
                            winners.push(splitArray[k]);
                        }
                    }

                    y = resultViews;

                    // check conditions for rebuilding the page
                    checkRebuildConditions(imageSelector.toString());
                    imageSelector++;

                });
            }

            // check for duplicate images first time after rebuilding page with an array of objects
            checkImages(0);
        }

        // Split the array into 2 groups
        let result = chunkArray(array, array.length/2);
        let lenResults0 = result[0].length;
        let lenResults1 = result[1].length;

        // reset views to 0
        let resultViews = 0;
        y = 0;

        // check for odd number of slides
        x = Math.round((lenResults0 + lenResults1) / 2);
        let slideIndex0 = 0;
        let slideIndex1 = 0;
        let res = isOdd(x);


        // while we have an odd number of slides, x doesn't equal one and array length isn't 3
        while (res == 1 && x != 1 || lenResults0 + lenResults1 == 3) {

            // if 1st array is smaller than 2nd array
            if (lenResults0 <= lenResults1) {

                // add another slide to the first array
                result[0].push(result[0][slideIndex0]);
                lenResults0 = result[0].length;
                slideIndex0++;
            }

            // otherwise, if 2nd array is smaller than 1st array
            else if (lenResults1 <= lenResults0) {

                // add another slide to the 2nd array
                result[1].push(result[1][slideIndex1]);
                lenResults1 = result[1].length;
                slideIndex1++;
            }

            // check again for odd number of slides
            x = Math.round((lenResults0 + lenResults1) / 2);
            res = isOdd(x);
            let res2 = isOdd(lenResults0 + lenResults1);
            if (res2 == 1) {
                res = res2;
            }
        }

        // build the html for 1st slider on index page
        buildSlides(result[0], lenResults0, "1");

        // build the html for the 2nd slider on index page
        buildSlides(result[1], lenResults1, "2");

        // activate slides
        $(".carousel-item:first-child").addClass("active");

        // add click listener to skip button
        $("button").unbind("click").click(function() {

            // track slide views
            resultViews++;

            // if result views is <= x, y = resultViews.
            if (resultViews <= x) {
                y = resultViews;
            }

            imageSelector = y;

            // check conditions for rebuilding page
            checkRebuildConditions(imageSelector.toString());
            imageSelector++;
        });
    }



    // load businesses from users location.
    // get location from ip address
    $.getJSON("https://api.ipify.org/?format=json", function(e) {
        let ip = e.ip;
        $.getJSON('https://json.geoiplookup.io/' + ip, function(data) {
            lat = data.latitude;
            long = data.longitude;
            location = { "latitude": lat, "longitude": long };
            location = JSON.stringify(location);

            // set center latitude and longitude for map view incase we have more than one winner
            centerLat = lat;
            centerLong = long;

            // post location
            post("/location", location);


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
}