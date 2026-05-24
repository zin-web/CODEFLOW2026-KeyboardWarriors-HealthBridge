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
        const rType = resource.type || resource.resource_type || "";
        
        if (title.includes('camp') || rType === 'camp') {
            camps++;
        } else if (title.includes('alert') || title.includes('emergency') || rType === 'alert') {
            alerts++;
        } else if (title.includes('drive') || title.includes('donation') || rType === 'drive') {
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
            map.eachLayer(layer => {
                if (layer instanceof L.Marker) {
                    map.removeLayer(layer);
                }
            });

            resources.forEach(resource => {
                L.marker([resource.lat, resource.lng])
                    .addTo(map)
                    .bindPopup(`<b>${resource.title}</b><br>${resource.description}`);
            });

     
            updateDashboardStats(resources);
            const newestFirst = [...resources].reverse();
            updateRecentEventsFeed(newestFirst);
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


        console.log('Successfully saved to database:', newResource);
       
        loadSavedResources(); 
    })
    .catch(error => console.error('Error saving pin:', error));
});

//recent feed upload logic 
function updateRecentEventsFeed(resources) {
    const feedContainer = document.getElementById('recent-events-feed');
    if (!feedContainer) return;

    feedContainer.innerHTML = '';

    if (resources.length === 0) {
        feedContainer.innerHTML = '<p class="empty-feed-text" style="color:#aaa; text-align:center; padding-top:20px;">[ No health events logged yet ]</p>';
        return;
    }

    const recentEvents = resources.slice(0, 4);

    recentEvents.forEach(event => {
        const eventCard = document.createElement('div');
        
        let emoji = '📍';
        let borderColor = '#007bff'; 
        
        const eType = event.type || event.resource_type || "";

        if (eType === 'camp') {
            emoji = '⛺ Health Camp';
            borderColor = '#28a745'; 
        } else if (eType === 'alert') {
            emoji = '⚠️ Emergency Alert';
            borderColor = '#dc3545'; 
        } else if (eType === 'drive') {
            emoji = '🩸 Donation Drive';
            borderColor = '#ffc107'; 
        }

        eventCard.innerHTML = `
            <div style="margin-bottom: 12px; padding: 12px; border-left: 5px solid ${borderColor}; background: #fdfdfd; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #888; font-weight: bold; margin-bottom: 4px;">
                    ${emoji}
                </div>
                <strong style="font-size: 15px; color: #333; display: block; margin-bottom: 2px;">${event.title}</strong>
                <p style="margin: 0; font-size: 13px; color: #666; line-height: 1.4;">${event.description || 'No description provided.'}</p>
            </div>
        `;
        feedContainer.appendChild(eventCard);
    });
}