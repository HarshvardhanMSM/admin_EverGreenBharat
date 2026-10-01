"use client";

import { useState, useRef } from "react";
import {
  UploadCloud,
  X,
  Image as ImageIcon,
  Loader2,
  Star,
  Plus,
  Link as LinkIcon,
  Check,
  AlertCircle,
} from "lucide-react";
import { nurseryService } from "@/services/api/nursery-service";
import { toast } from "@/components/ui/toast";
import { resolveImageUrl } from "@/utils/media";

interface PlantImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  title?: string;
  description?: string;
  disabled?: boolean;
}

export function PlantImageUploader({
  images = [],
  onChange,
  maxImages = 8,
  title = "Plant Photos / पौधे की तस्वीरें",
  description = "Upload high quality plant photos (cover photo, close-ups of leaves, pot & packaging).",
  disabled = false,
}: PlantImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlValue, setUrlValue] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0 || disabled) return;

    const files = Array.from(fileList);
    const validFiles: File[] = [];

    for (const file of files) {
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        toast.error(`"${file.name}" is not a supported format (JPEG, PNG, WEBP only)`);
        continue;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`"${file.name}" exceeds 10MB limit`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    const remainingSlots = maxImages - images.length;
    if (remainingSlots <= 0) {
      toast.error(`Maximum ${maxImages} images allowed`);
      return;
    }

    const filesToUpload = validFiles.slice(0, remainingSlots);

    try {
      setUploading(true);
      setUploadProgress(`Uploading ${filesToUpload.length} image(s)...`);

      let newUrls: string[] = [];
      if (filesToUpload.length === 1) {
        const url = await nurseryService.uploadPlantImage(filesToUpload[0]);
        if (url) newUrls = [url];
      } else {
        newUrls = await nurseryService.uploadPlantImages(filesToUpload);
      }

      if (newUrls.length > 0) {
        onChange([...images, ...newUrls]);
        toast.success(
          newUrls.length === 1
            ? "Plant image uploaded successfully!"
            : `${newUrls.length} plant images uploaded successfully!`
        );
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      toast.error(
        err?.response?.data?.message || "Failed to upload image. Please try again."
      );
    } finally {
      setUploading(false);
      setUploadProgress("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (!disabled && e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleRemove = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleSetPrimary = (index: number) => {
    if (index === 0) return;
    const selected = images[index];
    const rest = images.filter((_, i) => i !== index);
    onChange([selected, ...rest]);
    toast.success("Cover photo updated!");
  };

  const handleAddUrl = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = urlValue.trim();
    if (!trimmed) return;
    if (images.length >= maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`);
      return;
    }
    onChange([...images, trimmed]);
    setUrlValue("");
    setShowUrlInput(false);
    toast.success("Image URL added");
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <label className="text-sm font-extrabold text-foreground flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            {title}
            <span className="text-xs font-semibold text-muted-foreground">
              ({images.length}/{maxImages})
            </span>
          </label>
          {description && (
            <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
          )}
        </div>

        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          disabled={disabled || images.length >= maxImages}
          className="text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:text-emerald-800 dark:hover:text-emerald-200 inline-flex items-center gap-1.5 transition-colors cursor-pointer w-fit"
        >
          <LinkIcon className="w-3.5 h-3.5" />
          {showUrlInput ? "Hide URL Input" : "Add by Image URL"}
        </button>
      </div>

      {/* URL Input Form */}
      {showUrlInput && (
        <form
          onSubmit={handleAddUrl}
          className="flex items-center gap-2 p-3 bg-muted/50 rounded-2xl border border-border animate-in fade-in duration-150"
        >
          <input
            type="url"
            placeholder="https://example.com/plant-photo.jpg"
            value={urlValue}
            onChange={(e) => setUrlValue(e.target.value)}
            className="flex-1 px-3 py-2 text-xs rounded-xl border border-border bg-background focus:ring-2 focus:ring-emerald-500/25"
          />
          <button
            type="submit"
            className="px-3.5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition-colors shrink-0"
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => setShowUrlInput(false)}
            className="p-2 text-muted-foreground hover:text-foreground rounded-xl"
          >
            <X className="w-4 h-4" />
          </button>
        </form>
      )}

      {/* Upload Dropzone */}
      {images.length < maxImages && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => {
            if (!disabled && !uploading) {
              fileInputRef.current?.click();
            }
          }}
          className={`relative border-2 border-dashed rounded-3xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
            isDragging
              ? "border-emerald-500 bg-emerald-500/10 scale-[1.01]"
              : "border-border hover:border-emerald-500/50 bg-background/50 hover:bg-muted/30"
          } ${disabled || uploading ? "opacity-60 pointer-events-none" : ""}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
            disabled={disabled || uploading}
          />

          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
            {uploading ? (
              <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
            ) : (
              <UploadCloud className="w-6 h-6" />
            )}
          </div>

          <div>
            <div className="text-sm font-bold text-foreground">
              {uploading ? (
                uploadProgress || "Uploading plant image..."
              ) : (
                <>
                  <span className="text-emerald-600 dark:text-emerald-400 underline underline-offset-2">
                    Click to upload
                  </span>{" "}
                  or drag and drop plant photos
                </>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Supports JPEG, PNG, WEBP (Max 10MB per image) • 1st image becomes the cover photo
            </p>
          </div>
        </div>
      )}

      {/* Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          {images.map((img, index) => {
            const isPrimary = index === 0;
            return (
              <div
                key={`${img}-${index}`}
                className={`group relative rounded-2xl overflow-hidden border bg-muted/40 aspect-square shadow-2xs transition-all hover:shadow-md ${
                  isPrimary
                    ? "border-emerald-500 ring-2 ring-emerald-500/25"
                    : "border-border"
                }`}
              >
                <img
                  src={resolveImageUrl(img)}
                  alt={`Plant photo ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    // Fallback on broken image
                    (e.target as HTMLImageElement).src =
                      "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' fill='%23666'><rect width='100' height='100' fill='%23eee'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-size='12' fill='%23999'>Broken Image</text></svg>";
                  }}
                />

                {/* Primary / Cover Badge */}
                {isPrimary ? (
                  <div className="absolute top-2 left-2 z-10 inline-flex items-center gap-1 bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-md">
                    <Star className="w-2.5 h-2.5 fill-current" />
                    Cover Photo
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSetPrimary(index)}
                    title="Set as cover photo"
                    className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 hover:bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md backdrop-blur-xs flex items-center gap-1"
                  >
                    <Star className="w-2.5 h-2.5" />
                    Make Cover
                  </button>
                )}

                {/* Delete / Remove Button */}
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  disabled={disabled}
                  title="Remove image"
                  className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-black/60 hover:bg-rose-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all backdrop-blur-xs cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>

                {/* Index Pill Bottom */}
                <div className="absolute bottom-2 right-2 z-10 bg-black/50 text-white text-[10px] font-mono px-1.5 py-0.5 rounded-md backdrop-blur-xs">
                  #{index + 1}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
