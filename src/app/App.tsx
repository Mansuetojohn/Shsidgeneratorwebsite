import { useState, useRef, useEffect } from 'react';
import { StudentForm, StudentData } from './components/StudentForm';
import { ExcelUpload } from './components/ExcelUpload';
import { IDCard } from './components/IDCard';
import { AdminDashboard } from './components/AdminDashboard';
import { PhotoUploader } from './components/PhotoUploader';
import { Button } from './components/ui/button';
import backgroundImg from 'figma:asset/52f141a71601f96694cbfb4b48c03c62e004b0cb.png';
import schoolLogo from 'figma:asset/d977163a99dd33d563885f88d6a60cfe192fa795.png';
import { Download, UserPlus, FileSpreadsheet, ChevronLeft, Shield, Loader2 } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

type InputMode = 'selection' | 'manual' | 'bulk';

export default function App() {
  const [inputMode, setInputMode] = useState<InputMode>('selection');
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [bulkStudents, setBulkStudents] = useState<StudentData[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [generationCount, setGenerationCount] = useState(0);
  const idCardRef = useRef<{ frontRef: HTMLDivElement | null; backRef: HTMLDivElement | null }>({ frontRef: null, backRef: null });

  const apiUrl = `https://${projectId}.supabase.co/functions/v1/make-server-d5fd1e67`;

  // Load generation count on mount
  useEffect(() => {
    loadGenerationCount();
  }, []);

  const loadGenerationCount = async () => {
    try {
      const response = await fetch(`${apiUrl}/generation-count`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });
      const data = await response.json();
      setGenerationCount(data.count || 0);
    } catch (error) {
      console.error('Error loading generation count:', error);
    }
  };

  const saveIDRecord = async (studentData: StudentData, frontImage: string, backImage: string) => {
    try {
      const response = await fetch(`${apiUrl}/save-id`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          studentData,
          frontImage,
          backImage,
        }),
      });

      const data = await response.json();

      if (data.limitReached) {
        alert('⚠️ Generation limit reached! Maximum 50 IDs allowed. Please contact administrator.');
        return false;
      }

      if (data.success) {
        setGenerationCount(generationCount + 1);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error saving ID record:', error);
      return false;
    }
  };

  const handleGenerate = (data: StudentData) => {
    setStudentData(data);
  };

  const handleBulkStudentsLoaded = (students: StudentData[]) => {
    setBulkStudents(students);
  };

  const handleUpdateStudentPhoto = (index: number, photo: string) => {
    const updatedStudents = [...bulkStudents];
    updatedStudents[index].photo = photo;
    setBulkStudents(updatedStudents);
  };

  const handleReset = () => {
    setStudentData(null);
    setBulkStudents([]);
    setSelectedStudent(null);
    setInputMode('selection');
  };

  const handleBackToList = () => {
    setSelectedStudent(null);
  };

  const downloadCard = async (element: HTMLDivElement | null, fileName: string) => {
    if (!element) return null;
    
    try {
      // Wait for images to load completely
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Dynamically import html2canvas only when needed
      const { default: html2canvas } = await import('html2canvas');
      
      const canvas = await html2canvas(element, {
        backgroundColor: '#ffffff',
        scale: 4, // Increased from 3 to 4 for better quality
        useCORS: true,
        allowTaint: true,
      });
      
      const dataUrl = canvas.toDataURL('image/jpeg', 1.0);
      
      const link = document.createElement('a');
      link.download = fileName;
      link.href = dataUrl;
      link.click();
      
      // Small delay to ensure download started
      await new Promise(resolve => setTimeout(resolve, 100));
      
      return dataUrl;
    } catch (error) {
      console.error('Error downloading ID:', error);
      alert('Failed to download ID card. Please try again.');
      return null;
    }
  };

  const handleDownloadFront = async () => {
    await downloadCard(
      idCardRef.current.frontRef, 
      `${studentData?.lastName}_${studentData?.firstName}_ID_Front.jpg`
    );
  };

  const handleDownloadBack = async () => {
    await downloadCard(
      idCardRef.current.backRef,
      `${studentData?.lastName}_${studentData?.firstName}_ID_Back.jpg`
    );
  };

  const handleDownloadBoth = async () => {
    if (!idCardRef.current?.frontRef || !idCardRef.current?.backRef) {
      alert('ID card not ready. Please wait a moment and try again.');
      return;
    }
    
    const lastName = studentData?.lastName || 'Student';
    const firstName = studentData?.firstName || '';
    
    // Download front
    const frontResult = await downloadCard(
      idCardRef.current.frontRef,
      `${lastName}_${firstName}_ID_Front.jpg`
    );
    
    if (!frontResult) {
      alert('Failed to download front side. Please try again.');
      return;
    }
    
    // Wait before downloading back
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Download back
    const backResult = await downloadCard(
      idCardRef.current.backRef,
      `${lastName}_${firstName}_ID_Back.jpg`
    );
    
    if (!backResult) {
      alert('Failed to download back side. Please try again.');
      return;
    }
  };

  const handleDownloadAllIDs = async () => {
    if (!confirm(`Are you sure you want to download all ${bulkStudents.length} student IDs? This will download ${bulkStudents.length * 2} image files.`)) {
      return;
    }
    
    setIsDownloadingAll(true);
    let successCount = 0;
    let failCount = 0;
    
    for (let i = 0; i < bulkStudents.length; i++) {
      const student = bulkStudents[i];
      setSelectedStudent(i);
      
      // Wait for the component to render
      await new Promise(resolve => setTimeout(resolve, 800));
      
      try {
        // Download front
        const frontImage = await downloadCard(
          idCardRef.current.frontRef,
          `${student.lastName}_${student.firstName}_ID_Front.jpg`
        );
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Download back
        const backImage = await downloadCard(
          idCardRef.current.backRef,
          `${student.lastName}_${student.firstName}_ID_Back.jpg`
        );
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Save ID record
        if (frontImage && backImage) {
          await saveIDRecord(student, frontImage, backImage);
          successCount++;
        } else {
          failCount++;
        }
      } catch (error) {
        console.error(`Error downloading ID for ${student.firstName} ${student.lastName}:`, error);
        failCount++;
      }
    }
    
    setSelectedStudent(null);
    setIsDownloadingAll(false);
    
    if (failCount > 0) {
      alert(`Download complete!\n✅ Success: ${successCount}\n❌ Failed: ${failCount}\n\nPlease check your downloads folder.`);
    } else {
      alert(`✅ Successfully downloaded all ${bulkStudents.length * 2} ID cards!`);
    }
  };

  return (
    <div className="min-h-screen relative py-8 px-4">
      {/* Background Image with Overlay */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `url(${backgroundImg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="absolute inset-0 bg-white/50 backdrop-blur-sm"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-3">
            <img 
              src={schoolLogo} 
              alt="School Logo" 
              className="w-20 h-20 object-contain drop-shadow-lg"
            />
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
                Doña Carmen Denia National High School
              </h1>
              <p className="text-lg font-semibold text-green-700">SHS ID Generator</p>
            </div>
          </div>
          <p className="text-gray-600 text-base">
            Toril, Davao City
          </p>
        </div>

        {/* Mode Selection Screen */}
        {inputMode === 'selection' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-xl border-2 border-purple-100 p-8 mb-6">
              <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">
                Choose Input Method
              </h2>
              <p className="text-gray-600 text-center mb-8">
                Select how you'd like to generate student ID cards
              </p>
              
              <div className="grid md:grid-cols-2 gap-6">
                {/* Bulk Upload Option */}
                <button
                  onClick={() => setInputMode('bulk')}
                  className="group relative bg-gradient-to-br from-purple-50 to-white border-2 border-purple-300 rounded-xl p-8 hover:border-purple-500 hover:shadow-lg transition-all duration-200"
                >
                  <div className="text-center">
                    <div className="bg-purple-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 transition-colors">
                      <FileSpreadsheet className="w-10 h-10 text-purple-700" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Bulk Upload</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Upload an Excel file with multiple students to generate IDs in batch
                    </p>
                    <div className="inline-flex items-center gap-2 text-purple-700 font-semibold text-sm">
                      <span>Recommended for Teachers</span>
                    </div>
                  </div>
                </button>

                {/* Manual Entry Option */}
                <button
                  onClick={() => setInputMode('manual')}
                  className="group relative bg-gradient-to-br from-purple-50 to-white border-2 border-purple-300 rounded-xl p-8 hover:border-purple-500 hover:shadow-lg transition-all duration-200"
                >
                  <div className="text-center">
                    <div className="bg-purple-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 transition-colors">
                      <UserPlus className="w-10 h-10 text-purple-700" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Manual Entry</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Enter student information manually to generate a single ID card
                    </p>
                    <div className="inline-flex items-center gap-2 text-purple-700 font-semibold text-sm">
                      <span>For Emergency Cases</span>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-2xl mx-auto">
              <p className="text-sm text-yellow-800 text-center">
                <strong>💡 Tip:</strong> Teachers should use <strong>Bulk Upload</strong> to save time. Manual entry is available for individual student IDs.
              </p>
            </div>
          </div>
        )}

        {/* Manual Entry Mode */}
        {inputMode === 'manual' && (
          <div>
            <div className="mb-6">
              <Button 
                onClick={handleReset} 
                variant="outline" 
                className="mb-4"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back to Options
              </Button>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
              {/* Form Section */}
              <div className={`flex-1 ${studentData ? 'lg:max-w-lg' : 'max-w-2xl mx-auto w-full'}`}>
                <StudentForm onGenerate={handleGenerate} />
              </div>

              {/* ID Preview Section */}
              {studentData && (
                <div className="flex-1 lg:max-w-lg mx-auto w-full">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                      <h2 className="text-2xl font-bold text-gray-800">ID Preview</h2>
                      <Button onClick={() => setStudentData(null)} variant="outline">
                        Generate New ID
                      </Button>
                    </div>
                    <IDCard ref={idCardRef} studentData={studentData} />
                    
                    {/* Download Button */}
                    <div className="bg-white rounded-lg p-4 shadow-md space-y-3">
                      <p className="text-sm text-gray-600 text-center font-semibold mb-3">
                        Download Your ID Card
                      </p>
                      <Button onClick={handleDownloadBoth} className="w-full text-white py-6" style={{backgroundColor:'#7B00CC'}}>
                        <Download className="w-4 h-4 mr-2" />
                        Download Both Sides (Front & Back)
                      </Button>
                      <p className="text-xs text-gray-500 text-center mt-2">
                        💡 Downloads 2 high-quality JPG files (Front & Back). Compatible with all devices.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bulk Upload Mode */}
        {inputMode === 'bulk' && (
          <div>
            <div className="mb-6">
              <Button 
                onClick={handleReset} 
                variant="outline" 
                className="mb-4"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back to Options
              </Button>
            </div>

            {bulkStudents.length === 0 ? (
              <div className="max-w-3xl mx-auto">
                <ExcelUpload onStudentsLoaded={handleBulkStudentsLoaded} />
              </div>
            ) : (
              <div>
                {selectedStudent === null ? (
                  // Student List View
                  <div className="max-w-6xl mx-auto">
                    <div className="bg-white rounded-xl shadow-xl border-2 border-purple-100 p-6 mb-6">
                      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                        <div>
                          <h2 className="text-2xl font-bold text-gray-800">
                            Generated ID Cards ({bulkStudents.length} students)
                          </h2>
                          <p className="text-gray-600 text-sm mt-1">
                            Click on any student to view and download their ID card
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            onClick={handleDownloadAllIDs}
                            className="text-white"
                            style={{backgroundColor:'#7B00CC'}}
                            disabled={isDownloadingAll}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            {isDownloadingAll ? 'Downloading...' : 'Download All IDs'}
                          </Button>
                          <Button onClick={handleReset} variant="outline">
                            Upload New File
                          </Button>
                        </div>
                      </div>

                      {isDownloadingAll && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                          <p className="text-sm text-green-800 text-center">
                            ⏳ Downloading all ID cards... Please wait. ({selectedStudent !== null ? selectedStudent + 1 : 0}/{bulkStudents.length})
                          </p>
                        </div>
                      )}

                      {!isDownloadingAll && (
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                          <p className="text-sm text-purple-800 text-center">
                            📸 <strong>Quick Tip:</strong> You can upload or change student photos using the buttons below each student card!
                          </p>
                        </div>
                      )}

                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {bulkStudents.map((student, index) => (
                          <div
                            key={index}
                            className="bg-gradient-to-br from-purple-50 to-white border-2 border-purple-200 rounded-lg p-4 hover:border-purple-500 hover:shadow-md transition-all"
                          >
                            <button
                              onClick={() => setSelectedStudent(index)}
                              className="w-full text-left mb-3"
                            >
                              <div className="flex items-start gap-3">
                                <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                                  <span className="font-bold" style={{color:'#7B00CC'}}>{index + 1}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-bold text-gray-800 truncate">
                                    {student.firstName} {student.lastName}
                                  </h3>
                                  <p className="text-sm text-gray-600">{student.strand} - Grade {student.grade}</p>
                                  <p className="text-xs text-gray-500 font-mono mt-1">LRN: {student.lrn}</p>
                                </div>
                              </div>
                            </button>
                            {/* Quick Photo Edit Button */}
                            <div onClick={(e) => e.stopPropagation()}>
                              <PhotoUploader
                                currentPhoto={student.photo}
                                onPhotoChange={(newPhoto) => handleUpdateStudentPhoto(index, newPhoto)}
                                compact={true}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  // Individual Student ID View
                  <div className="max-w-lg mx-auto">
                    <div className="mb-6">
                      <Button 
                        onClick={handleBackToList} 
                        variant="outline"
                      >
                        <ChevronLeft className="w-4 h-4 mr-2" />
                        Back to Student List
                      </Button>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-white rounded-lg p-4 shadow-md">
                        <h3 className="font-bold text-gray-800 text-lg">
                          {bulkStudents[selectedStudent].firstName} {bulkStudents[selectedStudent].lastName}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Student {selectedStudent + 1} of {bulkStudents.length}
                        </p>
                      </div>

                      {/* Photo Editor */}
                      <PhotoUploader
                        currentPhoto={bulkStudents[selectedStudent].photo}
                        onPhotoChange={(newPhoto) => handleUpdateStudentPhoto(selectedStudent, newPhoto)}
                      />

                      <IDCard ref={idCardRef} studentData={bulkStudents[selectedStudent]} />
                      
                      {/* Download Button */}
                      <div className="bg-white rounded-lg p-4 shadow-md space-y-3">
                        <p className="text-sm text-gray-600 text-center font-semibold mb-3">
                          Download ID Card
                        </p>
                        <Button 
                          onClick={async () => {
                            const student = bulkStudents[selectedStudent];
                            const frontResult = await downloadCard(
                              idCardRef.current.frontRef,
                              `${student.lastName}_${student.firstName}_ID_Front.jpg`
                            );
                            if (!frontResult) return;
                            
                            await new Promise(resolve => setTimeout(resolve, 800));
                            
                            const backResult = await downloadCard(
                              idCardRef.current.backRef,
                              `${student.lastName}_${student.firstName}_ID_Back.jpg`
                            );
                            
                            if (frontResult && backResult) {
                              // Optionally save to database
                              await saveIDRecord(student, frontResult, backResult);
                            }
                          }} 
                          className="w-full text-white py-6"
                          style={{backgroundColor:'#7B00CC'}}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download Both Sides (Front & Back)
                        </Button>
                        <p className="text-xs text-gray-500 text-center mt-2">
                          💡 Downloads 2 high-quality JPG files (Front & Back).
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Admin Access Button - Floating */}
        <div className="fixed bottom-6 right-6 z-40">
          <Button
            onClick={() => setShowAdmin(true)}
            className="text-white shadow-2xl"
            style={{backgroundColor:'#7B00CC'}}
            size="lg"
          >
            <Shield className="w-5 h-5 mr-2" />
            Teacher Admin Access
          </Button>
          {generationCount > 0 && (
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
              {generationCount}
            </div>
          )}
        </div>

        {/* Admin Dashboard Modal */}
        {showAdmin && (
          <AdminDashboard onClose={() => {
            setShowAdmin(false);
            loadGenerationCount();
          }} />
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-gray-600 text-sm">
          <p>© 2026 Doña Carmen Denia National High School</p>
        </div>
      </div>
    </div>
  );
}