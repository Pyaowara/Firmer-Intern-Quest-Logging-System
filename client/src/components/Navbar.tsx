export function Navbar() {
  return (
    <nav className="flex items-center gap-4 px-6 py-3 bg-white border-b shadow-sm">
      <img src="logo.png" alt="Logo" className="h-10 w-auto" />
      <h1 className="text-xl font-semibold text-primary">Log Viewer</h1>
    </nav>
  );
}
