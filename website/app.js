/* 轻练 · 网站版核心逻辑（数据存 localStorage） */
'use strict';

/* ================= 数据 ================= */
const svgMap = {
  squat: '<svg viewBox="0 0 84 84"><defs><radialGradient id="bg-squat" cx="50%" cy="40%"><stop offset="0%" stop-color="#e8f7f0"/><stop offset="100%" stop-color="#ffffff"/></radialGradient><linearGradient id="body-squat" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#36c99a" stop-opacity="0.9"/><stop offset="100%" stop-color="#00b578" stop-opacity="0.7"/></linearGradient></defs><circle cx="42" cy="42" r="40" fill="url(#bg-squat)"/><circle cx="20" cy="20" r="3" fill="#ffffff" opacity="0.6"/><circle cx="65" cy="15" r="2" fill="#36c99a" opacity="0.3"/><circle cx="42" cy="18" r="7" fill="url(#body-squat)"/><rect x="38" y="25" width="8" height="14" rx="4" fill="url(#body-squat)"/><rect x="26" y="31" width="32" height="5" rx="2.5" fill="url(#body-squat)" opacity="0.85"/><rect x="22" y="39" width="40" height="6" rx="3" fill="url(#body-squat)"/><rect x="22" y="45" width="6" height="14" rx="3" fill="url(#body-squat)"/><rect x="56" y="45" width="6" height="14" rx="3" fill="url(#body-squat)"/><rect x="20" y="59" width="10" height="5" rx="2.5" fill="url(#body-squat)" opacity="0.6"/><rect x="54" y="59" width="10" height="5" rx="2.5" fill="url(#body-squat)" opacity="0.6"/><path d="M16 54 Q22 60 28 60" fill="none" stroke="#ff9a2e" stroke-width="2" stroke-dasharray="3,3" opacity="0.5"/><path d="M68 54 Q62 60 56 60" fill="none" stroke="#ff9a2e" stroke-width="2" stroke-dasharray="3,3" opacity="0.5"/><circle cx="50" cy="14" r="1.5" fill="#ffffff" opacity="0.5"/></svg>',
  pushup: '<svg viewBox="0 0 84 84"><defs><radialGradient id="bg-pushup" cx="50%" cy="40%"><stop offset="0%" stop-color="#e8f7f0"/><stop offset="100%" stop-color="#ffffff"/></radialGradient><linearGradient id="body-pushup" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#36c99a" stop-opacity="0.9"/><stop offset="100%" stop-color="#00b578" stop-opacity="0.7"/></linearGradient></defs><circle cx="42" cy="42" r="40" fill="url(#bg-pushup)"/><circle cx="18" cy="20" r="3" fill="#ffffff" opacity="0.6"/><circle cx="66" cy="18" r="2" fill="#36c99a" opacity="0.3"/><circle cx="14" cy="36" r="7" fill="url(#body-pushup)"/><rect x="20" y="34" width="40" height="8" rx="4" fill="url(#body-pushup)"/><rect x="22" y="42" width="5" height="16" rx="2.5" fill="url(#body-pushup)"/><rect x="20" y="56" width="9" height="5" rx="2.5" fill="url(#body-pushup)" opacity="0.6"/><rect x="58" y="36" width="20" height="6" rx="3" fill="url(#body-pushup)"/><rect x="74" y="40" width="6" height="5" rx="2.5" fill="url(#body-pushup)" opacity="0.6"/><path d="M28 58 Q34 52 40 54" fill="none" stroke="#ff9a2e" stroke-width="2" stroke-dasharray="3,3" opacity="0.5"/><circle cx="50" cy="14" r="1.5" fill="#ffffff" opacity="0.5"/></svg>',
  plank: '<svg viewBox="0 0 84 84"><defs><radialGradient id="bg-plank" cx="50%" cy="40%"><stop offset="0%" stop-color="#e8f7f0"/><stop offset="100%" stop-color="#ffffff"/></radialGradient><linearGradient id="body-plank" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#36c99a" stop-opacity="0.9"/><stop offset="100%" stop-color="#00b578" stop-opacity="0.7"/></linearGradient></defs><circle cx="42" cy="42" r="40" fill="url(#bg-plank)"/><circle cx="18" cy="20" r="3" fill="#ffffff" opacity="0.6"/><circle cx="66" cy="20" r="2" fill="#36c99a" opacity="0.3"/><circle cx="14" cy="36" r="7" fill="url(#body-plank)"/><rect x="20" y="34" width="44" height="8" rx="4" fill="url(#body-plank)"/><rect x="22" y="42" width="5" height="8" rx="2.5" fill="url(#body-plank)"/><rect x="14" y="48" width="14" height="5" rx="2.5" fill="url(#body-plank)" opacity="0.85"/><rect x="62" y="36" width="18" height="6" rx="3" fill="url(#body-plank)"/><rect x="76" y="40" width="5" height="5" rx="2.5" fill="url(#body-plank)" opacity="0.6"/><path d="M32 58 L48 58" fill="none" stroke="#ff9a2e" stroke-width="2" stroke-dasharray="3,3" opacity="0.5"/><circle cx="50" cy="14" r="1.5" fill="#ffffff" opacity="0.5"/></svg>',
  burpee: '<svg viewBox="0 0 84 84"><defs><radialGradient id="bg-burpee" cx="50%" cy="40%"><stop offset="0%" stop-color="#e8f7f0"/><stop offset="100%" stop-color="#ffffff"/></radialGradient><linearGradient id="body-burpee" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#36c99a" stop-opacity="0.9"/><stop offset="100%" stop-color="#00b578" stop-opacity="0.7"/></linearGradient></defs><circle cx="42" cy="42" r="40" fill="url(#bg-burpee)"/><circle cx="20" cy="20" r="3" fill="#ffffff" opacity="0.6"/><circle cx="65" cy="15" r="2" fill="#36c99a" opacity="0.3"/><circle cx="54" cy="20" r="7" fill="url(#body-burpee)"/><rect x="50" y="27" width="8" height="14" rx="4" fill="url(#body-burpee)" transform="rotate(-25 54 34)"/><rect x="48" y="28" width="5" height="24" rx="2.5" fill="url(#body-burpee)"/><rect x="46" y="50" width="9" height="5" rx="2.5" fill="url(#body-burpee)" opacity="0.6"/><rect x="38" y="40" width="6" height="14" rx="3" fill="url(#body-burpee)" transform="rotate(-30 41 47)"/><rect x="30" y="48" width="5" height="14" rx="2.5" fill="url(#body-burpee)"/><rect x="28" y="60" width="9" height="5" rx="2.5" fill="url(#body-burpee)" opacity="0.6"/><path d="M20 30 Q26 24 32 22" fill="none" stroke="#ff9a2e" stroke-width="2" stroke-dasharray="3,3" opacity="0.5"/><circle cx="22" cy="50" r="1.5" fill="#ffffff" opacity="0.5"/></svg>',
  crunch: '<svg viewBox="0 0 84 84"><defs><radialGradient id="bg-crunch" cx="50%" cy="40%"><stop offset="0%" stop-color="#e8f7f0"/><stop offset="100%" stop-color="#ffffff"/></radialGradient><linearGradient id="body-crunch" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#36c99a" stop-opacity="0.9"/><stop offset="100%" stop-color="#00b578" stop-opacity="0.7"/></linearGradient></defs><circle cx="42" cy="42" r="40" fill="url(#bg-crunch)"/><circle cx="20" cy="20" r="3" fill="#ffffff" opacity="0.6"/><circle cx="65" cy="15" r="2" fill="#36c99a" opacity="0.3"/><circle cx="28" cy="30" r="7" fill="url(#body-crunch)"/><rect x="32" y="34" width="22" height="8" rx="4" fill="url(#body-crunch)" transform="rotate(20 43 38)"/><rect x="48" y="40" width="6" height="16" rx="3" fill="url(#body-crunch)" transform="rotate(60 51 48)"/><rect x="18" y="50" width="32" height="6" rx="3" fill="url(#body-crunch)"/><rect x="18" y="50" width="5" height="14" rx="2.5" fill="url(#body-crunch)" transform="rotate(40 20 57)"/><rect x="46" y="50" width="5" height="14" rx="2.5" fill="url(#body-crunch)" transform="rotate(-40 48 57)"/><path d="M22 30 Q26 24 32 24" fill="none" stroke="#ff9a2e" stroke-width="2" stroke-dasharray="3,3" opacity="0.5"/><circle cx="60" cy="30" r="1.5" fill="#ffffff" opacity="0.5"/></svg>',
  lunge: '<svg viewBox="0 0 84 84"><defs><radialGradient id="bg-lunge" cx="50%" cy="40%"><stop offset="0%" stop-color="#e8f7f0"/><stop offset="100%" stop-color="#ffffff"/></radialGradient><linearGradient id="body-lunge" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#36c99a" stop-opacity="0.9"/><stop offset="100%" stop-color="#00b578" stop-opacity="0.7"/></linearGradient></defs><circle cx="42" cy="42" r="40" fill="url(#bg-lunge)"/><circle cx="20" cy="20" r="3" fill="#ffffff" opacity="0.6"/><circle cx="65" cy="15" r="2" fill="#36c99a" opacity="0.3"/><circle cx="42" cy="14" r="7" fill="url(#body-lunge)"/><rect x="38" y="21" width="8" height="18" rx="4" fill="url(#body-lunge)"/><rect x="30" y="28" width="6" height="16" rx="3" fill="url(#body-lunge)" opacity="0.85"/><rect x="48" y="28" width="6" height="16" rx="3" fill="url(#body-lunge)" opacity="0.85"/><rect x="44" y="39" width="6" height="14" rx="3" fill="url(#body-lunge)" transform="rotate(-55 47 46)"/><rect x="56" y="42" width="6" height="14" rx="3" fill="url(#body-lunge)"/><rect x="54" y="55" width="10" height="5" rx="2.5" fill="url(#body-lunge)" opacity="0.6"/><rect x="30" y="44" width="20" height="6" rx="3" fill="url(#body-lunge)" transform="rotate(35 40 47)"/><rect x="20" y="58" width="6" height="5" rx="2.5" fill="url(#body-lunge)" opacity="0.6"/><path d="M20 42 Q14 46 14 52" fill="none" stroke="#ff9a2e" stroke-width="2" stroke-dasharray="3,3" opacity="0.5"/><circle cx="60" cy="30" r="1.5" fill="#ffffff" opacity="0.5"/></svg>',
  bridge: '<svg viewBox="0 0 84 84"><defs><radialGradient id="bg-bridge" cx="50%" cy="40%"><stop offset="0%" stop-color="#e8f7f0"/><stop offset="100%" stop-color="#ffffff"/></radialGradient><linearGradient id="body-bridge" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#36c99a" stop-opacity="0.9"/><stop offset="100%" stop-color="#00b578" stop-opacity="0.7"/></linearGradient></defs><circle cx="42" cy="42" r="40" fill="url(#bg-bridge)"/><circle cx="20" cy="20" r="3" fill="#ffffff" opacity="0.6"/><circle cx="65" cy="15" r="2" fill="#36c99a" opacity="0.3"/><circle cx="16" cy="48" r="7" fill="url(#body-bridge)"/><rect x="22" y="46" width="30" height="8" rx="4" fill="url(#body-bridge)" transform="rotate(-18 37 50)"/><rect x="48" y="38" width="6" height="14" rx="3" fill="url(#body-bridge)"/><rect x="44" y="50" width="10" height="6" rx="3" fill="url(#body-bridge)" opacity="0.6"/><rect x="14" y="54" width="14" height="6" rx="3" fill="url(#body-bridge)" opacity="0.6"/><path d="M30 38 Q42 32 54 38" fill="none" stroke="#ff9a2e" stroke-width="2" stroke-dasharray="3,3" opacity="0.5"/><circle cx="60" cy="40" r="1.5" fill="#ffffff" opacity="0.5"/></svg>',
  stretch: '<svg viewBox="0 0 84 84"><defs><radialGradient id="bg-stretch" cx="50%" cy="40%"><stop offset="0%" stop-color="#e8f7f0"/><stop offset="100%" stop-color="#ffffff"/></radialGradient><linearGradient id="body-stretch" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#36c99a" stop-opacity="0.9"/><stop offset="100%" stop-color="#00b578" stop-opacity="0.7"/></linearGradient></defs><circle cx="42" cy="42" r="40" fill="url(#bg-stretch)"/><circle cx="20" cy="20" r="3" fill="#ffffff" opacity="0.6"/><circle cx="65" cy="15" r="2" fill="#36c99a" opacity="0.3"/><circle cx="30" cy="44" r="7" fill="url(#body-stretch)"/><rect x="34" y="42" width="20" height="7" rx="3.5" fill="url(#body-stretch)" transform="rotate(-35 44 45)"/><rect x="48" y="28" width="6" height="20" rx="3" fill="url(#body-stretch)" transform="rotate(25 51 38)"/><rect x="50" y="28" width="6" height="20" rx="3" fill="url(#body-stretch)" transform="rotate(45 53 38)"/><rect x="22" y="58" width="6" height="14" rx="3" fill="url(#body-stretch)"/><rect x="48" y="58" width="6" height="14" rx="3" fill="url(#body-stretch)"/><rect x="20" y="70" width="10" height="5" rx="2.5" fill="url(#body-stretch)" opacity="0.6"/><rect x="46" y="70" width="10" height="5" rx="2.5" fill="url(#body-stretch)" opacity="0.6"/><path d="M22 34 Q28 30 34 32" fill="none" stroke="#ff9a2e" stroke-width="2" stroke-dasharray="3,3" opacity="0.5"/><circle cx="62" cy="52" r="1.5" fill="#ffffff" opacity="0.5"/></svg>',
  mountain: '<svg viewBox="0 0 84 84"><defs><radialGradient id="bg-mountain" cx="50%" cy="40%"><stop offset="0%" stop-color="#e8f7f0"/><stop offset="100%" stop-color="#ffffff"/></radialGradient><linearGradient id="body-mountain" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#36c99a" stop-opacity="0.9"/><stop offset="100%" stop-color="#00b578" stop-opacity="0.7"/></linearGradient></defs><circle cx="42" cy="42" r="40" fill="url(#bg-mountain)"/><circle cx="20" cy="20" r="3" fill="#ffffff" opacity="0.6"/><circle cx="65" cy="15" r="2" fill="#36c99a" opacity="0.3"/><circle cx="14" cy="34" r="7" fill="url(#body-mountain)"/><rect x="20" y="32" width="42" height="8" rx="4" fill="url(#body-mountain)"/><rect x="22" y="40" width="5" height="16" rx="2.5" fill="url(#body-mountain)"/><rect x="20" y="54" width="9" height="5" rx="2.5" fill="url(#body-mountain)" opacity="0.6"/><rect x="60" y="34" width="20" height="6" rx="3" fill="url(#body-mountain)"/><rect x="76" y="38" width="6" height="5" rx="2.5" fill="url(#body-mountain)" opacity="0.6"/><rect x="34" y="40" width="6" height="14" rx="3" fill="url(#body-mountain)" transform="rotate(20 37 47)"/><path d="M28 30 Q24 24 30 20" fill="none" stroke="#ff9a2e" stroke-width="2" stroke-dasharray="3,3" opacity="0.5"/><circle cx="60" cy="14" r="1.5" fill="#ffffff" opacity="0.5"/></svg>',
  jump: '<svg viewBox="0 0 84 84"><defs><radialGradient id="bg-jump" cx="50%" cy="40%"><stop offset="0%" stop-color="#e8f7f0"/><stop offset="100%" stop-color="#ffffff"/></radialGradient><linearGradient id="body-jump" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#36c99a" stop-opacity="0.9"/><stop offset="100%" stop-color="#00b578" stop-opacity="0.7"/></linearGradient></defs><circle cx="42" cy="42" r="40" fill="url(#bg-jump)"/><circle cx="20" cy="20" r="3" fill="#ffffff" opacity="0.6"/><circle cx="65" cy="15" r="2" fill="#36c99a" opacity="0.3"/><circle cx="42" cy="14" r="7" fill="url(#body-jump)"/><rect x="38" y="21" width="8" height="20" rx="4" fill="url(#body-jump)"/><rect x="28" y="24" width="6" height="16" rx="3" fill="url(#body-jump)" transform="rotate(45 31 32)"/><rect x="50" y="24" width="6" height="16" rx="3" fill="url(#body-jump)" transform="rotate(-45 53 32)"/><rect x="36" y="41" width="6" height="14" rx="3" fill="url(#body-jump)" transform="rotate(-25 39 48)"/><rect x="48" y="41" width="6" height="14" rx="3" fill="url(#body-jump)" transform="rotate(25 51 48)"/><path d="M22 56 Q26 50 30 48" fill="none" stroke="#ff9a2e" stroke-width="2" stroke-dasharray="3,3" opacity="0.5"/><path d="M62 56 Q58 50 54 48" fill="none" stroke="#ff9a2e" stroke-width="2" stroke-dasharray="3,3" opacity="0.5"/><circle cx="22" cy="30" r="1.5" fill="#ffffff" opacity="0.5"/></svg>',
  run: '<svg viewBox="0 0 84 84"><defs><radialGradient id="bg-run" cx="50%" cy="40%"><stop offset="0%" stop-color="#e8f7f0"/><stop offset="100%" stop-color="#ffffff"/></radialGradient><linearGradient id="body-run" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#36c99a" stop-opacity="0.9"/><stop offset="100%" stop-color="#00b578" stop-opacity="0.7"/></linearGradient></defs><circle cx="42" cy="42" r="40" fill="url(#bg-run)"/><circle cx="20" cy="20" r="3" fill="#ffffff" opacity="0.6"/><circle cx="65" cy="15" r="2" fill="#36c99a" opacity="0.3"/><circle cx="46" cy="14" r="7" fill="url(#body-run)"/><rect x="42" y="21" width="8" height="18" rx="4" fill="url(#body-run)" transform="rotate(12 46 30)"/><rect x="38" y="28" width="6" height="14" rx="3" fill="url(#body-run)" transform="rotate(-55 41 35)"/><rect x="50" y="28" width="6" height="14" rx="3" fill="url(#body-run)" transform="rotate(35 53 35)"/><rect x="44" y="39" width="6" height="16" rx="3" fill="url(#body-run)" transform="rotate(40 47 47)"/><rect x="36" y="39" width="6" height="16" rx="3" fill="url(#body-run)" transform="rotate(-35 39 47)"/><rect x="34" y="54" width="6" height="6" rx="3" fill="url(#body-run)" opacity="0.6"/><rect x="48" y="54" width="6" height="6" rx="3" fill="url(#body-run)" opacity="0.6"/><path d="M14 40 Q22 36 30 38" fill="none" stroke="#ff9a2e" stroke-width="2" stroke-dasharray="3,3" opacity="0.5"/><circle cx="22" cy="30" r="1.5" fill="#ffffff" opacity="0.5"/></svg>',
  superman: '<svg viewBox="0 0 84 84"><defs><radialGradient id="bg-superman" cx="50%" cy="40%"><stop offset="0%" stop-color="#e8f7f0"/><stop offset="100%" stop-color="#ffffff"/></radialGradient><linearGradient id="body-superman" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#36c99a" stop-opacity="0.9"/><stop offset="100%" stop-color="#00b578" stop-opacity="0.7"/></linearGradient></defs><circle cx="42" cy="42" r="40" fill="url(#bg-superman)"/><circle cx="20" cy="20" r="3" fill="#ffffff" opacity="0.6"/><circle cx="65" cy="15" r="2" fill="#36c99a" opacity="0.3"/><circle cx="14" cy="40" r="7" fill="url(#body-superman)"/><rect x="20" y="38" width="38" height="8" rx="4" fill="url(#body-superman)" transform="rotate(-8 39 42)"/><rect x="12" y="34" width="6" height="18" rx="3" fill="url(#body-superman)" transform="rotate(-45 15 43)"/><rect x="54" y="34" width="6" height="18" rx="3" fill="url(#body-superman)" transform="rotate(45 57 43)"/><rect x="18" y="44" width="6" height="16" rx="3" fill="url(#body-superman)" transform="rotate(35 21 52)"/><rect x="52" y="44" width="6" height="16" rx="3" fill="url(#body-superman)" transform="rotate(-35 55 52)"/><path d="M14 30 Q10 36 14 42" fill="none" stroke="#ff9a2e" stroke-width="2" stroke-dasharray="3,3" opacity="0.5"/><path d="M70 30 Q74 36 70 42" fill="none" stroke="#ff9a2e" stroke-width="2" stroke-dasharray="3,3" opacity="0.5"/><circle cx="42" cy="22" r="1.5" fill="#ffffff" opacity="0.5"/></svg>',
  opendog: '<svg viewBox="0 0 84 84"><defs><radialGradient id="bg-opendog" cx="50%" cy="40%"><stop offset="0%" stop-color="#e8f7f0"/><stop offset="100%" stop-color="#ffffff"/></radialGradient><linearGradient id="body-opendog" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#36c99a" stop-opacity="0.9"/><stop offset="100%" stop-color="#00b578" stop-opacity="0.7"/></linearGradient></defs><circle cx="42" cy="42" r="40" fill="url(#bg-opendog)"/><circle cx="20" cy="20" r="3" fill="#ffffff" opacity="0.6"/><circle cx="65" cy="15" r="2" fill="#36c99a" opacity="0.3"/><circle cx="16" cy="50" r="7" fill="url(#body-opendog)"/><rect x="22" y="48" width="24" height="6" rx="3" fill="url(#body-opendog)" transform="rotate(-55 34 51)"/><rect x="40" y="22" width="24" height="6" rx="3" fill="url(#body-opendog)" transform="rotate(55 52 25)"/><rect x="56" y="50" width="6" height="14" rx="3" fill="url(#body-opendog)"/><rect x="12" y="56" width="9" height="5" rx="2.5" fill="url(#body-opendog)" opacity="0.6"/><rect x="58" y="62" width="9" height="5" rx="2.5" fill="url(#body-opendog)" opacity="0.6"/><path d="M30 28 Q36 22 42 24" fill="none" stroke="#ff9a2e" stroke-width="2" stroke-dasharray="3,3" opacity="0.5"/><circle cx="50" cy="40" r="1.5" fill="#ffffff" opacity="0.5"/></svg>',
  sidelying: '<svg viewBox="0 0 84 84"><defs><radialGradient id="bg-sidelying" cx="50%" cy="40%"><stop offset="0%" stop-color="#e8f7f0"/><stop offset="100%" stop-color="#ffffff"/></radialGradient><linearGradient id="body-sidelying" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#36c99a" stop-opacity="0.9"/><stop offset="100%" stop-color="#00b578" stop-opacity="0.7"/></linearGradient></defs><circle cx="42" cy="42" r="40" fill="url(#bg-sidelying)"/><circle cx="20" cy="20" r="3" fill="#ffffff" opacity="0.6"/><circle cx="65" cy="15" r="2" fill="#36c99a" opacity="0.3"/><circle cx="16" cy="34" r="7" fill="url(#body-sidelying)"/><rect x="22" y="32" width="34" height="8" rx="4" fill="url(#body-sidelying)"/><rect x="54" y="34" width="14" height="6" rx="3" fill="url(#body-sidelying)" opacity="0.85"/><rect x="44" y="22" width="6" height="14" rx="3" fill="url(#body-sidelying)" transform="rotate(-35 47 29)"/><rect x="20" y="40" width="6" height="14" rx="3" fill="url(#body-sidelying)" transform="rotate(25 23 47)"/><rect x="34" y="40" width="6" height="14" rx="3" fill="url(#body-sidelying)" transform="rotate(-10 37 47)"/><rect x="18" y="54" width="14" height="5" rx="2.5" fill="url(#body-sidelying)" opacity="0.6"/><path d="M50 22 Q56 18 60 22" fill="none" stroke="#ff9a2e" stroke-width="2" stroke-dasharray="3,3" opacity="0.5"/><circle cx="60" cy="40" r="1.5" fill="#ffffff" opacity="0.5"/></svg>',
  rotate: '<svg viewBox="0 0 84 84"><defs><radialGradient id="bg-rotate" cx="50%" cy="40%"><stop offset="0%" stop-color="#e8f7f0"/><stop offset="100%" stop-color="#ffffff"/></radialGradient><linearGradient id="body-rotate" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#36c99a" stop-opacity="0.9"/><stop offset="100%" stop-color="#00b578" stop-opacity="0.7"/></linearGradient></defs><circle cx="42" cy="42" r="40" fill="url(#bg-rotate)"/><circle cx="20" cy="20" r="3" fill="#ffffff" opacity="0.6"/><circle cx="65" cy="15" r="2" fill="#36c99a" opacity="0.3"/><circle cx="38" cy="20" r="7" fill="url(#body-rotate)"/><rect x="34" y="27" width="8" height="16" rx="4" fill="url(#body-rotate)" transform="rotate(-15 38 35)"/><rect x="40" y="32" width="22" height="6" rx="3" fill="url(#body-rotate)" transform="rotate(-15 51 35)"/><rect x="28" y="42" width="6" height="14" rx="3" fill="url(#body-rotate)" transform="rotate(20 31 49)"/><rect x="42" y="42" width="6" height="14" rx="3" fill="url(#body-rotate)" transform="rotate(-15 45 49)"/><path d="M20 36 Q26 30 32 32" fill="none" stroke="#ff9a2e" stroke-width="2" stroke-dasharray="3,3" opacity="0.5"/><path d="M60 30 Q66 26 70 30" fill="none" stroke="#ff9a2e" stroke-width="2" stroke-dasharray="3,3" opacity="0.5"/><circle cx="58" cy="22" r="1.5" fill="#ffffff" opacity="0.5"/></svg>',
  warmup: '<svg viewBox="0 0 84 84"><defs><radialGradient id="bg-warmup" cx="50%" cy="40%"><stop offset="0%" stop-color="#e8f7f0"/><stop offset="100%" stop-color="#ffffff"/></radialGradient><linearGradient id="body-warmup" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#36c99a" stop-opacity="0.9"/><stop offset="100%" stop-color="#00b578" stop-opacity="0.7"/></linearGradient></defs><circle cx="42" cy="42" r="40" fill="url(#bg-warmup)"/><circle cx="20" cy="20" r="3" fill="#ffffff" opacity="0.6"/><circle cx="65" cy="15" r="2" fill="#36c99a" opacity="0.3"/><circle cx="42" cy="14" r="7" fill="url(#body-warmup)"/><rect x="38" y="21" width="8" height="22" rx="4" fill="url(#body-warmup)"/><rect x="30" y="24" width="6" height="20" rx="3" fill="url(#body-warmup)" transform="rotate(-30 33 34)"/><rect x="48" y="24" width="6" height="20" rx="3" fill="url(#body-warmup)" transform="rotate(30 51 34)"/><rect x="34" y="43" width="6" height="16" rx="3" fill="url(#body-warmup)" transform="rotate(8 37 51)"/><rect x="48" y="43" width="6" height="16" rx="3" fill="url(#body-warmup)" transform="rotate(-8 51 51)"/><rect x="32" y="59" width="9" height="5" rx="2.5" fill="url(#body-warmup)" opacity="0.6"/><rect x="47" y="59" width="9" height="5" rx="2.5" fill="url(#body-warmup)" opacity="0.6"/><path d="M22 20 Q26 14 32 12" fill="none" stroke="#ff9a2e" stroke-width="2" stroke-dasharray="3,3" opacity="0.5"/><path d="M62 20 Q58 14 52 12" fill="none" stroke="#ff9a2e" stroke-width="2" stroke-dasharray="3,3" opacity="0.5"/><circle cx="42" cy="36" r="1.5" fill="#ffffff" opacity="0.5"/></svg>'
};
const PLANS = [
  /* 入门 / 柔韧类 */
  { id: 'p1', title: '7天入门唤醒计划', goal: '入门', level: '新手', duration: 20, kcal: 120, svg: 'warmup', exercises: ['开合跳', '高抬腿', '靠墙静蹲', '卷腹', '平板支撑'], desc: '零基础友好，唤醒沉睡身体' },
  { id: 'p6', title: '睡前拉伸放松', goal: '入门', level: '新手', duration: 15, kcal: 60, svg: 'stretch', exercises: ['颈部拉伸', '肩部环绕', '婴儿式', '猫式伸展', '腿部后侧拉伸'], desc: '缓解久坐疲劳，助眠放松' },
  { id: 'p8', title: '办公室微运动', goal: '入门', level: '新手', duration: 10, kcal: 50, svg: 'warmup', exercises: ['靠墙静蹲', '座椅深蹲', '颈部拉伸', '肩部环绕'], desc: '工位间隙完成，对抗久坐' },
  { id: 'p27', title: '颈椎肩颈放松', goal: '入门', level: '新手', duration: 12, kcal: 40, svg: 'stretch', exercises: ['颈部拉伸', '肩部环绕', '猫式伸展', '婴儿式', '门框天使'], desc: '缓解颈肩僵硬，一身轻松' },
  { id: 'p28', title: '晨间唤醒拉伸', goal: '入门', level: '新手', duration: 15, kcal: 55, svg: 'warmup', exercises: ['猫式伸展', '婴儿式', '下犬式', '颈部拉伸', '肩部环绕', '腿部后侧拉伸'], desc: '晨起拉伸，唤醒沉睡身体' },
  { id: 'p29', title: '产后恢复入门', goal: '入门', level: '新手', duration: 20, kcal: 90, svg: 'bridge', exercises: ['凯格尔', '死虫式', '臀桥', '靠墙静蹲', '颈部拉伸', '猫式伸展'], desc: '产后温和恢复，重塑核心' },
  { id: 'p30', title: '老年友好运动', goal: '入门', level: '新手', duration: 20, kcal: 50, svg: 'warmup', exercises: ['靠墙静蹲', '座椅深蹲', '颈部拉伸', '肩部环绕', '猫式伸展', '提踵'], desc: '低强度训练，长辈也能练' },
  /* 减脂类 */
  { id: 'p2', title: '高效减脂 HIIT', goal: '减脂', level: '中级', duration: 30, kcal: 320, svg: 'burpee', exercises: ['波比跳', '开合跳', '深蹲跳', '登山跑', '平板支撑'], desc: '短时高效燃脂，动后持续耗能' },
  { id: 'p7', title: '全身循环燃脂', goal: '减脂', level: '高级', duration: 45, kcal: 420, svg: 'jump', exercises: ['波比跳', '壶铃摆动', '箭步蹲', '俯卧撑', '登山跑', '平板支撑'], desc: '六大动作循环，全身高效燃脂' },
  { id: 'p9', title: 'Tabata 极速燃脂', goal: '减脂', level: '中级', duration: 16, kcal: 200, svg: 'burpee', exercises: ['波比跳', '高抬腿', '深蹲跳', '登山跑'], desc: '4分钟极速燃脂，动后持续耗能' },
  { id: 'p10', title: '军事体能训练', goal: '减脂', level: '高级', duration: 35, kcal: 350, svg: 'mountain', exercises: ['反向卷腹', '空中自行车', '动态平板支撑', '波比跳', '深蹲跳', '高抬腿', '跪姿屈膝抬腿', '哥萨克深蹲'], desc: '军事体能训练，锻造钢铁意志' },
  { id: 'p11', title: '燃脂有氧操', goal: '减脂', level: '中级', duration: 30, kcal: 280, svg: 'jump', exercises: ['开合跳', '高抬腿', '波比跳', '登山跑', '深蹲跳', '弓步跳'], desc: '快乐暴汗燃脂，越跳越轻盈' },
  { id: 'p12', title: '腹部核心燃脂', goal: '减脂', level: '中级', duration: 20, kcal: 180, svg: 'crunch', exercises: ['卷腹', '反向卷腹', '空中自行车', '俄罗斯转体', '仰卧抬腿', '平板支撑'], desc: '专攻腹部核心，练出马甲线' },
  { id: 'p13', title: '跳绳间歇训练', goal: '减脂', level: '中级', duration: 25, kcal: 260, svg: 'run', exercises: ['跳绳', '开合跳', '高抬腿', '波比跳', '登山跑'], desc: '跳绳间歇组合，燃脂效率拉满' },
  { id: 'p14', title: '阶梯燃脂训练', goal: '减脂', level: '高级', duration: 30, kcal: 300, svg: 'jump', exercises: ['箱跳', '深蹲跳', '弓步跳', '波比跳', '高抬腿'], desc: '爆发跳跃训练，阶梯式燃脂' },
  { id: 'p15', title: '全身燃脂循环', goal: '减脂', level: '中级', duration: 28, kcal: 290, svg: 'burpee', exercises: ['俯卧撑', '深蹲', '波比跳', '平板支撑', '开合跳', '高抬腿'], desc: '六大动作循环，全身燃脂不间断' },
  /* 增肌类 */
  { id: 'p4', title: '上肢力量强化', goal: '增肌', level: '高级', duration: 40, kcal: 280, svg: 'pushup', exercises: ['俯卧撑', '窄距俯卧撑', '臂屈伸', '超人式', '平板支撑'], desc: '胸肩臂协同发力，打造上肢线条' },
  { id: 'p16', title: '胸肌泵感训练', goal: '增肌', level: '高级', duration: 30, kcal: 240, svg: 'pushup', exercises: ['俯卧撑', '宽距俯卧撑', '钻石俯卧撑', '击掌俯卧撑', '跪姿爆发俯卧撑'], desc: '五种俯卧撑变式，胸肌泵感十足' },
  { id: 'p17', title: '核心钢铁防线', goal: '增肌', level: '中级', duration: 25, kcal: 160, svg: 'plank', exercises: ['平板支撑', '侧平板', '动态平板支撑', '死虫式', '仰卧抬腿', '俄罗斯转体'], desc: '核心稳定训练，铸就钢铁防线' },
  { id: 'p18', title: '背部力量建设', goal: '增肌', level: '中级', duration: 30, kcal: 200, svg: 'superman', exercises: ['引体向上', '超人式', '俯卧撑触肩', '反向飞鸟', '眼镜蛇式'], desc: '强化背部肌群，改善含胸体态' },
  { id: 'p19', title: '下肢力量增长', goal: '增肌', level: '中级', duration: 35, kcal: 280, svg: 'squat', exercises: ['深蹲', '弓步蹲', '单腿深蹲', '臀桥', '哥萨克深蹲', '提踵'], desc: '下肢力量训练，打造稳固底盘' },
  { id: 'p20', title: '全身力量增长', goal: '增肌', level: '高级', duration: 40, kcal: 320, svg: 'pushup', exercises: ['俯卧撑', '深蹲', '引体向上', '臀桥', '超人式', '平板支撑'], desc: '全身复合动作，力量全面提升' },
  /* 塑形类 */
  { id: 'p3', title: '马甲线养成', goal: '塑形', level: '中级', duration: 25, kcal: 200, svg: 'crunch', exercises: ['卷腹', '俄罗斯转体', '仰卧抬腿', '平板支撑', '侧平板'], desc: '针对腹部核心线条训练' },
  { id: 'p5', title: '下肢臀腿塑造', goal: '塑形', level: '中级', duration: 30, kcal: 260, svg: 'squat', exercises: ['深蹲', '弓步蹲', '臀桥', '侧抬腿', '提踵'], desc: '翘臀细腿，改善下肢线条' },
  { id: 'p21', title: '翘臀蜜桃臀', goal: '塑形', level: '中级', duration: 25, kcal: 180, svg: 'bridge', exercises: ['臀桥', '单腿臀桥', '螃蟹步', '蚌式开合', '深蹲', '弓步蹲'], desc: '臀桥变式组合，塑造蜜桃翘臀' },
  { id: 'p22', title: '天鹅臂雕刻', goal: '塑形', level: '中级', duration: 22, kcal: 150, svg: 'pushup', exercises: ['俯卧撑', '臂屈伸', '钻石俯卧撑', '侧平板', '俯卧撑触肩'], desc: '上肢雕刻训练，告别拜拜肉' },
  { id: 'p23', title: '美腿线条', goal: '塑形', level: '中级', duration: 28, kcal: 200, svg: 'lunge', exercises: ['深蹲', '弓步蹲', '提踵', '侧抬腿', '臀桥', '靠墙静蹲'], desc: '腿部塑形训练，线条纤细紧致' },
  { id: 'p24', title: '马甲线进阶', goal: '塑形', level: '高级', duration: 30, kcal: 220, svg: 'crunch', exercises: ['卷腹', '俄罗斯转体', '仰卧抬腿', '侧平板', '空中自行车', '反向卷腹'], desc: '腹部进阶训练，马甲线更深' },
  { id: 'p25', title: '体态矫正计划', goal: '塑形', level: '新手', duration: 18, kcal: 80, svg: 'stretch', exercises: ['门框天使', '毛巾颈后抗阻', '死虫式', '猫式伸展', '超人式', '婴儿式'], desc: '矫正含胸驼背，重塑挺拔身姿' },
  { id: 'p26', title: '女性居家塑形', goal: '塑形', level: '新手', duration: 25, kcal: 160, svg: 'bridge', exercises: ['死虫式', '卷腹', '跪姿钻石俯卧撑', '单腿臀桥', '螃蟹步', '蚌式开合'], desc: '女性居家塑形，紧致全身线条' }
];
const EXERCISES = [
  { id: 'e1', name: '开合跳', part: '全身', level: '新手', minutes: 3, kcal: 30, desc: '跳跃同时双脚向外分开、双手头顶击掌，保持节奏均匀。' },
  { id: 'e2', name: '深蹲', part: '臀腿', level: '新手', minutes: 5, kcal: 45, desc: '双脚与肩同宽，臀部向后坐，膝盖对准脚尖方向。' },
  { id: 'e3', name: '俯卧撑', part: '胸臂', level: '中级', minutes: 5, kcal: 50, desc: '身体保持一条直线，下降至胸口接近地面再推起。' },
  { id: 'e4', name: '平板支撑', part: '核心', level: '新手', minutes: 3, kcal: 25, desc: '肘撑地，核心收紧，身体呈一条直线不塌腰。' },
  { id: 'e5', name: '卷腹', part: '腹部', level: '新手', minutes: 4, kcal: 30, desc: '下背贴地，用腹部力量卷起上背部，颈部放松。' },
  { id: 'e6', name: '波比跳', part: '全身', level: '高级', minutes: 4, kcal: 60, desc: '俯撑-跳跃-站立的复合动作，燃脂效率极高。' },
  { id: 'e7', name: '弓步蹲', part: '臀腿', level: '新手', minutes: 5, kcal: 40, desc: '前后腿交替下蹲，前膝不超过脚尖。' },
  { id: 'e8', name: '臀桥', part: '臀腿', level: '新手', minutes: 4, kcal: 25, desc: '仰卧屈膝，臀部发力向上顶起，肩髋膝一条线。' },
  { id: 'e9', name: '登山跑', part: '核心', level: '中级', minutes: 3, kcal: 40, desc: '俯撑姿势交替提膝向胸口，保持核心稳定。' },
  { id: 'e10', name: '高抬腿', part: '全身', level: '新手', minutes: 2, kcal: 25, desc: '原地快速抬腿至髋部高度，手臂自然摆动。' },
  { id: 'e11', name: '俄罗斯转体', part: '腹部', level: '中级', minutes: 4, kcal: 35, desc: '坐姿抬脚，双手交替触碰身体两侧地面。' },
  { id: 'e12', name: '靠墙静蹲', part: '臀腿', level: '新手', minutes: 3, kcal: 20, desc: '背贴墙下蹲至大腿平行地面，静态保持。' },
  { id: 'e13', name: '臂屈伸', part: '胸臂', level: '中级', minutes: 4, kcal: 35, desc: '利用椅子或稳固支撑完成手臂屈伸，锻炼肱三头肌。' },
  { id: 'e14', name: '猫式伸展', part: '核心', level: '新手', minutes: 3, kcal: 10, desc: '四点跪姿，弓背与塌腰交替，活动脊柱。' },
  { id: 'e15', name: '婴儿式', part: '柔韧', level: '新手', minutes: 3, kcal: 8, desc: '跪坐臀部后坐，手臂前伸，放松背部与肩部。' },
  { id: 'e16', name: '超人式', part: '背部', level: '新手', minutes: 3, kcal: 18, desc: '俯卧同时抬起四肢，强化下背部。' },
  /* —— 任务要求补充的 24 个新动作 —— */
  { id: 'e17', name: '死虫式', part: '核心', level: '新手', minutes: 3, kcal: 18, desc: '仰卧交替伸展对侧手脚，全程保持腰部贴地。' },
  { id: 'e18', name: '反向卷腹', part: '腹部', level: '新手', minutes: 4, kcal: 30, desc: '仰卧屈膝，用下腹力量将髋部卷起离地。' },
  { id: 'e19', name: '空中自行车', part: '腹部', level: '中级', minutes: 4, kcal: 35, desc: '仰卧交替屈伸腿如蹬车，充分激活腹肌。' },
  { id: 'e20', name: '动态平板支撑', part: '核心', level: '中级', minutes: 3, kcal: 30, desc: '平板与高位平板交替，手臂伸直再屈肘回落。' },
  { id: 'e21', name: '侧平板', part: '核心', level: '中级', minutes: 3, kcal: 25, desc: '侧卧单臂撑起，身体呈一条直线不塌髋。' },
  { id: 'e22', name: '宽距俯卧撑', part: '胸臂', level: '中级', minutes: 5, kcal: 50, desc: '双手宽于肩，侧重胸肌外侧发力。' },
  { id: 'e23', name: '钻石俯卧撑', part: '胸臂', level: '高级', minutes: 5, kcal: 55, desc: '双手拇指食指相触呈菱形，强化肱三头肌。' },
  { id: 'e24', name: '击掌俯卧撑', part: '胸臂', level: '高级', minutes: 4, kcal: 70, desc: '爆发推起空中击掌再落地，提升上肢爆发力。' },
  { id: 'e25', name: '跪姿爆发俯卧撑', part: '胸臂', level: '中级', minutes: 4, kcal: 45, desc: '跪姿完成爆发俯卧撑，降低难度保留爆发。' },
  { id: 'e26', name: '单腿臀桥', part: '臀腿', level: '中级', minutes: 4, kcal: 30, desc: '单腿支撑顶髋，强化臀大肌与髋稳定。' },
  { id: 'e27', name: '螃蟹步', part: '臀腿', level: '新手', minutes: 3, kcal: 25, desc: '微蹲姿态横向行走，激活臀中肌。' },
  { id: 'e28', name: '蚌式开合', part: '臀腿', level: '新手', minutes: 3, kcal: 18, desc: '侧卧屈膝开合双膝，激活臀中肌。' },
  { id: 'e29', name: '哥萨克深蹲', part: '臀腿', level: '高级', minutes: 5, kcal: 50, desc: '宽站距交替侧移重心，深蹲并拉伸内收肌。' },
  { id: 'e30', name: '门框天使', part: '背部', level: '新手', minutes: 3, kcal: 12, desc: '贴墙/门框做手臂上下滑动，打开胸腔改善体态。' },
  { id: 'e31', name: '毛巾颈后抗阻', part: '颈部', level: '新手', minutes: 3, kcal: 10, desc: '毛巾置于颈后施加阻力，强化颈深屈肌。' },
  { id: 'e32', name: '猫牛式', part: '核心', level: '新手', minutes: 3, kcal: 10, desc: '四点跪姿弓背与塌腰交替，灵活脊柱。' },
  { id: 'e33', name: '下犬式', part: '柔韧', level: '新手', minutes: 3, kcal: 12, desc: '双手双脚撑地呈倒 V，拉伸整个后侧链条。' },
  { id: 'e34', name: '眼镜蛇式', part: '柔韧', level: '新手', minutes: 3, kcal: 10, desc: '俯卧双手撑起上身，伸展腹部与脊柱。' },
  { id: 'e35', name: '座椅深蹲', part: '臀腿', level: '新手', minutes: 4, kcal: 30, desc: '坐向椅子再起身，新手友好的深蹲入门。' },
  { id: 'e36', name: '侧抬腿', part: '臀腿', level: '新手', minutes: 3, kcal: 18, desc: '侧卧抬起上方腿，锻炼臀外侧与大腿。' },
  { id: 'e37', name: '引体向上', part: '背部', level: '高级', minutes: 5, kcal: 60, desc: '双手悬垂拉起下巴过杠，强化背阔肌。' },
  { id: 'e38', name: '反向飞鸟', part: '背部', level: '中级', minutes: 4, kcal: 30, desc: '俯身水平打开双臂，强化中下斜方肌。' },
  { id: 'e39', name: '凯格尔', part: '核心', level: '新手', minutes: 4, kcal: 8, desc: '收紧盆底肌保持再放松，温和恢复核心。' },
  { id: 'e40', name: '箱跳', part: '臀腿', level: '高级', minutes: 4, kcal: 55, desc: '跳上稳固箱体再轻落，提升下肢爆发力。' },
  /* —— 现有计划中已引用但缺失的动作 —— */
  { id: 'e41', name: '深蹲跳', part: '全身', level: '中级', minutes: 3, kcal: 45, desc: '深蹲后爆发跳起，落地缓冲接下一个。' },
  { id: 'e42', name: '仰卧抬腿', part: '腹部', level: '新手', minutes: 4, kcal: 28, desc: '仰卧双腿并拢下落再抬起，重点练下腹。' },
  { id: 'e43', name: '提踵', part: '小腿', level: '新手', minutes: 3, kcal: 15, desc: '前脚掌踩地踮起再落下，强化小腿。' },
  { id: 'e44', name: '颈部拉伸', part: '颈部', level: '新手', minutes: 2, kcal: 6, desc: '温和牵拉颈部各方向，缓解僵硬。' },
  { id: 'e45', name: '肩部环绕', part: '肩部', level: '新手', minutes: 2, kcal: 8, desc: '双肩前后环绕画圈，活动肩关节。' },
  { id: 'e46', name: '腿部后侧拉伸', part: '柔韧', level: '新手', minutes: 3, kcal: 8, desc: '前伸够脚，拉伸大腿后侧与小腿。' },
  { id: 'e47', name: '壶铃摆动', part: '全身', level: '高级', minutes: 4, kcal: 55, desc: '髋部发力摆动壶铃，全身爆发燃脂。' },
  { id: 'e48', name: '箭步蹲', part: '臀腿', level: '新手', minutes: 5, kcal: 40, desc: '前后腿交替下蹲，前膝不超过脚尖。' },
  { id: 'e49', name: '窄距俯卧撑', part: '胸臂', level: '高级', minutes: 5, kcal: 55, desc: '双手窄于肩，侧重肱三头肌发力。' },
  /* —— 新计划中引用的额外动作 —— */
  { id: 'e50', name: '弓步跳', part: '全身', level: '中级', minutes: 3, kcal: 45, desc: '弓步姿势爆发跳起换腿，提升心率。' },
  { id: 'e51', name: '跳绳', part: '全身', level: '新手', minutes: 5, kcal: 50, desc: '前脚掌轻巧弹跳，保持节奏均匀。' },
  { id: 'e52', name: '跪姿屈膝抬腿', part: '臀腿', level: '新手', minutes: 3, kcal: 20, desc: '跪姿向后上方抬腿，激活臀大肌。' },
  { id: 'e53', name: '单腿深蹲', part: '臀腿', level: '高级', minutes: 5, kcal: 55, desc: '单腿支撑下蹲，强化下肢力量与平衡。' },
  { id: 'e54', name: '俯卧撑触肩', part: '核心', level: '中级', minutes: 4, kcal: 40, desc: '俯卧撑姿态交替触对侧肩，强化核心稳定。' },
  { id: 'e55', name: '跪姿钻石俯卧撑', part: '胸臂', level: '新手', minutes: 4, kcal: 30, desc: '跪姿完成钻石俯卧撑，降低难度保护手腕。' }
];
const FOODS = [
  { id: 'f1', name: '米饭', category: '主食', kcal: 232, protein: 5.2, carb: 52, fat: .6, unit: '1碗/200g', cover: 292 },
  { id: 'f2', name: '清汤面条', category: '主食', kcal: 280, protein: 9, carb: 55, fat: 2, unit: '1碗/250g', cover: 312 },
  { id: 'f3', name: '全麦面包', category: '主食', kcal: 75, protein: 4, carb: 13, fat: 1, unit: '1片/30g', cover: 326 },
  { id: 'f4', name: '燕麦片', category: '主食', kcal: 150, protein: 5, carb: 26, fat: 3, unit: '1份/40g', cover: 401 },
  { id: 'f5', name: '蒸红薯', category: '主食', kcal: 172, protein: 2.4, carb: 40, fat: .2, unit: '1个/200g', cover: 431 },
  { id: 'f6', name: '水煮玉米', category: '主食', kcal: 112, protein: 4, carb: 22, fat: 1.2, unit: '1根/200g', cover: 570 },
  { id: 'f7', name: '水煮蛋', category: '肉蛋奶', kcal: 78, protein: 6.5, carb: .6, fat: 5.5, unit: '1个/50g', cover: 580 },
  { id: 'f8', name: '鸡胸肉', category: '肉蛋奶', kcal: 118, protein: 21, carb: 0, fat: 3, unit: '1份/100g', cover: 625 },
  { id: 'f9', name: '瘦牛肉', category: '肉蛋奶', kcal: 125, protein: 20, carb: 2, fat: 4, unit: '1份/100g', cover: 835 },
  { id: 'f10', name: '三文鱼', category: '肉蛋奶', kcal: 139, protein: 19, carb: 0, fat: 6.5, unit: '1份/100g', cover: 1080 },
  { id: 'f11', name: '白灼虾', category: '肉蛋奶', kcal: 87, protein: 18, carb: .5, fat: 1.2, unit: '1份/100g', cover: 292 },
  { id: 'f12', name: '纯牛奶', category: '肉蛋奶', kcal: 135, protein: 8, carb: 10, fat: 7.5, unit: '1盒/250ml', cover: 312 },
  { id: 'f13', name: '无糖酸奶', category: '肉蛋奶', kcal: 90, protein: 9, carb: 7.5, fat: 3, unit: '1杯/150g', cover: 326 },
  { id: 'f14', name: '北豆腐', category: '肉蛋奶', kcal: 120, protein: 12, carb: 4, fat: 7, unit: '1份/150g', cover: 401 },
  { id: 'f15', name: '西兰花', category: '蔬菜', kcal: 68, protein: 5.6, carb: 9, fat: .8, unit: '1份/200g', cover: 431 },
  { id: 'f16', name: '番茄', category: '蔬菜', kcal: 22, protein: 1.1, carb: 4.8, fat: .2, unit: '1个/150g', cover: 570 },
  { id: 'f17', name: '黄瓜', category: '蔬菜', kcal: 32, protein: 1.6, carb: 6, fat: .4, unit: '1根/200g', cover: 580 },
  { id: 'f18', name: '生菜', category: '蔬菜', kcal: 15, protein: 1.4, carb: 2, fat: .2, unit: '1份/100g', cover: 625 },
  { id: 'f19', name: '苹果', category: '水果', kcal: 95, protein: .5, carb: 25, fat: .3, unit: '1个/200g', cover: 835 },
  { id: 'f20', name: '香蕉', category: '水果', kcal: 105, protein: 1.3, carb: 27, fat: .4, unit: '1根/120g', cover: 1080 },
  { id: 'f21', name: '橙子', category: '水果', kcal: 62, protein: 1.2, carb: 15, fat: .2, unit: '1个/150g', cover: 292 },
  { id: 'f22', name: '混合坚果', category: '坚果零食', kcal: 180, protein: 6, carb: 6, fat: 15, unit: '1小把/30g', cover: 312 },
  { id: 'f23', name: '黑巧克力', category: '坚果零食', kcal: 108, protein: 1.2, carb: 9, fat: 7, unit: '2小块/20g', cover: 326 },
  { id: 'f24', name: '黑咖啡', category: '饮品', kcal: 5, protein: 0, carb: 0, fat: 0, unit: '1杯/300ml', cover: 401 },
  { id: 'f25', name: '无糖豆浆', category: '饮品', kcal: 80, protein: 7, carb: 4, fat: 3.5, unit: '1杯/250ml', cover: 431 },
  { id: 'f26', name: '可乐', category: '饮品', kcal: 140, protein: 0, carb: 35, fat: 0, unit: '1罐/330ml', cover: 570 }
];
const MEALS = ['早餐', '午餐', '晚餐', '加餐'];
const MEAL_ICONS = { '早餐': '🌅', '午餐': '☀️', '晚餐': '🌙', '加餐': '🍎' };
const GOALS = ['减脂', '增肌', '塑形', '入门'];
const GOAL_TIPS = {
  '减脂': '热量缺口 300-500 千卡，蛋白质吃够更抗饿',
  '增肌': '热量盈余 300 千卡，训练后及时补充蛋白质',
  '塑形': '温和热量缺口 + 力量训练，线条更紧致',
  '入门': '先养成每周 3 次运动习惯，循序渐进'
};

