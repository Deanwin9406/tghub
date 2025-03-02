
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle } from 'lucide-react';

// Set Mapbox token - Make sure this is a valid token
mapboxgl.accessToken = 'pk.eyJ1IjoiamFocHJvdCIsImEiOiJjbTdxZ2hwZWcwdXQxMmtyNjY5eWl6MGFjIn0.HRD7uwiBzXBAgWVbdD-2cw';

interface MapProps {
  properties?: Array<{
    id: string;
    latitude: number;
    longitude: number;
    title: string;
    price: number;
    currency?: string;
    type?: string;
  }>;
  center?: [number, number];
  zoom?: number;
  interactive?: boolean;
  height?: string;
  width?: string;
  onPropertyClick?: (propertyId: string) => void;
  className?: string;
}

const Map = ({
  properties = [],
  center = [1.2247, 6.1665], // Lomé, Togo
  zoom = 12,
  interactive = true,
  height = '400px',
  width = '100%',
  onPropertyClick,
  className
}: MapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);

  console.log("Map component rendered");
  console.log("Map properties received:", properties);
  console.log("Map center:", center, "zoom:", zoom);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) {
      console.log("Map container not ready");
      return;
    }

    try {
      console.log("Initializing map with token:", mapboxgl.accessToken);
      if (!mapboxgl.accessToken || mapboxgl.accessToken.includes('your-mapbox-token')) {
        throw new Error("Invalid Mapbox token. Please provide a valid token.");
      }

      // Initialize map
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: center,
        zoom: zoom,
        interactive: interactive,
        attributionControl: true,
      });

      // Add navigation controls if interactive
      if (interactive) {
        map.current.addControl(
          new mapboxgl.NavigationControl({
            visualizePitch: true,
          }),
          'top-right'
        );
      }

      map.current.on('load', () => {
        console.log("Map loaded successfully");
        setMapLoaded(true);
        setInitializing(false);
      });

      map.current.on('error', (e) => {
        console.error("Mapbox error:", e);
        setError(`Mapbox error: ${e.error?.message || 'Unknown error'}`);
        setInitializing(false);
      });

      return () => {
        if (map.current) {
          console.log("Removing map");
          map.current.remove();
        }
      };
    } catch (err) {
      console.error('Error initializing map:', err);
      setError(`Failed to load map: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setInitializing(false);
    }
  }, []);

  // Add markers when properties change or when map is loaded
  useEffect(() => {
    if (!map.current || !mapLoaded) {
      console.log("Map or mapLoaded not ready yet");
      return;
    }
    
    if (properties.length === 0) {
      console.log("No properties to show on map");
      return;
    }

    console.log("Adding markers to map");

    // Clear existing markers
    const markers = document.getElementsByClassName('mapboxgl-marker');
    while (markers[0]) {
      markers[0].remove();
    }

    // Add new markers
    properties.forEach((property) => {
      if (!property.latitude || !property.longitude) {
        console.log("Property missing coordinates:", property);
        return;
      }

      console.log("Adding marker at:", property.longitude, property.latitude);

      const el = document.createElement('div');
      el.className = 'marker';
      el.style.backgroundImage = 'url(https://img.icons8.com/color/48/000000/marker.png)';
      el.style.width = '30px';
      el.style.height = '30px';
      el.style.backgroundSize = 'cover';
      el.style.cursor = 'pointer';

      // Create popup
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
        `<div style="padding: 8px;">
          <strong>${property.title}</strong>
          <p>${property.price.toLocaleString()} ${property.currency || 'XOF'}</p>
          ${property.type ? `<p>${property.type}</p>` : ''}
        </div>`
      );

      // Add marker to map
      try {
        new mapboxgl.Marker(el)
          .setLngLat([property.longitude, property.latitude])
          .setPopup(popup)
          .addTo(map.current!);
      } catch (err) {
        console.error("Error adding marker:", err);
      }

      // Add click handler if provided
      if (onPropertyClick) {
        el.addEventListener('click', () => {
          onPropertyClick(property.id);
        });
      }
    });

    // Fit bounds if multiple properties
    if (properties.length > 1) {
      try {
        const bounds = new mapboxgl.LngLatBounds();
        properties.forEach(property => {
          if (property.latitude && property.longitude) {
            bounds.extend([property.longitude, property.latitude]);
          }
        });
        map.current.fitBounds(bounds, { padding: 50 });
      } catch (err) {
        console.error("Error fitting bounds:", err);
      }
    }
  }, [properties, mapLoaded, onPropertyClick]);

  if (error) {
    return (
      <div 
        className={`flex items-center justify-center bg-muted rounded-lg ${className}`}
        style={{ height, width }}
      >
        <div className="text-center p-6">
          <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-4" />
          <p className="text-red-500 mb-4">{error}</p>
          <Button 
            onClick={() => window.location.reload()}
            variant="outline"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (initializing || !mapLoaded) {
    return (
      <div 
        className={`flex items-center justify-center bg-muted rounded-lg ${className}`}
        style={{ height, width }}
      >
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={mapContainer} 
      className={`relative rounded-lg overflow-hidden shadow-md ${className}`}
      style={{ height, width }}
    />
  );
};

export default Map;
