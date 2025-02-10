export const showMap = (mp,locs) =>{
    let platform = new H.service.Platform({
        apikey: 'XKbhgCbQHkqt_O9E1PXL7wiiACVmg754AEm6l2F9Wdw' // Replace with your actual API key
    });

    let defaultLayers = platform.createDefaultLayers();

    // Create the map
    let map = new H.Map(
        mp,
        defaultLayers.vector.normal.map, // You can change map style
                // coordinates[lng, lat]
        {center: {lat: locs[0].coordinates[1], lng: locs[0].coordinates[0]}, zoom: 8}
    );
    locs.forEach(loc => {
        var marker = new H.map.Marker({ lat: loc.coordinates[1], lng: loc.coordinates[0] });
        map.addObject(marker);
    })
    // Enable interaction (zoom, pan)
    let behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));
    let ui = H.ui.UI.createDefault(map, defaultLayers);
}



