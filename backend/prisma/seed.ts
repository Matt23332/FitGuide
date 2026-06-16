import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  const user = await prisma.user.upsert({
    where: { email: 'demo@fitguide.ai' },
    update: {},
    create: {
      email: 'demo@fitguide.ai',
      profile: {
        create: {
          age: 28,
          weight: 72,
          height: 175,
          gender: 'male',
          occupation: 'Office worker',
          goal: 'lose_weight',
          workouts: ['gym', 'running'],
          preferredTime: 'Morning',
          diet: 'non_vegetarian',
          daysPerWeek: 4,
          sessionDuration: '45-60 min',
          experienceLevel: 'intermediate',
        },
      },
    },
  })

  console.log(`✅ Seeded demo user: ${user.email}`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
