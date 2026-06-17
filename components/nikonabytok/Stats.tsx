const stats = [
  { value: '20+', label: 'Rokov skúseností' },
  { value: '1 800+', label: 'Realizovaných projektov' },
  { value: '100%', label: 'Nábytok na mieru' },
  { value: '5 rokov', label: 'Záruka na každý kus' },
]

export default function Stats() {
  return (
    <section className="bg-charcoal-900 py-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-0 divide-x divide-white/10">
          {stats.map((stat, i) => (
            <div key={i} className="px-8 py-6 text-center lg:text-left first:pl-0 last:pr-0">
              <div
                className="text-4xl lg:text-5xl text-gold-400 font-light mb-2"
                style={{ fontFamily: 'var(--font-cormorant), Georgia, serif' }}
              >
                {stat.value}
              </div>
              <div className="text-[11px] tracking-[0.18em] uppercase text-white/40 font-sans">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
