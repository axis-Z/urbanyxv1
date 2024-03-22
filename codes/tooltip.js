map.on('mousemove', 'featuresWithinIsochrone-layer', function (e) {
    var features = e.features;

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
        } else {
            var address = hoveredFeature.properties['addr:street'] || '';
            var housenumber = hoveredFeature.properties['addr:housenumber'] || '';
            var name = hoveredFeature.properties.name || 'N/A';
            var opening_hours = hoveredFeature.properties.opening_hours || 'N/A';
            var phone = hoveredFeature.properties.phone || 'N/A';
            var website = hoveredFeature.properties.website || 'N/A';
            var fullAddress = (address || housenumber) ? ((address || '') + ' ' + (housenumber || '')) : 'N/A';

            tooltipContent = '<h3>' + name + '</h3>' +
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
