import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

// Next 16 calls this file "proxy". It adds the language prefix and remembers the choice.
export default createMiddleware(routing);

export const config = {
  // Everything except the API, Next's own files and anything with a file extension
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
