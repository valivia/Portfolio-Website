/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  images: {
    domains: ["cdn.xayania.com"],
  },
  i18n: {
    locales: ['en-UK', "en-US"],
    defaultLocale: 'en-UK',
  },
}
