// Client for the public Contact page — POSTs to the backend's contact intake.
// Anonymous (no admin bearer token, no x-app-key): the marketing site isn't
// the chat surface, so it just hits the open POST /api/contact endpoint.

import { apiRequest } from "./http";

export async function submitContact(input: {
  name: string;
  email: string;
  message: string;
}): Promise<void> {
  await apiRequest<{ ok: boolean; id: string }>("/api/contact", {
    body: input,
    anonymous: true,
  });
}
