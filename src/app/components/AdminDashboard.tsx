import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Download, Trash2, RefreshCw, FileSpreadsheet, Eye, X } from 'lucide-react';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

interface IDRecord {
  id: string;
  studentData: any;
  frontImage: string;
  backImage: string;
  generatedAt: string;
  generatedBy: string;
}

export function AdminDashboard({ onClose }: { onClose: () => void }) {
  const [records, setRecords] = useState<IDRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedRecord, setSelectedRecord] = useState<IDRecord | null>(null);

  const apiUrl = `https://${projectId}.supabase.co/functions/v1/make-server-d5fd1e67`;

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/admin/records`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });
      
      if (!response.ok) {
        console.warn(`Admin records API returned ${response.status}: ${response.statusText}`);
        setRecords([]);
        setTotalCount(0);
        alert('Unable to connect to database. Please check your connection and try again.');
        return;
      }
      
      const data = await response.json();
      setRecords(data.records || []);
      setTotalCount(data.total || 0);
    } catch (error) {
      console.error('Error loading records:', error);
      setRecords([]);
      setTotalCount(0);
      alert('Failed to load records. Please check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  const deleteRecord = async (recordId: string) => {
    if (!confirm('Are you sure you want to delete this record?')) return;

    try {
      const response = await fetch(`${apiUrl}/admin/records/${recordId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      if (response.ok) {
        alert('Record deleted successfully');
        loadRecords();
      } else {
        alert('Failed to delete record');
      }
    } catch (error) {
      console.error('Error deleting record:', error);
      alert('Failed to delete record');
    }
  };

  const resetAllRecords = async () => {
    if (!confirm('⚠️ WARNING: This will delete ALL records and reset the counter. Are you absolutely sure?')) return;
    if (!confirm('This action cannot be undone. Type YES to confirm.')) return;

    try {
      const response = await fetch(`${apiUrl}/admin/reset`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      if (response.ok) {
        alert('All records have been cleared');
        loadRecords();
      } else {
        alert('Failed to reset records');
      }
    } catch (error) {
      console.error('Error resetting records:', error);
      alert('Failed to reset records');
    }
  };

  const exportToExcel = async () => {
    try {
      // Create CSV content
      const headers = [
        'No.',
        'Student Name',
        'LRN',
        'Grade',
        'Section',
        'Strand',
        'Sex',
        'Birthdate',
        'Address',
        'Contact Number',
        'Parent/Guardian',
        'Guardian Contact',
        'Relationship',
        'Class Adviser',
        'School Year',
        'Generated At'
      ];

      const rows = records.map((record, index) => [
        index + 1,
        `${record.studentData.firstName} ${record.studentData.middleName || ''} ${record.studentData.lastName}`,
        record.studentData.lrn,
        record.studentData.grade,
        record.studentData.section || 'N/A',
        record.studentData.strand,
        record.studentData.sex || 'N/A',
        record.studentData.birthdate,
        record.studentData.address || 'N/A',
        record.studentData.contactNumber || 'N/A',
        record.studentData.parentGuardian || 'N/A',
        record.studentData.guardianContact || 'N/A',
        record.studentData.relationship || 'N/A',
        record.studentData.classAdviser || 'N/A',
        record.studentData.schoolYear || 'N/A',
        new Date(record.generatedAt).toLocaleString()
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `DCDNHS_ID_Records_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      alert('Failed to export to CSV. Please try again.');
    }
  };

  const downloadImages = (record: IDRecord) => {
    // Download front
    const linkFront = document.createElement('a');
    linkFront.href = record.frontImage;
    linkFront.download = `${record.studentData.lastName}_${record.studentData.firstName}_Front.jpg`;
    linkFront.click();

    // Download back after a delay
    setTimeout(() => {
      const linkBack = document.createElement('a');
      linkBack.href = record.backImage;
      linkBack.download = `${record.studentData.lastName}_${record.studentData.firstName}_Back.jpg`;
      linkBack.click();
    }, 500);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-800 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Admin Dashboard</h2>
            <p className="text-purple-100 text-sm">Teacher Access Only - ID Generation Records</p>
          </div>
          <Button onClick={onClose} variant="ghost" className="text-white hover:bg-purple-700">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Stats */}
        <div className="px-6 py-4 bg-purple-50 border-b">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-4">
                <p className="text-sm text-gray-600">Total IDs Generated</p>
                <p className="text-3xl font-bold text-purple-700">{totalCount}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-sm text-gray-600">Remaining Generations</p>
                <p className="text-3xl font-bold text-green-700">{50 - totalCount}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-sm text-gray-600">Limit Status</p>
                <p className={`text-xl font-bold ${totalCount >= 50 ? 'text-red-700' : 'text-blue-700'}`}>
                  {totalCount >= 50 ? 'Limit Reached' : 'Active'}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-3 bg-gray-50 border-b flex gap-2 flex-wrap">
          <Button onClick={loadRecords} variant="outline" disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={exportToExcel} variant="outline" className="border-green-600 text-green-700 hover:bg-green-50">
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Export to Excel
          </Button>
          <Button onClick={resetAllRecords} variant="destructive">
            <Trash2 className="w-4 h-4 mr-2" />
            Reset All Records
          </Button>
        </div>

        {/* Records List */}
        <div className="flex-1 overflow-auto px-6 py-4">
          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-purple-600 mb-4" />
              <p className="text-gray-600">Loading records...</p>
            </div>
          ) : records.length === 0 ? (
            <div className="text-center py-12">
              <FileSpreadsheet className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-600 text-lg">No ID records found</p>
              <p className="text-gray-500 text-sm mt-2">Start generating IDs to see them here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {records.map((record, index) => (
                <Card key={record.id} className="border-2 hover:border-purple-300 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Number */}
                      <div className="bg-purple-100 rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0">
                        <span className="font-bold text-purple-700">{index + 1}</span>
                      </div>

                      {/* Student Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 text-lg">
                          {record.studentData.firstName} {record.studentData.middleName || ''} {record.studentData.lastName}
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 text-sm">
                          <div>
                            <span className="text-gray-600">LRN:</span>
                            <span className="ml-1 font-mono font-semibold">{record.studentData.lrn}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Grade:</span>
                            <span className="ml-1 font-semibold">{record.studentData.grade} - {record.studentData.section || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Strand:</span>
                            <span className="ml-1 font-semibold">{record.studentData.strand}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Generated:</span>
                            <span className="ml-1">{new Date(record.generatedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 flex-shrink-0">
                        <Button
                          onClick={() => setSelectedRecord(record)}
                          variant="outline"
                          size="sm"
                          className="border-blue-600 text-blue-700 hover:bg-blue-50"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button
                          onClick={() => downloadImages(record)}
                          variant="outline"
                          size="sm"
                          className="border-green-600 text-green-700 hover:bg-green-50"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => deleteRecord(record.id)}
                          variant="outline"
                          size="sm"
                          className="border-red-600 text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-gray-50 border-t text-center text-sm text-gray-600">
          <p>💡 Tip: Export to Excel to get a complete organized spreadsheet of all records</p>
        </div>
      </div>

      {/* Preview Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={() => setSelectedRecord(null)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-purple-600 px-6 py-4 flex items-center justify-between z-10">
              <div>
                <h3 className="text-xl font-bold text-white">
                  {selectedRecord.studentData.firstName} {selectedRecord.studentData.lastName}
                </h3>
                <p className="text-purple-100 text-sm">ID Preview</p>
              </div>
              <Button onClick={() => setSelectedRecord(null)} variant="ghost" className="text-white hover:bg-purple-700">
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h4 className="font-bold text-gray-900 mb-2">Front Side</h4>
                <img src={selectedRecord.frontImage} alt="ID Front" className="w-full rounded-lg border-2 border-gray-200 shadow-md" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 mb-2">Back Side</h4>
                <img src={selectedRecord.backImage} alt="ID Back" className="w-full rounded-lg border-2 border-gray-200 shadow-md" />
              </div>
              <Button onClick={() => downloadImages(selectedRecord)} className="w-full" style={{backgroundColor: '#7B00CC'}}>
                <Download className="w-4 h-4 mr-2" />
                Download Both Sides
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}