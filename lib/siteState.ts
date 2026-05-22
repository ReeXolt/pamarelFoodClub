// lib/siteState.ts
let siteDown = false;

export function toggleSite() {
  siteDown = !siteDown;
  return siteDown;
}

export function getSiteState() {
  return siteDown;
}