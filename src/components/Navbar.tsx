export default function Navbar() {
    return (
      <nav className="w-full bg-black text-white p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold tracking-wide">MatMX</h1>
          <ul className="flex space-x-6 text-sm">
            <li><a href="#about" className="hover:text-brand">About</a></li>
            <li><a href="#contact" className="hover:text-brand">Contact</a></li>
          </ul>
        </div>
      </nav>
    )
  }