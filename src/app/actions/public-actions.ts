"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { addEnquiry } from "@/lib/content-store";

export async function createEnquiryAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const subject = String(formData.get("subject") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!name || !email || !message) {
    redirect("/?enquiry=error#contact");
  }

  await addEnquiry({
    name,
    email,
    phone: phone || null,
    subject: subject || null,
    message,
  });

  revalidatePath("/admin");
  redirect("/?enquiry=sent#contact");
}
