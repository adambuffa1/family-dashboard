const materials = [
  {
    name: 'Dubový masív',
    desc: 'Trvanlivý, teplý a vznešený. Najobľúbenejší materiál pre kuchyne a obývačkové prvky.',
    tag: 'Prémiový',
    color: '#C4956A',
  },
  {
    name: 'Brestová dýha',
    desc: 'Prirodzená kresba dreva na MDF jadre. Estetika masívu pri nižšej váhe.',
    tag: 'Populárny',
    color: '#A8836E',
  },
  {
    name: 'Matný lak',
    desc: 'Moderný, ľahko udržiavateľný povrch v akejkoľvek farbe z RAL palety.',
    tag: 'Univerzálny',
    color: '#8C8278',
  },
  {
    name: 'HPL laminát',
    desc: 'Vysokoodolný povrch pre kúpeľne a pracovné plochy. Odolný voči vlhkosti aj škrabaniu.',
    tag: 'Odolný',
    color: '#6A6260',
  },
]

export default function Materials() {
  return (
    <section className="py-24 lg:py-32 bg-cream-200">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: text */}
          <div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-8 h-px bg-gold-500" />
              <span className="section-label">Materiály</span>
            </div>
            <h2 className="heading-lg mb-6">
              Vyrábame z toho
              <br />
              <em className="not-italic italic text-gold-600">
                čo vydrží desaťročia
              </em>
            </h2>
            <p className="body-text mb-10 leading-loose">
              Na rozdiel od katalógového nábytku z lacných lisovaných dosiek,
              pracujeme s overenými materiálmi. Všetky povrchy sú otestované
              na odolnosť, ľahkú údržbu a dlhovekosť.
            </p>

            {/* Material swatches */}
            <div className="flex flex-col gap-4">
              {materials.map((mat) => (
                <div
                  key={mat.name}
                  className="group flex items-start gap-4 p-4 hover:bg-cream-100 transition-colors duration-300 -mx-4"
                >
                  {/* Color swatch */}
                  <div
                    className="w-12 h-12 rounded-sm flex-shrink-0 mt-0.5"
                    style={{ backgroundColor: mat.color }}
                  />
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span
                        className="text-charcoal-900 font-light text-lg"
                        style={{ fontFamily: 'var(--font-cormorant), Georgia, serif' }}
                      >
                        {mat.name}
                      </span>
                      <span className="text-[9px] tracking-[0.2em] uppercase text-gold-500 font-sans">
                        {mat.tag}
                      </span>
                    </div>
                    <p className="text-sm text-stone-500 font-sans leading-relaxed">
                      {mat.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: image with overlapping elements */}
          <div className="relative">
            <div className="aspect-[3/4] overflow-hidden">
              <div
                className="w-full h-full bg-cover bg-center"
                style={{
                  backgroundImage:
                    "url('https://images.unsplash.com/photo-1542621334-a254cf47733d?auto=format&fit=crop&w=900&q=80')",
                }}
              />
            </div>

            {/* Floating quote */}
            <div className="absolute -bottom-8 -left-8 bg-charcoal-900 text-white p-8 max-w-xs">
              <p
                className="text-xl font-light italic text-gold-300 leading-snug mb-4"
                style={{ fontFamily: 'var(--font-cormorant), Georgia, serif' }}
              >
                "Drevo je živý materiál. Rešpektujeme ho — a tvorí nám to lepší nábytok."
              </p>
              <span className="text-[9px] tracking-[0.25em] uppercase text-white/40 font-sans">
                — Tím Niko Nábytok
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
