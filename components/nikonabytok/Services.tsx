const services = [
  {
    id: 'kuchyne',
    title: 'Kuchyne',
    description:
      'Kuchynské linky šité na mieru — od ergonomického usporiadania po voľbu materiálov a povrchových úprav.',
    image:
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=800&q=80',
    tag: 'Najpopulárnejšie',
  },
  {
    id: 'obyvacky',
    title: 'Obývačky',
    description:
      'Obývačkové steny, police, TV jednotky a sedačkové zostavy, ktoré tvoria centrum vášho domova.',
    image:
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd3?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'spalny',
    title: 'Spálne',
    description:
      'Vstavaté skrine, postele a nočné stolíky navrhnuté pre maximálne využitie priestoru a estetiku.',
    image:
      'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'kupelne',
    title: 'Kúpeľne',
    description:
      'Vodovzdorné kúpeľňové zostavy, zrkadlové skrinky a policové systémy odolné voči vlhkosti.',
    image:
      'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'pracovne',
    title: 'Kancelárie',
    description:
      'Pracovné stoly, knižnice a úložné systémy pre domáce aj firemné kancelárske priestory.',
    image:
      'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'predsiene',
    title: 'Predsiete',
    description:
      'Vstupné skrinky, vešiakové systémy a priestorové riešenia, ktoré urobia prvý dojem.',
    image:
      'https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&w=800&q=80',
  },
]

export default function Services() {
  return (
    <section id="kuchyne" className="py-24 lg:py-36 bg-cream-100">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-8 h-px bg-gold-500" />
              <span className="section-label">Čo vyrábame</span>
            </div>
            <h2 className="heading-lg">
              Nábytok pre každú
              <br />
              <em
                className="not-italic text-stone-500"
                style={{ fontFamily: 'var(--font-cormorant), Georgia, serif' }}
              >
                časť vášho domova
              </em>
            </h2>
          </div>
          <p className="body-text max-w-sm">
            Špecializujeme sa na komplexné riešenia. Bez ohľadu na to, ktorú
            miestnosť zariaďujete — sme tu pre vás od prvého nákresu až po
            montáž.
          </p>
        </div>

        {/* Grid — bento-style */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1">
          {services.map((service) => (
            <div
              key={service.id}
              className="group relative overflow-hidden aspect-[4/3] cursor-pointer"
            >
              {/* Background image */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: `url('${service.image}')` }}
              />

              {/* Always-visible dark gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/85 via-charcoal-900/20 to-transparent" />

              {/* Tag */}
              {service.tag && (
                <div className="absolute top-4 left-4 bg-gold-500 text-white text-[9px] tracking-[0.25em] uppercase px-3 py-1 font-sans">
                  {service.tag}
                </div>
              )}

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3
                  className="text-white text-2xl font-light mb-2"
                  style={{ fontFamily: 'var(--font-cormorant), Georgia, serif' }}
                >
                  {service.title}
                </h3>
                <p className="text-white/0 group-hover:text-white/75 text-sm font-sans leading-relaxed transition-all duration-500 max-h-0 group-hover:max-h-24 overflow-hidden">
                  {service.description}
                </p>
                <div className="flex items-center gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <span className="text-gold-400 text-[10px] tracking-[0.2em] uppercase font-sans">
                    Zistiť viac
                  </span>
                  <div className="w-8 h-px bg-gold-400" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
