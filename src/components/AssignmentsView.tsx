import React, { useState, useMemo } from 'react';
import { 
  FileEdit, 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Users,
  Check,
  FileCheck
} from 'lucide-react';
import { Assignment, AppData } from '../types';

interface AssignmentsViewProps {
  data: AppData;
  onSaveAssignment: (assignment: Assignment) => void;
  onDeleteAssignment: (assignmentId: string) => void;
  onShowToast: (msg: string, type: 'success' | 'error') => void;
}

export const AssignmentsView: React.FC<AssignmentsViewProps> = ({
  data,
  onSaveAssignment,
  onDeleteAssignment,
  onShowToast,
}) => {
  const { assignments, classes, students } = data;

  const [selectedClassFilter, setSelectedClassFilter] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [viewingAssignment, setViewingAssignment] = useState<Assignment | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [classId, setClassId] = useState(classes[0]?.id || '');
  const [content, setContent] = useState('');
  const [assignedDate, setAssignedDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [completedCount, setCompletedCount] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(35);
  const [status, setStatus] = useState<Assignment['status']>('Sắp đến hạn');
  const [formError, setFormError] = useState('');

  const filteredAssignments = useMemo(() => {
    return assignments.filter(a => {
      const matchClass = selectedClassFilter === 'ALL' || a.classId === selectedClassFilter;
      const matchStatus = selectedStatusFilter === 'ALL' || a.status === selectedStatusFilter;
      return matchClass && matchStatus;
    });
  }, [assignments, selectedClassFilter, selectedStatusFilter]);

  const handleOpenAdd = () => {
    setEditingAssignment(null);
    setTitle('');
    const firstCls = classes[0];
    const initialClassId = firstCls?.id || '';
    setClassId(initialClassId);
    setContent('');
    const today = new Date().toISOString().slice(0, 10);
    setAssignedDate(today);
    
    // Hạn nộp mặc định 7 ngày sau
    const due = new Date();
    due.setDate(due.getDate() + 7);
    setDueDate(due.toISOString().slice(0, 10));

    const clsStudentCount = students.filter(s => s.classId === initialClassId).length || 35;
    setCompletedCount(0);
    setTotalCount(clsStudentCount);
    setStatus('Sắp đến hạn');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (asm: Assignment) => {
    setEditingAssignment(asm);
    setTitle(asm.title);
    setClassId(asm.classId);
    setContent(asm.content);
    setAssignedDate(asm.assignedDate);
    setDueDate(asm.dueDate);
    setCompletedCount(asm.completedCount);
    setTotalCount(asm.totalCount);
    setStatus(asm.status);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleClassChangeInForm = (newClassId: string) => {
    setClassId(newClassId);
    const count = students.filter(s => s.classId === newClassId).length || 35;
    setTotalCount(count);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError('Vui lòng nhập tên bài tập.');
      return;
    }
    if (!content.trim()) {
      setFormError('Vui lòng nhập yêu cầu / nội dung bài tập.');
      return;
    }

    const targetClass = classes.find(c => c.id === classId);
    const className = targetClass ? targetClass.name : 'Chưa rõ';

    const asmToSave: Assignment = {
      id: editingAssignment ? editingAssignment.id : `asm-${Date.now()}`,
      title: title.trim(),
      classId,
      className,
      content: content.trim(),
      assignedDate,
      dueDate,
      completedCount: Number(completedCount),
      totalCount: Number(totalCount) || 35,
      status
    };

    onSaveAssignment(asmToSave);
    setIsModalOpen(false);
    onShowToast(`Đã lưu bài tập "${asmToSave.title}" thành công!`, 'success');
  };

  const handleDelete = (id: string) => {
    onDeleteAssignment(id);
    setDeleteConfirmId(null);
    onShowToast('Đã xóa bài tập!', 'success');
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Controls */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-serif-literary">
              Quản Lý Bài Tập Môn Ngữ Văn
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Theo dõi tình trạng nộp bài, thời hạn và đôn đốc học sinh hoàn thành nhiệm vụ học tập.
            </p>
          </div>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 bg-blue-900 hover:bg-blue-950 text-white font-semibold text-sm px-4 py-2.5 rounded-xl shadow transition"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm bài tập mới</span>
          </button>
        </div>

        {/* Filter bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Lọc theo lớp
            </label>
            <select
              value={selectedClassFilter}
              onChange={(e) => setSelectedClassFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-900/30"
            >
              <option value="ALL">-- Tất cả các lớp --</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>Lớp {c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Lọc theo trạng thái
            </label>
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-900/30"
            >
              <option value="ALL">-- Tất cả trạng thái nộp bài --</option>
              <option value="Hoàn thành tốt">Xanh: Hoàn thành tốt</option>
              <option value="Sắp đến hạn">Vàng: Sắp đến hạn</option>
              <option value="Quá hạn">Đỏ: Quá hạn</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Assignment Cards */}
      <div className="space-y-4">
        {filteredAssignments.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400">
            <FileEdit className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Không có bài tập nào phù hợp với điều kiện tìm kiếm.</p>
          </div>
        ) : (
          filteredAssignments.map((asm) => {
            const completionPercent = Math.min(100, Math.round((asm.completedCount / asm.totalCount) * 100));
            const pendingCount = Math.max(0, asm.totalCount - asm.completedCount);

            return (
              <div
                key={asm.id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-blue-300 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 border border-blue-200">
                        Lớp {asm.className}
                      </span>

                      {/* Required Status Color Badges */}
                      <span className={`text-xs font-bold px-3 py-0.5 rounded-full flex items-center gap-1.5 ${
                        asm.status === 'Hoàn thành tốt'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : asm.status === 'Sắp đến hạn'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-rose-100 text-rose-800 border border-rose-300'
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${
                          asm.status === 'Hoàn thành tốt' ? 'bg-emerald-500' :
                          asm.status === 'Sắp đến hạn' ? 'bg-amber-500' : 'bg-rose-500'
                        }`} />
                        {asm.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        Giao: {asm.assignedDate}
                      </span>
                      <span className="flex items-center gap-1 font-semibold text-slate-700">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        Hạn: {asm.dueDate}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-slate-900 font-serif-literary mb-1">
                    {asm.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
                    {asm.content}
                  </p>
                </div>

                {/* Progress bar & counts */}
                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1 max-w-md">
                    <div className="flex justify-between items-center text-xs font-semibold mb-1">
                      <span className="text-slate-700">Tiến độ nộp bài của học sinh:</span>
                      <span className="text-blue-900 font-bold">{completionPercent}%</span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          asm.status === 'Hoàn thành tốt' ? 'bg-emerald-600' :
                          asm.status === 'Sắp đến hạn' ? 'bg-amber-500' : 'bg-rose-600'
                        }`}
                        style={{ width: `${completionPercent}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                      <span>Đã nộp: <strong className="text-emerald-700">{asm.completedCount} em</strong></span>
                      <span>Chưa nộp: <strong className="text-rose-700">{pendingCount} em</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => setViewingAssignment(asm)}
                      className="px-3 py-1.5 text-xs font-semibold bg-blue-50 text-blue-900 hover:bg-blue-100 rounded-xl transition flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Chi tiết
                    </button>
                    <button
                      onClick={() => handleOpenEdit(asm)}
                      className="p-1.5 text-slate-400 hover:text-blue-900 hover:bg-slate-100 rounded-lg transition"
                      title="Sửa bài tập"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(asm.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Xóa bài tập"
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

      {/* Modal Thêm / Sửa Bài Tập */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="p-5 bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex justify-between items-center sticky top-0 z-10">
              <h3 className="font-bold text-lg font-serif-literary">
                {editingAssignment ? 'Chỉnh sửa bài tập' : 'Giao bài tập Ngữ văn mới'}
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
                  Tên bài tập / Đề bài <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Cảm nhận vẻ đẹp người lính trong bài thơ Đồng chí..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-900/30 focus:border-blue-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Lớp được giao <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={classId}
                    onChange={(e) => handleClassChangeInForm(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-900/30"
                  >
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>Lớp {c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Trạng thái
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-900/30"
                  >
                    <option value="Hoàn thành tốt">Xanh - Hoàn thành tốt</option>
                    <option value="Sắp đến hạn">Vàng - Sắp đến hạn</option>
                    <option value="Quá hạn">Đỏ - Quá hạn</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Ngày giao
                  </label>
                  <input
                    type="date"
                    value={assignedDate}
                    onChange={(e) => setAssignedDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-900/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Hạn nộp
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-900/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Nội dung & Yêu cầu cụ thể <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Ví dụ: Viết đoạn văn tổng - phân - hợp độ dài 7-10 câu, có sử dụng phép thế..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-900/30 focus:border-blue-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Số học sinh đã hoàn thành
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={totalCount}
                    value={completedCount}
                    onChange={(e) => setCompletedCount(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-900/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Tổng số học sinh lớp
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={totalCount}
                    onChange={(e) => setTotalCount(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-900/30"
                  />
                </div>
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
                  {editingAssignment ? 'Lưu bài tập' : 'Tạo bài tập'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Xem Chi Tiết Bài Tập */}
      {viewingAssignment && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex justify-between items-center">
              <div>
                <h3 className="text-base sm:text-lg font-bold font-serif-literary">
                  Chi Tiết Bài Tập
                </h3>
                <p className="text-xs text-blue-200">
                  Lớp {viewingAssignment.className} • Hạn nộp: {viewingAssignment.dueDate}
                </p>
              </div>
              <button
                onClick={() => setViewingAssignment(null)}
                className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-sm">
              <div>
                <h4 className="font-bold text-slate-900 text-base mb-1 font-serif-literary">
                  {viewingAssignment.title}
                </h4>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed">
                  {viewingAssignment.content}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs bg-blue-50/50 p-3 rounded-xl border border-blue-200">
                <div>
                  <span className="text-slate-500">Đã nộp bài:</span>
                  <div className="text-base font-extrabold text-emerald-700 mt-0.5">
                    {viewingAssignment.completedCount} / {viewingAssignment.totalCount} học sinh
                  </div>
                </div>
                <div>
                  <span className="text-slate-500">Chưa hoàn thành:</span>
                  <div className="text-base font-extrabold text-rose-700 mt-0.5">
                    {viewingAssignment.totalCount - viewingAssignment.completedCount} học sinh
                  </div>
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <span>Thầy Kiên có thể nhắc nhở lớp trưởng hoặc ghi chú vào sổ để đôn đốc các em chưa nộp bài.</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setViewingAssignment(null)}
                className="px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-900 text-white rounded-xl"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Xóa bài tập */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-2 font-serif-literary">
              Xác nhận xóa bài tập?
            </h3>
            <p className="text-sm text-slate-600 mb-5 leading-relaxed">
              Bạn có chắc chắn muốn xóa bài tập này? Thống kê nộp bài của học sinh sẽ không còn được ghi nhận.
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
                Xóa bài tập
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
