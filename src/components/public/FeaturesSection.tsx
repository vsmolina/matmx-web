"use client";

const features = [
  { title: "Fast Delivery", description: "Next-day delivery in El Paso and Juarez." },
  { title: "Trusted Vendors", description: "We only source from certified manufacturers." },
  { title: "Responsive Support", description: "Our bilingual reps are ready to help." },
];

export default function FeaturesSection() {
  return (
    <section className="bg-white px-6 py-12">
      <h2 className="text-3xl font-semibold text-center text-[#003cc5] mb-8">Why Choose MatMX</h2>
      <div className="grid gap-8 md:grid-cols-3">
        {features.map((feature, idx) => (
          <div key={idx} className="text-center">
            <div className="text-xl font-bold text-gray-800 mb-2">{feature.title}</div>
            <p className="text-gray-600">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}