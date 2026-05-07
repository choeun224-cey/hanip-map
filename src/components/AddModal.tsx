"use client";

import { useEffect, useState } from "react";
import type { RestaurantFormData } from "@/types/restaurant";

interface AddModalProps {
  open: boolean;
  initialLocation?: { lat: number; lng: number } | null;
  onClose: () => void;
  onSubmit: (data: RestaurantFormData & { lat: number; lng: number }) => void;
}

const CATEGORIES = ["한식", "양식", "중식", "일식", "카페", "술집", "분식", "기타"];
const AREAS: RestaurantFormData["area"][] = ["서울", "경기", "지방"];
const TAG_SUGGESTIONS = [
  "재방문필수",
  "데이트",
  "기념일",
  "가성비",
  "분위기좋은",
  "웨이팅있음",
  "주차가능",
  "야외석",
];

export default function AddModal({
  open,
  initialLocation,
  onClose,
  onSubmit,
}: AddModalProps) {
  const [form, setForm] = useState<RestaurantFormData>({
    name: "",
    address: "",
    region: "",
    area: "서울",
    category: "한식",
    memo: "",
    visited: false,
    tags: [],
  });
  const [searchResults, setSearchResults] = useState<
    kakao.maps.services.PlaceResult[]
  >([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedPlace, setSelectedPlace] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [searching, setSearching] = useState(false);

  // Reset when the modal closes
  useEffect(() => {
    if (open) return;
    setSelectedPlace(null);
    setSearchKeyword("");
    setSearchResults([]);
  }, [open]);

  // When opened with a location from the main map, auto-fill it
  useEffect(() => {
    if (!open || !initialLocation) return;
    if (typeof kakao === "undefined" || !kakao.maps) return;

    const { lat, lng } = initialLocation;
    setSelectedPlace({ lat, lng });

    const geocoder = new kakao.maps.services.Geocoder();
    geocoder.coord2Address(lng, lat, (result, status) => {
      const addr =
        status === kakao.maps.services.Status.OK
          ? result[0]?.road_address?.address_name ||
            result[0]?.address?.address_name ||
            ""
          : "";
      setForm((f) => ({ ...f, address: addr }));
    });
  }, [open, initialLocation]);

  if (!open) return null;

  const handleSearch = () => {
    if (!searchKeyword.trim()) return;
    setSearching(true);
    setSearchResults([]);

    const ps = new kakao.maps.services.Places();
    const accumulated: kakao.maps.services.PlaceResult[] = [];

    ps.keywordSearch(searchKeyword, (results, status, pagination) => {
      if (status !== kakao.maps.services.Status.OK) {
        setSearchResults([]);
        setSearching(false);
        return;
      }
      accumulated.push(...results);
      if (pagination.hasNextPage) {
        pagination.nextPage();
      } else {
        setSearchResults(accumulated);
        setSearching(false);
      }
    });
  };

  const handleSelectPlace = (place: kakao.maps.services.PlaceResult) => {
    const lat = parseFloat(place.y);
    const lng = parseFloat(place.x);
    setForm({
      ...form,
      name: place.place_name,
      address: place.road_address_name || place.address_name,
    });
    setSelectedPlace({ lat, lng });
    setSearchResults([]);
    setSearchKeyword(place.place_name);
  };

  const toggleTag = (tag: string) => {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const handleSubmit = () => {
    if (!form.name || !selectedPlace) return;
    onSubmit({ ...form, ...selectedPlace });
    setForm({
      name: "",
      address: "",
      region: "",
      area: "서울",
      category: "한식",
      memo: "",
      visited: false,
      tags: [],
    });
    setSearchKeyword("");
    setSelectedPlace(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold">맛집 추가</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400"
          >
            ✕
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Selected location (from map click or search) */}
          {selectedPlace && (
            <div className="flex items-start gap-2 p-3 bg-orange-50 border border-orange-100 rounded-xl">
              <span className="text-base leading-5">📍</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-800 break-words">
                  {form.address || "주소 변환 중..."}
                </p>
                <button
                  onClick={onClose}
                  className="mt-1 text-xs text-orange-600 hover:underline"
                >
                  지도에서 다시 선택
                </button>
              </div>
            </div>
          )}

          {/* Search (alternative to map click) */}
          {!selectedPlace && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                가게 이름으로 검색
              </label>
              <p className="text-xs text-gray-400 mb-2">
                또는 모달을 닫고 지도에서 직접 위치를 클릭하세요
              </p>
              <div className="flex gap-2">
                <input
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="가게 이름"
                  className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary"
                />
                <button
                  onClick={handleSearch}
                  disabled={searching}
                  className="px-4 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
                >
                  검색
                </button>
              </div>
              {searchResults.length > 0 && (
                <>
                  <p className="mt-2 text-xs text-gray-400">
                    검색 결과 {searchResults.length}개
                  </p>
                  <ul className="mt-1 border border-gray-200 rounded-xl overflow-y-auto max-h-72">
                    {searchResults.map((place, i) => (
                      <li
                        key={`${place.place_name}-${i}`}
                        onClick={() => handleSelectPlace(place)}
                        className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0"
                      >
                        <p className="text-sm font-medium">{place.place_name}</p>
                        <p className="text-xs text-gray-500">
                          {place.road_address_name || place.address_name}
                        </p>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}

          {selectedPlace && (
            <>
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  식당명
                </label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary"
                />
              </div>

              {/* Area & Region */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    권역
                  </label>
                  <div className="flex gap-1.5">
                    {AREAS.map((area) => (
                      <button
                        key={area}
                        onClick={() => setForm({ ...form, area })}
                        className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${
                          form.area === area
                            ? "bg-gray-900 text-white"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {area}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    지역 (예: 강남, 홍대)
                  </label>
                  <input
                    value={form.region}
                    onChange={(e) => setForm({ ...form, region: e.target.value })}
                    placeholder="세부 지역"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  카테고리
                </label>
                <div className="flex gap-1.5 flex-wrap">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setForm({ ...form, category: cat })}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                        form.category === cat
                          ? "bg-primary text-white"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Visited */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  방문 여부
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setForm({ ...form, visited: true })}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      form.visited
                        ? "bg-visited text-white"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    가봤어요
                  </button>
                  <button
                    onClick={() => setForm({ ...form, visited: false })}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      !form.visited
                        ? "bg-want text-white"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    가고싶어요
                  </button>
                </div>
              </div>

              {/* Rating (only if visited) */}
              {form.visited && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    별점
                  </label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setForm({ ...form, rating: star })}
                        className={`text-2xl ${
                          (form.rating ?? 0) >= star
                            ? "text-primary"
                            : "text-gray-200"
                        }`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  태그
                </label>
                <div className="flex gap-1.5 flex-wrap">
                  {TAG_SUGGESTIONS.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                        form.tags.includes(tag)
                          ? "bg-primary text-white"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Memo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  메모
                </label>
                <textarea
                  value={form.memo}
                  onChange={(e) => setForm({ ...form, memo: e.target.value })}
                  placeholder="한줄평이나 메모를 남겨보세요"
                  rows={2}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary resize-none"
                />
              </div>
            </>
          )}
        </div>

        {/* Submit */}
        <div className="p-5 border-t border-gray-100">
          <button
            onClick={handleSubmit}
            disabled={!form.name || !selectedPlace}
            className="w-full py-3 bg-primary text-white rounded-xl font-semibold hover:bg-orange-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            추가하기
          </button>
        </div>
      </div>
    </div>
  );
}
