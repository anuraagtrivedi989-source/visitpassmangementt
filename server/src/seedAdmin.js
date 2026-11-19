import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Admin from "./models/Admin.js";
import Organization from "./models/Organization.js";

if (!process.env.MONGODB_URI) throw new Error("Set MONGODB_URI in .env");
if (
  !process.env.ADMIN_EMAIL ||
  !process.env.ADMIN_PASSWORD ||
  !process.env.JWT_SECRET
)
  throw new Error("Set ADMIN_EMAIL, ADMIN_PASSWORD and JWT_SECRET in .env");
if (process.env.ADMIN_PASSWORD.length < 10)
  throw new Error("Use an admin password with at least 10 characters.");
try {
  await mongoose.connect(process.env.MONGODB_URI);
  const orgName = process.env.ORG_NAME || "Demo Organization";
  const slug = (process.env.ORG_SLUG || "demo-organization")
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-");
  const org = await Organization.findOneAndUpdate(
    { slug },
    { $set: { name: orgName, slug } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
  const email = process.env.ADMIN_EMAIL.toLowerCase().trim();
  const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12);
  await Admin.findOneAndUpdate(
    { email },
    {
      $set: {
        name: process.env.ADMIN_NAME || "Organization Admin",
        email,
        passwordHash,
        role: "admin",
        organizationId: org._id,
        isActive: true,
      },
    },
    { upsert: true, new: true, runValidators: true },
  );
  console.log(`Admin ready: ${email}; organization: ${org.name} (${org._id})`);
} finally {
  await mongoose.disconnect();
}
