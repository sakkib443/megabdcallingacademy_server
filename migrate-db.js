/**
 * 🔄 Database Migration Script
 * পুরানো DB (bac_main_db) → নতুন DB (megabdcallingacademy-bd)
 * সব collections এর সব data copy করবে
 */

const { MongoClient } = require('mongodb');

const OLD_DB_URL = 'mongodb+srv://bac_main_db:bac_main_db@cluster0.mspodzi.mongodb.net/bac_main_db?appName=Cluster0';
const NEW_DB_URL = 'mongodb+srv://megabdcallingacademy-bd:megabdcallingacademy-bd@cluster0.b5kfivm.mongodb.net/megabdcallingacademy-bd?appName=Cluster0';

async function migrateDatabase() {
  let oldClient, newClient;

  try {
    console.log('🔌 Connecting to OLD database...');
    oldClient = new MongoClient(OLD_DB_URL);
    await oldClient.connect();
    const oldDb = oldClient.db();
    console.log('✅ Connected to OLD database:', oldDb.databaseName);

    console.log('🔌 Connecting to NEW database...');
    newClient = new MongoClient(NEW_DB_URL);
    await newClient.connect();
    const newDb = newClient.db();
    console.log('✅ Connected to NEW database:', newDb.databaseName);

    // Get all collections from old DB
    const collections = await oldDb.listCollections().toArray();
    console.log(`\n📦 Found ${collections.length} collections to migrate:\n`);

    let totalDocs = 0;

    for (const collectionInfo of collections) {
      const collName = collectionInfo.name;

      // Skip system collections
      if (collName.startsWith('system.')) {
        console.log(`  ⏩ Skipping system collection: ${collName}`);
        continue;
      }

      const oldCollection = oldDb.collection(collName);
      const newCollection = newDb.collection(collName);

      // Get all documents from old collection
      const documents = await oldCollection.find({}).toArray();

      if (documents.length === 0) {
        console.log(`  📭 ${collName}: 0 documents (empty, skipping)`);
        continue;
      }

      // Clear new collection first (in case re-running)
      await newCollection.deleteMany({});

      // Insert all documents into new collection
      const result = await newCollection.insertMany(documents);
      totalDocs += result.insertedCount;

      console.log(`  ✅ ${collName}: ${result.insertedCount} documents migrated`);
    }

    // Also copy indexes
    console.log('\n📑 Copying indexes...\n');
    for (const collectionInfo of collections) {
      const collName = collectionInfo.name;
      if (collName.startsWith('system.')) continue;

      const oldCollection = oldDb.collection(collName);
      const newCollection = newDb.collection(collName);

      const indexes = await oldCollection.indexes();
      for (const index of indexes) {
        if (index.name === '_id_') continue; // Skip default _id index

        try {
          const { key, ...options } = index;
          delete options.v;
          delete options.ns;
          await newCollection.createIndex(key, options);
          console.log(`  📑 ${collName}: Index "${index.name}" created`);
        } catch (err) {
          console.log(`  ⚠️  ${collName}: Index "${index.name}" — ${err.message}`);
        }
      }
    }

    console.log(`\n🎉 Migration Complete!`);
    console.log(`📊 Total: ${totalDocs} documents migrated across ${collections.length} collections`);

  } catch (error) {
    console.error('❌ Migration Error:', error.message);
  } finally {
    if (oldClient) await oldClient.close();
    if (newClient) await newClient.close();
    console.log('\n🔒 Database connections closed');
  }
}

migrateDatabase();
