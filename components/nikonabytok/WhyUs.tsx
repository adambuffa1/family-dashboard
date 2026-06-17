const pillars = [
  {
    number: '01',
    title: 'Slovenský výrobca',
    body: 'Každý kus nábytku vyrábame priamo v našej dielni na Slovensku. Podpora lokálneho remesla a priama kontrola kvality.',
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8" stroke="currentColor" strokeWidth="1.2">
        <path d="M20 4L36 14V26L20 36L4 26V14L20 4Z" />
        <path d="M20 4V36M4 14L36 14M4 26L36 26" strokeOpacity="0.4" />
      </svg>
    ),
  },
  {
    number: '02',
    title: 'Presne na mieru',
    body: 'Žiadne štandardné rozmery. Navrhujeme nábytok podľa vašich konkrétnych rozmerov, priestoru a štýlu.',
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8" stroke="currentColor" strokeWidth="1.2">
        <rect x="6" y="6" width="28" height="28" />
        <path d="M6 20H34M20 6V34" strokeOpacity="0.4" />
        <circle cx="20" cy="20" r="5" />
      </svg>
    ),
  },
  {
    number: '03',
    title: 'Prémiové materiály',
    body: 'MDF, HDF, HPL laminát, akrylát — materiály presne frézované na milimetre. Žiadne praskanie, žiadne krútenie, dokonalý výsledok.',
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8" stroke="currentColor" strokeWidth="1.2">
        <path d="M8 32L14 14L20 24L26 10L32 32H8Z" />
        <path d="M8 32H32" strokeOpacity="0.4" />
      </svg>
    ),
  },
  {
    number: '04',
    title: 'Kompletná služba',
    body: 'Od prvej konzultácie, cez 3D vizualizáciu, výrobu až po montáž u vás doma. Všetko zastrešíme my.',
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8" stroke="currentColor" strokeWidth="1.2">
        <circle cx="20" cy="20" r="14" />
        <path d="M13 20L18 25L27 15" />
      </svg>
    ),
  },
]

export default function WhyUs() {
  return (
    <section id="o-nas" className="py-24 lg:py-36 bg-cream-200">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Two-column intro */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-24 items-center">
          {/* Left: image */}
          <div className="relative aspect-[4/5] overflow-hidden">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=900&q=80')",
              }}
            />
            {/* Gold accent border */}
            <div className="absolute -bottom-4 -right-4 w-2/3 h-2/3 border-2 border-gold-400 pointer-events-none" />
            {/* Stat badge */}
            <div className="absolute top-8 -right-6 bg-charcoal-900 text-white p-6 text-center">
              <div
                className="text-5xl text-gold-400 font-light"
                style={{ fontFamily: 'var(--font-cormorant), Georgia, serif' }}
              >
                20
              </div>
              <div className="text-[9px] tracking-[0.25em] uppercase text-white/50 font-sans mt-1">
                Rokov
                <br />
                skúseností
              </div>
            </div>
          </div>

          {/* Right: text */}
          <div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-8 h-px bg-gold-500" />
              <span className="section-label">Prečo Niko Nábytok</span>
            </div>
            <h2 className="heading-lg mb-6">
              Výroba, kde každý
              <br />
              <em className="not-italic italic text-gold-600">
                milimeter hrá rolu
              </em>
            </h2>
            <p className="body-text mb-6 leading-loose">
              Nie sme veľkoskladový eshop s katalógom tisícok kusov. Sme
              výrobca s dielňou, CNC strojmi a rokmi skúseností. Pracujeme
              s MDF, HDF a modernými povrchovými úpravami — pretože dnešný
              kvalitný nábytok nevyžaduje masív, ale presnosť.
            </p>
            <p className="body-text mb-10 leading-loose">
              Spolupracujeme s architektmi, dizajnérmi aj priamo so zákazníkmi.
              Vaša predstava + naša výroba = nábytok presne na váš priestor,
              ktorý tu bude desaťročia.
            </p>
            <a href="#kontakt" className="btn-primary">
              Začnite konzultáciu
            </a>
          </div>
        </div>

        {/* Pillars grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {pillars.map((p) => (
            <div
              key={p.number}
              className="group p-8 bg-cream-50 hover:bg-charcoal-900 transition-colors duration-500 relative overflow-hidden"
            >
              {/* Number watermark */}
              <div
                className="absolute -top-4 -right-2 text-[5rem] font-light text-stone-300/30 group-hover:text-white/5 transition-colors select-none"
                style={{ fontFamily: 'var(--font-cormorant), Georgia, serif' }}
              >
                {p.number}
              </div>

              <div className="text-stone-400 group-hover:text-gold-400 mb-6 transition-colors duration-500">
                {p.icon}
              </div>

              <h3
                className="text-xl text-charcoal-900 group-hover:text-white mb-3 transition-colors duration-500"
                style={{ fontFamily: 'var(--font-cormorant), Georgia, serif' }}
              >
                {p.title}
              </h3>

              <p className="text-sm text-stone-500 group-hover:text-white/60 leading-relaxed transition-colors duration-500 font-sans">
                {p.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
