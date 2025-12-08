// src/components/MapDisplay.jsx
import React, { useRef, useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";

export default function MapDisplay({ alerts }) {
  const mapRef = useRef(null);
  const heatLayerRef = useRef(null);
  const [mode, setMode] = useState("pins"); // "pins" | "heatmap"

  const initialCenter = [19.7515, 75.7139]; // Maharashtra
  const initialZoom = 7;

  // --- MapControls: capture leaflet map instance ---
  const MapControls = () => {
    const map = useMap();
    mapRef.current = map;
    return null;
  };

  // --- Marker Icon styling ---
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

  // 🔥 include Low as GREEN (and optional Very Critical if you use it)
  const iconPriority = {
    "Very Critical": createCustomIcon("#b91c1c"), // dark red
    Critical: createCustomIcon("#EF4444"),
    High: createCustomIcon("#F97316"),
    Medium: createCustomIcon("#EAB308"),
    Low: createCustomIcon("#22c55e"), // ✅ green
  };

  // --- Fit map to all ATM points when alerts change ---
  useEffect(() => {
    if (!mapRef.current || alerts.length === 0) return;

    const bounds = L.latLngBounds(
      alerts.map((a) => L.latLng(a.position[0], a.position[1]))
    );
    mapRef.current.fitBounds(bounds, { padding: [60, 60] });
  }, [alerts]);

  // --- Heatmap effect ---
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove any existing heat layer first
    if (heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current);
      heatLayerRef.current = null;
    }

    // Only add heat layer when mode is "heatmap" and there are points
    if (mode === "heatmap" && alerts.length > 0) {
      const heatPoints = alerts.map((a) => {
        const [lat, lon] = a.position;
        const base =
          typeof a.riskScoreNorm === "number" ? a.riskScoreNorm : 0.5;
        const intensity = 0.3 + 0.7 * base;
        return [lat, lon, intensity];
      });

      const heat = L.heatLayer(heatPoints, {
        radius: 30,
        blur: 20,
        maxZoom: 12,
        minOpacity: 0.35,
        gradient: {
          0.0: "#00ff00",
          0.3: "#adff2f",
          0.5: "#ffff00",
          0.7: "#ffa500",
          1.0: "#ff0000",
        },
      });

      heat.addTo(map);
      heatLayerRef.current = heat;
    }
  }, [mode, alerts]);

  const handleZoomIn = () => mapRef.current?.zoomIn();
  const handleZoomOut = () => mapRef.current?.zoomOut();
  const handleResetView = () =>
    mapRef.current?.setView(initialCenter, initialZoom);

  return (
    <div className="relative rounded-lg overflow-hidden shadow-lg bg-gray-900 mb-6">
      <MapContainer
        center={initialCenter}
        zoom={initialZoom}
        scrollWheelZoom={true}
        style={{ height: "450px", width: "100%" }}
        zoomControl={false}
      >
        {/* Normal color base map */}
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapControls />

        {/* PIN MARKERS (hidden in heatmap mode) */}
        {mode === "pins" &&
          alerts.map((alert) => (
            <Marker
              key={alert.id}
              position={alert.position}
              icon={
                iconPriority[alert.priority] ||
                iconPriority["Low"] // ✅ default to green instead of grey
              }
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

      {/* Mode toggle – top-left over the map */}
      <div className="absolute top-4 left-4 z-[1000] flex bg-black/60 rounded-full p-1">
        <button
          onClick={() => setMode("pins")}
          className={`px-4 py-1 rounded-full text-sm font-semibold ${
            mode === "pins"
              ? "bg-white text-slate-900"
              : "bg-transparent text-white"
          }`}
        >
          Pins
        </button>
        <button
          onClick={() => setMode("heatmap")}
          className={`px-4 py-1 rounded-full text-sm font-semibold ${
            mode === "heatmap"
              ? "bg-blue-500 text-white"
              : "bg-transparent text-white"
          }`}
        >
          Heatmap
        </button>
      </div>

      {/* Zoom controls */}
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

      {/* Legend – now includes Low in green */}
      <div className="absolute top-4 right-4 bg-black/70 p-4 rounded-lg backdrop-blur-sm text-white z-[1000]">
        <h4 className="font-bold mb-2">Alert Risk Levels</h4>
        <ul className="space-y-2 text-sm">
          <li className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-600 border-2 border-red-400" />
            Very Critical
          </li>
          <li className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-red-300" />
            Critical
          </li>
          <li className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-orange-500 border-2 border-orange-300" />
            High
          </li>
          <li className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-yellow-400 border-2 border-yellow-300" />
            Medium
          </li>
          <li className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-green-300" />
            Low
          </li>
        </ul>
      </div>
    </div>
  );
}
