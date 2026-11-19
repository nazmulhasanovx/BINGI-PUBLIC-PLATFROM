"use client";
/** Shrink a photo in the browser (longest side `max` px, JPEG) so it is light to store and quick to show. */
export function fileToPhoto(file: File, max = 640): Promise<string> {
  return new Promise((ok, bad) => {
    if (!file.type.startsWith("image/")) return bad(new Error("Choose an image file (JPG, PNG or WEBP)"));
    if (file.size > 12 * 1024 * 1024) return bad(new Error("Photo is larger than 12 MB"));
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement("canvas"); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
      c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url); ok(c.toDataURL("image/jpeg", 0.78));
    };
    img.onerror = () => { URL.revokeObjectURL(url); bad(new Error("This file could not be read as a photo")); };
    img.src = url;
  });
}