/* ================= 存储 ================= */
const store = {
  get(k, d) { try { const v = JSON.parse(localStorage.getItem('ql_' + k)); return v === null || v === undefined ? d : v; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('ql_' + k, JSON.stringify(v)); } catch (e) { console.error('[Store] 保存失败', k, e); } }
};
let profile = Object.assign({ nickname: '健身新人', gender: '男', age: 25, goal: '入门', height: 175, weight: 70, targetWeight: 65 }, store.get('profile', {}));
let records = store.get('records', []);
let dietEntries = store.get('dietEntries', []);
let waterMap = store.get('waterMap', {});

const saveProfile = () => store.set('profile', profile);
const saveRecords = () => store.set('records', records);
const saveDiet = () => store.set('dietEntries', dietEntries);
const saveWater = () => store.set('waterMap', waterMap);

/* ================= 训练设置（声音/震动/休息时长/字号） ================= */
const DEFAULT_SETTINGS = { sound: true, vibrate: true, restSec: 30, fs: 'normal' };
let settings = Object.assign({}, DEFAULT_SETTINGS, store.get('settings', {}));
const saveSettings = () => { store.set('settings', settings); applyFontScale(); };
function applyFontScale() { document.documentElement.dataset.fs = settings.fs || 'normal'; }

/* ================= 云同步 ================= */
// API 地址：同源优先（后端托管网页时），否则默认本地后端
let auth = store.get('auth', null); // {token, username, apiBase}
if (!auth || !auth.apiBase) {
  const isLocal = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
  const base = isLocal ? 'http://localhost:3000' : '';
  auth = { token: (auth && auth.token) || '', username: (auth && auth.username) || '', apiBase: base };
  if (auth.token) store.set('auth', auth);
}
async function api(method, path, body, timeoutMs) {
  const ctrl = new AbortController();
  const to = setTimeout(() => ctrl.abort(), timeoutMs || 15000);
  let res;
  try {
    res = await fetch(auth.apiBase + path, {
      method,
      signal: ctrl.signal,
      headers: Object.assign({ 'Content-Type': 'application/json' }, auth.token ? { Authorization: 'Bearer ' + auth.token } : {}),
      body: body ? JSON.stringify(body) : undefined
    });
  } catch (e) {
    if (e.name === 'AbortError') return { ok: false, msg: '请求超时，请检查网络后重试', net: true };
    return { ok: false, msg: '无法连接服务器，请检查网络', net: true };
  } finally {
    clearTimeout(to);
  }
  if (res.status === 401 && auth.token) {
    auth = { token: '', username: '', apiBase: auth.apiBase };
    store.set('auth', auth);
    toast('登录已过期，请重新登录');
    if (typeof showLoginGate === 'function') showLoginGate();
    if (typeof renderMine === 'function') renderMine();
    return { ok: false, msg: '未登录' };
  }
  try { return await res.json(); }
  catch (e) { return { ok: false, msg: '服务器响应异常，请稍后重试', net: true }; }
}
function syncCollect() {
  return { profile, records, dietEntries, waterMap, theme, v: 1 };
}
function syncApply(data) {
  if (!data || typeof data !== 'object') return;
  if (data.profile) { profile = Object.assign(profile, data.profile); saveProfile(); }
  if (Array.isArray(data.records)) { records = data.records; saveRecords(); }
  if (Array.isArray(data.dietEntries)) { dietEntries = data.dietEntries; saveDiet(); }
  if (data.waterMap) { waterMap = data.waterMap; saveWater(); }
  if (data.theme) { theme = data.theme; applyTheme(); }
}
async function cloudUpload() {
  if (!auth.token) { toast('请先登录'); return; }
  const btn = $('#cloudUploadBtn'); if (btn) { btn.disabled = true; btn.textContent = '上传中…'; }
  try {
    const r = await api('PUT', '/api/data', syncCollect());
    if (r.ok) { toast('已上传到云端 ☁️'); renderMine(); }
    else if (!r.ok && r.msg !== '未登录') toast(r.msg || '上传失败');
  } catch (e) { toast('网络连接失败'); }
  finally { if (btn) { btn.disabled = false; btn.textContent = '☁️ 上传到云端'; } }
}
async function cloudDownload() {
  if (!auth.token) { toast('请先登录'); return; }
  const btn = $('#cloudDownloadBtn'); if (btn) { btn.disabled = true; btn.textContent = '恢复中…'; }
  try {
    const r = await api('GET', '/api/data');
    if (r.ok) {
      if (!r.data || Object.keys(r.data).length === 0) { toast('云端暂无数据'); }
      else { syncApply(r.data); renderMine(); toast('已从云端恢复 ✅'); }
    }
  } catch (e) { toast('网络连接失败'); }
  finally { if (btn) { btn.disabled = false; btn.textContent = '⬇️ 从云端恢复'; } }
}
async function doAuth(mode) {
  const u = $('#authUser').value.trim(), p = $('#authPass').value;
  if (!u || !p) { toast('请输入用户名和密码'); return; }
  if (!/^[a-zA-Z0-9_]{3,20}$/.test(u)) { toast('用户名需3-20位字母/数字/下划线'); return; }
  if (p.length < 6) { toast('密码至少6位'); return; }
  const btn = $('#authBtn'); if (btn) { btn.disabled = true; btn.textContent = '请稍候…'; }
  try {
    const r = await api('POST', mode === 'reg' ? '/api/register' : '/api/login', { username: u, password: p });
    if (r.ok) {
      auth = { token: r.token, username: r.username, apiBase: auth.apiBase };
      store.set('auth', auth); toast(mode === 'reg' ? '注册成功 🎉' : '登录成功，' + r.username);
      renderMine();
      if (records.length === 0 && dietEntries.length === 0) cloudDownload();
    } else toast(r.msg || '操作失败');
  } catch (e) { toast('网络连接失败'); }
  finally { if (btn) { btn.disabled = false; btn.textContent = mode === 'reg' ? '注册' : '登录'; } }
}
function doLogout() {
  auth = { token: '', username: '', apiBase: auth.apiBase };
  store.set('auth', auth); toast('已退出登录'); renderMine();
}

