import React, { useCallback } from 'react';

interface Props {
  onFile: (file: File) => void;
  isLoading: boolean;
}

export const FileUpload: React.FC<Props> = ({ onFile, isLoading }) => {
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.csv')) onFile(file);
  }, [onFile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFile(file);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-indigo-400 mb-2">LinkedIn Network Intelligence</h1>
        <p className="text-slate-400 text-lg">Transform your connections into career insights</p>
      </div>

      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-indigo-500 rounded-xl p-12 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-950/30 transition-all w-full max-w-lg"
      >
        {isLoading ? (
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-400"></div>
            <p className="text-slate-300">Analyzing your network...</p>
          </div>
        ) : (
          <>
            <div className="text-6xl mb-4">📊</div>
            <p className="text-slate-300 text-lg mb-2">Drop your LinkedIn CSV here</p>
            <p className="text-slate-500 text-sm mb-6">or click to browse</p>
            <label className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg cursor-pointer transition-colors">
              Choose File
              <input type="file" accept=".csv" onChange={handleChange} className="hidden" />
            </label>
          </>
        )}
      </div>

      <div className="mt-8 text-center max-w-md">
        <p className="text-slate-500 text-sm">
          Export your connections from LinkedIn: <br />
          Settings → Data Privacy → Get a copy of your data → Connections
        </p>
      </div>
    </div>
  );
};
