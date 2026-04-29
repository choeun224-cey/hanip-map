"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useDialog } from "@/lib/dialog";

export default function LoginPage() {
  const { user, loading, signInWithGoogle, signInWithEmail } = useAuth();
  const { toast } = useDialog();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState<"google" | "email" | null>(null);
  const [emailSent, setEmailSent] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) router.replace("/");
  }, [user, loading, router]);

  const handleGoogle = async () => {
    setBusy("google");
    try {
      await signInWithGoogle();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "로그인 실패";
      toast(msg, "error");
      setBusy(null);
    }
  };

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setBusy("email");
    try {
      await signInWithEmail(email.trim());
      setEmailSent(email.trim());
    } catch (err) {
      const msg = err instanceof Error ? err.message : "메일 전송 실패";
      toast(msg, "error");
    } finally {
      setBusy(null);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 p-6">
        <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-sm text-center">
          <div className="text-5xl mb-3">📬</div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            메일을 확인해주세요
          </h1>
          <p className="text-sm text-gray-600 mb-1">
            <span className="font-medium">{emailSent}</span>
          </p>
          <p className="text-sm text-gray-500 mb-6">
            로 로그인 링크를 보냈어요. 메일함에서 링크를 클릭하면 자동으로 로그인됩니다.
          </p>
          <button
            onClick={() => setEmailSent(null)}
            className="text-sm text-gray-400 hover:text-gray-600 underline"
          >
            다른 방법으로 로그인
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 p-6">
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-sm">
        <div className="text-center mb-7">
          <div className="text-5xl mb-3">📍</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">한입지도</h1>
          <p className="text-sm text-gray-500">
            둘이서 모은 맛집을 지도에 기록하고
            <br />
            다음 한 입을 찾아보세요
          </p>
        </div>

        {/* Google */}
        <button
          onClick={handleGoogle}
          disabled={!!busy || loading}
          className="w-full py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
        >
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path
              fill="#4285F4"
              d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
            />
            <path
              fill="#34A853"
              d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
            />
            <path
              fill="#FBBC05"
              d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
            />
            <path
              fill="#EA4335"
              d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
            />
          </svg>
          {busy === "google" ? "이동 중..." : "Google로 시작하기"}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400">또는</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Email */}
        <form onSubmit={handleEmail} className="space-y-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일 주소"
            required
            disabled={!!busy}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={!!busy || !email.trim()}
            className="w-full py-3 bg-primary text-white rounded-xl font-semibold hover:bg-orange-600 transition-colors disabled:opacity-60"
          >
            {busy === "email" ? "메일 보내는 중..." : "메일로 로그인 링크 받기"}
          </button>
        </form>

        <p className="text-xs text-gray-400 text-center mt-6 leading-relaxed">
          처음이라도 위 방식으로 바로 시작할 수 있어요.
          <br />
          별도 가입 절차 없습니다.
        </p>
      </div>
    </div>
  );
}
