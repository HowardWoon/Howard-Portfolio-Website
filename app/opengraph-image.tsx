import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Howard Woon // Systems & AI Architect";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#090B10",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          padding: "40px",
          border: "4px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-100px",
            right: "-100px",
            width: "600px",
            height: "600px",
            background: "rgba(245, 196, 0, 0.15)",
            borderRadius: "50%",
            filter: "blur(100px)",
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "24px",
            zIndex: 10,
          }}
        >
          <div
            style={{
              color: "white",
              fontSize: 64,
              fontWeight: 900,
              letterSpacing: "-0.05em",
              display: "flex",
              alignItems: "center",
            }}
          >
            HOWARD WOON
            <span style={{ color: "#F5C400", marginLeft: "12px" }}>.</span>
          </div>
          <div
            style={{
              color: "#A3A3A3",
              fontSize: 28,
              fontFamily: "monospace",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            SYSTEMS & AI ARCHITECT
          </div>
          <div
            style={{
              marginTop: "40px",
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "100px",
              padding: "16px 32px",
              color: "white",
              fontSize: 24,
              fontFamily: "monospace",
              display: "flex",
              alignItems: "center",
            }}
          >
            AVAILABLE FOR HIRE 2026
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}