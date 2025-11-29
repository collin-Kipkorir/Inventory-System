#!/usr/bin/env node

/**
 * Admin User Creation Script
 * 
 * Usage: node scripts/createAdmin.js
 * 
 * This script helps you create admin credentials in Firebase Realtime Database
 * It guides you through the process interactively
 */

const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function main() {
  console.log("\n╔════════════════════════════════════════════════════╗");
  console.log("║        Firebase Admin Credentials Creator          ║");
  console.log("╚════════════════════════════════════════════════════╝\n");

  console.log("This script will help you create admin credentials.\n");

  const username = await question("Enter admin username: ");
  const email = await question("Enter admin email: ");
  const password = await question("Enter admin password: ");
  const confirmPassword = await question("Confirm password: ");

  // Validation
  if (password !== confirmPassword) {
    console.error("\n✗ Passwords do not match!");
    process.exit(1);
  }

  if (username.length < 3) {
    console.error("\n✗ Username must be at least 3 characters!");
    process.exit(1);
  }

  if (password.length < 6) {
    console.error("\n✗ Password must be at least 6 characters!");
    process.exit(1);
  }

  // Generate bcrypt hash (requires bcryptjs to be installed)
  try {
    const bcrypt = require("bcryptjs");

    console.log("\n⏳ Hashing password...");
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    console.log("\n✓ Admin credentials ready:\n");
    console.log("─".repeat(50));
    console.log(`Username:     ${username}`);
    console.log(`Email:        ${email}`);
    console.log(`Password Hash: ${passwordHash}`);
    console.log("─".repeat(50));

    console.log("\n📝 Next steps:\n");
    console.log("1. Go to Firebase Console > Realtime Database");
    console.log("2. Create path: /admins/admin_user_1 (or similar)");
    console.log("3. Add this JSON:");
    console.log(
      JSON.stringify(
        {
          username,
          email,
          passwordHash,
          createdAt: Date.now(),
        },
        null,
        2
      )
    );

    console.log("\n4. Save and test login with these credentials");
    console.log("5. Update password in Firebase if needed\n");

    rl.close();
  } catch (error) {
    if (error.code === "MODULE_NOT_FOUND") {
      console.error(
        "\n✗ bcryptjs is not installed. Run: npm install bcryptjs"
      );
    } else {
      console.error("\n✗ Error:", error.message);
    }
    process.exit(1);
  }
}

main();
