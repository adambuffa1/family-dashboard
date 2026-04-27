'use client'

import { useState, useRef } from 'react'
import { Upload, ScanLine, Check, AlertCircle } from 'lucide-react'
import { TYPY_ENERGIE } from '@/types'

interface MeranieFormProps {
  onSuccess: () => void
  onCancel: () => void
}

export default function MeranieForm({ onSuccess, onCancel }: MeranieFormProps) {
  const today = new Date().toISOString().split('T')[0]
  const [type, setType] = useState('elektrina')
  const [value, setValue] = useState('')
  const [date, setDate] = useState(today)
  const [image, setImage] = useState('')
  const [scanning, setScanning] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleImageScan(file: File) {
    setScanning(true)
    setError('')
    setScanProgress(10)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('category', 'energia')
      const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData })
      const uploadData = await uploadRes.json()
      setImage(uploadData.url || '')
      setScanProgress(25)

      const Tesseract = (await import('tesseract.js')).default
      const result = await Tesseract.recognize(file, 'slk+eng', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setScanProgress(25 + Math.round(m.progress * 65))
          }
        },
      })

      setScanProgress(95)

      // Extract meter reading - look for long number sequences
      const text = result.data.text
      const matches = text.match(/\d{4,8}([.,]\d{1,3})?/)
      if (matches) {
        const extracted = matches[0].replace(',', '.')
        setValue(extracted)
      }

      setScanProgress(100)
    } catch (err) {
      setError('Chyba pri skenovaní. Zadajte hodnotu ručne.')
      console.error(err)
    } finally {
      setScanning(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/energia/merania', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, value, date, image }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Chyba pri ukladaní')
        return
      }

      onSuccess()
    } catch {
      setError('Chyba pripojenia')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* OCR Scanner */}
      <div className="border-2 border-dashed border-blue-200 rounded-xl p-4 bg-blue-50">
        <div className="text-center mb-3">
          <div className="inline-flex items-center justify-center w-9 h-9 bg-blue-100 rounded-full mb-1.5">
            <ScanLine size={18} className="text-blue-600" />
          </div>
          <p className="text-sm font-medium text-gray-800">Skenovanie merača</p>
          <p className="text-xs text-gray-500">Nahrajte foto merača a automaticky vyplníme hodnotu</p>
        </div>

        {scanning ? (
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Skenuje sa...</span>
              <span>{scanProgress}%</span>
            </div>
            <div className="h-1.5 bg-blue-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all"
                style={{ width: `${scanProgress}%` }}
              />
            </div>
          </div>
        ) : scanProgress === 100 ? (
          <div className="flex items-center gap-2 text-green-700 text-sm justify-center">
            <Check size={15} /> Hodnota extrahovaná
          </div>
        ) : (
          <div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleImageScan(e.target.files[0])}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 bg-blue-600 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-blue-700 mx-auto"
            >
              <Upload size={13} /> Nahrať foto merača
            </button>
          </div>
        )}
        {error && (
          <div className="flex items-center gap-1.5 text-red-600 text-xs mt-2">
            <AlertCircle size={12} /> {error}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Typ merača *</label>
          <select value={type} onChange={(e) => setType(e.target.value)} className="input">
            {TYPY_ENERGIE.map((t) => (
              <option key={t.value} value={t.value}>{t.label} ({t.unit})</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Dátum *</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="input"
            required
          />
        </div>
      </div>

      <div>
        <label className="label">
          Hodnota ({TYPY_ENERGIE.find((t) => t.value === type)?.unit}) *
        </label>
        <input
          type="number"
          step="0.001"
          min="0"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="input"
          placeholder="Napr. 12450"
          required
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary flex-1">Zrušiť</button>
        <button type="submit" disabled={loading} className="btn-primary flex-1">
          {loading ? 'Ukladám...' : 'Uložiť meranie'}
        </button>
      </div>
    </form>
  )
}
