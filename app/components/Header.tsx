export default function Header() {
  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          <span className="text-xl font-bold text-gray-900 tracking-tight">
            she<span className="text-violet-600">tix</span>
          </span>
        </div>
        <p className="hidden sm:block text-sm text-gray-500 font-medium">
          Women&apos;s sports tickets, all in one place
        </p>
        <nav className="flex items-center gap-6">
          <a href="#" className="text-sm font-medium text-gray-500 hover:text-violet-600 transition-colors">
            About
          </a>
          <a
            href="#"
            className="text-sm font-medium bg-violet-600 text-white px-4 py-2 rounded-full hover:bg-violet-700 transition-colors"
          >
            List an event
          </a>
        </nav>
      </div>
    </header>
  )
}
