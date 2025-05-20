const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');
const os = require('os');

async function testSqlite() {
  console.log('Testing SQLite connection...');
  
  try {
    // Create a temporary database in the OS temp directory
    const dbPath = path.join(os.tmpdir(), 'test-sqlite.db');
    console.log(`Using test database at: ${dbPath}`);
    
    // Open the database
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });
    
    // Create a test table
    await db.exec('CREATE TABLE IF NOT EXISTS test (id INTEGER PRIMARY KEY, name TEXT)');
    
    // Insert a test row
    await db.run('INSERT INTO test (name) VALUES (?)', 'Test Entry');
    
    // Query the test row
    const result = await db.get('SELECT * FROM test WHERE name = ?', 'Test Entry');
    
    console.log('Test query result:', result);
    
    // Close the database
    await db.close();
    
    console.log('SQLite test completed successfully!');
    return true;
  } catch (error) {
    console.error('SQLite test failed:', error);
    return false;
  }
}

testSqlite()
  .then(success => {
    if (success) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });