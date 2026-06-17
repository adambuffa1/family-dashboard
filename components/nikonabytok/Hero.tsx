export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col justify-end overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-center bg-cover"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1920&q=85')",
        }}
      />

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-charcoal-900/80 via-charcoal-900/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/90 via-charcoal-900/20 to-transparent" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 pb-20 lg:pb-32 pt-40">
        <div className="max-w-3xl">
          {/* Tag */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-8 h-px bg-gold-500" />
            <span className="text-[10px] tracking-[0.35em] uppercase text-gold-400 font-sans">
              Slovenský výrobca · Od roku 2003
            </span>
          </div>

          {/* Main heading */}
          <h1
            className="text-white font-light mb-6 leading-[1.05]"
            style={{
              fontFamily: 'var(--font-cormorant), Georgia, serif',
              fontSize: 'clamp(3rem, 8vw, 7rem)',
            }}
          >
            Nábytok, ktorý
            <br />
            <em className="text-gold-300 not-italic">vypráva</em>
            <br />
            váš príbeh.
          </h1>

          {/* Subtext */}
          <p className="text-white/65 text-lg font-sans font-light leading-relaxed mb-10 max-w-xl">
            Vyrábame nábytok na mieru presne podľa vašich predstáv —
            od kuchýň a obývačiek až po kúpeľne a kancelárie. Každý kus
            je unikátny.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-4">
            <a
              href="#kontakt"
              className="inline-block bg-gold-500 hover:bg-gold-400 text-white text-[11px] tracking-[0.25em] uppercase px-8 py-4 font-sans font-medium transition-all duration-300"
            >
              Nezáväzný dopyt
            </a>
            <a
              href="#galeria"
              className="inline-block border border-white/40 hover:border-white text-white text-[11px] tracking-[0.25em] uppercase px-8 py-4 font-sans font-medium transition-all duration-300"
            >
              Naše realizácie
            </a>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 right-8 lg:right-12 z-10 flex flex-col items-center gap-2 opacity-60">
        <span className="text-[9px] tracking-[0.3em] uppercase text-white font-sans rotate-90 origin-center translate-y-4">
          Scroll
        </span>
        <div className="w-px h-16 bg-gradient-to-b from-white to-transparent" />
      </div>
    </section>
  )
}
