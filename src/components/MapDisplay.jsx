// MapDisplay.jsx (FINALIZED with Hotspot Logic)

import React, { useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// This component is crucial for getting the Leaflet instance
const MapControls = ({ mapRef, mapInstance }) => {
    const map = useMap();
    mapRef.current = map;
    mapInstance.current = map; 
    return null;
};

// --- Hotspot Styling and Rendering Logic ---
const getHotspotStyle = (riskLevel) => {
    switch (riskLevel) {
        case 'Extreme':
            return { color: '#ff0000', fillColor: '#ff0000', fillOpacity: 0.6, radius: 2000 };
        case 'High':
            return { color: '#ff8c00', fillColor: '#ff8c00', fillOpacity: 0.5, radius: 1500 };
        case 'Elevated':
            return { color: '#ffd700', fillColor: '#ffd700', fillOpacity: 0.4, radius: 1000 };
        default:
            return { color: '#00bfff', fillColor: '#00bfff', fillOpacity: 0.3, radius: 500 };
    }
};

const createCustomIcon = (color) => { 
    const markerHtml = `<span style="background-color: ${color}; width: 2rem; height: 2rem; border-radius: 50% 50% 50% 0; border: 2px solid white; display: block; transform: rotate(-45deg);"></span>`; 
    return L.divIcon({ html: markerHtml, className: 'bg-transparent', iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32] }); 
};
const iconPriority = { Critical: createCustomIcon('#EF4444'), High: createCustomIcon('#F97316'), Medium: createCustomIcon('#EAB308') };


export default function MapDisplay({ alerts, hotspots }) { // <-- Accept alerts and hotspots
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const hotspotCircles = useRef([]); 
    const initialCenter = [10.85, 78.43]; 
    const initialZoom = 7;

    const handleZoomIn = () => mapRef.current?.zoomIn();
    const handleZoomOut = () => mapRef.current?.zoomOut();
    const handleResetView = () => mapRef.current?.setView(initialCenter, initialZoom);
    
    
    const updateHotspotLayers = (map, newHotspots) => {
        // 1. Clear existing layers
        hotspotCircles.current.forEach(circle => map.removeLayer(circle));
        hotspotCircles.current = [];

        // 2. Add new predictive circles
        newHotspots.forEach(hotspot => {
          const style = getHotspotStyle(hotspot.risk_level);
          
          const circle = L.circle([hotspot.geo_lat, hotspot.geo_long], {
            ...style,
            weight: 1,
            className: 'animate-pulse' 
          }).addTo(map);

          circle.bindPopup(
            `<b>PREDICTIVE HOTSPOT: ${hotspot.city}</b><br>` +
            `Risk Level: ${hotspot.risk_level}<br>` +
            `Risk Score: ${hotspot.risk_score.toFixed(2)}<br>` +
            `Top Fraud: ${hotspot.top_fraud_types.join(', ')}`
          );

          hotspotCircles.current.push(circle);
        });
    };
    
    // Effect to update hotspot layers when data changes
    useEffect(() => {
        if (mapInstance.current) {
            updateHotspotLayers(mapInstance.current, hotspots);
        }
    }, [hotspots]); 


    return (
        <div className="relative h-[450px] bg-gray-800 rounded-lg overflow-hidden shadow-lg">
            <MapContainer 
                center={initialCenter} 
                zoom={initialZoom} 
                scrollWheelZoom={true} 
                style={{ height: '100%', width: '100%' }}
                zoomControl={false} 
            >
                <TileLayer
                    attribution='&copy; CARTO'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />
                
                <MapControls mapRef={mapRef} mapInstance={mapInstance} />
                
                {/* Existing Alert Markers */}
                {alerts.map(alert => (<Marker key={alert.id} position={alert.position} icon={iconPriority[alert.priority] || createCustomIcon('grey')}><Popup><div className="font-sans"><p className="font-bold text-lg">{alert.location}</p><p><strong>Priority:</strong> {alert.priority}</p></div></Popup></Marker>))}

            </MapContainer>

            {/* Custom UI Overlays */}
            <div className="absolute bottom-4 left-4 flex gap-3 z-[1000]">
                <button onClick={handleZoomIn} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md shadow-md">Zoom In</button>
                <button onClick={handleZoomOut} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md shadow-md">Zoom Out</button>
                <button onClick={handleResetView} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md shadow-md">Reset View</button>
            </div>

            {/* Alert Risk Levels Legend */}
            <div className="absolute top-4 right-4 bg-black/50 p-4 rounded-lg backdrop-blur-sm text-white z-[1000]"><h4 className="font-bold mb-2">Alert Risk Levels</h4><ul className="space-y-2 text-sm"><li className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-red-500 border-2 border-red-300"></div>Critical</li><li className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-orange-500 border-2 border-orange-300"></div>High</li><li className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-yellow-500 border-2 border-yellow-300"></div>Medium</li></ul></div>
            
            {/* Predictive Hotspot Legend (Manual placement adjusted) */}
            <div className="absolute top-4 right-4 translate-y-36 bg-black/50 p-4 rounded-lg backdrop-blur-sm text-white z-[1000]"><h4 className="font-bold mb-2">Predicted Hotspots</h4><ul className="space-y-2 text-sm"><li className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-red-600 border-2 border-red-400"></div>Extreme Risk</li><li className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-orange-600 border-2 border-orange-400"></div>High Risk</li><li className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-yellow-600 border-2 border-yellow-400"></div>Elevated Risk</li></ul></div>
        </div>
    );
}