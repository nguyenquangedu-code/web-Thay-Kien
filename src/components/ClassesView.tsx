import React, { useState } from 'react';
import { 
  School, 
  Users, 
  BookOpenCheck, 
  FileEdit, 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  Check, 
  X, 
  AlertCircle,
  Award
} from 'lucide-react';
import { ClassItem, AppData } from '../types';
import { calculateStudentAverage } from '../utils/storage';

interface ClassesViewProps {
  data: AppData;
  onSaveClass: (cls: ClassItem) => void;
  onDeleteClass: (classId: string) => void;
  onViewClassStudents: (classId: string) => void;
  onShowToast: (msg: string, type: 'success' | 'error') => void;
}

export const ClassesView: React.FC<ClassesViewProps> = ({
  data,
  onSaveClass,
  onDeleteClass,
  onViewClassStudents,
  onShowToast,
}) => {
  const { classes, students, lessons, assignments } = data;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassItem | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [selectedClassDetail, setSelectedClassDetail] = useState<ClassItem | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [grade, setGrade] = useState<number>(6);
  const [room, setRoom] = useState('');
  const [note, setNote] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleOpenAdd = () => {
    setEditingClass(null);
    setName('');
    setGrade(6);
    setRoom('Phòng 101');
    setNote('');
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cls: ClassItem) => {
    setEditingClass(cls);
    setName(cls.name);
    setGrade(cls.grade);
    setRoom(cls.room);
    setNote(cls.note);
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Vui lòng nhập tên lớp học (ví dụ: 6A1, 7A2, 8A3, 9A1).');
      return;
    }

    // Kiểm tra trùng tên lớp nếu tạo mới hoặc đổi tên
    const isDuplicate = classes.some(
      c => c.name.toLowerCase() === name.trim().toLowerCase() && c.id !== editingClass?.id
    );
    if (isDuplicate) {
      setErrorMsg(`Lớp ${name.trim()} đã tồn tại trong danh sách.`);
      return;
    }

    const clsToSave: ClassItem = {
      id: editingClass ? editingClass.id : `cls-${Date.now()}`,
      name: name.trim().toUpperCase(),
      grade: Number(grade),
      studentCount: editingClass ? editingClass.studentCount : 0,
      room: room.trim() || 'Chưa xếp phòng',
      note: note.trim() || 'Lớp học môn Ngữ văn'
    };

    onSaveClass(clsToSave);
    setIsModalOpen(false);
    onShowToast(`Đã lưu thông tin lớp ${clsToSave.name} thành công!`, 'success');
  };

  const handleDeleteConfirm = (id: string) => {
    const clsToDelete = classes.find(c => c.id === id);
    onDeleteClass(id);
    setDeleteConfirmId(null);
    onShowToast(`Đã xóa lớp ${clsToDelete?.name || ''}!`, 'success');
  };

  return (
    <div className="space-y-6">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-serif-literary">
            Quản Lý Lớp Học Ngữ Văn
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Tổng cộng <strong>{classes.length} lớp</strong> đang giảng dạy môn Ngữ văn tại Trường THCS Thái Phiên.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 bg-blue-900 hover:bg-blue-950 text-white font-semibold text-sm px-4 py-2.5 rounded-xl shadow transition"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm lớp mới</span>
        </button>
      </div>

      {/* Grid of Class Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-5">
        {classes.map((cls) => {
          const clsStudents = students.filter(s => s.classId === cls.id);
          const clsLessons = lessons.filter(l => l.classIds.includes(cls.id));
          const clsAssignments = assignments.filter(a => a.classId === cls.id);
          
          // Tính điểm trung bình lớp
          let scoreSum = 0;
          let countScored = 0;
          clsStudents.forEach(s => {
            const avg = calculateStudentAverage(s);
            if (avg !== null) {
              scoreSum += avg;
              countScored++;
            }
          });
          const classAvg = countScored > 0 ? (scoreSum / countScored).toFixed(1) : 'Chưa có';

          return (
            <div
              key={cls.id}
              className="bg-white rounded-2xl border border-slate-200 hover:border-blue-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
            >
              {/* Card top banner */}
              <div className="p-5 pb-3 border-b border-slate-100">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-900 text-white flex items-center justify-center font-bold text-lg font-serif-literary shadow-sm">
                      {cls.name}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-slate-900">
                          Lớp {cls.name}
                        </h3>
                        <span className="text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded-full">
                          Khối {cls.grade}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {cls.room}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(cls)}
                      className="p-1.5 text-slate-400 hover:text-blue-800 hover:bg-slate-100 rounded-lg transition"
                      title="Sửa thông tin lớp"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(cls.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Xóa lớp học"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Card Body Metrics */}
              <div className="p-5 pt-4 space-y-4 flex-1">
                <div className="grid grid-cols-4 gap-2 text-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div>
                    <div className="text-base font-extrabold text-slate-900">
                      {clsStudents.length}
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium">Sĩ số</div>
                  </div>
                  <div>
                    <div className="text-base font-extrabold text-blue-900">
                      {clsLessons.length}
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium">Bài học</div>
                  </div>
                  <div>
                    <div className="text-base font-extrabold text-amber-700">
                      {clsAssignments.length}
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium">Bài tập</div>
                  </div>
                  <div>
                    <div className="text-base font-extrabold text-emerald-700">
                      {classAvg}
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium">Điểm TB</div>
                  </div>
                </div>

                <div className="text-xs text-slate-600 bg-amber-50/40 p-3 rounded-xl border border-amber-200/50">
                  <span className="font-semibold text-amber-900">Ghi chú giáo viên:</span> {cls.note}
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setSelectedClassDetail(cls)}
                  className="text-xs font-semibold text-blue-800 hover:text-blue-950 flex items-center gap-1.5 py-1 px-2.5 rounded-lg hover:bg-blue-100/50 transition"
                >
                  <Eye className="w-4 h-4" />
                  <span>Xem chi tiết lớp</span>
                </button>

                <button
                  onClick={() => onViewClassStudents(cls.id)}
                  className="text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:border-blue-400 hover:text-blue-900 px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 shadow-2xs"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Danh sách {clsStudents.length} học sinh</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Thêm / Sửa Lớp Học */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex justify-between items-center">
              <h3 className="font-bold text-lg font-serif-literary flex items-center gap-2">
                <School className="w-5 h-5 text-amber-400" />
                {editingClass ? `Chỉnh sửa lớp ${editingClass.name}` : 'Thêm lớp học mới'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Tên lớp học <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: 6A1, 7A2, 8A1, 9A1..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-900/30 focus:border-blue-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Khối lớp
                  </label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-900/30 focus:border-blue-900"
                  >
                    <option value={6}>Khối 6</option>
                    <option value={7}>Khối 7</option>
                    <option value={8}>Khối 8</option>
                    <option value={9}>Khối 9</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Phòng học
                  </label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Phòng 204 Dãy B"
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-900/30 focus:border-blue-900"
                  >
                  </input>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Ghi chú đặc điểm lớp
                </label>
                <textarea
                  rows={3}
                  placeholder="Ví dụ: Tình hình học tập, ý thức chuyên cần, sở trường văn học..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-900/30 focus:border-blue-900"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-sm font-semibold bg-blue-900 hover:bg-blue-950 text-white rounded-xl shadow transition"
                >
                  {editingClass ? 'Lưu thay đổi' : 'Thêm lớp'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Xác nhận Xóa Lớp (Bảo vệ dữ liệu quan trọng) */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2 font-serif-literary">
              Xác nhận xóa lớp học này?
            </h3>
            <p className="text-sm text-slate-600 mb-5 leading-relaxed">
              Bạn đang chuẩn bị xóa thông tin lớp <strong>{classes.find(c => c.id === deleteConfirmId)?.name}</strong>. Các liên kết dữ liệu học sinh thuộc lớp này sẽ cần được kiểm tra lại. Thao tác này không thể hoàn tác.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Hủy bỏ
              </button>
              <button
                onClick={() => handleDeleteConfirm(deleteConfirmId)}
                className="px-4 py-2 text-sm font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow transition"
              >
                Xóa lớp này
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Drawer / Modal Xem Chi Tiết Lớp Học */}
      {selectedClassDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="p-5 bg-blue-900 text-white flex justify-between items-center sticky top-0 z-10">
              <div>
                <h3 className="text-lg font-bold font-serif-literary">
                  Chi Tiết Lớp {selectedClassDetail.name} – THCS Thái Phiên
                </h3>
                <p className="text-xs text-blue-200">
                  {selectedClassDetail.room} • Khối {selectedClassDetail.grade}
                </p>
              </div>
              <button
                onClick={() => setSelectedClassDetail(null)}
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Danh sách học sinh trong lớp ({students.filter(s => s.classId === selectedClassDetail.id).length} em)
                </h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="p-2.5 pl-3 font-semibold text-slate-600">STT</th>
                        <th className="p-2.5 font-semibold text-slate-600">Họ và tên</th>
                        <th className="p-2.5 font-semibold text-slate-600">Điểm TB</th>
                        <th className="p-2.5 font-semibold text-slate-600">Bài tập</th>
                        <th className="p-2.5 font-semibold text-slate-600">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {students.filter(s => s.classId === selectedClassDetail.id).map((s, idx) => {
                        const avg = calculateStudentAverage(s);
                        return (
                          <tr key={s.id} className="hover:bg-slate-50">
                            <td className="p-2.5 pl-3 font-mono text-slate-500">{idx + 1}</td>
                            <td className="p-2.5 font-bold text-slate-800">{s.name}</td>
                            <td className="p-2.5 font-semibold text-blue-900">{avg !== null ? avg : '-'}</td>
                            <td className="p-2.5 text-slate-600">{s.completedAssignments}/{s.totalAssignments}</td>
                            <td className="p-2.5">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                s.status === 'Giỏi' ? 'bg-emerald-100 text-emerald-800' :
                                s.status === 'Khá' ? 'bg-blue-100 text-blue-800' :
                                s.status === 'Đạt' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                              }`}>
                                {s.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Bài tập giao cho lớp */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Bài tập môn Ngữ văn đã giao
                </h4>
                <div className="space-y-2">
                  {assignments.filter(a => a.classId === selectedClassDetail.id).map(asm => (
                    <div key={asm.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex justify-between items-center">
                      <div>
                        <div className="font-bold text-slate-800">{asm.title}</div>
                        <div className="text-slate-500 text-[11px]">Hạn: {asm.dueDate} • Đã nộp: {asm.completedCount}/{asm.totalCount}</div>
                      </div>
                      <span className="text-[11px] font-semibold bg-white border border-slate-200 px-2.5 py-1 rounded-md">
                        {asm.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedClassDetail(null)}
                className="px-4 py-2 text-sm font-semibold bg-slate-800 hover:bg-slate-900 text-white rounded-xl"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
