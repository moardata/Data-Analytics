import { WhopApp } from "@whop/react/components";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import { Sidebar } from "@/components/sidebar";
import { TopBar } from "@/components/top-bar";
import { WhopClientAuth } from "@/components/WhopClientAuth";
import { SidebarProvider } from "@/contexts/sidebar-context";
import { MainContent } from "@/components/main-content";
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
					<WhopClientAuth>
						<SidebarProvider>
							<div className="flex min-h-screen bg-gradient-to-b from-[#0d0f12] to-[#14171c]">
								<Suspense fallback={<div className="w-16" />}>
									<Sidebar />
								</Suspense>
								<div className="flex-1 flex flex-col">
									<TopBar />
									<MainContent>
										{children}
									</MainContent>
								</div>
							</div>
						</SidebarProvider>
					</WhopClientAuth>
				</WhopApp>
			</body>
		</html>
	);
}
