'use client';

import React, { useEffect, useRef } from 'react';
import '../../styles/location.css'; // Ensure this path is correct

const shopPosition: [number, number] = [-1.2921, 36.8219];
const userPosition: [number, number] = [-1.1026, 37.0132];

const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoiamVmZjIyMTU3IiwiYSI6ImNtOXJmZHAxMDBuZG0ycXNmeWQ2cWhybWkifQ.HwjXWQYz__GiXnYxlbYVLQ';

interface MapInstance {
  remove: () => void;
}

// Define a type for Icon.Default prototype including optional _getIconUrl property
interface IconDefaultPrototype {
  _getIconUrl?: () => void;
}

export default function ShopLocationPage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<MapInstance | null>(null); // Typed with interface including remove method

  useEffect(() => {
    // Check if the code is running in the browser
    if (typeof window !== 'undefined') {
      async function loadMap() {
        // Dynamically import Leaflet only on client side
        const L = (await import('leaflet')).default;

        // Fix Leaflet's default icon URLs to use CDN to avoid 404 errors
        const iconDefaultPrototype = L.Icon.Default.prototype as IconDefaultPrototype;
        delete iconDefaultPrototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png',
          iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
        });

        if (mapRef.current) {
          // Check if the map is already initialized
          if (mapInstanceRef.current) {
            console.log('Map is already initialized.'); // Debug log
            return; // Exit if the map is already initialized
          }

          console.log('Initializing map...'); // Debug log

          // Initialize the map
          const map = L.map(mapRef.current).setView(shopPosition, 13);
          mapInstanceRef.current = map;

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors',
            maxZoom: 19,
          }).addTo(map);

          L.marker(shopPosition).addTo(map).bindPopup('PES Electrical - PR8J+5F Nairobi').openPopup();
          L.marker(userPosition).addTo(map).bindPopup('Your Location').openPopup();

          const directionsUrl = `https://api.mapbox.com/directions/v5/mapbox/driving/${userPosition[1]},${userPosition[0]};${shopPosition[1]},${shopPosition[0]}?geometries=geojson&access_token=${MAPBOX_ACCESS_TOKEN}`;

          fetch(directionsUrl)
            .then((response) => response.json())
            .then((data) => {
              if (data.routes && data.routes.length > 0) {
                const route = data.routes[0].geometry;
                const routeLine = L.geoJSON(route, {
                  style: { color: 'blue', weight: 4 },
                }).addTo(map);
                map.fitBounds(routeLine.getBounds());
              }
            })
            .catch((error) => {
              console.error('Error fetching directions:', error);
            });
        }
      }

      loadMap();

      return () => {
        if (mapInstanceRef.current) {
          console.log('Cleaning up map...'); // Debug log
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }
      };
    }
  }, []);

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <h1>Shop Location with Directions</h1>
      <div ref={mapRef} className="map-container" />
    </div>
  );
}
