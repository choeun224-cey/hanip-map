"use client";

import { useState } from "react";
import type { RestaurantFormData } from "@/types/restaurant";

interface AddModalProps {
  open: boolean;
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

export default function AddModal({ open, onClose, onSubmit }: AddModalProps) {
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

  if (!open) return null;

  const handleSearch = () => {
    if (!searchKeyword.trim()) return;
    setSearching(true);

    const ps = new kakao.maps.services.Places();
    ps.keywordSearch(searchKeyword, (results, status) => {
      setSearching(false);
      if (status === kakao.maps.services.Status.OK) {
        setSearchResults(results.slice(0, 5));
      } else {
        setSearchResults([]);
      }
    });
  };

  const handleSelectPlace = (place: kakao.maps.services.PlaceResult) => {
    setForm({
      ...form,
      name: place.place_name,
      address: place.road_address_name || place.address_name,
    });
    setSelectedPlace({
      lat: parseFloat(place.y),
      lng: parseFloat(place.x),
    });
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
          {/* Place Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              장소 검색
            </label>
            <div className="flex gap-2">
              <input
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="식당 이름이나 주소를 검색하세요"
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
              <ul className="mt-2 border border-gray-200 rounded-xl overflow-hidden">
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
            )}
          </div>

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
