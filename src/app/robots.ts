import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/dashboard/", "/admin/", "/api/", "/investor/"] },
    ],
    sitemap: "https://healthos.visiocorp.co/sitemap.xml",
  };
}
