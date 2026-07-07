import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { Id } from "./_generated/dataModel";

const http = httpRouter();

http.route({
  pathPrefix: "/api/storage",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const storageId = url.pathname.replace("/api/storage/", "");
    
    if (!storageId) {
      return new Response("Missing storage ID", { status: 400 });
    }

    const blob = await ctx.storage.get(storageId as Id<"_storage">);
    if (!blob) {
      return new Response("Image not found", { status: 404 });
    }

    // Determine content type (default to image/jpeg if unknown)
    const headers = new Headers();
    headers.set("Cache-Control", "public, max-age=31536000"); // cache for 1 year
    
    // Add CORS headers so Next.js Image component doesn't complain
    headers.set("Access-Control-Allow-Origin", "*");
    
    return new Response(blob, {
      status: 200,
      headers,
    });
  }),
});

export default http;
