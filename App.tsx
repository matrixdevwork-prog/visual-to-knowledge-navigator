import React, { useState, useRef, useEffect } from 'react';
import { generateKnowledgeModule, getWebResources, initializeChat } from './services/geminiService';
import { KnowledgeModule, SavedKnowledgeModule, WebResourceData } from './types';
import ConceptMapTree from './components/ConceptMapTree';
import QuizComponent from './components/QuizComponent';
import InfoCard from './components/InfoCard';
import SavedLibraryModal from './components/SavedLibraryModal';
import ChatBot from './components/ChatBot';
import WebResources from './components/WebResources';

const App: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [userNotes, setUserNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<KnowledgeModule | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Library State
  const [savedModules, setSavedModules] = useState<SavedKnowledgeModule[]>([]);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  // Search Grounding State
  const [webData, setWebData] = useState<WebResourceData | null>(null);
  const [loadingWeb, setLoadingWeb] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load saved modules on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('vkn_library');
      if (saved) {
        setSavedModules(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load saved modules", e);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setData(null); // Reset previous data
      setError(null);
      setJustSaved(false);
      setWebData(null);
    }
  };

  const handleGenerate = async () => {
    if (!file) return;

    setIsLoading(true);
    setError(null);
    setJustSaved(false);
    setWebData(null);

    try {
      const result = await generateKnowledgeModule(file, userNotes);
      setData(result);
      // Initialize Chatbot with context
      initializeChat(`${result.identifiedObject}: ${result.scientificExplanation}`);
      
      // Auto-fetch web resources for a complete view (optional, can be manual)
      // handleFetchWebResources(); 
    } catch (err) {
      setError("Failed to generate knowledge module. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFetchWebResources = async () => {
    if (!data) return;
    setLoadingWeb(true);
    try {
        const results = await getWebResources(data.identifiedObject);
        setWebData(results);
    } catch (e) {
        console.error(e);
    } finally {
        setLoadingWeb(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreviewUrl(null);
    setUserNotes("");
    setData(null);
    setError(null);
    setJustSaved(false);
    setWebData(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSave = () => {
    if (!data) return;
    
    const newSavedModule: SavedKnowledgeModule = {
      ...data,
      id: crypto.randomUUID(),
      savedAt: Date.now()
    };

    const updatedModules = [newSavedModule, ...savedModules];
    setSavedModules(updatedModules);
    localStorage.setItem('vkn_library', JSON.stringify(updatedModules));
    setJustSaved(true);
    
    // Hide "Just Saved" message after 3 seconds
    setTimeout(() => setJustSaved(false), 3000);
  };

  const handleDeleteSaved = (id: string) => {
    const updatedModules = savedModules.filter(m => m.id !== id);
    setSavedModules(updatedModules);
    localStorage.setItem('vkn_library', JSON.stringify(updatedModules));
  };

  const handleLoadSaved = (module: SavedKnowledgeModule) => {
    setData(module);
    setFile(null); 
    setPreviewUrl(null);
    setError(null);
    setJustSaved(true);
    setWebData(null); // Reset web data as we might want fresh search
    initializeChat(`${module.identifiedObject}: ${module.scientificExplanation}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-inter">
      <SavedLibraryModal 
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        savedModules={savedModules}
        onLoad={handleLoadSaved}
        onDelete={handleDeleteSaved}
      />

      {/* --- HEADER SECTION --- */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex justify-between items-start">
            <div onClick={handleReset} className="cursor-pointer">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Visual to Knowledge Navigator
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Transform any real-world image into structured knowledge
              </p>
            </div>
            
            {/* Header Controls (Library/Save/Reset) */}
            <div className="flex items-center gap-2">
               <button 
                  onClick={() => setIsLibraryOpen(true)}
                  className="text-sm text-slate-600 hover:text-blue-600 font-medium px-2 py-1"
                >
                  Library
                </button>
               {data && (
                 <>
                   <div className="h-4 w-px bg-slate-300 mx-1"></div>
                   <button 
                    onClick={handleSave}
                    className={`text-sm font-medium px-3 py-1 rounded-md transition-colors ${justSaved ? 'text-green-600 bg-green-50' : 'text-slate-600 hover:bg-slate-100'}`}
                   >
                     {justSaved ? 'Saved' : 'Save'}
                   </button>
                   <button 
                    onClick={handleReset}
                    className="text-sm font-medium text-blue-600 hover:text-blue-700 px-2 py-1"
                   >
                     New
                   </button>
                 </>
               )}
            </div>
          </div>
          <hr className="border-slate-100 mt-4" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 pb-20">
        
        {/* --- INPUT SECTION --- */}
        {!data && (
          <div className="space-y-6 animate-fade-in">
            {/* 1. Image Upload Block */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <label className="block text-lg font-semibold text-slate-800 mb-2">
                Upload an Image
              </label>
              <p className="text-sm text-slate-500 mb-4">
                Supported: JPG, PNG, photos of objects, tools, plants, scientific instruments.
              </p>
              
              <div 
                className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  previewUrl ? 'border-blue-300 bg-blue-50/30' : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'
                }`}
              >
                {previewUrl ? (
                   <div className="relative h-64 w-full flex items-center justify-center">
                     <img src={previewUrl} alt="Preview" className="max-h-full max-w-full object-contain rounded shadow-sm" />
                     <button 
                       onClick={() => { setFile(null); setPreviewUrl(null); if(fileInputRef.current) fileInputRef.current.value = ""; }}
                       className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full text-slate-600 hover:text-red-500 shadow-sm"
                     >
                       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                     </button>
                   </div>
                ) : (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="cursor-pointer flex flex-col items-center justify-center py-6"
                  >
                     <svg className="w-12 h-12 text-slate-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                     <span className="text-blue-600 font-medium">Click to upload</span>
                  </div>
                )}
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange}
                  ref={fileInputRef} 
                  className="hidden"
                />
              </div>
            </div>

            {/* 2. Optional Context Box */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
               <label className="block text-lg font-semibold text-slate-800 mb-2">
                 Add extra information (optional)
               </label>
               <textarea 
                  value={userNotes}
                  onChange={(e) => setUserNotes(e.target.value)}
                  placeholder="Example: this is from my kitchen, this is a school lab tool, etc."
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none h-24"
               />
            </div>

            {/* 3. Action Button */}
            {error && (
                <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 text-sm">
                    {error}
                </div>
            )}
            
            <button
                onClick={handleGenerate}
                disabled={!file || isLoading}
                className={`w-full py-4 rounded-xl font-bold text-lg shadow-sm transition-all ${
                  !file || isLoading 
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/30'
                }`}
            >
                {isLoading ? "Generating..." : "Generate Knowledge View"}
            </button>
          </div>
        )}

        {/* --- OUTPUT SECTION --- */}
        {data && (
          <div className="space-y-10 animate-fade-in">
            <ChatBot topic={data.identifiedObject} />

            {/* Section A — Identified Object */}
            <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 mb-2 border-b border-slate-100 pb-2">Identified Object</h2>
                <p className="text-3xl text-blue-700 font-extrabold">{data.identifiedObject}</p>
            </section>

            {/* Section B — Concept Map */}
            <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">Concept Map</h2>
                {/* We keep the visualization as it is superior to markdown, but style the container cleanly */}
                <ConceptMapTree data={data.conceptMap} />
            </section>

            {/* Section C — Scientific Explanation */}
            <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">Scientific Explanation</h2>
                <p className="text-slate-700 leading-relaxed text-lg">
                    {data.scientificExplanation}
                </p>
            </section>

            {/* Section D — Working Principles (How It Works) */}
            <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">How It Works</h2>
                <p className="text-slate-700 leading-relaxed">
                    {data.workingPrinciples}
                </p>
            </section>

            {/* Section E — Real World Applications */}
            <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">Real-World Applications</h2>
                <ul className="list-disc pl-5 space-y-2 text-slate-700">
                    {data.applications.map((app, i) => (
                        <li key={i} className="pl-1">{app}</li>
                    ))}
                </ul>
            </section>

            {/* Section F — Auto-Generated Quiz (Quick Quiz) */}
            <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                 {/* Rename header internally in QuizComponent or wrapper */}
                 <h2 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-2">Quick Quiz</h2>
                 <QuizComponent questions={data.quiz} />
            </section>

            {/* Section G — Beginner Doubts */}
            <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">Common Beginner Doubts</h2>
                <div className="space-y-4">
                    {data.beginnerDoubts.map((item, i) => (
                        <div key={i} className="bg-slate-50 p-4 rounded-lg">
                            <p className="font-semibold text-slate-900 mb-1">Q: {item.doubt}</p>
                            <p className="text-slate-600">A: {item.clarification}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Section H — Suggested Next Topics */}
            <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">Suggested Next Topics</h2>
                <ul className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {data.suggestedTopics.map((topic, i) => (
                        <li key={i} className="bg-blue-50 text-blue-800 px-4 py-3 rounded-lg text-center font-medium border border-blue-100">
                            {topic}
                        </li>
                    ))}
                </ul>
            </section>
            
            {/* Added Value: Web Resources (Not explicitly in strict layout but highly relevant) */}
             <section className="mt-8">
                 <WebResources 
                    data={webData || { summary: "", sources: [] }} 
                    isLoading={loadingWeb} 
                    onFetch={handleFetchWebResources} 
                    hasFetched={!!webData} 
                 />
             </section>

          </div>
        )}

      </main>

      {/* --- FOOTER SECTION --- */}
      <footer className="py-8 text-center text-slate-400 text-sm border-t border-slate-200 bg-white">
        Made in Google AI Studio using Gemini 3 Pro Preview
      </footer>

    </div>
  );
};

export default App;