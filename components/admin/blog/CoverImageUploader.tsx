"use client";

import { useCallback, useRef, useState, type DragEvent, type ChangeEvent } from "react";
import Image from "next/image";
import {
  AlertCircle,
  FolderOpen,
  Image as ImageIcon,
  Loader2,
  RefreshCw,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import { Button } from "@/components/admin/ui";
import { mediaUrl, uploadImage, type Media } from "@/lib/blogApi";

interface CoverImageUploaderProps {
  value: Media | null;
  onChange: (media: Media | null) => void;
  onOpenMediaLibrary: () => void;
  onError?: (error: string) => void;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function CoverImageUploader({
  value,
  onChange,
  onOpenMediaLibrary,
  onError,
}: CoverImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  const handleUploadFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        const msg = "Please select a valid image file (JPEG, PNG, WebP, GIF, SVG).";
        setUploadError(msg);
        onError?.(msg);
        return;
      }

      setUploadError(null);
      setUploading(true);
      setProgress(0);

      try {
        const result = await uploadImage(file, (pct) => {
          setProgress(pct);
        });
        onChange(result.media);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to upload image.";
        setUploadError(msg);
        onError?.(msg);
      } finally {
        setUploading(false);
        setProgress(0);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    },
    [onChange, onError],
  );

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current += 1;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current -= 1;
    if (dragCounter.current <= 0) {
      dragCounter.current = 0;
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) {
      setIsDragging(true);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current = 0;
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      void handleUploadFile(file);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      void handleUploadFile(file);
    }
  };

  return (
    <div className="space-y-3">
      {/* Hidden file input for native browse */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml,image/avif"
        className="hidden"
        onChange={handleFileChange}
        aria-label="Upload cover image file"
      />

      {uploadError && (
        <div className="flex items-start justify-between gap-2 rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs text-red-700">
          <div className="flex items-center gap-1.5 font-medium">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
            <span>{uploadError}</span>
          </div>
          <button
            type="button"
            onClick={() => setUploadError(null)}
            className="rounded p-0.5 text-red-500 hover:bg-red-100"
            aria-label="Dismiss error"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {value ? (
        <div
          className="group relative overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50 transition-colors"
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* Main image preview */}
          <div className="relative aspect-video w-full overflow-hidden bg-zinc-900/5">
            <Image
              src={mediaUrl(value.path)}
              alt={value.originalName || "Cover image"}
              fill
              sizes="(max-width: 768px) 100vw, 360px"
              className="object-cover"
            />

            {/* Drop overlay when dragging on top of existing image */}
            {isDragging && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-forest-moss-900/80 p-4 text-center text-white backdrop-blur-xs transition-all">
                <UploadCloud className="mb-2 h-8 w-8 animate-bounce text-forest-moss-300" />
                <p className="text-sm font-bold">Drop to replace cover</p>
                <p className="text-xs text-forest-moss-200">Release file to upload</p>
              </div>
            )}

            {/* Uploading overlay */}
            {uploading && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 p-4 text-center text-white backdrop-blur-xs">
                <Loader2 className="mb-2 h-7 w-7 animate-spin text-forest-moss-400" />
                <p className="text-xs font-semibold">Uploading new image… {progress}%</p>
                <div className="mt-2 h-1.5 w-3/4 overflow-hidden rounded-full bg-white/20">
                  <div
                    className="h-full rounded-full bg-forest-moss-400 transition-all duration-150"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Image details & actions */}
          <div className="space-y-2.5 p-3">
            <div className="flex items-center justify-between text-xs text-zinc-500">
              <span className="truncate max-w-[180px] font-medium text-zinc-700" title={value.originalName}>
                {value.originalName}
              </span>
              <span className="shrink-0 text-[11px]">
                {value.width && value.height ? `${value.width}×${value.height} • ` : ""}
                {value.sizeBytes ? formatBytes(value.sizeBytes) : ""}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="secondary"
                className="flex-1 py-1.5 text-xs"
                icon={RefreshCw}
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                Upload new
              </Button>
              <Button
                variant="secondary"
                className="flex-1 py-1.5 text-xs"
                icon={FolderOpen}
                onClick={onOpenMediaLibrary}
                disabled={uploading}
              >
                Library
              </Button>
              <Button
                variant="ghost"
                className="px-2 py-1.5 text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
                icon={Trash2}
                onClick={() => onChange(null)}
                disabled={uploading}
                aria-label="Remove cover image"
              >
                Remove
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !uploading && fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-all ${
            isDragging
              ? "border-forest-moss-500 bg-forest-moss-50/70 shadow-inner ring-4 ring-forest-moss-100"
              : "border-zinc-200 bg-zinc-50/50 hover:border-zinc-300 hover:bg-zinc-50"
          }`}
        >
          {uploading ? (
            <div className="w-full space-y-3 py-2">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-forest-moss-600" />
              <div className="space-y-1">
                <p className="text-xs font-semibold text-zinc-700">Uploading cover image… {progress}%</p>
                <div className="mx-auto h-2 w-48 overflow-hidden rounded-full bg-zinc-200">
                  <div
                    className="h-full rounded-full bg-forest-moss-600 transition-all duration-150"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <>
              <div
                className={`mb-3 flex h-12 w-12 items-center justify-center rounded-full transition-transform ${
                  isDragging
                    ? "bg-forest-moss-100 text-forest-moss-700 scale-110"
                    : "bg-white text-zinc-400 shadow-xs group-hover:scale-105"
                }`}
              >
                {isDragging ? (
                  <UploadCloud className="h-6 w-6 animate-pulse" />
                ) : (
                  <ImageIcon className="h-6 w-6 text-zinc-400" />
                )}
              </div>

              <div className="space-y-1">
                <p className="text-xs font-semibold text-zinc-800">
                  {isDragging ? (
                    <span className="text-forest-moss-700">Drop image here to set as cover</span>
                  ) : (
                    <>
                      <span className="text-forest-moss-600 hover:underline">Click to upload</span> or drag and drop
                    </>
                  )}
                </p>
                <p className="text-[11px] text-zinc-400">PNG, JPG, WebP, GIF or SVG up to 10MB</p>
              </div>

              <div className="mt-4 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <span className="text-[11px] text-zinc-400">or</span>
                <button
                  type="button"
                  onClick={onOpenMediaLibrary}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-xs font-medium text-zinc-700 shadow-2xs hover:bg-zinc-50 hover:text-zinc-900 transition-colors"
                >
                  <FolderOpen className="h-3.5 w-3.5 text-zinc-500" />
                  Choose from library
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
