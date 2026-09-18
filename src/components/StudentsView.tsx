import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  Award, 
  CheckCircle2, 
  AlertCircle, 
  X,
  BookOpen,
  Calendar,
  Sparkles,
  FileSpreadsheet
} from 'lucide-react';
import { Student, ClassItem, AppData } from '../types';
import { calculateStudentAverage } from '../utils/storage';
import { ExcelImportModal } from './ExcelImportModal';

interface StudentsViewProps {
  data: AppData;
  initialClassFilter?: string;
  onSaveStudent: (student: Student) => void;
  onSaveStudents?: (students: Student[], targetClassId: string, mode: 'append' | 'replace') => void;
  onDeleteStudent: (studentId: string) => void;
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const StudentsView: React.FC<StudentsViewProps> = ({
  data,
  initialClassFilter,
  onSaveStudent,
  onSaveStudents,
  onDeleteStudent,
  onShowToast,
}) => {
  const { students, classes } = data;

  const [search, setSearch] = useState('');
  const [selectedClassId, setSelectedClassId] = useState(initialClassFilter || 'ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [classId, setClassId] = useState(classes[0]?.id || '');
  const [gender, setGender] = useState<'Nam' | 'Nữ'>('Nam');
  const [dob, setDob] = useState('2012-01-01');
  const [status, setStatus] = useState<'Giỏi' | 'Khá' | 'Đạt' | 'Cần cố gắng'>('Khá');
  const [regularScore1, setRegularScore1] = useState<string>('');
  const [regularScore2, setRegularScore2] = useState<string>('');
  const [regularScore3, setRegularScore3] = useState<string>('');
  const [midtermScore, setMidtermScore] = useState<string>('');
  const [finalScore, setFinalScore] = useState<string>('');
  const [completedAssignments, setCompletedAssignments] = useState<number>(5);
  const [totalAssignments, setTotalAssignments] = useState<number>(5);
  const [note, setNote] = useState('');
  const [formError, setFormError] = useState('');

  // Lọc danh sách học sinh
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchSearch = s.name.toLowerCase().includes(search.toLowerCase().trim());
      const matchClass = selectedClassId === 'ALL' || s.classId === selectedClassId;
      const matchStatus = selectedStatus === 'ALL' || s.status === selectedStatus;
      return matchSearch && matchClass && matchStatus;
    });
  }, [students, search, selectedClassId, selectedStatus]);

  const handleOpenAdd = () => {
    setEditingStudent(null);
    setName('');
    setClassId(classes[0]?.id || '');
    setGender('Nam');
    setDob('2012-01-01');
    setStatus('Khá');
    setRegularScore1('8.0');
    setRegularScore2('8.0');
    setRegularScore3('');
    setMidtermScore('8.0');
    setFinalScore('');
    setCompletedAssignments(4);
    setTotalAssignments(5);
    setNote('');
    setFormError('');
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (student: Student) => {
    setEditingStudent(student);
    setName(student.name);
    setClassId(student.classId);
    setGender(student.gender);
    setDob(student.dob || '2012-01-01');
    setStatus(student.status);
    setRegularScore1(student.regularScore1 !== undefined ? String(student.regularScore1) : '');
    setRegularScore2(student.regularScore2 !== undefined ? String(student.regularScore2) : '');
    setRegularScore3(student.regularScore3 !== undefined ? String(student.regularScore3) : '');
    setMidtermScore(student.midtermScore !== undefined ? String(student.midtermScore) : '');
    setFinalScore(student.finalScore !== undefined ? String(student.finalScore) : '');
    setCompletedAssignments(student.completedAssignments);
    setTotalAssignments(student.totalAssignments);
    setNote(student.note);
    setFormError('');
    setIsFormModalOpen(true);
  };

  const parseScore = (val: string): number | undefined => {
    if (!val.trim()) return undefined;
    const num = parseFloat(val);
    if (isNaN(num)) return undefined;
    return Math.max(0, Math.min(10, Number(num.toFixed(1))));
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Vui lòng nhập họ và tên học sinh.');
      return;
    }
    if (!classId) {
      setFormError('Vui lòng chọn lớp cho học sinh.');
      return;
    }

    const studentToSave: Student = {
      id: editingStudent ? editingStudent.id : `std-${Date.now()}`,
      name: name.trim(),
      classId,
      gender,
      dob,
      status,
      regularScore1: parseScore(regularScore1),
      regularScore2: parseScore(regularScore2),
      regularScore3: parseScore(regularScore3),
      midtermScore: parseScore(midtermScore),
      finalScore: parseScore(finalScore),
      completedAssignments: Number(completedAssignments) || 0,
      totalAssignments: Number(totalAssignments) || 5,
      note: note.trim() || 'Chưa có nhận xét'
    };

    onSaveStudent(studentToSave);
    setIsFormModalOpen(false);
    onShowToast(`Đã lưu hồ sơ học sinh ${studentToSave.name} thành công!`, 'success');
  };

  const handleExcelImportSuccess = (importedStudents: Student[], targetClassId: string, mode: 'append' | 'replace') => {
    if (onSaveStudents) {
      onSaveStudents(importedStudents, targetClassId, mode);
    } else {
      importedStudents.forEach(s => onSaveStudent(s));
    }
  };

  const handleDeleteConfirm = (id: string) => {
    const s = students.find(item => item.id === id);
    onDeleteStudent(id);
    setDeleteConfirmId(null);
    onShowToast(`Đã xóa học sinh ${s?.name || ''}!`, 'success');
  };

  const getClassName = (cid: string) => {
    const c = classes.find(item => item.id === cid);
    return c ? c.name : 'N/A';
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Controls */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-serif-literary">
              Quản Lý Danh Sách Học Sinh
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Theo dõi kết quả học tập, tiến độ nộp bài và nhận xét quá trình học môn Ngữ văn.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsExcelModalOpen(true)}
              className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm px-4 py-2.5 rounded-xl shadow-xs transition cursor-pointer"
              title="Nhập danh sách học sinh từ file Excel (.xlsx, .xls, .csv)"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
              <span>Nhập từ file Excel</span>
            </button>

            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-2 bg-blue-900 hover:bg-blue-950 text-white font-semibold text-sm px-4 py-2.5 rounded-xl shadow-xs transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm học sinh mới</span>
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2 border-t border-slate-100">
          
          {/* Search box */}
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo họ tên học sinh..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-900/30 focus:border-blue-900"
            />
          </div>

          {/* Filter by class */}
          <div className="sm:col-span-3">
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-900/30 focus:border-blue-900"
            >
              <option value="ALL">-- Tất cả các lớp --</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>Lớp {c.name} (Khối {c.grade})</option>
              ))}
            </select>
          </div>

          {/* Filter by status */}
          <div className="sm:col-span-3">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-900/30 focus:border-blue-900"
            >
              <option value="ALL">-- Tất cả học lực --</option>
              <option value="Giỏi">Học lực Giỏi</option>
              <option value="Khá">Học lực Khá</option>
              <option value="Đạt">Học lực Đạt</option>
              <option value="Cần cố gắng">Cần cố gắng</option>
            </select>
          </div>

        </div>
      </div>

      {/* Student List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-xs text-slate-600 font-semibold">
          <span>Tìm thấy {filteredStudents.length} học sinh phù hợp</span>
          <span className="text-[11px] text-slate-500">* Bấm vào biểu tượng mắt để xem chi tiết hồ sơ</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-600 font-bold">
              <tr>
                <th className="py-3 px-4 w-12 text-center">STT</th>
                <th className="py-3 px-4">Họ và tên</th>
                <th className="py-3 px-4">Lớp</th>
                <th className="py-3 px-4 text-center">Điểm TB (Demo)</th>
                <th className="py-3 px-4 text-center">Bài tập hoàn thành</th>
                <th className="py-3 px-4">Trạng thái</th>
                <th className="py-3 px-4 min-w-[200px]">Ghi chú giáo viên</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">Không tìm thấy học sinh nào theo tiêu chí lọc.</p>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s, idx) => {
                  const avg = calculateStudentAverage(s);
                  const isLow = avg !== null && avg < 5.0;

                  return (
                    <tr 
                      key={s.id} 
                      className={`hover:bg-blue-50/40 transition-colors ${
                        isLow ? 'bg-amber-50/30' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 text-center text-slate-500 font-mono text-xs">
                        {idx + 1}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{s.name}</span>
                          <span className="text-[10px] text-slate-400 font-normal">
                            ({s.gender})
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-blue-50 text-blue-900 border border-blue-200">
                          {getClassName(s.classId)}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        {avg !== null ? (
                          <span className={`font-bold px-2 py-0.5 rounded-md text-xs ${
                            isLow 
                              ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                              : avg >= 8.0 
                              ? 'bg-emerald-50 text-emerald-800 font-extrabold' 
                              : 'text-slate-800'
                          }`}>
                            {avg.toFixed(1)}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">Chưa đủ</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-1 text-xs">
                          <span className="font-semibold text-slate-800">{s.completedAssignments}</span>
                          <span className="text-slate-400">/</span>
                          <span className="text-slate-500">{s.totalAssignments}</span>
                          {s.completedAssignments === s.totalAssignments && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 inline ml-0.5" />
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                          s.status === 'Giỏi' ? 'bg-emerald-100 text-emerald-800' :
                          s.status === 'Khá' ? 'bg-blue-100 text-blue-800' :
                          s.status === 'Đạt' ? 'bg-amber-100 text-amber-800' :
                          'bg-rose-100 text-rose-800'
                        }`}>
                          {s.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-xs text-slate-600 italic">
                        {s.note}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setViewingStudent(s)}
                            className="p-1.5 text-slate-400 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition"
                            title="Xem chi tiết học sinh"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(s)}
                            className="p-1.5 text-slate-400 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition"
                            title="Sửa thông tin"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(s.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Xóa học sinh"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Xem Chi Tiết Học Sinh */}
      {viewingStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-lg">
                  {viewingStudent.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold font-serif-literary">
                    {viewingStudent.name}
                  </h3>
                  <p className="text-xs text-blue-200">
                    Lớp {getClassName(viewingStudent.classId)} • Giới tính: {viewingStudent.gender}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingStudent(null)}
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-sm">
              
              {/* Bảng điểm chi tiết môn Ngữ văn */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-600" />
                  Điểm số các bài kiểm tra môn Ngữ văn
                </h4>
                <div className="grid grid-cols-5 gap-2 text-center bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="p-1">
                    <div className="text-[10px] text-slate-500 uppercase font-bold">TX 1</div>
                    <div className="text-base font-bold text-slate-800 mt-0.5">
                      {viewingStudent.regularScore1 ?? '-'}
                    </div>
                  </div>
                  <div className="p-1">
                    <div className="text-[10px] text-slate-500 uppercase font-bold">TX 2</div>
                    <div className="text-base font-bold text-slate-800 mt-0.5">
                      {viewingStudent.regularScore2 ?? '-'}
                    </div>
                  </div>
                  <div className="p-1">
                    <div className="text-[10px] text-slate-500 uppercase font-bold">TX 3</div>
                    <div className="text-base font-bold text-slate-800 mt-0.5">
                      {viewingStudent.regularScore3 ?? '-'}
                    </div>
                  </div>
                  <div className="p-1 bg-blue-100/50 rounded-lg">
                    <div className="text-[10px] text-blue-900 uppercase font-bold">Giữa Kỳ</div>
                    <div className="text-base font-extrabold text-blue-900 mt-0.5">
                      {viewingStudent.midtermScore ?? '-'}
                    </div>
                  </div>
                  <div className="p-1 bg-amber-100/50 rounded-lg">
                    <div className="text-[10px] text-amber-900 uppercase font-bold">Cuối Kỳ</div>
                    <div className="text-base font-extrabold text-amber-950 mt-0.5">
                      {viewingStudent.finalScore ?? '-'}
                    </div>
                  </div>
                </div>

                <div className="mt-2 text-right">
                  <span className="text-xs text-slate-500">Điểm TB tham khảo: </span>
                  <span className="text-sm font-extrabold text-blue-900">
                    {calculateStudentAverage(viewingStudent) ?? 'Chưa tính'}
                  </span>
                </div>
              </div>

              {/* Tiến độ bài tập */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  Tiến độ nộp bài tập môn Ngữ văn
                </h4>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div className="flex justify-between items-center text-xs mb-1.5">
                    <span className="font-semibold text-slate-700">Bài tập đã hoàn thành:</span>
                    <span className="font-bold text-slate-900">
                      {viewingStudent.completedAssignments} / {viewingStudent.totalAssignments} bài
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-900 rounded-full"
                      style={{
                        width: `${Math.round((viewingStudent.completedAssignments / viewingStudent.totalAssignments) * 100)}%`
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Ghi chú của giáo viên */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Ghi chú sư phạm của Thầy Nguyễn Quang Kiên
                </h4>
                <div className="p-3.5 bg-amber-50/60 rounded-xl border border-amber-200/80 text-xs text-amber-950 leading-relaxed">
                  "{viewingStudent.note}"
                </div>
              </div>

            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
              <button
                onClick={() => {
                  setViewingStudent(null);
                  handleOpenEdit(viewingStudent);
                }}
                className="text-xs font-semibold text-blue-900 hover:underline flex items-center gap-1"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Chỉnh sửa hồ sơ
              </button>

              <button
                onClick={() => setViewingStudent(null)}
                className="px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-900 text-white rounded-xl transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Thêm / Sửa Học Sinh */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="p-5 bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex justify-between items-center sticky top-0 z-10">
              <h3 className="font-bold text-base sm:text-lg font-serif-literary">
                {editingStudent ? 'Chỉnh sửa hồ sơ học sinh' : 'Thêm học sinh mới'}
              </h3>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Switcher Tab khi thêm mới */}
            {!editingStudent && (
              <div className="flex border-b border-slate-200 bg-slate-50/80 px-5 pt-2.5 gap-2">
                <button
                  type="button"
                  className="px-3.5 py-2 border-b-2 border-blue-900 text-blue-900 font-bold text-xs flex items-center gap-1.5"
                >
                  <span>1. Nhập thủ công</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsFormModalOpen(false);
                    setIsExcelModalOpen(true);
                  }}
                  className="px-3.5 py-2 border-b-2 border-transparent hover:border-emerald-600 text-slate-600 hover:text-emerald-700 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-800">2. Nhập từ file Excel (.xlsx, .xls, .csv)</span>
                </button>
              </div>
            )}

            <form onSubmit={handleSaveStudent} className="p-6 space-y-4">
              {!editingStudent && (
                <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span className="text-xs text-emerald-950 font-medium">
                      Thầy có danh sách cả lớp trong file Excel? Nhập tự động nhanh chóng.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsFormModalOpen(false);
                      setIsExcelModalOpen(true);
                    }}
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg shrink-0 transition shadow-2xs cursor-pointer"
                  >
                    Tải file Excel lên
                  </button>
                </div>
              )}

              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Họ và tên học sinh <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Nguyễn Hoàng Nam"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-900/30 focus:border-blue-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Lớp đang học <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={classId}
                    onChange={(e) => setClassId(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-900/30 focus:border-blue-900"
                  >
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>Lớp {c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Giới tính
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as 'Nam' | 'Nữ')}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-900/30"
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Ngày sinh
                  </label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-900/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Xếp loại chung
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-900/30"
                  >
                    <option value="Giỏi">Giỏi</option>
                    <option value="Khá">Khá</option>
                    <option value="Đạt">Đạt</option>
                    <option value="Cần cố gắng">Cần cố gắng</option>
                  </select>
                </div>
              </div>

              {/* Điểm số các cột */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Điểm kiểm tra môn Ngữ văn (Thang điểm 10)
                </span>
                <div className="grid grid-cols-5 gap-2">
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">TX 1</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      placeholder="TX1"
                      value={regularScore1}
                      onChange={(e) => setRegularScore1(e.target.value)}
                      className="w-full px-2 py-1.5 text-xs text-center rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">TX 2</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      placeholder="TX2"
                      value={regularScore2}
                      onChange={(e) => setRegularScore2(e.target.value)}
                      className="w-full px-2 py-1.5 text-xs text-center rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">TX 3</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      placeholder="TX3"
                      value={regularScore3}
                      onChange={(e) => setRegularScore3(e.target.value)}
                      className="w-full px-2 py-1.5 text-xs text-center rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-blue-900 mb-1">Giữa Kỳ</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      placeholder="GK"
                      value={midtermScore}
                      onChange={(e) => setMidtermScore(e.target.value)}
                      className="w-full px-2 py-1.5 text-xs text-center font-bold text-blue-900 bg-blue-50/50 rounded-lg border border-blue-300 focus:outline-none focus:ring-1 focus:ring-blue-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-amber-900 mb-1">Cuối Kỳ</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      placeholder="CK"
                      value={finalScore}
                      onChange={(e) => setFinalScore(e.target.value)}
                      className="w-full px-2 py-1.5 text-xs text-center font-bold text-amber-900 bg-amber-50/50 rounded-lg border border-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-900"
                    />
                  </div>
                </div>
              </div>

              {/* Tiến độ bài tập */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Số bài tập đã hoàn thành
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={totalAssignments}
                    value={completedAssignments}
                    onChange={(e) => setCompletedAssignments(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-900/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Tổng số bài tập đã giao
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={totalAssignments}
                    onChange={(e) => setTotalAssignments(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-900/30"
                  />
                </div>
              </div>

              {/* Ghi chú */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Ghi chú của thầy về học sinh
                </label>
                <textarea
                  rows={3}
                  placeholder="Ví dụ: Lời văn cảm xúc, phát biểu tốt hoặc cần luyện thêm chữ viết..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-900/30 focus:border-blue-900"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold bg-blue-900 hover:bg-blue-950 text-white rounded-xl shadow transition"
                >
                  {editingStudent ? 'Lưu cập nhật' : 'Thêm học sinh'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Xác nhận Xóa Học Sinh */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2 font-serif-literary">
              Xác nhận xóa học sinh?
            </h3>
            <p className="text-sm text-slate-600 mb-5 leading-relaxed">
              Bạn có chắc chắn muốn xóa hồ sơ học sinh <strong>{students.find(s => s.id === deleteConfirmId)?.name}</strong>? Toàn bộ điểm số và bài tập của học sinh này sẽ bị xóa khỏi hệ thống.
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
                Xóa học sinh này
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nhập Danh Sách Từ File Excel */}
      <ExcelImportModal
        isOpen={isExcelModalOpen}
        onClose={() => setIsExcelModalOpen(false)}
        classes={classes}
        defaultClassId={selectedClassId !== 'ALL' ? selectedClassId : classes[0]?.id}
        onImportSuccess={handleExcelImportSuccess}
        onShowToast={onShowToast}
      />

    </div>
  );
};
