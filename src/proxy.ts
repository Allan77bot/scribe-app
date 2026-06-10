import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Next.js 16 : convention « proxy » (ex-« middleware »).
// Rafraîchit la session Supabase et garde les routes protégées.
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  // Exclut les assets statiques pour ne pas rafraîchir la session sur chaque image.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|icons/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
