import { ImageResponse } from "next/og";

export const runtime = "edge";

export const size = {
  width: 32,
  height: 32,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#F5C400",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "8px",
          color: "#0A0A0A",
          fontSize: 20,
          fontWeight: 900,
          fontFamily: "sans-serif",
        }}
      >
        H
      </div>
    ),
    {
      ...size,
    }
  );
}