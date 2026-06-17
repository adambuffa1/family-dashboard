const reviews = [
  {
    text: 'Kuchyňu sme mali hotovú do 5 týždňov od prvej konzultácie. Kvalita spracovania je na inej úrovni ako to, čo sme videli v katalógoch. Každý návštevník sa pýta, odkiaľ máme taký nábytok.',
    name: 'Mária Horváthová',
    location: 'Bratislava',
    project: 'Kuchyňa + obývačková stena',
    rating: 5,
  },
  {
    text: '3D vizualizácia nás presvedčila na prvý pohľad. Konečný výsledok bol presne ako na renderoch — možno ešte lepší. Oceňujem, že Niko nezachádzal do kompromisov s kvalitou materiálov.',
    name: 'Peter Kováč',
    location: 'Košice',
    project: 'Vstavaná šatníková skriňa',
    rating: 5,
  },
  {
    text: 'Pracovnú kanceláriu sme zariadili komplexne — stoly, police, úložné priestory. Tím bol profesionálny a montáž prebehla bez jediného problému. Odporúčam bez výhrad.',
    name: 'Jana Marková',
    location: 'Žilina',
    project: 'Kancelárske zariadenie',
    rating: 5,
  },
]

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-1 mb-4">
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} className="w-3 h-3 fill-gold-500" viewBox="0 0 12 12">
          <path d="M6 0l1.5 4H12L8.5 6.5l1.5 4L6 8 2 10.5l1.5-4L0 4h4.5L6 0z" />
        </svg>
      ))}
    </div>
  )
}

export default function Testimonials() {
  return (
    <section className="py-24 lg:py-36 bg-cream-100">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="w-8 h-px bg-gold-500" />
            <span className="section-label">Referencie</span>
            <div className="w-8 h-px bg-gold-500" />
          </div>
          <h2 className="heading-lg">
            Čo hovoria naši
            <br />
            <em className="not-italic italic text-stone-500">
              zákazníci
            </em>
          </h2>
        </div>

        {/* Reviews */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((review, i) => (
            <div
              key={i}
              className="bg-cream-200 p-8 flex flex-col justify-between group hover:bg-charcoal-900 transition-colors duration-500"
            >
              <div>
                {/* Quotation mark */}
                <div
                  className="text-6xl text-stone-300 group-hover:text-gold-600/40 font-light leading-none mb-2 transition-colors duration-500 select-none"
                  style={{ fontFamily: 'var(--font-cormorant), Georgia, serif' }}
                >
                  "
                </div>

                <Stars count={review.rating} />

                <p className="text-stone-600 group-hover:text-white/70 text-sm font-sans leading-relaxed mb-8 transition-colors duration-500 italic">
                  {review.text}
                </p>
              </div>

              <div className="border-t border-stone-300 group-hover:border-white/10 pt-6 transition-colors duration-500">
                <div
                  className="text-charcoal-900 group-hover:text-white font-light text-lg mb-1 transition-colors duration-500"
                  style={{ fontFamily: 'var(--font-cormorant), Georgia, serif' }}
                >
                  {review.name}
                </div>
                <div className="text-[10px] tracking-[0.15em] uppercase text-stone-400 group-hover:text-white/40 font-sans transition-colors duration-500">
                  {review.location} · {review.project}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust signals */}
        <div className="mt-16 flex flex-wrap justify-center items-center gap-8 opacity-50">
          {['Google Reviews 4.9★', 'Overená firma', '100% odporúčanie', 'Člen SADO'].map(
            (item) => (
              <span key={item} className="text-[10px] tracking-[0.2em] uppercase text-stone-500 font-sans">
                {item}
              </span>
            )
          )}
        </div>
      </div>
    </section>
  )
}
