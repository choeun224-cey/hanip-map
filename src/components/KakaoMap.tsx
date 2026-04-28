"use client";

import { useEffect, useRef, useCallback } from "react";
import { loadKakaoMap } from "@/lib/kakao";
import type { Restaurant } from "@/types/restaurant";

interface KakaoMapProps {
  restaurants: Restaurant[];
  onMarkerClick: (restaurant: Restaurant) => void;
  selectedId?: string;
}

export default function KakaoMap({
  restaurants,
  onMarkerClick,
  selectedId,
}: KakaoMapProps) {
  const mapRef = useRef<kakao.maps.Map | null>(null);
  const markersRef = useRef<kakao.maps.Marker[]>([]);
  const overlaysRef = useRef<kakao.maps.CustomOverlay[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadKakaoMap().then(() => {
      if (!containerRef.current) return;

      const map = new kakao.maps.Map(containerRef.current, {
        center: new kakao.maps.LatLng(37.5665, 126.978),
        level: 8,
      });
      mapRef.current = map;
    });
  }, []);

  // Pan to the selected restaurant whenever selection changes
  useEffect(() => {
    if (!mapRef.current || !selectedId) return;
    const r = restaurants.find((r) => r.id === selectedId);
    if (r && r.lat && r.lng) {
      mapRef.current.panTo(new kakao.maps.LatLng(r.lat, r.lng));
    }
  }, [selectedId, restaurants]);

  const clearMarkers = useCallback(() => {
    markersRef.current.forEach((m) => m.setMap(null));
    overlaysRef.current.forEach((o) => o.setMap(null));
    markersRef.current = [];
    overlaysRef.current = [];
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    clearMarkers();

    const map = mapRef.current;

    restaurants.forEach((r) => {
      if (!r.lat || !r.lng) return;

      const position = new kakao.maps.LatLng(r.lat, r.lng);

      const markerColor = r.visited ? "#ff6b35" : "#3b82f6";
      const markerSvg = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="40" viewBox="0 0 28 40">
          <path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 26 14 26s14-15.5 14-26C28 6.268 21.732 0 14 0z" fill="${markerColor}"/>
          <circle cx="14" cy="14" r="6" fill="white"/>
        </svg>
      `)}`;

      const markerImage = new kakao.maps.MarkerImage(
        markerSvg,
        new kakao.maps.Size(28, 40),
        { offset: new kakao.maps.Point(14, 40) }
      );

      const marker = new kakao.maps.Marker({ position, map, image: markerImage });

      const isSelected = r.id === selectedId;
      const overlayContent = `
        <div style="
          padding: 6px 12px;
          background: ${isSelected ? markerColor : "white"};
          color: ${isSelected ? "white" : "#1a1a1a"};
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          white-space: nowrap;
          transform: translateY(-8px);
          border: 2px solid ${markerColor};
        ">${r.name}</div>
      `;

      const overlay = new kakao.maps.CustomOverlay({
        position,
        content: overlayContent,
        yAnchor: 2.8,
      });
      overlay.setMap(map);

      kakao.maps.event.addListener(marker, "click", () => {
        onMarkerClick(r);
        map.panTo(position);
      });

      markersRef.current.push(marker);
      overlaysRef.current.push(overlay);
    });
  }, [restaurants, selectedId, onMarkerClick, clearMarkers]);

  return <div ref={containerRef} className="w-full h-full" />;
}
