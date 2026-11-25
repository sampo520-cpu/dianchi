import { log } from "./data.js";
export async function downloadQrZip(db, batchId, selectedRows) {
  const rows =
    selectedRows || db.instances.filter((i) => i.productionBatchId === batchId);
  if (!rows.length) throw Error("没有可导出的电池");
  const JSZip = (await import("jszip")).default,
    QR = (await import("qrcode")).default,
    zip = new JSZip();
  for (const i of rows) {
    const url =
      location.origin + "/passport/" + encodeURIComponent(i.passportId);
    const image = await QR.toDataURL(url, { width: 512, margin: 4 });
    zip.file(
      i.serial.replace(/[<>:"/\\|?*\x00-\x1f]/g, "_") + "-" + i.id + ".png",
      image.split(",")[1],
      { base64: true },
    );
  }
  zip.file(
    "README.txt",
    "DEMO ONLY. Local browser data is not synchronized across devices. Unpublished passports do not display publicly.",
  );
  const blob = await zip.generateAsync({ type: "blob" }),
    url = URL.createObjectURL(blob),
    a = document.createElement("a");
  a.href = url;
  a.download = "battery-qr-" + batchId + ".zip";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export async function downloadPassportPdf(element, serial) {
  const canvas = await (
    await import("html2canvas")
  ).default(element, { scale: 2, backgroundColor: "#ffffff" });
  const { jsPDF } = await import("jspdf"),
    pdf = new jsPDF({ unit: "mm", format: "a4" }),
    width = 190,
    height = (canvas.height * width) / canvas.width;
  // Split the rendered page into A4 strips, keeping multilingual text as rendered.
  const pageHeight = 277,
    stripPixels = Math.floor((pageHeight * canvas.width) / width);
  for (let y = 0, n = 0; y < canvas.height; y += stripPixels, n++) {
    if (n) pdf.addPage();
    const part = document.createElement("canvas");
    part.width = canvas.width;
    part.height = Math.min(stripPixels, canvas.height - y);
    part
      .getContext("2d")
      .drawImage(
        canvas,
        0,
        y,
        canvas.width,
        part.height,
        0,
        0,
        canvas.width,
        part.height,
      );
    pdf.addImage(
      part.toDataURL("image/png"),
      "PNG",
      10,
      10,
      width,
      (part.height * width) / canvas.width,
    );
  }
  pdf.save(serial.replace(/[<>:"/\\|?*]/g, "_") + "-passport.pdf");
}
