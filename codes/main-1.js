mapboxgl.accessToken = "pk.eyJ1Ijoiam9yam9uZTkwIiwiYSI6ImNrZ3R6M2FvdTBwbmwycXBibGRqM2w2enYifQ.BxjvFSGqefuC9yFCrXC-nQ";
var map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/jorjone90/cltetry3r00r301nw54sh4jal",
    center: [44.812, 41.741787],
    zoom: 12,
    attributionControl: false,
    preserveDrawingBuffer: true,
});

// Add zoom and rotation controls to the map.
map.addControl(new mapboxgl.NavigationControl());

// Add a scale control to the map
map.addControl(new mapboxgl.ScaleControl());

// Get all fly buttons
const flyButtons = document.querySelectorAll('.fly-button');

// Add click event listener to each button
flyButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Remove 'selected' class from all buttons
        flyButtons.forEach(btn => btn.classList.remove('selected'));
        // Add 'selected' class to the clicked button
        button.classList.add('selected');
    });
});

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

// Function to calculate collision area between isochrone and zoning layer
function calculateCollisionArea(zoningData, isochrone) {
    var collisionArea = 0;

    zoningData.features.forEach(function (feature) {
        var intersection = turf.intersect(feature, isochrone);
        if (intersection) {
            collisionArea += turf.area(intersection);
        }
    });

    return collisionArea;
}

// Function to update legend with collision area
function updateLegend(collisionArea) {
    var legend = document.getElementById("sidebar-content");
    legend.innerHTML = "<p>Collision Area: " + collisionArea.toFixed(2) + " square meters</p>";
}

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

        // Get the bounding box of the isochrone
        var bbox = turf.bbox(data);

        // Fit the map view to the bounding box of the isochrone
        map.fitBounds(bbox, {
            padding: {
                top: 90, 
                right: 30, 
                bottom: 30, 
                left: 90
            }
        });

        // Fetch zoning layer data
        fetch("https://raw.githubusercontent.com/axis-Z/urbanyxv1/main/data/zoning-tbilisi.geojson")
            .then(function (response) {
                return response.json();
            })
            .then(function (zoningData) {
                // Calculate collision area
                var collisionArea = calculateCollisionArea(zoningData, data);

                // Update legend with collision area
                updateLegend(collisionArea);
            })

            // Clear the legend before updating it with new items
    var legend = document.getElementById("legend");
    legend.innerHTML = "";

    // Update legend title
    var legendTitle = document.getElementById("legend-title");
    legendTitle.innerHTML = "<p>Collision Area: " + collisionArea.toFixed(2) + " square meters</p>";

    // Show the legend after calculations
    legend.style.display = "block";
});

// Assume isochroneData and zoningData are GeoJSON objects representing the isochrone and zoning layers respectively

// Perform intersection analysis
var intersection = turf.intersect(isochroneData, zoningData);

// Check if intersection exists
if (intersection) {
    // Calculate collision area
    var collisionArea = turf.area(intersection);
    console.log("Collision Area:", collisionArea.toFixed(2), "square meters");

    // Display or use the collision area as needed
} else {
    console.log("No collision detected.");
}


        // Fetch point features from selected data source
        var selectedDataSource = document.getElementById("data_source").value;
        var dataUrl;
        if (selectedDataSource === "pois-leisure") {
            dataUrl = "https://raw.githubusercontent.com/axis-Z/urbanyxv1/main/data/pois-leisure.geojson";
        } else if (selectedDataSource === "pois-health") {
            dataUrl = "https://raw.githubusercontent.com/axis-Z/urbanyxv1/main/data/pois-health.geojson";
        } else if (selectedDataSource === "pois-pharmacy") {
            dataUrl = "https://raw.githubusercontent.com/axis-Z/urbanyxv1/main/data/pois-pharmacy.geojson";
        } else if (selectedDataSource === "pois-bank") {
            dataUrl = "https://raw.githubusercontent.com/axis-Z/urbanyxv1/main/data/pois-bank.geojson";
        } else if (selectedDataSource === "pois-atm") {
            dataUrl = "https://raw.githubusercontent.com/axis-Z/urbanyxv1/main/data/pois-atm.geojson";
        } else if (selectedDataSource === "pois-payment") {
            dataUrl = "https://raw.githubusercontent.com/axis-Z/urbanyxv1/main/data/pois-payment_terminal.geojson";
        } else if (selectedDataSource === "car-crashes") {
            dataUrl = "https://raw.githubusercontent.com/axis-Z/urbanyxv1/main/data/car_crashes.geojson";
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
                
                // Calculate Shannon Diversity Index
                var shannonIndex = calculateShannonIndex(pointsWithinIsochrone);

                // Update legend
                updateLegendWithPoints(pointsWithinIsochrone, shannonIndex);
            })
            .catch(function (error) {
                console.log("Error fetching data from selected data source:", error);
            });
        }
    }

