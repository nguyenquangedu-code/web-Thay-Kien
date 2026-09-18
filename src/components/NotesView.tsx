import React, { useState, useMemo } from 'react';
import { 
  Bookmark, 
  Plus, 
  Edit3, 
  Trash2, 
  Star, 
  Calendar, 
  AlertCircle, 
  X, 
  Filter,
  CheckCircle2,
  BookmarkCheck
} from 'lucide-react';
import { TeacherNote, AppData } from '../types';

interface NotesViewProps {
  data: AppData;
  onSaveNote: (note: TeacherNote) => void;
  onDeleteNote: (noteId: string) => void;
  onToggleImportant: (noteId: string) => void;
  onShowToast: (msg: string, type: 'success' | 'error') => void;
}

export const NotesView: React.FC<NotesViewProps> = ({
  data,
  onSaveNote,
  onDeleteNote,
  onToggleImportant,
  onShowToast,
}) => {
  const { notes, classes } = data;

  const [selectedClassFilter, setSelectedClassFilter] = useState('ALL');
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState('ALL');
  const [onlyImportant, setOnlyImportant] = useState(false);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<TeacherNote | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [date, setDate] = useState('');
  const [relatedClassId, setRelatedClassId] = useState(classes[0]?.id || '');
  const [priority, setPriority] = useState<TeacherNote['priority']>('Trung bình');
  const [isImportant, setIsImportant] = useState(false);
  const [formError, setFormError] = useState('');

  const filteredNotes = useMemo(() => {
    return notes.filter(n => {
      const matchClass = selectedClassFilter === 'ALL' || n.relatedClassId === selectedClassFilter;
      const matchPriority = selectedPriorityFilter === 'ALL' || n.priority === selectedPriorityFilter;
      const matchImportant = !onlyImportant || n.isImportant;
      return matchClass && matchPriority && matchImportant;
    });
  }, [notes, selectedClassFilter, selectedPriorityFilter, onlyImportant]);

  const handleOpenAdd = () => {
    setEditingNote(null);
    setTitle('');
    setContent('');
    setDate(new Date().toISOString().slice(0, 10));
    setRelatedClassId(classes[0]?.id || '');
    setPriority('Trung bình');
    setIsImportant(false);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (note: TeacherNote) => {
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content);
    setDate(note.date);
    setRelatedClassId(note.relatedClassId);
    setPriority(note.priority);
    setIsImportant(note.isImportant);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError('Vui lòng nhập tiêu đề ghi chú.');
      return;
    }
    if (!content.trim()) {
      setFormError('Vui lòng nhập nội dung ghi chú sư phạm.');
      return;
    }

    const cls = classes.find(c => c.id === relatedClassId);
    const relatedClassName = cls ? cls.name : 'Chung';

    const noteToSave: TeacherNote = {
      id: editingNote ? editingNote.id : `not-${Date.now()}`,
      title: title.trim(),
      content: content.trim(),
      date,
      relatedClassId,
      relatedClassName,
      priority,
      isImportant
    };

    onSaveNote(noteToSave);
    setIsModalOpen(false);
    onShowToast(`Đã lưu ghi chú "${noteToSave.title}" thành công!`, 'success');
  };

  const handleDelete = (id: string) => {
    onDeleteNote(id);
    setDeleteConfirmId(null);
    onShowToast('Đã xóa ghi chú!', 'success');
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Controls */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-serif-literary">
              Sổ Tay Ghi Chú Sư Phạm
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Lưu giữ những dặn dò, quan sát học sinh, kế hoạch bài dạy và việc cần làm của thầy Nguyễn Quang Kiên.
            </p>
          </div>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 bg-blue-900 hover:bg-blue-950 text-white font-semibold text-sm px-4 py-2.5 rounded-xl shadow transition"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo ghi chú mới</span>
          </button>
        </div>

        {/* Filter bar */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2 border-t border-slate-100">
          <div className="sm:col-span-5">
            <select
              value={selectedClassFilter}
              onChange={(e) => setSelectedClassFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-900/30"
            >
              <option value="ALL">-- Tất cả lớp liên quan --</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>Lớp {c.name}</option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-4">
            <select
              value={selectedPriorityFilter}
              onChange={(e) => setSelectedPriorityFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-900/30"
            >
              <option value="ALL">-- Tất cả mức ưu tiên --</option>
              <option value="Cao">Ưu tiên Cao</option>
              <option value="Trung bình">Ưu tiên Trung bình</option>
              <option value="Thấp">Ưu tiên Thấp</option>
            </select>
          </div>

          <div className="sm:col-span-3 flex items-center">
            <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={onlyImportant}
                onChange={(e) => setOnlyImportant(e.target.checked)}
                className="w-4 h-4 rounded text-blue-900 focus:ring-blue-900"
              />
              <span>Chỉ xem ghi chú quan trọng ⭐</span>
            </label>
          </div>
        </div>
      </div>

      {/* Grid of Notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredNotes.length === 0 ? (
          <div className="col-span-2 bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400">
            <Bookmark className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Không có ghi chú nào phù hợp với điều kiện lọc.</p>
          </div>
        ) : (
          filteredNotes.map((note) => {
            const isHigh = note.priority === 'Cao';
            const isMedium = note.priority === 'Trung bình';

            return (
              <div
                key={note.id}
                className={`bg-white rounded-2xl border transition-all p-5 flex flex-col justify-between shadow-xs hover:shadow-md ${
                  note.isImportant 
                    ? 'border-amber-300 bg-amber-50/20' 
                    : 'border-slate-200 hover:border-blue-300'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                        isHigh ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                        isMedium ? 'bg-amber-100 text-amber-900 border border-amber-200' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        Ưu tiên: {note.priority}
                      </span>

                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-900 border border-blue-200">
                        Lớp {note.relatedClassName}
                      </span>
                    </div>

                    <button
                      onClick={() => onToggleImportant(note.id)}
                      className={`p-1 rounded-lg transition ${
                        note.isImportant
                          ? 'text-amber-500 hover:text-amber-600'
                          : 'text-slate-300 hover:text-amber-400'
                      }`}
                      title={note.isImportant ? 'Bỏ đánh dấu quan trọng' : 'Đánh dấu quan trọng'}
                    >
                      <Star className={`w-5 h-5 ${note.isImportant ? 'fill-amber-400' : ''}`} />
                    </button>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 font-serif-literary mb-2">
                    {note.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                    {note.content}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{note.date}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(note)}
                      className="p-1.5 text-slate-400 hover:text-blue-900 hover:bg-slate-100 rounded-lg transition"
                      title="Sửa ghi chú"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(note.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Xóa ghi chú"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Thêm / Sửa Ghi Chú */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex justify-between items-center">
              <h3 className="font-bold text-lg font-serif-literary">
                {editingNote ? 'Chỉnh sửa ghi chú sư phạm' : 'Tạo ghi chú mới'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Tiêu đề ghi chú <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nhắc nhở nộp bài tập, chuẩn bị giáo án..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-900/30 focus:border-blue-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Lớp liên quan
                  </label>
                  <select
                    value={relatedClassId}
                    onChange={(e) => setRelatedClassId(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-900/30"
                  >
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>Lớp {c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Mức độ ưu tiên
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-900/30"
                  >
                    <option value="Cao">Cao</option>
                    <option value="Trung bình">Trung bình</option>
                    <option value="Thấp">Thấp</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Ngày ghi chú
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-900/30"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Nội dung ghi chú <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Nhập chi tiết dặn dò hoặc công việc cần làm..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-900/30 focus:border-blue-900"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="modal-important-check"
                  checked={isImportant}
                  onChange={(e) => setIsImportant(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-900 focus:ring-blue-900"
                />
                <label htmlFor="modal-important-check" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  Đánh dấu đây là ghi chú quan trọng ⭐
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold bg-blue-900 hover:bg-blue-950 text-white rounded-xl shadow transition"
                >
                  {editingNote ? 'Lưu thay đổi' : 'Tạo ghi chú'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Xóa ghi chú */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-2 font-serif-literary">
              Xác nhận xóa ghi chú?
            </h3>
            <p className="text-sm text-slate-600 mb-5 leading-relaxed">
              Bạn có chắc chắn muốn xóa ghi chú này khỏi sổ tay sư phạm?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Hủy bỏ
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 text-sm font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow transition"
              >
                Xóa ghi chú
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
