import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { createWorker } from 'tesseract.js';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { parseInvoiceText } from './utils/invoiceParser';
import { ProcessingResult } from './types';
import toast from 'react-hot-toast';

function App() {
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<ProcessingResult | null>(null);

  const processInvoice = async (file: File) => {
    try {
      setProcessing(true);
      toast.loading('Processing invoice...');

      // Initialize Tesseract.js worker
      const worker = await createWorker('eng');
      
      // Perform OCR
      const { data: { text } } = await worker.recognize(file);
      await worker.terminate();

      // Parse extracted text
      const parseResult = await parseInvoiceText(text);
      setResult(parseResult);

      if (parseResult.success) {
        toast.success('Invoice processed successfully!');
      } else {
        toast.error(parseResult.error || 'Failed to process invoice');
      }
    } catch (error) {
      toast.error('Error processing invoice');
      setResult({
        success: false,
        error: 'Failed to process invoice',
      });
    } finally {
      setProcessing(false);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      processInvoice(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.pdf'],
    },
    maxFiles: 1,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2"> Invoice Processor</h1>
          <p className="text-gray-600">Upload an invoice to automatically extract and process its data</p>
        </header>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}`}
          >
            <input {...getInputProps()} />
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg text-gray-600 mb-2">
              {isDragActive ? 'Drop your invoice here' : 'Drag & drop your invoice here'}
            </p>
            <p className="text-sm text-gray-500">or click to select a file</p>
          </div>

          {processing && (
            <div className="mt-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Processing your invoice...</p>
            </div>
          )}

          {result && (
            <div className="mt-8">
              <div className={`p-4 rounded-lg ${result.success ? 'bg-green-50' : 'bg-red-50'}`}>
                {result.success ? (
                  <>
                    <div className="flex items-center mb-4">
                      <CheckCircle className="w-6 h-6 text-green-500 mr-2" />
                      <h3 className="text-lg font-semibold text-green-800">Invoice Processed Successfully</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(result.data || {}).map(([key, value]) => (
                        <div key={key} className="bg-white p-3 rounded shadow-sm">
                          <p className="text-sm text-gray-500 capitalize">{key.replace('_', ' ')}</p>
                          <p className="font-medium">{value}</p>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex items-center">
                    <AlertCircle className="w-6 h-6 text-red-500 mr-2" />
                    <p className="text-red-800">{result.error}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center mb-4">
            <FileText className="w-6 h-6 text-blue-500 mr-2" />
            <h2 className="text-xl font-semibold">Recent Invoices</h2>
          </div>
          <p className="text-gray-600 text-center py-4">No processed invoices yet</p>
        </div>
      </div>
    </div>
  );
}

export default App;