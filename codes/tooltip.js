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
                var assessmentDate = hoveredFeature.properties['Assessment date'] || 'N/A';
                var students = hoveredFeature.properties.students || 'N/A';
                var studentsPrc = hoveredFeature.properties.capacity || 'N/A';
                var range = hoveredFeature.properties.range || 'N/A';
                var range = hoveredFeature.properties.range || 'N/A';
                var range = hoveredFeature.properties.range || 'N/A';
                var range = hoveredFeature.properties.range || 'N/A';

                // Define the function to determine the background color based on the studentPrc value

                function getValueBackgroundColor(studentsPrc) {
                    if (studentsPrc < 50) {
                        return '#d4edda'; // Light green
                    } else if (studentsPrc >= 50 && studentsPrc < 75) {
                        return '#fff3cd'; // Light yellow
                    } else if (studentsPrc >= 75 && studentsPrc < 90) {
                        return '#ffeeba'; // Medium yellow
                    } else {
                        return '#f8d7da'; // Light red
                    }
                }

                // Get the appropriate background color for the value
                var valueBackgroundColor = getValueBackgroundColor(studentsPrc);

                tooltipContent = '<h3 style="text-align: center;">' + schoolName + '</h3>' + '<p><strong>Assessment Date:</strong> ' + assessmentDate + '</p>' +
                '<p><strong>Number of students:</strong> ' + students + '</p>' + '<p><strong>Capacity Used:</strong> <span style="background-color:' + valueBackgroundColor + '; padding: 2px 4px; border-radius: 3px;">' + studentsPrc + '%</span></p>';
        
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
