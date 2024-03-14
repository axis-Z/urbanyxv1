map.on('mousemove', 'featuresWithinIsochrone-layer', function (e) {
    var features = e.features;
    var tooltip = document.getElementById('tooltip');

    if (features.length > 0) {
        var hoveredFeature = features[0];
        var properties = hoveredFeature.properties;

        var address = hoveredFeature.properties['addr:street'] || '';
        var housenumber = hoveredFeature.properties['addr:housenumber'] || '';
        var name = (hoveredFeature.properties.hasOwnProperty('name') && hoveredFeature.properties.name !== null) ? hoveredFeature.properties.name : 'N/A';
        var opening_hours = (hoveredFeature.properties.hasOwnProperty('opening_hours') && hoveredFeature.properties.opening_hours !== null) ? hoveredFeature.properties.opening_hours : 'N/A';
        var phone = (hoveredFeature.properties.hasOwnProperty('phone') && hoveredFeature.properties.phone !== null) ? hoveredFeature.properties.phone : 'N/A';
        var website = (hoveredFeature.properties.hasOwnProperty('website') && hoveredFeature.properties.webiste !== null) ? hoveredFeature.properties.website : 'N/A';
        var fullAddress = (address || housenumber) ? ((address || '') + ' ' + (housenumber || '')) : 'N/A';
        var tooltipContent = '<h3>' + name + '</h3>' +
                             '<p><strong>Address:</strong> ' + fullAddress + '</p>';

        // Check if the feature is a bank, atm, or payment_terminal
        if (properties.hasOwnProperty('amenity')) {
            var amenity = properties.amenity;

            if (['bank', 'atm', 'payment_terminal'].includes(amenity)) {
                // Include brand for banks, atm, and payment_terminal
                var brand = (properties.hasOwnProperty('brand') && properties.brand !== null) ? properties.brand : 'N/A';
                tooltipContent += '<p><strong>Brand:</strong> ' + brand + '</p>';
                
                // For banks, include additional information
                if (amenity === 'bank') {
                    var opening_hours = (properties.hasOwnProperty('opening_hours') && properties.opening_hours !== null) ? properties.opening_hours : 'N/A';
                    var phone = (properties.hasOwnProperty('phone') && properties.phone !== null) ? properties.phone : 'N/A';
                    var website = (properties.hasOwnProperty('website') && properties.website !== null) ? properties.website : 'N/A';

                    tooltipContent += '<p><strong>Opening Hours:</strong> ' + opening_hours + '</p>' + 
                                      '<p><strong>Contact:</strong> ' + phone + '</p>' + 
                                      '<p><strong>Web:</strong> ' + website + '</p>';
                }
            } else if (['cafe', 'restaurant', 'bar', 'clinic', 'dentist', 'hospital', 'pharmacy', 'veterinary'].includes(amenity)) {
                // Include all attributes except brand for cafes, restaurants, bars, and clinics
                var opening_hours = (properties.hasOwnProperty('opening_hours') && properties.opening_hours !== null) ? properties.opening_hours : 'N/A';
                var phone = (properties.hasOwnProperty('phone') && properties.phone !== null) ? properties.phone : 'N/A';
                var website = (properties.hasOwnProperty('website') && properties.website !== null) ? properties.website : 'N/A';

                tooltipContent += '<p><strong>Opening Hours:</strong> ' + opening_hours + '</p>' + 
                                  '<p><strong>Contact:</strong> ' + phone + '</p>' + 
                                  '<p><strong>Web:</strong> ' + website + '</p>';
            }
        }

        tooltip.innerHTML = tooltipContent;

        // Calculate and set tooltip position
        var tooltipWidth = tooltip.offsetWidth;
        var tooltipHeight = tooltip.offsetHeight;
        var mapContainer = document.getElementById('map');
        var mapRect = mapContainer.getBoundingClientRect();
        var offsetX = e.originalEvent.clientX - mapRect.left;
        var offsetY = e.originalEvent.clientY - mapRect.top;
        var tooltipLeft = offsetX - tooltipWidth / 2;
        var tooltipTop = offsetY - tooltipHeight - 10; // Adjust as needed
        
        tooltip.style.display = 'block';
        tooltip.style.left = tooltipLeft + 'px';
        tooltip.style.top = tooltipTop + 'px';
    } else {
        tooltip.style.display = 'none';
    }
});

map.on('mouseout', 'featuresWithinIsochrone-layer', function () {
    var tooltip = document.getElementById('tooltip');
    tooltip.style.display = 'none';
});
