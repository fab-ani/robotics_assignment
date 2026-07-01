const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export async function postImage(
  endpoint: string,
  file: File,
  extraFields?: Record<string, string>
) {
  const form = new FormData();
  form.append("image", file);
  if (extraFields) {
    for (const [key, value] of Object.entries(extraFields)) {
      form.append(key, value);
    }
  }
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error || "Request failed");
  }
  return res.json();
}
