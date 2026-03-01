import { C, F } from "../constants.js";

export default function Logo({ size = 32, showText = true, light = false }) {
  const color = C.text;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "default" }}>
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="46" stroke={color} strokeWidth="5" fill="none"/>
        <path d="M50 72 C50 72 50 45 50 38 C50 28 42 22 32 26 C28 28 25 33 25 38 C25 48 35 52 42 48" stroke={color} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path d="M50 55 C50 55 50 42 55 35 C60 28 70 28 73 33 C76 38 73 46 66 48 C59 50 54 46 54 42" stroke={color} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </svg>
      {showText && <span style={{ fontFamily: F.serif, fontSize: size * 0.6, fontWeight: 400, color, letterSpacing: "-0.02em" }}>Founder OS</span>}
    </div>
  );
}
