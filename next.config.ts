import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,

  /*
   * Required for the Docker image.
   *
   * Traces the app and only the dependencies it actually uses into
   * `.next/standalone`, which is what the container runs. Without it the image
   * has to carry the whole node_modules tree — roughly 400MB instead of ~180MB,
   * on every deploy.
   *
   * Note this app CANNOT be a static export: /api/consultation is a real
   * server route, so it needs a Node process.
   */
  output: 'standalone',

  /*
   * Force sharp into the standalone bundle.
   *
   * Next loads sharp at RUNTIME to optimise images rather than importing it, so
   * the dependency tracer does not see it and leaves it out. The container then
   * starts cleanly and only fails when the first image is requested — the worst
   * kind of failure, because the deploy looks successful.
   *
   * @img/* holds the platform-specific binaries. Inside the Docker build these
   * resolve to the linux-musl builds, which is what the Alpine runtime needs.
   */
  outputFileTracingIncludes: {
    '/**': ['./node_modules/sharp/**/*', './node_modules/@img/**/*'],
  },

  images: {
    formats: ['image/avif', 'image/webp'],
    // Source photography is portrait-heavy; these widths cover every `sizes` we declare.
    deviceSizes: [360, 640, 828, 1080, 1280, 1600, 1920],
  },
  // The clinic map is a keyless Google Maps embed — no API key, no billing account.
  // Everything else is same-origin, so the CSP below stays tight.
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
