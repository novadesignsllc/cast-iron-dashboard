'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const isCredentialError = error.message?.includes('credentials not configured') ||
    error.message?.includes('supabaseUrl') ||
    error.message?.includes('Invalid supabase')

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto bg-[#181818] border border-[#232323] rounded-xl p-8">
        {isCredentialError ? (
          <>
            <div className="w-12 h-12 rounded-full bg-[rgba(245,166,35,0.12)] flex items-center justify-center mb-4">
              <span className="text-2xl">🔑</span>
            </div>
            <h2 className="text-xl font-medium text-[#f0ede8] mb-2">
              Supabase Not Configured
            </h2>
            <p className="text-[#f0ede8] mb-4">
              Add your Supabase credentials to <code className="bg-[#222222] px-1.5 py-0.5 rounded text-sm font-mono text-[#4ade9a]">.env.local</code> to connect to the database.
            </p>
            <div className="bg-[#111111] border border-[#232323] rounded-lg p-4 font-mono text-sm space-y-1">
              <p className="text-[#f0ede8]">NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co</p>
              <p className="text-[#f0ede8]">NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...</p>
              <p className="text-[#f0ede8]">SUPABASE_SERVICE_ROLE_KEY=eyJ...</p>
            </div>
            <p className="text-xs text-[#444444] mt-3 font-mono">After adding credentials, restart the dev server.</p>
          </>
        ) : (
          <>
            <h2 className="text-xl font-medium text-[#f05a5a] mb-2">Something went wrong</h2>
            <p className="text-[#f0ede8] mb-4 text-sm font-mono">{error.message}</p>
            <button
              onClick={reset}
              className="px-4 py-2 text-sm font-medium text-[#0f0f0f] rounded-lg font-mono"
              style={{ background: '#4ade9a' }}
            >
              Try again
            </button>
          </>
        )}
      </div>
    </div>
  )
}
