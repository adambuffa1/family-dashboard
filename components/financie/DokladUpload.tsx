'use client'

import { useState, useRef } from 'react'
import { Upload, ScanLine, Check, AlertCircle } from 'lucide-react'

interface OcrResult {
  amount: string
  date: string
  items: string
  rawText: string
  imageUrl: string
}

interface DokladUploadProps {
  onResult: (result: OcrResult) => void
}

function parseReceiptText(text: string): Partial<OcrResult> {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean)

  // Find total amount - common Slovak receipt patterns
  let amount = ''
  const totalPatterns = [
    /(?:celkom|spolu|total|suma|na úhradu|k platbe)\s*:?\s*(\d+[,.]?\d*)/i,
    /(\d+[,.]\d{2})\s*€/i,
    /€\s*(\d+[,.]\d{2})/i,
  ]
  for (const pattern of totalPatterns) {
    const match = text.match(pattern)
    if (match) {
      amount = match[1].replace(',', '.')
      break
    }
  }

  // Find date
  let date = ''
  const datePatterns = [
    /(\d{1,2})\.(\d{1,2})\.(\d{4})/,
    /(\d{4})-(\d{2})-(\d{2})/,
    /(\d{1,2})\/(\d{1,2})\/(\d{4})/,
  ]
  for (const pattern of datePatterns) {
    const match = text.match(pattern)
    if (match) {
      if (pattern.source.includes('(\\d{4})-')) {
        date = match[0]
      } else if (pattern.source.startsWith('(\\d{4})')) {
        date = match[0]
      } else {
        const d = match[1].padStart(2, '0')
        const m = match[2].padStart(2, '0')
        const y = match[3]
        date = `${y}-${m}-${d}`
      }
      break
    }
  }

  // Extract possible items (lines with price patterns)
  const itemLines = lines.filter((line) => {
    return /\d+[,.]\d{2}/.test(line) && line.length > 3 && !/celkom|spolu|total|dph|ič|dič/i.test(line)
  }).slice(0, 10)

  return {
    amount,
    date,
    items: itemLines.join(', '),
    rawText: text,
  }
}

export default function DokladUpload({ onResult }: DokladUploadProps) {
  const [scanning, setScanning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    setScanning(true)
    setError('')
    setProgress(0)
    setDone(false)

    try {
      // Upload file first
      const formData = new FormData()
      formData.append('file', file)
      formData.append('category', 'doklady')

      const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData })
      const uploadData = await uploadRes.json()
      const imageUrl = uploadData.url || ''

      // Dynamic import to avoid SSR issues
      setProgress(20)
      const Tesseract = (await import('tesseract.js')).default

      setProgress(30)
      const result = await Tesseract.recognize(file, 'slk+eng', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setProgress(30 + Math.round(m.progress * 60))
          }
        },
      })

      setProgress(95)
      const parsed = parseReceiptText(result.data.text)

      setDone(true)
      setProgress(100)

      onResult({
        amount: parsed.amount || '',
        date: parsed.date || new Date().toISOString().split('T')[0],
        items: parsed.items || '',
        rawText: parsed.rawText || result.data.text,
        imageUrl,
      })
    } catch (err) {
      setError('Chyba pri skenovaní. Skúste znova alebo zadajte hodnoty ručne.')
      console.error(err)
    } finally {
      setScanning(false)
    }
  }

  return (
    <div className="border-2 border-dashed border-blue-200 rounded-xl p-5 bg-blue-50">
      <div className="text-center mb-4">
        <div className="inline-flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full mb-2">
          <ScanLine size={20} className="text-blue-600" />
        </div>
        <h3 className="font-medium text-gray-900 text-sm">Skenovanie dokladu</h3>
        <p className="text-xs text-gray-500 mt-0.5">Nahrajte foto dokladu a automaticky vyplníme hodnoty</p>
      </div>

      {scanning ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>Spracovávam...</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      ) : done ? (
        <div className="flex items-center gap-2 text-green-700 text-sm justify-center">
          <Check size={16} />
          Doklad úspešne naskenovaný
        </div>
      ) : (
        <div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-2 bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors mx-auto"
          >
            <Upload size={15} />
            Nahrať foto dokladu
          </button>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-red-600 text-xs mt-3">
          <AlertCircle size={14} />
          {error}
        </div>
      )}
    </div>
  )
}
