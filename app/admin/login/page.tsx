"use client";

import { useState, useEffect, useTransition } from "react";
import { Flower2, Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import { loginAction } from "../../actions/auth";

const LS_KEY = "mycareerly_admin_creds";

export default function AdminLoginPage() {
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Auto-fill saved credentials on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) {
        const { email: e, password: p } = JSON.parse(saved);
        if (e) setEmail(e);
        if (p) setPassword(p);
      }
    } catch {}
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await loginAction(fd);
      if (result?.error) {
        setError(result.error);
      } else if (remember) {
        // Save on successful login (loginAction redirects on success, but try saving first)
        try { localStorage.setItem(LS_KEY, JSON.stringify({ email, password })); } catch {}
      } else {
        try { localStorage.removeItem(LS_KEY); } catch {}
      }
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAFAF8] via-[#F9EBE8] to-[#FAFAF8] flex items-center justify-center px-4">
      {/* Background blobs */}
      <div className="fixed top-0 right-0 w-96 h-96 bg-[#E8705A]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-80 h-80 bg-[#7A9E7E]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-[#E8705A] rounded-2xl mb-4 shadow-[0_8px_30px_rgba(232,112,90,0.3)]">
            <Flower2 size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">
            My<span className="text-[#E8705A]">Careerly</span> Admin
          </h1>
          <p className="text-sm text-[#6B6B6B] mt-1">Sign in to manage your platform</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl border border-[#E8E4DF] shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B6B6B]" />
                <input
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@mycareerly.com"
                  required
                  autoComplete="username"
                  className="w-full pl-10 pr-4 py-3 bg-[#FAFAF8] border border-[#E8E4DF] rounded-xl text-sm text-[#1A1A1A] outline-none focus:border-[#E8705A] focus:ring-2 focus:ring-[#E8705A]/10 transition-all placeholder-[#B0A9A4]"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B6B6B]" />
                <input
                  name="password"
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full pl-10 pr-10 py-3 bg-[#FAFAF8] border border-[#E8E4DF] rounded-xl text-sm text-[#1A1A1A] outline-none focus:border-[#E8705A] focus:ring-2 focus:ring-[#E8705A]/10 transition-all"
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6B6B6B] hover:text-[#1A1A1A]">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4 accent-[#E8705A]"
              />
              <span className="text-xs text-[#4A4A4A]">Remember me on this device</span>
            </label>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                <AlertCircle size={15} />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-[#E8705A] hover:bg-[#C95540] disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-all hover:shadow-[0_6px_20px_rgba(232,112,90,0.4)]"
            >
              {isPending ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-[#E8E4DF] text-center">
            <p className="text-xs text-[#6B6B6B]">Credentials are set in your <code className="bg-[#F9EBE8] px-1 rounded">.env</code> file</p>
          </div>
        </div>

        <p className="text-center text-xs text-[#6B6B6B] mt-6">
          &larr; <a href="/" className="hover:text-[#E8705A] transition-colors">Back to MyCareerly</a>
        </p>
      </div>
    </div>
  );
}
