"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { uploadPhoto, deletePhoto } from "@/lib/storage";
import { useDialog } from "@/lib/dialog";

interface PhotoGalleryProps {
  restaurantId: string;
  photos: string[];
  onPhotosChange: (photos: string[]) => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export default function PhotoGallery({
  restaurantId,
  photos,
  onPhotosChange,
}: PhotoGalleryProps) {
  const [uploading, setUploading] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast, confirm } = useDialog();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const validFiles = Array.from(files).filter((f) => {
      if (!f.type.startsWith("image/")) {
        toast(`${f.name}: 이미지 파일만 업로드 가능합니다.`, "error");
        return false;
      }
      if (f.size > MAX_FILE_SIZE) {
        toast(`${f.name}: 5MB 이하 파일만 업로드 가능합니다.`, "error");
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setUploading(true);
    try {
      const uploaded = await Promise.all(
        validFiles.map((f) => uploadPhoto(f, restaurantId))
      );
      onPhotosChange([...photos, ...uploaded]);
      toast(`${uploaded.length}장 업로드 완료`, "success");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "업로드 실패";
      toast(`업로드 실패: ${msg}`, "error");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleDelete = async (url: string) => {
    const ok = await confirm({
      message: "이 사진을 삭제할까요?",
      confirmText: "삭제",
      destructive: true,
    });
    if (!ok) return;
    try {
      await deletePhoto(url);
      onPhotosChange(photos.filter((p) => p !== url));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "삭제 실패";
      toast(`삭제 실패: ${msg}`, "error");
    }
  };

  return (
    <>
      <div className="mb-3">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {photos.map((url) => (
            <div key={url} className="relative shrink-0 group">
              <button
                onClick={() => setLightbox(url)}
                className="block w-20 h-20 rounded-lg overflow-hidden bg-gray-100 relative"
              >
                <Image
                  src={url}
                  alt=""
                  fill
                  sizes="80px"
                  className="object-cover"
                  unoptimized
                />
              </button>
              <button
                onClick={() => handleDelete(url)}
                className="absolute -top-1 -right-1 w-5 h-5 bg-black/70 text-white rounded-full text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
                title="삭제"
              >
                ✕
              </button>
            </div>
          ))}

          <button
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="shrink-0 w-20 h-20 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
          >
            {uploading ? (
              <span className="text-xs">업로드 중...</span>
            ) : (
              <>
                <span className="text-xl">+</span>
                <span className="text-[10px]">사진</span>
              </>
            )}
          </button>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleUpload}
          className="hidden"
        />
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <Image
            src={lightbox}
            alt=""
            width={1200}
            height={1200}
            className="max-w-full max-h-full w-auto h-auto object-contain"
            unoptimized
          />
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 w-10 h-10 bg-white/10 text-white rounded-full hover:bg-white/20"
          >
            ✕
          </button>
        </div>
      )}
    </>
  );
}
