export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          AI Dialer Dashboard
        </h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">Production</span>
          <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
        </div>
      </div>
    </header>
  );
}

