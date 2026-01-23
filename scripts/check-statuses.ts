import 'dotenv/config'
import { prisma } from '../lib/prisma'

async function checkStatuses() {
  const groups = await prisma.project_group.findMany({
    select: {
      project_group_id: true,
      project_group_name: true,
      status: true
    }
  })

  console.log('All project groups and their statuses:')
  console.log('=====================================')
  groups.forEach(g => {
    console.log(`ID: ${g.project_group_id} | Status: "${g.status}" | Name: ${g.project_group_name}`)
  })

  // Get unique status values  
  const statuses = [...new Set(groups.map(g => g.status))]
  console.log('\nUnique status values in database:', statuses)
}

checkStatuses()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
