"use client";

import type { Restaurant } from "@/types/restaurant";
import PhotoGallery from "./PhotoGallery";
import { useDialog } from "@/lib/dialog";

interface DetailPanelProps {
  restaurant: Restaurant;
  onClose: () => void;
  onToggleVisited: (id: string, visited: boolean) => void;
  onUpdateRating: (id: string, rating: number) => void;
  onUpdatePhotos: (id: string, photos: string[]) => void;
  onDelete: (id: string) => void;
}

export default function DetailPanel({
  restaurant: r,
  onClose,
  onToggleVisited,
  onUpdateRating,
  onUpdatePhotos,
  onDelete,
}: DetailPanelProps) {
  const { confirm } = useDialog();

  const handleDeleteClick = async () => {
    const ok = await confirm({
      title: "정말 삭제할까요?",
      message: `${r.name}이(가) 지도에서 완전히 사라져요.\n등록된 사진과 메모도 같이 사라집니다.`,
      confirmText: "삭제",
      destructive: true,
    });
    if (ok) onDelete(r.id);
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 md:left-[360px] bg-white rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.1)] z-20 p-5 max-h-[40vh] overflow-y-auto">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`inline-block w-2.5 h-2.5 rounded-full ${
                r.visited ? "bg-visited" : "bg-want"
              }`}
            />
            <h2 className="text-lg font-bold">{r.name}</h2>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {r.address}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {r.area} · {r.region} · {r.category}
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400"
        >
          ✕
        </button>
      </div>

      {/* Photos */}
      <PhotoGallery
        restaurantId={r.id}
        photos={r.photos || []}
        onPhotosChange={(photos) => onUpdatePhotos(r.id, photos)}
      />

      {/* Rating */}
      <div className="flex items-center gap-1 mb-3">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => onUpdateRating(r.id, star)}
            className={`text-xl ${
              (r.rating ?? 0) >= star ? "text-primary" : "text-gray-200"
            }`}
          >
            ★
          </button>
        ))}
        {r.rating && (
          <span className="text-sm text-gray-500 ml-1">{r.rating}점</span>
        )}
      </div>

      {/* Tags */}
      {r.tags.length > 0 && (
        <div className="flex gap-1.5 flex-wrap mb-3">
          {r.tags.map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Memo */}
      {r.memo && (
        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-xl mb-3">
          {r.memo}
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => onToggleVisited(r.id, !r.visited)}
          className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            r.visited
              ? "bg-want text-white"
              : "bg-visited text-white"
          }`}
        >
          {r.visited ? "가고싶어요로 변경" : "가봤어요로 변경"}
        </button>
        <button
          onClick={handleDeleteClick}
          className="px-4 py-2.5 bg-gray-100 text-gray-500 rounded-xl text-sm font-medium hover:bg-red-50 hover:text-red-500 transition-colors"
        >
          삭제
        </button>
      </div>
    </div>
  );
}
