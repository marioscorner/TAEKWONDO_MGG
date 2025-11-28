// src/components/GoogleMap.tsx
"use client";

interface GoogleMapProps {
  location: string;
  width?: string;
  height?: string;
  className?: string;
}

export default function GoogleMap({ 
  location, 
  width = "100%", 
  height = "400", 
  className = "" 
}: GoogleMapProps) {
  // Construir URL del iframe de Google Maps
  const mapUrl = `https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}&q=${encodeURIComponent(location)}`;

  // URL alternativa sin API key (menos features pero funciona)
  const simpleMapUrl = `https://www.google.com/maps?q=${encodeURIComponent(location)}&output=embed`;

  return (
    <div className={`w-full ${className}`}>
      <iframe
        src={simpleMapUrl}
        width={width}
        height={height}
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="rounded-lg w-full"
        title={`Mapa de ${location}`}
      />
    </div>
  );
}

