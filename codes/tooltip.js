map.on('mousemove', 'featuresWithinIsochrone-layer', function (e) {
    var features = e.features;

    // Check selected data source        
    var selectedDataSource = document.getElementById("data_source").value;

    // Check if tooltip should be hidden
    if (selectedDataSource === "demography") {
        hideTooltip();
        return;
    }
    
    // Check if there is a feature under the mouse pointer
    if (features.length > 0) {
        var hoveredFeature = features[0];    
    
        // Populate tooltip with information from the hovered feature        
        var tooltipContent = '';

        // Check if the hovered feature belongs to the car-crashes dataset
        if (hoveredFeature.properties.hasOwnProperty('amenity') && (hoveredFeature.properties.amenity === 'soft' || hoveredFeature.properties.amenity === 'injury')) {
            var date = hoveredFeature.properties.date || 'N/A';
            var amenity = hoveredFeature.properties.amenity || 'N/A';
            tooltipContent = '<p><strong>Date:</strong> ' + date + '</p>' +
            '<p><strong>Crash Severity:</strong> ' + amenity + '</p>';

        } else if (hoveredFeature.properties.hasOwnProperty('amenity') && (hoveredFeature.properties.amenity === 'GSM (2G)' || hoveredFeature.properties.amenity === 'UMTS (3G)' || hoveredFeature.properties.amenity === 'LTE (4G)')) {
            var amenity = hoveredFeature.properties.amenity || 'N/A';
            var range = hoveredFeature.properties.range || 'N/A';
            tooltipContent = '<p><strong>Technology:</strong> ' + amenity + '</p>' +
            '<p><strong>Range (m):</strong> ' + range + '</p>';

        } else if (hoveredFeature.properties.hasOwnProperty('amenity') && (hoveredFeature.properties.amenity === 'Fair' || hoveredFeature.properties.amenity === 'Good' || hoveredFeature.properties.amenity === 'Bad' || hoveredFeature.properties.amenity === 'Replacement')) {
                var schoolName = hoveredFeature.properties.school_name || 'N/A';
                var constrDate = hoveredFeature.properties.constr_year || 'N/A';
                var assessmentDate = hoveredFeature.properties['Assessment date'] || 'N/A';
                var students = hoveredFeature.properties.students || 'N/A';
                var studentsPrc = hoveredFeature.properties.capacity || 'N/A';
                var windows = hoveredFeature.properties.windows || 'N/A';
                var waterSystem = hoveredFeature.properties.water || 'N/A';
                var wc = hoveredFeature.properties.wc || 'N/A';
                var heating = hoveredFeature.properties.heating || 'N/A';
                var gasHeating = hoveredFeature.properties.gas_heating || 'N/A';
                var woodHeating = hoveredFeature.properties.wood_heating || 'N/A';
                var ramp = hoveredFeature.properties.ramp || 'N/A';
                var internet = hoveredFeature.properties.internet || 'N/A';
                var wifi = hoveredFeature.properties.wifi || 'N/A';
                var cellNet = hoveredFeature.properties.cell_net || 'N/A';
                var sports = hoveredFeature.properties.sport_facility || 'N/A';
                var greenArea = hoveredFeature.properties.green_open_area || 'N/A';
                var shortInvest = hoveredFeature.properties.urgent_cost || 'N/A';
                var mediumInvest = hoveredFeature.properties.non_urg_cost || 'N/A';
                var longInvest = hoveredFeature.properties.long_cost || 'N/A';
                var totalInvest = shortInvest + mediumInvest + longInvest;


                // Define the function to determine the background color based on the studentPrc value

                function getStudentsPrcBackgroundColor(studentsPrc) {
                    if (studentsPrc < 30) {
                        return '#d7191c'; // red
                    } else if (studentsPrc >= 30 && studentsPrc < 75) {
                        return '#a6d96a'; // green
                    } else if (studentsPrc >= 75 && studentsPrc < 100) {
                        return '#fdae61'; // orange
                    } else {
                        return '#d7191c'; // red
                    }
                }

                function getWindowsBackgroundColor(windows) {
                    // Define a mapping of string values to colors
                    const colorMapWindows = {
                        "Fair": '#a6d96a', // light green
                        "Good": '#1a9641', // green
                        "Bad": '#f4a582', // orange
                        "Damaged": '#d7191c' // red
                    };
                
                    // Check if the status is in the colorMap
                    if (windows in colorMapWindows) {
                        return colorMapWindows[windows];
                    } else {
                        // Default color if the status is not recognized
                        return 'rgba(255, 255, 255, .45)'; // white or any default color you prefer
                    }
                }

                function getWCBackgroundColor(wc) {
                    // Define a mapping of string values to colors
                    const colorMapWC = {
                        "Fair": '#a6d96a', // light green
                        "Good": '#1a9641', // green
                        "Bad": '#f4a582', // orange
                        "Replacement": '#d7191c' // red
                    };
                
                    // Check if the status is in the colorMap
                    if (wc in colorMapWC) {
                        return colorMapWC[wc];
                    } else {
                        // Default color if the status is not recognized
                        return 'rgba(255, 255, 255, .45)'; // white or any default color you prefer
                    }
                }
                
                function getGasHeatingBackgroundColor(gasHeating) {
                    // Define a mapping of string values to colors
                    const colorMapGas = {
                        "Fair": '#a6d96a', // light green
                        "Good": '#1a9641', // green
                        "Bad": '#f4a582', // orange
                        "Damaged": '#d7191c' // red
                    };
                
                    // Check if the status is in the colorMap
                    if (gasHeating in colorMapGas) {
                        return colorMapGas[gasHeating];
                    } else {
                        // Default color if the status is not recognized
                        return 'rgba(255, 255, 255, .45)'; // white or any default color you prefer
                    }
                } 

                function getWoodHeatingBackgroundColor(woodHeating) {
                    // Define a mapping of string values to colors
                    const colorMapWood = {
                        "Fair": '#a6d96a', // light green
                        "Good": '#1a9641', // green
                        "Bad": '#f4a582', // orange
                        "Damaged": '#d7191c', // red
                    };
                
                    // Check if the status is in the colorMap
                    if (woodHeating in colorMapWood) {
                        return colorMapWood[woodHeating];
                    } else {
                        // Default color if the status is not recognized
                        return 'rgba(255, 255, 255, .45)'; // white or any default color you prefer
                    }
                } 

                function getRampBackgroundColor(ramp) {
                    // Define a mapping of string values to colors
                    const colorMapRamp = {
                        "Fair": '#a6d96a', // light green
                        "Good": '#1a9641', // green
                        "Bad": '#f4a582', // orange
                        "Does not exist": '#d7191c', // red
                    };
                
                    // Check if the status is in the colorMap
                    if (ramp in colorMapRamp) {
                        return colorMapRamp[ramp];
                    } else {
                        // Default color if the status is not recognized
                        return 'rgba(255, 255, 255, .45)'; // white or any default color you prefer
                    }
                } 

                function getInternetBackgroundColor(internet) {
                    // Define a mapping of string values to colors
                    const colorMapInternet = {
                        "Fair": '#a6d96a', // light green
                        "Good": '#1a9641', // green
                        "Bad": '#f4a582', // orange
                        "Does not exist": '#d7191c', // red
                    };
                
                    // Check if the status is in the colorMap
                    if (internet in colorMapInternet) {
                        return colorMapInternet[internet];
                    } else {
                        // Default color if the status is not recognized
                        return 'rgba(255, 255, 255, .45)'; // white or any default color you prefer
                    }
                } 

                function getWIFIBackgroundColor(wifi) {
                    // Define a mapping of string values to colors
                    const colorMapWifi = {
                        "Fair": '#a6d96a', // light green
                        "Good": '#1a9641', // green
                        "Bad": '#f4a582', // orange
                        "Does not exist": '#d7191c', // red
                    };
                
                    // Check if the status is in the colorMap
                    if (wifi in colorMapWifi) {
                        return colorMapWifi[wifi];
                    } else {
                        // Default color if the status is not recognized
                        return 'rgba(255, 255, 255, .45)'; // white or any default color you prefer
                    }
                }

                function getCellBackgroundColor(cellNet) {
                    // Define a mapping of string values to colors
                    const colorMapCell = {
                        "Fair": '#a6d96a', // light green
                        "Good": '#1a9641', // green
                        "Bad": '#f4a582', // orange
                        "Does not exist": '#d7191c', // red
                    };
                
                    // Check if the status is in the colorMap
                    if (cellNet in colorMapCell) {
                        return colorMapCell[cellNet];
                    } else {
                        // Default color if the status is not recognized
                        return 'rgba(255, 255, 255, .45)'; // white or any default color you prefer
                    }
                }

                function getSportsBackgroundColor(sports) {
                    // Define a mapping of string values to colors
                    const colorMapSports = {
                        "Fair": '#a6d96a', // light green
                        "Good": '#1a9641', // green
                        "Bad": '#f4a582', // orange
                        "Needs repair": '#fc8d59',
                        "Does not exist": '#d7191c', // red
                    };
                
                    // Check if the status is in the colorMap
                    if (sports in colorMapSports) {
                        return colorMapSports[sports];
                    } else {
                        // Default color if the status is not recognized
                        return 'rgba(255, 255, 255, .45)'; // white or any default color you prefer
                    }
                }

                function getGreenAreaBackgroundColor(greenArea) {
                    // Define a mapping of string values to colors
                    const colorMapGreenArea = {
                        "Fair": '#a6d96a', // light green
                        "Good": '#1a9641', // green
                        "Bad": '#f4a582', // orange
                        "Needs repair": '#fc8d59',
                        "Does not exist": '#d7191c', // red
                    };
                
                    // Check if the status is in the colorMap
                    if (greenArea in colorMapGreenArea) {
                        return colorMapGreenArea[greenArea];
                    } else {
                        // Default color if the status is not recognized
                        return 'rgba(255, 255, 255, .45)'; // white or any default color you prefer
                    }
                }

                // Get the appropriate background color for the value
                var StudentsPrcBackgroundColor = getStudentsPrcBackgroundColor(studentsPrc);
                var WindowsBackgroundColor = getWindowsBackgroundColor(windows);
                var WCBackgroundColor = getWCBackgroundColor(wc);
                var GasHeatingBackgroundColor = getGasHeatingBackgroundColor(gasHeating);
                var WoodHeatingBackgroundColor = getWoodHeatingBackgroundColor(woodHeating);
                var RampBackgroundColor = getRampBackgroundColor(ramp);
                var InternetBackgroundColor = getInternetBackgroundColor(internet);
                var WIFIBackgroundColor = getWIFIBackgroundColor(wifi);
                var CellBackgroundColor = getCellBackgroundColor(cellNet);
                var SportsBackgroundColor = getSportsBackgroundColor(sports);
                var GreenAreaBackgroundColor = getGreenAreaBackgroundColor(greenArea);


                tooltipContent = 

                '<h3 style="text-align: center;">' + schoolName + '</h3>' + 
                '<p><strong>Construction Year:</strong> ' + constrDate + '</p>' + 
                '<p><strong>Assessment Date:</strong> ' + assessmentDate + '</p>' + 
                '<p><strong>Number of Students:</strong> ' + students + '</p>' + 
                '<p><strong>School Occupancy Rate:</strong> <span style="background-color:' + StudentsPrcBackgroundColor + '; padding: 2px 4px; border-radius: 3px;">' + studentsPrc + '%</span></p>' + 
                //'<p><strong>Water System:</strong> ' + waterSystem + '</p>' +  
                //'<p><strong>Windows Condition:</strong> <span style="background-color:' + WindowsBackgroundColor + '; padding: 2px 4px; border-radius: 3px;">' + windows + '</span></p>' +
                //'<p><strong>WC:</strong> <span style="background-color:' + WCBackgroundColor + '; padding: 2px 4px; border-radius: 3px;">' + wc + '</span></p>' +
                '<p><strong>Heating System:</strong> ' + heating + '</p>' + 
                //'<p><strong>Nat. Gas Heating Condition:</strong> <span style="background-color:' + GasHeatingBackgroundColor + '; padding: 2px 4px; border-radius: 3px;">' + gasHeating + '</span></p>' + 
                //'<p><strong>Wood Heating Condition:</strong> <span style="background-color:' + WoodHeatingBackgroundColor + '; padding: 2px 4px; border-radius: 3px;">' + woodHeating + '</span></p>' +
                //'<p><strong>Ramp:</strong> <span style="background-color:' + RampBackgroundColor + '; padding: 2px 4px; border-radius: 3px;">' + ramp + '</span></p>' + 
                //'<p><strong>Internet (cable):</strong> <span style="background-color:' + InternetBackgroundColor + '; padding: 2px 4px; border-radius: 3px;">' + internet + '</span></p>' +
                //'<p><strong>Internet (cell):</strong> <span style="background-color:' + CellBackgroundColor + '; padding: 2px 4px; border-radius: 3px;">' + cellNet + '</span></p>' +
                '<p><strong>WiFi:</strong> <span style="background-color:' + WIFIBackgroundColor + '; padding: 2px 4px; border-radius: 3px;">' + wifi + '</span></p>' + 
                //'<p><strong>Sports Facilities</strong> <span style="background-color:' + SportsBackgroundColor + '; padding: 2px 4px; border-radius: 3px;">' + sports + '</span></p>' + 
                //'<p><strong>Green & Open Area</strong> <span style="background-color:' + GreenAreaBackgroundColor + '; padding: 2px 4px; border-radius: 3px;">' + greenArea + '</span></p>' +
                '<p style="font-size: 13px; text-align: center;"><strong>Infrastructure Repair Costs (₾)</strong></p>' + 
                '<p><strong>Short-term:</strong> ' + shortInvest + '</p>' +                 
                '<p><strong>Medium-term:</strong> ' + mediumInvest + '</p>' + 
                '<p><strong>Long-term:</strong> ' + longInvest + '</p>' + 
                '<h3 style="text-align: center;"><strong> Total Investment Needed (₾):</strong> ' + '<br>' + totalInvest + '</h3>';
                
        
            } else {

            var address = hoveredFeature.properties['addr:street'] || '';
            var housenumber = hoveredFeature.properties['addr:housenumber'] || '';
            var name = hoveredFeature.properties.name || 'N/A';
            var opening_hours = hoveredFeature.properties.opening_hours || 'N/A';
            var phone = hoveredFeature.properties.phone || 'N/A';
            var website = hoveredFeature.properties.website || 'N/A';
            var fullAddress = (address || housenumber) ? ((address || '') + ' ' + (housenumber || '')) : 'N/A';

            tooltipContent = '<h3 style="text-align: center;">' + name + '</h3>' +
            '<p><strong>Address:</strong> ' + fullAddress + '</p>' + 
            '<p><strong>Opening Hours:</strong> ' + opening_hours + '</p>' + 
            '<p><strong>Contact:</strong> ' + phone + '</p>' + 
            '<p><strong>Web:</strong> ' + website + '</p>';
        }

        // Update tooltip content
        var tooltip = document.getElementById('tooltip');
        tooltip.innerHTML = tooltipContent;

        // Calculate the position of the tooltip above the mouse pointer
        var tooltipWidth = tooltip.offsetWidth;
        var tooltipHeight = tooltip.offsetHeight;
        var mapContainer = document.getElementById('map');
        var mapRect = mapContainer.getBoundingClientRect();
        var offsetX = e.originalEvent.clientX - mapRect.left;
        var offsetY = e.originalEvent.clientY - mapRect.top;
        var tooltipLeft = offsetX - tooltipWidth / 2;
        var tooltipTop = offsetY - tooltipHeight - 10; // Adjust as needed

        // Set the position of the tooltip
        tooltip.style.display = 'block';
        tooltip.style.left = tooltipLeft + 'px';
        tooltip.style.top = tooltipTop + 'px';
    } else {
        
        // Hide tooltip if no feature is under the mouse pointer
        var tooltip = document.getElementById('tooltip');
        tooltip.style.display = 'none';
    }
});

// Hide tooltip on mouseout
map.on('mouseout', 'featuresWithinIsochrone-layer', function () {
    var tooltip = document.getElementById('tooltip');
    tooltip.style.display = 'none';
});
