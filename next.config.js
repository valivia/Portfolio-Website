/** @type {import('next').NextConfig} */

const securityHeaders = [
  { key: "Content-Security-Policy", value: "default -src 'self'" },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' }
]


module.exports = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    domains: ["cdn.xayania.com"],
  },
  i18n: {
    locales: ['en'],
    defaultLocale: 'en',
  },
  async headers() {
    return [
      {
        source: "/browse",
        headers: securityHeaders
      }
    ]
  }
}