import { C, F } from "../constants.js";

export default function Styles() {
  return <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=JetBrains+Mono:wght@400;500&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html { -webkit-font-smoothing: antialiased; }
    body { font-family: ${F.sans}; background: ${C.bg}; color: ${C.text}; }
    ::selection { background: ${C.accent}; color: ${C.text}; }
    ::-webkit-scrollbar { width: 5px; height: 5px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: ${C.muted}; border-radius: 99px; }
    input:focus, textarea:focus, select:focus { outline: none; border-color: ${C.borderLight} !important; box-shadow: 0 0 0 3px ${C.accent}44 !important; }
    @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes pulse { 0%,100% { opacity: .3; } 50% { opacity: 1; } }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    .fade-up { animation: fadeUp .4s ease both; }
    .card { background: ${C.card}; border: 1px solid ${C.border}; border-radius: 12px; transition: border-color .2s, box-shadow .2s; }
    .card:hover { border-color: ${C.borderLight}; }
    .card-lift { transition: transform .2s, box-shadow .2s; cursor: pointer; }
    .card-lift:hover { transform: translateY(-2px); box-shadow: 0 8px 24px #00000033; }
    .btn { display: inline-flex; align-items: center; gap: 7px; padding: 9px 20px; border-radius: 8px; font-family: ${F.sans}; font-size: 13.5px; font-weight: 600; cursor: pointer; transition: all .15s; border: none; }
    .btn-primary { background: ${C.text}; color: ${C.bg}; }
    .btn-primary:hover { background: ${C.surface}; }
    .btn-primary:disabled { opacity: .45; cursor: default; }
    .btn-outline { background: transparent; color: ${C.text}; border: 1px solid ${C.border}; }
    .btn-outline:hover { background: ${C.card}; border-color: ${C.borderLight}; }
    .btn-success { background: ${C.success}; color: ${C.white}; border: none; }
    .btn-success:hover { opacity: .9; }
    .btn-danger { background: ${C.dangerBg}; color: ${C.danger}; border: 1px solid ${C.danger}33; }
    .btn-danger:hover { background: #4d2525; }
    .btn-ghost { background: none; border: none; color: ${C.textDim}; padding: 5px 10px; border-radius: 6px; font-size: 13px; font-weight: 500; cursor: pointer; transition: all .15s; font-family: ${F.sans}; display: inline-flex; align-items: center; gap: 5px; }
    .btn-ghost:hover { background: ${C.accent}44; color: ${C.text}; }
    .input { width: 100%; padding: 10px 14px; border: 1px solid ${C.border}; border-radius: 8px; font-family: ${F.sans}; font-size: 14px; color: ${C.text}; background: ${C.card}; transition: all .2s; }
    .input::placeholder { color: ${C.textMuted}; }
    textarea.input { resize: vertical; }
    select.input { cursor: pointer; }
    .label { font-size: 10.5px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; color: ${C.textMuted}; font-family: ${F.sans}; }
    .serif { font-family: ${F.serif}; color: ${C.text}; letter-spacing: -.01em; }
  `}</style>;
}
