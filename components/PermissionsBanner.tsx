/**
 * Permissions Banner Component
 * Displays a warning when required OAuth scopes are missing
 */

interface PermissionsBannerProps {
  missing: string[];
}

export function PermissionsBanner({ missing }: PermissionsBannerProps) {
  if (!missing || missing.length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-4 mb-6">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <svg
            className="w-5 h-5 text-yellow-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="flex-1">
          <div className="font-medium text-yellow-200 mb-1">
            Additional permissions required
          </div>
          <div className="text-sm text-yellow-300/90">
            Grant: <span className="font-mono">{missing.join(", ")}</span> in{" "}
            <span className="font-semibold">Whop → App → Permissions</span>,
            then refresh this page.
          </div>
        </div>
      </div>
    </div>
  );
}

