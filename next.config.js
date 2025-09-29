/** @type {import('next').NextConfig} */
const nextConfig = (() => {
  const base = {
    reactStrictMode: true,
    experimental: {
      typedRoutes: true,
    },
  };

  // Allow Next/Image to optimize images from Supabase Storage if URL is provided
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (supabaseUrl) {
      const { hostname, protocol } = new URL(supabaseUrl);
      return {
        ...base,
        images: {
          remotePatterns: [
            { protocol: (protocol || 'https:').replace(':', ''), hostname },
          ],
        },
      };
    }
  } catch (_) {
    // ignore parse errors and fall back to base config
  }

  return base;
})();

module.exports = nextConfig
