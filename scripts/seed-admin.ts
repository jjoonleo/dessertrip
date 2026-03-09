import { connectToDatabase } from "../lib/mongodb";
import { upsertPredefinedAdminUser } from "../lib/services/admin-users";

async function main() {
  const { ADMIN_USERNAME, ADMIN_PASSWORD } = process.env;

  if (!ADMIN_USERNAME || !ADMIN_PASSWORD) {
    throw new Error("ADMIN_USERNAME and ADMIN_PASSWORD must be set.");
  }

  await connectToDatabase();
  const adminUser = await upsertPredefinedAdminUser({
    username: ADMIN_USERNAME,
    password: ADMIN_PASSWORD,
  });

  console.log(`Seeded admin user ${adminUser.username}.`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
