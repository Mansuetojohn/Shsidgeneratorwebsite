import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Upload, X, Info } from 'lucide-react';
import examplePhoto1 from 'figma:asset/60e977f357c43825f5262b0e21ae1ce59f862082.png';
import examplePhoto2 from 'figma:asset/c0fda08029afd3c3b671fc03dbef5ae00d4edb4b.png';
import examplePhoto3 from 'figma:asset/80c7302f732c4fa90e2b3f253a1c164df7fd49a2.png';
import examplePhoto4 from 'figma:asset/e9bf1d925e9bc5a12e430c33b552b9365343e99c.png';
import examplePhoto5 from 'figma:asset/41d2234cdb6c7654e0c410e92e998a0f7c0da6dc.png';

interface StudentFormProps {
  onGenerate: (data: StudentData) => void;
}

export interface StudentData {
  firstName: string;
  middleName: string;
  lastName: string;
  birthdate: string;
  strand: string;
  grade: string;
  section: string;
  sex: string;
  address: string;
  contactNumber: string;
  parentGuardian: string;
  guardianContact: string;
  relationship: string;
  classAdviser: string;
  schoolYear: string;
  lrn: string;
  photo: string;
}

const strands = [
  { value: 'STEM', label: 'STEM - Science, Technology, Engineering and Mathematics' },
  { value: 'ABM', label: 'ABM - Accountancy, Business and Management' },
  { value: 'HUMSS', label: 'HUMSS - Humanities and Social Sciences' },
  { value: 'GAS', label: 'GAS - General Academic Strand' },
  { value: 'TVL-HE', label: 'TVL-HE - Home Economics' },
  { value: 'TVL-ICT', label: 'TVL-ICT - Information and Communications Technology' },
  { value: 'TVL-IA', label: 'TVL-IA - Industrial Arts' },
  { value: 'TVL-AGRI', label: 'TVL-AGRI - Agri-Fishery Arts' },
];

const grades = [
  { value: '11', label: 'Grade 11' },
  { value: '12', label: 'Grade 12' },
];

