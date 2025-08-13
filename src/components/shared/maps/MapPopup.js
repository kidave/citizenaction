// components/shared/maps/MapPopup.js
"use client";

export default function MapPopup({ title, content }) {
  return (
    <div className="map-popup">
      {title && <h4>{title}</h4>}
      <div className="popup-content">{content}</div>
    </div>
  );
}
