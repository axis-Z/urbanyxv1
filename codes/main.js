mapboxgl.accessToken = "pk.eyJ1Ijoiam9yam9uZTkwIiwiYSI6ImNrZ3R6M2FvdTBwbmwycXBibGRqM2w2enYifQ.BxjvFSGqefuC9yFCrXC-nQ";

var map = new mapboxgl.Map({
    container: "map",
    style: 'mapbox://styles/mapbox/navigation-preview-night-v4',
    center: [44.812, 41.741787],
    zoom: 12,
    maxZoom: 15.5,
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

            bearing: -35,
            pitch: 30,
            padding: {
                top: 15, 
                right: 15, 
                bottom: 15, 
                left: 15
            }
        });

        // Adjust padding as needed
        map.once("idle", function () {

            // Fetch population data
            fetch('https://raw.githubusercontent.com/axis-Z/urbanyxv1/main/data/tbs_pop_points_2020.geojson')
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

                    // Calculate men population sum
                    var menSum = populationWithinIsochrone.features.reduce(function(accumulator, feature) {
                        return accumulator + feature.properties.men_total;
                    }, 0);

                    // Calculate women population sum
                    var womenSum = populationWithinIsochrone.features.reduce(function(accumulator, feature) {
                        return accumulator + feature.properties.women_total;
                    }, 0);
    
                    // Calculate total population sum
                    var populationSum = womenSum + menSum;
    
                    // Calculate percentages
                    var menPercentage = ((menSum / populationSum) * 100).toFixed(1);
                    var womenPercentage = ((womenSum / populationSum) * 100).toFixed(1);

                    // Check if the demography layer is selected (to be replaced with other layer)
                    if (selectedDataSource === "demography") { 

                        // Calculate additional demographic groups if needed
                        var kidSum = populationWithinIsochrone.features.reduce(function(accumulator, feature) {
                            return accumulator + feature.properties.kids_five;
                        }, 0);

                        var youthSum = populationWithinIsochrone.features.reduce(function(accumulator, feature) {
                            return accumulator + feature.properties.youth_15to24;
                        }, 0);
        
                        var womReprSum = populationWithinIsochrone.features.reduce(function(accumulator, feature) {
                            return accumulator + feature.properties.women_repr_age;
                        }, 0);

                        var elderlySum = populationWithinIsochrone.features.reduce(function(accumulator, feature) {
                            return accumulator + feature.properties.elderly_60;
                        }, 0);

                        var kidPercentage = ((kidSum / populationSum) * 100).toFixed(1);
                        var youthPercentage = ((youthSum / populationSum) * 100).toFixed(1);
                        var womReprPercentage = ((womReprSum / womenSum) * 100).toFixed(1);
                        var elderlyPercentage = ((elderlySum / populationSum) * 100).toFixed(1);

                        updatePopulationLegend(populationSum, menSum, womenSum, menPercentage, womenPercentage, kidSum, youthSum, womReprSum, elderlySum, kidPercentage, youthPercentage, womReprPercentage, elderlyPercentage);
                    } else {
                        updatePopulationLegend(populationSum, menSum, womenSum, menPercentage, womenPercentage);
                    }
    
                    // Function to Update Legend with Population Sum
                    function updatePopulationLegend(populationSum, menSum, womenSum, menPercentage, womenPercentage, kidSum = null, youthSum = null, womReprSum = null, elderlySum = null, kidPercentage = null, youthPercentage = null, womReprPercentage = null, elderlyPercentage = null) {
    
                        // Find the legend element by its ID
                        var pielegend = document.getElementById("pielegend");
    
                        // Find the legend element by its ID
                        var legend = document.getElementById("legend");

                        // Clear the legend before updating it with new items
                        pielegend.innerHTML = "<div id='genderPieChart'><p class='piecharttitle'><strong><span class='innerhtml'> TOTAL POPULATION <br></strong></span>" + "<span class='innerhtml' style='color:#969696; font-size: 22px;'>" + populationSum + "</span></p></div>";
    
                        // Update the legend with the population sum
                        legend.innerHTML += "" ;

                        if (kidSum !== null && youthSum !== null && womReprSum !== null && elderlySum !== null && kidPercentage !== null && youthPercentage !== null && womReprPercentage !== null &&elderlyPercentage !== null) {
    
                            pielegend.innerHTML +=
    
                            "<p><img class='img-text' src='/Users/giorgikankia/Documents/GitHub/urbanyxv1/img/2.png' alt='Gen alpha Image' style='vertical-align:middle; width:25%; height:25%;'>" + "<span class='innerhtml' style='color:#969696; font-size: 20px; text-align: right;'> " + kidSum + " (" +  kidPercentage + " %)" + "<span class='innerhtml' style='color:#969696; font-size: 12px;'> 0 to 5 Y.O." + "</span>" + "</p>" +  
                            "<p><img class='img-text' src='/Users/giorgikankia/Documents/GitHub/urbanyxv1/img/1.png' alt='Gen Z Image' style='vertical-align:middle; width:25%; height:25%;'>" + "<span class='innerhtml' style='color:#969696; font-size: 20px; text-align: right;'> " + youthSum + " (" +  youthPercentage + " %)" + "<span class='innerhtml' style='color:#969696; font-size: 12px;'> 15 to 24 Y.O." + "</span>" + "</p>" + 
                            "<p><img class='img-text' src='/Users/giorgikankia/Documents/GitHub/urbanyxv1/img/3.png' alt='Gen boomers' style='vertical-align:middle; width:25%; height:25%;'>" + "<span class='innerhtml' style='color:#969696; font-size: 20px; text-align: right;'> " + elderlySum + " (" + elderlyPercentage + " %)" + "<span class='innerhtml' style='color:#969696; font-size: 12px;'> over 60 Y.O." + "</span>" + "</p>" + 
                            "<p><img class='img-text' src='/Users/giorgikankia/Documents/GitHub/urbanyxv1/img/4.png' alt='women of repr age' style='vertical-align:middle; width:25%; height:25%;'>" + "<span class='innerhtml' style='color:#969696; font-size: 20px; text-align: right;'> " + womReprSum  + " (" + womReprPercentage + " %)" + "<span class='innerhtml' style='color:#969696; font-size: 12px;'> % of females" + "</span></p></div>";     
                        }
    
                        // Data source for the pie chart including percentages
                        var genderData = [ 
                            { x: 'Females', y: womenSum, text: + womenSum + ' (' + womenPercentage + '%)',  fill: '#fdb462'  },
                            { x: 'Males', y: menSum, text: + menSum + ' (' + menPercentage + '%)', fill: '#8dd3c7' }
                        ];

                        var genderPieChart = new ej.charts.AccumulationChart({
                            series: [{
                                dataSource: genderData,
                                xName: 'x',
                                yName: 'y',
                                pointColorMapping: 'fill',
                                type: 'Pie',
                                dataLabel: {
                                    visible: true,
                                    position: 'Inside',
                                    name: 'text',
                                    font: {
                                        fontFamily: 'JetBrains Mono',
                                        color: 'black'
                                    }
                                }
                            }],
                            legendSettings: {
                                visible: true,
                                textStyle: {
                                    fontFamily: 'JetBrains Mono',
                                    color: '#969696'
                                }
                            }
                        });
                        genderPieChart.appendTo('#genderPieChart');
                    }
    
                    if (selectedDataSource === "pois-leisure") {
    
                        // Fetch tree canopy data
                        fetch('https://raw.githubusercontent.com/axis-Z/urbanyxv1/main/data/tree_canopy_points.geojson')
                        .then(function(response) {
                            return response.json();
                        })
                        .then(function(treeCanopyData) {
                            var treeCanopyWithinIsochrone = {
                                type: "FeatureCollection",
                                features: treeCanopyData.features.filter(function (feature) {
                                    return turf.booleanPointInPolygon(
                                        turf.point(feature.geometry.coordinates),
                                        data.features[0]
                                        );
                                    })
                                };

                                var treeCanopyArea = treeCanopyWithinIsochrone.features.reduce(function(accumulator, feature) {
                                    return accumulator + feature.properties.area_sq_m;
                                }, 0);

                                var canopyPerInhabitant = treeCanopyArea / populationSum;
                                updateCanopyLegend(canopyPerInhabitant);
                            })
                            .catch(function(error) {
                                console.error('Error loading tree canopy data:', error);
                            });

        
                            fetch('https://raw.githubusercontent.com/axis-Z/urbanyxv1/main/data/urban_recreation_points.geojson')
                            .then(function(response) {
                                return response.json();
                            })
            
                            .then(function(urbRecreationData) {
                                var urbRecreationWithinIsochrone = {
                                    type: "FeatureCollection",
                                    features: urbRecreationData.features.filter(function (feature) {
                                        return turf.booleanPointInPolygon(
                                            turf.point(feature.geometry.coordinates),
                                            data.features[0]
                                            );
                                        })
                                    };

                                    var urbRecreationArea = urbRecreationWithinIsochrone.features.reduce(function(accumulator, feature) {
                                        return accumulator + feature.properties.urb_rec_area;
                                    }, 0);
            
                                    var urbRecPerInhabitant = urbRecreationArea / populationSum;

                                    updateUrbRec(urbRecPerInhabitant);
                                })
                                .catch(function(error) {
                                    console.error('Error loading urban recreation data:', error);
                                });
                            }
                        });

                    // Function to Update Legend with the canopy per inhabitant
                    function updateCanopyLegend(canopyPerInhabitant) {

                        // Find the legend element by its ID
                        var legend = document.getElementById("legend");

                        // Update the legend with the canopy per inhabitant
                        legend.innerHTML += "<p><strong><span class='innerhtml' style='font-size: 16px;'>Urban Shade Index</strong></p>" + 
                        "<p><span class='innerhtml' style='font-size: 18px; color:#969696;'>" + canopyPerInhabitant.toFixed(2) + "</span>" +
                        "<span class='innerhtml' style='color:#969696;'> m<sup>2</sup>" + "<span class='innerhtml' style='font-size: 14px;'> per inhabitant</span>" + "</p>";
                    }

                    // Function to Update Legend with the canopy per inhabitant
                    function updateUrbRec(urbRecPerInhabitant) {

                        // Find the legend element by its ID
                        var legend = document.getElementById("legend");

                        // Function to determine color based on value
                        function getColorForUrbRec(value) {

                            // Define color thresholds for upload speed
                            if (value >= 9) { //9sq.m is the recommended amount of minimum urban green space per inhabitant
                                return { backgroundColor: '#78c679', fontColor: '#ffffff' };
                            } else if (value >= 5) {
                                return { backgroundColor: '#fd8d3c', fontColor: '#ffffff' };
                            } else {
                                return { backgroundColor: '#bd0026', fontColor: '#ffffff' };
                            }
                        }
        
                        // Update the legend with the canopy per inhabitant
                        legend.innerHTML += "<p>" + "<strong><span class='innerhtml' style='font-size: 16px;'>Urban Recreation Index</strong></p>" + "<p>" + "<span class='innerhtml' style='padding: 5px; font-size: 18px; border-radius: 3px; color:" + getColorForUrbRec(urbRecPerInhabitant).fontColor +"; background-color:" + getColorForUrbRec(urbRecPerInhabitant).backgroundColor + ";'>" + urbRecPerInhabitant.toFixed(2) + "</span>" + "<span class='innerhtml' style='color:#969696;'> m<sup>2</sup>" + "<span class='innerhtml' style='font-size: 14px;'> per inhabitant</span>" + "</p>";
                    }

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

                        // Function to Update Legend with Average Relative Wealth Index                
                        function updateRelativeWealthLegend(averageRelativeWealth) {

                            // Find the legend element by its ID
                            var legend = document.getElementById("legend");

                            // Function to determine color based on value
                            function getColorForWealthIndex(value) {

                                // Define color thresholds for upload speed
                                if (value >= 1) {
                                    return { backgroundColor: '#78c679', fontColor: '#ffffff' };
                                } else if (value >= 0.75) {
                                    return { backgroundColor: '#fd8d3c', fontColor: '#ffffff' };
                                } else {
                                    return { backgroundColor: '#bd0026', fontColor: '#ffffff' };
                                }
                            }

                            // Append a new legend item for the average relative wealth index
                            legend.innerHTML += "<p>" + "<strong><span class='innerhtml' style='font-size: 16px;'>Wealth index</strong></p>" + "<p>" + "<span class='innerhtml' style='padding: 5px; font-size: 18px; border-radius: 3px; color:" + getColorForWealthIndex(averageRelativeWealth).fontColor +"; background-color:" + getColorForWealthIndex(averageRelativeWealth).backgroundColor + ";'>" + averageRelativeWealth.toFixed(2) + "</p>";    
                        }

                        // Check if cell tower dataset is active
                        if (selectedDataSource === "celltowers") {

                            // Fetch avg fixed internet speed data
                            fetch('https://raw.githubusercontent.com/axis-Z/urbanyxv1/main/data/fixed_internet_georgia.geojson')
                            .then(function(response) {
                                return response.json();
                            })
                            .then(function(fixedInternetSpeedData) {

                                // Filter internet speed data within isochrone boundary
                                var internetSpeedWithinIsochrone = {
                                    type: "FeatureCollection",
                                    features: fixedInternetSpeedData.features.filter(function (feature) {
                                        return turf.booleanPointInPolygon(
                                            turf.point(feature.geometry.coordinates),
                                            data.features[0]
                                            );
                                        })
                                    };

                                    // Function to calculate median
                                    function calculateMedian(data) {
                
                                        // Sort the data in ascending order
                                        data.sort(function(a, b) {
                                            return a - b;
                                        });
                                        var n = data.length;
                                        var medianIndex = Math.floor(n / 2);

                                        // If the dataset has an odd number of values
                                        if (n % 2 !==0) {
                                            return data[medianIndex];
                                        } else {

                                            // If the dataset has an even number of values
                                            var lowerMiddleValue = data[medianIndex - 1];
                                            var upperMiddleValue = data[medianIndex];
                                            return (lowerMiddleValue + upperMiddleValue) / 2;
                                        }                
                                    }

                                    // Calculate median upload speed, download speed and latency
                                    var fixedUploadSpeed = [];
                                    var fixedDownloadSpeed = [];                
                                    var fixedLatency = [];

                                    internetSpeedWithinIsochrone.features.forEach(function(feature) {
                                        fixedUploadSpeed.push(feature.properties.u_mbps_22);
                                        fixedDownloadSpeed.push(feature.properties.d_mbps_22);
                                        fixedLatency.push(feature.properties.lat_s_22);                
                                    });

                                    var medianFixedUploadSpeed = calculateMedian(fixedUploadSpeed);
                                    var medianFixedDownloadSpeed = calculateMedian(fixedDownloadSpeed);
                                    var medianFixedLatency = calculateMedian(fixedLatency);

                                    // Update legend with median fixed internet upload speed, download speed, and latency
                                    updateFixedInternetSpeedLegend(medianFixedUploadSpeed, medianFixedDownloadSpeed, medianFixedLatency)    
                                })

                            // Fetch avg mob internet speed data
                            fetch('https://raw.githubusercontent.com/axis-Z/urbanyxv1/main/data/mobile_internet_georgia.geojson')
                            .then(function(response) {
                                return response.json();
                            })
                            .then(function(mobileInternetSpeedData) {

                                // Filter internet speed data within isochrone boundary
                                var mobileInternetSpeedWithinIsochrone = {
                                    type: "FeatureCollection",
                                    features: mobileInternetSpeedData.features.filter(function (feature) {
                                        return turf.booleanPointInPolygon(
                                            turf.point(feature.geometry.coordinates),
                                            data.features[0]
                                            );
                                        })
                                    };

                                    // Function to calculate median
                                    function calculateMedian(data) {
                
                                        // Sort the data in ascending order
                                        data.sort(function(a, b) {
                                            return a - b;
                                        });
                                        var n = data.length;
                                        var medianIndex = Math.floor(n / 2);

                                        // If the dataset has an odd number of values
                                        if (n % 2 !==0) {
                                            return data[medianIndex];
                                        } else {

                                            // If the dataset has an even number of values
                                            var lowerMiddleValue = data[medianIndex - 1];
                                            var upperMiddleValue = data[medianIndex];
                                            return (lowerMiddleValue + upperMiddleValue) / 2;
                                        }                
                                    }

                                    // Calculate median upload speed, download speed and latency
                                    var mobileUploadSpeed = [];
                                    var mobileDownloadSpeed = [];                
                                    var mobileLatency = [];

                                    mobileInternetSpeedWithinIsochrone.features.forEach(function(feature) {
                                        mobileUploadSpeed.push(feature.properties.u_mbps_22);
                                        mobileDownloadSpeed.push(feature.properties.d_mbps_22);
                                        mobileLatency.push(feature.properties.lat_s_22);                
                                    });

                                    var medianMobileUploadSpeed = calculateMedian(mobileUploadSpeed);
                                    var medianMobileDownloadSpeed = calculateMedian(mobileDownloadSpeed);
                                    var medianMobileLatency = calculateMedian(mobileLatency);

                                    // Update legend with median fixed internet upload speed, download speed, and latency
                                    updateMobileInternetSpeedLegend(medianMobileUploadSpeed, medianMobileDownloadSpeed, medianMobileLatency)    
                                })

                                .catch(function(error) {
                                    console.error('Error loading average internet speed data:', error);
                                });

                            }
                            
                        });

                        // Function to Update Legend with fixed Internet Speed
                        function updateFixedInternetSpeedLegend(medianFixedUploadSpeed, medianFixedDownloadSpeed, medianFixedLatency) {
            
                            // Find the legend element by its ID
                            var legend = document.getElementById("legend");

                            // Function to determine color based on value
                            function getColorForUploadSpeed(value) {

                                // Define color thresholds for upload speed
                                if (value >= 19) {
                                    return '#78c679';
                                } else if (value >= 15) {
                                    return '#fd8d3c';
                                } else {
                                    return '#bd0026';
                                }
                            }
                            function getColorForDownloadSpeed(value) {

                                // Define color thresholds for upload speed
                                if (value >= 19) {
                                    return '#78c679';
                                } else if (value >= 15) {
                                    return '#fd8d3c';
                                } else {
                                    return '#bd0026';
                                }            
                            }

                            function getColorForLatency(value) {
            
                                // Define color thresholds for upload speed
                                if (value <= 5) {
                                    return '#78c679';
                                } else if (value <= 8) {
                                    return '#fd8d3c';
                                } else {
                                    return '#bd0026';
                                }
                            }

                            // Update the legend with fixed internet speed information
                            legend.innerHTML += "<p class='legend-subhead'>" + "<strong><span class='innerhtml' style='font-size: 16px;'>Fixed Internet Speed</strong>" + " <span class='innerhtml' style='font-size: 14px; color: #969696;'>(National & Tbilisi)</span></p>" + "<span class='innerhtml' style='font-size: 14px;'>median upload - mbps</p>" + "<span class='innerhtml' style='font-size: 18px; color:"  + getColorForUploadSpeed(medianFixedUploadSpeed) + ";'>" + medianFixedUploadSpeed.toFixed(2) + " <span class='innerhtml' style='font-size: 14px; color: #969696;'>(19.48 & 27.20)</span>";
                            legend.innerHTML += "<p class='legend-subhead'>"+ "<span class='innerhtml' style='font-size: 14px;'>median download - mbps</p>" + "<span class='innerhtml' style='font-size: 18px; color:" + getColorForDownloadSpeed(medianFixedDownloadSpeed) + ";'>" + medianFixedDownloadSpeed.toFixed(2) + " <span class='innerhtml' style='font-size: 14px; color: #969696;'>(19.00 & 26.06)</span>";
                            legend.innerHTML += "<p class='legend-subhead'>"+ "<span class='innerhtml' style='font-size: 14px;'>median latency - ms</p>" + "<span class='innerhtml' style='font-size: 18px; color:" + getColorForLatency(medianFixedLatency) + ";'>" + medianFixedLatency.toFixed(2) + " <span class='innerhtml' style='font-size: 14px; color: #969696;'>(8.00 & 5.00)</span>";
                        }

                        // Function to Update Legend with Internet Speed
                        function updateMobileInternetSpeedLegend(medianMobileUploadSpeed, medianMobileDownloadSpeed, medianMobileLatency) {
            
                            // Find the legend element by its ID
                            var legend = document.getElementById("legend");

                            // Function to determine color based on value
                            function getColorForMobUploadSpeed(value) {

                                // Define color thresholds for upload speed
                                if (value >= 15) {
                                    return '#78c679';
                                } else if (value >= 8) {
                                    return '#fd8d3c';
                                } else {
                                    return '#bd0026';
                                }
                            }
                            function getColorForMobDownloadSpeed(value) {

                                // Define color thresholds for upload speed
                                if (value >= 36) {
                                    return '#78c679';
                                } else if (value >= 27) {
                                    return '#fd8d3c';
                                } else {
                                    return '#bd0026';
                                }            
                            }

                            function getColorForMobLatency(value) {
            
                                // Define color thresholds for upload speed
                                if (value <= 20) {
                                    return '#78c679';
                                } else if (value <= 30) {
                                    return '#fd8d3c';
                                } else {
                                    return '#bd0026';
                                }
                            }

                            // Update the legend with the mob internet speed information
                            legend.innerHTML += "<p class='legend-subhead'>" + "<strong><span class='innerhtml' style='font-size: 16px;'>Mobile Internet Speed</strong>" + " <span class='innerhtml' style='font-size: 14px; color: #969696;'>(National & Tbilisi)</span></p>" + "<span class='innerhtml' style='font-size: 14px;'>median upload - mbps</p>" + "<span class='innerhtml' style='font-size: 18px; color:"  + getColorForMobUploadSpeed(medianMobileUploadSpeed) + ";'>" + medianMobileUploadSpeed.toFixed(2) + " <span class='innerhtml' style='font-size: 14px; color: #969696;'>(8.83 & 15.13)</span>";
                            legend.innerHTML += "<p class='legend-subhead'>"+ "<span class='innerhtml' style='font-size: 14px;'>median download - mbps</p>" + "<span class='innerhtml' style='font-size: 18px; color:" + getColorForMobDownloadSpeed(medianMobileDownloadSpeed) + ";'>" + medianMobileDownloadSpeed.toFixed(2) + " <span class='innerhtml' style='font-size: 14px; color: #969696;'>(27.10 & 36.26)</span>";
                            legend.innerHTML += "<p class='legend-subhead'>"+ "<span class='innerhtml' style='font-size: 14px;'>median latency - ms</p>" + "<span class='innerhtml' style='font-size: 18px; color:" + getColorForMobLatency(medianMobileLatency) + ";'>" + medianMobileLatency.toFixed(2) + " <span class='innerhtml' style='font-size: 14px; color: #969696;'>(22.00 & 21.00)</span>";
                        }
                        
                        // Mapping between data source values and display names
                        var dataSourceDisplayNames = {
                            "pois-leisure": " leisure spots",
                            "pois-health": " healthcare centers",
                            "pois-pharmacy": " pharmacies",
                            "pois-bank": " bank offices",
                            "pois-atm": " ATMs",
                            "public_schools": " public schools",
                            "car-crashes": " car crashes recorded",
                            "celltowers": " cell towers located",
                            "demography": " test",
                        };

                        // Fetch point features from selected data source
                        var selectedDataSource = document.getElementById("data_source").value;
                        var dataUrl;
                        if (selectedDataSource === "pois-leisure") {
                            dataUrl = "https://raw.githubusercontent.com/axis-Z/urbanyxv1/main/data/pois-leisure.geojson";
                        } else if (selectedDataSource === "demography") {
                            dataUrl = "https://raw.githubusercontent.com/axis-Z/urbanyxv1/main/data/tbs_pop_points_2020.geojson";            
                        } else if (selectedDataSource === "pois-health") {
                            dataUrl = "https://raw.githubusercontent.com/axis-Z/urbanyxv1/main/data/pois-health.geojson";
                        } else if (selectedDataSource === "pois-pharmacy") {
                            dataUrl = "https://raw.githubusercontent.com/axis-Z/urbanyxv1/main/data/pois-pharmacy.geojson";
                        } else if (selectedDataSource === "pois-bank") {
                            dataUrl = "https://raw.githubusercontent.com/axis-Z/urbanyxv1/main/data/pois-bank.geojson";
                        } else if (selectedDataSource === "pois-atm") {
                            dataUrl = "https://raw.githubusercontent.com/axis-Z/urbanyxv1/main/data/pois-atm.geojson";
                        } else if (selectedDataSource === "public_schools") {
                            dataUrl = "https://raw.githubusercontent.com/axis-Z/urbanyxv1/main/data/public_schools.geojson";
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
                                    
                                    if (selectedDataSource === "demography") {
                                        legendTitle.innerHTML = "<p>" + "<strong> <span class='innerhtml' style='color: yellow; background-color: black; padding: 2px 4px; border-radius: 3px;'> Socio-demographic" + "</strong></span>" + " profile within " + "<strong> <span class='innerhtml' style='color: yellow; background-color: black; padding: 2px 4px; border-radius: 3px;'>" + contours_minutes + " minutes " + profile + "</span></strong> <br> distance of the clicked location</p>";
                                    } else {
                                        legendTitle.innerHTML = "<p>" + "<strong> <span class='innerhtml' style='color: yellow; background-color: black; padding: 2px 4px; border-radius: 3px;'>" + totalCount + "</strong></span>" + (selectedDataSourceDisplayName || selectedDataSource.toUpperCase()) + " within " + "<strong> <span class='innerhtml' style='color: yellow; background-color: black; padding: 2px 4px; border-radius: 3px;'>" + contours_minutes + " minutes " + profile + "</span></strong> distance</p>";
                                    }
                                
                                    // Clear the legend before updating it with new items
                                    var legend = document.getElementById("legend");
                                    legend.innerHTML="";
                                    // Define colors for each category for legend
                                    var defaultColor = "rgba(204, 204, 204, 0.5)"; // Default color for unspecified categories
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
                                        "Good":"#1a9641", // Color for good condition of school building
                                        "Fair":"#a6d96a", // Color for fair condition of school building
                                        "Bad":"#fdae61", // Color for bad condition of school building                                      
                                        "Replacement":"#d7191c", // Color for the school building in need of replacement           
                                    };

                                    // Function to get color based on category
                                    function getColor(category) {
                                        return categoryColors[category] || defaultColor;            
                                    }

                                    // Check if the car-crash/celltower layers are active
                                    var isCarCrashLayerActive = selectedDataSource === 'car-crashes';
                                    var isCellTowerLayerActive = selectedDataSource === 'celltowers';
                                    var isDemographyLayerActive = selectedDataSource === 'demography';
                                    var isSchoolLayerActive = selectedDataSource === 'public_schools';

                                    // Only update the legend if demography layer is not active

                                    if (!isDemographyLayerActive) {

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
                                            
                                                // Append legend item to the legend only if the car-crash/celltower/demography layers are not active
                                            
                                                if (!isCarCrashLayerActive && !isCellTowerLayerActive && !isDemographyLayerActive && !isSchoolLayerActive || category !== 'Shannon diversity index') {
                                                legend.appendChild(legendItem);
                                            
                                            }
                                        }
                                    }
                                }

                                    // Add Shannon Diversity Index to the legend if the car-crash layer is not active
                                    if (!isCarCrashLayerActive && !isCellTowerLayerActive && !isDemographyLayerActive && !isSchoolLayerActive) {
                                        var shannonLegendItem = document.createElement("p");
                                        shannonLegendItem.innerHTML = "<strong><span class='innerhtml' style='font-size: 16px;'>Urban Functions Diversity Index</strong></p>" + "<p>" + "<span class='innerhtml' style='font-size: 18px; color:#969696;'>" + shannonIndex.toFixed(2) + "</strong></span>";
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
                                //"circle-stroke-color": "#ffffff", // Color of the outline
                                //"circle-stroke-width": 1.2, // Width of the outline in pixels       
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
                                    "Good","#1a9641", // Color for good condition of school building
                                    "Fair","#a6d96a", // Color for fair condition of school building
                                    "Bad","#fdae61", // Color for bad condition of school building                                      
                                    "Replacement","#d7191c", // Color for the school building in need of replacement           
                                    // Add more explicitly stated categories and colors as needed
                                    // If category is not explicitly stated, assign a default color
                                    // The last value in the paint expression will act as the default color
                                    "rgba(204, 204, 204, 0)" // Default color for all other categories
                                ],

                            // Define stroke color conditionally
                            "circle-stroke-color": [
                                "case",
                                // If the color is default, no stroke color
                                ["==", ["get", "amenity"], null],
                                "rgba(0, 0, 0, 0)",
                                // Otherwise, white stroke color
                                "#ffffff"
                            ],
        
                            // Define stroke width conditionally
                            "circle-stroke-width": [
                                "case",
                                // If the color is default, no stroke width
                                ["==", ["get", "amenity"], null],
                                0,
                                // Otherwise, 1.2 stroke width
                                1.2
                            ]
                        }
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