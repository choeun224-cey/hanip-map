export interface Restaurant {
  id: string;
  name: string;
  address: string;
  region: string;
  area: "서울" | "경기" | "지방";
  category: string;
  memo: string;
  visited: boolean;
  rating?: number;
  lat: number;
  lng: number;
  tags: string[];
  photos: string[];
  created_at: string;
}

export interface RestaurantFormData {
  name: string;
  address: string;
  region: string;
  area: "서울" | "경기" | "지방";
  category: string;
  memo: string;
  visited: boolean;
  rating?: number;
  tags: string[];
}

export type FilterState = {
  area: string;
  category: string;
  visited: "all" | "visited" | "want";
};