/* ================= 主题 ================= */
let theme = store.get('theme', 'auto'); // auto | light | dark
const THEME_LABELS = { auto: '跟随系统', light: '浅色', dark: '深色' };
function systemDark() { return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches; }
function applyTheme() {
  const isDark = theme === 'dark' || (theme === 'auto' && systemDark());
  document.documentElement.dataset.theme = isDark ? 'dark' : 'light';
}
function setTheme(t) {
  theme = t; store.set('theme', t); applyTheme();
  toast(t === 'auto' ? '已切换：跟随系统' : t === 'dark' ? '已切换：深色模式 🌙' : '已切换：浅色模式 ☀️');
}
// 跟随系统变化
if (window.matchMedia) window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { if (theme === 'auto') applyTheme(); });

/* ================= 工具 ================= */
const $ = (sel, el) => (el || document).querySelector(sel);
const $$ = (sel, el) => Array.from((el || document).querySelectorAll(sel));
const pad = n => String(n).padStart(2, '0');
const fmtDate = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const todayStr = () => fmtDate(new Date());
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const cover = n => `https://picsum.photos/id/${n}/300/300`;
const WEEK = ['日', '一', '二', '三', '四', '五', '六'];
const genId = uid;

function greeting() {
  const h = new Date().getHours();
  if (h < 6) return '夜深了，早点休息';
  if (h < 11) return '早上好';
  if (h < 14) return '中午好';
  if (h < 18) return '下午好';
  return '晚上好';
}
function addDays(dateStr, n) {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + n);
  return fmtDate(d);
}
function calcPlan(p) {
  const base = 10 * p.weight + 6.25 * p.height - 5 * p.age;
  const bmr = Math.round(p.gender === '男' ? base + 5 : base - 161);
  const tdee = Math.round(bmr * 1.4);
  let target = Math.round(tdee * .9);
  if (p.goal === '减脂') target = Math.round(tdee * .8);
  else if (p.goal === '增肌') target = tdee + 300;
  else if (p.goal === '塑形') target = Math.round(tdee * .88);
  const pf = (p.goal === '增肌' || p.goal === '减脂') ? 1.8 : p.goal === '塑形' ? 1.5 : 1.2;
  const proteinTarget = Math.round(p.weight * pf);
  const fatTarget = Math.round(target * .25 / 9);
  const carbTarget = Math.max(0, Math.round((target - proteinTarget * 4 - fatTarget * 9) / 4));
  return { bmr, tdee, target, proteinTarget, carbTarget, fatTarget };
}
function sumNutrition(list) {
  return list.reduce((a, e) => ({
    kcal: a.kcal + e.kcal * e.servings,
    protein: a.protein + e.protein * e.servings,
    carb: a.carb + e.carb * e.servings,
    fat: a.fat + e.fat * e.servings
  }), { kcal: 0, protein: 0, carb: 0, fat: 0 });
}
function bmiInfo() {
  const v = profile.weight / Math.pow(profile.height / 100, 2);
  const x = Math.round(v * 10) / 10;
  let s = '正常', c = '#00b578';
  if (x < 18.5) { s = '偏瘦'; c = '#165dff'; }
  else if (x >= 24) { s = '偏重'; c = '#ff7d00'; }
  else if (x >= 28) { s = '肥胖'; c = '#f53f3f'; }
  return { v: x, status: s, color: c };
}
function streakDays() {
  const days = new Set(records.map(r => r.date));
  let n = 0;
  let cur = todayStr();
  if (!days.has(cur)) cur = addDays(cur, -1);
  while (days.has(cur)) { n++; cur = addDays(cur, -1); }
  return n;
}
function ring(percent, color, track) {
  const r = 34, c = 2 * Math.PI * r;
  const pct = Math.min(100, Math.max(0, percent || 0));
  return `<svg viewBox="0 0 80 80" width="88" height="88">
    <circle cx="40" cy="40" r="${r}" fill="none" stroke="${track}" stroke-width="8"/>
    <circle cx="40" cy="40" r="${r}" fill="none" stroke="${color}" stroke-width="8" stroke-linecap="round"
      stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - pct / 100)}"/>
  </svg>`;
}
let toastTimer;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 1800);
}
function goalTag(goal) {
  const map = { '减脂': 'tag-fat', '增肌': 'tag-muscle', '塑形': 'tag-shape', '入门': 'tag-begin' };
  return `<span class="tag ${map[goal] || 'tag-begin'}">${esc(goal)}</span>`;
}

