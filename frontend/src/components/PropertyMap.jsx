import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import { formatNaira } from '../utils/formatters';
import { SAAPADE_CENTER } from '../utils/constants';

// Fix Leaflet default marker icon broken asset paths
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom Emerald Marker Icon
const createCustomIcon = (isHighlight = false) => {
  return L.divIcon({
    className: 'custom-map-pin',
    html: `
      <div style="
        background-color: ${isHighlight ? '#059669' : '#0f172a'};
        color: white;
        padding: 4px 8px;
        border-radius: 9999px;
        font-weight: 700;
        font-size: 11px;
        box-shadow: 0 4px 6px -1px rgba(0,0,0,0.2);
        border: 2px solid white;
        display: flex;
        align-items: center;
        gap: 4px;
        white-space: nowrap;
      ">
        <span>📍</span>
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -28]
  });
};

function ChangeMapView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && center.lat && center.lng) {
      map.setView([center.lat, center.lng], zoom || map.getZoom());
    }
  }, [center, zoom, map]);
  return null;
}

export default function PropertyMap({ properties = [], selectedProperty = null, height = '100%', zoom = 13 }) {
  const defaultCenter = selectedProperty
    ? { lat: selectedProperty.latitude || SAAPADE_CENTER.lat, lng: selectedProperty.longitude || SAAPADE_CENTER.lng }
    : SAAPADE_CENTER;

  return (
    <div style={{ height, width: '100%' }} className="rounded-xl overflow-hidden border border-slate-200 shadow-xs relative">
      <MapContainer
        center={[defaultCenter.lat, defaultCenter.lng]}
        zoom={zoom}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <ChangeMapView center={defaultCenter} zoom={zoom} />
        
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {properties.map((property) => {
          const lat = property.latitude || SAAPADE_CENTER.lat;
          const lng = property.longitude || SAAPADE_CENTER.lng;
          const isSelected = selectedProperty?.id === property.id;
          const imageUrl = property.primary_image || property.images?.[0]?.image_url || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80";

          return (
            <Marker
              key={property.id}
              position={[lat, lng]}
              icon={createCustomIcon(isSelected)}
            >
              <Popup>
                <div className="w-56 p-1">
                  <img
                    src={imageUrl}
                    alt={property.title}
                    className="w-full h-24 object-cover rounded-lg mb-2"
                  />
                  <div className="space-y-1">
                    <p className="font-bold text-slate-900 text-xs line-clamp-1">
                      {property.title}
                    </p>
                    <p className="text-emerald-600 font-extrabold text-xs">
                      {formatNaira(property.price_per_year)} / yr
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {property.area}, {property.city}
                    </p>
                    <Link
                      to={`/properties/${property.id}`}
                      className="block mt-2 text-center py-1.5 px-2 bg-slate-900 text-white rounded text-[11px] font-semibold hover:bg-emerald-600 transition"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
