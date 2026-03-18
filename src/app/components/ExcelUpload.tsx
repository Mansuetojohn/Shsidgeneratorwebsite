import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle, X, Eye } from 'lucide-react';
import { StudentData } from './StudentForm';
import examplePhoto1 from 'figma:asset/60e977f357c43825f5262b0e21ae1ce59f862082.png';
import examplePhoto2 from 'figma:asset/c0fda08029afd3c3b671fc03dbef5ae00d4edb4b.png';
import examplePhoto3 from 'figma:asset/80c7302f732c4fa90e2b3f253a1c164df7fd49a2.png';

interface ExcelUploadProps {
  onStudentsLoaded: (students: StudentData[]) => void;
  onShowPreview?: () => void;
}

export function ExcelUpload({ onStudentsLoaded, onShowPreview }: ExcelUploadProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const generateLRN = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    return timestamp + random;
  };

  // Convert an external image URL to a base64 data URI to avoid CORS issues during canvas rendering
  const convertImageUrlToBase64 = (url: string): Promise<string> => {
    return new Promise((resolve) => {
      if (!url || url.startsWith('data:')) {
        resolve(url);
        return;
      }
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth || img.width;
          canvas.height = img.naturalHeight || img.height;
          const ctx = canvas.getContext('2d');
          if (!ctx) { resolve(url); return; }
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/jpeg', 0.92));
        } catch {
          // If tainted canvas, fall back to original URL
          resolve(url);
        }
      };
      img.onerror = () => resolve(url); // fall back to original on error
      img.src = url;
    });
  };

  const parseCSV = (text: string): any[] => {
    // Strip BOM (Byte Order Mark) that Excel sometimes adds
    const cleaned = text.replace(/^\uFEFF/, '');

    // Normalize all line endings (Windows \r\n, old Mac \r, Unix \n)
    const normalized = cleaned.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const lines = normalized.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    // Auto-detect delimiter: comma, tab, or semicolon
    const firstLine = lines[0];
    let delimiter = ',';
    const tabCount = (firstLine.match(/\t/g) || []).length;
    const semicolonCount = (firstLine.match(/;/g) || []).length;
    const commaCount = (firstLine.match(/,/g) || []).length;
    if (tabCount > commaCount && tabCount > semicolonCount) delimiter = '\t';
    else if (semicolonCount > commaCount) delimiter = ';';

    // Parse a single CSV line respecting quoted fields
    const parseLine = (line: string): string[] => {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
          if (inQuotes && line[i + 1] === '"') {
            current += '"';
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (ch === delimiter && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += ch;
        }
      }
      result.push(current.trim());
      return result;
    };

    const rawHeaders = parseLine(lines[0]);
    // Clean headers: remove BOM remnants and extra whitespace/quotes
    const headers = rawHeaders.map(h => h.replace(/^\uFEFF/, '').replace(/^["']|["']$/g, '').trim());
    const rows = [];

    for (let i = 1; i < lines.length; i++) {
      const values = parseLine(lines[i]);
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index]?.replace(/^["']|["']$/g, '').trim() || '';
      });
      rows.push(row);
    }

    return rows;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setError(null);
    setSuccess(null);

    try {
      const text = await file.text();
      const jsonData = parseCSV(text);

      if (jsonData.length === 0) {
        // Give a more helpful diagnosis
        const cleaned = text.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
        const lineCount = cleaned.split('\n').filter(l => l.trim()).length;
        if (lineCount === 0) {
          throw new Error('The file appears to be empty. Please check the file and try again.');
        } else if (lineCount === 1) {
          throw new Error('The CSV only has a header row — no student data rows were found. Please add student data below the header row.');
        } else {
          throw new Error(`Could not parse the CSV file (${lineCount} lines detected). Make sure it is saved as CSV format (not .xlsx) and uses comma, tab, or semicolon separators.`);
        }
      }

      // Validate required columns
      const firstRow = jsonData[0];
      const requiredColumns = ['First Name', 'Last Name', 'Birthdate', 'Strand', 'Grade'];
      const missingColumns = requiredColumns.filter(col => !(col in firstRow));
      
      if (missingColumns.length > 0) {
        throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
      }

      // Process students (build raw list first)
      const rawStudents = jsonData.map((row, index) => {
        const birthdate = row.Birthdate || '';
        
        if (!birthdate) {
          throw new Error(`Invalid birthdate format in row ${index + 2}`);
        }

        return {
          firstName: row['First Name']?.toString().trim() || '',
          middleName: row['Middle Name']?.toString().trim() || '',
          lastName: row['Last Name']?.toString().trim() || '',
          birthdate,
          strand: row.Strand?.toString().trim() || '',
          grade: row.Grade?.toString().trim() || '',
          lrn: generateLRN(),
          photoUrl: row['Photo URL']?.toString().trim() || '',
        };
      });

      // Validate all students have required data
      const invalidStudents = rawStudents.filter(s => !s.firstName || !s.lastName || !s.birthdate || !s.strand || !s.grade);
      if (invalidStudents.length > 0) {
        throw new Error(`Some rows are missing required information`);
      }

      // Convert external photo URLs to base64 to avoid CORS issues
      const noPhotoPlaceholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23f0f0f0" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%23999" font-size="14"%3ENo Photo%3C/text%3E%3C/svg%3E';

      const students: StudentData[] = await Promise.all(
        rawStudents.map(async (raw) => {
          let photo = noPhotoPlaceholder;
          if (raw.photoUrl) {
            photo = await convertImageUrlToBase64(raw.photoUrl);
          }
          return {
            firstName: raw.firstName,
            middleName: raw.middleName,
            lastName: raw.lastName,
            birthdate: raw.birthdate,
            strand: raw.strand,
            grade: raw.grade,
            lrn: raw.lrn,
            photo,
          };
        })
      );

      onStudentsLoaded(students);
      setSuccess(`Successfully loaded ${students.length} student(s)`);
      
      // Clear file input
      e.target.value = '';
    } catch (err: any) {
      setError(err.message || 'Failed to process CSV file');
      console.error('CSV processing error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = `First Name,Middle Name,Last Name,Birthdate,Strand,Grade,Photo URL
Juan,Cruz,Dela Cruz,2005-01-15,STEM,11,(optional - leave blank)
Maria,Santos,Garcia,2004-08-22,ABM,12,
Jose,Reyes,Mendoza,2005-03-10,HUMSS,11,
Ana,Lopez,Ramos,2004-11-28,TVL-ICT,12,
Carlos,,Aquino,2005-06-05,GAS,11,`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'DCDNHS_Student_Template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const loadDemoData = () => {
    const demoStudents: StudentData[] = [
      {
        firstName: 'Juan',
        middleName: 'Cruz',
        lastName: 'Dela Cruz',
        birthdate: '2005-01-15',
        strand: 'STEM',
        grade: '11',
        section: 'Einstein',
        sex: 'Male',
        address: 'Toril, Davao City',
        contactNumber: '0912 345 6789',
        parentGuardian: 'Maria Dela Cruz',
        guardianContact: '0923 456 7890',
        relationship: 'Mother',
        classAdviser: 'Philip John Belo',
        schoolYear: '2025-2026',
        lrn: generateLRN(),
        photo: examplePhoto1
      },
      {
        firstName: 'Maria',
        middleName: 'Santos',
        lastName: 'Garcia',
        birthdate: '2004-08-22',
        strand: 'ABM',
        grade: '12',
        section: 'Rizal',
        sex: 'Female',
        address: 'Toril, Davao City',
        contactNumber: '0915 678 9012',
        parentGuardian: 'Pedro Garcia',
        guardianContact: '0927 890 1234',
        relationship: 'Father',
        classAdviser: 'Philip John Belo',
        schoolYear: '2025-2026',
        lrn: generateLRN(),
        photo: examplePhoto2
      },
      {
        firstName: 'Jose',
        middleName: 'Reyes',
        lastName: 'Mendoza',
        birthdate: '2005-03-10',
        strand: 'HUMSS',
        grade: '11',
        section: 'Bonifacio',
        sex: 'Male',
        address: 'Toril, Davao City',
        contactNumber: '0918 234 5678',
        parentGuardian: 'Ana Mendoza',
        guardianContact: '0929 345 6789',
        relationship: 'Mother',
        classAdviser: 'Philip John Belo',
        schoolYear: '2025-2026',
        lrn: generateLRN(),
        photo: examplePhoto3
      }
    ];
    
    onStudentsLoaded(demoStudents);
    setSuccess('Demo data loaded! Preview the generated ID cards below.');
  };

  return (
    <Card className="w-full shadow-xl border-2 border-green-100">
      <CardHeader className="bg-gradient-to-r from-green-50 to-white border-b-2 border-green-100">
        <CardTitle className="text-green-800 flex items-center gap-2">
          <div className="w-1 h-6 bg-green-700 rounded-full"></div>
          Bulk Upload - CSV File
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Try Demo First */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="bg-purple-100 rounded-full p-2 flex-shrink-0">
                <Eye className="w-5 h-5 text-purple-700" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-purple-900 mb-1">
                  ✨ First time? Try the Demo!
                </h4>
                <p className="text-sm text-purple-800 mb-3">
                  See how the system works with sample student data before uploading your own CSV file.
                </p>
                <Button 
                  onClick={loadDemoData}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                  size="sm"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Load Demo Data & Preview IDs
                </Button>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              How to Upload Your Students
            </h4>
            <ol className="text-sm text-blue-800 space-y-1 ml-5 list-decimal">
              <li>Download the CSV template below (contains 5 sample students)</li>
              <li>Open it in Excel, Google Sheets, or any spreadsheet program</li>
              <li>Replace sample data with your actual student information</li>
              <li>Keep the same column headers (First Name, Last Name, etc.)</li>
              <li>Use date format: YYYY-MM-DD (e.g., 2005-01-15)</li>
              <li>Save as CSV and upload the file</li>
            </ol>
          </div>

          {/* Available Strands Info */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-900 mb-2 text-sm">📚 Available Strands:</h4>
            <div className="flex flex-wrap gap-2">
              {['STEM', 'ABM', 'HUMSS', 'GAS', 'TVL-ICT', 'TVL-HE', 'TVL-IA', 'TVL-Agri-Fishery'].map(strand => (
                <span key={strand} className="text-xs bg-white border border-green-300 px-2 py-1 rounded text-green-800 font-medium">
                  {strand}
                </span>
              ))}
            </div>
            <p className="text-xs text-green-700 mt-2">
              💡 You can use any of these strands in your CSV file
            </p>
          </div>

          {/* Template Download */}
          <Button 
            onClick={downloadTemplate} 
            variant="outline"
            className="w-full border-green-600 text-green-700 hover:bg-green-50 font-semibold"
          >
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Download CSV Template (5 Sample Students)
          </Button>

          {/* File Upload */}
          <div className="border-2 border-dashed border-green-300 rounded-lg p-6 bg-green-50/30">
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-3">
                <Upload className="w-10 h-10 text-green-700" />
              </div>
              <p className="text-sm text-gray-700 font-semibold mb-1">Upload CSV File</p>
              <p className="text-xs text-gray-600 mb-4">
                📊 Supported format: .csv (can be created in Excel)
              </p>
              <input
                id="csv-upload"
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
                disabled={isProcessing}
              />
              <Button
                type="button"
                variant="outline"
                className="border-green-600 text-green-700 hover:bg-green-50"
                onClick={() => document.getElementById('csv-upload')?.click()}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>Processing...</>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Choose CSV File
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Success Message */}
          {success && (
            <div className="bg-green-100 border border-green-300 rounded-lg p-3 flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-700 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-green-800 font-semibold">{success}</p>
              </div>
              <button onClick={() => setSuccess(null)} className="text-green-700 hover:text-green-900">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border border-red-300 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-700 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-red-800 font-semibold">{error}</p>
                <p className="text-xs text-red-700 mt-1">Please check your CSV file and try again.</p>
              </div>
              <button onClick={() => setError(null)} className="text-red-700 hover:text-red-900">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Required Columns */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <p className="text-xs text-gray-700 font-semibold mb-2">Required Columns:</p>
            <div className="flex flex-wrap gap-2">
              {['First Name', 'Last Name', 'Birthdate', 'Strand', 'Grade'].map(col => (
                <span key={col} className="text-xs bg-white border border-gray-300 px-2 py-1 rounded">
                  {col}
                </span>
              ))}
              <span className="text-xs bg-green-50 border border-green-300 px-2 py-1 rounded text-green-700">
                Middle Name (optional)
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}