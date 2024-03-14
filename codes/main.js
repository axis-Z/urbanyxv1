       
       mapboxgl.accessToken = "pk.eyJ1Ijoiam9yam9uZTkwIiwiYSI6ImNrZ3R6M2FvdTBwbmwycXBibGRqM2w2enYifQ.BxjvFSGqefuC9yFCrXC-nQ";
       var map = new mapboxgl.Map({
            container: "map",
            style: "mapbox://styles/jorjone90/cltetry3r00r301nw54sh4jal",
            center: [44.812, 41.741787],
            zoom: 12,
            //bearing: -36.26,
            //pitch: 72.29,
            attributionControl: false,
        });

        // Add zoom and rotation controls to the map.
        //map.addControl(new mapboxgl.NavigationControl());

        // Add a scale control to the map
        map.addControl(new mapboxgl.ScaleControl());

        var marker;
        map.on("click", function (e) {
    
            // Get the clicked coordinates
            var lngLat = e.lngLat;

            // Remove existing marker if any
            if (marker) {
                marker.remove();
            }
    
            // Add marker at clicked location with custom color
            marker = new mapboxgl.Marker({
                color: "#fb8072" // Specify the color in hexadecimal format
            }).setLngLat(lngLat).addTo(map);

            // Call function to generate isochrone
            generateIsochrone(lngLat);
        });

        function generateIsochrone(lngLat) {
    
            // Access the selected travel mode
            var profile = document.querySelector('input[name="profile"]:checked').value;

            // Access the selected time
            var contours_minutes = document.getElementById("contours_minutes").value;

            // Make API call to Mapbox Isochrone API with selected profile and time
            var url =
            "https://api.mapbox.com/isochrone/v1/mapbox/" +
            profile +
            "/" +
            lngLat.lng +
            "," +
            lngLat.lat +
            "?contours_minutes=" +
            contours_minutes +
            "&polygons=true&denoise=0.1&generalize=10&access_token=" +
            mapboxgl.accessToken;    
            
            fetch(url)
            .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            // Draw the isochrone on the map
            map.getSource("isochrone").setData(data);

            // After setting the isochrone data on the map
            map.getSource("isochrone").setData(data);

            // Get the bounding box of the isochrone
            var bbox = turf.bbox(data);

            // Fit the map view to the bounding box of the isochrone
            map.fitBounds(bbox, {
                bearing: -35,
                pitch: 52,
                padding: {
                    top: 50, 
                    right: 50, 
                    bottom: 50, 
                    left: 50
                }
            }); // Adjust padding as needed

            // Mapping between data source values and display names
            var dataSourceDisplayNames = {
                "pois-leisure": " leisure spots",
                "pois-health": " healthcare centers",
                "pois-bank": " bank offices",
                "pois-atm": " ATMs",
                "pois-pharmacy": " pharmacies",
                "pois-payment": " payment kiosks"
            };

            // Fetch point features from selected data source
            var selectedDataSource = document.getElementById("data_source").value;
            var dataUrl;
            if (selectedDataSource === "pois-leisure") {
                dataUrl = "https://raw.githubusercontent.com/axis-Z/urbanyxv1/main/data/pois-eatout.geojson";
            } else if (selectedDataSource === "pois-health") {
                dataUrl = "https://raw.githubusercontent.com/axis-Z/urbanyxv1/main/data/pois-health.geojson";
            } else if (selectedDataSource === "pois-bank") {
                dataUrl = "https://raw.githubusercontent.com/axis-Z/urbanyxv1/main/data/pois-financial.geojson";
            } else if (selectedDataSource === "pois-atm") {
                dataUrl = "https://raw.githubusercontent.com/axis-Z/urbanyxv1/main/data/pois-financial.geojson";
            } else if (selectedDataSource === "pois-pharmacy") {
                dataUrl = "https://raw.githubusercontent.com/axis-Z/urbanyxv1/main/data/pois-financial.geojson";
            }


            if (dataUrl) {
                fetch(dataUrl)
                .then(function (response) {
                    return response.json();
                })
                .then(function (pointsData) {
            
                    // Filter out points that fall outside the isochrone boundary
                    var pointsWithinIsochrone = {
                        type: "FeatureCollection",
                        features: pointsData.features.filter(function (point) {
                            return turf.booleanPointInPolygon(
                            turf.point(point.geometry.coordinates),
                            data.features[0]
                            );
                        }),
                    };

            // Remove existing data for points outside the isochrone
            map.getSource("featuresWithinIsochrone").setData(pointsWithinIsochrone);

            // Count points by category
            var counts = {};
            pointsWithinIsochrone.features.forEach(function (feature) {
                var category = feature.properties.amenity;
                if (!counts[category]) {
                    counts[category] = 0;
                }
                counts[category]++;
            });

            // Calculate total point count
            var totalCount = pointsWithinIsochrone.features.length;

            // Look up the display name based on the selected data source value
            var selectedDataSourceDisplayName = dataSourceDisplayNames[selectedDataSource];

            // Update legend title based on selected data source
            var legendTitle = document.getElementById("legend-title");
            legendTitle.innerHTML = "<p>There are a total of " + "<strong> <span class='innerhtml' style='color: yellow; background-color: black'>" + totalCount + "</strong></span>" + (selectedDataSourceDisplayName || selectedDataSource.toUpperCase()) + " within " + "<strong> <span class='innerhtml' style='color: yellow; background-color: black'>" + contours_minutes + " minutes " + profile + "</span></strong> distance</p>";

            // Clear the legend before updating it with new items
            var legend = document.getElementById("legend");
            legend.innerHTML="";
            
            // Define colors for each category

            var categoryColors = {
                bar: "#c51b7d", // Color for bar
                cafe: "#fdbf6f", // Color for cafe
                restaurant: "#80cdc1", // Color for restaurant
                clinic: "#a6cee3", // Color for clinic
                dentist: "#cab2d6", // Color for dentist
                hospital: "#fb9a99", // Color for hospital
                pharmacy: "#fdbf6f", // Color for pharmacy
                veterinary: "#b2df8a", // Color for veterinary
                atm: "#ffff99", // Color for atm
                payment_terminal: "#ff7f00", // Color for payment_terminal
                bank: "#33a02c", // Color for bank
            };

            // Iterate over each category and update legend
            for (var category in counts) {
                if (counts.hasOwnProperty(category)) {
                    // Create a color circle for the category
                    var colorCircle = document.createElement("span");
                    colorCircle.className = "legend-circle";
                    colorCircle.style.backgroundColor = categoryColors[category] || "#000"; // Default color

                    // Create a legend item for the category
                    var legendItem = document.createElement("p");
                    legendItem.innerHTML =
                        colorCircle.outerHTML +
                        "<strong>" +
                        category.replace("_", " ") +
                        ":</strong> " +
                        counts[category];

                    // Append legend item to the legend
                    legend.appendChild(legendItem);
                }
            }

            // Add total point count to the legend
            //legend.innerHTML += "<p><strong>Total:</strong> " + totalCount + "</p>";

            // Show the legend after calculations
            legend.style.display = "block";
        })

        .catch(function (error) {
            console.log("Error fetching data from selected data source:", error);
        });

    }
           
})             
            
