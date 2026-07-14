"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, UserCheck, Lock, Mail, ArrowRight, Loader2, Info, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import BrandLogo from "@/components/BrandLogo";
import PublicSiteHeader from "@/components/PublicSiteHeader";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"PATIENT" | "COUNSELOR">("PATIENT");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Terjadi kesalahan saat registrasi");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/login?registered=true");
      }, 2000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Terjadi kesalahan sistem. Silakan coba lagi.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <PublicSiteHeader />
      <div className="flex flex-1 items-center justify-center p-4 md:p-8">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl glass md:grid-cols-2 shadow-xl">
        {/* Left Side - Info Panel */}
        <div className="relative hidden flex-col justify-between bg-gradient-to-br from-serena-sage-600 via-serena-sage-500 to-serena-sky-600 p-12 text-white md:flex">
          <div className="my-auto space-y-6">
            <h1 className="font-rounded text-4xl font-bold leading-tight">
              Mulai Perjalanan Menuju Keseimbangan Diri.
            </h1>
            <p className="text-lg text-emerald-50 font-light leading-relaxed">
              Bergabunglah bersama komunitas Serena. Temukan bimbingan profesional yang personal dan pantau perkembangan suasana hati Anda setiap hari.
            </p>
          </div>

          <div className="text-sm text-emerald-200">
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

          <AnimatePresence mode="wait">
            {success ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center text-center py-8"
              >
                <CheckCircle2 className="h-16 w-16 text-serena-sage-500 mb-4 animate-bounce" />
                <h3 className="font-rounded text-2xl font-bold text-indigo-950">Registrasi Berhasil!</h3>
                <p className="mt-2 text-indigo-900/60">
                  Akun Anda sedang disiapkan. Kami akan mengarahkan Anda ke halaman login sebentar lagi...
                </p>
              </motion.div>
            ) : (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="mb-6 text-center md:text-left">
                  <h2 className="font-rounded text-3xl font-bold text-indigo-950">Daftar Akun Baru</h2>
                  <p className="mt-2 text-sm text-indigo-900/60">
                    Sudah punya akun?{" "}
                    <Link href="/login" className="font-medium text-serena-sage-600 hover:text-serena-sage-700 transition">
                      Masuk di sini
                    </Link>
                  </p>
                </div>

                {error && (
                  <div className="mb-4 flex items-start gap-3 rounded-2xl bg-rose-50 p-4 text-sm text-rose-600 border border-rose-100">
                    <Info className="h-5 w-5 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Role Selection */}
                  <div>
                    <label className="block text-sm font-medium text-indigo-950 mb-2">Saya mendaftar sebagai:</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setRole("PATIENT")}
                        className={`flex flex-col items-center gap-2 rounded-2xl p-3.5 border text-center transition-all ${
                          role === "PATIENT"
                            ? "border-serena-sage-500 bg-serena-sage-50/50 text-serena-sage-700 ring-2 ring-serena-sage-100"
                            : "border-indigo-100 bg-white text-indigo-950/60 hover:bg-indigo-50/30"
                        }`}
                      >
                        <User className="h-6 w-6" />
                        <span className="text-xs font-semibold">Pasien/Klien</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setRole("COUNSELOR")}
                        className={`flex flex-col items-center gap-2 rounded-2xl p-3.5 border text-center transition-all ${
                          role === "COUNSELOR"
                            ? "border-serena-sage-500 bg-serena-sage-50/50 text-serena-sage-700 ring-2 ring-serena-sage-100"
                            : "border-indigo-100 bg-white text-indigo-950/60 hover:bg-indigo-50/30"
                        }`}
                      >
                        <UserCheck className="h-6 w-6" />
                        <span className="text-xs font-semibold">Konselor/Psikolog</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-indigo-950 mb-1.5">Nama Lengkap</label>
                    <input
                      type="text"
                      required
                      placeholder="Masukkan nama lengkap Anda"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-2xl border border-indigo-100 bg-white py-3 px-4 text-indigo-950 placeholder-indigo-900/30 outline-none transition focus:border-serena-sage-400 focus:ring-2 focus:ring-serena-sage-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-indigo-950 mb-1.5">Email</label>
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
                        className="w-full rounded-2xl border border-indigo-100 bg-white py-3 pl-12 pr-4 text-indigo-950 placeholder-indigo-900/30 outline-none transition focus:border-serena-sage-400 focus:ring-2 focus:ring-serena-sage-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-indigo-950 mb-1.5">Password</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-indigo-900/40">
                        <Lock className="h-5 w-5" />
                      </span>
                      <input
                        type="password"
                        required
                        placeholder="Minimal 6 karakter"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-2xl border border-indigo-100 bg-white py-3 pl-12 pr-4 text-indigo-950 placeholder-indigo-900/30 outline-none transition focus:border-serena-sage-400 focus:ring-2 focus:ring-serena-sage-100"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-serena-sage-600 hover:bg-serena-sage-700 text-white font-medium py-3.5 px-4 shadow-lg shadow-serena-sage-500/15 hover:shadow-serena-sage-500/25 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {loading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        <span>Daftar Akun</span>
                        <ArrowRight className="h-5 w-5" />
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      </div>
    </div>
  );
}