/* ================= 路由 ================= */
const TABS = ['home', 'plan', 'diet', 'stats', 'mine'];
let currentTab = 'home';

function showTab(tab) {
  currentTab = tab;
  $$('#tabbar a').forEach(a => a.classList.toggle('active', a.dataset.tab === tab));
  ({ home: renderHome, plan: renderPlan, diet: renderDiet, stats: renderStats, mine: renderMine })[tab]();
  window.scrollTo(0, 0);
}
function closeSubpages() { $$('.subpage').forEach(p => p.classList.remove('show')); }

/* ================= 首页 ================= */
function renderHome() {
  const weekKcal = records.filter(r => r.date >= addDays(todayStr(), -6)).reduce((s, r) => s + r.kcal, 0);
  const weekCount = records.filter(r => r.date >= addDays(todayStr(), -6)).length;
  const plan = calcPlan(profile);
  const pct = Math.min(100, Math.round(weekKcal / (plan.target * 0.2 || 1) * 100));
  $('#app').innerHTML = `
    <div class="page-head">
      <h1>${greeting()}，${esc(profile.nickname)}</h1>
      <p>今天是 ${todayStr()} · 周${WEEK[new Date().getDay()]} · 距离周末还有${5 - (new Date().getDay() % 7) > 0 ? 5 - (new Date().getDay() % 7) : 0}天</p>
    </div>
    <div class="hero">
      <div>
        <div class="label">本周已消耗</div>
        <div class="big">${weekKcal}<small> 千卡</small></div>
        <div class="label" style="margin-top:4px">目标 ${esc(profile.goal)} · ${GOAL_TIPS[profile.goal] || ''}</div>
      </div>
      <div class="ring-wrap">${ring(pct, '#ffffff', 'rgba(255,255,255,.28)')}
        <div class="rtext"><b>${pct}%</b><i>周目标</i></div>
      </div>
    </div>
    <div class="grid-stats">
      <div class="gs"><b>${weekCount}</b><span>本周训练</span></div>
      <div class="gs"><b>${records.reduce((s, r) => s + r.minutes, 0)}</b><span>总分钟</span></div>
      <div class="gs"><b>${records.length}</b><span>总次数</span></div>
      <div class="gs"><b>${records.reduce((s, r) => s + r.kcal, 0)}</b><span>总千卡</span></div>
    </div>
    <div class="section-title"><h2>今日训练</h2><a data-nav="plan">课表 ›</a></div>
    ${PlanModule.todayCard()}
    <div class="section-title"><h2>快捷入口</h2></div>
    <div class="quick q5">
      <div class="q" data-lib><i>📚</i>动作库</div>
      <div class="q" data-nav="plan"><i>💪</i>开始训练</div>
      <div class="q" data-nav="diet"><i>🥗</i>饮食记录</div>
      <div class="q" data-nav="stats"><i>📊</i>数据统计</div>
      <div class="q" data-nav="mine"><i>👤</i>个人中心</div>
    </div>
    <div class="section-title"><h2>热门计划</h2><a data-nav="plan">全部 ›</a></div>
    ${PlanModule.plans.slice(0, 3).map(PlanModule.planCardHTML).join('')}
    <div class="tips"><span>💡</span><p>${esc(GOAL_TIPS[profile.goal])}。健身贵在坚持，微小的习惯长期复利。</p></div>
  `;
  bindPlanCards();
}
function recommendPlan() {
  const pool = PLANS.filter(p => p.goal === profile.goal);
  const pick = (pool.length ? pool : PLANS)[new Date().getDate() % (pool.length || PLANS.length)];
  return planCard(pick);
}
function planCard(p) {
  return `<div class="plan-card" data-plan="${p.id}">
    <div class="info">
      <b>${esc(p.title)}</b>
      ${goalTag(p.goal)}
      <div class="meta">${p.duration} 分钟 · ${p.kcal} 千卡 · ${p.level}</div>
    </div>
    <button class="go">开练</button>
  </div>`;
}
function bindPlanCards() {
  $$('#app .plan-card').forEach(el => el.addEventListener('click', () => openWorkout(el.dataset.plan)));
  $$('#app [data-nav]').forEach(el => el.addEventListener('click', () => showTab(el.dataset.nav)));
  $$('#app [data-lib]').forEach(el => el.addEventListener('click', openLibrary));
}

