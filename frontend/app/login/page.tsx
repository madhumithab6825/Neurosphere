"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/api";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await login(email, password);
      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.user));
      router.push("/");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f0eb] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-[#7b1c2e] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
            <span className="text-white text-2xl font-bold">N</span>
          </div>
          <h1 className="text-[#2c1a1a] text-2xl font-semibold">NeuroSphere AI</h1>
          <p className="text-[#8a6a6a] text-sm mt-1">Sign in to continue</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-[#e8ddd8] p-6 space-y-4">
          <form onSubmit={handleLogin} className="space-y-3">
            <div>
              <label className="text-xs font-medium text-[#5a3a3a] mb-1 block">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#faf7f5] text-[#2c1a1a] border border-[#e0d5cf] px-4 py-2.5 rounded-xl text-sm outline-none focus:border-[#7b1c2e] focus:ring-1 focus:ring-[#7b1c2e] transition"
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-[#5a3a3a] mb-1 block">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#faf7f5] text-[#2c1a1a] border border-[#e0d5cf] px-4 py-2.5 rounded-xl text-sm outline-none focus:border-[#7b1c2e] focus:ring-1 focus:ring-[#7b1c2e] transition"
                required
              />
            </div>
            {error && <p className="text-red-500 text-xs">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#7b1c2e] hover:bg-[#6a1726] disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-medium transition"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>

        <p className="text-center text-[#8a6a6a] text-sm mt-4">
          Don't have an account?{" "}
          <Link href="/register" className="text-[#7b1c2e] font-medium hover:underline">Register</Link>
        </p>
      </div>
    </div>
  );
}
