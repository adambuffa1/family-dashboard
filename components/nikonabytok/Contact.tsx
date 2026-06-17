'use client'

import { useState } from 'react'

const types = [
  'Kuchyňa',
  'Obývačka',
  'Spálňa',
  'Kúpeľňa',
  'Kancelária',
  'Iné',
]

export default function Contact() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    type: '',
    message: '',
  })
  const [sent, setSent] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSent(true)
  }

  return (
    <section id="kontakt" className="py-24 lg:py-36 bg-charcoal-900">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
          {/* Left: Info */}
          <div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-8 h-px bg-gold-500" />
              <span className="section-label text-gold-400">Kontakt</span>
            </div>
            <h2
              className="text-white font-light mb-6"
              style={{
                fontFamily: 'var(--font-cormorant), Georgia, serif',
                fontSize: 'clamp(2.5rem, 4vw, 4rem)',
                lineHeight: 1.1,
              }}
            >
              Máte projekt
              <br />
              <em className="not-italic italic text-gold-300">na mysli?</em>
            </h2>
            <p className="text-white/50 font-sans leading-loose mb-12 max-w-md">
              Napíšte nám alebo zavolajte. Konzultácia je vždy zdarma a
              nezáväzná. Radi sa stretneme, pozrieme si priestor a povieme vám,
              čo je možné.
            </p>

            {/* Contact details */}
            <div className="flex flex-col gap-8">
              <div>
                <div className="text-[10px] tracking-[0.25em] uppercase text-gold-500/60 font-sans mb-1">
                  Telefón
                </div>
                <a
                  href="tel:+421900000000"
                  className="text-white hover:text-gold-400 transition-colors font-sans text-lg"
                >
                  +421 900 000 000
                </a>
              </div>
              <div>
                <div className="text-[10px] tracking-[0.25em] uppercase text-gold-500/60 font-sans mb-1">
                  Email
                </div>
                <a
                  href="mailto:info@nikonabytok.sk"
                  className="text-white hover:text-gold-400 transition-colors font-sans text-lg"
                >
                  info@nikonabytok.sk
                </a>
              </div>
              <div>
                <div className="text-[10px] tracking-[0.25em] uppercase text-gold-500/60 font-sans mb-1">
                  Dielňa & Showroom
                </div>
                <address className="text-white/60 font-sans not-italic leading-relaxed">
                  Priemyselná 12
                  <br />
                  831 04 Bratislava
                </address>
              </div>
              <div>
                <div className="text-[10px] tracking-[0.25em] uppercase text-gold-500/60 font-sans mb-1">
                  Pracovná doba
                </div>
                <p className="text-white/60 font-sans">
                  Po–Pia: 8:00–17:00
                  <br />
                  So: 9:00–12:00 (po dohode)
                </p>
              </div>
            </div>
          </div>

          {/* Right: Form */}
          <div>
            {sent ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-16">
                <div className="w-16 h-16 border border-gold-500 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-7 h-7 text-gold-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <h3
                  className="text-white text-3xl font-light mb-3"
                  style={{ fontFamily: 'var(--font-cormorant), Georgia, serif' }}
                >
                  Správa odoslaná
                </h3>
                <p className="text-white/50 font-sans">
                  Ozveme sa vám do 24 hodín.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="text-[10px] tracking-[0.2em] uppercase text-gold-500/60 font-sans block mb-2">
                      Meno *
                    </label>
                    <input
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full bg-transparent border-b border-white/20 pb-3 text-white placeholder-white/25 text-sm font-sans focus:outline-none focus:border-gold-500 transition-colors"
                      placeholder="Ján Novák"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] tracking-[0.2em] uppercase text-gold-500/60 font-sans block mb-2">
                      Telefón
                    </label>
                    <input
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full bg-transparent border-b border-white/20 pb-3 text-white placeholder-white/25 text-sm font-sans focus:outline-none focus:border-gold-500 transition-colors"
                      placeholder="+421 9xx xxx xxx"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] tracking-[0.2em] uppercase text-gold-500/60 font-sans block mb-2">
                    Email *
                  </label>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full bg-transparent border-b border-white/20 pb-3 text-white placeholder-white/25 text-sm font-sans focus:outline-none focus:border-gold-500 transition-colors"
                    placeholder="jan@email.sk"
                  />
                </div>

                <div>
                  <label className="text-[10px] tracking-[0.2em] uppercase text-gold-500/60 font-sans block mb-2">
                    Typ nábytku
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {types.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setForm({ ...form, type: t })}
                        className={`text-[10px] tracking-[0.15em] uppercase px-4 py-2 font-sans transition-all duration-200 ${
                          form.type === t
                            ? 'bg-gold-500 text-white'
                            : 'border border-white/20 text-white/50 hover:border-gold-500 hover:text-gold-400'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] tracking-[0.2em] uppercase text-gold-500/60 font-sans block mb-2">
                    Správa
                  </label>
                  <textarea
                    rows={4}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full bg-transparent border-b border-white/20 pb-3 text-white placeholder-white/25 text-sm font-sans focus:outline-none focus:border-gold-500 transition-colors resize-none"
                    placeholder="Popíšte váš projekt, priestor, predstavy..."
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <p className="text-white/30 text-xs font-sans leading-relaxed max-w-xs">
                    Odoslaním súhlasíte so spracovaním osobných údajov pre účely dopytového konania.
                  </p>
                  <button type="submit" className="btn-gold whitespace-nowrap">
                    Odoslať dopyt
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