// Function to calculate Shannon Diversity Index
function calculateShannonIndex(pointsWithinIsochrone) {
    var counts = {};
    var totalCount = 0;

    // Count points by category
    pointsWithinIsochrone.features.forEach(function (feature) {
        var category = feature.properties.amenity;
        if (!counts[category]) {
            counts[category] = 0;
        }
        counts[category]++;
        totalCount++;
    });

    var shannonIndex = 0;

    // Calculate Shannon Diversity Index
    for (var category in counts) {
        if (counts.hasOwnProperty(category)) {
            var p = counts[category] / totalCount;
            shannonIndex -= p * Math.log(p);
        }
    }
    return shannonIndex;
}

// Function to update legend with points data and Shannon Diversity Index
function updateLegendWithPoints(pointsWithinIsochrone, shannonIndex) {
    var totalCount = pointsWithinIsochrone.features.length;
    var legend = document.getElementById("sidebar-content");

    // Update legend with total point count
    legend.innerHTML = "<p>Total Points: " + totalCount + "</p>";

    // Add Shannon Diversity Index to the legend
    legend.innerHTML += "<p>Shannon Diversity Index: " + shannonIndex.toFixed(2) + "</p>";
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
            "fill-color": "#b3cde3",
            "fill-opacity": 0.5,
        },        
    });

    // Add outline layer for the polygon

    map.addLayer({        
        id: "outline",
        type: "line",                
        source: "isochrone",
        layout: {},
        paint: {        
            "line-color": "#fff7bc",
            "line-width": 1.5,
            "line-opacity": 1, // [
                //"interpolate", ["linear"], ["zoom"],
                //0, 1, // Fully opaque when zoomed out
                //10, 0.5 // Partially transparent when zoomed in
            //]
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
            "circle-radius": 4,        
            "circle-opacity": 1, 
            // Outline properties
            "circle-stroke-color": "#ffffff", // Color of the outline
            "circle-stroke-width": 1.2, // Width of the outline in pixels       
            "circle-color": [            
            "match",
            ["get", "amenity"], // Property to base the color on            
            "bar","#e31a1c", // Color for bar
            "cafe","#33a02c", // Color for cafe
            "restaurant","#ff7f00", // Color for restaurant
            "nightclub","#984ea3", // Color for nightclub
            "clinic","#a6cee3", // Color for clinics        
            "dentist","#cab2d6", // Color for dentist            
            "hospital","#fb9a99", // Color for hospitals   
            "veterinary","#b2df8a", // Color for veterinaries
            "PSP","#c6227f", // Color for PSP
            "Aversi","#ff3648", // Color for Aversi
            "GPC","#014c97", // Color for GPC
            "Pharmadepot","#06a9ad", // Color for Pharmadepot  
            "Bank of Georgia","#ff610f", // Color for Bank of Georgia
            "TBC Bank","#00a3e0", // Color for TBC Bank 
            "Liberty","#db2211", // Color for Liberty Bank 
            "BasisBank","#1d91c0",
            "Cartu Bank","#ffeda0",
            "Credo Bank","#6a51a3",
            "Crystal","#f768a1",
            "Halyk Bank","#74c476",
            "IsBank","#9ecae1",
            "ProCredit Bank","#fb9a99",
            "Terabank","#9F1D6C",
            "Ziraat Bank","#f781bf",
            "soft","#4d9221",
            "injury","#c51b7d",
            // Add more explicitly stated categories and colors as needed
            // If category is not explicitly stated, assign a default color
            // The last value in the paint expression will act as the default color
            "#cccccc" // Default color for all other categories
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

    // Add logging to check feature properties
map.on('click', 'featuresWithinIsochrone-layer', function (e) {
    var feature = e.features[0];
    console.log('Clicked feature properties:', feature.properties);
})