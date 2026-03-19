import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Netcare Health OS — AI Healthcare OS";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#1D3443",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "monospace",
        }}
      >
        {/* Green glow */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            height: 400,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(22,163,74,0.15) 0%, transparent 70%)",
          }}
        />

        {/* Green dot */}
        <div
          style={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            backgroundColor: "#4ADE80",
            marginBottom: 24,
          }}
        />

        {/* Title */}
        <div
          style={{
            fontSize: 64,
            fontWeight: 300,
            color: "white",
            letterSpacing: "-0.03em",
            marginBottom: 16,
          }}
        >
          Netcare Health OS
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 20,
            color: "rgba(255,255,255,0.4)",
            letterSpacing: "0.1em",
            textTransform: "uppercase" as const,
          }}
        >
          Autonomous AI Practice Operations
        </div>

        {/* Bottom line */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              backgroundColor: "#22C55E",
            }}
          />
          <div
            style={{
              fontSize: 13,
              color: "rgba(255,255,255,0.2)",
              letterSpacing: "0.05em",
            }}
          >
            Built by Netcare Technology — Johannesburg, South Africa
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
