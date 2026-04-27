'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Plus, Trash2, Zap, Flame, Droplets, Settings } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import MeranieForm from '@/components/energia/MeranieForm'
import EnergiaChart from '@/components/energia/EnergiaChart'
import CenoveNastavenia from '@/components/energia/CenoveNastavenia'
import type { EnergyReading } from '@/types'
import { TYPY_ENERGIE } from '@/types'

const TYPE_ICONS = { elektrina: Zap, plyn: Flame, voda: Droplets }

interface Pricing {
  type: string
  pricePerUnit: number
}

export default function EnergiaPage() {
  const [readings, setReadings] = useState<EnergyReading[]>([])
  const [pricings, setPricings] = useState<Pricing[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showPricingModal, setShowPricingModal] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [activeType, setActiveType] = useState<string>('vsetky')
  const [activeTab, setActiveTab] = useState<'tabulka' | 'graf' | 'naklady'>('tabulka')
  const [isAdmin, setIsAdmin] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const PAGE_SIZE = 30
  const loaderRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (d.user?.role === 'admin') setIsAdmin(true)
    })
  }, [])

  const fetchReadings = useCallback(async () => {
    setLoading(true)
    const [readRes, priceRes] = await Promise.all([
      fetch('/api/energia/merania?limit=500'),
      fetch('/api/energia/ceny'),
    ])
    const readData = await readRes.json()
    const priceData = await priceRes.json()
    setReadings(readData.readings || [])
    setPricings(priceData.pricings || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchReadings() }, [fetchReadings])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting && hasMore) setPage((p) => p + 1) },
      { threshold: 0.1 }
    )
    if (loaderRef.current) observer.observe(loaderRef.current)
    return () => observer.disconnect()
  }, [hasMore])

  const filtered = readings.filter((r) => activeType === 'vsetky' || r.type === activeType)
  const displayed = filtered.slice(0, page * PAGE_SIZE)
  useEffect(() => { setHasMore(displayed.length < filtered.length) }, [displayed.length, filtered.length])

  async function handleDelete() {
    if (!deleteId) return
    setDeleting(true)
    await fetch(`/api/energia/merania/${deleteId}`, { method: 'DELETE' })
    setDeleting(false)
    setDeleteId(null)
    fetchReadings()
  }

  function getPrice(type: string) {
    return pricings.find((p) => p.type === type)?.pricePerUnit || 0
  }

  // Calculate consumption and cost for each type
  const typeStats = TYPY_ENERGIE.map((t) => {
    const typeReadings = readings.filter((r) => r.type === t.value).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    const latest = typeReadings[0]
    const previous = typeReadings[1]
    const consumption = latest && previous ? latest.value - previous.value : null
    const price = getPrice(t.value)
    const cost = consumption !== null && price > 0 ? consumption * price : null
    return { ...t, latest, previous, consumption, cost }
  })

  function getTypeIcon(type: string) {
    const Icon = TYPE_ICONS[type as keyof typeof TYPE_ICONS] || Zap
    return <Icon size={16} />
  }
  function getTypeLabel(type: string) { return TYPY_ENERGIE.find((t) => t.value === type)?.label || type }
  function getTypeUnit(type: string) { return TYPY_ENERGIE.find((t) => t.value === type)?.unit || '' }
  function getTypeColor(type: string) { return TYPY_ENERGIE.find((t) => t.value === type)?.color || '#ccc' }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Energia</h1>
          <p className="text-sm text-gray-500">Sledovanie spotreby a nákladov</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowPricingModal(true)}
            className="flex items-center gap-2 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 text-sm font-medium"
          >
            <Settings size={15} />
            Cenník
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <Plus size={15} />
            Pridať meranie
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {typeStats.map((t) => (
          <div key={t.value} className="card py-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg" style={{ backgroundColor: t.color + '20', color: t.color }}>
                {getTypeIcon(t.value)}
              </div>
              <span className="text-sm font-medium text-gray-700 truncate">{t.label}</span>
            </div>
            <p className="text-lg font-bold text-gray-900">
              {t.latest ? t.latest.value.toLocaleString('sk-SK') : '—'}
              <span className="text-xs font-normal text-gray-400 ml-1">{t.unit}</span>
            </p>
            {t.consumption !== null && (
              <p className="text-xs text-gray-500 mt-0.5">
                Spotreba: <span className="font-medium">{t.consumption.toFixed(1)} {t.unit}</span>
              </p>
            )}
            {t.cost !== null && (
              <p className="text-xs font-medium mt-0.5" style={{ color: t.color }}>
                ≈ {t.cost.toFixed(2)} €
              </p>
            )}
            <p className="text-[11px] text-gray-400 mt-1">
              {t.latest ? new Date(t.latest.date).toLocaleDateString('sk-SK') : 'Žiadne meranie'}
            </p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6">
        {([
          { id: 'tabulka', label: 'Tabuľka' },
          { id: 'graf', label: 'Graf' },
          { id: 'naklady', label: 'Náklady' },
        ] as const).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : activeTab === 'graf' ? (
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Vývoj stavov meračov</h3>
          <EnergiaChart readings={readings} />
        </div>
      ) : activeTab === 'naklady' ? (
        <div className="space-y-4">
          {/* Cost summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {typeStats.map((t) => {
              const price = getPrice(t.value)
              // Last 3 months consumption
              const typeReadings = readings.filter((r) => r.type === t.value).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              const monthlyConsumptions: number[] = []
              for (let i = 1; i < typeReadings.length; i++) {
                const diff = typeReadings[i].value - typeReadings[i - 1].value
                if (diff > 0) monthlyConsumptions.push(diff)
              }
              const avgConsumption = monthlyConsumptions.length > 0
                ? monthlyConsumptions.reduce((s, v) => s + v, 0) / monthlyConsumptions.length
                : 0
              const avgCost = avgConsumption * price

              return (
                <div key={t.value} className="card py-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-2 rounded-xl text-base" style={{ backgroundColor: t.color + '20', color: t.color }}>
                      {getTypeIcon(t.value)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{t.label}</p>
                      <p className="text-xs text-gray-400">{price > 0 ? `${price.toFixed(4)} € / ${t.unit}` : 'Cena nenastavená'}</p>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Priemer / okres</span>
                      <span className="font-medium text-gray-900">{avgConsumption > 0 ? `${avgConsumption.toFixed(1)} ${t.unit}` : '—'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Odhad nákladov</span>
                      <span className="font-bold" style={{ color: t.color }}>
                        {avgCost > 0 ? `${avgCost.toFixed(2)} €` : '—'}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Total cost estimate */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3">Súhrnné náklady</h3>
            {(() => {
              const totalCost = typeStats.reduce((sum, t) => {
                if (t.consumption !== null) {
                  const price = getPrice(t.value)
                  return sum + (t.consumption * price)
                }
                return sum
              }, 0)
              return (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Odhadované náklady (posledné meranie)</p>
                    <p className="text-xs text-gray-400 mt-0.5">Elektrina + Plyn + Voda</p>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{totalCost.toFixed(2)} €</p>
                </div>
              )
            })()}
          </div>
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="px-6 py-3 border-b border-gray-100 flex gap-2">
            <button
              onClick={() => { setActiveType('vsetky'); setPage(1) }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeType === 'vsetky' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              Všetky
            </button>
            {TYPY_ENERGIE.map((t) => (
              <button
                key={t.value}
                onClick={() => { setActiveType(t.value); setPage(1) }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeType === t.value ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {displayed.length === 0 ? (
            <div className="text-center py-12 px-6">
              <p className="text-gray-400 text-sm">Žiadne merania</p>
              <button onClick={() => setShowAddModal(true)} className="btn-primary mt-4 text-sm">
                Pridať prvé meranie
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Dátum</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Typ</th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Stav</th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Náklady</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Zadal</th>
                    <th className="px-6 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {displayed.map((reading, idx) => {
                    const price = getPrice(reading.type)
                    const prevReading = displayed.find((r, i) => i > idx && r.type === reading.type)
                    const consumption = prevReading ? reading.value - prevReading.value : null
                    const cost = consumption !== null && price > 0 ? consumption * price : null

                    return (
                      <tr key={reading.id} className="hover:bg-gray-50 group">
                        <td className="px-6 py-3 text-gray-600">
                          {new Date(reading.date).toLocaleDateString('sk-SK')}
                        </td>
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-2">
                            <div className="p-1 rounded" style={{ color: getTypeColor(reading.type), backgroundColor: getTypeColor(reading.type) + '20' }}>
                              {getTypeIcon(reading.type)}
                            </div>
                            <span className="font-medium text-gray-900">{getTypeLabel(reading.type)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-3 text-right font-semibold text-gray-900">
                          {reading.value.toLocaleString('sk-SK')} {getTypeUnit(reading.type)}
                        </td>
                        <td className="px-6 py-3 text-right text-xs">
                          {cost !== null ? (
                            <span className="font-medium text-blue-600">{cost.toFixed(2)} €</span>
                          ) : consumption !== null ? (
                            <span className="text-gray-400">nenastavená cena</span>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                        <td className="px-6 py-3 text-gray-400 text-xs">{reading.user?.username}</td>
                        <td className="px-6 py-3 text-right">
                          <button
                            onClick={() => setDeleteId(reading.id)}
                            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              <div ref={loaderRef} className="h-8 flex items-center justify-center">
                {hasMore && <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Nové meranie" size="md">
        <MeranieForm
          onSuccess={() => { setShowAddModal(false); fetchReadings() }}
          onCancel={() => setShowAddModal(false)}
        />
      </Modal>

      {/* Pricing Modal */}
      <Modal isOpen={showPricingModal} onClose={() => setShowPricingModal(false)} title="Cenník energií" size="sm">
        <CenoveNastavenia
          isAdmin={isAdmin}
        />
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Vymazať meranie"
        message="Naozaj chcete vymazať toto meranie?"
        confirmLabel="Vymazať"
        loading={deleting}
      />
    </div>
  )
}
