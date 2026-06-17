const footerLinks = {
  Produkty: ['Kuchyne', 'Obývačky', 'Spálne', 'Kúpeľne', 'Kancelárie', 'Predsiete'],
  Spoločnosť: ['O nás', 'Naše realizácie', 'Proces výroby', 'Materiály', 'Kariéra'],
  Kontakt: ['Dopytový formulár', 'info@nikonabytok.sk', '+421 900 000 000', 'Showroom Bratislava'],
}

export default function Footer() {
  return (
    <footer className="bg-charcoal-800 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Main footer */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <div className="flex flex-col leading-none mb-6">
              <span
                className="text-3xl font-semibold text-white tracking-[0.08em]"
                style={{ fontFamily: 'var(--font-cormorant), Georgia, serif' }}
              >
                NIKO
              </span>
              <span className="text-[9px] tracking-[0.35em] uppercase text-gold-400 font-sans mt-0.5">
                NÁBYTOK
              </span>
            </div>
            <p className="text-white/40 text-sm font-sans leading-loose max-w-xs mb-8">
              Slovenský výrobca nábytku na mieru. Kuchyne, obývačky, spálne,
              kúpeľne a kancelárie od roku 2003.
            </p>
            {/* Social */}
            <div className="flex gap-4">
              {[
                {
                  name: 'Facebook',
                  icon: (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                    </svg>
                  ),
                },
                {
                  name: 'Instagram',
                  icon: (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                    </svg>
                  ),
                },
                {
                  name: 'Pinterest',
                  icon: (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
                    </svg>
                  ),
                },
              ].map((social) => (
                <a
                  key={social.name}
                  href="#"
                  aria-label={social.name}
                  className="w-9 h-9 border border-white/15 text-white/40 hover:text-gold-400 hover:border-gold-400/40 flex items-center justify-center transition-all duration-300"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group}>
              <h4 className="text-[10px] tracking-[0.25em] uppercase text-gold-500/60 font-sans mb-6">
                {group}
              </h4>
              <ul className="flex flex-col gap-3">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-white/40 hover:text-white/80 transition-colors font-sans"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="py-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/25 text-xs font-sans">
            © 2024 Niko Nábytok s.r.o. Všetky práva vyhradené.
          </p>
          <div className="flex gap-6">
            {['Ochrana súkromia', 'Obchodné podmienky', 'GDPR'].map((item) => (
              <a key={item} href="#" className="text-white/25 hover:text-white/50 text-xs font-sans transition-colors">
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
