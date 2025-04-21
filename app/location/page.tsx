'use client';

import React, { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css'; // Importing Leaflet CSS at the top level
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css'; // Importing the CSS for routing machine

// Dynamically import the MapContainer and other components
const MapContainerDynamic = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayerDynamic = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const MarkerDynamic = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const PopupDynamic = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });

const shopPosition: [number, number] = [1.2921, 36.8219]; // Nairobi coordinates as example
const destinationPosition: [number, number] = [-1.2921, 36.8219]; // Example destination coordinates

export default function ShopLocationPage() {
  const mapRef = useRef<HTMLDivElement | null>(null); // Create a ref for the map container

  useEffect(() => {
    // Import Leaflet and Leaflet Routing Machine only in the browser
    const L = require('leaflet');
    require('leaflet-routing-machine');

    // Fix default icon issue with Leaflet in React
    delete (L.Icon.Default.prototype as any)._getIconUrl; // Use 'as any' to bypass type checking
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet/dist/images/marker-shadow.png',
    });

    if (mapRef.current) {
      const map = L.map(mapRef.current).setView(shopPosition, 13); // Use the ref here

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // Check if L.Routing is defined before using it
      if (L.Routing) {
        // Add routing control
        const routingControl = L.Routing.control({
          waypoints: [
            L.latLng(shopPosition[0], shopPosition[1]), // Starting point
            L.latLng(destinationPosition[0], destinationPosition[1]) // Destination point
          ],
          routeWhileDragging: true,
        }).addTo(map);
      } else {
        console.error("Leaflet Routing Machine is not loaded.");
      }

      // Cleanup on component unmount
      return () => {
        map.remove();
      };
    }
  }, []);

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <h1>Shop Location</h1>
      <div ref={mapRef} style={{ height: '90%', width: '100%' }} /> {/* Use the ref here */}
    </div>
  );
}