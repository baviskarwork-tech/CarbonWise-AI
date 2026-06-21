'use client';

import React, { useState, useEffect, useRef } from 'react';
import AuthRoute from '../../components/AuthRoute';
import { MapPin, Map, Loader2, Navigation, Globe } from 'lucide-react';

interface EcoLocation {
  id: string;
  name: string;
  type: 'ev' | 'recycle' | 'bike' | 'transit' | 'store';
  address: string;
  lat: number;
  lng: number;
  details: string;
}

const MOCK_LOCATIONS: EcoLocation[] = [
  {
    id: 'loc-1',
    name: 'VoltCharge EV Station',
    type: 'ev',
    address: '428 Greenway Blvd',
    lat: 40.7128,
    lng: -74.006,
    details: 'Level 3 DC Fast Charger (150kW), 4 ports available.',
  },
  {
    id: 'loc-2',
    name: 'Metro Recycling Depot',
    type: 'recycle',
    address: '811 Industrial Parkway',
    lat: 40.7188,
    lng: -74.009,
    details: 'Accepts plastic codes 1-7, glass, aluminum, electronics, paper.',
  },
  {
    id: 'loc-3',
    name: 'EcoRide Bike Hub',
    type: 'bike',
    address: '15 City Square Mall',
    lat: 40.7158,
    lng: -74.002,
    details: '24/7 Smart bike rentals. 12 available dock spots.',
  },
  {
    id: 'loc-4',
    name: 'Grand Central Transit Hub',
    type: 'transit',
    address: '100 Main Street',
    lat: 40.7218,
    lng: -74.004,
    details: 'Subway commuter lines L1, L2, L3 and electric bus links.',
  },
  {
    id: 'loc-5',
    name: 'GreenLife Eco Store',
    type: 'store',
    address: '59 Organic Way',
    lat: 40.7108,
    lng: -74.011,
    details: 'Package-free groceries, composting tools, biodegradable home products.',
  },
];

export default function EcoMapPage() {
  return (
    <AuthRoute>
      <EcoMapView />
    </AuthRoute>
  );
}

