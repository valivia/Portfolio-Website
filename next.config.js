/** @type {import('next').NextConfig} */

const securityHeaders = [
  //  { key: "Content-Security-Policy", value: "default -src 'self'" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
];

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
    domains: ["portfolio.xayania.com"],
  },
  i18n: {
    locales: ["en"],
    defaultLocale: "en",
  },
  async headers() {
    return [
      {
        source: "/browse",
        headers: securityHeaders,
      },
    ];
  },
});
