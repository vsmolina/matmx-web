import Link from "next/link"

export default function Footer() {
  return (
    <footer className="bg-black text-white text-sm py-6 px-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-center md:text-left">
          <p className="font-semibold">© {new Date().getFullYear()} MatMX LLC</p>
          <p className="text-xs text-gray-400">All rights reserved.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-2 md:gap-6 items-center text-gray-400 text-xs">
          <Link href="/terms" className="hover:text-white transition">Terms</Link>
          <Link href="/privacy" className="hover:text-white transition">Privacy</Link>
          <Link href="/admin-login" className="hover:text-white transition underline">
            Admin Login
          </Link>
        </div>
      </div>
    </footer>
  )
}