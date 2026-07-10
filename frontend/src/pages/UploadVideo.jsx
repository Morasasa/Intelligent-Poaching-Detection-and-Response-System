import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import { Button } from '../components/common/Button';
import { AlertBanner } from '../components/common/AlertBanner';
import { videoService } from '../api/services';
import {
    UploadCloud, CheckCircle2, AlertTriangle, X,
    ImageIcon, Activity, Target, Trash2
} from 'lucide-react';

const MAX_SIZE_MB = 50;
const MAX_FILES = 20;
const ACCEPTED_TYPES = ['video/mp4', 'video/x-msvideo', 'video/quicktime', 'image/jpeg', 'image/png', 'image/webp', 'image/bmp', 'image/tiff'];

export default function UploadVideo() {
    const [files, setFiles] = useState([]);        // Array of { file, previewUrl }
    const [isDragging, setIsDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState({}); // { index: pct }
    const [result, setResult] = useState(null);     // 'success' | 'error'
    const [errorMsg, setErrorMsg] = useState('');
    const [successCount, setSuccessCount] = useState(0);

    const fileInputRef = useRef(null);

    // ─── File validation (accepts multiple) ───────────────
    const validateAndAddFiles = (selectedFiles) => {
        setResult(null);
        setErrorMsg('');

        const newFiles = [];
        const errors = [];

        for (const selected of selectedFiles) {
            if (files.length + newFiles.length >= MAX_FILES) {
                errors.push(`Maximum ${MAX_FILES} images allowed per batch.`);
                break;
            }
            if (!ACCEPTED_TYPES.includes(selected.type)) {
                errors.push(`"${selected.name}" — invalid type. Only MP4, AVI, MOV, JPG, PNG, WebP.`);
                continue;
            }
            if (selected.size > MAX_SIZE_MB * 1024 * 1024) {
                errors.push(`"${selected.name}" exceeds ${MAX_SIZE_MB}MB limit.`);
                continue;
            }
            // Check for duplicates
            const isDuplicate = files.some(f => f.file.name === selected.name && f.file.size === selected.size);
            if (isDuplicate) continue;

            newFiles.push({
                file: selected,
                previewUrl: URL.createObjectURL(selected),
            });
        }

        if (errors.length > 0) {
            setErrorMsg(errors.join(' '));
        }
        if (newFiles.length > 0) {
            setFiles(prev => [...prev, ...newFiles]);
        }
    };

    const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = () => setIsDragging(false);
    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        validateAndAddFiles([...e.dataTransfer.files]);
    };

    const removeFile = (index) => {
        setFiles(prev => {
            const updated = [...prev];
            URL.revokeObjectURL(updated[index].previewUrl);
            updated.splice(index, 1);
            return updated;
        });
    };

    const clearAll = () => {
        files.forEach(f => URL.revokeObjectURL(f.previewUrl));
        setFiles([]);
        setResult(null);
        setErrorMsg('');
        setUploadProgress({});
        setSuccessCount(0);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // ─── Upload handler (batch) ───────────────────────────
    const handleUpload = async (e) => {
        e.preventDefault();
        if (files.length === 0) return;

        setUploading(true);
        setResult(null);
        setUploadProgress({});
        let completed = 0;
        let failed = 0;

        for (let i = 0; i < files.length; i++) {
            try {
                await videoService.upload(files[i].file, (pct) => {
                    setUploadProgress(prev => ({ ...prev, [i]: pct }));
                });
                setUploadProgress(prev => ({ ...prev, [i]: 100 }));
                completed++;
            } catch (err) {
                setUploadProgress(prev => ({ ...prev, [i]: -1 })); // -1 = failed
                failed++;
            }
        }

        setSuccessCount(completed);
        if (failed > 0) {
            setErrorMsg(`${failed} of ${files.length} images failed to upload.`);
            setResult('error');
        } else {
            setResult('success');
        }
        setUploading(false);
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const totalSize = files.reduce((sum, f) => sum + f.file.size, 0);
    const overallProgress = files.length > 0
        ? Math.round(Object.values(uploadProgress).filter(p => p >= 0).reduce((a, b) => a + b, 0) / files.length)
        : 0;

    return (
        <AppLayout
            title="Upload Surveillance Images"
            subtitle="Submit field photos for AI-powered threat detection analysis"
        >
            <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8 animate-fade-in text-slate-100">

                {/* Result banners */}
                {result === 'success' && (
                    <div className="bg-emerald-500/10 border border-emerald-500/40 text-emerald-100 rounded-xl p-5 shadow-[0_0_20px_rgba(52,211,153,0.15)]">
                        <div className="flex gap-4 items-start">
                            <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <h4 className="font-semibold text-emerald-300">Batch upload complete</h4>
                                <p className="text-sm mt-1 opacity-80">{successCount} image{successCount !== 1 ? 's' : ''} queued for YOLOv8 analysis. Results will appear shortly in the detection logs.</p>
                            </div>
                            <button onClick={() => setResult(null)} className="opacity-60 hover:opacity-100"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="flex gap-3 mt-4 ml-10">
                            <Link to="/detections">
                                <Button variant="primary" size="sm">
                                    <Target className="h-3.5 w-3.5" /> View Detection Results
                                </Button>
                            </Link>
                            <Button variant="outline" size="sm" onClick={clearAll}>
                                <UploadCloud className="h-3.5 w-3.5" /> Upload More
                            </Button>
                        </div>
                    </div>
                )}
                {result === 'error' && (
                    <div className="bg-red-500/10 border border-red-500/40 text-red-100 rounded-xl p-4 flex gap-4 items-start shadow-[0_0_20px_rgba(239,68,68,0.15)]">
                        <AlertTriangle className="w-6 h-6 text-red-400 shrink-0" />
                        <div>
                            <h4 className="font-semibold text-red-300">Upload issue</h4>
                            <p className="text-sm mt-1 opacity-80">{errorMsg}</p>
                        </div>
                        <button onClick={() => { setResult(null); setErrorMsg(''); }} className="ml-auto opacity-60 hover:opacity-100"><X className="w-5 h-5" /></button>
                    </div>
                )}

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Upload Area (2 columns) */}
                    <div className="lg:col-span-2 space-y-6">
                        <form onSubmit={handleUpload}>
                            {/* Dropzone — always visible when not uploading */}
                            <div
                                className={`relative rounded-3xl overflow-hidden border-2 border-dashed flex flex-col items-center justify-center text-center p-12 cursor-pointer transition-all duration-300 ${files.length === 0 ? 'min-h-[400px]' : 'min-h-[150px]'} ${isDragging
                                    ? 'border-emerald-400 bg-emerald-900/20 scale-[1.02] shadow-[0_0_40px_rgba(52,211,153,0.15)]'
                                    : 'border-white/10 hover:border-emerald-500/40 bg-white/5 hover:bg-emerald-900/10'
                                    } backdrop-blur-sm`}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                                role="button"
                                aria-label="Upload images"
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    accept="video/*, image/*"
                                    multiple
                                    className="hidden"
                                    onChange={(e) => validateAndAddFiles([...e.target.files])}
                                />
                                <div className={`p-4 rounded-3xl mb-4 transition-colors shadow-inner ${isDragging ? 'bg-emerald-500/20' : 'bg-black/20'}`}>
                                    <UploadCloud className={`h-10 w-10 transition-colors ${isDragging ? 'text-emerald-300' : 'text-emerald-500/70'}`} />
                                </div>
                                <p className="text-lg font-medium text-white mb-1">
                                    {isDragging ? 'Release to add images' : files.length > 0 ? 'Drop more images or click to add' : 'Drag & drop surveillance photos here'}
                                </p>
                                <p className="text-sm text-emerald-100/50 mb-4">Select multiple images at once • Up to {MAX_FILES} per batch</p>

                                <div className="flex flex-wrap gap-2 justify-center">
                                    {['MP4', 'AVI', 'MOV', 'JPG', 'PNG', 'WebP'].map(f => (
                                        <span key={f} className="px-3 py-1 bg-black/30 border border-white/5 rounded-full text-[10px] uppercase font-bold tracking-widest text-emerald-400/70">{f}</span>
                                    ))}
                                </div>
                                <p className="text-xs text-white/30 mt-4 font-mono">MAX_PAYLOAD: {MAX_SIZE_MB}MB per file</p>

                                {errorMsg && !result && (
                                    <div className="absolute bottom-4 mx-auto flex items-center gap-2 text-red-400 text-xs bg-red-950/50 border border-red-800/50 rounded-full px-4 py-2">
                                        <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                                        {errorMsg}
                                    </div>
                                )}
                            </div>

                            {/* Selected Files Grid */}
                            {files.length > 0 && (
                                <div className="mt-6 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm text-emerald-300 font-medium">
                                            {files.length} image{files.length !== 1 ? 's' : ''} selected
                                            <span className="text-emerald-500/70 ml-2 font-mono text-xs">({formatFileSize(totalSize)} total)</span>
                                        </p>
                                        {!uploading && (
                                            <button type="button" onClick={clearAll} className="text-xs text-red-400 hover:text-red-300 transition-colors flex items-center gap-1">
                                                <Trash2 className="h-3 w-3" /> Clear all
                                            </button>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                        {files.map((f, i) => {
                                            const prog = uploadProgress[i];
                                            const isComplete = prog === 100;
                                            const isFailed = prog === -1;

                                            return (
                                                <div key={i} className="relative group rounded-xl overflow-hidden border border-white/10 bg-black/30 aspect-square">
                                                    <img src={f.previewUrl} alt={f.file.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />

                                                    {/* Upload/Analysis dynamic scanning overlay */}
                                                    {uploading && prog !== undefined && prog >= 0 && prog < 100 && (
                                                        <div className="absolute inset-0 bg-emerald-950/80 overflow-hidden flex flex-col items-center justify-center">
                                                            {/* Radar Background */}
                                                            <div className="absolute inset-0 opacity-30 pointer-events-none">
                                                                <div className="absolute inset-0 border-[1px] border-emerald-500/20 rounded-full scale-150"></div>
                                                                <div className="absolute inset-0 border-[1px] border-emerald-500/30 rounded-full scale-100"></div>
                                                                <div className="absolute inset-0 border-[1px] border-emerald-500/50 rounded-full scale-50"></div>
                                                                <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-emerald-500/30"></div>
                                                                <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-emerald-500/30"></div>
                                                            </div>
                                                            
                                                            {/* Radar Sweep */}
                                                            <div className="absolute inset-0 origin-center pointer-events-none" style={{ animation: 'radar-spin 3s linear infinite' }}>
                                                                <div className="w-1/2 h-1/2 bg-gradient-to-br from-emerald-400/0 via-emerald-400/10 to-emerald-400/40 absolute top-0 right-0 origin-bottom-left rounded-tr-full"></div>
                                                                <div className="w-1/2 h-full absolute right-0 border-l-[1.5px] border-emerald-400/80"></div>
                                                            </div>

                                                            {/* Vertical Scan Line */}
                                                            <div className="absolute left-0 right-0 h-1 bg-emerald-400/80 shadow-[0_0_15px_rgba(52,211,153,1)] z-10" style={{ animation: 'scan-line 2s ease-in-out infinite' }}></div>
                                                            
                                                            <div className="relative z-20 bg-black/60 px-3 py-1.5 rounded-full border border-emerald-500/30 backdrop-blur-sm -mt-4">
                                                                <span className="text-[11px] text-emerald-300 font-mono font-bold tracking-wider animate-pulse flex items-center gap-1.5">
                                                                    <Target className="w-3 h-3 text-emerald-400 animate-spin-pulse" style={{ animationDuration: '3s' }} /> 
                                                                    SCANNING {prog}%
                                                                </span>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {isComplete && (
                                                        <div className="absolute top-2 right-2 p-1 bg-emerald-500 rounded-full">
                                                            <CheckCircle2 className="h-3 w-3 text-white" />
                                                        </div>
                                                    )}
                                                    {isFailed && (
                                                        <div className="absolute inset-0 bg-red-900/50 flex items-center justify-center">
                                                            <AlertTriangle className="h-6 w-6 text-red-400" />
                                                        </div>
                                                    )}

                                                    {/* Remove button */}
                                                    {!uploading && (
                                                        <button
                                                            type="button"
                                                            onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                                                            className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/90 text-white/70 hover:text-white rounded-full opacity-0 group-hover:opacity-100 transition-all border border-white/10"
                                                        >
                                                            <X size={12} />
                                                        </button>
                                                    )}

                                                    {/* File name */}
                                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                                                        <p className="text-[10px] text-white/80 truncate font-mono">{f.file.name}</p>
                                                        <p className="text-[9px] text-emerald-400/60 font-mono">{formatFileSize(f.file.size)}</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Submit row */}
                                    <div className="flex items-center gap-4 pt-2">
                                        <button
                                            type="submit"
                                            disabled={uploading || files.length === 0 || result === 'success'}
                                            className={`flex-1 px-6 py-4 rounded-2xl font-semibold transition-all shadow-[0_0_20px_rgba(52,211,153,0.3)] flex items-center justify-center gap-3 ${
                                                uploading ? 'bg-emerald-800 text-emerald-400/50 cursor-not-allowed' :
                                                result === 'success' ? 'bg-emerald-900/50 text-emerald-500/50 border border-emerald-500/20 cursor-not-allowed' :
                                                'bg-emerald-500 hover:bg-emerald-400 text-[#020804] hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(52,211,153,0.5)]'
                                            }`}
                                        >
                                            {result === 'success' ? (
                                                <><CheckCircle2 className="w-5 h-5 text-emerald-500/50" /> Images Successfully Analysed</>
                                            ) : uploading ? (
                                                <><Activity className="w-5 h-5 animate-spin text-emerald-400" /> Scanning Database... {overallProgress}%</>
                                            ) : (
                                                <><Activity className="w-5 h-5" /> Start YOLOv8 Scan — {files.length} image{files.length !== 1 ? 's' : ''}</>
                                            )}
                                        </button>
                                    </div>

                                    {/* Overall progress bar */}
                                    {uploading && (
                                        <div className="h-2 bg-black/50 rounded-full overflow-hidden border border-white/5">
                                            <div
                                                className="h-full bg-gradient-to-r from-emerald-600 via-emerald-400 to-green-300 rounded-full transition-all duration-300 relative"
                                                style={{ width: `${overallProgress}%` }}
                                            >
                                                <div className="absolute inset-0 bg-white/20 w-1/2 rounded-full blur-[2px] right-0 translate-x-1/2"></div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </form>
                    </div>

                    {/* Right: Info Panel (1 column) */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-3xl p-6 relative overflow-hidden group">
                            <div className="absolute -inset-24 bg-gradient-to-br from-emerald-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-2xl z-0"></div>

                            <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-6 tracking-wide uppercase relative z-10">
                                <Target className="h-4 w-4 text-emerald-400" />
                                Inference Model
                            </h3>

                            <div className="space-y-5 relative z-10">
                                {[
                                    { label: 'Poacher Detection', desc: 'Identifies unauthorized human presence', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
                                    { label: 'Weapon Identification', desc: 'Rifles, snares & traps', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
                                    { label: 'Wildlife Tracking', desc: 'Species cataloging & counting', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
                                    { label: 'Ranger Recognition', desc: 'Friendly personnel identification', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
                                ].map(({ label, desc, color, bg, border }) => (
                                    <div key={label} className="flex gap-4 items-start">
                                        <div className={`p-2 rounded-lg ${bg} ${border} border`}>
                                            <CheckCircle2 className={`h-4 w-4 ${color}`} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-white mb-0.5">{label}</p>
                                            <p className="text-xs text-emerald-100/50 leading-relaxed">{desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-black/20 border border-emerald-900/30 rounded-3xl p-6">
                            <h3 className="text-xs font-mono tracking-widest text-emerald-400/50 uppercase mb-4">Pipeline Status</h3>
                            <div className="relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-emerald-500/20 before:to-transparent">
                                {[
                                    'Batch Upload',
                                    'Image Analysis',
                                    'YOLOv8 Inference',
                                    'Alert Dispatch',
                                ].map((step, i) => (
                                    <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active mb-6 last:mb-0">
                                        <div className="flex items-center justify-center w-6 h-6 rounded-full border border-emerald-500/30 bg-black text-emerald-400/50 group-hover:text-emerald-400 group-hover:border-emerald-400 shadow-[0_0_0_4px_rgba(6,20,11,1)] z-10 font-mono text-[10px] transition-colors">
                                            {i + 1}
                                        </div>
                                        <div className="w-[calc(100%-3rem)] text-xs text-emerald-100/40 group-hover:text-emerald-100/80 transition-colors ml-4 font-medium uppercase tracking-wider">
                                            {step}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
