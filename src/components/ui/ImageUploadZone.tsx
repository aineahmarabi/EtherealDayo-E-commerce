"use client";

import { useRef, useState, useCallback } from "react";
import { UploadCloud, X } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

type Props = {
  images: string[];
  onChange: (urls: string[]) => void;
};

export function ImageUploadZone({ images, onChange }: Props) {
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const generateUploadUrl = useMutation(api.uploads.generateUploadUrl);

  const uploadFiles = useCallback(
    async (files: FileList | File[]) => {
      const arr = Array.from(files).filter((f) => f.type.startsWith("image/"));
      if (!arr.length) return;
      setUploading(true);
      try {
        const newUrls = [...images];
        for (const file of arr) {
          const postUrl = await generateUploadUrl();
          const res = await fetch(postUrl, {
            method: "POST",
            headers: { "Content-Type": file.type },
            body: file,
          });
          const { storageId } = await res.json();
          const rawUrl = process.env.NEXT_PUBLIC_CONVEX_SITE_URL || process.env.NEXT_PUBLIC_CONVEX_URL || "";
          const deploymentUrl = rawUrl.replace(".cloud", ".site").replace(/\/$/, "");
          newUrls.push(`${deploymentUrl}/api/storage/${storageId}`);
        }
        onChange(newUrls);
      } catch (err) {
        console.error(err);
        alert("Upload failed — please try again.");
      } finally {
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    },
    [images, onChange, generateUploadUrl]
  );

  /* ── Drag handlers ── */
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  };
  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    if (e.dataTransfer.files?.length) uploadFiles(e.dataTransfer.files);
  };

  const removeImage = (idx: number) =>
    onChange(images.filter((_, i) => i !== idx));

  return (
    <div className="flex flex-col gap-4">
      {/* Previews */}
      {images.length > 0 && (
        <div className="flex gap-3 flex-wrap">
          {images.map((url, i) => (
            <div
              key={i}
              className="relative group w-24 h-24 rounded-xl border border-gold/20 overflow-hidden bg-noir/50 flex-shrink-0"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="w-full h-full object-cover" />
              {/* Cover badge on first */}
              {i === 0 && (
                <span className="absolute top-1 left-1 bg-gold text-noir text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded leading-none">
                  Cover
                </span>
              )}
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-1 right-1 p-1 bg-black/70 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Drop zone */}
      <div
        onDragOver={onDragOver}
        onDragEnter={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={[
          "relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-200 select-none",
          dragging
            ? "border-gold/70 bg-gold/5 scale-[1.01]"
            : "border-gold/20 hover:border-gold/45 hover:bg-white/[0.025]",
          uploading ? "pointer-events-none opacity-70" : "",
        ].join(" ")}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => e.target.files && uploadFiles(e.target.files)}
          multiple
          accept="image/*"
          className="hidden"
        />

        {/* Icon */}
        <div
          className={[
            "p-3 rounded-full transition-colors duration-200",
            dragging ? "bg-gold/20 text-gold" : "bg-purple-900/30 text-purple-400",
          ].join(" ")}
        >
          <UploadCloud size={22} />
        </div>

        <div className="text-center font-body pointer-events-none">
          {uploading ? (
            <p className="text-[13px] text-gold animate-pulse">Uploading…</p>
          ) : dragging ? (
            <p className="text-[13px] text-gold font-semibold">Drop to upload</p>
          ) : (
            <>
              <p className="text-[13px] text-bone">
                <span className="text-gold underline underline-offset-2">Click to add photos</span>
                {" "}or drag &amp; drop here
              </p>
              <p className="text-[11px] text-muted-text mt-1">
                First photo becomes the cover image
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
