const materials = [
  {
    name: 'MDF',
    full: 'Medium Density Fiberboard',
    desc: 'Základný materiál pre skrinkové korpusy aj dvierka. Hladký, pevný, ideálny pre lakované a fóliované povrchy.',
    tag: 'Základ',
    color: '#C8BEB4',
  },
  {
    name: 'HDF',
    full: 'High Density Fiberboard',
    desc: 'Hustejší a tvrdší variant MDF. Používame ho tam, kde sa vyžaduje vyššia odolnosť — pracovné dosky, zásuvkové dná.',
    tag: 'Odolné',
    color: '#A89E94',
  },
  {
    name: 'Akrylát & Lak',
    full: 'Vysokolesklý / matný povrch',
    desc: 'Akrylátové a lakované dvierka v ľubovoľnej farbe z RAL palety. Odolné proti odtlačkom, ľahká údržba.',
    tag: 'Populárny',
    color: '#7A8E7C',
  },
  {
    name: 'HPL Laminát',
    full: 'High Pressure Laminate',
    desc: 'Vysokotlakový laminát pre pracovné dosky a kúpeľňové zostavy. Odolný voči vode, škrabaniu aj teplu.',
    tag: 'Odolný',
    color: '#6A7080',
  },
  {
    name: 'ABS & PVC hrany',
    full: 'Hranové pásky',
    desc: 'Hrany dokonale ladíme s povrchom. Ultratenké ABS hrany pre moderný look, hrubšie PVC pre mechanickú ochranu.',
    tag: 'Detail',
    color: '#887870',
  },
  {
    name: 'Fólia & Wrap',
    full: 'Termovákuová fólia',
    desc: 'Termovákuová fólia umožňuje obaliť aj tvarované časti. Lacná alternatíva k lakovaným dvierkami v stovkách farieb.',
    tag: 'Ekonomický',
    color: '#B0A898',
  },
]

export default function Materials() {
  return (
    <section className="py-24 lg:py-32 bg-cream-200">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Left: text */}
          <div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-8 h-px bg-gold-500" />
              <span className="section-label">Materiály</span>
            </div>
            <h2 className="heading-lg mb-4">
              MDF, HDF a moderné
              <br />
              <em className="not-italic italic text-gold-600">
                povrchové úpravy
              </em>
            </h2>
            <p className="body-text mb-3 leading-loose">
              Naša výroba stojí na MDF a HDF doskách — presne frézovaných,
              brúsených a opracovaných s toleranciou na milimetre.
            </p>
            <p className="body-text mb-10 leading-loose">
              Oproti masívu: žiadne praskanie ani krútenie, dokonale hladké
              plochy pre lak, a sloboda voliť si farbu z celej RAL palety.
              Moderný nábytok dnes väčšinou ani masív nepotrebuje — potrebuje
              precízne spracovanie.
            </p>

            {/* Material list */}
            <div className="flex flex-col gap-1">
              {materials.map((mat) => (
                <div
                  key={mat.name}
                  className="group flex items-start gap-4 p-4 hover:bg-cream-100 transition-colors duration-200 -mx-4"
                >
                  {/* Color swatch */}
                  <div
                    className="w-10 h-10 rounded-sm flex-shrink-0 mt-1"
                    style={{ backgroundColor: mat.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-0.5 flex-wrap">
                      <span
                        className="text-charcoal-900 font-light text-lg"
                        style={{ fontFamily: 'var(--font-cormorant), Georgia, serif' }}
                      >
                        {mat.name}
                      </span>
                      <span className="text-[9px] tracking-[0.18em] uppercase text-stone-400 font-sans">
                        {mat.full}
                      </span>
                      <span className="text-[8px] tracking-[0.2em] uppercase text-gold-500 font-sans ml-auto">
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

          {/* Right: visual */}
          <div className="lg:sticky lg:top-28">
            <div className="aspect-[3/4] overflow-hidden mb-6">
              <div
                className="w-full h-full bg-cover bg-center"
                style={{
                  backgroundImage:
                    "url('https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=900&q=80')",
                }}
              />
            </div>

            {/* Info card */}
            <div className="bg-charcoal-900 text-white p-8">
              <div className="text-[10px] tracking-[0.25em] uppercase text-gold-500/60 font-sans mb-4">
                Prečo MDF / HDF
              </div>
              <ul className="flex flex-col gap-3">
                {[
                  'Presné frézovanie na 0,1 mm',
                  'Žiadne praskanie ani krútenie',
                  'Hladký povrch pre lak aj fóliu',
                  'Akákoľvek farba z RAL palety',
                  'Rovnaká kvalita každého kusu',
                  'Lepší pomer cena / výsledok',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm font-sans text-white/65">
                    <div className="w-1 h-1 rounded-full bg-gold-500 mt-2 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
