'use server'
import { auth } from "@/auth";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { createNotification } from "./notification-actions";

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
    const updatedGroup = await prisma.project_group.update({
      where: { project_group_id: groupId },
      data: {
        // Connect selected faculty as guide (mentor) for this project group
        staff_project_group_guide_staff_idTostaff: { connect: { staff_id: guideId } },
        modified_at: new Date(),
      },
      include: {
        project_group_member: true
      }
    });

    // Notify guide
    await createNotification({
      userId: guideId,
      userRole: 'faculty',
      title: 'Admin Assigned Guide',
      message: `Admin has assigned you as a guide for "${updatedGroup.project_title}".`,
      link: '/dashboard/faculty/groups',
    });

    // Notify members
    for (const member of updatedGroup.project_group_member) {
      await createNotification({
        userId: member.student_id,
        userRole: 'student',
        title: 'Guide Assigned',
        message: `Your project group has been assigned a new guide by the Admin.`,
        link: '/dashboard/student/my-group',
      });
    }
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
