'use client';

import { COMPANY_MAP_CENTER } from '@/lib/constants';
import Script from 'next/script';
import { useEffect, useRef, useState } from 'react';

interface YandexMapProps {
  center?: [number, number];
  zoom?: number;
  height?: string;
}

interface YmapsMapInstance {
  geoObjects: { add: (obj: unknown) => void };
  destroy: () => void;
}

interface YmapsNamespace {
  ready: (cb: () => void) => void;
  Map: new (
    el: HTMLElement,
    state: { center: [number, number]; zoom: number; controls?: string[] },
    options?: { suppressMapOpenBlock?: boolean }
  ) => YmapsMapInstance;
  Placemark: new (
    geometry: [number, number],
    properties: { balloonContent?: string; hintContent?: string },
    options: { preset?: string }
  ) => unknown;
}

export default function YandexMap({
  center = COMPANY_MAP_CENTER,
  zoom = 16,
  height = '400px',
}: YandexMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<YmapsMapInstance | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const apiKey = process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY?.trim();
  const useJsApi = Boolean(apiKey);

  const [lon, lat] = center;
  const iframeSrc = `https://yandex.ru/map-widget/v1/?ll=${encodeURIComponent(`${lon},${lat}`)}&z=${zoom}`;

  useEffect(() => {
    if (!useJsApi || !isLoaded || !containerRef.current) return;

    const ymaps = (window as unknown as { ymaps?: YmapsNamespace }).ymaps;
    if (!ymaps) return;

    ymaps.ready(() => {
      const el = containerRef.current;
      if (!el) return;

      mapInstanceRef.current?.destroy();
      mapInstanceRef.current = null;

      const map = new ymaps.Map(
        el,
        {
          center: [lon, lat],
          zoom,
          controls: ['zoomControl', 'fullscreenControl'],
        },
        { suppressMapOpenBlock: true }
      );

      const placemark = new ymaps.Placemark(
        [lon, lat],
        {
          balloonContent: 'ООО «Умная зарядка»',
          hintContent: 'Умная зарядка',
        },
        { preset: 'islands#redDotIcon' }
      );

      map.geoObjects.add(placemark);
      mapInstanceRef.current = map;
    });

    return () => {
      mapInstanceRef.current?.destroy();
      mapInstanceRef.current = null;
    };
  }, [isLoaded, useJsApi, lon, lat, zoom]);

  if (!useJsApi) {
    return (
      <iframe
        title="Карта: ООО «Умная зарядка», Саратов"
        src={iframeSrc}
        className="w-full rounded-lg border-0"
        style={{ height }}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    );
  }

  const mapsApiKey = apiKey as string;

  return (
    <>
      <Script
        src={`https://api-maps.yandex.ru/2.1/?apikey=${encodeURIComponent(mapsApiKey)}&lang=ru_RU`}
        strategy="afterInteractive"
        onLoad={() => setIsLoaded(true)}
      />
      <div
        ref={containerRef}
        className="w-full overflow-hidden rounded-lg bg-surface-light"
        style={{ height }}
      />
    </>
  );
}
