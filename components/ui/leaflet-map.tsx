"use client";

import "leaflet/dist/leaflet.css";
import type { Map } from "leaflet";
import { useEffect, useState, useRef } from "react";

interface LeafletMapProps {
  center: {
    lat: number;
    lng: number;
  };
  zoom?: number;
  markerPosition?: {
    lat: number;
    lng: number;
  };
}

export function LeafletMap({
  center,
  zoom = 15,
  markerPosition,
}: LeafletMapProps) {
  const [isMounted, setIsMounted] = useState(false);
  const mapRef = useRef<Map | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const initializeMap = async () => {
      const L = (await import("leaflet")).default;

      interface ExtendedIconDefaultClass extends L.Icon.Default {
        _getIconUrl?: string;
      }
      delete (L.Icon.Default.prototype as ExtendedIconDefaultClass)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon-2x.png",
        iconUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon.png",
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png",
      });

      if (mapRef.current) {
        mapRef.current.remove();
      }

      const map = L.map("map").setView([center.lat, center.lng], zoom);
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      if (markerPosition) {
        L.marker([markerPosition.lat, markerPosition.lng]).addTo(map);
      }
    };

    initializeMap();
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [center, zoom, markerPosition, isMounted]);

  return <div id="map" className="h-full w-full" />;
}
