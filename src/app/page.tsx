import Hero from "@/components/Hero"
import About from "@/components/About"
import Contact from "@/components/Contact"
import Footer from "@/components/Footer"
import Navbar from "@/components/Navbar"
import ProductCarousel from "@/components/ProductCarousel"

const sampleProducts = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  name: `Product ${i + 1}`,
  description: `Description for Product ${i + 1}`,
}))

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex flex-col items-center justify-center">
        <Hero />
        <ProductCarousel products={sampleProducts} />
        <About />
        <Contact />
      </main>
      <Footer />
    </>
  )
}