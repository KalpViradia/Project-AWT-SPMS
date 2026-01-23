import 'dotenv/config'
import { prisma } from '../lib/prisma'

async function verifyProjectTypes() {
  const types = await prisma.project_type.findMany({
    select: { 
      project_type_id: true,
      project_type_name: true, 
      description: true 
    },
    orderBy: { project_type_name: 'asc' }
  })
  
  console.log('Current Project Types in Database:')
  console.log('===================================')
  types.forEach(type => {
    console.log(`ID: ${type.project_type_id} | Name: ${type.project_type_name} | Description: ${type.description}`)
  })
  
  return types
}

verifyProjectTypes()
  .then(async (types) => {
    await prisma.$disconnect()
    
    const typeNames = types.map(t => t.project_type_name)
    const expected = ['Major', 'Minor', 'Research']
    const isCorrect = expected.every(name => typeNames.includes(name)) && typeNames.length === 3
    
    if (isCorrect) {
      console.log('\n✓ Project types are correctly set to: Major, Minor, Research')
    } else {
      console.log('\n✗ Warning: Project types do not match expected values')
      console.log('Expected:', expected)
      console.log('Found:', typeNames)
    }
  })
  .catch(async (e) => {
    console.error('Error:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
