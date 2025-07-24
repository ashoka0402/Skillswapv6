"use client";
import { useTheme } from "next-themes";
import Particles from "@/Reactbits/Particles/Particles";

export default function ParticlesBackground() {
  const { theme } = useTheme();

  if (theme !== "dark") return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 0, // stays behind content
        pointerEvents: "none", // does not block clicks
      }}
      aria-hidden="true"
    >
      <Particles
        particleColors={["#ffffff", "#ffffff"]}
        particleCount={200}
        particleSpread={10}
        speed={0.1}
        particleBaseSize={100}
        moveParticlesOnHover={true}
        alphaParticles={false}
        disableRotation={false}
      />
    </div>
  );
} 