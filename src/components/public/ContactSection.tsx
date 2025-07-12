"use client";

export default function ContactSection() {
  return (
    <section className="bg-gray-100 px-6 py-12">
      <h2 className="text-3xl font-semibold text-center text-[#003cc5] mb-6">Get in Touch</h2>
      <form className="max-w-xl mx-auto space-y-4">
        <input type="text" placeholder="Name" className="w-full border p-3 rounded" />
        <input type="email" placeholder="Email" className="w-full border p-3 rounded" />
        <textarea placeholder="Message" rows={4} className="w-full border p-3 rounded" />
        <button type="submit" className="bg-[#003cc5] text-white px-6 py-3 rounded hover:bg-blue-700 transition">
          Send Message
        </button>
      </form>
    </section>
  );
}