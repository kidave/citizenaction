export async function getPdfThumbnail(file, options = {}) {
  if (!file || file.type !== "application/pdf") return null;

  const { width = 480, quality = 0.78 } = options;
  const pdfjsLib = await import("pdfjs-dist/build/pdf");

  if (typeof window !== "undefined") {
    pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";
  }

  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
  const page = await pdf.getPage(1);
  const baseViewport = page.getViewport({ scale: 1 });
  const viewport = page.getViewport({ scale: width / baseViewport.width });

  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);
  const context = canvas.getContext("2d", { alpha: false });

  if (!context) throw new Error("Unable to create PDF thumbnail canvas");

  await page.render({ canvasContext: context, viewport }).promise;

  const blob = await new Promise((resolve) => {
    canvas.toBlob(resolve, "image/webp", quality);
  });

  if (!blob) throw new Error("Unable to create PDF thumbnail");

  return new File(
    [blob],
    `${file.name.replace(/\.pdf$/i, "")}-thumbnail.webp`,
    { type: "image/webp", lastModified: Date.now() },
  );
}