export function StudentForm({ onGenerate }: StudentFormProps) {
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [strand, setStrand] = useState('');
  const [grade, setGrade] = useState('');
  const [section, setSection] = useState('');
  const [sex, setSex] = useState('');
  const [address, setAddress] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [parentGuardian, setParentGuardian] = useState('');
  const [guardianContact, setGuardianContact] = useState('');
  const [relationship, setRelationship] = useState('');
  const [classAdviser, setClassAdviser] = useState('Philip John Belo');
  const [schoolYear, setSchoolYear] = useState('2025-2026');
  const [photo, setPhoto] = useState<string>('');
  const [photoPreview, setPhotoPreview] = useState<string>('');

  const generateLRN = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    return timestamp + random;
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPhoto(result);
        setPhotoPreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setPhoto('');
    setPhotoPreview('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !birthdate || !strand || !grade) {
      alert('Please fill in all required fields');
      return;
    }
    if (!photo) {
      alert('Please upload your ID photo with white background');
      return;
    }
    const lrn = generateLRN();
    onGenerate({
      firstName, middleName, lastName, birthdate,
      strand, grade, section, sex, address, contactNumber,
      parentGuardian, guardianContact, relationship,
      classAdviser, schoolYear, lrn, photo,
    });
  };

  const inputClass = "border-purple-300 focus:border-purple-500 focus:ring-purple-500";

  return (
    <Card className="w-full max-w-2xl shadow-xl border-2 border-purple-100">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-white border-b-2 border-purple-100">
        <CardTitle className="text-purple-800 flex items-center gap-2">
          <div className="w-1 h-6 bg-purple-700 rounded-full"></div>
          Student Information Form
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* === PERSONAL INFO === */}
          <div className="bg-purple-50 rounded-lg px-4 py-3">
            <p className="font-bold text-purple-800 text-sm uppercase mb-3 tracking-wide">Personal Information</p>
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input id="firstName" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Juan" required className={inputClass} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="middleName">Middle Name</Label>
                  <Input id="middleName" value={middleName} onChange={e => setMiddleName(e.target.value)} placeholder="Santos" className={inputClass} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input id="lastName" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Dela Cruz" required className={inputClass} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="birthdate">Date of Birth *</Label>
                  <Input
                    id="birthdate"
                    type="date"
                    value={birthdate}
                    onChange={e => setBirthdate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className={`${inputClass} cursor-pointer`}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="sex">Sex</Label>
                  <Select value={sex} onValueChange={setSex}>
                    <SelectTrigger id="sex" className={inputClass}>
                      <SelectValue placeholder="Select sex" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="address">Address</Label>
                <Input id="address" value={address} onChange={e => setAddress(e.target.value)} placeholder="Purok/Barangay, City" className={inputClass} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="contactNumber">Contact Number</Label>
                <Input id="contactNumber" value={contactNumber} onChange={e => setContactNumber(e.target.value)} placeholder="09XX XXX XXXX" className={inputClass} />
              </div>
            </div>
          </div>

          {/* === ACADEMIC INFO === */}
          <div className="bg-purple-50 rounded-lg px-4 py-3">
            <p className="font-bold text-purple-800 text-sm uppercase mb-3 tracking-wide">Academic Information</p>
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="strand">Strand *</Label>
                  <Select value={strand} onValueChange={setStrand}>
                    <SelectTrigger id="strand" className={inputClass}>
                      <SelectValue placeholder="Select strand" />
                    </SelectTrigger>
                    <SelectContent>
                      {strands.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="grade">Grade Level *</Label>
                  <Select value={grade} onValueChange={setGrade}>
                    <SelectTrigger id="grade" className={inputClass}>
                      <SelectValue placeholder="Select grade" />
                    </SelectTrigger>
                    <SelectContent>
                      {grades.map(g => <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="section">Section</Label>
                  <Input id="section" value={section} onChange={e => setSection(e.target.value)} placeholder="e.g. Rizal" className={inputClass} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="classAdviser">Class Adviser</Label>
                  <Input id="classAdviser" value={classAdviser} onChange={e => setClassAdviser(e.target.value)} placeholder="Philip John Belo" className={inputClass} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="schoolYear">School Year</Label>
                  <Input id="schoolYear" value={schoolYear} onChange={e => setSchoolYear(e.target.value)} placeholder="2025-2026" className={inputClass} />
                </div>
              </div>
            </div>
          </div>

          {/* === EMERGENCY CONTACT === */}
          <div className="bg-purple-50 rounded-lg px-4 py-3">
            <p className="font-bold text-purple-800 text-sm uppercase mb-3 tracking-wide">Emergency Contact</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label htmlFor="parentGuardian">Parent/Guardian Name</Label>
                <Input id="parentGuardian" value={parentGuardian} onChange={e => setParentGuardian(e.target.value)} placeholder="Maria Dela Cruz" className={inputClass} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="guardianContact">Contact Number</Label>
                <Input id="guardianContact" value={guardianContact} onChange={e => setGuardianContact(e.target.value)} placeholder="09XX XXX XXXX" className={inputClass} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="relationship">Relationship</Label>
                <Input id="relationship" value={relationship} onChange={e => setRelationship(e.target.value)} placeholder="Mother/Father/Guardian" className={inputClass} />
              </div>
            </div>
          </div>

          {/* === PHOTO === */}
          <div className="space-y-2">
            <Label htmlFor="photo" className="text-purple-800 font-semibold">ID Photo *</Label>
            
            {/* Photo Examples */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg p-4 mb-3">
              <div className="flex items-start gap-2 mb-3">
                <Info className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-blue-900 text-sm mb-1">📸 Proper ID Photo Format Examples</h4>
                  <p className="text-xs text-blue-800 mb-2">
                    Your photo should look like these examples below:
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-5 gap-2">
                <div className="text-center">
                  <img 
                    src={examplePhoto1} 
                    alt="Example 1" 
                    className="w-full aspect-square object-cover rounded border-2 border-blue-300 shadow-sm"
                  />
                  <p className="text-[10px] text-blue-700 mt-1">✓ Good</p>
                </div>
                <div className="text-center">
                  <img 
                    src={examplePhoto2} 
                    alt="Example 2" 
                    className="w-full aspect-square object-cover rounded border-2 border-blue-300 shadow-sm"
                  />
                  <p className="text-[10px] text-blue-700 mt-1">✓ Good</p>
                </div>
                <div className="text-center">
                  <img 
                    src={examplePhoto3} 
                    alt="Example 3" 
                    className="w-full aspect-square object-cover rounded border-2 border-blue-300 shadow-sm"
                  />
                  <p className="text-[10px] text-blue-700 mt-1">✓ Good</p>
                </div>
                <div className="text-center">
                  <img 
                    src={examplePhoto4} 
                    alt="Example 4" 
                    className="w-full aspect-square object-cover rounded border-2 border-blue-300 shadow-sm"
                  />
                  <p className="text-[10px] text-blue-700 mt-1">✓ Good</p>
                </div>
                <div className="text-center">
                  <img 
                    src={examplePhoto5} 
                    alt="Example 5" 
                    className="w-full aspect-square object-cover rounded border-2 border-blue-300 shadow-sm"
                  />
                  <p className="text-[10px] text-blue-700 mt-1">✓ Good</p>
                </div>
              </div>
              <div className="mt-3 text-xs text-blue-800 space-y-1">
                <p>✓ White or light background</p>
                <p>✓ Formal attire (white shirt, uniform, or suit)</p>
                <p>✓ Face clearly visible, looking at camera</p>
                <p>✓ Good lighting with no shadows</p>
              </div>
            </div>

            <div className="border-2 border-dashed border-purple-300 rounded-lg p-4 bg-purple-50/30">
              {!photoPreview ? (
                <div className="text-center">
                  <div className="bg-purple-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-3">
                    <Upload className="w-10 h-10 text-purple-700" />
                  </div>
                  <p className="text-sm text-gray-700 font-semibold mb-1">Upload your ID photo</p>
                  <p className="text-xs text-gray-600 mb-4 max-w-xs mx-auto leading-relaxed">
                    📸 White background • White shirt or uniform • Clear face photo
                  </p>
                  <Input id="photo" type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                  <Button type="button" variant="outline" className="border-purple-600 text-purple-700 hover:bg-purple-50" onClick={() => document.getElementById('photo')?.click()}>
                    <Upload className="w-4 h-4 mr-2" />
                    Choose Photo
                  </Button>
                </div>
              ) : (
                <div className="relative">
                  <div className="w-40 h-40 mx-auto border-4 border-purple-600 overflow-hidden shadow-lg" style={{ borderRadius: 4 }}>
                    <img src={photoPreview} alt="ID Preview" className="w-full h-full object-cover" />
                  </div>
                  <Button type="button" variant="destructive" size="sm" className="absolute -top-2 -right-2 rounded-full shadow-lg" onClick={handleRemovePhoto}>
                    <X className="w-4 h-4" />
                  </Button>
                  <div className="text-center mt-3 bg-purple-100 rounded-lg py-2 px-3">
                    <p className="text-xs text-purple-800 font-semibold">✓ Photo uploaded successfully</p>
                  </div>
                </div>
              )}
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-xs text-yellow-800 leading-relaxed">
                <strong>⚠️ Important:</strong> Use a photo with white background while wearing a white shirt or school uniform for the best ID result.
              </p>
            </div>
          </div>

          <Button type="submit" className="w-full text-white font-semibold py-6 text-base shadow-lg" style={{ backgroundColor: '#7B00CC' }}>
            Generate My ID Card
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}