import Header from "@/components/public/Header";
import Hero from "@/components/public/Hero";
import AboutSection from "@/components/public/AboutSection";
import ProductGrid from "@/components/public/ProductGrid";
import FeaturesSection from "@/components/public/FeaturesSection";
import ContactSection from "@/components/public/ContactSection";
import Footer from "@/components/public/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex flex-col">
        <Hero />
        <AboutSection />
        <ProductGrid />
        <FeaturesSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
