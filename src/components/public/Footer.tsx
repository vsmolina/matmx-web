"use client"
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#003cc5] text-white px-6 py-6 text-center">
      <p className="text-sm">&copy; {new Date().getFullYear()} MatMX. All rights reserved.</p>

      <div className="flex flex-col md:flex-row gap-2 md:gap-6 items-center text-gray-400 text-xs">
          <Link href="/admin/login" className="hover:text-white transition underline">
            Admin Login
          </Link>
        </div>
    </footer>
  );
}