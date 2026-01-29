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

// ============== Project Type Actions ==============
const ProjectTypeSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
});

export async function createProjectType(formData: FormData) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== 'admin') {
    throw new Error('Unauthorized');
  }

  const validatedFields = ProjectTypeSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description'),
  });

  if (!validatedFields.success) {
    throw new Error('Invalid fields');
  }

  const { name, description } = validatedFields.data;

  await prisma.project_type.create({
    data: {
      project_type_name: name,
      description: description || null,
    },
  });

  revalidatePath('/dashboard/admin/project-types');
}

export async function updateProjectType(formData: FormData) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== 'admin') {
    throw new Error('Unauthorized');
  }

  const id = parseInt(formData.get('id') as string);
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;

  await prisma.project_type.update({
    where: { project_type_id: id },
    data: {
      project_type_name: name,
      description: description || null,
      modified_at: new Date(),
    },
  });

  revalidatePath('/dashboard/admin/project-types');
}

export async function deleteProjectType(formData: FormData) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== 'admin') {
    throw new Error('Unauthorized');
  }

  const id = parseInt(formData.get('id') as string);

  await prisma.project_type.delete({
    where: { project_type_id: id },
  });

  revalidatePath('/dashboard/admin/project-types');
}

// ============== Academic Year Actions ==============
const AcademicYearSchema = z.object({
  yearName: z.string().min(2),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  isCurrent: z.coerce.boolean().optional(),
});

export async function createAcademicYear(formData: FormData) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== 'admin') {
    throw new Error('Unauthorized');
  }

  const validatedFields = AcademicYearSchema.safeParse({
    yearName: formData.get('yearName'),
    startDate: formData.get('startDate'),
    endDate: formData.get('endDate'),
    isCurrent: formData.get('isCurrent') === 'true',
  });

  if (!validatedFields.success) {
    throw new Error('Invalid fields');
  }

  const { yearName, startDate, endDate, isCurrent } = validatedFields.data;

  // If setting as current, unset other current years
  if (isCurrent) {
    await prisma.academic_year.updateMany({
      where: { is_current: true },
      data: { is_current: false },
    });
  }

  await prisma.academic_year.create({
    data: {
      year_name: yearName,
      start_date: startDate ? new Date(startDate) : null,
      end_date: endDate ? new Date(endDate) : null,
      is_current: isCurrent || false,
    },
  });

  revalidatePath('/dashboard/admin/academic-years');
}

export async function updateAcademicYear(formData: FormData) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== 'admin') {
    throw new Error('Unauthorized');
  }

  const id = parseInt(formData.get('id') as string);
  const yearName = formData.get('yearName') as string;
  const startDate = formData.get('startDate') as string;
  const endDate = formData.get('endDate') as string;
  const isCurrent = formData.get('isCurrent') === 'true';

  // If setting as current, unset other current years
  if (isCurrent) {
    await prisma.academic_year.updateMany({
      where: { is_current: true, academic_year_id: { not: id } },
      data: { is_current: false },
    });
  }

  await prisma.academic_year.update({
    where: { academic_year_id: id },
    data: {
      year_name: yearName,
      start_date: startDate ? new Date(startDate) : null,
      end_date: endDate ? new Date(endDate) : null,
      is_current: isCurrent,
      modified_at: new Date(),
    },
  });

  revalidatePath('/dashboard/admin/academic-years');
}

export async function deleteAcademicYear(formData: FormData) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== 'admin') {
    throw new Error('Unauthorized');
  }

  const id = parseInt(formData.get('id') as string);

  await prisma.academic_year.delete({
    where: { academic_year_id: id },
  });

  revalidatePath('/dashboard/admin/academic-years');
}

// ============== Department Actions ==============
const DepartmentSchema = z.object({
  name: z.string().min(2),
  code: z.string().optional(),
});

export async function createDepartment(formData: FormData) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== 'admin') {
    throw new Error('Unauthorized');
  }

  const validatedFields = DepartmentSchema.safeParse({
    name: formData.get('name'),
    code: formData.get('code'),
  });

  if (!validatedFields.success) {
    throw new Error('Invalid fields');
  }

  const { name, code } = validatedFields.data;

  await prisma.department.create({
    data: {
      department_name: name,
      department_code: code || null,
    },
  });

  revalidatePath('/dashboard/admin/departments');
}

export async function updateDepartment(formData: FormData) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== 'admin') {
    throw new Error('Unauthorized');
  }

  const id = parseInt(formData.get('id') as string);
  const name = formData.get('name') as string;
  const code = formData.get('code') as string;

  await prisma.department.update({
    where: { department_id: id },
    data: {
      department_name: name,
      department_code: code || null,
      modified_at: new Date(),
    },
  });

  revalidatePath('/dashboard/admin/departments');
}

export async function deleteDepartment(formData: FormData) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== 'admin') {
    throw new Error('Unauthorized');
  }

  const id = parseInt(formData.get('id') as string);

  await prisma.department.delete({
    where: { department_id: id },
  });

  revalidatePath('/dashboard/admin/departments');
}
