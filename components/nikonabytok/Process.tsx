const steps = [
  {
    num: '01',
    title: 'Konzultácia',
    body: 'Stretneme sa osobne alebo online. Prejdeme priestor, vaše predstavy a možnosti. Konzultácia je vždy zdarma.',
    detail: '≈ 45 minút',
  },
  {
    num: '02',
    title: '3D Návrh',
    body: 'Pripravíme vizualizáciu vo fotorealistickom 3D. Uvidíte presne, ako bude nábytok vyzerať vo vašom priestore.',
    detail: '3–5 dní',
  },
  {
    num: '03',
    title: 'Výroba',
    body: 'Po schválení návrhu a materiálov začíname vyrábať. Všetko prebieha v našej dielni pod priebežnou kontrolou.',
    detail: '3–6 týždňov',
  },
  {
    num: '04',
    title: 'Montáž & Odovzdanie',
    body: 'Náš tím nainštaluje nábytok u vás doma. Odovzdanie sprevádzame záručným listom a servisnou podporou.',
    detail: '1–2 dni',
  },
]

export default function Process() {
  return (
    <section className="py-24 lg:py-36 bg-charcoal-900 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="mb-20 text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="w-8 h-px bg-gold-500" />
            <span className="section-label text-gold-400">
              Ako to funguje
            </span>
            <div className="w-8 h-px bg-gold-500" />
          </div>
          <h2
            className="text-white font-light"
            style={{
              fontFamily: 'var(--font-cormorant), Georgia, serif',
              fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
            }}
          >
            Od myšlienky
            <br />
            <em className="not-italic italic text-gold-300">
              po hotový nábytok
            </em>
          </h2>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connecting line (desktop) */}
          <div className="hidden lg:block absolute top-8 left-[12.5%] right-[12.5%] h-px bg-white/10" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-6">
            {steps.map((step, i) => (
              <div key={i} className="relative flex flex-col items-center text-center lg:px-4">
                {/* Number circle */}
                <div className="relative z-10 w-16 h-16 rounded-full border border-gold-500/40 flex items-center justify-center mb-8 bg-charcoal-900 group-hover:border-gold-400 transition-colors">
                  <span
                    className="text-gold-400 text-xl font-light"
                    style={{ fontFamily: 'var(--font-cormorant), Georgia, serif' }}
                  >
                    {step.num}
                  </span>
                </div>

                {/* Content */}
                <div className="border-t border-white/10 pt-8 w-full">
                  <h3
                    className="text-white text-xl font-light mb-4"
                    style={{ fontFamily: 'var(--font-cormorant), Georgia, serif' }}
                  >
                    {step.title}
                  </h3>
                  <p className="text-white/50 text-sm font-sans leading-relaxed mb-4">
                    {step.body}
                  </p>
                  <span className="text-gold-500/60 text-[10px] tracking-[0.25em] uppercase font-sans">
                    {step.detail}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-20">
          <a href="#kontakt" className="btn-gold">
            Začnite s bezplatnou konzultáciou
          </a>
        </div>
      </div>
    </section>
  )
}
