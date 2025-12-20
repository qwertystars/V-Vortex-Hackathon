import { supabase } from '../../supabaseClient';

/**
 * Checks if a table exists in the public schema.
 * @param {string} tableName
 * @returns {Promise<boolean>}
 */
export async function checkTableExists(tableName) {
  // Try to select one row.
  const { error, status } = await supabase
    .from(tableName)
    .select('*')
    .limit(1);

  if (error) {
    // 42P01: PostgreSQL "relation does not exist"
    // PGRST205: PostgREST "Could not find the table ... in the schema cache"
    if (error.code === '42P01' || error.code === 'PGRST205') {
      return false;
    }
    // Also check generic message
    if (error.message && error.message.includes('Could not find the table')) {
        return false;
    }
  }
  
  // 404 from PostgREST usually means table not found (or endpoint not found)
  if (status === 404) {
      return false;
  }

  return true;
}

/**
 * Checks if a column exists in a table.
 * @param {string} tableName
 * @param {string} columnName
 * @returns {Promise<boolean>}
 */
export async function checkColumnExists(tableName, columnName) {
  // If table doesn't exist, column definitely doesn't.
  if (!await checkTableExists(tableName)) {
    return false;
  }

  // We try to select just that column.
  const { error } = await supabase
    .from(tableName)
    .select(columnName)
    .limit(1);

  if (error) {
    // 42703: PostgreSQL "undefined_column"
    // PGRST100: PostgREST "Could not find the ... column of ... in the schema cache"
    if (error.code === '42703' || error.code === 'PGRST100') {
      return false;
    }
    
    // Also check message just in case
    if (error.message && (error.message.includes('does not exist') || error.message.includes('Could not find the'))) {
      return false;
    }
  }
  return true;
}