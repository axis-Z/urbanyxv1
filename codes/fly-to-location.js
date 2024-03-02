// Function to fly to a specific location on the map
function flyToLocation(lon, lat, zoom) {
  map.flyTo({
    center: [lon, lat],
    zoom: zoom,
    essential: true, // this animation is considered essential with respect to prefers-reduced-motion
  });
}
// fly to specific cities on the map
document.getElementById("tbilisi").addEventListener("click", () => {
  // Fly to Location 1
  flyToLocation(44.8, 41.729, 11);
});

document.getElementById("batumi").addEventListener("click", () => {
  // Fly to Location 2
  flyToLocation(41.654, 41.651, 12.5);
});

document.getElementById("kutaisi").addEventListener("click", () => {
  // Fly to Location 3
  flyToLocation(42.693, 42.251, 12.5);
});

document.getElementById("zugdidi").addEventListener("click", () => {
  // Fly to Location 3
  flyToLocation(41.863, 42.51, 12.5);
  zoom: 13;
});

document.getElementById("gori").addEventListener("click", () => {
  // Fly to Location 3
  flyToLocation(44.114, 41.984, 13);
  zoom: 13;
});

document.getElementById("poti").addEventListener("click", () => {
  // Fly to Location 3
  flyToLocation(41.668, 42.14, 13.5);
  zoom: 13;
});

document.getElementById("sokhumi").addEventListener("click", () => {
  // Fly to Location 3
  flyToLocation(41.009, 43.001, 13.5);
  zoom: 13;
});

document.getElementById("akhaltsikhe").addEventListener("click", () => {
  // Fly to Location 3
  flyToLocation(42.991, 41.64, 13.5);
  zoom: 13;
});

map.on("load", () => {
  // When the map loads, do nothing
});