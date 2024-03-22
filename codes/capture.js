// Function to download the canvas image
      function downloadImage(containerId) {
        const mapElement = document.getElementById(containerId);
        const mapCanvas =
          mapElement.getElementsByClassName("mapboxgl-canvas")[0];
        // Delay capturing the canvas to ensure the map has rendered completely
        setTimeout(() => {
          const link = document.createElement("a");
          link.href = mapCanvas.toDataURL("image/png");
          link.download = containerId + ".png";
          link.click();
        }, 2000);
      }