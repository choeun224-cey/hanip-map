"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useDialog } from "@/lib/dialog";

export default function LoginPage() {
  const { user, loading, signInWithKakao } = useAuth();
  const { toast } = useDialog();
  const router = useRouter();
  const [signing, setSigning] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace("/");
  }, [user, loading, router]);

  const handleKakaoLogin = async () => {
    setSigning(true);
    try {
      await signInWithKakao();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "로그인 실패";
      toast(msg, "error");
      setSigning(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 p-6">
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-sm text-center">
        <div className="text-5xl mb-3">📍</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">한입지도</h1>
        <p className="text-sm text-gray-500 mb-8">
          둘이서 모은 맛집을 지도에 기록하고
          <br />
          다음 한 입을 찾아보세요
        </p>

        <button
          onClick={handleKakaoLogin}
          disabled={signing || loading}
          className="w-full py-3.5 bg-[#FEE500] text-[#000000] rounded-xl font-semibold hover:bg-[#FDD835] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
        >
          <span className="text-lg">💬</span>
          {signing ? "이동 중..." : "카카오로 시작하기"}
        </button>

        <p className="text-xs text-gray-400 mt-6 leading-relaxed">
          로그인하면 우리 둘이 모은 맛집 기록을
          <br />
          모든 기기에서 동기화해서 볼 수 있어요
        </p>
      </div>
    </div>
  );
}
