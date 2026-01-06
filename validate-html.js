/**
 * HTML Validation Script
 * Kiểm tra tính hợp lệ của file HTML
 */

const fs = require('fs');
const path = require('path');

function validateHTML(filePath) {
  console.log(`🔍 Validating HTML: ${filePath}`);
  
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    return false;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  console.log(`📄 Total lines: ${lines.length}`);
  
  // Check for common HTML issues
  let hasErrors = false;
  
  lines.forEach((line, index) => {
    const lineNum = index + 1;
    
    // Check for unquoted attributes
    const unquotedAttrRegex = /\s+\w+=[^"'\s>]+[\s>]/g;
    if (unquotedAttrRegex.test(line)) {
      console.error(`❌ Line ${lineNum}: Unquoted attribute detected`);
      console.error(`   ${line.trim()}`);
      hasErrors = true;
    }
    
    // Check for malformed meta viewport
    if (line.includes('viewport') && line.includes('content=')) {
      const viewportRegex = /content=["']([^"']+)["']/;
      if (!viewportRegex.test(line)) {
        console.error(`❌ Line ${lineNum}: Malformed viewport meta tag`);
        console.error(`   ${line.trim()}`);
        hasErrors = true;
      }
    }
  });
  
  if (!hasErrors) {
    console.log('✅ HTML validation passed!');
    return true;
  }
  
  return false;
}

// Validate both files
console.log('🚀 Starting HTML validation...\n');

const files = [
  'index.html',
  'dist/index.html'
];

let allValid = true;

files.forEach(file => {
  if (!validateHTML(file)) {
    allValid = false;
  }
  console.log('');
});

if (allValid) {
  console.log('🎉 All HTML files are valid!');
  process.exit(0);
} else {
  console.log('💥 HTML validation failed!');
  process.exit(1);
}