.catch(function (error) {              
    console.log("Error fetching isochrone data:", error);
});          
}

map.on("load", function () {

    // Add a source and layer for the isochrone   
    map.addSource("isochrone", {
        type: "geojson",
        data: {       
            type: "FeatureCollection",     
            features: [],
        },     
    });
        
    map.addLayer({        
        id: "isochrone-layer",
        type: "fill",                
        source: "isochrone",
        layout: {},
        paint: {        
            "fill-color": "#f768a1",
            "fill-opacity": 0.5,
        },        
    });
            
    // Add source and layer for features within isochrone
    map.addSource("featuresWithinIsochrone", {
        type: "geojson",
        data: {
            type: "FeatureCollection",
            features: [],
        },        
    });
            
    map.addLayer({
        id: "featuresWithinIsochrone-layer",
        type: "circle",                
        source: "featuresWithinIsochrone",                
        paint: {
            "circle-radius": 3,        
            "circle-opacity": 1,        
            "circle-color": [            
            "match",
            ["get", "amenity"], // Property to base the color on            
            "bar", 
            "#c51b7d", // Color for bars            
            "cafe",                   
            "#fdbf6f", // Color for cafes                   
            "restaurant",                   
            "#80cdc1", // Color for restaurants
            "clinic",                   
            "#a6cee3", // Color for clinics        
            "dentist",
            "#cab2d6", // Color for dentist            
            "hospital",            
            "#fb9a99", // Color for hospitals
            "pharmacy",            
            "#fdbf6f", // Color for pharmacieს            
            "veterinary",            
            "#b2df8a", // Color for veterinaries
            "atm",         
            "#ffff99", // Color for ATMs
            "payment_terminal",                     
            "#ff7f00", // Color for payment terminals
            "bank",
            "#33a02c", // Color for banks 
            "#000000", // Default color
        ],
    },
}); 
});

document.addEventListener("DOMContentLoaded", function () {

    // Add event listeners to radio buttons for travel modes
    var travelModeRadios = document.querySelectorAll('input[name="profile"]');
    travelModeRadios.forEach(function (radio) {
        radio.addEventListener("change", function () {
    
            // Get the clicked coordinates                
            var lngLat = marker ? marker.getLngLat() : map.getCenter();
            
            // Remove the class from previously selected button
            document.querySelectorAll('.toggle').forEach(function (button) {
                button.classList.remove('selected');            
            });

            // Add class to the selected button            
            this.nextElementSibling.classList.add('selected');

            // Call function to generate isochrone
            generateIsochrone(lngLat);
        });
    });
        
        // Add event listener to select dropdown for travel time 
        var travelTimeSelect = document.getElementById("contours_minutes");
        travelTimeSelect.addEventListener("change", function () {
            
            // Get the clicked coordinates    
            var lngLat = marker ? marker.getLngLat() : map.getCenter();

            // Call function to generate isochrone
            generateIsochrone(lngLat);
        });

        // Add event listener to select dropdown for data source
        var dataSourceSelect = document.getElementById("data_source");
        dataSourceSelect.addEventListener("change", function () {
    
            // Get the clicked coordinates
            var lngLat = marker ? marker.getLngLat() : map.getCenter();

            // Call function to generate isochrone
            generateIsochrone(lngLat);
        });
    });