import React from 'react';
import { Note } from '../types';
import { Trash2, User, Layers, FileText } from 'lucide-react';

interface NoteCardProps {
  note: Note;
  onDelete: (id: string) => void;
}

const NoteCard: React.FC<NoteCardProps> = ({ note, onDelete }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow relative group">
      <button
        onClick={() => onDelete(note.id)}
        className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
        title="Delete Note"
      >
        <Trash2 size={18} />
      </button>

      <div className="flex flex-wrap gap-2 mb-3">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <Layers size={12} className="mr-1" />
          {note.category}
        </span>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          <User size={12} className="mr-1" />
          {note.owner}
        </span>
      </div>

      <h3 className="text-lg font-bold text-gray-900 mb-1">{note.title}</h3>
      
      {note.description && (
        <div className="mb-3 text-sm text-gray-600 bg-gray-50 p-2 rounded border-l-2 border-gray-300">
          <span className="font-semibold block text-xs text-gray-500 mb-1">DESCRIPTION</span>
          {note.description}
        </div>
      )}

      <div className="text-gray-700 text-sm whitespace-pre-wrap">
        <div className="flex items-center gap-1 text-xs font-semibold text-gray-500 mb-1">
          <FileText size={12} />
          NOTES
        </div>
        {note.content}
      </div>
    </div>
  );
};

export default NoteCard;
