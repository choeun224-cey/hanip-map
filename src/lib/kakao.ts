declare global {
  interface Window {
    kakao: typeof kakao;
  }
}

declare namespace kakao.maps {
  class LatLng {
    constructor(lat: number, lng: number);
    getLat(): number;
    getLng(): number;
  }
  class Map {
    constructor(container: HTMLElement, options: { center: LatLng; level: number });
    setCenter(latlng: LatLng): void;
    setLevel(level: number): void;
    getCenter(): LatLng;
    panTo(latlng: LatLng): void;
  }
  class Marker {
    constructor(options: { position: LatLng; map?: Map; image?: MarkerImage });
    setMap(map: Map | null): void;
    getPosition(): LatLng;
  }
  class MarkerImage {
    constructor(src: string, size: Size, options?: { offset?: Point });
  }
  class Size {
    constructor(width: number, height: number);
  }
  class Point {
    constructor(x: number, y: number);
  }
  class InfoWindow {
    constructor(options: { content: string; removable?: boolean });
    open(map: Map, marker: Marker): void;
    close(): void;
  }
  class CustomOverlay {
    constructor(options: {
      position: LatLng;
      content: string | HTMLElement;
      yAnchor?: number;
      xAnchor?: number;
    });
    setMap(map: Map | null): void;
  }

  namespace services {
    class Geocoder {
      addressSearch(
        address: string,
        callback: (result: { x: string; y: string }[], status: string) => void
      ): void;
    }
    class Places {
      keywordSearch(
        keyword: string,
        callback: (result: PlaceResult[], status: string) => void
      ): void;
    }
    interface PlaceResult {
      place_name: string;
      address_name: string;
      road_address_name: string;
      x: string;
      y: string;
      category_name: string;
      phone: string;
    }
    const Status: { OK: string; ZERO_RESULT: string; ERROR: string };
  }

  namespace event {
    function addListener(
      target: Map | Marker,
      type: string,
      callback: (...args: unknown[]) => void
    ): void;
  }

  function load(callback: () => void): void;
}

export function loadKakaoMap(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.kakao?.maps) {
      window.kakao.maps.load(() => resolve());
      return;
    }

    const script = document.createElement("script");
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}&autoload=false&libraries=services`;
    script.onload = () => {
      window.kakao.maps.load(() => resolve());
    };
    script.onerror = () => reject(new Error("카카오맵 로드 실패"));
    document.head.appendChild(script);
  });
}
