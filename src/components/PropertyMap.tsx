
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin } from 'lucide-react';
import { PropertyType } from './PropertyCard';
import { Link } from 'react-router-dom';
import { Badge } from './ui/badge';

interface PropertyMapProps {
  properties: PropertyType[];
  centerLat?: number;
  centerLng?: number;
  zoom?: number;
}

const PropertyMap = ({ 
  properties, 
  centerLat = 6.13748, // Default center of Lomé
  centerLng = 1.21227, 
  zoom = 13 
}: PropertyMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [isTokenEntered, setIsTokenEntered] = useState(false);

  // For demonstration purposes, we'll simulate property coordinates
  // In a real app, these would come from the database
  const generateCoordinates = (index: number) => {
    // Create a grid of properties around the center point
    const offset = 0.005; // Approximately 500m
    const cols = 4;
    const row = Math.floor(index / cols);
    const col = index % cols;
    
    return {
      lng: centerLng + (col - cols/2) * offset * 2,
      lat: centerLat + (row - properties.length/cols/2) * offset
    };
  };

  const handleTokenSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsTokenEntered(true);
    initializeMap();
  };

  const initializeMap = () => {
    if (!mapContainer.current || !mapboxToken) return;

    // Initialize map
    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [centerLng, centerLat],
      zoom: zoom,
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      'top-right'
    );

    // When map loads, add markers for each property
    map.current.on('load', () => {
      properties.forEach((property, index) => {
        // Generate coordinates for demo purposes
        const coordinates = generateCoordinates(index);

        // Create custom marker element
        const markerEl = document.createElement('div');
        markerEl.className = 'property-marker';
        markerEl.innerHTML = `
          <div class="relative group">
            <div class="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shadow-lg
                        hover:scale-110 transition-transform">
              <span class="font-bold">${property.price / 1000000}M</span>
            </div>
            <div class="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-white p-2 rounded shadow-lg
                        hidden group-hover:block w-48 z-10">
              <div class="text-sm font-medium">${property.title}</div>
              <div class="text-xs">${property.location}</div>
              <div class="text-sm font-semibold">${property.price.toLocaleString()} XOF</div>
            </div>
          </div>
        `;

        // Create popup
        const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
          <div class="p-2">
            <div class="text-sm font-bold">${property.title}</div>
            <div class="text-xs">${property.location}</div>
            <div class="text-sm font-semibold">${property.price.toLocaleString()} XOF</div>
            <a href="/property/${property.id}" class="text-xs text-blue-600 hover:underline">Voir détails</a>
          </div>
        `);

        // Add marker to map
        new mapboxgl.Marker(markerEl)
          .setLngLat([coordinates.lng, coordinates.lat])
          .setPopup(popup)
          .addTo(map.current!);

        // Make the marker clickable to navigate to property details
        markerEl.addEventListener('click', () => {
          window.location.href = `/property/${property.id}`;
        });
      });
    });

    // Cleanup on unmount
    return () => {
      map.current?.remove();
    };
  };

  useEffect(() => {
    // If token is entered, reinitialize map when properties change
    if (isTokenEntered && mapboxToken) {
      // Remove existing map if any
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
      
      initializeMap();
    }
  }, [properties, isTokenEntered]);

  // Apply styles for map markers
  useEffect(() => {
    // Add CSS for property markers
    const style = document.createElement('style');
    style.innerHTML = `
      .property-marker {
        cursor: pointer;
      }
      .mapboxgl-popup-content {
        padding: 12px;
        border-radius: 8px;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  if (!isTokenEntered) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 bg-muted/10">
        <MapPin size={48} className="text-primary mb-4" />
        <h3 className="text-xl font-bold mb-2">Carte Immobilière</h3>
        <p className="text-muted-foreground mb-6 text-center">
          Pour afficher la carte, veuillez entrer votre clé API Mapbox
        </p>
        
        <form onSubmit={handleTokenSubmit} className="w-full max-w-md">
          <div className="flex flex-col space-y-4">
            <input
              type="text"
              value={mapboxToken}
              onChange={(e) => setMapboxToken(e.target.value)}
              placeholder="Entrez votre token Mapbox public"
              className="w-full px-4 py-2 border border-border rounded-lg"
              required
            />
            <button
              type="submit"
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Afficher la carte
            </button>
          </div>
          <div className="mt-4 text-xs text-muted-foreground">
            <p>Pour obtenir un token Mapbox:</p>
            <ol className="list-decimal pl-4 space-y-1">
              <li>Créez un compte sur <a href="https://mapbox.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">mapbox.com</a></li>
              <li>Accédez à votre tableau de bord</li>
              <li>Copiez votre token public dans la section "Access tokens"</li>
            </ol>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="h-full">
      <div ref={mapContainer} className="h-full w-full" />
    </div>
  );
};

export default PropertyMap;
