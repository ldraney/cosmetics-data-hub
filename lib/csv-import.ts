import { parse } from 'csv-parse';
import pool from './db';
import { z } from 'zod';

const FormulaCsvRowSchema = z.object({
  'Formula Name': z.string().min(1, 'Formula name is required'),
  'Ingredient': z.string().min(1, 'Ingredient name is required'),
  'Percentage': z.string().transform((val) => {
    // Remove % sign and quotes, then convert to number
    const cleanVal = val.replace(/["%]/g, '').trim();
    return parseFloat(cleanVal) || 0;
  })
});

export type FormulaCsvRow = z.infer<typeof FormulaCsvRowSchema>;

export interface ImportResult {
  success: boolean;
  formulasImported: number;
  ingredientsImported: number;
  errors: string[];
  warnings: string[];
}

export async function importFormulasFromCsv(csvContent: string): Promise<ImportResult> {
  const result: ImportResult = {
    success: false,
    formulasImported: 0,
    ingredientsImported: 0,
    errors: [],
    warnings: []
  };

  try {
    const records = await new Promise<any[]>((resolve, reject) => {
      parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      }, (err, records) => {
        if (err) reject(err);
        else resolve(records);
      });
    });

    // Validate CSV structure
    if (records.length === 0) {
      result.errors.push('CSV file is empty');
      return result;
    }

    // Group records by formula
    const formulaGroups = new Map<string, FormulaCsvRow[]>();
    const ingredientSet = new Set<string>();

    for (const record of records) {
      try {
        const validatedRow = FormulaCsvRowSchema.parse(record);
        
        // Include all rows, even with 0% (some formulas might have trace amounts)

        const formulaName = validatedRow['Formula Name'];
        if (!formulaGroups.has(formulaName)) {
          formulaGroups.set(formulaName, []);
        }
        formulaGroups.get(formulaName)!.push(validatedRow);
        ingredientSet.add(validatedRow.Ingredient);
      } catch (error) {
        result.warnings.push(`Invalid row: ${JSON.stringify(record)} - ${error}`);
      }
    }

    // Start database transaction
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Insert ingredients first
      for (const ingredientName of ingredientSet) {
        await client.query(`
          INSERT INTO ingredients (name, inci_name) 
          VALUES ($1, $2) 
          ON CONFLICT (name) DO NOTHING
        `, [ingredientName, '']);
      }

      // Insert formulas and their ingredients
      for (const [formulaName, ingredients] of formulaGroups) {
        // Skip formulas with no valid ingredients
        if (ingredients.length === 0) {
          continue;
        }

        // Validate percentage total
        const totalPercentage = ingredients.reduce((sum, ing) => sum + ing.Percentage, 0);
        if (totalPercentage > 100.1) {
          result.warnings.push(`Formula "${formulaName}" has total percentage of ${totalPercentage.toFixed(2)}% (over 100%)`);
        }

        // Insert formula
        const formulaResult = await client.query(`
          INSERT INTO formulas (name) 
          VALUES ($1) 
          ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
          RETURNING id
        `, [formulaName]);

        const formulaId = formulaResult.rows[0].id;

        // Clear existing ingredients for this formula
        await client.query('DELETE FROM formula_ingredients WHERE formula_id = $1', [formulaId]);

        // Insert formula ingredients
        for (const ingredient of ingredients) {
          const ingredientResult = await client.query(
            'SELECT id FROM ingredients WHERE name = $1',
            [ingredient.Ingredient]
          );

          if (ingredientResult.rows.length > 0) {
            const ingredientId = ingredientResult.rows[0].id;

            await client.query(`
              INSERT INTO formula_ingredients (formula_id, ingredient_id, percentage)
              VALUES ($1, $2, $3)
            `, [formulaId, ingredientId, ingredient.Percentage]);
          }
        }

        result.formulasImported++;
      }

      result.ingredientsImported = ingredientSet.size;
      await client.query('COMMIT');
      result.success = true;

    } catch (error) {
      await client.query('ROLLBACK');
      result.errors.push(`Database error: ${error}`);
    } finally {
      client.release();
    }

  } catch (error) {
    result.errors.push(`CSV parsing error: ${error}`);
  }

  return result;
}