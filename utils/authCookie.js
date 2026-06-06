const AUTH_COOKIE_NAME = "jwt";
const AUTH_COOKIE_MAX_AGE = 30 * 24 * 60 * 60 * 1000;

function getAuthCookieOptions() {
  const isProduction = process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: AUTH_COOKIE_MAX_AGE,
    path: "/",
  };
}

function getClearAuthCookieOptions() {
  const { maxAge, ...options } = getAuthCookieOptions();
  return options;
}

module.exports = {
  AUTH_COOKIE_NAME,
  AUTH_COOKIE_MAX_AGE,
  getAuthCookieOptions,
  getClearAuthCookieOptions,
};
