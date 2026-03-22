import { Client } from 'pg';

async function migrate() {
    const supabaseClient = new Client({
        connectionString: "postgresql://postgres.vuyljlduaiqkssjlvmfg:born2code240124@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres",
    });
    const localClient = new Client({
        host: "localhost",
        port: 5435,
        user: "admin",
        password: "password123",
          database: "Finalproy1_dev",
    });

    try {
        await supabaseClient.connect();
        await localClient.connect();

        console.log("✅ Connected to both databases.");

        // Disable foreign key triggers for safe fast inserts in arbitrary order
        await localClient.query("SET session_replication_role = 'replica';");

        const tableRes = await supabaseClient.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
              AND table_type = 'BASE TABLE'
        `);
        
        const tables = tableRes.rows.map(r => r.table_name);
        console.log("📋 Tables to migrate:", tables);

        for (const table of tables) {
            console.log(`🔄 Migrating table: ${table}...`);
            
            // Truncate local table first using CASCADE safely
            await localClient.query(`TRUNCATE TABLE "${table}" CASCADE;`);

            const dataRes = await supabaseClient.query(`SELECT * FROM "${table}"`);
            const rows = dataRes.rows;

            if (rows.length === 0) {
                console.log(`   └─ ⚪ Empty table.`);
                continue;
            }

            const columns = Object.keys(rows[0]).map(c => `"${c}"`).join(", ");
            
            for (const row of rows) {
                const values = Object.values(row).map(v => {
                    if (v && typeof v === 'object') {
                        return JSON.stringify(v);
                    }
                    return v;
                });
                const placeholders = values.map((_, idx) => `$${idx + 1}`).join(", ");
                
                await localClient.query(
                    `INSERT INTO "${table}" (${columns}) VALUES (${placeholders})`,
                    values
                ).catch(err => {
                    console.error(`   ❌ Failed to insert into ${table}:`, err.message);
                });
            }
            console.log(`   └─ ✅ Migrated ${rows.length} rows.`);
        }

        await localClient.query("SET session_replication_role = 'origin';");
        console.log("🎉 Data migration complete successfully!");

    } catch (error) {
        console.error("🚨 Migration failed:", error);
    } finally {
        await supabaseClient.end();
        await localClient.end();
    }
}

migrate();
