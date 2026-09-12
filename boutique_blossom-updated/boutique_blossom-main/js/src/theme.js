/* ===== theme.js — light/dark mode toggle + icon ===== */
const SUN_PATH = '<circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.4M12 19.1v2.4M4.2 4.2l1.7 1.7M18.1 18.1l1.7 1.7M2.5 12h2.4M19.1 12h2.4M4.2 19.8l1.7-1.7M18.1 5.9l1.7-1.7"/>';
const MOON_PATH = '<path d="M20 14.5A8.5 8.5 0 1110 3.5a7 7 0 0010 11z"/>';
function initTheme(){
  let saved = null;
  try{ saved = localStorage.getItem('blossom07:theme'); }catch(e){}
  const theme = saved === 'dark' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', theme);
}
function toggleTheme(){
  const cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  const next = cur === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  try{ localStorage.setItem('blossom07:theme', next); }catch(e){}
  updateThemeIcon();
}
function updateThemeIcon(){
  const icon = document.getElementById('theme-icon');
  if(!icon) return;
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  icon.innerHTML = isDark ? SUN_PATH : MOON_PATH;
}
initTheme();

/* ============ STATE ============ */
