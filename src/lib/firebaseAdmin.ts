/**
 * Firebase Admin Credentials Service
 * Manages admin user accounts stored in Firebase Realtime Database
 * 
 * Database Structure:
 * /admins
 *   /admin1
 *     username: "admin"
 *     email: "admin@example.com"
 *     passwordHash: "$2b$10$..." (bcrypt hashed)
 *     createdAt: timestamp
 *     lastLogin: timestamp
 */

import { ref, get, set, update, query, orderByChild, equalTo } from "firebase/database";
import { database } from "./firebase";

export interface AdminUser {
  username: string;
  email: string;
  passwordHash: string;
  createdAt: number;
  lastLogin?: number;
}

/**
 * Get admin user by username
 */
export async function getAdminByUsername(username: string): Promise<AdminUser | null> {
  try {
    const adminsRef = ref(database, "admins");
    const snapshot = await get(adminsRef);

    if (!snapshot.exists()) {
      return null;
    }

    const admins = snapshot.val();
    const adminKey = Object.keys(admins).find(
      (key) => admins[key].username === username
    );

    return adminKey ? admins[adminKey] : null;
  } catch (error) {
    console.error("Error fetching admin user:", error);
    throw error;
  }
}

/**
 * Create a new admin user in Firebase
 * Note: Password should be hashed before calling this function
 */
export async function createAdminUser(
  username: string,
  email: string,
  passwordHash: string
): Promise<void> {
  try {
    // Check if username already exists
    const existingAdmin = await getAdminByUsername(username);
    if (existingAdmin) {
      throw new Error("Username already exists");
    }

    const adminId = username.toLowerCase().replace(/[^a-z0-9]/g, "");
    const adminRef = ref(database, `admins/${adminId}`);

    const adminData: AdminUser = {
      username,
      email,
      passwordHash,
      createdAt: Date.now(),
    };

    await set(adminRef, adminData);
    console.log(`Admin user "${username}" created successfully`);
  } catch (error) {
    console.error("Error creating admin user:", error);
    throw error;
  }
}

/**
 * Update last login timestamp for an admin user
 */
export async function updateLastLogin(username: string): Promise<void> {
  try {
    const adminsRef = ref(database, "admins");
    const snapshot = await get(adminsRef);

    if (!snapshot.exists()) {
      return;
    }

    const admins = snapshot.val();
    const adminKey = Object.keys(admins).find(
      (key) => admins[key].username === username
    );

    if (adminKey) {
      const userRef = ref(database, `admins/${adminKey}`);
      await update(userRef, { lastLogin: Date.now() });
    }
  } catch (error) {
    console.error("Error updating last login:", error);
    throw error;
  }
}

/**
 * Get all admin users
 */
export async function getAllAdmins(): Promise<AdminUser[]> {
  try {
    const adminsRef = ref(database, "admins");
    const snapshot = await get(adminsRef);

    if (!snapshot.exists()) {
      return [];
    }

    const admins = snapshot.val();
    return Object.values(admins) as AdminUser[];
  } catch (error) {
    console.error("Error fetching all admins:", error);
    throw error;
  }
}

/**
 * Delete an admin user
 */
export async function deleteAdminUser(username: string): Promise<void> {
  try {
    const adminsRef = ref(database, "admins");
    const snapshot = await get(adminsRef);

    if (!snapshot.exists()) {
      return;
    }

    const admins = snapshot.val();
    const adminKey = Object.keys(admins).find(
      (key) => admins[key].username === username
    );

    if (adminKey) {
      const userRef = ref(database, `admins/${adminKey}`);
      await set(userRef, null); // Delete by setting to null
      console.log(`Admin user "${username}" deleted successfully`);
    }
  } catch (error) {
    console.error("Error deleting admin user:", error);
    throw error;
  }
}

/**
 * Update admin user password
 * Note: New password should be hashed before calling this function
 */
export async function updateAdminPassword(
  username: string,
  newPasswordHash: string
): Promise<void> {
  try {
    const adminsRef = ref(database, "admins");
    const snapshot = await get(adminsRef);

    if (!snapshot.exists()) {
      return;
    }

    const admins = snapshot.val();
    const adminKey = Object.keys(admins).find(
      (key) => admins[key].username === username
    );

    if (adminKey) {
      const userRef = ref(database, `admins/${adminKey}`);
      await update(userRef, { passwordHash: newPasswordHash });
      console.log(`Password updated for admin user "${username}"`);
    }
  } catch (error) {
    console.error("Error updating admin password:", error);
    throw error;
  }
}
