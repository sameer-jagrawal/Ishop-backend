function getAuthSecret() {
  return process.env.JWT_SECRET || process.env.SECREAT_KEY;
}

function requireAuthSecret() {
  const secret = getAuthSecret();

  if (!secret) {
    throw new Error("JWT_SECRET environment variable is required");
  }

  return secret;
}

module.exports = {
  getAuthSecret,
  requireAuthSecret,
};
