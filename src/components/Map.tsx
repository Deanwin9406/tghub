
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

// Set Mapbox token
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

  useEffect(() => {
    if (!mapContainer.current) return;

    try {
      // Initialize map
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center,
        zoom,
        interactive
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
        setMapLoaded(true);
      });

      return () => {
        map.current?.remove();
      };
    } catch (err) {
      console.error('Error initializing map:', err);
      setError('Failed to load map');
    }
  }, []);

  // Add markers when properties change or when map is loaded
  useEffect(() => {
    if (!map.current || !mapLoaded || properties.length === 0) return;

    // Clear existing markers
    const markers = document.getElementsByClassName('mapboxgl-marker');
    while (markers[0]) {
      markers[0].remove();
    }

    // Add new markers
    properties.forEach((property) => {
      if (!property.latitude || !property.longitude) return;

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
      new mapboxgl.Marker(el)
        .setLngLat([property.longitude, property.latitude])
        .setPopup(popup)
        .addTo(map.current!);

      // Add click handler if provided
      if (onPropertyClick) {
        el.addEventListener('click', () => {
          onPropertyClick(property.id);
        });
      }
    });

    // Fit bounds if multiple properties
    if (properties.length > 1) {
      const bounds = new mapboxgl.LngLatBounds();
      properties.forEach(property => {
        if (property.latitude && property.longitude) {
          bounds.extend([property.longitude, property.latitude]);
        }
      });
      map.current.fitBounds(bounds, { padding: 50 });
    }
  }, [properties, mapLoaded, onPropertyClick]);

  if (error) {
    return (
      <div 
        className={`flex items-center justify-center bg-muted rounded-lg ${className}`}
        style={{ height, width }}
      >
        <div className="text-center p-6">
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

  if (!mapLoaded) {
    return (
      <div 
        className={`flex items-center justify-center bg-muted rounded-lg ${className}`}
        style={{ height, width }}
      >
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
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
