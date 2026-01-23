
import { prisma } from "../lib/prisma"

async function main() {
    console.log("Testing connection...");
    try {
        await prisma.$connect();
        console.log("Successfully connected to database!");
        const count = await prisma.project_group.count();
        console.log(`Found ${count} project groups.`);
    } catch (e: any) {
        console.error("Connection failed:", e.message);
        const fs = require('fs');
        fs.writeFileSync('debug_output.txt', e.message + "\n" + JSON.stringify(e, null, 2));
    } finally {
        await prisma.$disconnect();
    }
}

main();
