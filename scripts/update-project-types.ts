import 'dotenv/config'
import { prisma } from '../lib/prisma'

async function updateProjectTypes() {
  console.log('Updating project types from Mini to Minor...')
  
  try {
    // Check if 'Mini' type exists
    const miniType = await prisma.project_type.findUnique({
      where: { project_type_name: 'Mini' }
    })

    if (miniType) {
      // Update 'Mini' to 'Minor'
      await prisma.project_type.update({
        where: { project_type_name: 'Mini' },
        data: { 
          project_type_name: 'Minor',
          description: 'Minor Project'
        }
      })
      console.log('✓ Successfully updated Mini to Minor')
    } else {
      console.log('ℹ Mini type not found in database')
      
      // Check if Minor already exists
      const minorType = await prisma.project_type.findUnique({
        where: { project_type_name: 'Minor' }
      })
      
      if (!minorType) {
        console.log('Creating Minor project type...')
        await prisma.project_type.create({
          data: {
            project_type_name: 'Minor',
            description: 'Minor Project'
          }
        })
        console.log('✓ Created Minor project type')
      } else {
        console.log('✓ Minor project type already exists')
      }
    }

    // Verify final state
    const allTypes = await prisma.project_type.findMany({
      select: { project_type_name: true, description: true }
    })
    
    console.log('\nCurrent project types in database:')
    allTypes.forEach(type => {
      console.log(`  - ${type.project_type_name}: ${type.description}`)
    })
    
  } catch (error) {
    console.error('Error updating project types:', error)
    throw error
  }
}

updateProjectTypes()
  .then(async () => {
    await prisma.$disconnect()
    console.log('\n✓ Migration completed successfully')
  })
  .catch(async (e) => {
    console.error('\n✗ Migration failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
