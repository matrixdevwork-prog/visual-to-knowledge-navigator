import React from 'react';
import { SavedKnowledgeModule } from '../types';

interface SavedLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedModules: SavedKnowledgeModule[];
  onLoad: (module: SavedKnowledgeModule) => void;
  onDelete: (id: string) => void;
}

const SavedLibraryModal: React.FC<SavedLibraryModalProps> = ({ 
  isOpen, 
  onClose, 
  savedModules, 
  onLoad, 
  onDelete 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden animate-scale-in">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Your Knowledge Library</h2>
            <p className="text-sm text-slate-500">Access your saved learning modules</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* List */}
        <div className="overflow-y-auto p-6 space-y-4 bg-slate-50/30 flex-1">
          {savedModules.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
              <p className="text-lg font-medium">No saved modules yet</p>
              <p className="text-sm">Generate a knowledge view and click "Save" to build your library.</p>
            </div>
          ) : (
            savedModules.map((module) => (
              <div key={module.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">{module.identifiedObject}</h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Saved on {new Date(module.savedAt).toLocaleDateString()} at {new Date(module.savedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => { onLoad(module); onClose(); }}
                    className="flex-1 sm:flex-none px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 font-medium text-sm rounded-lg transition-colors"
                  >
                    Open View
                  </button>
                  <button 
                    onClick={() => onDelete(module.id)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SavedLibraryModal;