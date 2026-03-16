import 'dotenv/config'
import { prisma } from '../lib/prisma'

async function main() {
  // 1. Seed departments
  const departments = [
    { department_name: 'Computer Engineering', department_code: 'CE' },
    { department_name: 'Information Technology', department_code: 'IT' },
    { department_name: 'Computer Science & Engineering', department_code: 'CSE' },
    { department_name: 'Electronics & Communication', department_code: 'EC' },
    { department_name: 'Mechanical Engineering', department_code: 'ME' },
    { department_name: 'Civil Engineering', department_code: 'CIVIL' },
  ]

  const createdDepts: { department_id: number; department_code: string | null }[] = []

  for (const dept of departments) {
    const d = await prisma.department.upsert({
      where: { department_name: dept.department_name },
      update: { department_code: dept.department_code },
      create: dept,
    })
    createdDepts.push(d)
    console.log(`✅ Department: ${dept.department_name} (${dept.department_code})`)
  }

  // 2. Assign departments to existing faculty/staff who don't have one
  const staffWithoutDept = await prisma.staff.findMany({
    where: { department_id: null },
  })

  if (staffWithoutDept.length === 0) {
    console.log('\nAll staff already have departments assigned.')
  } else {
    // Assign departments in round-robin across CE, IT, CSE
    const techDepts = createdDepts.filter(d =>
      ['CE', 'IT', 'CSE'].includes(d.department_code || '')
    )

    for (let i = 0; i < staffWithoutDept.length; i++) {
      const dept = techDepts[i % techDepts.length]
      await prisma.staff.update({
        where: { staff_id: staffWithoutDept[i].staff_id },
        data: { department_id: dept.department_id },
      })
      console.log(`✅ Assigned ${staffWithoutDept[i].staff_name} → dept_id ${dept.department_id} (${dept.department_code})`)
    }
  }

  console.log('\n🎉 Department seeding complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
