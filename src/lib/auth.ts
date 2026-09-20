import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

const SECRET_KEY = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || "printxo-bos-secure-random-secret-key-2026"
);
export const AUTH_COOKIE_NAME = "printxo_customer_token";

export interface SessionPayload {
  customerId: string;
  customerCode: string;
  email: string;
  name: string;
  role: "CUSTOMER" | "ADMIN";
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(SECRET_KEY);
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload as unknown as SessionPayload;
  } catch (err) {
    return null;
  }
}

export async function getServerSession(): Promise<SessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    if (!token) return null;
    return verifySessionToken(token);
  } catch (err) {
    return null;
  }
}

export async function getCustomerFromSession(): Promise<any | null> {
  const session = await getServerSession();
  if (!session?.customerId) return null;

  try {
    const customer = await prisma.customer.findUnique({
      where: { id: session.customerId },
      select: {
        id: true,
        customerCode: true,
        name: true,
        email: true,
        phone: true,
        company: true,
        customerType: true,
        address: true,
        city: true,
        state: true,
        pincode: true,
        country: true,
        source: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return customer;
  } catch (err) {
    console.error("Error fetching customer from session:", err);
    return null;
  }
}
