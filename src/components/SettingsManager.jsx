import React, { useState, useRef } from 'react';
import { useAcademy } from '../context/AcademyContext';
import { 
  Building, 
  RotateCcw, 
  Check, 
  Sparkles,
  ShieldCheck,
  Globe,
  Percent,
  CreditCard,
  Lock,
  Upload,
  Trash2,
  Stamp
} from 'lucide-react';
import { processSignatureFile } from '../utils/signatureLoader';

export default function SettingsManager() {
  const { 
    settings, 
    setSettings, 
    currentUser,
    isAdminOrSuperAdmin,
    companySignature,
    updateCompanySignature,
    removeCompanySignature,
    addToast 
  } = useAcademy();

  const fileInputRef = useRef(null);
  const [isProcessingSig, setIsProcessingSig] = useState(false);

  const [formData, setFormData] = useState({ 
    ...settings,
    baseCourseFee: settings.baseCourseFee || 15000,
    baseInternshipFee: settings.baseInternshipFee || 15000,
    gstPercent: settings.gstPercent || 18,
    taxRate: settings.taxRate || 18
  });

  const handleSaveSettings = (e) => {
    e.preventDefault();
    if (!isAdminOrSuperAdmin) {
      addToast('Restricted: Only Super Admin or Admin can modify institution settings.', 'error');
      return;
    }
    setSettings(formData);
    addToast('Institution & tuition configuration saved successfully!', 'success');
  };

  const handleResetData = () => {
    if (!isAdminOrSuperAdmin) {
      addToast('Restricted: Only Super Admin or Admin can perform system reset.', 'error');
      return;
    }
    if (window.confirm('Reset local storage and refresh to factory defaults?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const computedGst = Math.round((Number(formData.baseCourseFee) || 15000) * ((Number(formData.gstPercent) || 18) / 100));
  const computedTotal = (Number(formData.baseCourseFee) || 15000) + computedGst;

  return (
    <div className="space-y-4 animate-in fade-in duration-200 max-w-4xl mx-auto">
      
      {/* Slim Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          Institution & Tuition Configuration
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Convosis Technologies Private Limited • Entity profile, standard base fees, and mandatory 18% GST management
        </p>
      </div>

      {/* RBAC Notice if not Admin */}
      {!isAdminOrSuperAdmin && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
          <Lock className="w-4 h-4 text-amber-600 shrink-0" />
          <span>You are viewing this configuration in read-only mode. Only <strong>Super Admin</strong> or <strong>Admin</strong> users can modify settings.</span>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSaveSettings} className="glass-card rounded-xl p-5 border space-y-4 bg-white/95">
        <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
          <Building className="w-4 h-4 text-cyan-600" />
          <h2 className="text-sm font-bold text-slate-900">Company & Academy Legal Entity</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="sm:col-span-2">
            <label className="font-bold text-slate-700 block mb-1">Company Legal Entity Name</label>
            <input
              type="text"
              disabled={!isAdminOrSuperAdmin}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-1.5 rounded-lg glass-input font-bold text-sm disabled:opacity-75"
              required
            />
          </div>

          <div>
            <label className="font-semibold text-slate-600 block mb-1">Division / Tagline</label>
            <input
              type="text"
              disabled={!isAdminOrSuperAdmin}
              value={formData.subname || 'Technical Training Division'}
              onChange={(e) => setFormData({ ...formData, subname: e.target.value })}
              className="w-full px-3 py-1.5 rounded-lg glass-input disabled:opacity-75"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-600 block mb-1">Official Website</label>
            <input
              type="url"
              disabled={!isAdminOrSuperAdmin}
              value={formData.website || 'https://convosis.com'}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              className="w-full px-3 py-1.5 rounded-lg glass-input font-mono disabled:opacity-75"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-600 block mb-1">Unique Organization Number *</label>
            <input
              type="text"
              disabled={!isAdminOrSuperAdmin}
              value={formData.orgNumber || 'CV-ORG-2026'}
              onChange={(e) => setFormData({ ...formData, orgNumber: e.target.value })}
              className="w-full px-3 py-1.5 rounded-lg glass-input font-mono font-bold text-cyan-800 disabled:opacity-75"
              required
            />
          </div>

          <div>
            <label className="font-semibold text-slate-600 block mb-1">CIN (Corporate Identity Number)</label>
            <input
              type="text"
              disabled={!isAdminOrSuperAdmin}
              value={formData.cinNumber || 'U72900KA2026PTC184920'}
              onChange={(e) => setFormData({ ...formData, cinNumber: e.target.value })}
              className="w-full px-3 py-1.5 rounded-lg glass-input font-mono disabled:opacity-75"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-600 block mb-1">GSTIN / Tax ID Number</label>
            <input
              type="text"
              disabled={!isAdminOrSuperAdmin}
              value={formData.taxId || 'GSTIN29AAACC1234D1Z5'}
              onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
              className="w-full px-3 py-1.5 rounded-lg glass-input font-mono disabled:opacity-75"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-600 block mb-1">Primary Admissions Email</label>
            <input
              type="email"
              disabled={!isAdminOrSuperAdmin}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-1.5 rounded-lg glass-input font-mono disabled:opacity-75"
              required
            />
          </div>

          <div>
            <label className="font-semibold text-slate-600 block mb-1">Tuition Currency</label>
            <div className="grid grid-cols-2 gap-2">
              <select
                disabled={!isAdminOrSuperAdmin}
                value={formData.currency}
                onChange={(e) => {
                  const symbol = e.target.value;
                  const codeMap = { '₹': 'INR', '$': 'USD', '€': 'EUR', '£': 'GBP' };
                  setFormData({ ...formData, currency: symbol, currencyCode: codeMap[symbol] || 'INR' });
                }}
                className="w-full px-2.5 py-1.5 rounded-lg glass-input font-bold cursor-pointer disabled:opacity-75"
              >
                <option value="₹">₹ (INR - Default)</option>
                <option value="$">$ (USD)</option>
                <option value="€">€ (EUR)</option>
                <option value="£">£ (GBP)</option>
              </select>

              <input
                type="text"
                disabled={!isAdminOrSuperAdmin}
                value={formData.currencyCode || 'INR'}
                onChange={(e) => setFormData({ ...formData, currencyCode: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-lg glass-input font-mono text-center disabled:opacity-75"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-600 block mb-1">Contact Phone</label>
            <input
              type="text"
              disabled={!isAdminOrSuperAdmin}
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-1.5 rounded-lg glass-input disabled:opacity-75"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="font-semibold text-slate-600 block mb-1">Registered Headquarters Address</label>
            <input
              type="text"
              disabled={!isAdminOrSuperAdmin}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-1.5 rounded-lg glass-input disabled:opacity-75"
            />
          </div>
        </div>

        {/* Standard Tuition & 18% GST Settings */}
        <div className="pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2 pb-2">
            <Percent className="w-4 h-4 text-cyan-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Standard Tuition & GST Tax Rates (Super Admin & Admin Only)
            </h3>
          </div>

          <div className="p-3.5 rounded-xl bg-cyan-50/70 border border-cyan-200 space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Course Base Fee (₹)</label>
                <input
                  type="number"
                  min="0"
                  disabled={!isAdminOrSuperAdmin}
                  value={formData.baseCourseFee}
                  onChange={(e) => setFormData({ ...formData, baseCourseFee: Number(e.target.value) })}
                  className="w-full px-2.5 py-1.5 rounded-lg glass-input font-bold text-slate-900 disabled:opacity-75"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Internship Base Fee (₹)</label>
                <input
                  type="number"
                  min="0"
                  disabled={!isAdminOrSuperAdmin}
                  value={formData.baseInternshipFee}
                  onChange={(e) => setFormData({ ...formData, baseInternshipFee: Number(e.target.value) })}
                  className="w-full px-2.5 py-1.5 rounded-lg glass-input font-bold text-slate-900 disabled:opacity-75"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Mandatory GST Rate (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  disabled={!isAdminOrSuperAdmin}
                  value={formData.gstPercent}
                  onChange={(e) => setFormData({ ...formData, gstPercent: Number(e.target.value), taxRate: Number(e.target.value) })}
                  className="w-full px-2.5 py-1.5 rounded-lg glass-input font-bold text-slate-900 disabled:opacity-75"
                />
              </div>
            </div>

            {/* Calculated Breakdown Display */}
            <div className="pt-2 border-t border-cyan-200 flex flex-wrap items-center justify-between text-xs">
              <span className="text-slate-600">
                Course Tuition Computation: <strong>₹{(Number(formData.baseCourseFee) || 15000).toLocaleString()}</strong> Base + <strong>{formData.gstPercent}% GST</strong> (₹{computedGst.toLocaleString()})
              </span>
              <span className="font-extrabold text-cyan-900 text-sm">
                Total Payable: ₹{computedTotal.toLocaleString()}
              </span>
            </div>
            <div className="text-[10px] text-emerald-700 font-bold text-right">
              Standard 3-Month Plan: 3x ₹{Math.round(computedTotal / 3).toLocaleString()} / month
            </div>
          </div>
        </div>

        {/* Company Authorised Signature & Seal (For Retainer & Tax Invoices) */}
        <div className="pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2 pb-2">
            <Stamp className="w-4 h-4 text-cyan-600" />
            <h3 className="font-bold text-slate-800 text-xs">
              Company Authorised Signature & Seal (Retainer & Tax Invoices)
            </h3>
          </div>
          <p className="text-[11px] text-slate-500 mb-3">
            Upload the official authorised signatory scan or digital stamp. Supports PDF files or images (PNG, JPG, SVG). It will automatically render on all generated official invoices and receipts.
          </p>

          <input
            type="file"
            ref={fileInputRef}
            accept=".pdf,image/png,image/jpeg,image/jpg,image/svg+xml,image/webp"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              try {
                setIsProcessingSig(true);
                const dataUrl = await processSignatureFile(file);
                updateCompanySignature(dataUrl);
              } catch (err) {
                addToast('Failed to process signature: ' + err.message, 'error');
              } finally {
                setIsProcessingSig(false);
                if (e.target) e.target.value = '';
              }
            }}
          />

          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-48 h-16 rounded-lg bg-white border border-slate-200 flex items-center justify-center p-2 overflow-hidden shadow-2xs">
                {companySignature ? (
                  <img
                    src={companySignature}
                    alt="Company Authorised Signature"
                    className="max-h-14 max-w-[180px] w-auto object-contain"
                  />
                ) : (
                  <svg viewBox="0 0 160 50" className="w-36 h-12 text-slate-800">
                    <path
                      d="M 8 36 Q 24 10 34 27 T 48 29 Q 62 4 68 31 T 88 27 Q 102 14 122 34 Q 138 29 152 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M 18 21 Q 48 14 82 21 T 136 17"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
              </div>
              <div className="text-xs">
                <div className="font-bold text-slate-900">
                  {companySignature ? 'Custom Signature Active' : 'Default Convosis Handwritten Signature'}
                </div>
                <div className="text-[10px] text-slate-500">
                  {companySignature ? 'Rendered from uploaded company file' : 'Official Convosis authorized signatory'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessingSig}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 shadow-xs cursor-pointer transition-all"
              >
                <Upload className="w-3.5 h-3.5 text-cyan-600" />
                <span>{isProcessingSig ? 'Extracting PDF...' : companySignature ? 'Replace PDF/Image' : 'Upload Signature PDF'}</span>
              </button>

              {companySignature && (
                <button
                  type="button"
                  onClick={removeCompanySignature}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 cursor-pointer transition-all"
                  title="Reset to default Convosis handwritten signature"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Reset Default</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {isAdminOrSuperAdmin && (
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={handleResetData}
              className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-semibold cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Local Storage</span>
            </button>

            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-700 text-white shadow-xs transition-all cursor-pointer"
            >
              Save Configuration Changes
            </button>
          </div>
        )}
      </form>

    </div>
  );
}
