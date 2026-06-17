'use client'

import { useState, useEffect } from 'react'

const navLinks = [
  { label: 'Kuchyne', href: '#kuchyne' },
  { label: 'Obývačky', href: '#obyvacky' },
  { label: 'Spálne', href: '#spalny' },
  { label: 'Realizácie', href: '#galeria' },
  { label: 'O nás', href: '#o-nas' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled || menuOpen
          ? 'bg-charcoal-900 shadow-2xl'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex flex-col leading-none group">
          <span
            className="font-serif text-2xl font-semibold text-white tracking-[0.08em]"
            style={{ fontFamily: 'var(--font-cormorant), Georgia, serif' }}
          >
            NIKO
          </span>
          <span className="text-[9px] tracking-[0.35em] uppercase text-gold-400 font-sans">
            NÁBYTOK
          </span>
        </a>

        {/* Desktop links */}
        <nav className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-[11px] tracking-[0.18em] uppercase text-white/70 hover:text-gold-400 transition-colors duration-300 font-sans"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* CTA */}
        <a
          href="#kontakt"
          className="hidden md:inline-block border border-gold-500 text-gold-400 text-[11px] tracking-[0.2em] uppercase px-6 py-2.5 font-sans transition-all duration-300 hover:bg-gold-500 hover:text-white"
        >
          Dopytovať
        </a>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden flex flex-col gap-1.5 p-2"
          aria-label="Menu"
        >
          <span
            className={`block w-6 h-px bg-white transition-all duration-300 origin-center ${
              menuOpen ? 'rotate-45 translate-y-[7px]' : ''
            }`}
          />
          <span
            className={`block w-6 h-px bg-white transition-all duration-300 ${
              menuOpen ? 'opacity-0 scale-x-0' : ''
            }`}
          />
          <span
            className={`block w-6 h-px bg-white transition-all duration-300 origin-center ${
              menuOpen ? '-rotate-45 -translate-y-[7px]' : ''
            }`}
          />
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-500 ${
          menuOpen ? 'max-h-96' : 'max-h-0'
        }`}
      >
        <div className="px-6 pb-8 pt-2 flex flex-col gap-6 border-t border-white/10">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="text-sm tracking-[0.15em] uppercase text-white/80 hover:text-gold-400 transition-colors font-sans"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#kontakt"
            onClick={() => setMenuOpen(false)}
            className="inline-block self-start border border-gold-500 text-gold-400 text-[11px] tracking-[0.2em] uppercase px-6 py-3 font-sans"
          >
            Dopytovať projekt
          </a>
        </div>
      </div>
    </header>
  )
}
