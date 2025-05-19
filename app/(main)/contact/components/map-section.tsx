"use client";

import { MapPin, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect, lazy, Suspense } from "react";

const LeafletMap = lazy(() => import("./leaflet-map-wrapper"));

interface MapSectionProps {
  address: string;
  workingHours: string;
  mapLocation: {
    lat: number;
    lng: number;
  };
}

export function MapSection({
  address,
  workingHours,
  mapLocation,
}: MapSectionProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [isMapVisible, setIsMapVisible] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsMapVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    const mapContainer = document.getElementById("map-container");
    if (mapContainer) {
      observer.observe(mapContainer);
    }

    return () => {
      observer.disconnect();
    };
  }, [isMounted]);

  return (
    <Card>
      <CardContent className="pt-6">
        <div
          id="map-container"
          className="aspect-video relative rounded-md overflow-hidden mb-6 z-[49]"
        >
          {isMounted && isMapVisible ? (
            <Suspense fallback={<Skeleton className="h-full w-full" />}>
              <LeafletMap
                center={mapLocation}
                markerPosition={mapLocation}
                zoom={15}
              />
            </Suspense>
          ) : (
            <Skeleton className="h-full w-full" />
          )}
        </div>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <MapPin
              className="h-5 w-5 text-primary flex-shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <div>
              <h4 className="font-medium">العنوان</h4>
              <p className="text-muted-foreground">{address}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Clock
              className="h-5 w-5 text-primary flex-shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <div>
              <h4 className="font-medium">ساعات العمل</h4>
              <p className="text-muted-foreground whitespace-pre-line">
                {workingHours}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
