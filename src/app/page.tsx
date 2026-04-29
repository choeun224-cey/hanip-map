"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import KakaoMap from "@/components/KakaoMap";
import Sidebar from "@/components/Sidebar";
import AddModal from "@/components/AddModal";
import DetailPanel from "@/components/DetailPanel";
import RandomPicker from "@/components/RandomPicker";
import { supabase } from "@/lib/supabase";
import { getCurrentPosition, haversineDistance, type LatLng } from "@/lib/geo";
import { useDialog } from "@/lib/dialog";
import { useAuth } from "@/lib/auth";
import type { Restaurant, FilterState, RestaurantFormData } from "@/types/restaurant";

export default function Home() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedId, setSelectedId] = useState<string>();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRandom, setShowRandom] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [user, authLoading, router]);
  const [userLocation, setUserLocation] = useState<LatLng | null>(null);
  const [sortByDistance, setSortByDistance] = useState(false);
  const [locating, setLocating] = useState(false);
  const [filter, setFilter] = useState<FilterState>({
    area: "전체",
    category: "",
    visited: "all",
  });
  const { toast } = useDialog();

  const handleLocate = async () => {
    setLocating(true);
    try {
      const pos = await getCurrentPosition();
      setUserLocation(pos);
      setSortByDistance(true);
      toast("현재 위치를 찾았어요", "success");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "위치 가져오기 실패";
      toast(msg, "error");
    } finally {
      setLocating(false);
    }
  };

  // Fetch restaurants once authenticated
  useEffect(() => {
    if (!user) return;
    const fetchRestaurants = async () => {
      const { data } = await supabase
        .from("restaurants")
        .select("*")
        .order("created_at", { ascending: false });
      if (data) setRestaurants(data);
    };
    fetchRestaurants();
  }, [user]);

  // Filter + optional distance sort
  const filteredRestaurants = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = restaurants.filter((r) => {
      if (filter.area !== "전체" && r.area !== filter.area) return false;
      if (filter.category && r.category !== filter.category) return false;
      if (filter.visited === "visited" && !r.visited) return false;
      if (filter.visited === "want" && r.visited) return false;
      if (q) {
        const haystack = [
          r.name,
          r.region,
          r.address,
          r.memo,
          r.category,
          ...(r.tags || []),
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });

    if (sortByDistance && userLocation) {
      return [...filtered].sort((a, b) => {
        const da = haversineDistance(userLocation.lat, userLocation.lng, a.lat, a.lng);
        const db = haversineDistance(userLocation.lat, userLocation.lng, b.lat, b.lng);
        return da - db;
      });
    }

    return filtered;
  }, [restaurants, filter, search, sortByDistance, userLocation]);

  const selectedRestaurant = useMemo(
    () => restaurants.find((r) => r.id === selectedId),
    [restaurants, selectedId]
  );

  const handleMarkerClick = useCallback((r: Restaurant) => {
    setSelectedId(r.id);
  }, []);

  const handleAddRestaurant = async (
    data: RestaurantFormData & { lat: number; lng: number }
  ) => {
    const { data: inserted, error } = await supabase
      .from("restaurants")
      .insert({
        name: data.name,
        address: data.address,
        region: data.region,
        area: data.area,
        category: data.category,
        memo: data.memo,
        visited: data.visited,
        rating: data.rating || null,
        lat: data.lat,
        lng: data.lng,
        tags: data.tags,
      })
      .select()
      .single();

    if (!error && inserted) {
      setRestaurants((prev) => [inserted, ...prev]);
      setSelectedId(inserted.id);
    }
  };

  const handleToggleVisited = async (id: string, visited: boolean) => {
    const { error } = await supabase
      .from("restaurants")
      .update({ visited })
      .eq("id", id);

    if (!error) {
      setRestaurants((prev) =>
        prev.map((r) => (r.id === id ? { ...r, visited } : r))
      );
    }
  };

  const handleUpdateRating = async (id: string, rating: number) => {
    const { error } = await supabase
      .from("restaurants")
      .update({ rating })
      .eq("id", id);

    if (!error) {
      setRestaurants((prev) =>
        prev.map((r) => (r.id === id ? { ...r, rating } : r))
      );
    }
  };

  const handleUpdatePhotos = async (id: string, photos: string[]) => {
    const { error } = await supabase
      .from("restaurants")
      .update({ photos })
      .eq("id", id);

    if (!error) {
      setRestaurants((prev) =>
        prev.map((r) => (r.id === id ? { ...r, photos } : r))
      );
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("restaurants")
      .delete()
      .eq("id", id);

    if (!error) {
      setRestaurants((prev) => prev.filter((r) => r.id !== id));
      setSelectedId(undefined);
    }
  };

  const handleRandomSelect = useCallback((r: Restaurant) => {
    setSelectedId(r.id);
  }, []);

  if (authLoading || !user) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col md:flex-row relative">
      {/* Mobile toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="md:hidden fixed top-4 left-4 z-30 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center"
      >
        {sidebarOpen ? "✕" : "☰"}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed md:relative z-20 h-full transition-transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <Sidebar
          restaurants={filteredRestaurants}
          filter={filter}
          search={search}
          onSearchChange={setSearch}
          onFilterChange={setFilter}
          onSelect={(r) => {
            setSelectedId(r.id);
            setSidebarOpen(false);
          }}
          onAddClick={() => setShowAddModal(true)}
          onRandomPick={() => setShowRandom(true)}
          selectedId={selectedId}
          userLocation={userLocation}
          sortByDistance={sortByDistance}
          onToggleSortByDistance={() => setSortByDistance((v) => !v)}
        />
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <KakaoMap
          restaurants={filteredRestaurants}
          onMarkerClick={handleMarkerClick}
          selectedId={selectedId}
          userLocation={userLocation}
        />

        {/* Locate button */}
        <button
          onClick={handleLocate}
          disabled={locating}
          className="absolute top-4 right-4 z-10 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-60"
          title="현재 위치 찾기"
        >
          {locating ? (
            <span className="w-4 h-4 border-2 border-gray-300 border-t-primary rounded-full animate-spin" />
          ) : (
            <span className={`text-xl ${userLocation ? "text-primary" : "text-gray-700"}`}>
              📍
            </span>
          )}
        </button>

        {/* Detail Panel */}
        {selectedRestaurant && (
          <DetailPanel
            restaurant={selectedRestaurant}
            onClose={() => setSelectedId(undefined)}
            onToggleVisited={handleToggleVisited}
            onUpdateRating={handleUpdateRating}
            onUpdatePhotos={handleUpdatePhotos}
            onDelete={handleDelete}
          />
        )}
      </div>

      {/* Modals */}
      <AddModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddRestaurant}
      />
      <RandomPicker
        open={showRandom}
        restaurants={filteredRestaurants}
        onClose={() => setShowRandom(false)}
        onSelect={handleRandomSelect}
      />
    </div>
  );
}
