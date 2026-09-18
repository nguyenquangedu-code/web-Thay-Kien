import React, { useState, useMemo } from 'react';
import { 
  BookOpenCheck, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  BookOpen, 
  Filter, 
  X, 
  AlertCircle,
  FileText,
  Layers
} from 'lucide-react';
import { Lesson, AppData } from '../types';

interface LessonsViewProps {
  data: AppData;
  onSaveLesson: (lesson: Lesson) => void;
  onDeleteLesson: (lessonId: string) => void;
  onToggleLessonStatus: (lessonId: string) => void;
  onShowToast: (msg: string, type: 'success' | 'error') => void;
}

export const LessonsView: React.FC<LessonsViewProps> = ({
  data,
  onSaveLesson,
  onDeleteLesson,
  onToggleLessonStatus,
  onShowToast,
}) => {
  const { lessons, classes } = data;

  const [filterGrade, setFilterGrade] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterTopic, setFilterTopic] = useState<string>('ALL');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [grade, setGrade] = useState<number>(6);
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);
  const [topic, setTopic] = useState<Lesson['topic']>('Đọc hiểu văn bản');
  const [durationPeriods, setDurationPeriods] = useState<number>(2);
  const [objectives, setObjectives] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<Lesson['status']>('Đang thực hiện');
  const [formError, setFormError] = useState('');

  const filteredLessons = useMemo(() => {
    return lessons.filter(l => {
      const matchGrade = filterGrade === 'ALL' || String(l.grade) === filterGrade;
      const matchStatus = filterStatus === 'ALL' || l.status === filterStatus;
      const matchTopic = filterTopic === 'ALL' || l.topic === filterTopic;
      return matchGrade && matchStatus && matchTopic;
    });
  }, [lessons, filterGrade, filterStatus, filterTopic]);

  const handleOpenAdd = () => {
    setEditingLesson(null);
    setTitle('');
    setGrade(6);
    setSelectedClassIds([classes[0]?.id || '']);
    setTopic('Đọc hiểu văn bản');
    setDurationPeriods(2);
    setObjectives('');
    setNotes('');
    setStatus('Chưa dạy');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setTitle(lesson.title);
    setGrade(lesson.grade);
    setSelectedClassIds(lesson.classIds);
    setTopic(lesson.topic);
    setDurationPeriods(lesson.durationPeriods);
    setObjectives(lesson.objectives);
    setNotes(lesson.notes);
    setStatus(lesson.status);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError('Vui lòng nhập tên bài học Ngữ văn.');
      return;
    }
    if (!objectives.trim()) {
      setFormError('Vui lòng ghi rõ mục tiêu cần đạt của bài học.');
      return;
    }

    const lessonToSave: Lesson = {
      id: editingLesson ? editingLesson.id : `lsn-${Date.now()}`,
      title: title.trim(),
      grade: Number(grade),
      classIds: selectedClassIds.length > 0 ? selectedClassIds : [classes[0]?.id || 'cls-6a1'],
      topic,
      durationPeriods: Number(durationPeriods) || 1,
      objectives: objectives.trim(),
      notes: notes.trim() || 'Chuẩn bị SGK và tài liệu hướng dẫn học sinh.',
      status
    };

    onSaveLesson(lessonToSave);
    setIsModalOpen(false);
    onShowToast(`Đã lưu bài học "${lessonToSave.title}" thành công!`, 'success');
  };

  const handleDelete = (id: string) => {
    onDeleteLesson(id);
    setDeleteConfirmId(null);
    onShowToast('Đã xóa bài học!', 'success');
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Filter Controls */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-serif-literary">
              Kế Hoạch & Quản Lý Bài Học Ngữ Văn
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Phân phối chương trình, mục tiêu yêu cầu cần đạt và đồ dùng dạy học theo khối lớp.
            </p>
          </div>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 bg-blue-900 hover:bg-blue-950 text-white font-semibold text-sm px-4 py-2.5 rounded-xl shadow transition"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm bài học mới</span>
          </button>
        </div>

        {/* Filter bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Khối lớp
            </label>
            <select
              value={filterGrade}
              onChange={(e) => setFilterGrade(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-900/30"
            >
              <option value="ALL">-- Tất cả các khối (6, 7, 8, 9) --</option>
              <option value="6">Khối 6</option>
              <option value="7">Khối 7</option>
              <option value="8">Khối 8</option>
              <option value="9">Khối 9</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Chủ đề phân môn
            </label>
            <select
              value={filterTopic}
              onChange={(e) => setFilterTopic(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-900/30"
            >
              <option value="ALL">-- Tất cả các mạch kiến thức --</option>
              <option value="Đọc hiểu văn bản">Đọc hiểu văn bản</option>
              <option value="Thực hành Tiếng Việt">Thực hành Tiếng Việt</option>
              <option value="Viết bài văn">Viết bài văn</option>
              <option value="Nói và nghe">Nói và nghe</option>
              <option value="Ôn tập & Đánh giá">Ôn tập & Đánh giá</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Trạng thái bài dạy
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-900/30"
            >
              <option value="ALL">-- Tất cả trạng thái --</option>
              <option value="Chưa dạy">Chưa dạy</option>
              <option value="Đang thực hiện">Đang thực hiện</option>
              <option value="Đã hoàn thành">Đã hoàn thành</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lesson Cards List */}
      <div className="space-y-4">
        {filteredLessons.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400">
            <BookOpenCheck className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Không tìm thấy bài học nào phù hợp với bộ lọc hiện tại.</p>
          </div>
        ) : (
          filteredLessons.map((lesson) => {
            const isCompleted = lesson.status === 'Đã hoàn thành';
            const isInProgress = lesson.status === 'Đang thực hiện';

            return (
              <div
                key={lesson.id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-blue-300 shadow-xs hover:shadow-md transition-all p-5 flex flex-col md:flex-row justify-between gap-5"
              >
                {/* Left Info */}
                <div className="flex-1 space-y-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 border border-blue-200">
                      Khối {lesson.grade}
                    </span>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {lesson.topic}
                    </span>
                    <span className="text-xs font-medium text-slate-500">
                      Thời lượng: {lesson.durationPeriods} tiết
                    </span>

                    {/* Status Badge */}
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                      isCompleted ? 'bg-emerald-100 text-emerald-800' :
                      isInProgress ? 'bg-amber-100 text-amber-800' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {lesson.status}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-slate-900 font-serif-literary">
                    {lesson.title}
                  </h3>

                  <div className="text-xs text-slate-600 leading-relaxed">
                    <strong className="text-slate-800">Yêu cầu cần đạt:</strong> {lesson.objectives}
                  </div>

                  <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200/60 text-xs text-amber-950 flex items-start gap-2">
                    <FileText className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-amber-900">Chuẩn bị bài giảng:</strong> {lesson.notes}
                    </div>
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex md:flex-col items-center justify-between md:justify-center gap-2 pt-3 md:pt-0 border-t md:border-t-0 md:border-l border-slate-100 md:pl-5">
                  <button
                    onClick={() => onToggleLessonStatus(lesson.id)}
                    className={`w-full text-xs font-semibold px-3 py-2 rounded-xl flex items-center justify-center gap-1.5 transition ${
                      isCompleted
                        ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        : 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isCompleted ? 'Học lại bài này' : 'Đánh dấu hoàn thành'}</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(lesson)}
                      className="p-2 text-slate-400 hover:text-blue-900 hover:bg-slate-100 rounded-xl transition"
                      title="Sửa bài học"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(lesson.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                      title="Xóa bài học"
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

      {/* Modal Thêm / Sửa Bài Học */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="p-5 bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex justify-between items-center sticky top-0 z-10">
              <h3 className="font-bold text-lg font-serif-literary">
                {editingLesson ? 'Chỉnh sửa kế hoạch bài học' : 'Soạn bài học Ngữ văn mới'}
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
                  Tên tác phẩm / Tên bài học <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Lặng lẽ Sa Pa (Nguyễn Thành Long)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-900/30 focus:border-blue-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Khối lớp
                  </label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-900/30"
                  >
                    <option value={6}>Khối 6</option>
                    <option value={7}>Khối 7</option>
                    <option value={8}>Khối 8</option>
                    <option value={9}>Khối 9</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Số tiết giảng
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={durationPeriods}
                    onChange={(e) => setDurationPeriods(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-900/30"
                  />
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
                    <option value="Chưa dạy">Chưa dạy</option>
                    <option value="Đang thực hiện">Đang thực hiện</option>
                    <option value="Đã hoàn thành">Đã hoàn thành</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Chủ đề / Phân môn Ngữ văn
                </label>
                <select
                  value={topic}
                  onChange={(e) => setTopic(e.target.value as any)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-900/30"
                >
                  <option value="Đọc hiểu văn bản">Đọc hiểu văn bản</option>
                  <option value="Thực hành Tiếng Việt">Thực hành Tiếng Việt</option>
                  <option value="Viết bài văn">Viết bài văn</option>
                  <option value="Nói và nghe">Nói và nghe</option>
                  <option value="Ôn tập & Đánh giá">Ôn tập & Đánh giá</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Mục tiêu cần đạt (Phẩm chất & Năng lực đọc/viết) <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Ví dụ: Giúp học sinh cảm nhận vẻ đẹp nhân vật, rèn luyện kỹ năng phân tích hình ảnh tu từ..."
                  value={objectives}
                  onChange={(e) => setObjectives(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-900/30"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Ghi chú chuẩn bị của giáo viên & đồ dùng dạy học
                </label>
                <textarea
                  rows={2}
                  placeholder="Ví dụ: Tranh ảnh tác giả, phiếu học tập nhóm, video tư liệu..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-900/30"
                />
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
                  {editingLesson ? 'Lưu bài học' : 'Thêm bài học'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal xác nhận xóa bài học */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-2 font-serif-literary">
              Xác nhận xóa bài học?
            </h3>
            <p className="text-sm text-slate-600 mb-5 leading-relaxed">
              Bạn có chắc chắn muốn xóa bài học này khỏi kế hoạch giảng dạy?
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
                Xóa bài học
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
