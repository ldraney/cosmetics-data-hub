const fs = require('fs');
const path = require('path');

// Import the CSV processing function
const { importFormulasFromCsv } = require('../lib/csv-import.ts');

async function testImport() {
  try {
    const csvPath = '/Users/earthharbor/projects/pel-formula-database-2/pure_earth_labs_formulas_FINAL.csv';
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    
    console.log('Starting CSV import...');
    console.log(`CSV file size: ${csvContent.length} characters`);
    
    const result = await importFormulasFromCsv(csvContent);
    
    console.log('Import completed!');
    console.log(`Success: ${result.success}`);
    console.log(`Formulas imported: ${result.formulasImported}`);
    console.log(`Ingredients imported: ${result.ingredientsImported}`);
    
    if (result.errors.length > 0) {
      console.log('Errors:');
      result.errors.forEach(error => console.log(`  - ${error}`));
    }
    
    if (result.warnings.length > 0) {
      console.log('Warnings:');
      result.warnings.forEach(warning => console.log(`  - ${warning}`));
    }
    
  } catch (error) {
    console.error('Test import failed:', error);
  }
}

testImport();