require("dotenv").config();

const mongoose = require("mongoose");
const Cryptr = require("cryptr");
const UserModel = require("../models/UserModel");
const { requireAuthSecret } = require("../utils/secrets");

async function resetPassword() {
  const [, , email, newPassword] = process.argv;

  if (!email || !newPassword) {
    throw new Error("Usage: node scripts/reset-password.js <email> <newPassword>");
  }

  await mongoose.connect(process.env.MONGODB_URL);

  const cryptr = new Cryptr(requireAuthSecret());
  const encryptedPassword = cryptr.encrypt(newPassword);

  const user = await UserModel.findOneAndUpdate(
    { email: email.toLowerCase() },
    {
      password: encryptedPassword,
      isVerified: true,
    },
    { new: true }
  ).select("email role isVerified");

  if (!user) {
    throw new Error(`User not found: ${email}`);
  }

  console.log(`Password reset for ${user.email} (${user.role})`);
}

resetPassword()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect().catch(() => {});
  });
