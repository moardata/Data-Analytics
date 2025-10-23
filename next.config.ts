import { withWhopAppConfig } from "@whop/react/next.config";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	/* config options here */
	images: {
		remotePatterns: [{ hostname: "**" }],
	},
	// Force server-side env vars to be available at runtime
	serverRuntimeConfig: {
		OPENAI_API_KEY: process.env.OPENAI_API_KEY,
		SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY,
		SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
		SUPABASE_KEY: process.env.SUPABASE_KEY,
		SUPABASE_ADMIN_KEY: process.env.SUPABASE_ADMIN_KEY,
		SUPABASE_SERVER_KEY: process.env.SUPABASE_SERVER_KEY,
		DB_KEY: process.env.DB_KEY,
	},
	env: {
		// Explicitly expose server-side environment variables
		OPENAI_API_KEY: process.env.OPENAI_API_KEY,
		SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY,
		SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
		SUPABASE_KEY: process.env.SUPABASE_KEY,
		SUPABASE_ADMIN_KEY: process.env.SUPABASE_ADMIN_KEY,
		SUPABASE_SERVER_KEY: process.env.SUPABASE_SERVER_KEY,
		DB_KEY: process.env.DB_KEY,
	},
};

export default withWhopAppConfig(nextConfig);
