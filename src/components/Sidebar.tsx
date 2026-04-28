"use client";

import Link from "next/link";
import type { Restaurant, FilterState } from "@/types/restaurant";

interface SidebarProps {
  restaurants: Restaurant[];
  filter: FilterState;
  search: string;
  onSearchChange: (search: string) => void;
  onFilterChange: (filter: FilterState) => void;
  onSelect: (restaurant: Restaurant) => void;
  onAddClick: () => void;
  onRandomPick: () => void;
  selectedId?: string;
}

const CATEGORIES = ["전체", "한식", "양식", "중식", "일식", "카페", "술집", "분식", "기타"];
const AREAS = ["전체", "서울", "경기", "지방"];

export default function Sidebar({
  restaurants,
  filter,
  search,
  onSearchChange,
  onFilterChange,
  onSelect,
  onAddClick,
  onRandomPick,
  selectedId,
}: SidebarProps) {
  return (
    <aside className="w-full md:w-[360px] h-full flex flex-col bg-white border-r border-gray-100">
      {/* Header */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">
            한입지도
            <span className="ml-2 text-sm font-normal text-gray-400">
              {restaurants.length}곳
            </span>
          </h1>
          <Link
            href="/import"
            className="text-xs text-gray-400 hover:text-primary transition-colors"
            title="시트에서 일괄 가져오기"
          >
            📋 일괄 가져오기
          </Link>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-3">
          <button
            onClick={onAddClick}
            className="flex-1 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-orange-600 transition-colors"
          >
            + 맛집 추가
          </button>
          <button
            onClick={onRandomPick}
            className="px-4 py-2.5 bg-primary-light text-primary rounded-xl text-sm font-semibold hover:bg-orange-100 transition-colors"
            title="오늘 뭐 먹지?"
          >
            🎲
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 pt-3">
        <div className="relative">
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="식당명, 지역, 메모, 태그 검색"
            className="w-full pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition-colors"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
            🔍
          </span>
          {search && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-200 text-xs"
              title="지우기"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 border-b border-gray-100 space-y-3">
        {/* Area Filter */}
        <div className="flex gap-1.5 flex-wrap">
          {AREAS.map((area) => (
            <button
              key={area}
              onClick={() => onFilterChange({ ...filter, area })}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filter.area === area
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {area}
            </button>
          ))}
        </div>

        {/* Category Filter */}
        <div className="flex gap-1.5 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() =>
                onFilterChange({ ...filter, category: cat === "전체" ? "" : cat })
              }
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                (cat === "전체" && !filter.category) || filter.category === cat
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Visited Filter */}
        <div className="flex gap-1.5">
          {[
            { value: "all", label: "전체" },
            { value: "visited", label: "가봤어요" },
            { value: "want", label: "가고싶어요" },
          ].map(({ value, label }) => (
            <button
              key={value}
              onClick={() =>
                onFilterChange({
                  ...filter,
                  visited: value as FilterState["visited"],
                })
              }
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filter.visited === value
                  ? value === "visited"
                    ? "bg-visited text-white"
                    : value === "want"
                    ? "bg-want text-white"
                    : "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Restaurant List */}
      <div className="flex-1 overflow-y-auto">
        {restaurants.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm">
            <p>등록된 맛집이 없어요</p>
            <p className="mt-1">첫 맛집을 추가해보세요!</p>
          </div>
        ) : (
          <ul>
            {restaurants.map((r) => (
              <li
                key={r.id}
                onClick={() => onSelect(r)}
                className={`p-4 border-b border-gray-50 cursor-pointer transition-colors hover:bg-gray-50 ${
                  selectedId === r.id ? "bg-primary-light" : ""
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-block w-2 h-2 rounded-full ${
                          r.visited ? "bg-visited" : "bg-want"
                        }`}
                      />
                      <h3 className="font-semibold text-sm text-gray-900 truncate">
                        {r.name}
                      </h3>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 ml-4">
                      {r.region} · {r.category}
                    </p>
                    {r.memo && (
                      <p className="text-xs text-gray-400 mt-0.5 ml-4 truncate">
                        {r.memo}
                      </p>
                    )}
                  </div>
                  {r.rating && (
                    <span className="text-xs font-medium text-primary ml-2">
                      ★ {r.rating}
                    </span>
                  )}
                </div>
                {r.tags.length > 0 && (
                  <div className="flex gap-1 mt-2 ml-4">
                    {r.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-[10px]"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}
