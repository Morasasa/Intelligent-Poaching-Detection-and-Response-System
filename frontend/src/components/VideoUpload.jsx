import { useState, useRef } from 'react';
import api from '../api/axios';
import { UploadCloud, CheckCircle2, AlertTriangle, X, Play } from 'lucide-react';
import { Button } from './common/Button';

export default function VideoUpload({ onUploadSuccess }) {
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isDragging, setIsDragging] = useState(false);

    const fileInputRef = useRef(null);

    const handleFileChange = (selectedFile) => {
        if (selectedFile && selectedFile.type.startsWith('video/')) {
            setFile(selectedFile);
            setPreviewUrl(URL.createObjectURL(selectedFile));
            setMessage('');
            setError('');
        } else {
            setError('Please select a valid video file.');
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        handleFileChange(droppedFile);
    };

    const clearSelection = () => {
        setFile(null);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
        setError('');
        setMessage('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
        setError('');

        try {
            await api.post('/video/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setMessage('Video encrypted and transmitted successfully.');
            setTimeout(() => {
                clearSelection();
                if (onUploadSuccess) onUploadSuccess();
            }, 2000);
        } catch (err) {
            setError('Transmission failed. Uplink error.');
            console.error(err);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="flex flex-col h-full w-full">
            <form onSubmit={handleUpload} className="flex-1 flex flex-col">

                {!file ? (
                    <div
                        className={`flex-1 min-h-[300px] border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center p-6 transition-all cursor-pointer ${isDragging
                                ? 'border-forest-400 bg-forest-900/40 scale-[1.02]'
                                : 'border-forest-700/50 hover:border-forest-500 hover:bg-forest-900/20 bg-forest-950/50'
                            }`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input
                            type="file"
                            accept="video/*"
                            onChange={(e) => handleFileChange(e.target.files[0])}
                            className="hidden"
                            ref={fileInputRef}
                        />
                        <div className="bg-forest-800 p-4 rounded-full mb-4 shadow-glass text-forest-400">
                            <UploadCloud className="h-8 w-8" />
                        </div>
                        <p className="text-slate-200 font-medium mb-1">Select or drop video feed</p>
                        <p className="text-forest-400 text-sm">MP4, WebM, or OGG up to 50MB</p>
                    </div>
                ) : (
                    <div className="flex-1 min-h-[300px] rounded-xl overflow-hidden relative border border-forest-700/50 bg-forest-950/50 flex flex-col">
                        <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
                            <video
                                src={previewUrl}
                                className="max-h-full max-w-full object-contain opacity-80"
                                controls
                            />
                            {!uploading && (
                                <button
                                    type="button"
                                    onClick={clearSelection}
                                    className="absolute top-4 right-4 bg-alert-900/80 hover:bg-alert-600 text-white p-2 rounded-full backdrop-blur-md transition-colors border border-alert-600/50"
                                >
                                    <X size={16} />
                                </button>
                            )}

                            {uploading && (
                                <div className="absolute inset-0 bg-forest-950/80 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                                    <div className="h-12 w-12 border-4 border-forest-700 border-t-forest-400 rounded-full animate-spin mb-4" />
                                    <p className="text-forest-300 font-medium animate-pulse">Encrypting & Transmitting...</p>
                                </div>
                            )}
                        </div>

                        <div className="p-4 bg-forest-900 border-t border-forest-800 flex items-center justify-between">
                            <div className="truncate pr-4">
                                <p className="text-slate-200 text-sm font-medium truncate">{file.name}</p>
                                <p className="text-forest-400 text-xs text-left">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                            </div>
                            <Button
                                type="submit"
                                disabled={uploading}
                                className="shrink-0"
                            >
                                <UploadCloud className="mr-2 h-4 w-4" />
                                {uploading ? 'Uplinking...' : 'Initiate Scan'}
                            </Button>
                        </div>
                    </div>
                )}

                <div className="h-10 mt-4">
                    {message && (
                        <div className="flex items-center text-forest-400 text-sm bg-forest-900/50 rounded-lg p-3 border border-forest-800">
                            <CheckCircle2 className="h-4 w-4 mr-2" /> {message}
                        </div>
                    )}

                    {error && (
                        <div className="flex items-center text-alert-400 text-sm bg-alert-900/30 rounded-lg p-3 border border-alert-800/50">
                            <AlertTriangle className="h-4 w-4 mr-2 text-alert-500" /> {error}
                        </div>
                    )}
                </div>
            </form>
        </div>
    );
}