/* ================= 计划页 ================= */
let planFilter = '全部';
function renderPlan() {
  PlanModule.renderList();
}

/* ================= 训练页（子页） =================
   设计要点：
   1) 时间戳计时——真值来自 Date.now()，锁屏/切后台/刷新都不丢秒；
   2) 会话持久化到 localStorage——刷新自动恢复当前组；
   3) Wake Lock 屏幕常亮 + SW 通知兜底休息结束；
   4) Web Audio 合成提示音（零音频文件、可离线）+ 震动反馈；
   5) 底部固定超大「完成」按钮，汗手一键点按。
   session: { date, planId, done:[i], running, runStart, elapsed, restEnd, restLen, beeped } */
let workout = null;
let workoutSub = null;
let workoutIv = null;

function fmtSec(s) { s = Math.max(0, s | 0); return `${pad(Math.floor(s / 60))}:${pad(s % 60)}`; }
function persistSession() { if (workout) store.set('session', workout); }
function clearSession() { store.set('session', null); }
function currentElapsed() {
  if (!workout) return 0;
  return workout.elapsed + (workout.running ? Date.now() - workout.runStart : 0);
}

/* ---- 提示音（Web Audio 合成） ---- */
let audioCtx = null;
function unlockAudio() {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
  } catch (e) {}
}
function beep(freq = 880, dur = 0.18, type = 'sine', vol = 0.32) {
  if (!settings.sound) return;
  try {
    unlockAudio();
    const t0 = audioCtx.currentTime;
    const o = audioCtx.createOscillator(), g = audioCtx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(vol, t0);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    o.connect(g); g.connect(audioCtx.destination);
    o.start(t0); o.stop(t0 + dur);
  } catch (e) {}
}
function haptic(p) {
  if (settings.vibrate && 'vibrate' in navigator) { try { navigator.vibrate(p); } catch (e) {} }
}

/* ---- 屏幕常亮（Wake Lock API） ---- */
let wakeLock = null;
async function acquireWake() {
  try {
    if ('wakeLock' in navigator && !wakeLock) {
      wakeLock = await navigator.wakeLock.request('screen');
      wakeLock.addEventListener('release', () => { wakeLock = null; });
    }
  } catch (e) {}
}
function releaseWake() { try { if (wakeLock) wakeLock.release(); } catch (e) {} wakeLock = null; }
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && workout && workout.running) acquireWake();
});

/* ---- 通知权限 + SW 兜底：锁屏也能提醒休息结束 ---- */
function askNotify() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission().catch(() => {});
  }
}
function scheduleRestNotification(restLen) {
  try {
    if ('Notification' in window && Notification.permission === 'granted' && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'rest-end', at: Date.now() + restLen * 1000 });
    }
  } catch (e) {}
}

