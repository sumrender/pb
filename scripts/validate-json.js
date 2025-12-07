const fs = require('fs');
const path = require('path');

/**
 * Recursively find all JSON files in a directory
 */
function findJsonFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      findJsonFiles(filePath, fileList);
    } else if (file.endsWith('.json')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

/**
 * Validate a single JSON file
 */
function validateJsonFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    JSON.parse(content);
    return { valid: true };
  } catch (error) {
    return { 
      valid: false, 
      error: error.message,
      line: error.message.match(/line (\d+)/)?.[1] || 'unknown'
    };
  }
}

/**
 * Main validation function
 */
function validateAllJsonFiles() {
  const assetsDir = path.join(__dirname, '../src/assets');
  
  if (!fs.existsSync(assetsDir)) {
    console.error('❌ Assets directory not found:', assetsDir);
    process.exit(1);
  }
  
  console.log('🔍 Validating JSON files in src/assets...\n');
  
  const jsonFiles = findJsonFiles(assetsDir);
  let hasErrors = false;
  let validCount = 0;
  let errorCount = 0;
  
  jsonFiles.forEach(filePath => {
    const relativePath = path.relative(assetsDir, filePath);
    const result = validateJsonFile(filePath);
    
    if (result.valid) {
      console.log(`✓ ${relativePath}`);
      validCount++;
    } else {
      console.error(`✗ ${relativePath}`);
      console.error(`  Error: ${result.error}\n`);
      hasErrors = true;
      errorCount++;
    }
  });
  
  console.log(`\n${'─'.repeat(50)}`);
  console.log(`Total files: ${jsonFiles.length}`);
  console.log(`Valid: ${validCount}`);
  console.log(`Invalid: ${errorCount}`);
  console.log('─'.repeat(50));
  
  if (hasErrors) {
    console.error('\n❌ JSON validation failed\n');
    process.exit(1);
  } else {
    console.log('\n✅ All JSON files are valid\n');
    process.exit(0);
  }
}

// Run validation
validateAllJsonFiles();
