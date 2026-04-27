import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'

// Extract recipe data from schema.org ld+json (used by most major recipe sites)
function extractFromLdJson(html: string) {
  const matches = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
  for (const match of matches) {
    try {
      const json = JSON.parse(match[1])
      const obj = Array.isArray(json)
        ? json.find((o: Record<string, unknown>) => o['@type'] === 'Recipe')
        : json['@type'] === 'Recipe' ? json : null
      if (!obj) continue

      const name: string = obj.name || ''
      const image: string = Array.isArray(obj.image)
        ? obj.image[0]
        : (typeof obj.image === 'object' ? (obj.image as Record<string, string>)?.url : obj.image) || ''

      const rawIngredients: string[] = obj.recipeIngredient || []
      const ingredients = rawIngredients.map((i: string) => i.trim()).filter(Boolean)

      let steps: string[] = []
      if (obj.recipeInstructions) {
        const instr = obj.recipeInstructions
        if (Array.isArray(instr)) {
          steps = instr.map((s: Record<string, string> | string) => {
            if (typeof s === 'string') return s.trim()
            return (s.text || s.name || '').trim()
          }).filter(Boolean)
        } else if (typeof instr === 'string') {
          steps = instr.split(/\n+/).map((s: string) => s.trim()).filter(Boolean)
        }
      }

      return { name, image, ingredients, steps, source: 'schema.org' }
    } catch { /* try next */ }
  }
  return null
}

// Fallback: heuristic HTML parsing
function extractHeuristic(html: string, url: string) {
  const clean = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s{2,}/g, ' ')

  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
  const name = titleMatch ? titleMatch[1].replace(/\s*[-|]\s*.+$/, '').trim() : new URL(url).hostname

  const ogImg = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
    || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i)
  const image = ogImg ? ogImg[1] : ''

  // Match lines that start with a digit OR contain a unit keyword (ASCII only)
  const unitList = 'cup|cups|tbsp|tsp|tablespoon|teaspoon|gram|kg|ml|liter|oz|pound|lb|piece|clove|slice|handful|pinch|bunch|can|jar|bag|dl|ks|kus'
  const ingredientPattern = new RegExp('(^\\d|\\b(' + unitList + ')\\b)', 'i')

  const ingredientLines: string[] = []
  const lines = clean.split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.length > 3 && trimmed.length < 120 && ingredientPattern.test(trimmed)) {
      ingredientLines.push(trimmed)
      if (ingredientLines.length >= 20) break
    }
  }

  return { name, image, ingredients: ingredientLines, steps: [], source: 'heuristic' }
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Neautorizovany' }, { status: 401 })

  const { url } = await request.json()
  if (!url || typeof url !== 'string') {
    return NextResponse.json({ error: 'Zadajte URL adresu' }, { status: 400 })
  }

  let parsedUrl: URL
  try {
    parsedUrl = new URL(url)
  } catch {
    return NextResponse.json({ error: 'Neplatna URL adresa' }, { status: 400 })
  }

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; RecipeImporter/1.0)',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'sk,cs,en',
      },
      signal: AbortSignal.timeout(10000),
    })

    if (!res.ok) {
      return NextResponse.json({ error: `Stranka vratila chybu ${res.status}` }, { status: 422 })
    }

    const html = await res.text()
    const recipe = extractFromLdJson(html) || extractHeuristic(html, url)

    return NextResponse.json({
      ...recipe,
      sourceUrl: url,
      domain: parsedUrl.hostname.replace('www.', ''),
    })
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'TimeoutError') {
      return NextResponse.json({ error: 'Stranka neodpoveda (timeout)' }, { status: 408 })
    }
    return NextResponse.json({ error: 'Chyba pri nacitani stranky' }, { status: 500 })
  }
}
