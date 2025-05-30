import Hero from "@/components/Hero"
import About from "@/components/About"
import Contact from "@/components/Contact"
import Footer from "@/components/Footer"
import Navbar from "@/components/Navbar"

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex flex-col items-center justify-center">
        <Hero />
        <About />
        <Contact />
      </main>
      <Footer />
    </>
  )
}