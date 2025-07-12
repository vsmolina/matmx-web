"use client";

export default function Hero() {
  return (
    <section className="w-full h-[60vh] bg-gray-100 flex flex-col justify-center items-center text-center px-4">
      <h1 className="text-4xl md:text-5xl font-bold mb-4 text-[#003cc5]">Reliable Industrial Supplies</h1>
      <p className="text-lg md:text-xl text-gray-600 mb-6">Supporting manufacturing growth across the U.S.–Mexico border</p>
      <button className="bg-[#003cc5] text-white px-6 py-3 rounded-full font-medium hover:bg-blue-700 transition">Get a Quote</button>
    </section>
  );
}