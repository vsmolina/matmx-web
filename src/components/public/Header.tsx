"use client";

import Link from "next/link";

export default function Header() {
  return (
    <header className="w-full shadow-md bg-white px-6 py-4 flex justify-between items-center sticky top-0 z-50">
      <div className="text-xl font-bold text-[#003cc5]">MatMX</div>
      <nav className="space-x-6">
        <Link href="/about" className="hover:text-[#003cc5]">About</Link>
        <Link href="/products" className="hover:text-[#003cc5]">Products</Link>
        <Link href="/contact" className="hover:text-[#003cc5]">Contact</Link>
      </nav>
    </header>
  );
}