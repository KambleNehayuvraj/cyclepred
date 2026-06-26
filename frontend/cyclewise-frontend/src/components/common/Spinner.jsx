const Spinner = ({ size = 'md' }) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10', xl: 'w-16 h-16' }
  return (
    <div className={`${sizes[size]} border-2 border-rose-200 border-t-rose-500 rounded-full animate-spin`} />
  )
}

export const PageLoader = () => (
  <div className="min-h-screen flex flex-col items-center justify-center gap-4">
    <div className="relative">
      <div className="w-16 h-16 border-4 border-rose-100 border-t-rose-400 rounded-full animate-spin" />
      <div className="absolute inset-0 flex items-center justify-center text-2xl">🌸</div>
    </div>
    <p className="text-warm-400 font-body text-sm">Loading CycleWise…</p>
  </div>
)

export default Spinner