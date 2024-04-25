       mapboxgl.accessToken = "pk.eyJ1Ijoiam9yam9uZTkwIiwiYSI6ImNrZ3R6M2FvdTBwbmwycXBibGRqM2w2enYifQ.BxjvFSGqefuC9yFCrXC-nQ";
       var map = new mapboxgl.Map({
            container: "map",
            style: "mapbox://styles/jorjone90/cltetry3r00r301nw54sh4jal",
            center: [44.812, 41.741787],
            zoom: 12,
            //bearing: -36.26,
            //pitch: 72.29,
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

                // Add event listener to select dropdown for data source
                var dataSourceSelect = document.getElementById("data_source");
                dataSourceSelect.addEventListener("change", function () {
            
                    // Get the clicked coordinates
                    var lngLat = marker ? marker.getLngLat() : map.getCenter();
        
                    // Call function to generate isochrone
                    generateIsochrone(lngLat);
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
                //bearing: -35,
                //pitch: 52,
                padding: {
                    top: 90, 
                    right: 30, 
                    bottom: 30, 
                    left: 90
                }
            }); // Adjust padding as needed
            map.once("idle", function () {
                // Fetch population data
                fetch('https://raw.githubusercontent.com/axis-Z/urbanyxv1/main/data/tbs_pop_grid.geojson')
                .then(function(response) {
                    return response.json();
                })
                .then(function(populationData) {
                    // Filter population data within isochrone boundary
                    var populationWithinIsochrone = {
                        type: "FeatureCollection",
                        features: populationData.features.filter(function (feature) {
                            return turf.booleanPointInPolygon(
                                turf.point(feature.geometry.coordinates),
                                data.features[0]
                                );
                            })
                        };
            
                    // Calculate sum based on population data column
                    var populationSum = populationWithinIsochrone.features.reduce(function (accumulator, feature) {
                        return accumulator + feature.properties.POP_SQ_KM;
                    }, 0);
            
                    // Update legend with population sum
                    updatePopulationLegend(populationSum);
                })
            
                .catch(function(error) {
                    console.error('Error loading population data:', error);
                });
            
                // Fetch relative wealth index data
                fetch('https://raw.githubusercontent.com/axis-Z/urbanyxv1/main/data/relative_wealth_georgia.geojson')
                .then(function(response) {
                    return response.json();
                })
                .then(function(relativeWealthData) {
                    // Filter relative wealth index data within isochrone boundary
                    var relativeWealthWithinIsochrone = {
                        type: "FeatureCollection",
                        features: relativeWealthData.features.filter(function (feature) {
                            return turf.booleanPointInPolygon(
                                turf.point(feature.geometry.coordinates),
                                data.features[0]
                                );
                            })
                        }; 
            
                    // Calculate average relative wealth index
                    var totalRelativeWealth = relativeWealthWithinIsochrone.features.reduce(function (accumulator, feature) {
                        return accumulator + feature.properties.RWI;
                    }, 0);
                    var averageRelativeWealth = totalRelativeWealth / relativeWealthWithinIsochrone.features.length;
            
                    // Update legend with average relative wealth index
                    updateRelativeWealthLegend(averageRelativeWealth);
                })
            
                .catch(function(error) {
                    console.error('Error loading relative wealth index data:', error);
                });
            
                // Check if cell tower dataset is active
                if (selectedDataSource === "cell-tower") {
                    // Fetch avg internet speed data
                    fetch('https://raw.githubusercontent.com/axis-Z/urbanyxv1/main/data/fixed_internet_georgia.geojson')
                    .then(function(response) {
                        return response.json();
                    })
                    .then(function(internetSpeedData) {
                        // Filter internet speed data within isochrone boundary
                        var internetSpeedWithinIsochrone = {
                            type: "FeatureCollection",
                            features: internetSpeedData.features.filter(function (feature) {
                                return turf.booleanPointInPolygon(
                                    turf.point(feature.geometry.coordinates),
                                    data.features[0]
                                    );
                                })
                            };
            
                        // Calculate average internet speed
                        var totalInternetSpeed = internetSpeedWithinIsochrone.features.reduce(function (accumulator, feature) {
                            return accumulator + feature.properties.u_mbps_20;
                        }, 0);
                        var averageInternetSpeed = totalInternetSpeed / internetSpeedWithinIsochrone.features.length;
            
                        // Update legend with average internet speed
                        updateInternetSpeedLegend(averageInternetSpeed);
                    })
            
                    .catch(function(error) {
                        console.error('Error loading average internet speed data:', error);
                    });
                }
            });
            
            // Function to Update Legend with Average Internet Speed
            function updateInternetSpeedLegend(averageInternetSpeed) {
                // Find the legend element by its ID
                var legend = document.getElementById("legend");
            
                // Append a new legend item for the average internet speed
                legend.innerHTML += "<p>" + "<strong><span class='innerhtml' style='font-size: 14px;'>Average Internet Speed</strong></p>" + "<p>" + "<span class='innerhtml' style='font-size: 20px; color:#969696;'>" + averageInternetSpeed.toFixed(2) + "</p>";
            }            
                                         
            // Mapping between data source values and display names
            var dataSourceDisplayNames = {
                "pois-leisure": " leisure spots",
                "pois-health": " healthcare centers",
                "pois-pharmacy": " pharmacies",
                "pois-bank": " bank offices",
                "pois-atm": " ATMs",
                "pois-payment": " payment kiosks",
                "car-crashes": " car crashes recorded",
                "celltowers": " cell towers located",
            };

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
            } else if (selectedDataSource === "celltowers") {
                dataUrl = "https://raw.githubusercontent.com/axis-Z/urbanyxv1/main/data/cell_towers.geojson";
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

            // Function to calculate Shannon Diversity Index
            function calculateShannonIndex(counts) {
                var totalCount = 0;
                var shannonIndex = 0;
    
                // Calculate total count
                for (var category in counts) {
                    if (counts.hasOwnProperty(category)) {
                        totalCount += counts[category];
                    }
                }
    
                // Calculate Shannon Diversity Index
                for (var category in counts) {
                    if (counts.hasOwnProperty(category)) {
                        var p = counts[category] / totalCount;
                        shannonIndex -= p * Math.log(p);
                    }
                }
                return shannonIndex;
            }

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

            // Calculate Shannon Diversity Index
            var shannonIndex = calculateShannonIndex(counts);

            // Look up the display name based on the selected data source value
            var selectedDataSourceDisplayName = dataSourceDisplayNames[selectedDataSource];

            // Update legend title based on selected data source
            var legendTitle = document.getElementById("legend-title");
            legendTitle.innerHTML = "<p>" + "<strong> <span class='innerhtml' style='color: yellow; background-color: black;'>" + totalCount + "</strong></span>" + (selectedDataSourceDisplayName || selectedDataSource.toUpperCase()) + " within " + "<strong> <span class='innerhtml' style='color: yellow; background-color: black'>" + contours_minutes + " minutes " + profile + "</span></strong> distance</p>";

            // Clear the legend before updating it with new items
            var legend = document.getElementById("legend");
            legend.innerHTML="";
            
            // Define colors for each category for legend

            var defaultColor = "#cccccc"; // Default color for unspecified categories

            var categoryColors = {
                "bar":"#e31a1c", // Color for bar
                "cafe":"#33a02c", // Color for cafe
                "restaurant":"#ff7f00", // Color for restaurant
                "nightclub":"#984ea3", // Color for nightclub
                "fast_food":"#dfff00", // Color for fastfood
                "clinic": "#a6cee3", // Color for clinic
                "dentist": "#cab2d6", // Color for dentist
                "hospital": "#fb9a99", // Color for hospital
                "veterinary": "#b2df8a", // Color for veterinary
                "PSP": "#c6227f", // Color for PSP
                "Aversi": "#ff3648", // Color for Aversi
                "GPC": "#014c97", // Color for GPC
                "Pharmadepot": "#06a9ad", // Color for Pharmadepot
                "Bank of Georgia": "#ff610f", // Color for Bank of Georgia
                "TBC Bank": "#00a3e0", // Color for TBC Bank 
                "Liberty": "#db2211", // Color for Liberty Bank
                "BasisBank": "#1d91c0", // Color for BasisBank
                "Cartu Bank":"#ffeda0", // Color for Cartu Bank
                "Credo Bank":"#6a51a3", // Color for Credo Bank
                "Crystal":"#f768a1", // Color for Crystal
                "Halyk Bank":"#74c476", // Color for Halyk Bank
                "IsBank":"#9ecae1", // Color for IsBank
                "ProCredit Bank":"#fb9a99", // Color for ProCredit Bank
                "Terabank":"#9F1D6C", // Color for TeraBank
                "Ziraat Bank":"#f781bf", // Color for Ziraat Bank
                "soft":"#4d9221", // Color for soft car crashes
                "injury":"#c51b7d", // Color for serious car crashes resulting in injuries
                "GSM (2G)":"#2b8cbe", // Color for GSM (2G)
                "UMTS (3G)":"#feb24c", // Color for UMTS (3G)
                "LTE (4G)":"#dd1c77", // Color for LTE (4G)
            };

            // Function to get color based on category
            function getColor(category) {
                return categoryColors[category] || defaultColor;
            }

            // Check if the car-crash layer is active
            var isCarCrashLayerActive = selectedDataSource === 'car-crashes';
            var isCellTowerLayerActive = selectedDataSource === 'celltowers';


            // Iterate over each category and update legend
            for (var category in counts) {
                if (counts.hasOwnProperty(category)) {
                    // Replace null values with "other"
                    var categoryName = category === "null" ? "Other" : category;

                    // Create a color circle for the category
                    var colorCircle = document.createElement("span");
                    colorCircle.className = "legend-circle";
                    colorCircle.style.backgroundColor = getColor(categoryName);
       
                    // Create a legend item for the category
                    var legendItem = document.createElement("p");
                    legendItem.innerHTML =
                    colorCircle.outerHTML +
                    "<strong>" +
                    categoryName.replace("_", " ") +
                    ":</strong> " +
                    counts[category];

                    // Append legend item to the legend only if the car-crash layer is not active
                    if (!isCarCrashLayerActive && !isCellTowerLayerActive || category !== 'Shannon diversity index') {
                        legend.appendChild(legendItem);
                    }
                    
                }
            }

            // Add Shannon Diversity Index to the legend if the car-crash layer is not active
            if (!isCarCrashLayerActive && !isCellTowerLayerActive) {
                var shannonLegendItem = document.createElement("p");
                shannonLegendItem.innerHTML = "<strong><span class='innerhtml' style='font-size: 14px;'>Diversity</strong></p>" + "<p>" + "<span class='innerhtml' style='font-size: 20px; color:#969696;'>" + shannonIndex.toFixed(2) + "</strong></span>";
                legend.appendChild(shannonLegendItem);
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
            "fast_food","#dfff00", // Color for fastfood
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
            "GSM (2G)","#2b8cbe", // Color for GSM (2G)
            "UMTS (3G)","#feb24c", // Color for UMTS (3G)
            "LTE (4G)","#dd1c77", // Color for LTE (4G)
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
    });

    // Add logging to check feature properties
map.on('click', 'featuresWithinIsochrone-layer', function (e) {
    var feature = e.features[0];
    console.log('Clicked feature properties:', feature.properties);
})