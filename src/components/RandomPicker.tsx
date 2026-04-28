"use client";

import { useState, useEffect } from "react";
import type { Restaurant } from "@/types/restaurant";

interface RandomPickerProps {
  open: boolean;
  restaurants: Restaurant[];
  onClose: () => void;
  onSelect: (restaurant: Restaurant) => void;
}

export default function RandomPicker({
  open,
  restaurants,
  onClose,
  onSelect,
}: RandomPickerProps) {
  const [rolling, setRolling] = useState(false);
  const [current, setCurrent] = useState<Restaurant | null>(null);
  const [result, setResult] = useState<Restaurant | null>(null);

  useEffect(() => {
    if (!open) {
      setResult(null);
      setCurrent(null);
    }
  }, [open]);

  if (!open) return null;

  const roll = () => {
    if (restaurants.length === 0) return;
    setRolling(true);
    setResult(null);

    let count = 0;
    const maxCount = 15;
    const interval = setInterval(() => {
      const random = restaurants[Math.floor(Math.random() * restaurants.length)];
      setCurrent(random);
      count++;
      if (count >= maxCount) {
        clearInterval(interval);
        setRolling(false);
        setResult(random);
      }
    }, 100);
  };

  const display = result || current;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl w-full max-w-sm mx-4 p-6 text-center">
        <h2 className="text-lg font-bold mb-2">오늘 뭐 먹지?</h2>
        <p className="text-sm text-gray-500 mb-6">
          {restaurants.length}곳 중에서 골라볼게요
        </p>

        <div
          className={`py-8 px-4 rounded-2xl mb-6 transition-all ${
            rolling
              ? "bg-primary-light animate-pulse"
              : result
              ? "bg-primary-light"
              : "bg-gray-50"
          }`}
        >
          {display ? (
            <>
              <p className="text-2xl font-bold text-primary">{display.name}</p>
              <p className="text-sm text-gray-500 mt-2">
                {display.region} · {display.category}
              </p>
              {display.memo && (
                <p className="text-xs text-gray-400 mt-1">{display.memo}</p>
              )}
            </>
          ) : (
            <p className="text-gray-400">버튼을 눌러보세요!</p>
          )}
        </div>

        <div className="flex gap-2">
          {result ? (
            <>
              <button
                onClick={roll}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium"
              >
                다시 돌리기
              </button>
              <button
                onClick={() => {
                  onSelect(result);
                  onClose();
                }}
                className="flex-1 py-3 bg-primary text-white rounded-xl font-semibold"
              >
                여기로 결정!
              </button>
            </>
          ) : (
            <button
              onClick={roll}
              disabled={rolling || restaurants.length === 0}
              className="flex-1 py-3 bg-primary text-white rounded-xl font-semibold disabled:opacity-50"
            >
              {rolling ? "고르는 중..." : "돌려돌려!"}
            </button>
          )}
        </div>

        <button
          onClick={onClose}
          className="mt-3 text-sm text-gray-400 hover:text-gray-600"
        >
          닫기
        </button>
      </div>
    </div>
  );
}
