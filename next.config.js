/** @type {import('next').NextConfig} */

const withMDX = require("@next/mdx")({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
    providerImportSource: "@mdx-js/react",
  },
});

module.exports = withMDX({
  pageExtensions: ["ts", "tsx", "js", "jsx", "md", "mdx"],
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    domains: ["xayania.com"],
  },
  i18n: {
    locales: ["en"],
    defaultLocale: "en",
  },
});
