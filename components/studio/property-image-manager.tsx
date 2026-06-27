"use client";

import { useState } from "react";

import { UploadDropzone, type UploadDropzoneImage } from "@/components/shared/upload-dropzone";
import {
  removePropertyImageAction,
  setMainPropertyImageAction,
  setPropertyImageLabelAction,
  uploadPropertyImagesAction,
} from "@/lib/actions/properties";
import type { ImageLabel, PropertyImage } from "@/lib/types/domain";

interface PropertyImageManagerProps {
  propertyId: string;
  images: PropertyImage[];
}

function toDropzoneImage(image: PropertyImage): UploadDropzoneImage {
  return { id: image.id, url: image.url, label: image.label, status: image.status, isMain: image.is_main };
}

export function PropertyImageManager({ propertyId, images }: PropertyImageManagerProps) {
  const [isUploading, setIsUploading] = useState(false);

  async function handleFilesSelected(files: File[]) {
    const formData = new FormData();
    for (const file of files) formData.append("files", file);
    setIsUploading(true);
    await uploadPropertyImagesAction(propertyId, formData);
    setIsUploading(false);
  }

  return (
    <UploadDropzone
      images={images.map(toDropzoneImage)}
      disabled={isUploading}
      onFilesSelected={(files) => void handleFilesSelected(files)}
      onRemove={(id) => void removePropertyImageAction(id, propertyId)}
      onLabelChange={(id, label: ImageLabel) => void setPropertyImageLabelAction(id, propertyId, label)}
      onSetMain={(id) => void setMainPropertyImageAction(id, propertyId)}
    />
  );
}
