const MAX_EDGE = 1280;
const QUALITY = 0.8;

/** Shrinks a photo/screenshot to a ~200-300 KB JPEG so uploads stay inside free storage limits. */
export async function resizeImage(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", QUALITY),
  );
  if (!blob) throw new Error("Could not process image");
  return new File([blob], "evidence.jpg", { type: "image/jpeg" });
}
