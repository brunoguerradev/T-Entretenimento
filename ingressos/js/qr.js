/* QR code em SVG (biblioteca qrcode-generator). Sem a biblioteca, mostra só o código. */
window.TIXQR = {
  svg(texto, margem = 1) {
    if (typeof window.qrcode !== "function") {
      return `<div style="padding:12px;text-align:center;font:700 12px ui-monospace,monospace;color:#2b1a29">${texto}</div>`;
    }
    const qr = window.qrcode(0, "M");
    qr.addData(String(texto));
    qr.make();
    return qr.createSvgTag({ cellSize: 4, margin: margem, scalable: true });
  },
};
