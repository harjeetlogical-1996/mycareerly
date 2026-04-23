"use server";

import { prisma } from "../lib/prisma";

export async function submitContact(formData: FormData) {
  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const subject = (formData.get("subject") as string)?.trim();
  const message = (formData.get("message") as string)?.trim();

  if (!name || !email || !subject || !message) {
    return { success: false, error: "All fields are required." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, error: "Please enter a valid email address." };
  }
  if (message.length < 20) {
    return { success: false, error: "Message is too short. Please provide more detail." };
  }

  await prisma.contactMessage.create({ data: { name, email, subject, message } });
  return { success: true, message: "Message sent! We'll get back to you within 2 business days." };
}
