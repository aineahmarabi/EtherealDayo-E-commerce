"use client";

import { useState, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { motion } from "framer-motion";
import Image from "next/image";
import { api } from "../../../../convex/_generated/api";
import { Skeleton } from "@/components/ui/Skeleton";
import { Plus, ExternalLink, UploadCloud, X } from "lucide-react";
import { getBrandImage } from "@/lib/brandImages";

export default function BrandsPage() {
  const brands = useQuery(api.brands.list);
  const createBrand = useMutation(api.brands.create);
  const generateUploadUrl = useMutation(api.uploads.generateUploadUrl);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [logoUrl, setLogoUrl] = useState<string>("");
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploading(true);
    try {
      const file = e.target.files[0];
      const postUrl = await generateUploadUrl();
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await result.json();
      const deploymentUrl = process.env.NEXT_PUBLIC_CONVEX_URL!;
      const url = `${deploymentUrl}/api/storage/${storageId}`;
      setLogoUrl(url);
    } catch (err) {
      console.error(err);
      alert("Failed to upload image.");
    } finally {
      setUploading(false);
    }
  };

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    await createBrand({
      name: name.trim(),
      slug: name.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
      description: description.trim() || name.trim(),
      logo: logoUrl || undefined,
      order: Date.now(),
    });
    setName(""); 
    setDescription(""); 
    setLogoUrl("");
    setAdding(false);
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-bone">Brands / Houses</h1>
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gold text-noir rounded-full text-xs tracking-widest uppercase font-body hover:bg-gold-soft transition-colors cursor-pointer shadow-[0_0_15px_rgba(200,160,90,0.3)]"
        >
          <Plus size={13} />
          Add Brand
        </button>
      </div>

      {adding && (
        <motion.form
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleCreate}
          className="p-6 rounded-2xl border border-gold/20 bg-white/[0.02] shadow-sm flex flex-col gap-5"
        >
          <h2 className="font-display text-base text-bone border-b border-gold/10 pb-3">New Fragrance House</h2>
          
          <div className="grid sm:grid-cols-2 gap-5">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] tracking-widest uppercase text-muted-text font-body">House Name *</label>
                <input value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Maison Noir"
                  className="px-3 py-2.5 text-sm bg-noir border border-gold/15 rounded-lg text-bone font-body placeholder:text-muted-text focus:border-gold/40 focus:outline-none transition-colors" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] tracking-widest uppercase text-muted-text font-body">Description</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Brief description of this house…"
                  className="px-3 py-2.5 text-sm bg-noir border border-gold/15 rounded-lg text-bone font-body placeholder:text-muted-text focus:border-gold/40 focus:outline-none transition-colors resize-none" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] tracking-widest uppercase text-muted-text font-body">Brand Logo</label>
              {logoUrl ? (
                <div className="relative group w-32 h-32 rounded-xl border border-gold/20 overflow-hidden bg-noir/50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={logoUrl} alt="Logo preview" className="w-full h-full object-contain p-2" />
                  <button type="button" onClick={() => setLogoUrl("")} className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border border-dashed border-gold/20 hover:border-gold/40 hover:bg-white/[0.02] transition-colors rounded-xl h-32 flex flex-col items-center justify-center gap-2 cursor-pointer bg-noir/40"
                >
                  <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                  <div className="p-2 bg-purple-900/30 rounded-full text-purple-400">
                    <UploadCloud size={16} />
                  </div>
                  <div className="text-center font-body">
                    <p className="text-[12px] text-bone">{uploading ? "Uploading..." : "Add logo"}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2 mt-2 border-t border-gold/10">
            <button type="submit" disabled={uploading} className="px-5 py-2.5 bg-gold text-noir rounded-lg text-xs tracking-widest uppercase font-body hover:bg-gold-soft transition-colors cursor-pointer disabled:opacity-50 font-medium shadow-sm">
              Create Brand
            </button>
            <button type="button" onClick={() => { setAdding(false); setLogoUrl(""); }} className="px-4 py-2.5 text-xs text-muted-text hover:text-bone hover:bg-white/5 rounded-lg font-body transition-colors cursor-pointer">
              Cancel
            </button>
          </div>
        </motion.form>
      )}

      {brands === undefined ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl bg-white/[0.02] border-gold/5" />)}
        </div>
      ) : brands.length === 0 ? (
        <div className="py-24 text-center text-muted-text font-body bg-white/[0.01] border border-gold/5 rounded-2xl">
          No brands yet. Add your first fragrance house.
        </div>
      ) : (
        <motion.div
          initial="hidden" animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
          className="grid sm:grid-cols-2 gap-4"
        >
          {brands.map((brand) => (
            <motion.div
              key={brand._id}
              variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } }}
              className="p-5 rounded-2xl border border-gold/10 bg-white/[0.02] hover:border-gold/25 transition-all flex flex-col gap-3 shadow-sm group"
            >
              <div className="flex items-start justify-between gap-3">
                {(() => {
                const logoSrc = brand.logo || getBrandImage(brand.slug);
                return logoSrc ? (
                  <div className="w-12 h-12 rounded-xl border border-gold/20 flex items-center justify-center overflow-hidden bg-white p-1">
                    <Image src={logoSrc} alt={brand.name} width={40} height={40} className="object-contain w-10 h-10" />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-bordeaux-deep/40 border border-gold/20 flex items-center justify-center font-display text-gold text-lg">
                    {brand.name.charAt(0)}
                  </div>
                );
              })()}
                <a href={`/brand/${brand.slug}`} target="_blank" rel="noopener noreferrer"
                  className="p-2 -mr-2 text-muted-text hover:text-gold transition-colors cursor-pointer opacity-0 group-hover:opacity-100">
                  <ExternalLink size={14} />
                </a>
              </div>
              <div>
                <p className="font-display text-base text-bone">{brand.name}</p>
                {brand.description && <p className="text-sm text-muted-text font-body mt-1 line-clamp-2 leading-relaxed">{brand.description}</p>}
              </div>
              <p className="text-xs text-muted-text/50 font-body mt-auto pt-2 border-t border-gold/5">
                slug: <span className="font-mono">{brand.slug}</span>
              </p>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
