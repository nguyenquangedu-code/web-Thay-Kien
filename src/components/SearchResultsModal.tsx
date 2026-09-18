import React from 'react';
import { 
  Search, 
  X, 
  Users, 
  School, 
  BookOpen, 
  FileEdit, 
  Bookmark, 
  ArrowRight 
} from 'lucide-react';
import { AppData, TabType } from '../types';

interface SearchResultsModalProps {
  query: string;
  isOpen: boolean;
  onClose: () => void;
  data: AppData;
  onNavigate: (tab: TabType) => void;
}

export const SearchResultsModal: React.FC<SearchResultsModalProps> = ({
  query,
  isOpen,
  onClose,
  data,
  onNavigate,
}) => {
  if (!isOpen || !query.trim()) return null;

  const q = query.toLowerCase().trim();

  const matchedStudents = data.students.filter(s => 
    s.name.toLowerCase().includes(q) || s.note.toLowerCase().includes(q)
  );

  const matchedClasses = data.classes.filter(c => 
    c.name.toLowerCase().includes(q) || c.room.toLowerCase().includes(q) || c.note.toLowerCase().includes(q)
  );

  const matchedLessons = data.lessons.filter(l => 
    l.title.toLowerCase().includes(q) || l.topic.toLowerCase().includes(q) || l.objectives.toLowerCase().includes(q)
  );

  const matchedAssignments = data.assignments.filter(a => 
    a.title.toLowerCase().includes(q) || a.content.toLowerCase().includes(q)
  );

  const matchedNotes = data.notes.filter(n => 
    n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)
  );

  const totalResults = matchedStudents.length + matchedClasses.length + matchedLessons.length + matchedAssignments.length + matchedNotes.length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-2xl border border-slate-200 flex flex-col">
        
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-base font-serif-literary">
              Kết quả tìm kiếm cho: <span className="text-amber-300">"{query}"</span>
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results List */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5 text-sm">
          {totalResults === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>Không tìm thấy mục nào khớp với từ khóa "{query}".</p>
            </div>
          ) : (
            <>
              {/* Học sinh */}
              {matchedStudents.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-blue-900" />
                    Học sinh ({matchedStudents.length})
                  </h4>
                  <div className="space-y-1.5">
                    {matchedStudents.map(s => (
                      <div
                        key={s.id}
                        onClick={() => {
                          onNavigate('students');
                          onClose();
                        }}
                        className="p-2.5 rounded-xl border border-slate-100 hover:border-blue-300 hover:bg-blue-50/40 cursor-pointer flex items-center justify-between transition"
                      >
                        <div>
                          <span className="font-bold text-slate-900">{s.name}</span>
                          <span className="text-xs text-slate-500 ml-2">Xếp loại: {s.status}</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Lớp học */}
              {matchedClasses.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                    <School className="w-4 h-4 text-blue-900" />
                    Lớp học ({matchedClasses.length})
                  </h4>
                  <div className="space-y-1.5">
                    {matchedClasses.map(c => (
                      <div
                        key={c.id}
                        onClick={() => {
                          onNavigate('classes');
                          onClose();
                        }}
                        className="p-2.5 rounded-xl border border-slate-100 hover:border-blue-300 hover:bg-blue-50/40 cursor-pointer flex items-center justify-between transition"
                      >
                        <div>
                          <span className="font-bold text-slate-900">Lớp {c.name}</span>
                          <span className="text-xs text-slate-500 ml-2">Phòng {c.room} • {c.studentCount} HS</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bài học */}
              {matchedLessons.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-blue-900" />
                    Bài học Ngữ văn ({matchedLessons.length})
                  </h4>
                  <div className="space-y-1.5">
                    {matchedLessons.map(l => (
                      <div
                        key={l.id}
                        onClick={() => {
                          onNavigate('lessons');
                          onClose();
                        }}
                        className="p-2.5 rounded-xl border border-slate-100 hover:border-blue-300 hover:bg-blue-50/40 cursor-pointer flex items-center justify-between transition"
                      >
                        <div>
                          <span className="font-bold text-slate-900">{l.title}</span>
                          <span className="text-xs text-slate-500 ml-2">Khối {l.grade} • {l.status}</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bài tập */}
              {matchedAssignments.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                    <FileEdit className="w-4 h-4 text-blue-900" />
                    Bài tập ({matchedAssignments.length})
                  </h4>
                  <div className="space-y-1.5">
                    {matchedAssignments.map(a => (
                      <div
                        key={a.id}
                        onClick={() => {
                          onNavigate('assignments');
                          onClose();
                        }}
                        className="p-2.5 rounded-xl border border-slate-100 hover:border-blue-300 hover:bg-blue-50/40 cursor-pointer flex items-center justify-between transition"
                      >
                        <div>
                          <span className="font-bold text-slate-900">{a.title}</span>
                          <span className="text-xs text-slate-500 ml-2">Lớp {a.className} • Hạn: {a.dueDate}</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Ghi chú */}
              {matchedNotes.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                    <Bookmark className="w-4 h-4 text-blue-900" />
                    Ghi chú sư phạm ({matchedNotes.length})
                  </h4>
                  <div className="space-y-1.5">
                    {matchedNotes.map(n => (
                      <div
                        key={n.id}
                        onClick={() => {
                          onNavigate('notes');
                          onClose();
                        }}
                        className="p-2.5 rounded-xl border border-slate-100 hover:border-blue-300 hover:bg-blue-50/40 cursor-pointer flex items-center justify-between transition"
                      >
                        <div>
                          <span className="font-bold text-slate-900">{n.title}</span>
                          <span className="text-xs text-slate-500 ml-2">{n.date} • {n.priority}</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-900 text-white rounded-xl"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
};
