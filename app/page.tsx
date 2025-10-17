/**
 * Whop App Entry Point
 * Redirects to analytics since Whop apps are embedded
 */

import { redirect } from 'next/navigation';

export default function Page() {
  // Whop apps are embedded - redirect to analytics
  redirect('/analytics');
}

