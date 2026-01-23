const { PrismaClient } = require(require('path').join(__dirname, 'node_modules/@prisma/client'))

const prisma = new PrismaClient()

async function main() {
  const projectTypes = [
    {
      project_type_name: 'IDP',
      description: 'Industry Defined Project'
    },
    {
      project_type_name: 'UDP',
      description: 'User Defined Project'
    }
  ]

  for (const type of projectTypes) {
    const existingType = await prisma.project_type.findUnique({
      where: { project_type_name: type.project_type_name }
    })

    if (!existingType) {
        await prisma.project_type.create({
            data: type
        })
        console.log(`Created project type: ${type.project_type_name}`)
    } else {
        console.log(`Project type already exists: ${type.project_type_name}`)
    }
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
