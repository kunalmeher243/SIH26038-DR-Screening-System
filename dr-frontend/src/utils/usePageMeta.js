import { useEffect } from "react";

/**
 * Custom hook to dynamically manage document title and meta description tags.
 * 
 * @param {Object} options
 * @param {string} options.title - Document title (e.g. "SERIX Health | AI Retinal Screening")
 * @param {string} [options.description] - SEO meta description
 */
export default function usePageMeta({ title, description }) {
  useEffect(() => {
    if (title) {
      document.title = title;
    }

    if (description) {
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement("meta");
        metaDesc.name = "description";
        document.head.appendChild(metaDesc);
      }
      metaDesc.content = description;

      let ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc) {
        ogDesc.content = description;
      }
    }
  }, [title, description]);
}
