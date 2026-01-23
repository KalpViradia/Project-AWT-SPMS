import 'dotenv/config'
import { prisma } from '../lib/prisma'

async function main() {
  const projectTypes = [
    {
      project_type_name: 'Major',
      description: 'Major Project'
    },
    {
      project_type_name: 'Minor',
      description: 'Minor Project'
    },
    {
      project_type_name: 'Research',
      description: 'Research Project'
    }
  ]

  for (const type of projectTypes) {
    await prisma.project_type.upsert({
      where: { project_type_name: type.project_type_name },
      update: {}, // Don't update if exists
      create: type
    })
    console.log(`Ensured project type exists: ${type.project_type_name}`)
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