function openWorkout(planId, saved) {
  const p = PLANS.find(x => x.id === planId);
  if (!p) return;
  workout = saved || {
    date: todayStr(), planId, done: [], running: false,
    runStart: 0, elapsed: 0, restEnd: 0, restLen: settings.restSec, beeped: {}
  };
  workout.planId = planId;
  const sub = document.createElement('div');
  sub.className = 'subpage workout-page';
  sub.innerHTML = `
    <div class="sp-head">
      <button class="icon-btn back" id="wkBack" aria-label="返回（保留进度）">‹</button>
      <b>${esc(p.title)}</b>
      <button class="icon-btn wk-quit" id="wkQuit" aria-label="放弃训练">放弃</button>
    </div>
    <div class="sp-body wk-body">
      <div class="wk-main">
        <div class="card timer-card">
          <div class="tc-label">训练计时</div>
          <div class="tc-num" id="tcNum">00:00</div>
          <div class="tc-btns">
            <button class="btn big" id="tcToggle">▶ 开始</button>
            <button class="btn ghost icon-round" id="tcReset" aria-label="重置计时">↻</button>
          </div>
          <div class="wk-hint muted">训练中屏幕保持常亮 · 锁屏计时不中断</div>
        </div>
        <div class="card rest-card" id="restCard" hidden>
          <div class="tc-label">😮‍💨 组间休息</div>
          <div class="rest-num" id="restNum">00</div>
          <button class="btn ghost full" id="restSkip">跳过休息，继续练</button>
        </div>
      </div>
      <div class="wk-list">
        <div class="card">
          <h3>动作清单 <span class="muted" id="exCount">0/${p.exercises.length}</span></h3>
          <div class="progress-mini"><i id="exBar" style="width:0%"></i></div>
          <div class="ex-list" style="margin-top:10px">
            ${p.exercises.map((n, i) => {
              const ex = EXERCISES.find(e => e.name === n) || { minutes: 4, kcal: 30 };
              const thumb = thumbFor(n);
              return `<button type="button" class="ex-row ${workout.done.includes(i) ? 'done' : ''}" data-i="${i}">
                ${thumb ? `<span class="ex-thumb"><img loading="lazy" src="${thumb}" alt=""></span>` : ''}
                <span class="ex-idx">${i + 1}</span>
                <span class="ex-info"><span class="exn">${esc(n)}</span><span class="exm">${ex.minutes}分钟 · ${ex.kcal}千卡</span></span>
                <span class="ex-state"></span>
              </button>`;
            }).join('')}
          </div>
        </div>
      </div>
    </div>
    <div class="wk-foot">
      <div class="wk-next" id="wkNext"></div>
      <button class="btn mega" id="wkMega">✓ 完成第 1 个动作</button>
    </div>`;
  document.body.appendChild(sub);
  requestAnimationFrame(() => sub.classList.add('show'));
  workoutSub = sub;

  /* 开始 / 暂停 */
  $('#tcToggle', sub).addEventListener('click', () => {
    unlockAudio(); askNotify();
    if (workout.running) {
      workout.elapsed += Date.now() - workout.runStart;
      workout.running = false;
      $('#tcToggle', sub).innerHTML = '▶ 继续';
      releaseWake();
    } else {
      workout.running = true;
      workout.runStart = Date.now();
      $('#tcToggle', sub).innerHTML = '⏸ 暂停';
      acquireWake();
    }
    persistSession(); renderTick();
  });
  $('#tcReset', sub).addEventListener('click', () => {
    workout.elapsed = 0;
    if (workout.running) workout.runStart = Date.now();
    persistSession(); renderTick();
  });
  $('#restSkip', sub).addEventListener('click', () => { workout.restEnd = 0; persistSession(); renderTick(); });
  $$('.ex-row', sub).forEach(el => el.addEventListener('click', () => toggleDone(+el.dataset.i)));
  /* 底部超大主按钮：一键完成当前动作；全部完成后变保存 */
  $('#wkMega', sub).addEventListener('click', () => {
    unlockAudio(); askNotify();
    const next = nextUndone();
    if (next === null) { saveWorkout(); return; }
    if (!workout.running) {
      workout.running = true; workout.runStart = Date.now();
      $('#tcToggle', sub).innerHTML = '⏸ 暂停';
      acquireWake();
    }
    completeOne(next);
  });
  $('#wkBack', sub).addEventListener('click', () => { persistSession(); exitWorkout(); toast('进度已保留，刷新可恢复'); });
  $('#wkQuit', sub).addEventListener('click', () => {
    if (confirm('确定放弃本次训练？当前进度将被清除')) {
      exitWorkout(); clearSession(); toast('训练已放弃');
    }
  });

  clearInterval(workoutIv);
  workoutIv = setInterval(renderTick, 250);
  renderTick(); updateProgress(); updateMega();
  persistSession();
  if (saved && (saved.elapsed > 0 || saved.done.length)) toast('已恢复上次训练 💪');
}

/* 主循环：更新计时显示 + 休息倒计时（真值全部来自时间戳） */
function renderTick() {
  if (!workout || !workoutSub) return;
  const sub = workoutSub;
  $('#tcNum', sub).textContent = fmtSec(currentElapsed() / 1000);
  const restCard = $('#restCard', sub);
  if (workout.restEnd) {
    const left = Math.ceil((workout.restEnd - Date.now()) / 1000);
    if (left > 0) {
      restCard.hidden = false;
      $('#restNum', sub).textContent = pad(left);
      if (left <= 3 && !workout.beeped[left]) {
        workout.beeped[left] = true;
        beep(880, .12);
        haptic(150);
      }
    } else {
      restCard.hidden = true;
      workout.restEnd = 0;
      beep(1175, .55, 'sine', .4);              /* 结束长“滴” */
      haptic([300, 100, 300]);
    }
  } else {
    restCard.hidden = true;
  }
  persistSession();
}

function completeOne(i) {
  if (!workout.done.includes(i)) workout.done.push(i);
  const row = $(`.ex-row[data-i="${i}"]`, workoutSub);
  if (row) row.classList.add('done');
  beep(660, .12); haptic(60);
  /* 自动开始组间休息倒计时 */
  workout.restLen = settings.restSec;
  workout.restEnd = Date.now() + settings.restSec * 1000;
  workout.beeped = {};
  scheduleRestNotification(settings.restSec);
  updateProgress(); updateMega(); persistSession();
}
function toggleDone(i) {
  const row = $(`.ex-row[data-i="${i}"]`, workoutSub);
  if (workout.done.includes(i)) {
    workout.done = workout.done.filter(x => x !== i);
    if (row) row.classList.remove('done');
  } else {
    completeOne(i);
  }
  updateProgress(); updateMega(); persistSession();
}
function nextUndone() {
  const n = PLANS.find(x => x.id === workout.planId).exercises.length;
  for (let i = 0; i < n; i++) if (!workout.done.includes(i)) return i;
  return null;
}
function updateProgress() {
  if (!workoutSub) return;
  const p = PLANS.find(x => x.id === workout.planId);
  const ratio = workout.done.length / p.exercises.length;
  $('#exCount', workoutSub).textContent = `${workout.done.length}/${p.exercises.length}`;
  $('#exBar', workoutSub).style.width = ratio * 100 + '%';
}
function updateMega() {
  const btn = $('#wkMega', workoutSub);
  if (!btn) return;
  const next = nextUndone();
  if (next === null) {
    btn.textContent = '💾 保存训练记录'; btn.classList.add('finish');
  } else {
    btn.textContent = `✓ 完成第 ${next + 1} 个动作`; btn.classList.remove('finish');
  }
  const p = PLANS.find(x => x.id === workout.planId);
  const nextEl = $('#wkNext', workoutSub);
  if (nextEl) {
    if (next === null) nextEl.textContent = `🎉 全部 ${p.exercises.length} 个动作已完成`;
    else nextEl.textContent = `下一个 · ${p.exercises[next]}`;
  }
}
function saveWorkout() {
  const p = PLANS.find(x => x.id === workout.planId);
  const elapsedSec = Math.floor(currentElapsed() / 1000);
  if (workout.done.length === 0 && elapsedSec === 0) { toast('先完成至少一个动作吧'); return; }
  const ratio = Math.max(workout.done.length / p.exercises.length, elapsedSec / 60 / p.duration);
  const minutes = Math.max(1, Math.round(Math.max(elapsedSec / 60, p.duration * (workout.done.length / p.exercises.length))));
  const kcal = Math.max(5, Math.round(p.kcal * ratio));
  records.unshift({ id: genId(), planTitle: p.title, date: todayStr(), minutes, kcal, doneCount: workout.done.length, total: p.exercises.length });
  saveRecords();
  exitWorkout();
  clearSession();
  toast(`已记录：${minutes} 分钟 · ${kcal} 千卡 🔥`);
  showTab('stats');
}
function exitWorkout() {
  clearInterval(workoutIv); workoutIv = null;
  releaseWake();
  if (workoutSub) {
    const el = workoutSub;
    el.classList.remove('show');
    setTimeout(() => el.remove(), 220);
    workoutSub = null;
  }
}

/* ================= 动作库 ================= */
const MEDIA_BASE = 'https://cdn.jsdelivr.net.cn/gh/hasaneyldrm/exercises-dataset@main/';

const EQUIP_SVG = {
  bar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M2 12h2"/><path d="M20 12h2"/><path d="M6 8v8"/><path d="M18 8v8"/><path d="M6 12h12"/></svg>',
  dumb: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6.5 9.5v5"/><path d="M17.5 9.5v5"/><path d="M6 8v8"/><path d="M18 8v8"/><path d="M7 12h10"/></svg>',
  cable: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="4" y="3" width="16" height="5" rx="1"/><path d="M12 8v4"/><circle cx="12" cy="15" r="3"/></svg>',
  kb: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 7a3 3 0 1 1 6 0"/><path d="M6.5 20c0-4 2.5-7 5.5-7s5.5 3 5.5 7"/></svg>',
  bw: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="5" r="2"/><path d="M12 8v6"/><path d="M7 11l5 2 5-2"/><path d="M9 20l3-6 3 6"/></svg>',
  rope: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6c2-3 4 3 6 0s4 3 6 0 4 3 6 0"/></svg>'
};

let libData = null;
let libFilter = '全部';
let libQuery = '';
let libIo = null;
const LIB_GROUPS = ['全部', '臀腿', '胸背', '肩臂', '核心'];

async function loadLib() {
  if (libData) return libData;
  const res = await fetch('exercises-lib.json');
  if (!res.ok) throw new Error('lib fetch failed');
  libData = await res.json();
  return libData;
}

function closeSub(sub) {
  sub.classList.remove('show');
  setTimeout(() => sub.remove(), 220);
}

function ensureLibIo() {
  if (libIo) return libIo;
  libIo = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      const img = en.target;
      if (en.isIntersecting) {
        if (img.dataset.state !== 'gif') { img.src = MEDIA_BASE + img.dataset.gif; img.dataset.state = 'gif'; }
      } else if (img.dataset.state === 'gif') {
        img.src = MEDIA_BASE + img.dataset.jpg; img.dataset.state = 'jpg';
      }
    });
  }, { rootMargin: '120px' });
  return libIo;
}

function libCard(x) {
  return `<button type="button" class="lib-card" data-id="${x.id}">
    <span class="lc-media">
      <img class="lc-img" alt="${esc(x.n)}" data-gif="${esc(x.gif)}" data-jpg="${esc(x.img)}" data-state="jpg" loading="lazy" src="${MEDIA_BASE}${esc(x.img)}">
    </span>
    <span class="lc-body">
      <span class="lc-name">${esc(x.n)}</span>
      <span class="lc-tags">
        <span class="lc-pill p">${esc(x.t)}</span>
        <span class="lc-pill e">${EQUIP_SVG[x.k] || ''}${esc(x.e)}</span>
      </span>
    </span>
  </button>`;
}

function openLibrary() {
  const sub = document.createElement('div');
  sub.className = 'subpage lib-page';
  sub.innerHTML = `
    <div class="sp-head">
      <button class="icon-btn back" aria-label="返回">‹</button>
      <b>动作库</b>
      <span class="sp-side"></span>
    </div>
    <div class="sp-body">
      <input class="lib-search" id="libSearch" placeholder="搜索动作，如：深蹲、卧推、硬拉" type="search">
      <div class="chips">${LIB_GROUPS.map(g => `<span class="chip ${libFilter === g ? 'active' : ''}" data-g="${g}">${g}</span>`).join('')}</div>
      <div class="lib-grid" id="libGrid"><div class="lib-loading">正在加载动作…</div></div>
    </div>`;
  document.body.appendChild(sub);
  requestAnimationFrame(() => sub.classList.add('show'));
  $('.back', sub).addEventListener('click', () => closeSub(sub));
  $('#libSearch', sub).addEventListener('input', (e) => { libQuery = e.target.value.trim().toLowerCase(); renderLibGrid(sub); });
  $$('.chip', sub).forEach(c => c.addEventListener('click', () => {
    libFilter = c.dataset.g;
    $$('.chip', sub).forEach(x => x.classList.toggle('active', x === c));
    renderLibGrid(sub);
  }));
  loadLib()
    .then(() => renderLibGrid(sub))
    .catch(() => { $('#libGrid', sub).innerHTML = '<div class="lib-loading">加载失败，请检查网络后重试</div>'; });
}

function renderLibGrid(sub) {
  const grid = $('#libGrid', sub);
  if (!libData) return;
  const list = libData.filter(x =>
    (libFilter === '全部' || x.g === libFilter) &&
    (!libQuery || x.n.toLowerCase().includes(libQuery) || x.t.toLowerCase().includes(libQuery)));
  if (!list.length) {
    grid.innerHTML = '<div class="lib-empty">🔍 没有找到相关动作<br><span>换个关键词或筛选条件试试</span></div>';
    return;
  }
  grid.innerHTML = list.map(libCard).join('');
  $$('.lc-img', grid).forEach(img => ensureLibIo().observe(img));
  $$('.lib-card', grid).forEach(card => card.addEventListener('click', () => openLibDetail(card.dataset.id)));
}

