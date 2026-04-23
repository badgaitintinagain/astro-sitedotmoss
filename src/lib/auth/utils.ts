// Simple auth utilities for admin-only access
import bcrypt from 'bcryptjs';

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    // แปลงอักขระพิเศษและช่องว่างเป็น dash
    .replace(/[^\w\s-]/g, '') // เอาอักขระพิเศษออก แต่เก็บตัวเลข ตัวอักษร space และ dash
    .replace(/[\s_]+/g, '-') // แปลง space และ underscore เป็น dash
    .replace(/-+/g, '-') // ลบ dash ซ้ำๆ
    .replace(/^-+|-+$/g, ''); // ตัด dash ที่ต้นและท้าย
}

// Session management (simple cookie-based for demo)
export interface Session {
  userId: string;
  email: string;
  name: string;
  role: string;
}
