let siteDown = false;

export const toggleSite = (): boolean => {
  siteDown = !siteDown;
  return siteDown;
};

export const getSiteState = (): boolean => {
  return siteDown;
};