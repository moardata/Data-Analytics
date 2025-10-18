import { WhopApp } from "@whop/react/components";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Sidebar } from "@/components/sidebar";
import { AccessGuard } from "@/components/AccessGuard";
import "./globals.css";

const inter = Inter({
	subsets: ["latin"],
	display: "swap",
	variable: "--font-inter",
});

export const metadata: Metadata = {
	title: "Creator Analytics - Whop",
	description: "Modern analytics platform for Whop course creators",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className="dark">
			<body className={`${inter.variable} font-sans antialiased`}>
				<WhopApp>
					<AccessGuard>
						<div className="flex min-h-screen bg-gradient-to-b from-[#0d0f12] to-[#14171c]">
							<Sidebar />
							<main className="flex-1 ml-64">
								{children}
							</main>
						</div>
					</AccessGuard>
				</WhopApp>
			</body>
		</html>
	);
}
