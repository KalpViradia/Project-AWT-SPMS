
import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  const password = await bcrypt.hash('password123', 10);

  // Upsert Student
  const student = await prisma.student.upsert({
    where: { email: 'student@test.com' },
    update: { password },
    create: {
      student_name: 'Test Student',
      email: 'student@test.com',
      password,
      phone: '1234567890',
      role: 'student'
    },
  });
  console.log({ student });

  // Upsert Faculty
  const faculty = await prisma.staff.upsert({
    where: { email: 'faculty@test.com' },
    update: { 
        password,
        role: 'faculty' 
    },
    create: {
      staff_name: 'Test Faculty',
      email: 'faculty@test.com',
      password,
      role: 'faculty', // matches auth.ts lowercase check
      phone: '0987654321'
    },
  });
  console.log({ faculty });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
