// src/components/MapDisplay.jsx
import React, { useRef, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default function MapDisplay({ alerts }) {
  const mapRef = useRef(null);

  const initialCenter = [19.7515, 75.7139]; // Maharashtra
  const initialZoom = 7;

  const MapControls = () => {
    const map = useMap();
    mapRef.current = map;
    return null;
  };

  const createCustomIcon = (color) => {
    const markerHtml =
      `<span style="background-color: ${color}; width: 2rem; height: 2rem; ` +
      `border-radius: 50% 50% 50% 0; border: 2px solid white; display: block; transform: rotate(-45deg);"></span>`;
    return L.divIcon({
      html: markerHtml,
      className: "bg-transparent",
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    });
  };

  const iconPriority = {
    Critical: createCustomIcon("#EF4444"),
    High: createCustomIcon("#F97316"),
    Medium: createCustomIcon("#EAB308"),
  };

  useEffect(() => {
    if (!mapRef.current || alerts.length === 0) return;

    const bounds = L.latLngBounds(
      alerts.map((a) => L.latLng(a.position[0], a.position[1]))
    );
    mapRef.current.fitBounds(bounds, { padding: [50, 50] });
  }, [alerts]);

  const handleZoomIn = () => mapRef.current?.zoomIn();
  const handleZoomOut = () => mapRef.current?.zoomOut();
  const handleResetView = () => mapRef.current?.setView(initialCenter, initialZoom);

  return (
    <div className="relative rounded-lg overflow-hidden shadow-lg bg-gray-800 mb-6">
      <MapContainer
        center={initialCenter}
        zoom={initialZoom}
        scrollWheelZoom={true}
        style={{ height: "450px", width: "100%" }}
        zoomControl={false}
      >
        {/* normal color map */}
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapControls />

        {alerts.map((alert) => (
          <Marker
            key={alert.id}
            position={alert.position}
            icon={iconPriority[alert.priority] || createCustomIcon("grey")}
          >
            <Popup>
              <div className="font-sans text-sm">
                <p className="font-bold text-base mb-1">{alert.location}</p>
                <p>
                  <strong>ATM ID:</strong> {alert.atmId}
                </p>
                <p>
                  <strong>ATM Name:</strong> {alert.atmName}
                </p>
                <p>
                  <strong>Risk Class:</strong> {alert.riskClass}
                </p>
                <p>
                  <strong>Risk Score:</strong> {alert.riskScore}%
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* controls */}
      <div className="absolute bottom-4 left-4 flex gap-3 z-[1000]">
        <button
          onClick={handleZoomIn}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md shadow-md"
        >
          Zoom In
        </button>
        <button
          onClick={handleZoomOut}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md shadow-md"
        >
          Zoom Out
        </button>
        <button
          onClick={handleResetView}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md shadow-md"
        >
          Reset View
        </button>
      </div>

      {/* legend */}
      <div className="absolute top-4 right-4 bg-black/70 p-4 rounded-lg backdrop-blur-sm text-white z-[1000]">
        <h4 className="font-bold mb-2">Alert Risk Levels</h4>
        <ul className="space-y-2 text-sm">
          <li className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-red-300"></div>
            Critical
          </li>
          <li className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-orange-500 border-2 border-orange-300"></div>
            High
          </li>
          <li className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-yellow-500 border-2 border-yellow-300"></div>
            Medium
          </li>
        </ul>
      </div>
    </div>
  );
}
