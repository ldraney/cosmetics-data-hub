# Cosmetics Data Hub - Setup Instructions

## Prerequisites

1. **PostgreSQL Database**
   - Install PostgreSQL locally or use a cloud service
   - Create a database named `cosmetics_data_hub`
   - Update the `DATABASE_URL` in `.env.local`

2. **Node.js**
   - Node.js 18.17.0 or higher
   - npm or yarn package manager

## Setup Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Database
```bash
# Create the database (if using local PostgreSQL)
createdb cosmetics_data_hub

# Run migrations to create tables
npm run db:migrate
```

### 3. Configure Environment
Update `.env.local` with your database connection:
```
DATABASE_URL=postgresql://username:password@localhost:5432/cosmetics_data_hub
NODE_ENV=development
```

### 4. Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:3005`

## Testing the CSV Import

### 1. Test with Your CSV File
You can test the import functionality by:

1. Starting the development server
2. Going to `http://localhost:3005/admin/import`
3. Uploading your CSV file: `/Users/earthharbor/projects/pel-formula-database-2/pure_earth_labs_formulas_FINAL.csv`

### 2. Via API
```bash
# Test the import API directly
curl -X POST http://localhost:3005/api/import \
  -F "file=@/Users/earthharbor/projects/pel-formula-database-2/pure_earth_labs_formulas_FINAL.csv"
```

## Application Structure

- **Database Schema**: `db/migrations/001_create_tables.sql`
- **CSV Import Logic**: `lib/csv-import.ts`
- **API Endpoints**: `app/api/`
- **Admin Interface**: `app/admin/`

## Features

✅ **PostgreSQL Database Schema**
- formulas, ingredients, formula_ingredients, ingredient_pricing tables
- Proper relationships and indexes
- Data validation constraints

✅ **CSV Import Functionality**
- Validates CSV structure
- Handles formula/ingredient relationships
- Percentage validation
- Batch processing with transactions

✅ **API Endpoints**
- `/api/import` - CSV file upload
- `/api/formulas` - Formula CRUD operations
- `/api/ingredients` - Ingredient management

✅ **Admin Interface**
- CSV upload and import
- Formula listing with validation
- Ingredient management
- Search functionality

## Next Steps

1. **Test the Import**: Upload your CSV file and verify the data
2. **Fly.io Deployment**: Set up production deployment
3. **Pricing Integration**: Add supplier pricing data functionality
4. **API Documentation**: Document endpoints for external integration

## Database Schema

```sql
-- Main tables
formulas (id, name, version, created_date, updated_date)
ingredients (id, name, inci_name, supplier_code, category, created_date)
formula_ingredients (formula_id, ingredient_id, percentage)
ingredient_pricing (ingredient_id, price_per_kg, supplier, effective_date)
```

## CSV Format Expected

```csv
Formula Name,Ingredient,INCI,Percentage
Balancing Gel Hydrator,Water,Aqua,89.31%
Balancing Gel Hydrator,Natrasol,Hydroxyethylcellulose,0.50%
...
```