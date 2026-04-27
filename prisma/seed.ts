import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const db = new PrismaClient()

async function main() {
  // Create default family
  const family = await db.family.upsert({
    where: { id: 1 },
    update: {},
    create: { name: 'Naša rodina' },
  })
  console.log('Vytvorená rodina:', family.name)

  // Create admin user
  const adminPassword = await bcrypt.hash('admin', 10)
  const admin = await db.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: adminPassword,
      role: 'admin',
      familyId: family.id,
    },
  })
  console.log('Vytvorený admin:', admin.username)

  const userPassword = await bcrypt.hash('pouzivatel123', 10)
  const user = await db.user.upsert({
    where: { username: 'pouzivatel' },
    update: {},
    create: {
      username: 'pouzivatel',
      password: userPassword,
      role: 'user',
      familyId: family.id,
    },
  })
  console.log('Vytvorený používateľ:', user.username)

  // Energy pricing
  const pricings = [
    { type: 'elektrina', pricePerUnit: 0.18, currency: 'EUR' },
    { type: 'plyn', pricePerUnit: 0.065, currency: 'EUR' },
    { type: 'voda', pricePerUnit: 2.5, currency: 'EUR' },
  ]
  for (const p of pricings) {
    await db.energyPricing.upsert({
      where: { type: p.type },
      update: {},
      create: p,
    })
  }
  console.log('Vytvorené cenníky energií')

  // Category mappings (keyword → category learning)
  const mappings = [
    { keyword: 'lidl', category: 'jedlo' },
    { keyword: 'tesco', category: 'jedlo' },
    { keyword: 'billa', category: 'jedlo' },
    { keyword: 'kaufland', category: 'jedlo' },
    { keyword: 'albert', category: 'jedlo' },
    { keyword: 'potraviny', category: 'jedlo' },
    { keyword: 'pekáreň', category: 'jedlo' },
    { keyword: 'reštaurácia', category: 'jedlo' },
    { keyword: 'pizza', category: 'jedlo' },
    { keyword: 'burger', category: 'jedlo' },
    { keyword: 'kino', category: 'zabava' },
    { keyword: 'netflix', category: 'zabava' },
    { keyword: 'spotify', category: 'zabava' },
    { keyword: 'divadlo', category: 'zabava' },
    { keyword: 'koncert', category: 'zabava' },
    { keyword: 'ikea', category: 'domacnost' },
    { keyword: 'obi', category: 'domacnost' },
    { keyword: 'hornbach', category: 'domacnost' },
    { keyword: 'drogéria', category: 'domacnost' },
    { keyword: 'dm', category: 'domacnost' },
    { keyword: 'rossmann', category: 'domacnost' },
    { keyword: 'nájom', category: 'domacnost' },
    { keyword: 'energia', category: 'domacnost' },
    { keyword: 'granule', category: 'pes' },
    { keyword: 'veterinár', category: 'pes' },
    { keyword: 'pet', category: 'pes' },
    { keyword: 'psie', category: 'pes' },
    { keyword: 'liek', category: 'ostatne' },
    { keyword: 'lekáreň', category: 'ostatne' },
  ]
  for (const m of mappings) {
    await db.categoryMapping.upsert({
      where: { keyword: m.keyword },
      update: {},
      create: { keyword: m.keyword, category: m.category, count: 5 },
    })
  }
  console.log('Vytvorené kategorizačné mapovania')

  // Monthly budgets
  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()
  const budgets = [
    { category: 'jedlo', amount: 500, month, year },
    { category: 'zabava', amount: 200, month, year },
    { category: 'domacnost', amount: 300, month, year },
    { category: 'pes', amount: 100, month, year },
    { category: 'ostatne', amount: 150, month, year },
  ]
  for (const b of budgets) {
    await db.budget.upsert({
      where: { category_month_year: { category: b.category, month: b.month, year: b.year } },
      update: {},
      create: b,
    })
  }
  console.log('Vytvorené rozpočty')

  // Sample expenses (spread across current month)
  const expenses = [
    { userId: admin.id, amount: 45.80, category: 'jedlo', description: 'Nákup Lidl', storeName: 'Lidl', date: new Date(year, month - 1, 3) },
    { userId: admin.id, amount: 120.00, category: 'zabava', description: 'Kino a reštaurácia', storeName: 'Kino', date: new Date(year, month - 1, 5) },
    { userId: admin.id, amount: 85.50, category: 'domacnost', description: 'Nákup DM drogéria', storeName: 'DM', date: new Date(year, month - 1, 7) },
    { userId: admin.id, amount: 35.00, category: 'pes', description: 'Granule pre psa', storeName: 'PetCenter', date: new Date(year, month - 1, 9) },
    { userId: admin.id, amount: 22.90, category: 'jedlo', description: 'Pekáreň Zaječí chlieb', storeName: 'Pekáreň', date: new Date(year, month - 1, 10) },
    { userId: admin.id, amount: 89.99, category: 'jedlo', description: 'Týždenný nákup Tesco', storeName: 'Tesco', date: new Date(year, month - 1, 12) },
    { userId: admin.id, amount: 15.50, category: 'zabava', description: 'Spotify prémiový plán', storeName: 'Spotify', date: new Date(year, month - 1, 1) },
    { userId: user.id, amount: 32.40, category: 'jedlo', description: 'Kaufland nákup', storeName: 'Kaufland', date: new Date(year, month - 1, 8) },
    { userId: user.id, amount: 67.20, category: 'domacnost', description: 'IKEA dekorácie', storeName: 'IKEA', date: new Date(year, month - 1, 15) },
    { userId: user.id, amount: 18.90, category: 'ostatne', description: 'Lekáreň', storeName: 'Lekáreň', date: new Date(year, month - 1, 6) },
  ]
  for (const e of expenses) {
    await db.expense.create({ data: e })
  }
  console.log('Vytvorené vzorové výdavky')

  // Previous month expenses for trend comparison
  const prevMonth = month === 1 ? 12 : month - 1
  const prevYear = month === 1 ? year - 1 : year
  const prevExpenses = [
    { userId: admin.id, amount: 430.00, category: 'jedlo', description: 'Nákupy minulý mesiac', storeName: 'Lidl', date: new Date(prevYear, prevMonth - 1, 15) },
    { userId: admin.id, amount: 95.00, category: 'zabava', description: 'Zábava', storeName: 'Kino', date: new Date(prevYear, prevMonth - 1, 10) },
    { userId: admin.id, amount: 210.00, category: 'domacnost', description: 'Domácnosť', storeName: 'OBI', date: new Date(prevYear, prevMonth - 1, 20) },
    { userId: admin.id, amount: 88.00, category: 'pes', description: 'Pes', storeName: 'PetCenter', date: new Date(prevYear, prevMonth - 1, 5) },
  ]
  for (const e of prevExpenses) {
    await db.expense.create({ data: e })
  }
  console.log('Vytvorené výdavky minulého mesiaca (trendy)')

  // Sample recipes
  const recipes = [
    {
      userId: admin.id,
      name: 'Hovädzí guláš',
      category: 'hlavne',
      ingredients: '500g hovädzie mäso\n2 cibule\n2 papriky\n400ml paradajkový pretlak\nPaprika mletá\nSoľ, korenie\nOlej\n2 strúčiky cesnaku',
      steps: JSON.stringify([
        'Nakrájajte hovädzie mäso na kocky.',
        'Nakrájajte cibuľu a opražte na oleji dozlatista.',
        'Pridajte mäso a opečte zo všetkých strán.',
        'Pridajte nakrájanú papriku, cesnak a paradajkový pretlak.',
        'Ochuťte paprikou, soľou a korením.',
        'Podlejte vodou a duste 1,5 hodiny pod pokrievkou.',
        'Podávajte s knedľou alebo chlebom.',
      ]),
    },
    {
      userId: admin.id,
      name: 'Rajčinová polievka',
      category: 'polievky',
      ingredients: '800g paradajky\n1 cibuľa\n2 strúčiky cesnaku\n500ml zeleninový vývar\n100ml smotana\nČerstvá bazalka\nSoľ, cukor, korenie',
      steps: JSON.stringify([
        'Nakrájajte cibuľu a cesnak, opražte na oleji.',
        'Pridajte nakrájané paradajky.',
        'Zalejte vývarom a varte 20 minút.',
        'Rozmixujte tyčovým mixérom do hladka.',
        'Ochutíte soľou a štipkou cukru.',
        'Pridajte smotanu a čerstvú bazalku.',
      ]),
    },
    {
      userId: admin.id,
      name: 'Cestoviny s tuniakom',
      category: 'rychle',
      ingredients: '300g cestoviny\n2 konzervy tuniaka (160g)\n200ml smotana na varenie\n1 cibuľa\n100g strúhaný syr\nSoľ, korenie\nOlej',
      steps: JSON.stringify([
        'Uvarte cestoviny podľa návodu (al dente).',
        'Nakrájajte cibuľu a opražte na oleji do sklovita.',
        'Pridajte odcedený tuniak a smotanu.',
        'Varte 5 minút, ochutte soľou a korením.',
        'Zmiešajte s odcedennými cestovinami.',
        'Posypte strúhaným syrom a podávajte.',
      ]),
    },
  ]
  for (const r of recipes) {
    await db.recipe.create({ data: r })
  }
  console.log('Vytvorené vzorové recepty')

  // Energy readings
  const months3 = [-2, -1, 0]
  for (const offset of months3) {
    const d = new Date(year, month - 1 + offset, 15)
    await db.energyReading.createMany({
      data: [
        { userId: admin.id, type: 'elektrina', value: 12450 + (2 - Math.abs(offset)) * 130, date: d },
        { userId: admin.id, type: 'plyn', value: 3210 + (2 - Math.abs(offset)) * 130, date: d },
        { userId: admin.id, type: 'voda', value: 890 + (2 - Math.abs(offset)) * 22, date: d },
      ],
    })
  }
  console.log('Vytvorené merania energií')

  // Sample notifications
  await db.notification.createMany({
    data: [
      {
        userId: admin.id,
        type: 'budget_warning',
        title: 'Blíži sa limit rozpočtu',
        message: 'Kategória Zábava dosiahla 80% mesačného rozpočtu.',
        read: false,
        data: JSON.stringify({ category: 'zabava', percent: 82 }),
      },
      {
        userId: admin.id,
        type: 'monthly_summary',
        title: 'Mesačný prehľad',
        message: 'Tento mesiac ste minuli celkovo 534,79 €. Najviac na kategóriu Jedlo.',
        read: true,
        data: JSON.stringify({ total: 534.79, topCategory: 'jedlo' }),
      },
    ],
  })
  console.log('Vytvorené vzorové notifikácie')

  console.log('\n✅ Databáza úspešne naplnená!')
  console.log('Prihlasovacie údaje:')
  console.log('  Admin:       admin / admin')
  console.log('  Používateľ:  pouzivatel / pouzivatel123')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await db.$disconnect() })
