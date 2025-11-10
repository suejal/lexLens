import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { contractAPI } from '../utils/api';

const Upload = () => {
  const navigate = useNavigate();
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a PDF or DOCX file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setFile(file);
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const response = await contractAPI.upload(file, (progress) => {
        setUploadProgress(progress);
      });

      toast.success('Contract uploaded successfully!');

      // Navigate to contract list after a short delay
      setTimeout(() => {
        navigate('/contracts');
      }, 1500);

    } catch (error) {
      console.error('Upload failed:', error);
      toast.error(error.response?.data?.message || 'Upload failed. Please try again.');
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="card">
        <h1 className="text-3xl font-bold text-neutral-800 mb-2">Upload Contract</h1>
        <p className="text-neutral-600">
          Upload a PDF or DOCX contract for AI-powered analysis
        </p>
      </div>

      {/* Upload Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div
          className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all ${
            dragActive
              ? 'border-primary-500 bg-primary-50'
              : 'border-neutral-300 hover:border-primary-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            id="file-upload"
            className="hidden"
            accept=".pdf,.docx"
            onChange={handleChange}
          />

          {!file ? (
            <>
              <div className="text-6xl mb-4">📄</div>
              <h3 className="text-xl font-semibold text-neutral-800 mb-2">
                Drop your contract here
              </h3>
              <p className="text-neutral-600 mb-6">
                or click to browse (PDF, DOCX - Max 10MB)
              </p>
              <label htmlFor="file-upload" className="btn btn-primary cursor-pointer">
                Choose File
              </label>
            </>
          ) : (
            <>
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-xl font-semibold text-neutral-800 mb-2">{file.name}</h3>
              <p className="text-neutral-600 mb-6">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>

              {uploading && (
                <div className="mb-6">
                  <div className="w-full bg-neutral-200 rounded-full h-3 overflow-hidden">
                    <motion.div
                      className="h-full bg-primary-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadProgress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <p className="text-sm text-neutral-600 mt-2">
                    {uploadProgress < 100 ? `Uploading... ${uploadProgress}%` : 'Processing...'}
                  </p>
                </div>
              )}

              <div className="flex justify-center space-x-4">
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Uploading...' : 'Upload & Analyze'}
                </button>
                <button
                  onClick={() => setFile(null)}
                  disabled={uploading}
                  className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Remove
                </button>
              </div>
            </>
          )}
        </div>
      </motion.div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card text-center">
          <div className="text-3xl mb-2">🤖</div>
          <h4 className="font-semibold text-neutral-800 mb-1">AI Analysis</h4>
          <p className="text-sm text-neutral-600">Powered by GPT-4</p>
        </div>
        <div className="card text-center">
          <div className="text-3xl mb-2">⚡</div>
          <h4 className="font-semibold text-neutral-800 mb-1">Fast Processing</h4>
          <p className="text-sm text-neutral-600">Results in seconds</p>
        </div>
        <div className="card text-center">
          <div className="text-3xl mb-2">🔒</div>
          <h4 className="font-semibold text-neutral-800 mb-1">Secure</h4>
          <p className="text-sm text-neutral-600">Your data is safe</p>
        </div>
      </div>
    </div>
  );
};

export default Upload;

