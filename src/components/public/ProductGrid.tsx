"use client";

const sampleProducts = [
  { name: "Shrink Wrap", image: "/placeholder.jpg" },
  { name: "Corrugated Boxes", image: "/placeholder.jpg" },
  { name: "Tape Dispensers", image: "/placeholder.jpg" },
];

export default function ProductGrid() {
  return (
    <section className="bg-gray-50 px-6 py-12">
      <h2 className="text-3xl font-semibold text-center text-[#003cc5] mb-8">Our Products</h2>
      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
        {sampleProducts.map((product, index) => (
          <div key={index} className="bg-white shadow rounded p-4 text-center hover:shadow-lg transition">
            <img src={product.image} alt={product.name} className="w-full h-40 object-cover mb-4 rounded" />
            <h3 className="text-lg font-medium text-gray-800">{product.name}</h3>
          </div>
        ))}
      </div>
    </section>
  );
}
