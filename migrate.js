require('dotenv').config();
const fs = require('fs');
const path = require('path');

// Get the migration file path from command line arguments
const migrationFile = process.argv[2];
const direction = process.argv[3]; // 'up' or 'down'

if (!migrationFile || !direction) {
    console.error('Usage: node migrate.js <migration-file> <up|down>');
    process.exit(1);
}

const migrationPath = path.join(__dirname, 'migrations', migrationFile);

if (!fs.existsSync(migrationPath)) {
    console.error(`Migration file ${migrationFile} not found`);
    process.exit(1);
}

const migration = require(migrationPath);

async function runMigration() {
    try {
        if (direction === 'up') {
            console.log(`Running migration up: ${migrationFile}`);
            await migration.up();
        } else if (direction === 'down') {
            console.log(`Running migration down: ${migrationFile}`);
            await migration.down();
        } else {
            console.error('Direction must be either "up" or "down"');
            process.exit(1);
        }
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

runMigration(); 