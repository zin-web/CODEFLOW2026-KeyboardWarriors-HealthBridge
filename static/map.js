const map = L.map('map-box').setView([22.5726, 88.3639], 13); //my default region is kolkata here

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

function updateDashboardStats(resources) {
    let total = resources.length;
    let camps = 0;
    let alerts = 0;
    let drives = 0;

    resources.forEach(resource => {
        const title = resource.title.toLowerCase();
        
        if (title.includes('camp') || resource.resource_type === 'camp') {
            camps++;
        } else if (title.includes('alert') || title.includes('emergency')) {
            alerts++;
        } else if (title.includes('drive') || title.includes('donation')) {
            drives++;
        }
    });

    document.getElementById('stat-total').innerText = total;
    document.getElementById('stat-camps').innerText = camps;
    document.getElementById('stat-alerts').innerText = alerts;
    document.getElementById('stat-drives').innerText = drives;
}

function loadSavedResources() {
    fetch('/api/resources')
        .then(response => response.json())
        .then(resources => {
            resources.forEach(resource => {
                L.marker([resource.lat, resource.lng])
                    .addTo(map)
                    .bindPopup(`<b>${resource.title}</b><br>${resource.description}`);
            });
            updateDashboardStats(resources);
        })
        .catch(error => console.error('Error loading map pins:', error));
}

loadSavedResources();


// map logic for saving pins
map.on('click', function(e) {
    const clickLat = e.latlng.lat;
    const clickLng = e.latlng.lng;

    const title = prompt("Enter Resource Title (e.g., Blood Donation Drive, Health Camp):");
    if (!title) return; 

    const description = prompt("Enter Description:");

    let resourceType = "other";
    if (title.toLowerCase().includes('camp')) resourceType = "camp";
    if (title.toLowerCase().includes('alert')) resourceType = "alert";
    if (title.toLowerCase().includes('drive')) resourceType = "drive";

    fetch('/api/resources', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            title: title,
            type: resourceType,   
            lat: clickLat,        
            lng: clickLng,        
            description: description
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(newResource => {
       
        L.marker([clickLat, clickLng])
            .addTo(map)
            .bindPopup(`<b>${title}</b><br>${description}`)
            .openPopup();
        
        console.log('Successfully saved to database:', newResource);
        loadSavedResources(); 
    })
    .catch(error => console.error('Error saving pin:', error));
});