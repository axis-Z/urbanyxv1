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
                var heating = hoveredFeature.properties.heating || 'N/A';
                var gasHeating = hoveredFeature.properties.gas_heating || 'N/A';
                var woodHeating = hoveredFeature.properties.wood_heating || 'N/A';

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
                        return 'rgba(0, 0, 0, 0)'; // white or any default color you prefer
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
                        return 'rgba(0, 0, 0, 0)'; // white or any default color you prefer
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
                        return 'rgba(255, 255, 255, .8)'; // white or any default color you prefer
                    }
                } 

                // Get the appropriate background color for the value
                var StudentsPrcBackgroundColor = getStudentsPrcBackgroundColor(studentsPrc);
                var WindowsBackgroundColor = getWindowsBackgroundColor(windows);
                var GasHeatingBackgroundColor = getGasHeatingBackgroundColor(gasHeating);
                var WoodHeatingBackgroundColor = getWoodHeatingBackgroundColor(gasHeating);


                tooltipContent = 

                '<h3 style="text-align: center;">' + schoolName + '</h3>' + 
                '<p><strong>Construction Year:</strong> ' + constrDate + '</p>' + 
                '<p><strong>Assessment Date:</strong> ' + assessmentDate + '</p>' + 
                '<p><strong>Number of Students:</strong> ' + students + '</p>' + 
                '<p><strong>Capacity Used:</strong> <span style="background-color:' + StudentsPrcBackgroundColor + '; padding: 2px 4px; border-radius: 3px;">' + studentsPrc + '%</span></p>' + 
                '<p><strong>Water System:</strong> ' + waterSystem + '</p>' +  
                '<p><strong>Windows Condition:</strong> <span style="background-color:' + WindowsBackgroundColor + '; padding: 2px 4px; border-radius: 3px;">' + windows + '</span></p>' +
                '<p><strong>Heating System:</strong> ' + heating + '</p>' + 
                '<p><strong>Nat. Gas Heating Condition:</strong> <span style="background-color:' + GasHeatingBackgroundColor + '; padding: 2px 4px; border-radius: 3px;">' + gasHeating + '</span></p>' + 
                '<p><strong>Wood Heating Condition:</strong> <span style="background-color:' + WoodHeatingBackgroundColor + '; padding: 2px 4px; border-radius: 3px;">' + woodHeating + '</span></p>'
                ;
                
        
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
