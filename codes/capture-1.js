// Function to draw HTML content onto a canvas
function drawHTMLToCanvas(htmlContent, canvas) {
    return new Promise((resolve, reject) => {
        const ctx = canvas.getContext("2d");

        // Create an image element to hold the HTML content
        const img = new Image();
        img.onload = function () {
            // Draw the image onto the canvas
            ctx.drawImage(img, 0, 0);
            resolve();
        };
        img.onerror = function () {
            reject(new Error("Failed to load image."));
        };

        // Set the source of the image to the HTML content
        img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(htmlContent)));
    });
}

// Function to download the canvas image
function downloadImage(containerId) {
    console.log("Downloading image...");

    // Delay to ensure all elements are rendered completely
    setTimeout(() => {
        const mapContainer = document.getElementById(containerId);

        if (!mapContainer) {
            console.error("Map container element not found.");
            return;
        }

        // Get the bounding rectangle of the map container
        const containerRect = mapContainer.getBoundingClientRect();

        // Create a combined canvas to capture all elements
        const combinedCanvas = document.createElement("canvas");
        const context = combinedCanvas.getContext("2d");

        // Set canvas size to match the map container
        combinedCanvas.width = containerRect.width;
        combinedCanvas.height = containerRect.height;

        // Draw the map canvas onto the combined canvas
        const mapCanvas = mapContainer.querySelector(".mapboxgl-canvas");
        if (mapCanvas) {
            const mapContext = mapCanvas.getContext("2d");
            context.drawImage(mapCanvas, 0, 0);
        }

        // Draw other elements onto the combined canvas
        const legend = document.getElementById("legend");
        if (legend) {
            // Get the HTML content of the legend container
            const legendHTML = legend.innerHTML;

            // Create a temporary canvas to draw the legend content
            const legendCanvas = document.createElement("canvas");
            legendCanvas.width = legend.offsetWidth;
            legendCanvas.height = legend.offsetHeight;

            // Draw the HTML content onto the temporary canvas
            drawHTMLToCanvas(legendHTML, legendCanvas)
                .then(() => {
                    // Draw the temporary canvas onto the combined canvas
                    context.drawImage(legendCanvas, 0, containerRect.height - legend.offsetHeight);

                    // Trigger download of the combined canvas as an image
                    const link = document.createElement("a");
                    link.href = combinedCanvas.toDataURL("image/png");
                    link.download = containerId + ".png";
                    link.click();

                    console.log("Image download successful.");
                })
                .catch((error) => {
                    console.error("Failed to draw legend content:", error);
                });
        } else {
            console.warn("Legend container element not found.");
        }
    }, 2000); // Adjust delay as needed
}