function openLibDetail(id) {
  const x = libData.find(e => e.id === id);
  if (!x) return;
  const sec = x.s || [];
  const sub = document.createElement('div');
  sub.className = 'subpage lib-detail';
  sub.innerHTML = `
    <div class="sp-head">
      <button class="icon-btn back" aria-label="返回">‹</button>
      <b>${esc(x.n)}</b>
      <span class="sp-side"></span>
    </div>
    <div class="ld-media"><img alt="${esc(x.n)}" src="${MEDIA_BASE}${esc(x.gif)}"></div>
    <div class="ld-body">
      <div class="ld-sec">
        <div class="ld-label">🎯 主要部位</div>
        <div class="ld-pills">
          <span class="lc-pill p">${esc(x.t)}</span>
          ${x.m && x.m !== x.t ? `<span class="lc-pill p">${esc(x.m)}</span>` : ''}
        </div>
      </div>
      ${sec.length ? `<div class="ld-sec">
        <div class="ld-label">🫶 辅助肌群</div>
        <div class="ld-pills">${[...new Set(sec)].map(m => `<span class="lc-pill s">${esc(m)}</span>`).join('')}</div>
      </div>` : ''}
      <div class="ld-sec">
        <div class="ld-pills"><span class="lc-pill e">${EQUIP_SVG[x.k] || ''}${esc(x.e)}</span></div>
      </div>
      <div class="ld-sec">
        <div class="ld-label">📝 动作说明</div>
        <ol class="ld-steps clamped" id="ldSteps">${(x.steps || []).map(s => `<li>${esc(s)}</li>`).join('')}</ol>
        <button class="ld-more" hidden id="ldMore" type="button">展开全部</button>
      </div>
    </div>`;
  document.body.appendChild(sub);
  requestAnimationFrame(() => sub.classList.add('show'));
  $('.back', sub).addEventListener('click', () => closeSub(sub));
  const stepsEl = $('#ldSteps', sub);
  const more = $('#ldMore', sub);
  const check = () => {
    const over = stepsEl.scrollHeight - stepsEl.clientHeight > 4;
    more.hidden = !(over || more.dataset.open);
  };
  more.addEventListener('click', () => {
    if (more.dataset.open) {
      stepsEl.classList.add('clamped');
      more.textContent = '展开全部';
      delete more.dataset.open;
    } else {
      stepsEl.classList.remove('clamped');
      more.textContent = '收起';
      more.dataset.open = '1';
    }
    check();
  });
  setTimeout(check, 400);
}

/* 训练页动作缩略图：按名称关键词映射到动作库图片 */
const EX_THUMB = {
  深蹲: '0043-qXTaZnJ', 俯卧撑: '0662-I4hDWkc', 平板: '0464-CosupLu',
  卷腹: '0443-jvp6DiD', 仰卧起坐: '0507-mbkgB44', 波比: '1160-dK9394r',
  弓步: '0336-RRWFUcw', 箭步: '0336-RRWFUcw', 臀桥: '1409-qKBpF7I',
  登山: '0630-RJgzwny', 高抬腿: '3636-ealLwvX', 俄罗斯转体: '0687-XVDdcoj',
  侧平板: '1775-VO2qeJg', 引体: '0652-lBDjFxJ', 跳绳: '2612-e1e76I2',
  开合跳: '3224-1g5bPpA', 壶铃: '0549-UHJlbu3', 提踵: '1372-8ozhUIZ'
};
function thumbFor(name) {
  for (const k of Object.keys(EX_THUMB)) if (name.includes(k)) return MEDIA_BASE + 'images/' + EX_THUMB[k] + '.jpg';
  return null;
}

/* ================= 饮食页 ================= */
function renderDiet() {
  const today = todayStr();
  const list = dietEntries.filter(e => e.date === today);
  const nutri = sumNutrition(list);
  const plan = calcPlan(profile);
  const workoutKcal = records.filter(r => r.date === today).reduce((s, r) => s + r.kcal, 0);
  const budget = plan.target + workoutKcal;
  const remaining = Math.round(budget - nutri.kcal);
  const cups = waterMap[today] || 0;
  const byMeal = m => list.filter(e => e.meal === m);

  $('#app').innerHTML = `
    <div class="page-head"><h1>饮食控制</h1><p>吃动平衡 · 记录每日热量与营养</p></div>
    <div class="hero">
      <div>
        <div class="label">今日已摄入</div>
        <div class="big">${Math.round(nutri.kcal)}<small> 千卡</small></div>
        <div class="label" style="margin-top:4px">基础目标 ${plan.target} 千卡</div>
      </div>
      <div class="ring-wrap">${ring(nutri.kcal / Math.max(budget, 1) * 100, '#ffffff', 'rgba(255,255,255,.28)')}
        <div class="rtext"><b>${Math.min(999, Math.round(nutri.kcal / Math.max(budget, 1) * 100))}%</b><i>热量进度</i></div>
      </div>
    </div>
    <div class="card" style="display:flex;align-items:center;gap:8px">
      <span>⚖️</span>
      <span style="flex:1;font-size:13px;color:var(--text-2)">${remaining >= 0 ? '今日还可摄入' : '已超出目标'}</span>
      <b style="color:${remaining >= 0 ? 'var(--primary)' : 'var(--accent)'}">${Math.abs(remaining)} 千卡</b>
    </div>
    ${workoutKcal > 0 ? `<p class="muted" style="margin:8px 2px 0">今日运动消耗 ${workoutKcal} 千卡，已计入可摄入额度</p>` : ''}
    <div class="card">
      <h3>营养素概览</h3>
      ${[['蛋白质', nutri.protein, plan.proteinTarget, ''], ['碳水化合物', nutri.carb, plan.carbTarget, 'c-blue'], ['脂肪', nutri.fat, plan.fatTarget, 'c-orange']].map(([n, v, t, cls]) => `
        <div class="nutri-row">
          <div class="nh"><span>${n}</span><span class="v">${Math.round(v)} <em>/ ${t} g</em></span></div>
          <div class="bar ${cls}"><i style="width:${Math.min(100, v / Math.max(t, 1) * 100)}%"></i></div>
        </div>`).join('')}
    </div>
    <div class="card">
      ${MEALS.map(m => {
        const ml = byMeal(m);
        const mk = ml.reduce((s, e) => s + e.kcal * e.servings, 0);
        return `<div class="meal">
          <div class="mh"><span>${MEAL_ICONS[m]}</span><b>${m}</b>
            ${mk > 0 ? `<span class="mk">${mk} 千卡</span>` : ''}
            <span class="plus" data-meal="${m}">＋</span>
          </div>
          ${ml.length ? ml.map(e => `
            <div class="entry"><span class="dot"></span>
              <span class="en">${esc(e.foodName)} ×${e.servings}</span>
              <span class="ek">${Math.round(e.kcal * e.servings)} 千卡</span>
              <span class="del" data-del="${e.id}">删除</span>
            </div>`).join('') : `<p class="muted" style="padding:6px 0 0 4px">点击 ＋ 记录${m}</p>`}
        </div>`;
      }).join('')}
    </div>
    <div class="card">
      <h3>每日饮水（目标 8 杯）</h3>
      <div class="water-cups">${Array.from({ length: 8 }, (_, i) => `<span class="${i < cups ? 'on' : ''}" data-cup="${i}">💧</span>`).join('')}</div>
      <p class="muted" style="text-align:center">已喝 ${cups}/8 杯 · 少量多次更健康</p>
    </div>
    <div class="tips"><span>🥗</span><p>每餐一拳主食、一掌优质蛋白、两拳蔬菜；减脂期缺口 300-500 千卡更可持续。</p></div>
  `;
  $$('#app .plus').forEach(el => el.addEventListener('click', () => openDietAdd(el.dataset.meal)));
  $$('#app .del').forEach(el => el.addEventListener('click', () => {
    dietEntries = dietEntries.filter(e => e.id !== el.dataset.del);
    saveDiet(); renderDiet(); toast('已移除');
  }));
  $$('#app .water-cups span').forEach(el => el.addEventListener('click', () => {
    const i = +el.dataset.cup;
    waterMap[today] = cups === i + 1 ? i : i + 1;
    saveWater(); renderDiet();
  }));
}
let dietFilter = '全部', dietKeyword = '';
function openDietAdd(meal) {
  const sub = document.createElement('div');
  sub.className = 'subpage';
  let added = 0;
  const servings = {};
  const drawList = () => {
    const kw = dietKeyword.trim();
    const list = FOODS.filter(f => (dietFilter === '全部' || f.category === dietFilter) && (!kw || f.name.includes(kw)));
    $('#faList', sub).innerHTML = list.length ? list.map(f => {
      const s = servings[f.id] || 1;
      return `<div class="food-item">
        <img src="${cover(f.cover)}" alt="" loading="lazy" onerror="this.style.visibility='hidden'"/>
        <div class="fi"><b>${esc(f.name)}</b><span>${esc(f.unit)}</span><span style="color:var(--accent)">${f.kcal}千卡/份</span></div>
        <div class="stepper">
          <button class="minus" data-id="${f.id}" data-d="-1">−</button><b>${s}</b><button data-id="${f.id}" data-d="1">＋</button>
        </div>
        <button class="add-btn" data-add="${f.id}">添加</button>
      </div>`;
    }).join('') : '<div class="empty"><i>🍽️</i>没有找到相关食物</div>';
    $$('.stepper button', sub).forEach(b => b.addEventListener('click', () => {
      const id = b.dataset.id;
      servings[id] = Math.max(1, Math.min(9, (servings[id] || 1) + (+b.dataset.d)));
      drawList();
    }));
    $$('[data-add]', sub).forEach(b => b.addEventListener('click', () => {
      const f = FOODS.find(x => x.id === b.dataset.add);
      dietEntries.push({
        id: genId(), date: todayStr(), meal, foodId: f.id, foodName: f.name,
        servings: servings[f.id] || 1, kcal: f.kcal, protein: f.protein, carb: f.carb, fat: f.fat
      });
      saveDiet(); added++; toast(`已添加到${meal}`);
    }));
  };
  sub.innerHTML = `
    <div class="sp-head"><span class="back">‹</span><b>添加食物 · ${meal}</b></div>
    <div class="sp-body">
      <div class="search">🔍<input id="faSearch" placeholder="搜索食物名称" /></div>
      <div class="chips">${['全部', '主食', '肉蛋奶', '蔬菜', '水果', '坚果零食', '饮品'].map(c => `<span class="chip ${dietFilter === c ? 'active' : ''}" data-c="${c}">${c}</span>`).join('')}</div>
      <div id="faList" style="margin-top:8px"></div>
    </div>
    <div style="position:sticky;bottom:0;background:rgba(255,255,255,.97);padding:12px 16px calc(12px + env(safe-area-inset-bottom));border-top:1px solid var(--border)">
      <button class="btn full" id="faDone">完成${added ? `（已加 ${added} 项）` : ''}</button>
    </div>`;
  document.body.appendChild(sub);
  sub.classList.add('show');
  drawList();
  $('#faSearch', sub).addEventListener('input', e => { dietKeyword = e.target.value; drawList(); });
  $$('.chip', sub).forEach(c => c.addEventListener('click', () => { dietFilter = c.dataset.c; $$('.chip', sub).forEach(x => x.classList.toggle('active', x === c)); drawList(); }));
  $('#faDone', sub).addEventListener('click', () => { sub.remove(); closeSubpages(); showTab('diet'); });
  $('.back', sub).addEventListener('click', () => { sub.remove(); showTab('diet'); });
}

/* ================= 数据页 ================= */
function renderStats() {
  const today = todayStr();
  const week = Array.from({ length: 7 }, (_, i) => addDays(today, i - 6));
  const weekData = week.map(d => ({ d, kcal: records.filter(r => r.date === d).reduce((s, r) => s + r.kcal, 0) }));
  const maxK = Math.max(...weekData.map(x => x.kcal), 1);
  const streak = streakDays();
  // 当月日历
  const now = new Date();
  const y = now.getFullYear(), m = now.getMonth();
  const first = new Date(y, m, 1).getDay();
  const daysIn = new Date(y, m + 1, 0).getDate();
  const hasRec = new Set(records.map(r => r.date));
  let cal = ['日', '一', '二', '三', '四', '五', '六'].map(w => `<span class="wd">${w}</span>`).join('');
  for (let i = 0; i < first; i++) cal += '<span class="d"></span>';
  for (let d = 1; d <= daysIn; d++) {
    const ds = `${y}-${pad(m + 1)}-${pad(d)}`;
    cal += `<span class="d ${ds === today ? 'today' : ''} ${hasRec.has(ds) ? 'has' : ''}">${d}</span>`;
  }
  const recent = records.slice(0, 10);
  $('#app').innerHTML = `
    <div class="page-head"><h1>训练数据</h1><p>坚持是最大的天赋 · 已记录 ${records.length} 次训练</p></div>
    <div class="grid-stats">
      <div class="gs"><b>${records.length}</b><span>总次数</span></div>
      <div class="gs"><b>${records.reduce((s, r) => s + r.minutes, 0)}</b><span>总分钟</span></div>
      <div class="gs"><b>${records.reduce((s, r) => s + r.kcal, 0)}</b><span>总千卡</span></div>
    </div>
    <div class="streak-row" style="margin-top:12px">
      <div class="st"><b>${streak}</b><span>连续打卡（天）</span></div>
      <div class="st"><b>${records.filter(r => r.date === today).length}</b><span>今日训练</span></div>
    </div>
    <div class="card"><h3>近 7 天耗能</h3>
      <div class="chart">${weekData.map(x => `
        <div class="col"><i style="height:${Math.round(x.kcal / maxK * 88)}%" title="${x.kcal}"></i><em>${x.d.slice(5).replace('-', '/')}</em></div>`).join('')}
      </div>
    </div>
    <div class="card"><h3>${y} 年 ${m + 1} 月</h3><div class="cal">${cal}</div></div>
    <div class="card"><h3>最近记录</h3>
      ${recent.length ? recent.map(r => `
        <div class="rec">
          <div class="ri"><b>${esc(r.planTitle)}</b><span>${r.date} · ${r.minutes} 分钟 · ${r.doneCount}/${r.total} 动作</span></div>
          <b style="color:var(--accent);font-size:13px">${r.kcal} 千卡</b>
          <span class="del" data-del="${r.id}">删除</span>
        </div>`).join('') : '<div class="empty"><i>📝</i>还没有训练记录，去开始第一次训练吧</div>'}
    </div>
  `;
  $$('#app .rec .del').forEach(el => el.addEventListener('click', () => {
    records = records.filter(r => r.id !== el.dataset.del);
    saveRecords(); renderStats(); toast('已删除');
  }));
}

