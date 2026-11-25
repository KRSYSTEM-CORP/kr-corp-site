import { ImageResponse } from "next/og";

export const alt = "KR POS — El sistema para vender, controlar y crecer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 80, background: "linear-gradient(135deg,#0a0620,#2a1560 60%,#7e2ac0)", color: "#fff" }}>
        <div style={{ fontSize: 120, fontWeight: 700 }}>KR POS</div>
        <div style={{ fontSize: 44, marginTop: 16 }}>Vende, controla tu inventario y cierra tu caja.</div>
        <div style={{ fontSize: 30, marginTop: 40, color: "#c9a6e8" }}>KR System · Venezuela · 15 días gratis</div>
      </div>
    ),
    size,
  );
}
