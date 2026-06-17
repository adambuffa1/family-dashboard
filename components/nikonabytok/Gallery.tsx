'use client'

import { useState } from 'react'

const categories = ['Všetko', 'Kuchyne', 'Obývačky', 'Spálne', 'Kúpeľne', 'Kancelárie']

const projects = [
  {
    id: 1,
    title: 'Moderná kuchyňa, Bratislava',
    category: 'Kuchyne',
    year: '2024',
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=700&q=80',
    span: 'col-span-1 md:col-span-2 row-span-1',
  },
  {
    id: 2,
    title: 'Minimalistická spálňa, Košice',
    category: 'Spálne',
    year: '2024',
    image: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=700&q=80',
    span: 'col-span-1 row-span-2',
  },
  {
    id: 3,
    title: 'Obývačková zostava, Žilina',
    category: 'Obývačky',
    year: '2023',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=700&q=80',
    span: 'col-span-1 row-span-1',
  },
  {
    id: 4,
    title: 'Kúpeľňová skrinka, Trnava',
    category: 'Kúpeľne',
    year: '2024',
    image: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=700&q=80',
    span: 'col-span-1 row-span-1',
  },
  {
    id: 5,
    title: 'Domáca kancelária, Nitra',
    category: 'Kancelárie',
    year: '2023',
    image: 'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?auto=format&fit=crop&w=700&q=80',
    span: 'col-span-1 row-span-1',
  },
  {
    id: 6,
    title: 'Luxusná kuchyňa, Banská Bystrica',
    category: 'Kuchyne',
    year: '2023',
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=700&q=80&sat=-30',
    span: 'col-span-1 row-span-1',
  },
  {
    id: 7,
    title: 'Vstavaná skriňa, Prešov',
    category: 'Spálne',
    year: '2024',
    image: 'https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&w=700&q=80',
    span: 'col-span-1 md:col-span-2 row-span-1',
  },
]

export default function Gallery() {
  const [active, setActive] = useState('Všetko')

  const filtered =
    active === 'Všetko' ? projects : projects.filter((p) => p.category === active)

  return (
    <section id="galeria" className="py-24 lg:py-36 bg-cream-100">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-8 h-px bg-gold-500" />
              <span className="section-label">Portfolio</span>
            </div>
            <h2 className="heading-lg">Naše realizácie</h2>
          </div>

          {/* Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActive(cat)}
                className={`text-[10px] tracking-[0.2em] uppercase px-4 py-2 font-sans transition-all duration-300 ${
                  active === cat
                    ? 'bg-charcoal-900 text-white'
                    : 'border border-stone-300 text-stone-500 hover:border-charcoal-900 hover:text-charcoal-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-1 auto-rows-[280px]">
          {filtered.map((project) => (
            <div
              key={project.id}
              className={`group relative overflow-hidden ${project.span}`}
            >
              {/* Image */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-108"
                style={{ backgroundImage: `url('${project.image}')`, transform: 'scale(1)' }}
              />
              <div className="absolute inset-0 bg-charcoal-900/0 group-hover:bg-charcoal-900/50 transition-colors duration-500" />

              {/* Category chip */}
              <div className="absolute top-4 left-4 bg-charcoal-900/70 backdrop-blur-sm text-white text-[9px] tracking-[0.2em] uppercase px-3 py-1 font-sans">
                {project.category}
              </div>

              {/* Hover info */}
              <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                <div className="text-gold-400 text-[9px] tracking-[0.25em] uppercase font-sans mb-1">
                  {project.year}
                </div>
                <h3
                  className="text-white text-xl font-light"
                  style={{ fontFamily: 'var(--font-cormorant), Georgia, serif' }}
                >
                  {project.title}
                </h3>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <a href="#kontakt" className="btn-primary">
            Chcem podobný projekt
          </a>
        </div>
      </div>
    </section>
  )
}
