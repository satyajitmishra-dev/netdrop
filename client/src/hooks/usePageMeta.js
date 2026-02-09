import { useEffect } from "react";

const DEFAULT_SITE_URL = "https://netdrop.site";
const DEFAULT_IMAGE = "https://netdrop.site/og-image.png";

const ensureMetaTag = (attr, value) => {
  let tag = document.querySelector(`meta[${attr}="${value}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attr, value);
    document.head.appendChild(tag);
  }
  return tag;
};

const ensureLinkTag = (rel) => {
  let tag = document.querySelector(`link[rel="${rel}"]`);
  if (!tag) {
    tag = document.createElement("link");
    tag.setAttribute("rel", rel);
    document.head.appendChild(tag);
  }
  return tag;
};

const buildUrl = (baseUrl, path) => {
  if (!path) return baseUrl;
  if (path.startsWith("http")) return path;
  return `${baseUrl}${path.startsWith("/") ? "" : "/"}${path}`;
};

export const usePageMeta = ({
  title,
  description,
  path,
  image = DEFAULT_IMAGE,
  noIndex = false,
  siteUrl = DEFAULT_SITE_URL
}) => {
  useEffect(() => {
    const url = buildUrl(siteUrl, path);

    if (title) document.title = title;

    if (description) {
      ensureMetaTag("name", "description").setAttribute("content", description);
    }

    ensureMetaTag("name", "robots").setAttribute(
      "content",
      noIndex ? "noindex, nofollow" : "index, follow"
    );

    ensureLinkTag("canonical").setAttribute("href", url);

    ensureMetaTag("property", "og:type").setAttribute("content", "website");
    ensureMetaTag("property", "og:url").setAttribute("content", url);
    if (title) ensureMetaTag("property", "og:title").setAttribute("content", title);
    if (description) {
      ensureMetaTag("property", "og:description").setAttribute("content", description);
    }
    ensureMetaTag("property", "og:image").setAttribute("content", image);

    ensureMetaTag("name", "twitter:card").setAttribute("content", "summary_large_image");
    if (title) ensureMetaTag("name", "twitter:title").setAttribute("content", title);
    if (description) {
      ensureMetaTag("name", "twitter:description").setAttribute("content", description);
    }
    ensureMetaTag("name", "twitter:image").setAttribute("content", image);
  }, [title, description, path, image, noIndex, siteUrl]);
};
