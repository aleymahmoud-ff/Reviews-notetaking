import React, { useState, useMemo } from 'react';
import { Plus, Sparkles, Save, FileText, ClipboardList, RefreshCw, Download } from 'lucide-react';
import { Note, NoteFormData, ReportState } from './types';
import InputWithSuggestions from './components/InputWithSuggestions';
import NoteCard from './components/NoteCard';
import { generateReviewReport } from './services/geminiService';

const initialFormState: NoteFormData = {
  category: '',
  owner: '',
  title: '',
  description: '',
  content: ''
};

const App: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [formData, setFormData] = useState<NoteFormData>(initialFormState);
  const [reportState, setReportState] = useState<ReportState>({
    isGenerating: false,
    content: null,
    error: null
  });

  // Derived state for autocomplete suggestions
  const existingCategories = useMemo(() => 
    Array.from(new Set(notes.map(n => n.category))).filter(Boolean).sort(), 
  [notes]);

  const existingOwners = useMemo(() => 
    Array.from(new Set(notes.map(n => n.owner))).filter(Boolean).sort(), 
  [notes]);

  const handleInputChange = (field: keyof NoteFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category || !formData.owner || !formData.title || !formData.content) {
      alert("Please fill in all required fields.");
      return;
    }

    const newNote: Note = {
      id: crypto.randomUUID(),
      ...formData,
      timestamp: Date.now()
    };

    setNotes(prev => [newNote, ...prev]);
    
    // Reset only content fields, keep Category and Owner for easier repetitive entry
    setFormData(prev => ({
      ...prev,
      title: '',
      description: '',
      content: ''
    }));
  };

  const handleDeleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
  };

  const handleGenerateReport = async () => {
    setReportState({ isGenerating: true, content: null, error: null });
    try {
      const report = await generateReviewReport(notes);
      setReportState({ isGenerating: false, content: report, error: null });
    } catch (err: any) {
      setReportState({ 
        isGenerating: false, 
        content: null, 
        error: err.message || "An unexpected error occurred." 
      });
    }
  };

  const handleResetReport = () => {
    setReportState({ isGenerating: false, content: null, error: null });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg text-white">
              <ClipboardList size={24} />
            </div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Reviews Note Taking</h1>
          </div>
          <div className="text-sm text-gray-500">
            {notes.length} note{notes.length !== 1 ? 's' : ''} captured
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Report Overlay (if generated) */}
        {reportState.content && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <div className="flex items-center gap-2">
                  <Sparkles className="text-purple-600" size={24} />
                  <h2 className="text-2xl font-bold text-gray-800">Generated Review Report</h2>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={handleResetReport}
                    className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Close
                  </button>
                  <button 
                     onClick={() => {
                       const blob = new Blob([reportState.content || ''], { type: 'text/markdown' });
                       const url = URL.createObjectURL(blob);
                       const a = document.createElement('a');
                       a.href = url;
                       a.download = `review-report-${new Date().toISOString().slice(0,10)}.md`;
                       a.click();
                     }}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm flex items-center gap-2"
                  >
                    <Download size={16} /> Export
                  </button>
                </div>
              </div>
              <div className="p-8 overflow-y-auto bg-white font-serif prose prose-slate max-w-none leading-relaxed">
                 {/* Simple formatting for markdown-like display without heavy deps */}
                 <div className="whitespace-pre-wrap">{reportState.content}</div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Input Form */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-24">
              <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                <Plus className="w-5 h-5 mr-2 text-blue-500" />
                Add New Record
              </h2>
              
              <form onSubmit={handleAddNote} className="space-y-5">
                <InputWithSuggestions
                  id="category"
                  label="Direction / Function"
                  value={formData.category}
                  onChange={(val) => handleInputChange('category', val)}
                  suggestions={existingCategories}
                  placeholder="e.g. Marketing, Engineering..."
                  required
                />
                
                <InputWithSuggestions
                  id="owner"
                  label="Owner"
                  value={formData.owner}
                  onChange={(val) => handleInputChange('owner', val)}
                  suggestions={existingOwners}
                  placeholder="e.g. Jane Doe, Team Alpha..."
                  required
                />

                <div className="space-y-1.5">
                  <label htmlFor="title" className="text-sm font-semibold text-gray-700">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors shadow-sm"
                    placeholder="Brief summary of the topic"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="description" className="text-sm font-semibold text-gray-700">
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors shadow-sm resize-none"
                    placeholder="Context or background info..."
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="content" className="text-sm font-semibold text-gray-700">
                    Your Notes Here <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => handleInputChange('content', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors shadow-sm"
                    placeholder="Detailed observations, risks, or feedback..."
                    required
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full flex justify-center items-center px-4 py-3 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-all shadow-lg hover:shadow-xl active:scale-95"
                  >
                    <Save size={18} className="mr-2" />
                    Save Note
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column: List & Actions */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col h-full">
            <div className="flex justify-between items-end mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Review Queue</h2>
                <p className="text-gray-500 mt-1">Manage notes before generating final output</p>
              </div>
              
              <button
                onClick={handleGenerateReport}
                disabled={notes.length === 0 || reportState.isGenerating}
                className={`
                  flex items-center px-6 py-3 rounded-xl font-bold text-white shadow-lg transition-all
                  ${notes.length === 0 || reportState.isGenerating 
                    ? 'bg-gray-300 cursor-not-allowed opacity-70' 
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-blue-200 hover:shadow-xl active:scale-95'
                  }
                `}
              >
                {reportState.isGenerating ? (
                  <>
                    <RefreshCw className="animate-spin mr-2" size={20} />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2" size={20} />
                    Generate Report
                  </>
                )}
              </button>
            </div>

            {reportState.error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center">
                 <span className="font-bold mr-2">Error:</span> {reportState.error}
              </div>
            )}

            {notes.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center bg-white border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center h-96">
                <div className="bg-gray-50 p-4 rounded-full mb-4">
                  <FileText className="text-gray-400" size={40} />
                </div>
                <h3 className="text-lg font-medium text-gray-900">No notes yet</h3>
                <p className="text-gray-500 max-w-sm mt-2">
                  Start adding review notes on the left. Once you have collected enough data, you can generate a comprehensive report.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 pb-20">
                {notes.map((note) => (
                  <NoteCard key={note.id} note={note} onDelete={handleDeleteNote} />
                ))}
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;
