/**
 * Refined Home Page
 * Clean, minimal welcome screen
 */

import Link from 'next/link';
import { BarChart3, FileText, Sparkles, ArrowRight, Users, DollarSign, Activity, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Page() {
	return (
		<div className="min-h-screen bg-gradient-to-b from-[#0d0f12] to-[#14171c] p-8">
			<div className="max-w-5xl mx-auto space-y-12">
				{/* Hero */}
				<div className="text-center space-y-4">
					<div className="inline-flex items-center gap-3 mb-2">
						<div className="w-10 h-10 rounded-lg bg-[#10B981] flex items-center justify-center">
							<BarChart3 className="h-6 w-6 text-white" />
						</div>
						<h1 className="text-3xl font-bold text-[#E5E7EB]">
							Creator Analytics
						</h1>
					</div>
					<p className="text-[#9AA4B2] max-w-xl mx-auto">
						Modern analytics platform for Whop course creators
					</p>
				</div>

				{/* Quick Stats */}
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
					{[
						{ icon: Users, label: 'Students', value: '4', color: 'indigo' },
						{ icon: DollarSign, label: 'Revenue', value: '$250', color: 'emerald' },
						{ icon: Target, label: 'Active', value: '3', color: 'blue' },
						{ icon: Activity, label: 'Engagement', value: '67%', color: 'orange' },
					].map((stat) => {
						const Icon = stat.icon;
						return (
							<Card key={stat.label}>
								<CardContent className="p-4 text-center">
									<Icon className="h-5 w-5 mx-auto mb-2 text-neutral-500" />
									<div className="text-xl font-bold text-neutral-900 dark:text-neutral-50">
										{stat.value}
									</div>
									<p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
										{stat.label}
									</p>
								</CardContent>
							</Card>
						);
					})}
				</div>

				{/* Features */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					{[
						{ 
							icon: BarChart3, 
							title: 'Analytics Dashboard', 
							description: 'Track students, revenue, and engagement',
							href: '/analytics'
						},
						{ 
							icon: FileText, 
							title: 'Custom Forms', 
							description: 'Collect student feedback and data',
							href: '/forms'
						},
						{ 
							icon: Sparkles, 
							title: 'AI Insights', 
							description: 'Get smart recommendations',
							href: '/insights'
						},
					].map((feature) => {
						const Icon = feature.icon;
						return (
							<Card key={feature.title} className="group hover:shadow-md transition-shadow">
								<CardHeader>
									<Icon className="h-6 w-6 text-indigo-600 mb-2" />
									<CardTitle>{feature.title}</CardTitle>
									<CardDescription>{feature.description}</CardDescription>
								</CardHeader>
								<CardContent>
									<Button variant="ghost" size="sm" asChild className="w-full justify-start">
										<Link href={feature.href}>
											View <ArrowRight className="h-4 w-4 ml-auto" />
										</Link>
									</Button>
								</CardContent>
							</Card>
						);
					})}
				</div>

				{/* Setup Status */}
				<Card>
					<CardHeader>
						<CardTitle>Quick Setup</CardTitle>
						<CardDescription>Get started in minutes</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3">
						{[
							{ step: '1', title: 'App Running', status: 'complete', description: 'Analytics platform is live' },
							{ step: '2', title: 'Configure Webhooks', status: 'pending', description: 'Connect Whop events' },
							{ step: '3', title: 'Deploy', status: 'pending', description: 'Launch on whopanalytics.xyz' },
						].map((item) => (
							<div key={item.step} className="flex items-center gap-3 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-900">
								<div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
									item.status === 'complete' 
										? 'bg-emerald-600 text-white' 
										: 'bg-neutral-200 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400'
								}`}>
									{item.status === 'complete' ? '✓' : item.step}
								</div>
								<div className="flex-1">
									<p className="text-sm font-medium text-neutral-900 dark:text-neutral-50">{item.title}</p>
									<p className="text-xs text-neutral-600 dark:text-neutral-400">{item.description}</p>
								</div>
							</div>
						))}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

