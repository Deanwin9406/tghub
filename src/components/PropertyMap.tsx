
import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { PropertyType } from '@/contexts/FavoritesContext';

// Set your Mapbox token here
mapboxgl.accessToken = 'pk.eyJ1IjoibG92YWJsZXVzZXIiLCJhIjoiY2xiaWo1Ymx3MGZjcDNwbzRjZXB1OWgyNSJ9.Y6idE7rRdNVSR_5hFkPGJw';

interface PropertyMapProps {
  properties: PropertyType[];
  onMarkerClick?: (propertyId: string) => void; 
}

const PropertyMap: React.FC<PropertyMapProps> = ({ properties, onMarkerClick }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map only if it's not already created
    if (!map.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [1.2254, 6.1319], // Lomé, Togo
        zoom: 12,
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl());
    }

    // Return cleanup function
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Update markers whenever properties change
  useEffect(() => {
    if (!map.current || !properties.length) return;

    // Wait for map to load before adding markers
    map.current.on('load', () => {
      addMarkers();
    });

    // If map is already loaded, add markers immediately
    if (map.current.loaded()) {
      addMarkers();
    }

    // Cleanup function to remove markers when component unmounts or properties change
    return () => {
      markers.current.forEach(marker => marker.remove());
      markers.current = [];
    };
  }, [properties]);

  const addMarkers = () => {
    if (!map.current) return;

    // Remove existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // Bounds to fit all markers
    const bounds = new mapboxgl.LngLatBounds();

    // Add new markers
    properties.forEach(property => {
      // Mock geocoding for demo purposes
      // In a real app, you'd use actual coordinates from your property data
      // or geocode the address to get coordinates
      const mockLng = 1.2254 + (Math.random() - 0.5) * 0.1; // Random position around Lomé
      const mockLat = 6.1319 + (Math.random() - 0.5) * 0.1;

      // Create marker element
      const el = document.createElement('div');
      el.className = 'custom-marker';
      el.style.backgroundColor = '#3B82F6';
      el.style.width = '28px';
      el.style.height = '28px';
      el.style.borderRadius = '50%';
      el.style.border = '3px solid white';
      el.style.boxShadow = '0 2px 10px rgba(0,0,0,0.3)';
      el.style.cursor = 'pointer';
      el.style.display = 'flex';
      el.style.justifyContent = 'center';
      el.style.alignItems = 'center';
      
      // Create price label
      const priceLabel = document.createElement('div');
      priceLabel.textContent = `${(property.price / 1000000).toFixed(0)}M`;
      priceLabel.style.position = 'absolute';
      priceLabel.style.bottom = '-25px';
      priceLabel.style.left = '50%';
      priceLabel.style.transform = 'translateX(-50%)';
      priceLabel.style.backgroundColor = 'white';
      priceLabel.style.padding = '2px 6px';
      priceLabel.style.borderRadius = '4px';
      priceLabel.style.fontSize = '10px';
      priceLabel.style.fontWeight = 'bold';
      priceLabel.style.boxShadow = '0 1px 3px rgba(0,0,0,0.2)';
      el.appendChild(priceLabel);

      // Create marker
      const marker = new mapboxgl.Marker(el)
        .setLngLat([mockLng, mockLat])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 })
            .setHTML(`
              <div style="width: 200px;">
                <img 
                  src="${property.main_image_url || '/placeholder.svg'}" 
                  alt="${property.title}"
                  style="width: 100%; height: 120px; object-fit: cover; border-radius: 4px; margin-bottom: 8px;"
                />
                <h3 style="font-weight: bold; margin-bottom: 4px;">${property.title}</h3>
                <p style="color: #3B82F6; font-weight: bold; margin-bottom: 4px;">
                  ${new Intl.NumberFormat('fr-FR', {
                    style: 'currency',
                    currency: 'XOF',
                    maximumFractionDigits: 0
                  }).format(property.price)}
                </p>
                <p style="font-size: 12px; color: #666;">
                  ${property.bedrooms || 0} ch · ${property.bathrooms || 0} sdb · ${property.property_type}
                </p>
              </div>
            `)
        )
        .addTo(map.current);

      // Add click handler
      el.addEventListener('click', () => {
        if (onMarkerClick) {
          onMarkerClick(property.id);
        }
      });

      // Add marker to array for tracking
      markers.current.push(marker);

      // Extend bounds to include this point
      bounds.extend([mockLng, mockLat]);
    });

    // Fit map to bounds with padding
    if (!bounds.isEmpty()) {
      map.current.fitBounds(bounds, {
        padding: 50,
        maxZoom: 15
      });
    }
  };

  return <div ref={mapContainer} className="w-full h-full" />;
};

export default PropertyMap;
