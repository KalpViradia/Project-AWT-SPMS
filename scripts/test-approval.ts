import 'dotenv/config'
import { prisma } from '../lib/prisma'

async function testDirectUpdate() {
  // Reset group 2 to pending
  console.log('Step 1: Resetting group 2 to pending...')
  await prisma.project_group.update({
    where: { project_group_id: 2 },
    data: {
      status: 'pending',
      proposal_reviewed_at: null,
      proposal_reviewed_by: null,
      rejection_reason: null
    }
  })
  console.log('✓ Reset to pending\n')

  // Try to approve it
  console.log('Step 2: Attempting to approve (status = "approved")...')
  try {
    const result = await prisma.project_group.update({
      where: { project_group_id: 2 },
      data: {
        status: 'approved',
        proposal_reviewed_at: new Date(),
        proposal_reviewed_by: 1, // Assuming staff ID 1 exists
        modified_at: new Date()
      },
      select: {
        project_group_id: true,
        status: true,
        project_group_name: true
      }
    })
    console.log('✓ SUCCESS! Approved:', result)
  } catch (error: any) {
    console.error('✗ FAILED!', error.message)
    console.error('Error code:', error.code)
    console.error('Full error:', error)
  }
}

testDirectUpdate()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('Unexpected error:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
