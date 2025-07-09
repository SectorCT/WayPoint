import React, { useState, useRef } from 'react';
// @ts-ignore
import { Map, Marker } from '@vis.gl/react-maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

const DEFAULT_POSITION = { lat: 42.6977, lng: 23.3219 }; // Sofia, BG

const modalStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  background: 'rgba(0,0,0,0.4)',
  zIndex: 1000,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const cardStyle: React.CSSProperties = {
  background: '#fff',
  borderRadius: 12,
  padding: 24,
  minWidth: 350,
  minHeight: 400,
  boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
};

const buttonRow: React.CSSProperties = {
  display: 'flex',
  gap: 12,
  marginTop: 16,
};

const mapStyle: React.CSSProperties = {
  width: 400,
  height: 350,
  borderRadius: 8,
};

interface MapPickerModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (lat: number, lng: number) => void;
  initialLat?: number;
  initialLng?: number;
}

const MapPickerModal: React.FC<MapPickerModalProps> = ({ open, onClose, onConfirm, initialLat, initialLng }) => {
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(
    initialLat && initialLng ? { lat: initialLat, lng: initialLng } : null
  );
  const mapRef = useRef<any>(null);

  if (!open) return null;

  return (
    <div style={modalStyle}>
      <div style={cardStyle}>
        <h3>Pick Delivery Location</h3>
        <div style={mapStyle}>
          <Map
            ref={mapRef}
            initialViewState={{
              latitude: initialLat || DEFAULT_POSITION.lat,
              longitude: initialLng || DEFAULT_POSITION.lng,
              zoom: 13,
              bearing: 0,
              pitch: 0,
            }}
            style={{ width: '100%', height: '100%', borderRadius: 8 }}
            mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
            onClick={e => {
              const { lngLat } = e;
              setPosition({ lat: lngLat.lat, lng: lngLat.lng });
            }}
          >
            {position && (
              <Marker longitude={position.lng} latitude={position.lat} color="#F39358" />
            )}
          </Map>
        </div>
        <div style={buttonRow}>
          <button onClick={onClose}>Cancel</button>
          <button
            onClick={() => position && onConfirm(position.lat, position.lng)}
            disabled={!position}
            style={{ background: '#F39358', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 600 }}
          >
            Confirm Location
          </button>
        </div>
      </div>
    </div>
  );
};

export default MapPickerModal; 