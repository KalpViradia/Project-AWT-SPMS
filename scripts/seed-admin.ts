
import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  const email = 'admin@example.com';
  const password = 'adminpassword';
  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = await prisma.staff.upsert({
    where: { email: email },
    update: {},
    create: {
      staff_name: 'System Admin',
      email: email,
      password: hashedPassword,
      role: 'admin',
      description: 'System Administrator',
      phone: '0000000000'
    },
  });

  console.log({ admin });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
