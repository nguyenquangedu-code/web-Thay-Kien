import React, { useState, useMemo } from 'react';
import { 
  Star, 
  Search, 
  Filter, 
  Save, 
  Printer, 
  Info, 
  AlertCircle,
  CheckCircle2,
  Edit2
} from 'lucide-react';
import { Student, ClassItem, AppData } from '../types';
import { calculateStudentAverage } from '../utils/storage';

interface GradesViewProps {
  data: AppData;
  onUpdateStudentScores: (studentId: string, updates: Partial<Student>) => void;
  onShowToast: (msg: string, type: 'success' | 'error') => void;
}

export const GradesView: React.FC<GradesViewProps> = ({
  data,
  onUpdateStudentScores,
  onShowToast,
}) => {
  const { students, classes } = data;

  const [selectedClassId, setSelectedClassId] = useState('ALL');
  const [search, setSearch] = useState('');
  
  // Local state for inline score edits before save
  const [editingScores, setEditingScores] = useState<Record<string, {
    regularScore1?: string;
    regularScore2?: string;
    regularScore3?: string;
    midtermScore?: string;
    finalScore?: string;
    note?: string;
  }>>({});

  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchClass = selectedClassId === 'ALL' || s.classId === selectedClassId;
      const matchSearch = s.name.toLowerCase().includes(search.toLowerCase().trim());
      return matchClass && matchSearch;
    });
  }, [students, selectedClassId, search]);

  const handleScoreInputChange = (
    studentId: string,
    field: 'regularScore1' | 'regularScore2' | 'regularScore3' | 'midtermScore' | 'finalScore' | 'note',
    value: string
  ) => {
    setEditingScores(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value
      }
    }));
  };

  const getScoreValue = (student: Student, field: 'regularScore1' | 'regularScore2' | 'regularScore3' | 'midtermScore' | 'finalScore' | 'note'): string => {
    if (editingScores[student.id] && editingScores[student.id][field] !== undefined) {
      return editingScores[student.id][field] || '';
    }
    const val = student[field];
    return val !== undefined && val !== null ? String(val) : '';
  };

  const parseScore = (val: string | undefined): number | undefined => {
    if (!val || !val.trim()) return undefined;
    const num = parseFloat(val);
    if (isNaN(num)) return undefined;
    return Math.max(0, Math.min(10, Number(num.toFixed(1))));
  };

  const handleSaveRow = (student: Student) => {
    const edits = editingScores[student.id];
    if (!edits) {
      onShowToast('Chưa có thay đổi nào cần lưu.', 'info' as any);
      return;
    }

    const updates: Partial<Student> = {};
    if (edits.regularScore1 !== undefined) updates.regularScore1 = parseScore(edits.regularScore1);
    if (edits.regularScore2 !== undefined) updates.regularScore2 = parseScore(edits.regularScore2);
    if (edits.regularScore3 !== undefined) updates.regularScore3 = parseScore(edits.regularScore3);
    if (edits.midtermScore !== undefined) updates.midtermScore = parseScore(edits.midtermScore);
    if (edits.finalScore !== undefined) updates.finalScore = parseScore(edits.finalScore);
    if (edits.note !== undefined) updates.note = edits.note.trim();

    onUpdateStudentScores(student.id, updates);
    
    // Clear draft edit for this student
    setEditingScores(prev => {
      const next = { ...prev };
      delete next[student.id];
      return next;
    });

    onShowToast(`Đã cập nhật điểm cho học sinh ${student.name}!`, 'success');
  };

  const getClassName = (cid: string) => {
    const c = classes.find(item => item.id === cid);
    return c ? c.name : 'N/A';
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-serif-literary">
              Sổ Điểm Môn Ngữ Văn
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Nhập và chỉnh sửa điểm thường xuyên, giữa kỳ, cuối kỳ trực tiếp trên từng hàng.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>In bảng điểm</span>
            </button>
          </div>
        </div>

        {/* Explain notice */}
        <div className="p-3.5 bg-blue-50/80 rounded-xl border border-blue-200 text-xs text-blue-900 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-blue-700 flex-shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong>Ghi chú sư phạm:</strong> Cột <em>Điểm TB (Minh họa)</em> được tính toán theo công thức tham khảo <code>(TX1 + TX2 + TX3 + GK×2 + CK×3) / 7</code> giúp giáo viên có cái nhìn trực quan. Các điểm số dưới 5.0 được làm nổi bật nhẹ màu vàng nhạt để giáo viên kịp thời động viên và bồi dưỡng thêm, không mang tính phán xét.
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2 border-t border-slate-100">
          <div className="sm:col-span-8 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo tên học sinh..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-900/30"
            />
          </div>

          <div className="sm:col-span-4">
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-900/30"
            >
              <option value="ALL">-- Tất cả các lớp --</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>Lớp {c.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grade Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-700">
              <tr>
                <th className="py-3 px-3 w-10 text-center">STT</th>
                <th className="py-3 px-4 min-w-[160px]">Họ và tên</th>
                <th className="py-3 px-3 w-20">Lớp</th>
                <th className="py-3 px-2 w-20 text-center">TX 1</th>
                <th className="py-3 px-2 w-20 text-center">TX 2</th>
                <th className="py-3 px-2 w-20 text-center">TX 3</th>
                <th className="py-3 px-2 w-24 text-center bg-blue-50/50">Giữa kỳ</th>
                <th className="py-3 px-2 w-24 text-center bg-amber-50/50">Cuối kỳ</th>
                <th className="py-3 px-3 w-24 text-center">Điểm TB (Demo)</th>
                <th className="py-3 px-4 min-w-[180px]">Nhận xét của thầy Kiên</th>
                <th className="py-3 px-3 w-20 text-center">Lưu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400">
                    Không tìm thấy học sinh nào.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s, idx) => {
                  const avg = calculateStudentAverage(s);
                  const isLowScore = avg !== null && avg < 5.0;
                  const hasDraft = Boolean(editingScores[s.id]);

                  return (
                    <tr
                      key={s.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isLowScore ? 'bg-amber-50/20' : ''
                      }`}
                    >
                      <td className="py-3 px-3 text-center text-slate-500 font-mono text-xs">
                        {idx + 1}
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 block">{s.name}</span>
                        <span className="text-[11px] text-slate-400 font-normal">{s.gender}</span>
                      </td>

                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700">
                          {getClassName(s.classId)}
                        </span>
                      </td>

                      {/* TX 1 */}
                      <td className="py-2 px-1 text-center">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="10"
                          value={getScoreValue(s, 'regularScore1')}
                          onChange={(e) => handleScoreInputChange(s.id, 'regularScore1', e.target.value)}
                          className="w-16 px-1.5 py-1 text-center text-xs rounded border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-900 bg-white"
                        />
                      </td>

                      {/* TX 2 */}
                      <td className="py-2 px-1 text-center">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="10"
                          value={getScoreValue(s, 'regularScore2')}
                          onChange={(e) => handleScoreInputChange(s.id, 'regularScore2', e.target.value)}
                          className="w-16 px-1.5 py-1 text-center text-xs rounded border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-900 bg-white"
                        />
                      </td>

                      {/* TX 3 */}
                      <td className="py-2 px-1 text-center">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="10"
                          value={getScoreValue(s, 'regularScore3')}
                          onChange={(e) => handleScoreInputChange(s.id, 'regularScore3', e.target.value)}
                          className="w-16 px-1.5 py-1 text-center text-xs rounded border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-900 bg-white"
                        />
                      </td>

                      {/* Giữa kỳ */}
                      <td className="py-2 px-1 text-center bg-blue-50/30">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="10"
                          value={getScoreValue(s, 'midtermScore')}
                          onChange={(e) => handleScoreInputChange(s.id, 'midtermScore', e.target.value)}
                          className="w-16 px-1.5 py-1 text-center text-xs font-bold text-blue-950 rounded border border-blue-200 focus:outline-none focus:ring-1 focus:ring-blue-900 bg-white"
                        />
                      </td>

                      {/* Cuối kỳ */}
                      <td className="py-2 px-1 text-center bg-amber-50/30">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="10"
                          value={getScoreValue(s, 'finalScore')}
                          onChange={(e) => handleScoreInputChange(s.id, 'finalScore', e.target.value)}
                          className="w-16 px-1.5 py-1 text-center text-xs font-bold text-amber-950 rounded border border-amber-200 focus:outline-none focus:ring-1 focus:ring-amber-900 bg-white"
                        />
                      </td>

                      {/* Điểm TB (Demo) */}
                      <td className="py-3 px-3 text-center">
                        {avg !== null ? (
                          <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-bold ${
                            isLowScore
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : avg >= 8.0
                              ? 'bg-emerald-100 text-emerald-900 font-extrabold'
                              : 'bg-slate-100 text-slate-800'
                          }`}>
                            {avg.toFixed(1)}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">-</span>
                        )}
                      </td>

                      {/* Nhận xét */}
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={getScoreValue(s, 'note')}
                          onChange={(e) => handleScoreInputChange(s.id, 'note', e.target.value)}
                          placeholder="Nhận xét bài làm..."
                          className="w-full px-2 py-1 text-xs rounded border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-900 bg-white"
                        />
                      </td>

                      {/* Action */}
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => handleSaveRow(s)}
                          disabled={!hasDraft}
                          className={`p-1.5 rounded-lg text-xs font-semibold transition flex items-center justify-center mx-auto ${
                            hasDraft
                              ? 'bg-blue-900 text-white hover:bg-blue-950 shadow-xs'
                              : 'text-slate-300 cursor-not-allowed'
                          }`}
                          title={hasDraft ? 'Lưu điểm cho học sinh này' : 'Chưa có thay đổi'}
                        >
                          <Save className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
