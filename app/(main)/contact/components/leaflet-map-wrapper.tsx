"use client";

import "leaflet/dist/leaflet.css";
import type { Map } from "leaflet";
import { useEffect, useState, useRef, memo } from "react";

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

function LeafletMapComponent({
  center,
  zoom = 15,
  markerPosition,
}: LeafletMapProps) {
  const [isMounted, setIsMounted] = useState(false);
  const mapRef = useRef<Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!isMounted || !containerRef.current) return;

    const initializeMap = async () => {
      try {
        const L = (await import("leaflet")).default;

        interface ExtendedIconDefaultClass extends L.Icon.Default {
          _getIconUrl?: string;
        }

        const IconDefault = L.Icon.Default as unknown as {
          prototype: ExtendedIconDefaultClass;
          new (): ExtendedIconDefaultClass;
        };

        if (IconDefault.prototype._getIconUrl) {
          delete IconDefault.prototype._getIconUrl;
        }

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

        if (!containerRef.current) return;
        const map = L.map(containerRef.current).setView(
          [center.lat, center.lng],
          zoom
        );
        mapRef.current = map;

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
          subdomains: "abc",
          detectRetina: true,
        }).addTo(map);

        if (markerPosition) {
          L.marker([markerPosition.lat, markerPosition.lng]).addTo(map);
        }
      } catch (error) {
        console.error("Error initializing map:", error);
      }
    };

    initializeMap();
  }, [center, zoom, markerPosition, isMounted]);

  return (
    <div
      ref={containerRef}
      className="h-full w-full"
      aria-label="خريطة الموقع"
      role="application"
    />
  );
}

export default memo(LeafletMapComponent);
