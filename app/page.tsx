import Navbar from '@/components/nikonabytok/Navbar'
import Hero from '@/components/nikonabytok/Hero'
import Stats from '@/components/nikonabytok/Stats'
import Services from '@/components/nikonabytok/Services'
import WhyUs from '@/components/nikonabytok/WhyUs'
import Process from '@/components/nikonabytok/Process'
import Gallery from '@/components/nikonabytok/Gallery'
import Materials from '@/components/nikonabytok/Materials'
import Testimonials from '@/components/nikonabytok/Testimonials'
import Contact from '@/components/nikonabytok/Contact'
import Footer from '@/components/nikonabytok/Footer'

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Stats />
      <Services />
      <WhyUs />
      <Process />
      <Gallery />
      <Materials />
      <Testimonials />

      {/* Mid-page CTA banner */}
      <section
        className="relative py-24 lg:py-32 overflow-hidden"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=1920&q=80')",
          backgroundAttachment: 'fixed',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-charcoal-900/75" />
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-8 h-px bg-gold-500" />
            <span className="section-label text-gold-400">Začnite ešte dnes</span>
            <div className="w-8 h-px bg-gold-500" />
          </div>
          <h2
            className="text-white font-light mb-6"
            style={{
              fontFamily: 'var(--font-cormorant), Georgia, serif',
              fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
              lineHeight: 1.1,
            }}
          >
            Váš vysnívaný nábytok
            <br />
            <em className="not-italic italic text-gold-300">
              je na dosah ruky
            </em>
          </h2>
          <p className="text-white/60 font-sans max-w-lg mx-auto mb-10 leading-loose">
            Konzultácia je zdarma a nezáväzná. Spoločne nájdeme riešenie,
            ktoré bude sedieť vášmu priestoru, štýlu aj rozpočtu.
          </p>
          <a href="#kontakt" className="btn-gold">
            Konzultovať zadarmo
          </a>
        </div>
      </section>

      <Contact />
      <Footer />
    </main>
  )
}
