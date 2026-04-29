"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useDialog } from "@/lib/dialog";

export default function LoginPage() {
  const { user, loading, signIn } = useAuth();
  const { toast } = useDialog();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [signing, setSigning] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace("/");
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) return;
    setSigning(true);
    try {
      await signIn(username.trim(), password);
    } catch (err) {
      const raw = err instanceof Error ? err.message : "로그인 실패";
      const msg = /invalid login credentials/i.test(raw)
        ? "아이디 또는 비밀번호가 올바르지 않아요"
        : raw;
      toast(msg, "error");
      setSigning(false);
    }
  };

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

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="아이디"
            required
            autoComplete="username"
            disabled={signing}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary disabled:opacity-60"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호"
            required
            autoComplete="current-password"
            disabled={signing}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={signing || !username.trim() || !password}
            className="w-full py-3 bg-primary text-white rounded-xl font-semibold hover:bg-orange-600 transition-colors disabled:opacity-60"
          >
            {signing ? "로그인 중..." : "로그인"}
          </button>
        </form>

        <p className="text-xs text-gray-400 text-center mt-6 leading-relaxed">
          계정 정보가 필요하면 관리자에게 문의해주세요.
        </p>
      </div>
    </div>
  );
}
