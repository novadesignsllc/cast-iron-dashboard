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
      <div className="max-w-2xl mx-auto bg-white border border-[#E5E0D8] rounded-xl p-8 shadow-sm">
        {isCredentialError ? (
          <>
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-4">
              <span className="text-2xl">🔑</span>
            </div>
            <h2 className="text-xl font-bold text-[#1C1C1C] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
              Supabase Not Configured
            </h2>
            <p className="text-[#6B6B6B] mb-4">
              Add your Supabase credentials to <code className="bg-[#F9F6F1] px-1.5 py-0.5 rounded text-sm font-mono">.env.local</code> to connect to the database.
            </p>
            <div className="bg-[#F9F6F1] border border-[#E5E0D8] rounded-lg p-4 font-mono text-sm space-y-1">
              <p className="text-[#6B6B6B]">NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co</p>
              <p className="text-[#6B6B6B]">NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...</p>
              <p className="text-[#6B6B6B]">SUPABASE_SERVICE_ROLE_KEY=eyJ...</p>
            </div>
            <p className="text-xs text-[#6B6B6B] mt-3">After adding credentials, restart the dev server.</p>
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold text-[#C0392B] mb-2">Something went wrong</h2>
            <p className="text-[#6B6B6B] mb-4 text-sm font-mono">{error.message}</p>
            <button
              onClick={reset}
              className="px-4 py-2 text-sm font-medium text-white rounded-lg"
              style={{ background: '#B87333' }}
            >
              Try again
            </button>
          </>
        )}
      </div>
    </div>
  )
}
