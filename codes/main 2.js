mapboxgl.accessToken = "pk.eyJ1Ijoiam9yam9uZTkwIiwiYSI6ImNtZDY5ZDZqbDA5MHUya3F2emJncXk0eXgifQ.U-XZt6e_Z-LeVuWx3hut_A";

var map = new mapboxgl.Map({
    container: "map",
    style: 'mapbox://styles/jorjone90/cmd1cg82i000101s61qwaca16', //'mapbox://styles/mapbox/navigation-preview-night-v4',
    center: [44.812, 41.741787],
    zoom: 12,
    maxZoom: 20, //15.5,
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

            bearing: 0,
            pitch: 52,
            maxZoom: 22, // Ensure enough zoom to show buildings
            minZoom: 17  // Optional: prevent zooming out too much 
        });

        // Adjust padding as needed
        map.once("idle", function () {

            // Fetch voter data
            fetch('https://raw.githubusercontent.com/axis-Z/urbanyxv1/main/data/elections_2024.geojson')
            .then(function(response) {
                return response.json();
            })

            .then(function(voterData) {

                // Filter voter data within isochrone boundary        
                var voterWithinIsochrone = {
                    type: "FeatureCollection",
                    features: voterData.features.filter(function (feature) {
                        return turf.booleanPointInPolygon(
                            turf.point(feature.geometry.coordinates),
                            data.features[0]
                            );
                        })
                    };

                    // Calculate men voter sum
                    var menSum = voterWithinIsochrone.features.reduce(function(accumulator, feature) {
                        return accumulator + feature.properties.total_re_1;
                    }, 0);

                    // Calculate women voter sum
                    var womenSum = voterWithinIsochrone.features.reduce(function(accumulator, feature) {
                        return accumulator + feature.properties.total_re_2;
                    }, 0);
    
                    // Calculate total voter sum
                    var voterSum = womenSum + menSum;
    
                    // Calculate percentages
                    var menPercentage = ((menSum / voterSum) * 100).toFixed(1);
                    var womenPercentage = ((womenSum / voterSum) * 100).toFixed(1);

                    // Check if the voter layer is selected (to be replaced with other layer)
                    if (selectedDataSource === "voters") { 

                        // Calculate political party support
                        var qocebi41 = voterWithinIsochrone.features.reduce(function(accumulator, feature) {
                            return accumulator + feature.properties.QOC_VOTES;
                        }, 0);

                        var koalicia4 = voterWithinIsochrone.features.reduce(function(accumulator, feature) {
                            return accumulator + feature.properties.KOAL_VOTES;
                        }, 0);

                        var koalicia4estimate = voterWithinIsochrone.features.reduce(function(accumulator, feature) {
                            return accumulator + feature.properties.KOAL_2_LEL;
                        }, 0);

                        var unm5 = voterWithinIsochrone.features.reduce(function(accumulator, feature) {
                            return accumulator + feature.properties.UNM_VOTES;
                        }, 0);

                        var unm5estimate = voterWithinIsochrone.features.reduce(function(accumulator, feature) {
                            return accumulator + feature.properties.UNM_2_LEL;
                        }, 0);

                        var lelo9 = voterWithinIsochrone.features.reduce(function(accumulator, feature) {
                            return accumulator + feature.properties.LELO_VOTES;
                        }, 0);

                        var lelo9estimate = voterWithinIsochrone.features.reduce(function(accumulator, feature) {
                            return accumulator + feature.properties.LELO_2_LEL;
                        }, 0);

                        var gakharia25 = voterWithinIsochrone.features.reduce(function(accumulator, feature) {
                            return accumulator + feature.properties.GAKH_VOTES;
                        }, 0);

                        var gakharia25estimate = voterWithinIsochrone.features.reduce(function(accumulator, feature) {
                            return accumulator + feature.properties.GAKH_2_GAk;
                        }, 0);

                        var girchi36 = voterWithinIsochrone.features.reduce(function(accumulator, feature) {
                            return accumulator + feature.properties.GIRC_VOTES;
                        }, 0);

                        var otherparties = voterWithinIsochrone.features.reduce(function(accumulator, feature) {
                            return accumulator + feature.properties.OTH_VOTES;
                        }, 0);

                            // Shannon Diversity Index Calculation
                        var voteTotals = {
                            qocebi41: qocebi41,
                            koalicia4: koalicia4,
                            lelo9: lelo9,
                            gakharia25: gakharia25,
                            unm5: unm5,
                            girchi36: girchi36,
                            otherparties: otherparties
                        };

                        function calculateShannonIndex(voteTotals) {
                            var voteArray = Object.values(voteTotals);
                            var totalVotes = voteArray.reduce((sum, val) => sum + val, 0);
                            if (totalVotes === 0) return 0;

                            var H = 0;
                            voteArray.forEach(function (votes) {
                                if (votes > 0) {
                                    var p = votes / totalVotes;
                                    H -= p * Math.log2(p);
                                }
                            });
                            return H.toFixed(3);
                        }

                        function getDiversityColor(index) {
                            if (index >= 2.5) {
                                return { label: "მაღალი", backgroundColor: "green", fontColor: "white" };
                            } else if (index >= 2) {
                                return { label: "საშუალო", backgroundColor: "orange", fontColor: "white" };
                            } else {
                                return { label: "დაბალი", backgroundColor: "red", fontColor: "white" };
                            }
                        }

                        var qocebi41Percentage = ((qocebi41 / voterSum) * 100).toFixed(1);
                        var koalicia4Percentage = ((koalicia4 / voterSum) * 100).toFixed(1);
                        var unm5Percentage = ((unm5 / voterSum) * 100).toFixed(1);
                        var lelo9Percentage = ((lelo9 / voterSum) * 100).toFixed(1);
                        var gakharia25Percentage = ((gakharia25 / voterSum) * 100).toFixed(1);
                        var girchi36Percentage = ((girchi36 / voterSum) * 100).toFixed(1);
                        var otherpartiesPercentage = ((otherparties / voterSum) * 100).toFixed(1);

                        // estimating lelo potential votes in 2025 municipal elections based on 2024 votes
                        var lelo9estimatetotal = lelo9estimate + unm5estimate + koalicia4estimate;
                        var lelo9estimatePercentage = ((lelo9estimatetotal / voterSum) * 100).toFixed(1);
                        //var lelo9Difference = (lelo9estimatePercentage - lelo9Percentage).toFixed(1);
                        var lelo9Difference = (((lelo9estimatePercentage - lelo9Percentage) / lelo9Percentage) * 100).toFixed(1);


                        // Arrow and color logic
                        var lelo9Arrow = "";
                        var lelo9DiffColor = "";

                        if (lelo9Difference > 0) {
                        lelo9Arrow = "🔼";
                        lelo9DiffColor = "green";
                        } else if (lelo9Difference < 0) {
                        lelo9Arrow = "🔽";
                        lelo9DiffColor = "red";
                        } else {
                        lelo9Arrow = "";
                        lelo9DiffColor = "gray";
                        }

                        // estimating gakharia potential votes in 2025 municipal elections based on 2024 votes
                        var gakharia25estimatePercentage = ((gakharia25estimate / voterSum) * 100).toFixed(1);
                        var gakharia25Difference = (((gakharia25estimatePercentage - gakharia25Percentage) / gakharia25Percentage) * 100).toFixed(1);

                        // Arrow and color logic
                        var gakharia25Arrow = "";
                        var gakharia25DiffColor = "";

                        if (gakharia25Difference > 0) {
                        gakharia25Arrow = "🔼";
                        gakharia25DiffColor = "green";
                        } else if (gakharia25Difference < 0) {
                        gakharia25Arrow = "🔽";
                        gakharia25DiffColor = "red";
                        } else {
                        gakharia25Arrow = "";
                        gakharia25DiffColor = "gray";
                        }

                        updateVoterLegend(voterSum, menSum, womenSum, menPercentage, womenPercentage,
                            qocebi41, koalicia4, unm5, lelo9, gakharia25, girchi36, otherparties, 
                            qocebi41Percentage, koalicia4Percentage, unm5Percentage, lelo9Percentage, gakharia25Percentage, girchi36Percentage, otherpartiesPercentage,
                            lelo9estimatetotal, lelo9estimatePercentage, lelo9Difference, 
                            gakharia25estimatePercentage, gakharia25Difference
                        );
                    } else {
                        updateVoterLegend(voterSum, menSum, womenSum, menPercentage, womenPercentage);
                    }
    
                    // Function to Update Legend with voter Sum
                    function updateVoterLegend(voterSum, menSum, womenSum, menPercentage, womenPercentage, qocebi41 = null, koalicia4 = null, unm5 = null, lelo9 = null, gakharia25 = null, girchi36 = null, otherparties = null, qocebi41Percentage = null, koalicia4Percentage = null, unm5Percentage = null, lelo9Percentage = null, gakharia25Percentage = null, girchi36Percentage = null, otherpartiesPercentage = null) {
    
                        // Find the legend element by its ID
                        var pielegend = document.getElementById("pielegend");
    
                        // Find the legend element by its ID
                        var legend = document.getElementById("legend");

                        // Clear the legend before updating it with new items
                        pielegend.innerHTML = "<div id='genderPieChart'><p class='piecharttitle'><strong><span class='innerhtml'> ამომრჩევლები <br></strong></span>" + "<span class='innerhtml' style='color:#969696; font-size: 22px;'>" + voterSum + "</span></p></div>";
    
                        // Update the legend with the voter sum
                        var shannonIndex = parseFloat(calculateShannonIndex(voteTotals));
                        var diversityColor = getDiversityColor(shannonIndex);

                        legend.innerHTML +=
                        "<p><strong><span class='innerhtml' style='font-size: 16px;'>ურბანული პოლიტიკური მრავალფეროვნება</span></strong></p>" +
                        "<p><span class='innerhtml' style='padding: 5px; font-size: 18px; border-radius: 3px; color: white; background-color: " +
                        diversityColor.backgroundColor + ";'>" +
                        shannonIndex.toFixed(2) + "</span>" + " (" + diversityColor.label + ")</span></p>";

                        if (qocebi41 !== null && koalicia4 !== null && unm5 !== null && lelo9 !== null && gakharia25 !== null && girchi36 !== null && otherparties !== null && qocebi41Percentage !== null && koalicia4Percentage !== null && unm5Percentage !== null && lelo9Percentage !== null && gakharia25Percentage !== null && girchi36Percentage !==null && otherpartiesPercentage !== null) {
    
                            pielegend.innerHTML +=
                            
                            // ქოცების დედისტყვნა
                            "<p style='display: flex; align-items: center; gap: 5px;'>" +
                            "<img class='img-text' src='https://raw.githubusercontent.com/axis-Z/urbanyxv1/main/img/ქოცნება.png' alt='lelo' style='width: 25%; height: auto;'>" +
                            "<span>" +
                                "<span class='innerhtml' style='color:#666666; font-size: 15px;'>2024" + 
                                "<span class='innerhtml' style='color:#969696; font-size: 15px;'> " + qocebi41 + " (" + qocebi41Percentage + " %)</span><br>" +
                            "</span>" +
                            "</p>" +

                            // კოალიცია ცვლილებებისთვის - გვარამია, ჯაფარიძე, დროა, ნიკა მელია
                            "<p style='display: flex; align-items: center; gap: 5px;'>" +
                            "<img class='img-text' src='https://raw.githubusercontent.com/axis-Z/urbanyxv1/main/img/კოალიცია.png' alt='lelo' style='width: 25%; height: auto;'>" +
                            "<span>" +
                                "<span class='innerhtml' style='color:#666666; font-size: 15px;'>2024" + 
                                "<span class='innerhtml' style='color:#969696; font-size: 15px;'> " + koalicia4 + " (" + koalicia4Percentage + " %)</span><br>" +
                                //"<span class='innerhtml' style='color:#666666; font-size: 15px;'>2025" + 
                                //"<span class='innerhtml' style='color:#ff0000; font-size: 15px;'> ბოიკოტი"  + "</span>" +
                                "</span>" +
                            "</span>" +
                            
                            // ყლელო
                            "</p>" +
                            "<p style='display: flex; align-items: center; gap: 5px;'>" +
                            "<img class='img-text' src='https://raw.githubusercontent.com/axis-Z/urbanyxv1/main/img/ყლელო.png' alt='lelo' style='width: 25%; height: auto;'>" +
                            "<span>" +
                                "<span class='innerhtml' style='color:#666666; font-size: 15px;'>2024" + 
                                "<span class='innerhtml' style='color:#969696; font-size: 15px;'> " + lelo9 + " (" + lelo9Percentage + " %)</span><br>" +
                                "<span class='innerhtml' style='color:#666666; font-size: 15px;'>2025" + 
                                "<span class='innerhtml' style='color:#969696; font-size: 15px;'> " + lelo9estimatetotal + " (" + lelo9estimatePercentage + " %)</span><br>" +
                                "<span style='color:" + lelo9DiffColor + "; font-weight: bold;'> " + lelo9Arrow + " " + Math.abs(lelo9Difference) + "%</span>" +
                                "</span>" +
                            "</span>" +
                            "</p>" +

                            // თვალთხარია
                            "<p style='display: flex; align-items: center; gap: 5px;'>" +
                            "<img class='img-text' src='https://raw.githubusercontent.com/axis-Z/urbanyxv1/main/img/თვალთხარია.png' alt='lelo' style='width: 25%; height: auto;'>" +
                            "<span>" +
                                "<span class='innerhtml' style='color:#666666; font-size: 15px;'>2024" + 
                                "<span class='innerhtml' style='color:#969696; font-size: 15px;'> " + gakharia25 + " (" + gakharia25Percentage + " %)</span><br>" +
                                "<span class='innerhtml' style='color:#666666; font-size: 15px;'>2025" + 
                                "<span class='innerhtml' style='color:#969696; font-size: 15px;'> " + gakharia25estimate + " (" + gakharia25estimatePercentage + " %)</span><br>" +
                                "<span style='color:" + gakharia25DiffColor + "; font-weight: bold;'> " + gakharia25Arrow + " " + Math.abs(gakharia25Difference) + "%</span>" +
                                "</span>" +
                            "</span>" +
                            "</p>" +

                            // ენმ
                            "<p style='display: flex; align-items: center; gap: 5px;'>" +
                            "<img class='img-text' src='https://raw.githubusercontent.com/axis-Z/urbanyxv1/main/img/ენმ.png' alt='lelo' style='width: 25%; height: auto;'>" +
                            "<span>" +
                                "<span class='innerhtml' style='color:#666666; font-size: 15px;'>2024" + 
                                "<span class='innerhtml' style='color:#969696; font-size: 15px;'> " + unm5 + " (" + unm5Percentage + " %)</span><br>" +
                                //"<span class='innerhtml' style='color:#666666; font-size: 15px;'>2025" + 
                                //"<span class='innerhtml' style='color:#ff0000; font-size: 15px;'> ბოიკოტი"  + "</span>" +
                                "</span>" +
                            "</span>" +
                            "</p>" +

                            // გირჩი 36
                            "<p style='display: flex; align-items: center; gap: 5px;'>" +
                            "<img class='img-text' src='https://raw.githubusercontent.com/axis-Z/urbanyxv1/main/img/გირჩი.png' alt='lelo' style='width: 25%; height: auto;'>" +
                            "<span>" +
                                "<span class='innerhtml' style='color:#666666; font-size: 15px;'>2024" + 
                                "<span class='innerhtml' style='color:#969696; font-size: 15px;'> " + girchi36 + " (" + girchi36Percentage + " %)</span><br>" +
                            "</span>" +
                            "</p>" +

                            // სხვა პარტიები
                            "<p style='display: flex; align-items: center; gap: 5px;'>" +
                            "<img class='img-text' src='https://raw.githubusercontent.com/axis-Z/urbanyxv1/main/img/სხვა.png' alt='lelo' style='width: 25%; height: auto;'>" +
                            "<span>" +
                                "<span class='innerhtml' style='color:#666666; font-size: 15px;'>2024" + 
                                "<span class='innerhtml' style='color:#969696; font-size: 15px;'> " + otherparties + " (" + otherpartiesPercentage + " %)</span><br>" +
                            "</span>" +
                            "</p>";
                        }
    
                        // Data source for the pie chart including percentages
                        var genderData = [ 
                            { x: 'ქალს ქალი ჰქვია', y: womenSum, text: + womenSum + ' (' + womenPercentage + '%)',  fill: '#fdb462'  },
                            { x: 'და კაცს კაცი', y: menSum, text: + menSum + ' (' + menPercentage + '%)', fill: '#8dd3c7' }
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

                        // Function to Update Legend with Average Relative Wealth Index                
                        function updateRelativeWealthLegend(averageRelativeWealth) {

                            // Find the legend element by its ID
                            var legend = document.getElementById("legend");

                            // Function to determine color based on value
                            function getColorForWealthIndex(value) {

                                // Define color thresholds for upload speed
                                if (value >= 1) {
                                    return { backgroundColor: 'green', fontColor: '#ffffff' };
                                } else if (value >= 0.75) {
                                    return { backgroundColor: 'orange', fontColor: '#ffffff' };
                                } else {
                                    return { backgroundColor: 'red', fontColor: '#ffffff' };
                                }
                            }

                            // Append a new legend item for the average relative wealth index
                            legend.innerHTML += "<p>" + "<strong><span class='innerhtml' style='font-size: 16px;'>სიმდიდრის ინდექსი</strong></p>" + "<p>" + "<span class='innerhtml' style='padding: 5px; font-size: 18px; border-radius: 3px; color:" + getColorForWealthIndex(averageRelativeWealth).fontColor +"; background-color:" + getColorForWealthIndex(averageRelativeWealth).backgroundColor + ";'>" + averageRelativeWealth.toFixed(2) + "</p>";    
                        }
                        });

                        // Mapping between data source values and display names
                        var dataSourceDisplayNames = {
                            "demography": " test",
                        };

                        // Fetch point features from selected data source
                        var selectedDataSource = document.getElementById("data_source").value;
                        var dataUrl;
                        if (selectedDataSource === "voters") {
                            dataUrl = "https://raw.githubusercontent.com/axis-Z/urbanyxv1/main/data/elections_2024.geojson";
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
                                    //var selectedDataSourceDisplayName = dataSourceDisplayNames[selectedDataSource];

                                    // Update legend title based on selected data source
                                    var legendTitle = document.getElementById("legend-title");

                                    var profileLabels = {
                                        "walking": "ფეხით",
                                        "cycling": "ველოსიპედით",
                                        "driving": "ავტომობილით"
                                      };
                                      
                                    var profileGeoLabel = profileLabels[profile] || profile; // fallback to original if no match
                                    
                                    if (selectedDataSource === "voters") {
                                        legendTitle.innerHTML = "<p>" + "<strong> <span class='innerhtml' style='color: yellow; background-color: black; padding: 2px 4px; border-radius: 3px;'>" + totalCount + "</strong></span>" + " საარჩევნო უბანი" + "<strong> <span class='innerhtml' style='color: yellow; background-color: black; padding: 2px 4px; border-radius: 3px;'>" + contours_minutes + "-წუთიან " + profileGeoLabel + "</span></strong> სავალ მანძილზე</p>";
                                    }
                                
                                    // Clear the legend before updating it with new items
                                    var legend = document.getElementById("legend");
                                    legend.innerHTML="";
                                   
                                                    
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
                                "fill-opacity": 0.15,
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
                                "line-width": 1,
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