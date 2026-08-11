export const FOUNDER_NAME = 'Sujay';
export const CONTROL_CENTER_CODE = '901213271080';
export const ADMIN_SESSION_KEY = 'sobagu_admin_session';

export const isAdminSessionActive = () =>
  localStorage.getItem(ADMIN_SESSION_KEY) === 'true';

export const setAdminSession = (active) => {
  if (active) {
    localStorage.setItem(ADMIN_SESSION_KEY, 'true');
  } else {
    localStorage.removeItem(ADMIN_SESSION_KEY);
  }
};

export const verifyControlCenterCode = (code) =>
  (code || '').replace(/\D/g, '').trim() === CONTROL_CENTER_CODE;

export const canAccessControlCenter = (user) => {
  if (isAdminSessionActive()) return true;
  if (!user) return false;
  return user.role === 'admin' || user.role === 'founder';
};
