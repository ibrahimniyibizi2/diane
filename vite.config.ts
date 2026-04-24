// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { VitePWA } from "vite-plugin-pwa";
import { nitro } from "nitro/vite";

export default defineConfig({
  vite: {
    css: {
      transformer: "lightningcss",
    },
    server: {
      port: 8080,
      strictPort: false,
      hmr: {
        overlay: false
      }
    },
    plugins: [
      nitro(),
      VitePWA({
        registerType: "autoUpdate",
        includeAssets: ["favicon.svg"],
        workbox: {
          runtimeCaching: [
            {
              urlPattern: ({ url }) => url.pathname.startsWith("/"),
              handler: "NetworkFirst",
              options: {
                cacheName: "salon-flow-cache",
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 24 * 60 * 60, // 24 hours
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: ({ request }) => request.destination === "image",
              handler: "CacheFirst",
              options: {
                cacheName: "salon-flow-images",
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
                },
              },
            },
          ],
        },
        manifest: {
          name: "Salon Flow",
          short_name: "Salon",
          description: "All-in-one salon management for hair salons and barbershops",
          start_url: "/",
          display: "standalone",
          background_color: "#ffffff",
          theme_color: "#000000",
          icons: [
            {
              src: "/favicon.svg",
              sizes: "192x192",
              type: "image/svg+xml"
            },
            {
              src: "/favicon.svg",
              sizes: "512x512",
              type: "image/svg+xml"
            }
          ]
        }
      })
    ]
  }
});
