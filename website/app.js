/* 肌肉会飞 · 网站版核心逻辑（数据存 localStorage） */
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
let weightMap = store.get('weightMap', {});

const saveProfile = () => store.set('profile', profile);
const saveRecords = () => store.set('records', records);
const saveDiet = () => store.set('dietEntries', dietEntries);
const saveWater = () => store.set('waterMap', waterMap);
const saveWeightMap = () => store.set('weightMap', weightMap);

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
  return { profile, records, dietEntries, waterMap, weightMap, bodyMap: store.get('bodyMap', null), dietCfg: store.get('dietCfg', null), theme, v: 2 };
}
function syncApply(data) {
  if (!data || typeof data !== 'object') return;
  if (data.profile) { profile = Object.assign(profile, data.profile); saveProfile(); }
  if (Array.isArray(data.records)) { records = data.records; saveRecords(); }
  if (Array.isArray(data.dietEntries)) { dietEntries = data.dietEntries; saveDiet(); }
  if (data.waterMap) { waterMap = data.waterMap; saveWater(); }
  if (data.weightMap) { weightMap = data.weightMap; saveWeightMap(); }
  if (data.bodyMap) { store.set('bodyMap', data.bodyMap); if (window.BodyModule) window.BodyModule.applyData(data.bodyMap); }
  if (data.dietCfg) store.set('dietCfg', data.dietCfg);
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
  const uEl = $('#authUser'), pEl = $('#authPass');
  const u = uEl.value.trim(), p = pEl.value;
  if (!u || !p) { toast('请输入用户名和密码'); if (!u) uEl.focus(); else pEl.focus(); return; }
  const uErr = userFieldMsg(u);
  if (uErr) { toast(uErr); uEl.focus(); return; }
  const pErr = passFieldMsg(p);
  if (pErr) { toast(pErr); pEl.focus(); return; }
  const btn = $('#authBtn'); if (btn) { btn.classList.add('loading'); }
  try {
    const r = await api('POST', mode === 'reg' ? '/api/register' : '/api/login', { username: u, password: p });
    if (r.ok) {
      auth = { token: r.token, username: r.username, apiBase: auth.apiBase };
      store.set('auth', auth); toast(mode === 'reg' ? '注册成功 🎉' : '登录成功，' + r.username);
      renderMine();
      if (records.length === 0 && dietEntries.length === 0) cloudDownload();
    } else toast(friendlyAuthError(mode, r.msg));
  } catch (e) { toast('网络连接失败'); }
  finally { if (btn) btn.classList.remove('loading'); }
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
  const cfg = store.get('dietCfg', { activity: 1.4, custom: null });
  const activity = cfg.activity || 1.4;
  const tdee = Math.round(bmr * activity);
  // 热量缺口/盈余随目标
  const delta = p.goal === '减脂' ? -400 : p.goal === '增肌' ? 300 : p.goal === '塑形' ? -200 : 0;
  let target = tdee + delta;
  if (cfg.custom != null) target = cfg.custom;
  const pf = (p.goal === '增肌' || p.goal === '减脂') ? 1.8 : p.goal === '塑形' ? 1.5 : 1.2;
  const proteinTarget = Math.round(p.weight * pf);
  const fatTarget = Math.round(target * .25 / 9);
  const carbTarget = Math.max(0, Math.round((target - proteinTarget * 4 - fatTarget * 9) / 4));
  return { bmr, tdee, target, proteinTarget, carbTarget, fatTarget };
}
function sumNutrition(list) {
  // 新数据：每100g营养值 + grams；旧数据：每份 + servings
  return list.reduce((a, e) => {
    const m = e.grams != null ? e.grams / 100 : (e.servings || 1);
    return {
      kcal: a.kcal + e.kcal * m,
      protein: a.protein + e.protein * m,
      carb: a.carb + e.carb * m,
      fat: a.fat + e.fat * m
    };
  }, { kcal: 0, protein: 0, carb: 0, fat: 0 });
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

/* ================= UI 精修：空状态 / 骨架屏 / 数字动画 ================= */
const EMPTY_ART = {
  record: `<svg viewBox="0 0 120 120" fill="none" aria-hidden="true">
    <circle cx="24" cy="26" r="5" fill="currentColor" opacity=".15"/>
    <circle cx="99" cy="93" r="7" fill="currentColor" opacity=".12"/>
    <path d="M40 30h40a8 8 0 0 1 8 8v52a8 8 0 0 1-8 8H40a8 8 0 0 1-8-8V38a8 8 0 0 1 8-8Z" stroke="currentColor" stroke-width="3.5"/>
    <path d="M50 24v-4a4 4 0 0 1 4-4h12a4 4 0 0 1 4 4v4" stroke="currentColor" stroke-width="3.5"/>
    <path d="M44 56h32M44 70h32M44 84h20" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" opacity=".55"/>
  </svg>`,
  search: `<svg viewBox="0 0 120 120" fill="none" aria-hidden="true">
    <circle cx="22" cy="24" r="4" fill="currentColor" opacity=".15"/>
    <circle cx="96" cy="90" r="6" fill="currentColor" opacity=".12"/>
    <circle cx="54" cy="54" r="28" stroke="currentColor" stroke-width="3.5"/>
    <path d="M75 75l22 22" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
    <path d="M42 54h24M54 42v24" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" opacity=".5"/>
  </svg>`,
  train: `<svg viewBox="0 0 120 120" fill="none" aria-hidden="true">
    <circle cx="26" cy="28" r="5" fill="currentColor" opacity=".15"/>
    <circle cx="96" cy="92" r="7" fill="currentColor" opacity=".12"/>
    <path d="M26 60h68" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
    <path d="M38 46v28M22 52v16M82 46v28M98 52v16" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
  </svg>`
};
function emptyHTML(type, title, sub, ctaHTML) {
  return `<div class="empty-state">
    <div class="es-art">${EMPTY_ART[type] || EMPTY_ART.record}</div>
    <b>${esc(title)}</b>
    ${sub ? `<p>${esc(sub)}</p>` : ''}
    ${ctaHTML || ''}
  </div>`;
}

/* 骨架屏 */
const skeletonLine = (w, h, extra) =>
  `<span class="skeleton ${extra || ''}" style="width:${w};height:${h || '14px'}"></span>`;
function bootSkeletonHTML() {
  return `<div class="boot-skel">
    <div class="skeleton" style="width:46%;height:26px"></div>
    <div class="skeleton" style="width:70%;height:12px;margin-top:12px"></div>
    <div class="skeleton" style="width:100%;height:150px;margin-top:16px;border-radius:12px"></div>
    <div class="skeleton" style="width:100%;height:84px;margin-top:12px;border-radius:12px"></div>
    <div class="skeleton" style="width:100%;height:84px;margin-top:12px;border-radius:12px"></div>
  </div>`;
}
function libSkeletonCards(n) {
  let s = '';
  for (let i = 0; i < n; i++) {
    s += `<div class="lib-card sk-card" aria-hidden="true">
      <span class="skeleton" style="width:100%;height:150px;border-radius:0"></span>
      <span class="sk-body">
        <span class="skeleton" style="width:70%;height:13px"></span>
        <span class="skeleton" style="width:44%;height:11px;margin-top:8px"></span>
      </span>
    </div>`;
  }
  return s;
}
function foodSkeletonRows(n) {
  let s = '';
  for (let i = 0; i < n; i++) {
    s += `<div class="dm-food-row sk-food" aria-hidden="true">
      <span class="skeleton" style="width:38px;height:40px;border-radius:10px"></span>
      <span style="flex:1">
        <span class="skeleton" style="width:62%;height:13px;display:block"></span>
        <span class="skeleton" style="width:38%;height:11px;margin-top:8px;display:block"></span>
      </span>
      <span class="skeleton" style="width:54px;height:30px;border-radius:999px"></span>
    </div>`;
  }
  return s;
}

/* ============== 数字格式与指标卡（v1.9.0 统一数据展示） ============== */
/* 千分位整数：1234 -> 1,234 */
function grp(v) {
  return String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
/* 重量：统一 1 位小数 */
function fmtWeight(v) { return (+v).toFixed(1); }

/* 涨跌对比（绿涨红跌）。cur/prev 同精度；opts: {decimals, unit, label} */
function deltaHTML(cur, prev, opts) {
  opts = opts || {};
  if (prev === null || prev === undefined || isNaN(prev)) return '';
  const dec = opts.decimals || 0;
  const d = cur - prev;
  const label = opts.label || '较昨日';
  if (Math.abs(d) < (dec ? 0.05 : 0.5)) return `<span class="md-flat">${label} 持平</span>`;
  const up = d > 0;
  const abs = dec ? Math.abs(d).toFixed(dec) : grp(Math.abs(d));
  return `<span class="${up ? 'md-up' : 'md-down'}">${label} ${up ? '+' : '−'}${abs}${opts.unit ? ' ' + opts.unit : ''}</span>`;
}

/* 统一指标卡：指标名(13px 灰) / 数值(24-28px 粗体)+单位(13px 60%) / 对比(10px)
   num 为 null/undefined 或 emptyZero 且为 0 时显示 "--" */
function metricCard(label, num, unit, o) {
  o = o || {};
  const dec = o.decimals || 0;
  const has = num !== null && num !== undefined && !isNaN(num) && !(o.emptyZero && num === 0);
  const txt = has ? (dec ? (+num).toFixed(dec) : grp(num)) : '--';
  const attrs = has
    ? ` data-count="${num}"${dec ? ` data-decimals="${dec}"` : ''}${o.group ? ' data-group="1"' : ''}`
    : '';
  return `<div class="metric${o.cls ? ' ' + o.cls : ''}">
    <div class="m-label">${label}</div>
    <div class="m-value"><span class="m-num${has ? '' : ' no-data'}"${attrs}>${txt}</span>${unit ? `<span class="m-unit">${unit}</span>` : ''}</div>
    <div class="m-delta">${has ? (o.delta || '') : ''}</div>
  </div>`;
}

/* ============== 图表：悬浮提示卡（v2.0.0） ==============
   用法：ChartTip.bind(容器元素, i => ({date, rows:[{c,t,v}]}))
   容器内 SVG 的 .chart-hz 隐形热区需带 data-i */
const ChartTip = {
  bind(host, getInfo) {
    if (!host) return;
    let tip = host.querySelector(':scope > .chart-tip');
    if (!tip) {
      tip = document.createElement('div');
      tip.className = 'chart-tip';
      host.appendChild(tip);
    }
    const show = (i, clientX, clientY) => {
      const info = getInfo(i);
      if (!info) return;
      tip.innerHTML = `<div class="ct-date">${info.date}</div>` +
        info.rows.map(r => `<div class="ct-row"><span class="ct-dot" style="background:${r.c}"></span>` +
          `<span class="ct-t">${r.t}</span><b>${r.v}</b></div>`).join('');
      const hr = host.getBoundingClientRect();
      let x = clientX - hr.left + 12, y = clientY - hr.top - tip.offsetHeight - 10;
      if (x + tip.offsetWidth > hr.width - 4) x = clientX - hr.left - tip.offsetWidth - 12;
      if (y < 4) y = clientY - hr.top + 14;
      tip.style.transform = `translate(${x}px, ${y}px)`;
      tip.classList.add('show');
    };
    host.addEventListener('mousemove', e => {
      const z = e.target.closest ? e.target.closest('.chart-hz') : null;
      if (z) show(+z.dataset.i, e.clientX, e.clientY);
    });
    host.addEventListener('mouseleave', () => tip.classList.remove('show'));
    host.addEventListener('touchstart', e => {
      const z = e.target.closest ? e.target.closest('.chart-hz') : null;
      if (z && e.touches[0]) { show(+z.dataset.i, e.touches[0].clientX, e.touches[0].clientY); }
    }, { passive: true });
    host.addEventListener('touchend', () => setTimeout(() => tip.classList.remove('show'), 1400));
  }
};
window.ChartTip = ChartTip;

/* ============== 柱状图 SVG（品牌色渐变柱 / 5 刻度网格 / 180px+） ============== */
function barChartSVG(uid, points, opts) {
  opts = opts || {};
  const W = 340, H = 232, L = 38, R = 12, T = 14, B = 28;
  const pw = W - L - R, ph = H - T - B;
  const maxRaw = Math.max(...points.map(p => p.v), opts.minMax || 1);
  // 取整到合适步长，保证 5 条网格
  const niceStep = v => {
    const pow = Math.pow(10, String(Math.floor(v)).length - 1);
    const n = v / pow;
    const step = (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * pow;
    return Math.max(step / 4, 1);
  };
  const step = niceStep(maxRaw);
  const maxV = Math.max(Math.ceil(maxRaw / step) * step, step);
  const n = points.length;
  const slot = pw / n;
  const bw = Math.min(slot * .52, 34);
  const y = v => T + ph - v / maxV * ph;
  let grid = '';
  for (let g = 0; g <= 4; g++) {
    const val = maxV * g / 4, yy = y(val);
    grid += `<line x1="${L}" y1="${yy}" x2="${W - R}" y2="${yy}" stroke="var(--chart-grid)" stroke-width="1"/>`;
    grid += `<text x="${L - 7}" y="${yy + 4}" text-anchor="end" font-size="11" fill="var(--text-3)">${grp(Math.round(val))}</text>`;
  }
  const bars = points.map((p, i) => {
    const cx = L + slot * i + slot / 2;
    const h = Math.max(p.v / maxV * ph, p.v ? 3 : 0);
    const yy = T + ph - h;
    const r = Math.min(5, bw / 2);
    // 圆角顶柱
    const d = h
      ? `M${cx - bw / 2},${T + ph} L${cx - bw / 2},${yy + r} Q${cx - bw / 2},${yy} ${cx - bw / 2 + r},${yy} L${cx + bw / 2 - r},${yy} Q${cx + bw / 2},${yy} ${cx + bw / 2},${yy + r} L${cx + bw / 2},${T + ph} Z`
      : '';
    return `<path d="${d}" fill="url(#${uid}-g)"/>` +
      `<text x="${cx}" y="${H - 9}" text-anchor="middle" font-size="11" fill="var(--text-3)">${p.x}</text>`;
  }).join('');
  // 隐形热区
  const zones = points.map((p, i) =>
    `<rect class="chart-hz" x="${L + slot * i}" y="${T}" width="${slot}" height="${ph}" data-i="${i}"/>`).join('');
  return `<svg viewBox="0 0 ${W} ${H}" class="chart-svg" role="img" aria-label="${opts.aria || '柱状图'}">
    <defs><linearGradient id="${uid}-g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="var(--primary)" stop-opacity="1"/>
      <stop offset="1" stop-color="var(--primary)" stop-opacity=".3"/>
    </linearGradient></defs>
    ${grid}${bars}${zones}
  </svg>`;
}

/* 历史最长连续打卡（PR 用） */
function longestStreak() {
  const days = [...new Set(records.map(r => r.date))].sort();
  let best = 0, cur = 0, prev = null;
  days.forEach(d => {
    cur = prev && d === addDays(prev, 1) ? cur + 1 : 1;
    best = Math.max(best, cur);
    prev = d;
  });
  return best;
}

/* 数字滚动（count-up；支持 data-group 千分位、data-decimals 小数） */
function runCountUps(scopeEl) {
  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  $$('[data-count]', scopeEl || document).forEach(el => {
    const to = parseFloat(el.dataset.count);
    if (isNaN(to)) { el.textContent = ''; return; }
    const decimals = el.dataset.decimals ? parseInt(el.dataset.decimals, 10) : 0;
    const group = el.dataset.group != null;
    const out = v => decimals ? v.toFixed(decimals) : (group ? grp(v) : String(Math.round(v)));
    if (reduced) { el.textContent = out(to); return; }
    const dur = 220, t0 = performance.now();
    function step(t) {
      const p = Math.min(1, (t - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      const v = to * eased;
      el.textContent = out(v);
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = out(to);
    }
    requestAnimationFrame(step);
  });
}

/* 记录页分段切换条 */
function recordsSegHTML() {
  return `<div class="rec-seg" role="tablist" aria-label="记录类型">
    <span class="rs-i ${recordsView === 'train' ? 'on' : ''}" data-rvseg="train" role="tab" aria-selected="${recordsView === 'train'}">🏋️ 训练记录</span>
    <span class="rs-i ${recordsView === 'diet' ? 'on' : ''}" data-rvseg="diet" role="tab" aria-selected="${recordsView === 'diet'}">🥗 饮食记录</span>
  </div>`;
}
document.addEventListener('click', e => {
  const seg = e.target.closest('[data-rvseg]');
  if (!seg) return;
  const v = seg.dataset.rvseg;
  if (recordsView === v) return;
  recordsView = v;
  if (currentTab === 'stats') showTab('stats');
});

/* ================= 路由 ================= */
const TABS = ['home', 'plan', 'stats', 'mine'];
let currentTab = 'home';
let recordsView = 'train'; // 记录 Tab 内分段：train 训练记录 | diet 饮食记录

function showTab(tab) {
  currentTab = tab;
  document.body.dataset.tab = tab;
  document.body.dataset.rv = tab === 'stats' ? recordsView : '';
  $$('#tabbar a').forEach(a => a.classList.toggle('active', a.dataset.tab === tab));
  if (tab === 'stats') {
    if (recordsView === 'diet') renderDiet();
    else renderStats();
  } else {
    ({ home: renderHome, plan: renderPlan, mine: renderMine })[tab]();
  }
  window.scrollTo(0, 0);
  // 重启页面进入动画
  const appEl = $('#app');
  appEl.classList.remove('tab-enter');
  void appEl.offsetWidth;
  appEl.classList.add('tab-enter');
}
function closeSubpages() { $$('.subpage').forEach(p => p.classList.remove('show')); }

/* ================= 首页 ================= */
function renderHome() {
  const t = todayStr();
  const weekKcal = records.filter(r => r.date >= addDays(t, -6)).reduce((s, r) => s + r.kcal, 0);
  const weekCount = records.filter(r => r.date >= addDays(t, -6)).length;
  const lastWeekCount = records.filter(r => r.date >= addDays(t, -13) && r.date <= addDays(t, -7)).length;
  const totalMin = records.reduce((s, r) => s + r.minutes, 0);
  const totalKcal = records.reduce((s, r) => s + r.kcal, 0);
  const plan = calcPlan(profile);
  const pct = Math.min(100, Math.round(weekKcal / (plan.target * 0.2 || 1) * 100));
  $('#app').innerHTML = `
    <div class="page-head home-head">
      <div>
        <h1>${greeting()}，${esc(profile.nickname)}</h1>
        <p>今天是 ${todayStr()} · 周${WEEK[new Date().getDay()]} · 距离周末还有${5 - (new Date().getDay() % 7) > 0 ? 5 - (new Date().getDay() % 7) : 0}天</p>
      </div>
      <button class="head-icon-btn" id="quickTheme" aria-label="切换深色/浅色" title="切换深色/浅色">🌓</button>
    </div>
    <div class="home-col home-col-l">
    <div class="hero">
      <div>
        <div class="label">本周已消耗</div>
        <div class="big">${weekKcal
          ? `<span data-count="${weekKcal}" data-group="1">${grp(weekKcal)}</span>`
          : '<span class="no-data">--</span>'}<small> 千卡</small></div>
        <div class="label" style="margin-top:4px">目标 ${esc(profile.goal)} · ${GOAL_TIPS[profile.goal] || ''}</div>
      </div>
      <div class="ring-wrap">${ring(pct, '#ffffff', 'rgba(255,255,255,.28)')}
        <div class="rtext"><b>${pct}%</b><i>周目标</i></div>
      </div>
    </div>
    <div class="section-title"><h2>今日训练</h2><a data-nav="plan">课表 ›</a></div>
    ${PlanModule.todayCard()}
    <div class="section-title"><h2>热门计划</h2><a data-nav="plan">全部 ›</a></div>
    ${PlanModule.plans.slice(0, 3).map(PlanModule.planCardHTML).join('')}
    </div>
    <div class="home-col home-col-r">
    <div class="grid-stats gs2x2">
      ${metricCard('本周训练', weekCount, '次', { emptyZero: true, delta: deltaHTML(weekCount, lastWeekCount, { label: '对比上周', unit: '次' }) })}
      ${metricCard('总分钟', totalMin, '分钟', { group: true, emptyZero: true })}
      ${metricCard('总次数', records.length, '次', { emptyZero: true })}
      ${metricCard('总千卡', totalKcal, 'kcal', { group: true, emptyZero: true })}
    </div>
    ${RewardsModule.encouragementHTML()}
    <div class="section-title"><h2>快捷入口</h2></div>
    <div class="quick q5">
      <div class="q" data-run="start"><i>🏃</i>户外跑步</div>
      <div class="q" data-lib><i>📚</i>动作库</div>
      <div class="q" data-nav="plan"><i>💪</i>开始训练</div>
      <div class="q" data-nav="stats" data-rv="diet"><i>🥗</i>饮食记录</div>
      <div class="q" data-nav="stats" data-rv="train"><i>📊</i>数据统计</div>
      <div class="q" data-nav="mine"><i>👤</i>个人中心</div>
    </div>
    </div>
    <div class="tips"><span>💡</span><p>${esc(GOAL_TIPS[profile.goal])}。健身贵在坚持，微小的习惯长期复利。</p></div>
  `;
  bindPlanCards();
  $('#quickTheme').addEventListener('click', () => {
    const effectiveDark = theme === 'dark' || (theme === 'auto' && systemDark());
    setTheme(effectiveDark ? 'light' : 'dark');
  });
  runCountUps();
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
  $$('#app [data-nav]').forEach(el => el.addEventListener('click', () => {
    if (el.dataset.rv) recordsView = el.dataset.rv;
    showTab(el.dataset.nav);
  }));
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
          <div class="ex-list" style="margin-top:12px">
            ${p.exercises.map((n, i) => {
              const ex = EXERCISES.find(e => e.name === n) || { minutes: 4, kcal: 30 };
              const thumb = thumbFor(n);
              return `<button type="button" class="ex-row ${workout.done.includes(i) ? 'done' : ''}" data-i="${i}">
                ${thumb ? `<span class="ex-thumb"><img loading="lazy" src="${thumb}" alt=""></span>` : ''}
                <span class="ex-idx">${i + 1}</span>
                <span class="ex-info"><span class="exn">${esc(n)}</span><span class="exm">${ex.minutes}分钟 · ${ex.kcal}千卡</span></span>
                <span class="ex-demo" data-demo="${esc(n)}" role="button" aria-label="观看 ${n} 演示视频" title="看演示视频">▶</span>
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
      <div class="lib-grid" id="libGrid">${libSkeletonCards(8)}</div>
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
    .catch(() => {
      $('#libGrid', sub).innerHTML = emptyHTML('search', '动作加载失败', '请检查网络连接后重试',
        '<button class="btn" id="libRetry">重新加载</button>');
      const retry = $('#libRetry', sub);
      if (retry) retry.addEventListener('click', () => {
        $('#libGrid', sub).innerHTML = libSkeletonCards(8);
        loadLib().then(() => renderLibGrid(sub));
      });
    });
}

function renderLibGrid(sub) {
  const grid = $('#libGrid', sub);
  if (!libData) return;
  const list = libData.filter(x =>
    (libFilter === '全部' || x.g === libFilter) &&
    (!libQuery || x.n.toLowerCase().includes(libQuery) || x.t.toLowerCase().includes(libQuery)));
  if (!list.length) {
    grid.innerHTML = emptyHTML('search', '没有找到相关动作', libQuery ? '换个关键词试试' : '换个筛选条件试试');
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
    <div class="ld-demo-wrap">
      <a class="btn ghost full ld-demo" target="_blank" rel="noopener" href="${demoURL(x.n)}">▶ 观看动作演示视频</a>
    </div>
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

/* 动作演示视频：B站搜索（免自制、零成本，结果随动作名动态匹配） */
function demoURL(name) {
  return 'https://search.bilibili.com/all?keyword=' + encodeURIComponent(name + ' 动作示范');
}
// 统一在捕获阶段拦截 [data-demo]，避免点视频图标时误触发外层「完成动作」按钮
document.addEventListener('click', (e) => {
  const d = e.target.closest('[data-demo]');
  if (!d) return;
  e.preventDefault(); e.stopPropagation();
  window.open(demoURL(d.dataset.demo), '_blank', 'noopener');
}, true);

/* ================= 饮食页 ================= */
function renderDiet() {
  DietModule.renderDiet();
}

/* ================= 数据页 ================= */
function renderStats() {
  const today = todayStr();
  const week = Array.from({ length: 7 }, (_, i) => addDays(today, i - 6));
  const weekData = week.map(d => ({ d, kcal: records.filter(r => r.date === d).reduce((s, r) => s + r.kcal, 0) }));
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
  const totalMin = records.reduce((s, r) => s + r.minutes, 0);
  const totalKcal = records.reduce((s, r) => s + r.kcal, 0);
  const todayCount = records.filter(r => r.date === today).length;
  // PR：按日聚合取最高
  const dayAgg = {};
  records.forEach(r => {
    dayAgg[r.date] = dayAgg[r.date] || { kcal: 0, min: 0 };
    dayAgg[r.date].kcal += r.kcal;
    dayAgg[r.date].min += r.minutes;
  });
  const dayVals = Object.values(dayAgg);
  const prKcal = dayVals.length ? Math.max(...dayVals.map(d => d.kcal)) : null;
  const prMin = dayVals.length ? Math.max(...dayVals.map(d => d.min)) : null;
  const prStreak = longestStreak() || null;
  const prItem = (label, v, unit) => `<div class="pr-i">
      <div class="pr-label">${label}</div>
      <div class="pr-v">${v === null ? '<span class="no-data">--</span>'
        : `<span data-count="${Math.round(v)}" data-group="1">${grp(v)}</span><em>${unit}</em>`}</div>
    </div>`;
  $('#app').innerHTML = `
    <div class="page-head">
      <h1>训练数据</h1>
      <p>坚持是最大的天赋 · 已记录 ${records.length} 次训练</p>
    </div>
    ${recordsSegHTML()}
    <div class="grid-stats">
      ${metricCard('总次数', records.length, '次', { emptyZero: true })}
      ${metricCard('总分钟', totalMin, '分钟', { group: true, emptyZero: true })}
      ${metricCard('总千卡', totalKcal, 'kcal', { group: true, emptyZero: true })}
    </div>
    <div class="streak-row">
      ${metricCard('连续打卡', streak, '天', { emptyZero: true, cls: 'm-hot' })}
      ${metricCard('今日训练', todayCount, '次', { emptyZero: true })}
    </div>
    <div class="stats-dash">
      <div class="card span-2 pr-card">
        <h3><span class="pr-trophy">🏆</span>个人纪录 PR</h3>
        <div class="pr-grid">
          ${prItem('最高单次耗能', prKcal, 'kcal')}
          ${prItem('最长连续打卡', prStreak, '天')}
          ${prItem('最长单日训练', prMin, '分钟')}
        </div>
      </div>
      <div class="card rw-share-today" data-rw="share-today">
        <span class="st-ic">🏅</span>
        <span><b>生成训练海报</b><small>${records.some(r => r.date === today) ? '今日数据已就绪 · 生成分享卡片' : '完成今日训练后即可生成'}</small></span>
        <span class="go-arrow">海报 ›</span>
      </div>
      <div class="card">
        ${RewardsModule.reminderHTML()}
      </div>
      <div class="card span-2">
        <h3>训练热力图（近一年）</h3>
        ${RewardsModule.heatmapHTML()}
      </div>
      <div class="card span-2"><h3>近 7 天耗能</h3>
        <div class="chart-host" id="weekChartHost">${barChartSVG('wk7',
          weekData.map(x => ({ x: x.d.slice(5).replace('-', '/'), v: x.kcal })),
          { aria: '近 7 天耗能柱状图' })}
        </div>
      </div>
      <div class="card"><h3>${y} 年 ${m + 1} 月</h3><div class="cal">${cal}</div></div>
      <div class="card span-2"><h3>最近记录</h3>
        ${recent.length ? recent.map(r => `
          <div class="rec">
            <div class="rec-main">
              <b class="rec-title">${r.type === 'run' ? '🏃 ' : ''}${esc(r.planTitle)}</b>
              <span class="rec-meta">${r.date} · ${r.type === 'run' ? '户外 GPS' : r.doneCount + '/' + r.total + ' 动作'}
                <span class="share-link" data-rw="share-date" data-date="${r.date}">海报</span>
                <span class="del" data-del="${r.id}">删除</span>
              </span>
            </div>
            <div class="rec-data">
              <div class="rd-main"><b>${grp(r.kcal)}</b><i>千卡</i></div>
              <div class="rd-sub">${r.type === 'run' && r.distanceKm != null ? r.distanceKm.toFixed(2) + ' km · ' : ''}${r.minutes} 分钟</div>
            </div>
          </div>`).join('') : emptyHTML('record', '还没有训练记录', '完成第一次训练后，数据会出现在这里',
            '<button class="btn" id="statsEmptyCta">去开始第一次训练</button>')}
      </div>
    </div>
  `;
  $$('#app .rec .del').forEach(el => el.addEventListener('click', () => {
    records = records.filter(r => r.id !== el.dataset.del);
    saveRecords(); renderStats(); toast('已删除');
  }));
  const emptyCta = $('#statsEmptyCta');
  if (emptyCta) emptyCta.addEventListener('click', () => showTab('plan'));
  const chartHost = $('#weekChartHost');
  if (chartHost) ChartTip.bind(chartHost, i => ({
    date: weekData[i].d,
    rows: [{ c: 'var(--primary)', t: '耗能', v: grp(weekData[i].kcal) + ' 千卡' }]
  }));
  runCountUps();
}

/* ================= 我的页 ================= */

/* ---------- 居中弹层系统 ---------- */
const ITEM_H = 44;          // 滚轮每行高度
const VISIBLE_ROWS = 5;     // 滚轮可见行数（奇数，中心为选中行）
let sheetEl = null;

function closeSheet() {
  if (!sheetEl) return;
  const el = sheetEl; sheetEl = null;
  document.body.classList.remove('sheet-open');
  el.classList.remove('show');
  setTimeout(() => el.remove(), 220);
}

/* Esc 关闭弹层 */
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSheet(); });

function mountSheet(innerHTML) {
  closeSheet();
  sheetEl = document.createElement('div');
  sheetEl.className = 'sheet-root';
  sheetEl.innerHTML = `<div class="sheet-mask"></div><div class="sheet-card">${innerHTML}</div>`;
  document.body.appendChild(sheetEl);
  $('.sheet-mask', sheetEl).addEventListener('click', closeSheet);
  document.body.classList.add('sheet-open');
  requestAnimationFrame(() => requestAnimationFrame(() => sheetEl.classList.add('show')));
  return sheetEl;
}

/* 文本填写弹层（昵称等） */
function openTextSheet(title, value, maxLen, onConfirm) {
  const root = mountSheet(`
    <div class="sheet-head"><b>${esc(title)}</b></div>
    <input class="sheet-input" id="sheetInput" maxlength="${maxLen}" value="${esc(value)}" enterkeyhint="done"/>
    <div class="sheet-btns">
      <button type="button" class="btn ghost" id="sheetCancel">取消</button>
      <button type="button" class="btn" id="sheetOk">确定</button>
    </div>`);
  const input = $('#sheetInput', root);
  setTimeout(() => { input.focus(); input.select(); }, 120);
  $('#sheetCancel', root).addEventListener('click', closeSheet);
  const submit = () => {
    const v = input.value.trim();
    if (!v) { toast('内容不能为空'); return; }
    closeSheet(); onConfirm(v.slice(0, maxLen));
  };
  $('#sheetOk', root).addEventListener('click', submit);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') submit(); });
}

/* 数字滚轮弹层：min~max，step 步进；上下滑动 / 鼠标滚轮 / 点击某行均可 */
function openWheelSheet(cfg, onConfirm) {
  const { title, unit, min, max, step, value, dec } = cfg;
  const count = Math.round((max - min) / step) + 1;
  const at = v => Math.round((v - min) / step);
  const fmt = i => {
    const v = Math.round((min + i * step) * 100) / 100;
    return dec ? v.toFixed(dec) : String(v);
  };
  let rows = '';
  for (let i = 0; i < count; i++) rows += `<div class="wheel-item">${fmt(i)}</div>`;

  const root = mountSheet(`
    <div class="sheet-head"><b>${esc(title)}</b><span class="sheet-unit">${esc(unit)}</span></div>
    <div class="wheel">
      <div class="wheel-fade top"></div><div class="wheel-fade bot"></div>
      <div class="wheel-band"></div>
      <div class="wheel-list" id="wheelList">
        <div class="wheel-spacer"></div>${rows}<div class="wheel-spacer"></div>
      </div>
    </div>
    <div class="sheet-btns">
      <button type="button" class="btn ghost" id="sheetCancel">取消</button>
      <button type="button" class="btn" id="sheetOk">确定</button>
    </div>`);

  const list = $('#wheelList', root);
  const itemEls = [...list.querySelectorAll('.wheel-item')];
  let idx = Math.min(count - 1, Math.max(0, at(Math.round(value * 100) / 100)));
  // 初始定位（浏览器布局完成后）
  requestAnimationFrame(() => { list.scrollTop = idx * ITEM_H; });
  const readIdx = () => Math.min(count - 1, Math.max(0, Math.round(list.scrollTop / ITEM_H)));
  const markSel = i => itemEls.forEach((el, j) => el.classList.toggle('sel', j === i));
  markSel(idx);

  let snapTimer = null;
  list.addEventListener('scroll', () => {
    idx = readIdx(); markSel(idx);
    clearTimeout(snapTimer);
    // 滚动停止后吸附到最近行（触摸惯性结束时）
    snapTimer = setTimeout(() => {
      const target = idx * ITEM_H;
      if (Math.abs(list.scrollTop - target) > 1) list.scrollTo({ top: target, behavior: 'smooth' });
    }, 90);
  });
  // 鼠标滚轮：逐行滚动（桌面端体验）
  list.addEventListener('wheel', e => {
    e.preventDefault();
    idx = Math.min(count - 1, Math.max(0, idx + (e.deltaY > 0 ? 1 : -1)));
    list.scrollTo({ top: idx * ITEM_H, behavior: 'smooth' });
  }, { passive: false });
  // 点击某行直接滚过去
  list.addEventListener('click', e => {
    const item = e.target.closest('.wheel-item');
    if (!item) return;
    idx = itemEls.indexOf(item);
    list.scrollTo({ top: idx * ITEM_H, behavior: 'smooth' });
  });

  $('#sheetCancel', root).addEventListener('click', closeSheet);
  $('#sheetOk', root).addEventListener('click', () => {
    idx = readIdx();
    const v = Math.round((min + idx * step) * 100) / 100;
    closeSheet(); onConfirm(v);
  });
}

/* 性别选择弹层（两张大卡片） */
function openGenderSheet(value, onConfirm) {
  const card = (g, color, paths) => `
    <button type="button" class="gcard ${g === value ? 'active' : ''}" data-g="${g}">
      <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>
      <b>${g}</b>
    </button>`;
  const root = mountSheet(`
    <div class="sheet-head"><b>选择性别</b></div>
    <div class="gcard-row">
      ${card('男', '#165dff', '<circle cx="9.5" cy="14" r="4.5"/><path d="M12.7 10.8 19 5"/><path d="M14 5h5v5"/>')}
      ${card('女', '#ec4899', '<circle cx="12" cy="8.5" r="4.5"/><path d="M12 13v6.5"/><path d="M8.5 16.5h7"/>')}
    </div>
    <div class="sheet-btns"><button type="button" class="btn full" id="sheetCancel2">关闭</button></div>`);
  root.querySelectorAll('.gcard').forEach(b => b.addEventListener('click', () => {
    if (b.dataset.g === value) { closeSheet(); return; }
    const g = b.dataset.g; closeSheet(); onConfirm(g);
  }));
  $('#sheetCancel2', root).addEventListener('click', closeSheet);
}

const FIELD_CONF = {
  age:          { title: '年龄',     unit: '岁',  min: 10, max: 100, step: 1,   dec: 0 },
  height:       { title: '身高',     unit: 'cm',  min: 130, max: 210, step: 1,   dec: 0 },
  weight:       { title: '体重',     unit: 'kg',  min: 30, max: 200, step: 0.1, dec: 1 },
  targetWeight: { title: '目标体重', unit: 'kg',  min: 30, max: 200, step: 0.1, dec: 1 }
};
function editField(label, key) {
  const cfg = Object.assign({ value: profile[key] }, FIELD_CONF[key]);
  openWheelSheet(cfg, v => {
    profile[key] = v; saveProfile(); renderMine(); toast(`${cfg.title}已更新为 ${v} ${cfg.unit}`);
  });
}
function genderMeta() {
  const male = profile.gender !== '女';
  return male
    ? { color: '#165dff', bg: 'rgba(22,93,255,.10)', paths: '<circle cx="9.5" cy="14" r="4.5"/><path d="M12.7 10.8 19 5"/><path d="M14 5h5v5"/>' }
    : { color: '#ec4899', bg: 'rgba(236,72,153,.10)', paths: '<circle cx="12" cy="8.5" r="4.5"/><path d="M12 13v6.5"/><path d="M8.5 16.5h7"/>' };
}
const GO_ARROW_SVG = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="var(--primary)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9.2 4.6 16.6 12l-7.4 7.4"/></svg>';
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
      <span class="pf-avatar" style="background:${genderMeta().bg};color:${genderMeta().color}">
        <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${genderMeta().paths}</svg>
      </span>
      <div>
        <div class="pn">${esc(profile.nickname)}</div>
        <div class="pg">${goalTag(profile.goal)} <span style="margin-left:8px">${esc(profile.gender)} · ${profile.age} 岁</span></div>
      </div>
      <button class="edit-btn" id="editNick">编辑</button>
    </div>
    <div class="mine-col mine-col-l">
    <div class="card">
      <h3>身体数据</h3>
      <div class="bmi-visual">
        <div class="bmi-num" style="background:${bmi.color}1a;color:${bmi.color}">
          <span class="bm-tag">BMI</span>
          <b>${bmi.v.toFixed(1)}</b>
          <span class="bm-st">${bmi.status}</span>
        </div>
        <div class="bmi-side">
          <p class="bs-gap">距目标还差 <b style="color:${bmi.color}">${fmtWeight(Math.abs(profile.weight - profile.targetWeight))} kg</b></p>
          <p class="muted">${profile.weight > profile.targetWeight ? '坚持控糖 + 有氧' : '加强力量 + 蛋白质'}，稳步接近目标</p>
        </div>
      </div>
      <div class="data-rows">
        <div class="bmi-row" id="rowGender">
          <span class="bl">性别</span><span class="bv">${esc(profile.gender)}</span><span class="go-btn">${GO_ARROW_SVG}</span>
        </div>
        <div class="bmi-row" id="rowAge">
          <span class="bl">年龄</span><span class="bv">${profile.age}<em>岁</em></span><span class="go-btn">${GO_ARROW_SVG}</span>
        </div>
        <div class="bmi-row" id="rowH">
          <span class="bl">身高</span><span class="bv">${profile.height}<em>cm</em></span><span class="go-btn">${GO_ARROW_SVG}</span>
        </div>
        <div class="bmi-row" id="rowW">
          <span class="bl">体重</span><span class="bv">${fmtWeight(profile.weight)}<em>kg</em></span><span class="go-btn">${GO_ARROW_SVG}</span>
        </div>
        <div class="bmi-row" id="rowTW">
          <span class="bl">目标体重</span><span class="bv">${fmtWeight(profile.targetWeight)}<em>kg</em></span><span class="go-btn">${GO_ARROW_SVG}</span>
        </div>
        <div class="bmi-row" id="rowBody">
          <span class="bl">体脂 / 围度</span><span class="bv muted">记录与趋势</span><span class="go-btn">${GO_ARROW_SVG}</span>
        </div>
      </div>
    </div>
    <div class="card">
      <h3>体重 · 饮食趋势（近 14 天）</h3>
      <div id="trendBox"></div>
    </div>
    </div>
    <div class="mine-col mine-col-r">
    <div class="card">
      <h3>健身目标</h3>
      <div class="goal-opts">${GOALS.map(g => `<span class="chip ${profile.goal === g ? 'active' : ''}" data-goal="${g}">${g}</span>`).join('')}</div>
      <p class="muted" style="margin-top:12px">${esc(GOAL_TIPS[profile.goal])}</p>
    </div>
    <div class="card">
      <h3>外观设置</h3>
      <div class="goal-opts">${['auto', 'light', 'dark'].map(t => `<span class="chip ${theme === t ? 'active' : ''}" data-theme="${t}">${t === 'auto' ? '🌓' : t === 'dark' ? '🌙' : '☀️'} ${THEME_LABELS[t]}</span>`).join('')}</div>
      <p class="muted" style="margin-top:12px">当前：${theme === 'auto' ? (systemDark() ? '跟随系统（深色）' : '跟随系统（浅色）') : THEME_LABELS[theme]}</p>
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
      <p class="muted" style="margin-top:12px;line-height:1.6">首次训练点「开始」即激活声音；浏览器询问通知权限时点「允许」，锁屏时休息结束也能收到提醒。</p>
    </div>
    <div class="card">
      <h3>账号与云同步</h3>
      ${auth.token ? `
        <p style="margin:4px 0 12px">👤 <b>${esc(auth.username)}</b> <span class="muted">· 已登录</span></p>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <span class="chip" id="cloudUploadBtn">☁️ 上传到云端</span>
          <span class="chip" id="cloudDownloadBtn">⬇️ 从云端恢复</span>
          <span class="chip" id="btnOut">退出登录</span>
        </div>
        <p class="muted" style="margin-top:12px">训练记录、饮食数据、身体档案将同步到服务器，换设备登录同一账号即可恢复。</p>
      ` : `
          <input id="authUser" class="field-input" placeholder="用户名（3-20位字母数字）"
            autocomplete="username" autocapitalize="none" spellcheck="false"/>
          <p class="field-msg" id="authUserMsg" aria-live="polite"></p>
          <input id="authPass" type="password" class="field-input" placeholder="密码（至少6位）"
            autocomplete="current-password"/>
          <p class="field-msg" id="authPassMsg" aria-live="polite"></p>
          <div style="display:flex;gap:8px">
            <span class="chip" id="authBtn" style="flex:1;justify-content:center">登录</span>
            <span class="chip" id="authBtnReg" style="flex:1;justify-content:center">注册新账号</span>
          </div>
          <p class="muted" style="margin-top:12px">注册后数据可云同步：换手机、换浏览器登录同一账号即可恢复全部记录。</p>
        `}
    </div>
    <div class="card"><h3>我的成就</h3>
      <div class="badges">${badges.map(b => `<div class="badge ${b.on ? 'on' : ''}"><i>${b.icon}</i><span>${b.name}</span></div>`).join('')}</div>
    </div>
    <div class="card">
      <h3>关于肌肉会飞</h3>
      <p class="muted">肌肉会飞 v3.0.0 · 科学训练与饮食记录</p>
      <p class="muted" style="margin-top:4px">数据默认保存在本机浏览器；登录账号后可云同步到服务器，随时换设备恢复。</p>
    </div>
    </div>
  `;
  $('#editNick').addEventListener('click', () => openTextSheet('修改昵称', profile.nickname, 12, v => {
    profile.nickname = v; saveProfile(); renderMine(); toast('昵称已更新');
  }));
  $('#rowGender').addEventListener('click', () => openGenderSheet(profile.gender, g => {
    profile.gender = g; saveProfile(); renderMine(); toast('性别已选择：' + g);
  }));
  $('#rowAge').addEventListener('click', () => editField('年龄', 'age'));
  $('#rowH').addEventListener('click', () => editField('身高', 'height'));
  $('#rowW').addEventListener('click', () => DietModule.openWeight());
  $('#rowTW').addEventListener('click', () => editField('目标体重', 'targetWeight'));
  $('#rowBody').addEventListener('click', () => window.BodyModule.open());
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
    const au = $('#authUser'), ap = $('#authPass');
    au.addEventListener('input', e => setFieldMsg('#authUser', '#authUserMsg', userFieldMsg(e.target.value.trim())));
    ap.addEventListener('input', e => setFieldMsg('#authPass', '#authPassMsg', passFieldMsg(e.target.value)));
    au.addEventListener('blur', e => { if (e.target.value) setFieldMsg('#authUser', '#authUserMsg', userFieldMsg(e.target.value.trim())); });
    ap.addEventListener('blur', e => { if (e.target.value) setFieldMsg('#authPass', '#authPassMsg', passFieldMsg(e.target.value)); });
    $('#authBtn').addEventListener('click', () => doAuth('login'));
    $('#authBtnReg').addEventListener('click', () => doAuth('reg'));
    ap.addEventListener('keydown', e => { if (e.key === 'Enter') doAuth('login'); });
  }
  DietModule.mountTrend();
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
/* 字段实时校验 */
function userFieldMsg(v) {
  if (!v) return '';
  if (v.length < 3) return '至少 3 个字符';
  if (!/^[a-zA-Z0-9_]+$/.test(v)) return '只能包含字母、数字、下划线';
  if (v.length > 20) return '最多 20 个字符';
  return '';
}
function passFieldMsg(v) {
  if (!v) return '';
  if (v.length < 6) return '密码至少 6 位';
  return '';
}
function setFieldMsg(inputSel, msgSel, msg) {
  const inputEl = $(inputSel), msgEl = $(msgSel);
  if (!inputEl || !msgEl) return;
  inputEl.classList.toggle('field-error', !!msg);
  msgEl.textContent = msg;
  msgEl.classList.toggle('show', !!msg);
}
function friendlyAuthError(mode, msg) {
  if (mode === 'login' && msg === '用户名或密码错误')
    return '用户名或密码不正确，请重新输入；若忘记密码，可用同一用户名重新注册';
  if (mode === 'reg' && msg === '用户名已存在')
    return '这个用户名已被注册，换一个试试，或直接去登录';
  return msg || '操作失败，请稍后重试';
}
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
  setFieldMsg('#gateUser', '#gateUserMsg', '');
  setFieldMsg('#gatePass', '#gatePassMsg', '');
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
  $$('#gateGender .lg-g-i').forEach(b => b.classList.toggle('active', b.dataset.g === profile.gender));
  setGateMode('login');
  // 预热：进登录页就 ping 一次数据库（后端 health 会异步 SELECT 1 唤醒 Neon），
  // 用户填用户名密码的几秒钟里连接已焐热，首次登录不再冷启动超时
  if (!gate._warmed) {
    gate._warmed = true;
    fetch('/api/health').catch(() => {});
  }
  // 绑定事件（只绑一次）
  if (!gate._bound) {
    gate._bound = true;
    $('#gateForm').addEventListener('submit', e => { e.preventDefault(); gateAuth(gateMode); });
    $('#gateRegBtn').addEventListener('click', () => {
      if (gateMode === 'login') { setGateMode('reg'); $('#gateUser').focus(); }
      else setGateMode('login');
    });
    $$('#gateGender .lg-g-i').forEach(btn => btn.addEventListener('click', () => {
      $$('#gateGender .lg-g-i').forEach(b => b.classList.toggle('active', b === btn));
      hideGateError();
    }));
    // 输入时实时校验并清除顶部错误
    $('#gateUser').addEventListener('input', e => {
      hideGateError();
      setFieldMsg('#gateUser', '#gateUserMsg', userFieldMsg(e.target.value.trim()));
    });
    $('#gatePass').addEventListener('input', e => {
      hideGateError();
      setFieldMsg('#gatePass', '#gatePassMsg', passFieldMsg(e.target.value));
    });
    $('#gateUser').addEventListener('blur', e => {
      const v = e.target.value.trim();
      if (v) setFieldMsg('#gateUser', '#gateUserMsg', userFieldMsg(v));
    });
    $('#gatePass').addEventListener('blur', e => {
      const v = e.target.value;
      if (v) setFieldMsg('#gatePass', '#gatePassMsg', passFieldMsg(v));
    });
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
  const uEl = $('#gateUser'), pEl = $('#gatePass');
  const u = (uEl.value || '').trim(), p = pEl.value || '';
  if (!u || !p) { showGateError('请输入用户名和密码'); if (!u) uEl.focus(); else pEl.focus(); return; }
  const uErr = userFieldMsg(u);
  if (uErr) { showGateError(uErr); setFieldMsg('#gateUser', '#gateUserMsg', uErr); uEl.focus(); return; }
  const pErr = passFieldMsg(p);
  if (pErr) { showGateError(pErr); setFieldMsg('#gatePass', '#gatePassMsg', pErr); pEl.focus(); return; }
  const primary = $('#gateLoginBtn'), secondary = $('#gateRegBtn');
  primary.disabled = secondary.disabled = true;
  primary.classList.add('loading');
  hideGateError();
  // 32s：后端对数据库查询有 8s×3 次重试（首连 Cloudflare→Neon 链路需 10-20s 激活），
  // 前端超时必须大于后端最坏路径 26s，否则用户拿不到重试成功的结果
  const r = await api('POST', mode === 'reg' ? '/api/register' : '/api/login', { username: u, password: p }, 32000);
  primary.classList.remove('loading');
  primary.disabled = secondary.disabled = false;
  if (r.ok) {
    auth = { token: r.token, username: r.username, apiBase: auth.apiBase };
    store.set('auth', auth);
    const gEl = $('#gateGender .lg-g-i.active');
    if (gEl && profile.gender !== gEl.dataset.g) { profile.gender = gEl.dataset.g; saveProfile(); }
    toast(mode === 'reg' ? '注册成功 🎉' : '欢迎回来，' + r.username);
    hideLoginGate();
    // 登录后若本地无数据且云端有，自动恢复
    if (records.length === 0 && dietEntries.length === 0) cloudDownload();
    showTab('home');
    resumeSessionIfAny();
  } else {
    showGateError(friendlyAuthError(mode, r.msg));
    // 注册冲突聚焦用户名（换名字）；其余聚焦密码方便直接重输
    if (mode === 'reg' && r.msg === '用户名已存在') { uEl.focus(); uEl.select(); }
    else { pEl.focus(); pEl.select(); }
  }
}
// 退出登录时重新显示门控
const _origLogout = doLogout;
doLogout = function() { _origLogout(); showLoginGate(); $('#gateUser').value = ''; $('#gatePass').value = ''; };
// 401 自动登出时也显示门控
const _origApi = api;

// 启动检查：有 token 则验证，无 token 直接显示登录
async function initApp() {
  $('#app').innerHTML = bootSkeletonHTML();
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