function EcoMapView() {
  const [selectedLoc, setSelectedLoc] = useState<EcoLocation | null>(MOCK_LOCATIONS[0]);
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  const [loading, setLoading] = useState(true);

  const mapsKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const isSimulation = process.env.NEXT_PUBLIC_SIMULATION_MODE === 'true' || !mapsKey || mapsKey === 'mock_google_maps_key';

  useEffect(() => {
    if (isSimulation) {
      const timer = setTimeout(() => setLoading(false), 800);
      return () => clearTimeout(timer);
    }

    // Try loading actual Google Maps script
    const scriptId = 'google-maps-script';
    const existingScript = document.getElementById(scriptId);

    if (existingScript) {
      setGoogleMapsLoaded(true);
      setLoading(false);
      return;
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${mapsKey}`;
    script.async = true;
    script.onload = () => {
      setGoogleMapsLoaded(true);
      setLoading(false);
    };
    script.onerror = () => {
      // Fallback silently to simulation
      console.warn("Failed to load Google Maps script, fallback mode active.");
      setGoogleMapsLoaded(false);
      setLoading(false);
    };

    document.head.appendChild(script);
  }, [mapsKey, isSimulation]);

  const getMarkerIconColor = (type: string) => {
    switch (type) {
      case 'ev': return 'text-cyan-400 bg-cyan-950/50 border-cyan-500/30';
      case 'recycle': return 'text-emerald-400 bg-emerald-950/50 border-emerald-500/30';
      case 'bike': return 'text-brand-400 bg-brand-950/50 border-brand-500/30';
      case 'transit': return 'text-amber-400 bg-amber-950/50 border-amber-500/30';
      case 'store': return 'text-purple-400 bg-purple-950/50 border-purple-500/30';
      default: return 'text-gray-400 bg-dark-card border-dark-border';
    }
  };

  return (
    <div className="flex flex-col gap-8 h-[80vh]">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <Map className="h-7 w-7 text-brand-500" />
            Eco Resources Explorer
          </h1>
          <p className="text-sm text-gray-400 mt-2">
            Discover local EV chargers, recycling depots, bike docks, transit hubs, and zero-waste stores.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-950/40 px-3.5 py-1 text-xs text-brand-400 font-semibold">
          <Globe className="h-3.5 w-3.5" />
          <span>{isSimulation || !googleMapsLoaded ? 'Simulation Engine' : 'Google Maps Live'}</span>
        </div>
      </div>

      {loading ? (
        <div className="flex-grow flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
          <p className="text-sm font-medium text-gray-400">Loading map environment...</p>
        </div>
      ) : (
        <div className="flex-grow grid grid-cols-1 lg:grid-cols-12 gap-8 overflow-hidden min-h-0">
          {/* Left panel: Location listings */}
          <div className="lg:col-span-4 flex flex-col gap-4 overflow-y-auto pr-1 min-h-0 h-full">
            {MOCK_LOCATIONS.map((loc) => {
              const isSelected = selectedLoc?.id === loc.id;
              const typeColors = getMarkerIconColor(loc.type);
              
              return (
                <button
                  key={loc.id}
                  onClick={() => setSelectedLoc(loc)}
                  className={`text-left rounded-xl border p-4 transition-all flex items-start gap-3.5 ${
                    isSelected
                      ? 'border-brand-500 bg-brand-950/20 shadow-[0_0_10px_rgba(34,197,94,0.1)]'
                      : 'border-dark-border bg-dark-card hover:bg-slate-800'
                  }`}
                >
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center border shrink-0 ${typeColors}`}>
                    <MapPin className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">{loc.name}</h3>
                    <p className="text-xs text-gray-400 mt-1">{loc.address}</p>
                    <span className="inline-block mt-2 text-[9px] bg-dark-bg/60 text-gray-400 px-2 py-0.5 rounded border border-dark-border/40 font-mono capitalize">
                      {loc.type === 'ev' ? 'EV Charger' : loc.type === 'recycle' ? 'Recycling' : loc.type === 'bike' ? 'Bicycle Share' : loc.type === 'transit' ? 'Transit Station' : 'Eco Shop'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right panel: Map Display Canvas */}
          <div className="lg:col-span-8 border border-dark-border bg-dark-card rounded-2xl overflow-hidden relative flex flex-col h-full shadow-2xl min-h-0">
            {isSimulation || !googleMapsLoaded ? (
              // Simulated Interactive Map Canvas (Vector schematic layout)
              <div className="flex-grow bg-[#0c1322] relative overflow-hidden flex items-center justify-center">
                {/* SVG Schematic layout Grid */}
                <svg className="absolute inset-0 w-full h-full stroke-dark-border/30" strokeWidth="0.5">
                  <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                  {/* Rivers or streets lines */}
                  <path d="M0,100 Q150,200 400,100 T800,300" fill="none" className="stroke-slate-900/60" strokeWidth="48" />
                  <path d="M100,0 L100,500" fill="none" className="stroke-slate-800/40" strokeWidth="12" />
                  <path d="M0,280 L800,280" fill="none" className="stroke-slate-800/40" strokeWidth="12" />
                </svg>

                {/* Plot mock markers on the vector street layout */}
                {MOCK_LOCATIONS.map((loc, index) => {
                  const typeColors = getMarkerIconColor(loc.type);
                  // Fixed vector schematic coordinates for the 5 locations
                  const coords = [
                    { x: 180, y: 150 }, // VoltCharge
                    { x: 420, y: 320 }, // Metro Recycle
                    { x: 260, y: 80 },  // EcoRide
                    { x: 500, y: 220 }, // Grand Transit
                    { x: 120, y: 360 }, // GreenLife Store
                  ];
                  const coord = coords[index] || { x: 100, y: 100 };
                  const isSelected = selectedLoc?.id === loc.id;

                  return (
                    <button
                      key={loc.id}
                      onClick={() => setSelectedLoc(loc)}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full p-2 border transition-all ${typeColors} ${
                        isSelected ? 'scale-125 z-10 ring-4 ring-brand-500/20' : 'hover:scale-110 z-0'
                      }`}
                      style={{ left: `${coord.x}px`, top: `${coord.y}px` }}
                      aria-label={`Select marker ${loc.name}`}
                    >
                      <MapPin className="h-4.5 w-4.5" />
                    </button>
                  );
                })}

                {/* Selection Popup HUD overlay */}
                {selectedLoc && (
                  <div className="absolute bottom-6 left-6 right-6 glass-panel rounded-xl border border-dark-border p-4 shadow-2xl flex items-start justify-between gap-4 animate-fade-in">
                    <div>
                      <div className="flex items-center gap-2">
                        <Navigation className="h-4 w-4 text-brand-500 animate-pulse" />
                        <h4 className="text-sm font-bold text-white">{selectedLoc.name}</h4>
                      </div>
                      <p className="text-[10px] text-gray-400 mt-0.5">{selectedLoc.address}</p>
                      <p className="text-xs text-gray-300 mt-2 leading-relaxed">{selectedLoc.details}</p>
                    </div>
                    <button
                      className="rounded-lg bg-brand-600 px-3.5 py-1.5 text-[10px] font-bold text-white hover:bg-brand-500 transition-colors"
                      onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(selectedLoc.name + ', ' + selectedLoc.address)}`, '_blank')}
                    >
                      Directions
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // Live Google Maps mounting container (real Google maps mounts here)
              <GoogleMapsWrapper selectedLoc={selectedLoc} onSelect={setSelectedLoc} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Client Component to wrap Google Map API calls
function GoogleMapsWrapper({ 
  selectedLoc, 
  onSelect 
}: { 
  selectedLoc: EcoLocation | null; 
  onSelect: (loc: EcoLocation) => void;
}) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapRef.current || typeof window === 'undefined' || !window.google) return;

    // Centered coordinates matching our New York mock set
    const center = { lat: 40.7158, lng: -74.006 };
    const map = new window.google.maps.Map(mapRef.current, {
      center,
      zoom: 14,
      styles: [
        { elementType: 'geometry', stylers: [{ color: '#0b0f19' }] },
        { elementType: 'labels.text.stroke', stylers: [{ color: '#0b0f19' }] },
        { elementType: 'labels.text.fill', stylers: [{ color: '#5b6b8b' }] },
        { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#070a12' }] },
        { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1a233a' }] },
        { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#131b2e' }] }
      ]
    });

    MOCK_LOCATIONS.forEach((loc) => {
      const marker = new window.google.maps.Marker({
        position: { lat: loc.lat, lng: loc.lng },
        map,
        title: loc.name,
      });

      marker.addListener('click', () => {
        onSelect(loc);
      });
    });
  }, [onSelect]);

  return (
    <div className="w-full h-full relative flex flex-col justify-end">
      <div ref={mapRef} className="w-full h-full" />
      {selectedLoc && (
        <div className="absolute bottom-6 left-6 right-6 bg-dark-bg/95 border border-dark-border p-4 rounded-xl shadow-2xl">
          <h4 className="text-sm font-bold text-white">{selectedLoc.name}</h4>
          <p className="text-[10px] text-gray-400">{selectedLoc.address}</p>
          <p className="text-xs text-gray-300 mt-2">{selectedLoc.details}</p>
        </div>
      )}
    </div>
  );
}
declare global {
  interface Window {
    google: {
      maps: {
        Map: new (el: HTMLElement, opt: Record<string, unknown>) => unknown;
        Marker: new (opt: Record<string, unknown>) => {
          addListener: (event: string, cb: () => void) => void;
        };
      };
    };
  }
}
