/** @type {import('next').NextConfig} */
const nextConfig = {
	webpack: (config, options) => {
      config.resolve.fallback = { fs: false, net: false, tls: false, "pino-pretty": false };
        
        return config;
  },
  output: "standalone"
};

export default nextConfig;
