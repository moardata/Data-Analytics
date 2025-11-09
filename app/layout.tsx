import { WhopApp } from "@whop/react/components";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import Script from "next/script";
import { Sidebar } from "@/components/sidebar";
import { TopBar } from "@/components/top-bar";
import { WhopClientAuth } from "@/components/WhopClientAuth";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { SidebarProvider } from "@/contexts/sidebar-context";
import { ThemeVariantProvider } from "@/contexts/theme-variant-context";
import { MainContent } from "@/components/main-content";
import { ThemeDataAttribute } from "@/components/ThemeDataAttribute";
import "./globals.css";
import "./page-transition.css";

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
		<html lang="en">
			<body className={`${inter.variable} font-sans antialiased`}>
				{/* Whop Checkout Loader Script */}
				<Script
					src="https://js.whop.com/static/checkout/loader.js"
					strategy="afterInteractive"
				/>
				
				<ErrorBoundary>
					<WhopApp>
						<WhopClientAuth>
							<ThemeVariantProvider>
								<ThemeDataAttribute />
								<SidebarProvider>
									{/* Use Frosted-UI background classes that respect Whop's theme */}
									<div className="flex min-h-screen bg-background">
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
							</ThemeVariantProvider>
						</WhopClientAuth>
					</WhopApp>
				</ErrorBoundary>
			</body>
		</html>
	);
}
