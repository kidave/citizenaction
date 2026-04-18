// utils/media/getPdfThumbnail.js

import * as pdfjsLib from "pdfjs-dist";

// 🔥 REQUIRED (very important)
pdfjsLib.GlobalWorkerOptions.workerSrc =
  `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export async function getPdfThumbnail(url) {
  try {
    const pdf = await pdfjsLib.getDocument(url).promise;
    const page = await pdf.getPage(1);

    const viewport = page.getViewport({ scale: 1 });
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({
      canvasContext: context,
      viewport,
    }).promise;

    return canvas.toDataURL();
  } catch (err) {
    console.error("PDF preview failed", err);
    return null;
  }
}