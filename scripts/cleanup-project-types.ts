import 'dotenv/config'
import { prisma } from '../lib/prisma'

async function cleanupProjectTypes() {
  console.log('Cleaning up project types...\n')
  
  try {
    // First, show current state
    const currentTypes = await prisma.project_type.findMany({
      select: { project_type_id: true, project_type_name: true, description: true }
    })
    
    console.log('Current project types:')
    currentTypes.forEach(type => {
      console.log(`  - ID: ${type.project_type_id} | ${type.project_type_name}`)
    })
    console.log()
    
    // Delete IDP and UDP
    const toDelete = ['IDP', 'UDP']
    
    for (const typeName of toDelete) {
      const type = await prisma.project_type.findUnique({
        where: { project_type_name: typeName }
      })
      
      if (type) {
        // Check if any groups are using this type
        const groupsUsingType = await prisma.project_group.count({
          where: { project_type_id: type.project_type_id }
        })
        
        if (groupsUsingType > 0) {
          console.log(`⚠ Warning: ${groupsUsingType} project(s) are using type "${typeName}"`)
          console.log(`  Skipping deletion. Please reassign these projects first.`)
        } else {
          await prisma.project_type.delete({
            where: { project_type_name: typeName }
          })
          console.log(`✓ Deleted project type: ${typeName}`)
        }
      } else {
        console.log(`ℹ Project type "${typeName}" not found`)
      }
    }
    
    // Ensure the correct three types exist
    const correctTypes = [
      { project_type_name: 'Major', description: 'Major Project' },
      { project_type_name: 'Minor', description: 'Minor Project' },
      { project_type_name: 'Research', description: 'Research Project' }
    ]
    
    console.log('\nEnsuring correct project types exist...')
    for (const type of correctTypes) {
      const existing = await prisma.project_type.findUnique({
        where: { project_type_name: type.project_type_name }
      })
      
      if (!existing) {
        await prisma.project_type.create({ data: type })
        console.log(`✓ Created project type: ${type.project_type_name}`)
      } else {
        console.log(`✓ ${type.project_type_name} already exists`)
      }
    }
    
    // Show final state
    const finalTypes = await prisma.project_type.findMany({
      select: { project_type_id: true, project_type_name: true, description: true },
      orderBy: { project_type_name: 'asc' }
    })
    
    console.log('\n=================================')
    console.log('Final project types in database:')
    console.log('=================================')
    finalTypes.forEach(type => {
      console.log(`  ${type.project_type_name} - ${type.description}`)
    })
    
  } catch (error) {
    console.error('Error cleaning up project types:', error)
    throw error
  }
}

cleanupProjectTypes()
  .then(async () => {
    await prisma.$disconnect()
    console.log('\n✓ Cleanup completed successfully')
  })
  .catch(async (e) => {
    console.error('\n✗ Cleanup failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
