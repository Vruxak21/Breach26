"use client";

import { useEffect } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface TrendingDestination {
  id: string;
  name: string;
  country: string;
  avgBudget: number;
  bestMonths: string;
  flightHoursFromIndia: number;
  lat: number;
  lng: number;
}

interface TrendingDestinationsMapProps {
  destinations: TrendingDestination[];
  selectedId: string;
  onSelect: (destinationId: string) => void;
}

const selectedPin = L.divIcon({
  className: "tm-destination-pin",
  html: `
    <div style="
      width: 22px;
      height: 22px;
      border-radius: 999px;
      background: #F97316;
      border: 3px solid white;
      box-shadow: 0 8px 20px rgba(249, 115, 22, 0.35);
    "></div>
  `,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

const defaultPin = L.divIcon({
  className: "tm-destination-pin",
  html: `
    <div style="
      width: 18px;
      height: 18px;
      border-radius: 999px;
      background: #0EA5A4;
      border: 2px solid white;
      box-shadow: 0 6px 16px rgba(14, 165, 164, 0.3);
    "></div>
  `,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

function FitToMarkers({ destinations }: { destinations: TrendingDestination[] }) {
  const map = useMap();

  useEffect(() => {
    if (!destinations.length) return;

    const bounds = L.latLngBounds(destinations.map((d) => [d.lat, d.lng] as [number, number]));
    map.fitBounds(bounds, { padding: [36, 36] });
  }, [destinations, map]);

  return null;
}

export default function TrendingDestinationsMap({
  destinations,
  selectedId,
  onSelect,
}: TrendingDestinationsMapProps) {
  return (
    <MapContainer
      center={[20, 0]}
      zoom={2}
      minZoom={2}
      maxZoom={8}
      worldCopyJump
      style={{ height: "100%", width: "100%" }}
      zoomControl
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <FitToMarkers destinations={destinations} />

      {destinations.map((destination) => (
        <Marker
          key={destination.id}
          position={[destination.lat, destination.lng]}
          icon={destination.id === selectedId ? selectedPin : defaultPin}
          eventHandlers={{
            click: () => onSelect(destination.id),
          }}
        >
          <Popup>
            <div className="min-w-44">
              <p className="text-sm font-semibold text-[#111111]">{destination.name}</p>
              <p className="mt-0.5 text-xs text-[#6B7280]">{destination.country}</p>
              <p className="mt-2 text-xs text-[#6B7280]">Best season: {destination.bestMonths}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
