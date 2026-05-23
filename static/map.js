const map = L.map('map').setView([22.5726, 88.3639], 13); // default coordinates(Kolkata)

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);
function loadSavedResources() {
    fetch('/api/resources')
        .then(response => response.json())
        .then(resources => {
            resources.forEach(resource => {
                // Addsa permanent marker for each saved item
                L.marker([resource.latitude, resource.longitude])
                    .addTo(map)
                    .bindPopup(`<b>${resource.title}</b><br>${resource.description}`);
            });
        })
        .catch(error => console.error('Error loading map pins:', error));
}
loadSavedResources();