/* ================= 我的页 ================= */
function editField(label, key, type) {
  const v = prompt(`请输入${label}`, profile[key]);
  if (v === null) return;
  const num = parseFloat(v);
  if (type === 'num' && (isNaN(num) || num <= 0)) { toast('请输入有效数字'); return; }
  profile[key] = type === 'num' ? num : String(v).slice(0, 12);
  saveProfile(); renderMine(); toast('已保存');
}
function renderMine() {
  const bmi = bmiInfo();
  const totalK = records.reduce((s, r) => s + r.kcal, 0);
  const badges = [
    { icon: '🎯', name: '首次训练', on: records.length >= 1 },
    { icon: '📅', name: '坚持7天', on: streakDays() >= 7 },
    { icon: '🏋️', name: '累计10次', on: records.length >= 10 },
    { icon: '🔥', name: '燃烧1000', on: totalK >= 1000 },
    { icon: '🥗', name: '记录饮食', on: dietEntries.length >= 1 },
    { icon: '⭐', name: '健身达人', on: records.length >= 30 }
  ];
  $('#app').innerHTML = `
    <div class="profile-hero">
      <img src="${cover(64)}" alt="头像"/>
      <div>
        <div class="pn">${esc(profile.nickname)}</div>
        <div class="pg">${goalTag(profile.goal)} <span style="margin-left:6px">${esc(profile.gender)} · ${profile.age} 岁</span></div>
      </div>
      <button class="edit-btn" id="editNick">编辑</button>
    </div>
    <div class="card">
      <h3>身体数据</h3>
      <div class="bmi-visual" style="margin-bottom:6px">
        <div class="bmi-num" style="background:${bmi.color}22;color:${bmi.color}">
          <b>${bmi.v}</b><span>BMI · ${bmi.status}</span>
        </div>
        <div style="flex:1">
          <p class="muted">身高 ${profile.height} cm · 体重 ${profile.weight} kg · 目标 ${profile.targetWeight} kg</p>
          <p class="muted" style="margin-top:4px">距离目标还差 ${Math.abs(+(profile.weight - profile.targetWeight).toFixed(1))} kg，${profile.weight > profile.targetWeight ? '坚持控糖+有氧' : '加强力量+蛋白质'} 💪</p>
        </div>
      </div>
      <div class="bmi-row" id="rowAge"><span class="bl">年龄</span><span class="bv">${profile.age} 岁</span></div>
      <div class="bmi-row" id="rowH"><span class="bl">身高</span><span class="bv">${profile.height} cm</span></div>
      <div class="bmi-row" id="rowW"><span class="bl">体重</span><span class="bv">${profile.weight} kg</span></div>
      <div class="bmi-row" id="rowTW"><span class="bl">目标体重</span><span class="bv">${profile.targetWeight} kg</span></div>
    </div>
    <div class="card">
      <h3>健身目标</h3>
      <div class="goal-opts">${GOALS.map(g => `<span class="chip ${profile.goal === g ? 'active' : ''}" data-goal="${g}">${g}</span>`).join('')}</div>
      <p class="muted" style="margin-top:10px">${esc(GOAL_TIPS[profile.goal])}</p>
    </div>
    <div class="card">
      <h3>外观设置</h3>
      <div class="goal-opts">${['auto', 'light', 'dark'].map(t => `<span class="chip ${theme === t ? 'active' : ''}" data-theme="${t}">${t === 'auto' ? '🌓' : t === 'dark' ? '🌙' : '☀️'} ${THEME_LABELS[t]}</span>`).join('')}</div>
      <p class="muted" style="margin-top:10px">当前：${theme === 'auto' ? (systemDark() ? '跟随系统（深色）' : '跟随系统（浅色）') : THEME_LABELS[theme]}</p>
    </div>
    <div class="card">
      <h3>训练偏好</h3>
      <div class="set-row"><span>🔊 提示音</span>
        <span class="seg">
          <span class="seg-i ${settings.sound ? 'on' : ''}" data-set="sound" data-v="1">开</span>
          <span class="seg-i ${!settings.sound ? 'on' : ''}" data-set="sound" data-v="0">关</span>
        </span>
      </div>
      <div class="set-row"><span>📳 震动反馈</span>
        <span class="seg">
          <span class="seg-i ${settings.vibrate ? 'on' : ''}" data-set="vibrate" data-v="1">开</span>
          <span class="seg-i ${!settings.vibrate ? 'on' : ''}" data-set="vibrate" data-v="0">关</span>
        </span>
      </div>
      <div class="set-row"><span>⏱ 休息时长</span>
        <span class="seg">${[30, 45, 60].map(s => `<span class="seg-i ${settings.restSec === s ? 'on' : ''}" data-set="restSec" data-v="${s}">${s}秒</span>`).join('')}</span>
      </div>
      <div class="set-row"><span>🔍 字体大小</span>
        <span class="seg">${['normal', 'large', 'xlarge'].map(f => `<span class="seg-i ${settings.fs === f ? 'on' : ''}" data-set="fs" data-v="${f}">${f === 'normal' ? '标准' : f === 'large' ? '大' : '超大'}</span>`).join('')}</span>
      </div>
      <p class="muted" style="margin-top:10px;line-height:1.6">首次训练点「开始」即激活声音；浏览器询问通知权限时点「允许」，锁屏时休息结束也能收到提醒。</p>
    </div>
    <div class="card">
      <h3>账号与云同步</h3>
      ${auth.token ? `
        <p style="margin:4px 0 10px">👤 <b>${esc(auth.username)}</b> <span class="muted">· 已登录</span></p>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <span class="chip" id="cloudUploadBtn">☁️ 上传到云端</span>
          <span class="chip" id="cloudDownloadBtn">⬇️ 从云端恢复</span>
          <span class="chip" id="btnOut">退出登录</span>
        </div>
        <p class="muted" style="margin-top:10px">训练记录、饮食数据、身体档案将同步到服务器，换设备登录同一账号即可恢复。</p>
      ` : `
        <input id="authUser" placeholder="用户名（3-20位字母数字）" style="width:100%;box-sizing:border-box;padding:10px 12px;border:1px solid #ddd;border-radius:10px;font-size:14px;margin-bottom:8px"/>
        <input id="authPass" type="password" placeholder="密码（至少6位）" style="width:100%;box-sizing:border-box;padding:10px 12px;border:1px solid #ddd;border-radius:10px;font-size:14px;margin-bottom:10px"/>
        <div style="display:flex;gap:8px">
          <span class="chip" id="authBtn" style="flex:1;text-align:center">登录</span>
          <span class="chip" id="authBtnReg" style="flex:1;text-align:center">注册新账号</span>
        </div>
        <p class="muted" style="margin-top:10px">注册后数据可云同步：换手机、换浏览器登录同一账号即可恢复全部记录。</p>
      `}
    </div>
    <div class="card"><h3>我的成就</h3>
      <div class="badges">${badges.map(b => `<div class="badge ${b.on ? 'on' : ''}"><i>${b.icon}</i><span>${b.name}</span></div>`).join('')}</div>
    </div>
    <div class="card">
      <h3>关于轻练</h3>
      <p class="muted">轻练 · 合理健身网站版 v1.3.0</p>
      <p class="muted" style="margin-top:4px">数据默认保存在本机浏览器；登录账号后可云同步到服务器，随时换设备恢复。</p>
    </div>
  `;
  $('#editNick').addEventListener('click', () => editField('昵称', 'nickname', 'text'));
  $('#rowAge').addEventListener('click', () => editField('年龄', 'age', 'num'));
  $('#rowH').addEventListener('click', () => editField('身高（cm）', 'height', 'num'));
  $('#rowW').addEventListener('click', () => editField('体重（kg）', 'weight', 'num'));
  $('#rowTW').addEventListener('click', () => editField('目标体重（kg）', 'targetWeight', 'num'));
  $$('#app [data-goal]').forEach(el => el.addEventListener('click', () => {
    profile.goal = el.dataset.goal; saveProfile(); renderMine(); toast('目标已切换为 ' + profile.goal);
  }));
  $$('#app [data-theme]').forEach(el => el.addEventListener('click', () => { setTheme(el.dataset.theme); renderMine(); }));
  $$('#app [data-set]').forEach(el => el.addEventListener('click', () => {
    const k = el.dataset.set;
    let v = el.dataset.v;
    if (k === 'sound' || k === 'vibrate') v = v === '1';
    else if (k === 'restSec') v = +v;
    settings[k] = v;
    saveSettings();
    renderMine();
    if (k === 'sound' && settings.sound) beep(880, .15);
  }));
  if (auth.token) {
    $('#cloudUploadBtn').addEventListener('click', cloudUpload);
    $('#cloudDownloadBtn').addEventListener('click', cloudDownload);
    $('#btnOut').addEventListener('click', doLogout);
  } else {
    $('#authBtn').addEventListener('click', () => doAuth('login'));
    $('#authBtnReg').addEventListener('click', () => doAuth('reg'));
    $('#authPass').addEventListener('keydown', e => { if (e.key === 'Enter') doAuth('login'); });
  }
}

/* ================= 初始化 ================= */
applyTheme();
applyFontScale();
$$('#tabbar a').forEach(a => a.addEventListener('click', () => showTab(a.dataset.tab)));

// 恢复未完成的训练会话（今天、有进度）；隔日的旧会话清除
function resumeSessionIfAny() {
  const s = store.get('session', null);
  if (!s) return;
  if (s.date === todayStr() && (s.elapsed > 0 || (s.done && s.done.length) || s.running)) {
    openWorkout(s.planId, s);
  } else {
    store.set('session', null);
  }
}

// 登录门控：未登录时显示登录界面，登录后才进入应用
let gateMode = 'login';
function setGateMode(mode) {
  gateMode = mode;
  const gate = $('#loginGate');
  gate.classList.toggle('is-reg', mode === 'reg');
  $('#gateLoginBtn').textContent = mode === 'reg' ? '注册' : '登录';
  $('#gateRegBtn').textContent = mode === 'reg' ? '已有账号，去登录' : '没有账号，去注册';
  const pass = $('#gatePass');
  pass.setAttribute('autocomplete', mode === 'reg' ? 'new-password' : 'current-password');
  pass.setAttribute('enterkeyhint', mode === 'reg' ? 'send' : 'go');
  hideGateError();
}
function showGateError(msg) {
  const el = $('#gateError');
  el.textContent = msg;
  el.hidden = false;
}
function hideGateError() {
  const el = $('#gateError');
  if (el) { el.textContent = ''; el.hidden = true; }
}
function showLoginGate() {
  const gate = $('#loginGate');
  if (!gate) return;
  gate.classList.add('on');
  $('#app').style.visibility = 'hidden';
  $('#tabbar').style.display = 'none';
  setGateMode('login');
  // 绑定事件（只绑一次）
  if (!gate._bound) {
    gate._bound = true;
    $('#gateForm').addEventListener('submit', e => { e.preventDefault(); gateAuth(gateMode); });
    $('#gateRegBtn').addEventListener('click', () => {
      if (gateMode === 'login') { setGateMode('reg'); $('#gateUser').focus(); }
      else setGateMode('login');
    });
    // 输入时清除错误提示
    $('#gateUser').addEventListener('input', hideGateError);
    $('#gatePass').addEventListener('input', hideGateError);
  }
  setTimeout(() => {
    if (!$('#gateUser').value) $('#gateUser').focus();
  }, 350);
}
function hideLoginGate() {
  const gate = $('#loginGate');
  if (!gate) return;
  gate.classList.remove('on');
  $('#app').style.visibility = '';
  $('#tabbar').style.display = '';
}
async function gateAuth(mode) {
  const u = ($('#gateUser').value || '').trim(), p = $('#gatePass').value || '';
  if (!u || !p) { showGateError('请输入用户名和密码'); return; }
  if (!/^[a-zA-Z0-9_]{3,20}$/.test(u)) { showGateError('用户名需 3-20 位字母/数字/下划线'); $('#gateUser').focus(); return; }
  if (p.length < 6) { showGateError('密码至少 6 位'); $('#gatePass').focus(); return; }
  const primary = $('#gateLoginBtn'), secondary = $('#gateRegBtn');
  primary.disabled = secondary.disabled = true;
  primary.classList.add('loading');
  hideGateError();
  const r = await api('POST', mode === 'reg' ? '/api/register' : '/api/login', { username: u, password: p }, 20000);
  primary.classList.remove('loading');
  primary.disabled = secondary.disabled = false;
  if (r.ok) {
    auth = { token: r.token, username: r.username, apiBase: auth.apiBase };
    store.set('auth', auth);
    toast(mode === 'reg' ? '注册成功 🎉' : '欢迎回来，' + r.username);
    hideLoginGate();
    // 登录后若本地无数据且云端有，自动恢复
    if (records.length === 0 && dietEntries.length === 0) cloudDownload();
    showTab('home');
    resumeSessionIfAny();
  } else {
    showGateError(r.msg || '操作失败，请稍后重试');
    // 密码类错误：聚焦密码框并选中，方便直接重输
    $('#gatePass').focus();
    $('#gatePass').select();
  }
}
// 退出登录时重新显示门控
const _origLogout = doLogout;
doLogout = function() { _origLogout(); showLoginGate(); $('#gateUser').value = ''; $('#gatePass').value = ''; };
// 401 自动登出时也显示门控
const _origApi = api;

// 启动检查：有 token 则验证，无 token 直接显示登录
async function initApp() {
  if (auth.token) {
    // 验证 token 是否有效
    try {
      const r = await api('GET', '/api/data');
      if (r.ok) {
        // token 有效，如果有云端数据且本地为空，自动恢复
        if (r.data && Object.keys(r.data).length > 0 && records.length === 0 && dietEntries.length === 0) {
          syncApply(r.data);
        }
        showTab('home');
        resumeSessionIfAny();
      } else {
        showLoginGate();
      }
    } catch (e) {
      // 网络失败但本地有数据，允许离线使用
      if (records.length > 0 || dietEntries.length > 0 || Object.keys(profile).length > 1) {
        toast('离线模式 · 数据将在联网后同步');
        showTab('home');
        resumeSessionIfAny();
      } else {
        showLoginGate();
      }
    }
  } else {
    showLoginGate();
  }
}
initApp();
