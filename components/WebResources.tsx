import React from 'react';
import { WebResourceData } from '../types';

interface WebResourcesProps {
  data: WebResourceData;
  isLoading: boolean;
  onFetch: () => void;
  hasFetched: boolean;
}

const WebResources: React.FC<WebResourcesProps> = ({ data, isLoading, onFetch, hasFetched }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
            Verified Web Resources
        </h3>
        {!hasFetched && !isLoading && (
            <button 
                onClick={onFetch}
                className="text-sm px-3 py-1 bg-blue-100 text-blue-700 font-medium rounded-full hover:bg-blue-200 transition-colors flex items-center gap-1"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                Find Resources
            </button>
        )}
      </div>

      {isLoading && (
          <div className="animate-pulse space-y-3">
              <div className="h-4 bg-slate-200 rounded w-3/4"></div>
              <div className="h-4 bg-slate-200 rounded w-1/2"></div>
              <div className="h-20 bg-slate-100 rounded mt-4"></div>
          </div>
      )}

      {!isLoading && hasFetched && (
          <div className="space-y-4 animate-fade-in">
              <p className="text-sm text-slate-600 leading-relaxed border-l-4 border-blue-200 pl-3">
                  {data.summary}
              </p>
              
              {data.sources.length > 0 ? (
                  <div className="grid gap-2 sm:grid-cols-2">
                      {data.sources.map((source, idx) => (
                          <a 
                            key={idx} 
                            href={source.uri} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-start gap-2 p-3 rounded-lg border border-slate-100 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 transition-all group"
                          >
                              <div className="mt-1 flex-shrink-0 w-4 h-4 rounded-full bg-slate-200 group-hover:bg-blue-200 flex items-center justify-center text-[10px] text-slate-600 font-bold">
                                  {idx + 1}
                              </div>
                              <div className="overflow-hidden">
                                  <p className="text-sm font-medium text-slate-800 truncate group-hover:text-blue-700">{source.title}</p>
                                  <p className="text-xs text-slate-500 truncate">{source.uri}</p>
                              </div>
                          </a>
                      ))}
                  </div>
              ) : (
                  <p className="text-sm text-slate-400 italic">No direct links found.</p>
              )}
               <div className="text-xs text-right text-slate-400 mt-2">
                  Powered by Google Search & Gemini 2.5 Flash
               </div>
          </div>
      )}

      {!hasFetched && !isLoading && (
          <div className="text-center py-6 bg-slate-50 rounded-lg border border-dashed border-slate-200">
              <p className="text-sm text-slate-500 mb-2">Want to dive deeper?</p>
              <button onClick={onFetch} className="text-blue-600 hover:underline text-sm font-medium">
                  Search for live web resources
              </button>
          </div>
      )}
    </div>
  );
};

export default WebResources;
