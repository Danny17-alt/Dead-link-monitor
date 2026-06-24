const { execFileSync } = require('child_process');

const query = (sql) => {
  try {
    // Use execFileSync to avoid shell expansion issues with $ characters in bcrypt hashes
    const result = execFileSync('team-db', [sql], { encoding: 'utf8' });
    return JSON.parse(result);
  } catch (error) {
    console.error('Database Error:', error.message);
    if (error.stdout) {
      console.error('Stdout:', error.stdout);
    }
    if (error.stderr) {
      console.error('Stderr:', error.stderr);
    }
    throw error;
  }
};

const escape = (val) => {
  if (typeof val === 'string') {
    return val.replace(/'/g, "''");
  }
  return val;
};

module.exports = { query, escape };
