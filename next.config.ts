import { withWhopAppConfig } from "@whop/react/next.config";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	/* config options here */
	images: {
		remotePatterns: [{ hostname: "**" }],
	},
	env: {
		// Explicitly expose server-side environment variables
		SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY, // Workaround: Vercel blocks "SERVICE_ROLE"
		SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
		SUPABASE_KEY: process.env.SUPABASE_KEY,
	},
};

export default withWhopAppConfig(nextConfig);
