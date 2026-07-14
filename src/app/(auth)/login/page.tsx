"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Lock,
  Mail,
  ArrowRight,
  Loader2,
  Info,
  Eye,
  EyeOff,
  CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import BrandLogo from "@/components/BrandLogo";
import PublicSiteHeader from "@/components/PublicSiteHeader";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const registered = searchParams.get("registered") === "true";
  const callbackUrl = useMemo(() => {
    const rawCallbackUrl = searchParams.get("callbackUrl");

    if (!rawCallbackUrl) {
      return "/dashboard";
    }

    if (rawCallbackUrl.startsWith("/")) {
      return rawCallbackUrl;
    }

    try {
      const parsedUrl = new URL(rawCallbackUrl);
      return parsedUrl.pathname + parsedUrl.search + parsedUrl.hash;
    } catch {
      return "/dashboard";
    }
  }, [searchParams]);

  useEffect(() => {
    if (status === "authenticated") {
      router.replace(callbackUrl);
    }
  }, [callbackUrl, router, status]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: email.trim(),
        password,
        callbackUrl,
      });

      if (res?.error) {
        setError(res.error);
      } else {
        router.push(res?.url ?? callbackUrl);
        router.refresh();
      }
    } catch {
      setError("Terjadi kesalahan sistem. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <PublicSiteHeader />
      <div className="flex flex-1 items-center justify-center p-4 md:p-8">
        <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl glass md:grid-cols-2 shadow-xl">
        {/* Left Side - Welcome Panel */}
        <div className="relative hidden flex-col justify-between bg-gradient-to-br from-serena-lavender-600 via-serena-lavender-500 to-serena-sky-600 p-12 text-white md:flex">
          <div className="my-auto space-y-6">
            <h1 className="font-rounded text-4xl font-bold leading-tight">
              Selamat datang kembali di Ruang Aman Anda.
            </h1>
            <p className="text-lg text-purple-100 font-light leading-relaxed">
              Luangkan waktu sejenak untuk diri Anda. Kami di sini untuk mendengarkan, membimbing, dan menemani setiap langkah perjalanan kesehatan mental Anda.
            </p>
          </div>

          <div className="text-sm text-purple-200">
            &copy; {new Date().getFullYear()} Serena. Semua hak cipta dilindungi.
          </div>
        </div>

        {/* Right Side - Form Panel */}
        <div className="flex flex-col justify-center p-8 sm:p-12 md:p-16 bg-white/40">
          {/* Mobile Logo */}
          <div className="mb-8 flex justify-center md:hidden">
            <BrandLogo
              imageWrapperClassName="h-16 w-[220px]"
              textClassName="text-xl font-bold text-indigo-950"
              hideTextWhenImageLoads
            />
          </div>

          <div className="mb-8 text-center md:text-left">
            <h2 className="font-rounded text-3xl font-bold text-indigo-950">Masuk ke Serena</h2>
            <p className="mt-2 text-sm text-indigo-900/60">
              Belum punya akun?{" "}
              <Link href="/register" className="font-medium text-serena-lavender-600 hover:text-serena-lavender-700 transition">
                Daftar sekarang
              </Link>
            </p>
          </div>

          <AnimatePresence>
            {registered && !error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-700"
              >
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                <span>Registrasi berhasil. Silakan masuk menggunakan akun Anda.</span>
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 flex items-start gap-3 rounded-2xl bg-rose-50 p-4 text-sm text-rose-600 border border-rose-100"
            >
              <Info className="h-5 w-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-indigo-950 mb-2">Email</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-indigo-900/40">
                  <Mail className="h-5 w-5" />
                </span>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl border border-indigo-100 bg-white py-3.5 pl-12 pr-4 text-indigo-950 placeholder-indigo-900/30 outline-none transition focus:border-serena-lavender-400 focus:ring-2 focus:ring-serena-lavender-100"
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="block text-sm font-medium text-indigo-950">Password</label>
                <span className="text-xs text-indigo-900/45">Reset password segera hadir</span>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-indigo-900/40">
                  <Lock className="h-5 w-5" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl border border-indigo-100 bg-white py-3.5 pl-12 pr-12 text-indigo-950 placeholder-indigo-900/30 outline-none transition focus:border-serena-lavender-400 focus:ring-2 focus:ring-serena-lavender-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-indigo-900/40 transition hover:text-indigo-900/70"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <p className="text-xs leading-relaxed text-indigo-900/50">
              Dengan masuk ke akun Serena, Anda dapat melanjutkan journaling, melihat progres emosi,
              dan terhubung dengan konselor sesuai peran akun Anda.
            </p>

            <button
              type="submit"
              disabled={loading || status === "loading"}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-serena-lavender-600 hover:bg-serena-lavender-700 text-white font-medium py-3.5 px-4 shadow-lg shadow-serena-lavender-500/15 hover:shadow-serena-lavender-500/25 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <span>Masuk</span>
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
    </div>
  );
}

function LoginPageFallback() {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicSiteHeader />
      <div className="flex flex-1 items-center justify-center p-4 md:p-8">
        <div className="flex w-full max-w-md items-center justify-center rounded-3xl glass px-6 py-10 shadow-xl">
          <Loader2 className="h-6 w-6 animate-spin text-serena-lavender-600" />
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginPageFallback />}>
      <LoginPageContent />
    </Suspense>
  );
}
