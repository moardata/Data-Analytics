import { WhopApp } from "@whop/react/components";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import { Sidebar } from "@/components/sidebar";
import { OwnerOnlyGuard } from "@/components/OwnerOnlyGuard";
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
					<Suspense fallback={
						<div className="min-h-screen bg-gradient-to-b from-[#0d0f12] to-[#14171c] flex items-center justify-center">
							<div className="w-16 h-16 border-4 border-[#10B981] border-t-transparent rounded-full animate-spin" />
						</div>
					}>
						{/* Temporarily disabled OwnerOnlyGuard - will re-enable after testing */}
						{/* <OwnerOnlyGuard> */}
							<div className="flex min-h-screen bg-gradient-to-b from-[#0d0f12] to-[#14171c]">
								<Suspense fallback={<div className="w-64" />}>
									<Sidebar />
								</Suspense>
								<main className="flex-1 ml-64">
									{children}
								</main>
							</div>
						{/* </OwnerOnlyGuard> */}
					</Suspense>
				</WhopApp>
			</body>
		</html>
	);
}
