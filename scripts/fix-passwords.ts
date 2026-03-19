import bcrypt from "bcryptjs";

async function main() {
  // Generate real hashes
  const adminHash = await bcrypt.hash("VisioAdmin2026!", 12);
  const lamolaHash = await bcrypt.hash("JoburgENT2026!", 12);
  const receptionHash = await bcrypt.hash("Reception2026!", 12);

  console.log("Platform Admin hash:", adminHash);
  console.log("Dr Lamola hash:", lamolaHash);
  console.log("Reception hash:", receptionHash);
}

main();
