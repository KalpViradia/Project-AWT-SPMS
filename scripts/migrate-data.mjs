import pg from 'pg';

const localUrl = "postgresql://project_tracker_user:123456@localhost:5432/project_tracker?schema=public";
const remoteUrl = "postgresql://neondb_owner:npg_iO8N6GpwZYSb@ep-muddy-glade-a1fza6o8-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";

// Connect to both databases
const localClient = new pg.Client({ connectionString: localUrl });
const remoteClient = new pg.Client({ connectionString: remoteUrl });

const tables = [
    'department',
    'project_type',
    'staff',
    'student',
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

async function migrate() {
    console.log("Starting Neon DB Data Migration...");
    await localClient.connect();
    await remoteClient.connect();

    for (const table of tables) {
        process.stdout.write(`Migrating [${table}]... `);
        try {
            const { rows: localRows } = await localClient.query(`SELECT * FROM "${table}";`);
            if (localRows.length === 0) {
                console.log(`0 rows. Skipped.`);
                continue;
            }

            // Get target table columns to handle schema drift (e.g. academic_year_id omitted)
            const { rows: columnsRes } = await remoteClient.query(`
                SELECT column_name
                FROM information_schema.columns
                WHERE table_name = '${table}' AND table_schema = 'public';
            `);
            const targetCols = columnsRes.map(r => r.column_name);

            if (targetCols.length === 0) {
                console.log(`Table does not exist on target. Skipped.`);
                continue;
            }

            await remoteClient.query(`DELETE FROM "${table}";`);

            // Find overlapping columns
            const sourceCols = Object.keys(localRows[0]);
            const columns = sourceCols.filter(c => targetCols.includes(c));

            for (const row of localRows) {
                const values = columns.map(c => row[c]);
                const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
                const colsStr = columns.map(c => `"${c}"`).join(', ');
                
                await remoteClient.query(
                    `INSERT INTO "${table}" (${colsStr}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`,
                    values
                );
            }
            console.log(`${localRows.length} rows inserted.`);
        } catch (err) {
            console.log(`\n  x Error on table ${table}:`, err.message);
        }
    }

    console.log("Migration complete!");
    await localClient.end();
    await remoteClient.end();
}

migrate().catch(e => {
    console.error(e);
    process.exit(1);
});
