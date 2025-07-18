'use client';
import { useState } from 'react';
import Link from 'next/link';

interface ImportResult {
  success: boolean;
  formulasImported: number;
  ingredientsImported: number;
  errors: string[];
  warnings: string[];
}

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/import', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        formulasImported: 0,
        ingredientsImported: 0,
        errors: ['Network error: Failed to upload file'],
        warnings: []
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/" className="text-blue-600 hover:underline">
          ← Back to Home
        </Link>
      </div>
      
      <h1 className="text-3xl font-bold mb-8">CSV Import</h1>
      
      <div className="max-w-2xl bg-white rounded-lg shadow p-6">
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Select CSV File
          </label>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500
                       file:mr-4 file:py-2 file:px-4
                       file:rounded-full file:border-0
                       file:text-sm file:font-semibold
                       file:bg-blue-50 file:text-blue-700
                       hover:file:bg-blue-100"
          />
          {file && (
            <p className="mt-2 text-sm text-gray-600">
              Selected: {file.name} ({Math.round(file.size / 1024)}KB)
            </p>
          )}
        </div>

        <button
          onClick={handleImport}
          disabled={!file || importing}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg
                     hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {importing ? 'Importing...' : 'Import CSV'}
        </button>
      </div>

      {result && (
        <div className="max-w-2xl mt-6">
          <div className={`rounded-lg p-6 ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <h2 className="text-xl font-semibold mb-4">
              {result.success ? '✅ Import Successful' : '❌ Import Failed'}
            </h2>
            
            <div className="space-y-2">
              <p><strong>Formulas Imported:</strong> {result.formulasImported}</p>
              <p><strong>Ingredients Imported:</strong> {result.ingredientsImported}</p>
            </div>

            {result.errors.length > 0 && (
              <div className="mt-4">
                <h3 className="font-semibold text-red-700 mb-2">Errors:</h3>
                <ul className="list-disc list-inside text-sm text-red-600">
                  {result.errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            {result.warnings.length > 0 && (
              <div className="mt-4">
                <h3 className="font-semibold text-yellow-700 mb-2">Warnings:</h3>
                <ul className="list-disc list-inside text-sm text-yellow-600 max-h-40 overflow-y-auto">
                  {result.warnings.slice(0, 10).map((warning, index) => (
                    <li key={index}>{warning}</li>
                  ))}
                  {result.warnings.length > 10 && (
                    <li className="font-medium">... and {result.warnings.length - 10} more warnings</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="max-w-2xl mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-2">CSV Format Expected:</h3>
        <p className="text-sm text-gray-600 mb-2">
          The CSV should have the following columns:
        </p>
        <ul className="list-disc list-inside text-sm text-gray-600">
          <li><strong>Formula Name:</strong> Name of the cosmetic formula</li>
          <li><strong>Ingredient:</strong> Name of the ingredient</li>
          <li><strong>INCI:</strong> INCI name (optional)</li>
          <li><strong>Percentage:</strong> Percentage of ingredient (with or without % symbol)</li>
        </ul>
      </div>
    </div>
  );
}