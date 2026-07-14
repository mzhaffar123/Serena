"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Star, Award, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface Counselor {
  id: string;
  name: string;
  photoUrl: string | null;
  specialization: string;
  bio: string;
  experienceYrs: number;
  hourlyRate: number;
  isAvailable: boolean;
  rating: number;
}

interface CounselorsListProps {
  initialCounselors: Counselor[];
}

export default function CounselorsList({ initialCounselors }: CounselorsListProps) {
  const [search, setSearch] = useState("");
  const [selectedSpec, setSelectedSpec] = useState("all");
  const [selectedExp, setSelectedExp] = useState("all");
  const [sortBy, setSortBy] = useState("rating-desc");

  // Get unique specializations parsed from listings
  const specializations = useMemo(() => {
    const specs = new Set<string>();
    initialCounselors.forEach((c) => {
      // Split by comma if multiple specializations are stored as comma-separated string
      c.specialization.split(",").forEach((s) => {
        specs.add(s.trim());
      });
    });
    return ["all", ...Array.from(specs)];
  }, [initialCounselors]);

  // Filter & sort counselors
  const filteredCounselors = useMemo(() => {
    return initialCounselors
      .filter((c) => {
        const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
        
        const matchesSpec =
          selectedSpec === "all" ||
          c.specialization.toLowerCase().includes(selectedSpec.toLowerCase());

        let matchesExp = true;
        if (selectedExp === "junior") {
          matchesExp = c.experienceYrs <= 5;
        } else if (selectedExp === "senior") {
          matchesExp = c.experienceYrs > 5;
        }

        return matchesSearch && matchesSpec && matchesExp;
      })
      .sort((a, b) => {
        if (sortBy === "rating-desc") return b.rating - a.rating;
        if (sortBy === "price-asc") return a.hourlyRate - b.hourlyRate;
        if (sortBy === "experience-desc") return b.experienceYrs - a.experienceYrs;
        return 0;
      });
  }, [initialCounselors, search, selectedSpec, selectedExp, sortBy]);

  return (
    <div className="space-y-8">
      {/* Filters Bar */}
      <div className="grid md:grid-cols-4 gap-4 p-6 rounded-3xl bg-white/60 border border-indigo-100/50 backdrop-blur-sm shadow-sm">
        {/* Search */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-indigo-900/40">
            <Search className="h-5 w-5" />
          </span>
          <input
            type="text"
            placeholder="Cari nama konselor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-indigo-100 bg-white py-3 pl-11 pr-4 text-indigo-950 placeholder-indigo-900/30 outline-none transition focus:border-serena-lavender-400 focus:ring-2 focus:ring-serena-lavender-100 text-sm"
          />
        </div>

        {/* Specialization Filter */}
        <div>
          <select
            value={selectedSpec}
            onChange={(e) => setSelectedSpec(e.target.value)}
            className="w-full rounded-2xl border border-indigo-100 bg-white py-3 px-4 text-indigo-950 outline-none transition focus:border-serena-lavender-400 focus:ring-2 focus:ring-serena-lavender-100 text-sm"
          >
            <option value="all">Semua Spesialisasi</option>
            {specializations
              .filter((s) => s !== "all")
              .map((spec) => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
              ))}
          </select>
        </div>

        {/* Experience Filter */}
        <div>
          <select
            value={selectedExp}
            onChange={(e) => setSelectedExp(e.target.value)}
            className="w-full rounded-2xl border border-indigo-100 bg-white py-3 px-4 text-indigo-950 outline-none transition focus:border-serena-lavender-400 focus:ring-2 focus:ring-serena-lavender-100 text-sm"
          >
            <option value="all">Semua Pengalaman</option>
            <option value="junior">0 - 5 Tahun</option>
            <option value="senior">&gt; 5 Tahun</option>
          </select>
        </div>

        {/* Sort By */}
        <div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full rounded-2xl border border-indigo-100 bg-white py-3 px-4 text-indigo-950 outline-none transition focus:border-serena-lavender-400 focus:ring-2 focus:ring-serena-lavender-100 text-sm"
          >
            <option value="rating-desc">Rating Tertinggi</option>
            <option value="price-asc">Biaya Terendah</option>
            <option value="experience-desc">Paling Berpengalaman</option>
          </select>
        </div>
      </div>

      {/* Grid of Counselors */}
      {filteredCounselors.length === 0 ? (
        <div className="text-center py-16 bg-white/30 rounded-3xl border border-dashed border-indigo-100">
          <p className="text-indigo-950/50 font-light">Tidak ada konselor yang cocok dengan filter Anda.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCounselors.map((counselor, idx) => (
            <motion.div
              key={counselor.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="group rounded-3xl bg-white border border-indigo-50 hover:border-serena-lavender-100 p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div>
                {/* Image and Status */}
                <div className="flex gap-4 items-start mb-5">
                  <div className="relative">
                    {counselor.photoUrl ? (
                      <Image
                        src={counselor.photoUrl}
                        alt={counselor.name}
                        width={64}
                        height={64}
                        className="h-16 w-16 rounded-2xl border border-serena-lavender-100 object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-serena-lavender-50 flex items-center justify-center text-serena-lavender-600 font-bold">
                        {counselor.name[0]}
                      </div>
                    )}
                    {counselor.isAvailable && (
                      <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-serena-sage-500 rounded-full border-2 border-white calm-pulse" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-rounded text-lg font-bold text-indigo-950 group-hover:text-serena-lavender-600 transition">
                      {counselor.name}
                    </h3>
                    <div className="flex items-center gap-1 mt-1 text-xs text-indigo-950/60 font-light">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span className="font-bold text-indigo-950">{counselor.rating.toFixed(1)}</span>
                      <span>•</span>
                      <Award className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{counselor.experienceYrs} tahun eksp.</span>
                    </div>
                  </div>
                </div>

                {/* Badges / Specialization */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {counselor.specialization.split(",").map((s) => (
                    <span
                      key={s}
                      className="px-2.5 py-1 rounded-full bg-serena-lavender-50/70 border border-serena-lavender-100/30 text-serena-lavender-600 text-xxs font-medium"
                    >
                      {s.trim()}
                    </span>
                  ))}
                </div>

                {/* Bio Summary */}
                <p className="text-xs text-indigo-950/60 leading-relaxed font-light mb-6">
                  {counselor.bio.length > 120 ? `${counselor.bio.substring(0, 120)}...` : counselor.bio}
                </p>
              </div>

              {/* Pricing & Booking action */}
              <div className="pt-4 border-t border-indigo-50/50 flex items-center justify-between">
                <div>
                  <span className="text-xxs text-indigo-950/40 block">Tarif Konseling</span>
                  <span className="font-rounded text-sm font-bold text-serena-sage-700">
                    Rp {counselor.hourlyRate.toLocaleString("id-ID")}{" "}
                    <span className="text-xs text-indigo-950/40 font-normal">/ jam</span>
                  </span>
                </div>
                <Link
                  href={`/counselors/${counselor.id}`}
                  className="inline-flex items-center justify-center gap-1.5 rounded-2xl bg-indigo-950 hover:bg-serena-lavender-600 text-white text-xs font-semibold py-3 px-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
                >
                  <span>Detail & Booking</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
