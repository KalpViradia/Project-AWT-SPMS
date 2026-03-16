import { PrismaClient } from '@prisma/client/extension';

const localUrl = "postgresql://project_tracker_user:123456@localhost:5432/project_tracker?schema=public";
const remoteUrl = "postgresql://neondb_owner:npg_iO8N6GpwZYSb@ep-muddy-glade-a1fza6o8-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

const localDb = new PrismaClient({
    datasources: { db: { url: localUrl } }
});

const remoteDb = new PrismaClient({
    datasources: { db: { url: remoteUrl } }
});

// Tables in topological order to respect foreign keys
const tables = [
    'department',
    'project_type',
    'academic_year',
    'staff',
    'student',
    'admin',
    'project_group',
    'project_group_member',
    'project_meeting',
    'project_meeting_attendance',
    'weekly_report',
    'project_document',
    'project_invitation',
    'discussion_message',
    'project_task',
    'project_milestone',
    'proposal_feedback'
];

async function migrateData() {
    console.log("Starting data migration from local to Neon DB...");

    for (const table of tables) {
        console.log(`Migrating table: ${table}...`);
        
        try {
            // @ts-ignore
            const records = await localDb[table].findMany();
            
            if (records.length === 0) {
                console.log(`  Skipped ${table} (0 records)`);
                continue;
            }

            // @ts-ignore
            await remoteDb[table].createMany({
                data: records,
                skipDuplicates: true // In case we run this multiple times
            });
            
            console.log(`  ✓ Migrated ${records.length} records to ${table}.`);
        } catch (error) {
            console.error(`  x Error migrating ${table}:`, error);
            // Optionally continue or throw based on preference
        }
    }

    console.log("Migration complete!");
    await localDb.$disconnect();
    await remoteDb.$disconnect();
}

migrateData().catch(e => {
    console.error(e);
    process.exit(1);
});
