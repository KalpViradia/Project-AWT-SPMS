'use server'
import { auth } from "@/auth";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

const CreateStudentSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export async function createStudent(formData: FormData) {
  const validatedFields = CreateStudentSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!validatedFields.success) {
    throw new Error('Invalid fields');
  }

  const { name, email, password } = validatedFields.data;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await prisma.student.create({
      data: {
        student_name: name,
        email: email,
        password: hashedPassword,
        role: 'student',
      },
    });
  } catch (error) {
    console.error('Failed to create student:', error);
    throw new Error('Failed to create student. Email might already exist.');
  }

  revalidatePath('/dashboard/admin/users');
}

const CreateStaffSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  // Only two staff roles in the system: faculty and admin
  role: z.enum(['faculty', 'admin']),
});

export async function createStaff(formData: FormData) {
  const validatedFields = CreateStaffSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
    role: formData.get('role'),
  });

  if (!validatedFields.success) {
    throw new Error('Invalid fields');
  }

  const { name, email, password, role } = validatedFields.data;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await prisma.staff.create({
      data: {
        staff_name: name,
        email: email,
        password: hashedPassword,
        role: role,
      },
    });
  } catch (error) {
    console.error('Failed to create staff:', error);
    throw new Error('Failed to create staff. Email might already exist.');
  }

  revalidatePath('/dashboard/admin/users');
}

const AssignGuideAdminSchema = z.object({
  groupId: z.coerce.number(),
  guideId: z.coerce.number(),
});

export async function assignGuideAsAdmin(formData: FormData) {
  const session = await auth();
  if (!session || !session.user) {
    throw new Error('Unauthorized');
  }

  const userRole = (session.user as { role?: string }).role;
  if (userRole !== 'admin') {
    throw new Error('Unauthorized');
  }

  const validatedFields = AssignGuideAdminSchema.safeParse({
    groupId: formData.get('groupId'),
    guideId: formData.get('guideId'),
  });

  if (!validatedFields.success) {
    throw new Error('Invalid fields');
  }

  const { groupId, guideId } = validatedFields.data;

  try {
    await prisma.project_group.update({
      where: { project_group_id: groupId },
      data: {
        // Connect selected faculty as guide (mentor) for this project group
        staff_project_group_guide_staff_idTostaff: { connect: { staff_id: guideId } },
        modified_at: new Date(),
      },
    });
  } catch (error) {
    console.error('Failed to assign guide as admin:', error);
    throw new Error('Failed to assign guide');
  }

  revalidatePath('/dashboard/admin');
}
