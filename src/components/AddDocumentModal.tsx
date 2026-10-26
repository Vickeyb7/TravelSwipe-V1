import React, { useState } from 'react';
import { useTrips } from '../context/TripsContext';
import { TravelDocument } from '../types';

interface AddDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddDocumentModal: React.FC<AddDocumentModalProps> = ({ isOpen, onClose }) => {
  const { activeTrip, addDocumentToTrip } = useTrips();
  const [docCategory, setDocCategory] = useState<'flight' | 'hotel' | 'cab' | 'permit' | 'insurance'>(
    'flight'
  );
  const [docName, setDocName] = useState('IndiGo Return Flight 6E-205');
  const [attachedFileName, setAttachedFileName] = useState<string | null>(
    'IndiGo_Return_Ticket_IXC_BLR.pdf'
  );
  const [fileSize] = useState('380 KB');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTrip) return;

    const newDoc: Omit<TravelDocument, 'id'> = {
      tripId: activeTrip.id,
      type: docCategory,
      title: docName.trim() || 'Travel Document',
      subtitle: `${activeTrip.destination} transit reservation`,
      categoryLabel:
        docCategory === 'flight'
          ? 'Flight Boarding Pass'
          : docCategory === 'hotel'
          ? 'Hotel Reservation'
          : docCategory === 'permit'
          ? 'Environmental Pass'
          : 'Travel Document',
      badge: 'Active',
      badgeColor: 'teal',
      metric1Label: 'Status',
      metric1Val: 'Confirmed Offline',
      metric2Label: 'Trip',
      metric2Val: activeTrip.destination,
      fileDocName: attachedFileName || 'Document.pdf',
      fileSize: fileSize,
      isOfflineCached: true,
      qrPayload: `TRIPSWIPE:${activeTrip.id}:${Date.now()}:${docName.toUpperCase()}`,
      isCryptographicallySigned: true,
    };

    await addDocumentToTrip(activeTrip.id, newDoc);
    onClose();
  };

  const handleSimulateUpload = () => {
    const sampleFiles = [
      'IndiGo_Ticket_IXC_BLR.pdf',
      'Manali_Resort_Voucher.pdf',
      'Rohtang_Permit_Pass.png',
      'AirIndia_BoardingPass.pkpass',
    ];
    const picked = sampleFiles[Math.floor(Math.random() * sampleFiles.length)];
    setAttachedFileName(picked);
    setDocName(picked.replace('.pdf', '').replace('.png', '').replace(/_/g, ' '));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex justify-center p-3 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-3xl p-5 shadow-2xl border border-slate-100 flex flex-col gap-4 my-auto relative max-h-[92vh] overflow-y-auto no-scrollbar">
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-1 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">wallet</span>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Vault Manager</p>
              <h2 className="text-sm font-extrabold text-slate-900">Digital Travel Wallet</h2>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 text-[10px] font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">verified_user</span>
              Local Safe
            </span>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        </div>

        {/* Associated Trip Box */}
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
          <label className="text-[11px] font-bold text-slate-500 block mb-1">Associated Trip</label>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">downhill_skiing</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-slate-900 truncate">
                {activeTrip?.destination || 'Manali'} Snow Trip
              </span>
              <span className="text-[11px] text-slate-500">
                {activeTrip?.datesText} • {activeTrip?.daysAway || 5} Days Away
              </span>
            </div>
          </div>
        </div>

        {/* Document Category Pills Grid */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700">Document Category</label>
            <span className="text-[10px] text-blue-600 font-bold">Select 1</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'flight', label: 'Flight / Train Ticket', icon: 'airplane_ticket' },
              { id: 'hotel', label: 'Hotel Voucher', icon: 'hotel' },
              { id: 'cab', label: 'Cab / Bus Pass', icon: 'directions_car' },
              { id: 'permit', label: 'Tour / Activity', icon: 'confirmation_number' },
            ].map((cat) => {
              const isSel = docCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setDocCategory(cat.id as any)}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all ${
                    isSel
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">{cat.icon}</span>
                  <span className="text-xs font-bold truncate">{cat.label}</span>
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => setDocCategory('insurance')}
              className={`col-span-2 flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all ${
                docCategory === 'insurance'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">health_and_safety</span>
              <span className="text-xs font-bold truncate">Travel & Medical Insurance Cover</span>
            </button>
          </div>
        </div>

        {/* Document Title Input */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700">Document Name</label>
            <span className="text-[10px] text-teal-700 font-bold">Auto-detected</span>
          </div>
          <div className="relative flex items-center">
            <input
              type="text"
              required
              value={docName}
              onChange={(e) => setDocName(e.target.value)}
              placeholder="e.g., IndiGo Return Flight 6E-205"
              className="w-full h-11 px-3 pr-8 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
            />
            {docName && (
              <button
                type="button"
                onClick={() => setDocName('')}
                className="absolute right-2.5 text-slate-400 hover:text-slate-600"
              >
                <span className="material-symbols-outlined text-[16px]">cancel</span>
              </button>
            )}
          </div>
        </div>

        {/* Uploaded Document Status & Simulator Dropzone */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">Uploaded Document</span>
            <span className="text-[10px] font-bold bg-teal-50 text-teal-800 px-2 py-0.5 rounded-full border border-teal-100">
              {attachedFileName ? '1 File Attached' : 'No File'}
            </span>
          </div>

          {attachedFileName && (
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">{attachedFileName}</p>
                  <p className="text-[10px] text-slate-500">
                    {fileSize} • Synced with {activeTrip?.destination || 'Manali'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAttachedFileName(null)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0"
              >
                <span className="material-symbols-outlined text-[18px]">delete</span>
              </button>
            </div>
          )}

          {/* Replace / Upload Trigger */}
          <div
            onClick={handleSimulateUpload}
            className="p-3.5 rounded-2xl border-2 border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50/20 cursor-pointer flex flex-col items-center justify-center text-center transition-all"
          >
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-1">
              <span className="material-symbols-outlined text-[18px]">cloud_upload</span>
            </div>
            <p className="text-xs font-bold text-slate-700">Tap to replace file or take photo</p>
            <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-400">
              <span className="bg-slate-100 px-1.5 py-0.2 rounded font-semibold text-slate-600">PDF</span>
              <span className="bg-slate-100 px-1.5 py-0.2 rounded font-semibold text-slate-600">PNG</span>
              <span className="bg-slate-100 px-1.5 py-0.2 rounded font-semibold text-slate-600">JPG</span>
              <span>up to 10MB</span>
            </div>
          </div>
        </div>

        {/* Security Reassurance */}
        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-700 text-xs flex items-start gap-2.5">
          <span className="material-symbols-outlined text-teal-700 text-[18px] shrink-0 mt-0.5">
            lock
          </span>
          <div className="min-w-0">
            <span className="font-bold text-slate-900 block">100% On-Device Storage & Encryption</span>
            <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
              Cached strictly offline on your phone with biometric security. TripSwipe does not store sensitive government identities like Aadhaar or Passport numbers.
            </p>
          </div>
        </div>

        {/* Save CTA */}
        <button
          type="button"
          onClick={handleSubmit}
          className="w-full h-12 rounded-full bg-blue-600 text-white font-bold text-xs shadow-md hover:bg-blue-700 active:scale-98 transition-all flex items-center justify-center gap-1.5"
        >
          <span className="material-symbols-outlined text-[18px]">save</span>
          <span>Save to Travel Wallet</span>
        </button>
      </div>
    </div>
  );
};
