import { StudentData } from './StudentForm';
import schoolLogo from 'figma:asset/d977163a99dd33d563885f88d6a60cfe192fa795.png';
import { forwardRef, useRef, useImperativeHandle } from 'react';

interface IDCardProps {
  studentData: StudentData;
}

// Grid background SVG pattern
const GridBg = () => (
  <div
    className="absolute inset-0"
    style={{
      backgroundImage: `
        linear-gradient(rgba(150,100,200,0.12) 1px, transparent 1px),
        linear-gradient(90deg, rgba(150,100,200,0.12) 1px, transparent 1px)
      `,
      backgroundSize: '22px 22px',
    }}
  />
);

export const IDCard = forwardRef<{ frontRef: HTMLDivElement | null; backRef: HTMLDivElement | null }, IDCardProps>(
  ({ studentData }, ref) => {
  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    frontRef: frontRef.current,
    backRef: backRef.current,
  }));

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const getLastName = () => studentData.lastName.toUpperCase();
  const getFirstMiddle = () => {
    const parts = [studentData.firstName];
    if (studentData.middleName) parts.push(studentData.middleName);
    return parts.join(' ').toUpperCase();
  };

  const schoolYear = studentData.schoolYear || '2025-2026';

  return (
    <div className="w-full max-w-sm mx-auto space-y-8">
      {/* ───────────── FRONT SIDE ───────────── */}
      <div
        ref={frontRef}
        className="relative overflow-hidden shadow-2xl"
        style={{
          width: '100%',
          aspectRatio: '0.63',
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          display: 'flex',
          flexDirection: 'row',
        }}
      >
        {/* Main content area */}
        <div className="relative flex-1 flex flex-col overflow-hidden">
          <GridBg />

          {/* Top header */}
          <div className="relative z-10 px-4 pt-4 pb-3 text-center">
            <p className="font-black text-gray-900 text-xs leading-tight">Doña Carmen Denia National High School</p>
            <p className="text-gray-800 text-[10px] leading-tight mt-0.5">School ID:</p>
            <p className="font-bold text-gray-900 text-[10px] leading-tight">SENIOR HIGH SCHOOL DEPARTMENT</p>
          </div>

          {/* Divider */}
          <div className="relative z-10 mx-3 border-t border-gray-300" />

          {/* Photo + Logo row */}
          <div className="relative z-10 flex items-start gap-3 px-3 py-3">
            {/* Student photo */}
            <div
              className="flex-shrink-0 bg-white overflow-hidden"
              style={{
                width: '42%',
                aspectRatio: '0.78',
                border: '2.5px solid #1a1a1a',
              }}
            >
              {studentData.photo ? (
                <img src={studentData.photo} alt="Student" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400 text-xs text-center px-1">No Photo</span>
                </div>
              )}
            </div>

            {/* Logo + school year */}
            <div className="flex flex-col items-center justify-start flex-1 pt-1 gap-2">
              <img src={schoolLogo} alt="Logo" className="w-14 h-14 object-contain" />
              <div className="text-center">
                <p className="font-bold text-gray-800 text-[10px] uppercase tracking-wide">School Year</p>
                <p className="font-bold text-gray-900 text-[10px]">{schoolYear}</p>
              </div>
            </div>
          </div>

          {/* LRN Pill */}
          <div className="relative z-10 px-3 pb-2">
            <div
              className="flex items-center gap-2 px-4 py-1.5"
              style={{ backgroundColor: '#4B0082', borderRadius: '999px' }}
            >
              <span className="font-bold text-white text-[11px]">LRN:</span>
              <span className="text-white text-[11px] font-mono">{studentData.lrn}</span>
            </div>
          </div>

          {/* Name banner */}
          <div
            className="relative z-10 mx-0 px-4 py-2"
            style={{ backgroundColor: '#7B00CC' }}
          >
            <p className="font-black text-white text-lg leading-tight">{getLastName()}</p>
            <p className="font-black text-white text-base leading-tight">{getFirstMiddle()}</p>
          </div>

          {/* Grade & Section badge */}
          <div className="relative z-10 px-3 py-3">
            <div
              className="inline-block px-4 py-1.5"
              style={{
                backgroundColor: '#7B00CC',
                borderRadius: '999px',
              }}
            >
              <p className="font-black text-white text-[10px] uppercase tracking-wide">
                {studentData.grade ? `Grade ${studentData.grade}` : 'GRADE LEVEL'}{studentData.section ? ` - ${studentData.section}` : ''}{studentData.strand ? ` | ${studentData.strand}` : ''}
              </p>
            </div>
          </div>

          {/* Adviser + Principal */}
          <div className="relative z-10 px-4 pb-2 flex-1 flex flex-col justify-end">
            <div className="mb-2">
              <p className="font-bold text-gray-900 text-[11px]">{studentData.classAdviser || 'Philip John Belo'}</p>
              <p className="text-gray-600 text-[10px]">Class Adviser</p>
            </div>
            <div className="border-t border-gray-300 pt-2 mb-2">
              <p className="font-black text-gray-900 text-[11px] uppercase">RAMIL D MAGUNOT</p>
              <p className="text-gray-600 text-[10px]">school Principal IV</p>
            </div>

            {/* Decorative squares */}
            <div className="flex gap-1 mb-2">
              <div style={{ width: 14, height: 14, backgroundColor: '#7B00CC' }} />
              <div style={{ width: 10, height: 10, backgroundColor: '#3a0066', marginTop: 4 }} />
            </div>
          </div>
        </div>

        {/* Right purple sidebar */}
        <div
          className="flex-shrink-0 flex items-center justify-center relative overflow-hidden"
          style={{
            width: '22%',
            backgroundColor: '#7B00CC',
          }}
        >
          {/* Decorative lighter square top */}
          <div
            className="absolute top-3 right-3"
            style={{ width: 18, height: 18, backgroundColor: 'rgba(255,255,255,0.25)' }}
          />
          {/* Vertical text */}
          <p
            className="font-black text-white tracking-widest"
            style={{
              writingMode: 'vertical-rl',
              transform: 'rotate(180deg)',
              fontSize: '13px',
              letterSpacing: '0.15em',
              lineHeight: 1,
            }}
          >
            SENIOR HIGH SCHOOL
          </p>
        </div>
      </div>

      {/* ───────────── BACK SIDE ───────────── */}
      <div
        ref={backRef}
        className="relative overflow-hidden shadow-2xl"
        style={{
          width: '100%',
          backgroundColor: '#ffffff',
          borderRadius: '8px',
        }}
      >
        {/* Top white grid area with decorative squares */}
        <div className="relative overflow-hidden" style={{ height: 70 }}>
          <GridBg />
          {/* Decorative squares top-right */}
          <div className="absolute top-2 right-2 flex flex-col gap-1 items-end z-10">
            <div style={{ width: 24, height: 24, backgroundColor: '#7B00CC' }} />
            <div className="flex gap-1">
              <div style={{ width: 14, height: 14, backgroundColor: '#c084fc' }} />
              <div style={{ width: 20, height: 20, backgroundColor: '#3a0066' }} />
            </div>
          </div>
        </div>

        {/* PERSONAL INFORMATION section */}
        <div style={{ backgroundColor: '#7B00CC' }} className="px-4 py-2">
          <p className="font-black text-white text-center text-sm uppercase tracking-wide">Personal Information</p>
        </div>

        <div className="relative px-4 py-3 space-y-2" style={{ backgroundColor: '#c084fc22' }}>
          <GridBg />
          <div className="relative z-10 space-y-1.5">
            <InfoRow label="ADDRESS:" value={studentData.address} />
            <InfoRow label="DATE OF BIRTH:" value={formatDate(studentData.birthdate)} />
            <InfoRow label="SEX:" value={studentData.sex} />
            <InfoRow label="CONTACT NUMBER:" value={studentData.contactNumber} />
          </div>
        </div>

        {/* White separator strip */}
        <div className="relative h-8 overflow-hidden">
          <GridBg />
        </div>

        {/* IN CASE OF EMERGENCY section */}
        <div style={{ backgroundColor: '#7B00CC' }} className="px-4 py-2">
          <p className="font-black text-white text-sm uppercase tracking-wide">In Case of Emergency, Please Notify</p>
        </div>

        <div className="relative px-4 py-3 space-y-2" style={{ backgroundColor: '#c084fc22' }}>
          <GridBg />
          <div className="relative z-10 space-y-1.5">
            <InfoRow label="PARENT/GUARDIAN:" value={studentData.parentGuardian} />
            <InfoRow label="CONTACT NUMBER:" value={studentData.guardianContact} />
            <InfoRow label="RELATIONSHIP:" value={studentData.relationship} />
          </div>
        </div>

        {/* Middle grid area with purple decoration */}
        <div className="relative overflow-hidden" style={{ height: 80 }}>
          <GridBg />
          {/* Purple square in middle-right */}
          <div
            className="absolute"
            style={{ width: 30, height: 30, backgroundColor: '#c084fc', bottom: 12, right: '35%' }}
          />
        </div>

        {/* Signature name banner */}
        <div style={{ backgroundColor: '#7B00CC' }} className="px-4 py-3 text-center">
          <p className="font-black text-white text-sm uppercase">
            {studentData.firstName} {studentData.middleName ? studentData.middleName + ' ' : ''}{studentData.lastName}
          </p>
          <p className="font-bold text-white text-[10px] uppercase tracking-wider mt-0.5">Student Signature Over Printed Name</p>
        </div>

        {/* Bottom signature area */}
        <div className="relative" style={{ height: 44 }}>
          <GridBg />
          <div className="relative z-10 h-full flex items-end px-4 pb-2">
            <div className="w-1/2 border-b border-gray-400" />
          </div>
        </div>
      </div>
    </div>
  );
});

function InfoRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-baseline gap-1">
      <span className="font-black text-gray-900 text-[10px] whitespace-nowrap">{label}</span>
      <span className="text-gray-800 text-[10px] flex-1 border-b border-gray-500 pb-0.5 min-w-0">
        {value || ''}
      </span>
    </div>
  );
}

IDCard.displayName = 'IDCard';