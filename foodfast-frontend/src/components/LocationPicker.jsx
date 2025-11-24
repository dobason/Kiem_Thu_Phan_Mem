import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix lỗi icon mặc định của Leaflet trong React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Component xử lý sự kiện click trên bản đồ
const LocationMarker = ({ position, setPosition }) => {
    const map = useMap();

    useMapEvents({
        click(e) {
            setPosition(e.latlng);
            map.flyTo(e.latlng, map.getZoom());
        },
    });

    useEffect(() => {
        if (position) {
            map.flyTo(position, map.getZoom());
        }
    }, [position, map]);

    return position === null ? null : (
        <Marker position={position}></Marker>
    );
};

const LocationPicker = ({ lat, lng, onLocationSelect }) => {
    const [position, setPosition] = useState(null);

    // Khởi tạo vị trí ban đầu nếu có props
    useEffect(() => {
        if (lat && lng) {
            setPosition({ lat: parseFloat(lat), lng: parseFloat(lng) });
        }
    }, [lat, lng]);

    const handleSetPosition = (newPos) => {
        setPosition(newPos);
        onLocationSelect(newPos.lat, newPos.lng);
    };

    // Tọa độ mặc định (TP.HCM) nếu chưa chọn
    const defaultCenter = [10.762622, 106.660172];
    const center = position ? [position.lat, position.lng] : defaultCenter;

    return (
        <div className="h-[400px] w-full rounded-lg overflow-hidden border border-gray-300 shadow-sm z-0">
            <MapContainer
                center={center}
                zoom={13}
                scrollWheelZoom={true}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker position={position} setPosition={handleSetPosition} />
            </MapContainer>
        </div>
    );
};

export default LocationPicker;
