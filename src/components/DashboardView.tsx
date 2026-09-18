import React from 'react';
import { 
  School, 
  Users, 
  BookOpenCheck, 
  FileEdit, 
  AlertTriangle, 
  Clock, 
  ArrowRight, 
  CheckCircle2, 
  PlusCircle, 
  Sparkles,
  TrendingUp,
  BookmarkCheck
} from 'lucide-react';
import { ActiveTab, AppData } from '../types';
import { calculateStudentAverage } from '../utils/storage';

interface DashboardViewProps {
  data: AppData;
  onNavigate: (tab: ActiveTab) => void;
  onQuickAction: (action: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  data,
  onNavigate,
  onQuickAction,
}) => {
  const { classes, students, lessons, assignments, notes } = data;

  // Tính toán số liệu thống kê
  const totalStudents = students.length;
  const totalClasses = classes.length;
  const totalLessons = lessons.length;
  const activeAssignments = assignments.filter(a => a.status === 'Sắp đến hạn' || a.status === 'Hoàn thành tốt').length;

  // Tiến độ bài tập tổng thể
  const totalCompletedAssignments = students.reduce((acc, s) => acc + s.completedAssignments, 0);
  const totalPossibleAssignments = students.reduce((acc, s) => acc + s.totalAssignments, 0) || 1;
  const overallCompletionRate = Math.round((totalCompletedAssignments / totalPossibleAssignments) * 100);

  // Điểm trung bình theo lớp
  const classAverages = classes.map(cls => {
    const clsStudents = students.filter(s => s.classId === cls.id);
    if (clsStudents.length === 0) return { className: cls.name, avg: 0, count: 0 };
    
    let sum = 0;
    let counted = 0;
    clsStudents.forEach(s => {
      const avg = calculateStudentAverage(s);
      if (avg !== null) {
        sum += avg;
        counted++;
      }
    });
    return {
      className: cls.name,
      grade: cls.grade,
      avg: counted > 0 ? Number((sum / counted).toFixed(1)) : 0,
      count: clsStudents.length
    };
  });

  // Học sinh cần hỗ trợ (Cần cố gắng hoặc điểm < 5.5)
  const studentsNeedingAttention = students.filter(s => {
    const avg = calculateStudentAverage(s);
    return s.status === 'Cần cố gắng' || (avg !== null && avg < 5.5);
  });

  // Bài tập cần theo dõi (sắp đến hạn hoặc quá hạn)
  const urgentAssignments = assignments.filter(a => a.status === 'Sắp đến hạn' || a.status === 'Quá hạn');

  // Ghi chú quan trọng
  const importantNotes = notes.filter(n => n.isImportant);

  return (
    <div className="space-y-6">
      
      {/* Banner Chào mừng & Thao tác nhanh */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-7 shadow-lg border border-blue-800/40 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-semibold mb-2 border border-amber-400/30">
              <Sparkles className="w-3.5 h-3.5" />
              Năm học 2025 - 2026 • Học kỳ I
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-serif-literary">
              Kính chào Thầy Nguyễn Quang Kiên!
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              Hệ thống đã sẵn sàng hỗ trợ thầy quản lý giảng dạy <strong>{totalClasses} lớp học</strong>, theo dõi <strong>{totalStudents} học sinh</strong> và cập nhật tiến độ bài giảng Ngữ văn trường THCS Thái Phiên.
            </p>
          </div>

          {/* Quick Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onQuickAction('add-student')}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium border border-white/20 flex items-center gap-1.5 transition"
            >
              <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
              Thêm học sinh
            </button>
            <button
              onClick={() => onQuickAction('add-lesson')}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium border border-white/20 flex items-center gap-1.5 transition"
            >
              <PlusCircle className="w-3.5 h-3.5 text-blue-300" />
              Tạo bài học
            </button>
            <button
              onClick={() => onQuickAction('add-assignment')}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium border border-white/20 flex items-center gap-1.5 transition"
            >
              <PlusCircle className="w-3.5 h-3.5 text-emerald-300" />
              Giao bài tập
            </button>
          </div>
        </div>

        {/* Decorative background shape */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 4 Thẻ thống kê lớn */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* Thẻ Lớp học */}
        <div 
          onClick={() => onNavigate('classes')}
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md hover:border-blue-400 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Lớp đang dạy</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center group-hover:bg-blue-900 group-hover:text-white transition">
              <School className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{totalClasses}</span>
            <span className="text-xs text-slate-500 font-medium">lớp (Khối 6-9)</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-blue-800 font-semibold group-hover:translate-x-0.5 transition-transform">
            <span>Chi tiết các lớp</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Thẻ Học sinh */}
        <div 
          onClick={() => onNavigate('students')}
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md hover:border-indigo-400 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Tổng số học sinh</span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-800 flex items-center justify-center group-hover:bg-indigo-900 group-hover:text-white transition">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{totalStudents}</span>
            <span className="text-xs text-emerald-600 font-semibold flex items-center gap-0.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Đầy đủ hồ sơ
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-indigo-800 font-semibold group-hover:translate-x-0.5 transition-transform">
            <span>Xem danh sách học sinh</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Thẻ Bài học */}
        <div 
          onClick={() => onNavigate('lessons')}
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md hover:border-emerald-400 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Bài học Ngữ văn</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center group-hover:bg-emerald-800 group-hover:text-white transition">
              <BookOpenCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{totalLessons}</span>
            <span className="text-xs text-slate-500 font-medium">chủ đề & văn bản</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-emerald-800 font-semibold group-hover:translate-x-0.5 transition-transform">
            <span>Xem kế hoạch bài dạy</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Thẻ Bài tập */}
        <div 
          onClick={() => onNavigate('assignments')}
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md hover:border-amber-400 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Bài tập đang giao</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition">
              <FileEdit className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{assignments.length}</span>
            <span className="text-xs text-amber-700 font-medium">
              {urgentAssignments.length} cần theo dõi
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-amber-800 font-semibold group-hover:translate-x-0.5 transition-transform">
            <span>Theo dõi nộp bài tập</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

      </div>

      {/* Khu vực 2 cột: Tình hình học tập & Công việc cần chú ý */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Cột trái: TÌNH HÌNH HỌC TẬP (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-900" />
              <h3 className="text-base sm:text-lg font-bold text-slate-900 font-serif-literary">
                Tình hình học tập
              </h3>
            </div>
            <button
              onClick={() => onNavigate('stats')}
              className="text-xs font-semibold text-blue-800 hover:text-blue-900 flex items-center gap-1"
            >
              <span>Xem biểu đồ chi tiết</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Tiến độ hoàn thành bài tập tổng thể */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2">
              <span>Tỷ lệ hoàn thành bài tập toàn bộ các lớp</span>
              <span className="text-blue-900 text-sm font-extrabold">{overallCompletionRate}%</span>
            </div>
            <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-700 to-indigo-600 rounded-full transition-all duration-500"
                style={{ width: `${overallCompletionRate}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[11px] text-slate-500 mt-2">
              <span>Đã hoàn thành: <strong>{totalCompletedAssignments} lượt</strong></span>
              <span>Chưa hoàn thành: <strong>{totalPossibleAssignments - totalCompletedAssignments} lượt</strong></span>
            </div>
          </div>

          {/* Điểm trung bình môn Ngữ văn theo từng lớp */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Điểm trung bình môn Ngữ văn theo lớp (Minh họa)
            </h4>
            <div className="space-y-3">
              {classAverages.map((item) => {
                const percentage = Math.min(100, Math.round((item.avg / 10) * 100));
                return (
                  <div key={item.className} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-800">Lớp {item.className}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-500">{item.count} học sinh</span>
                        <span className="font-extrabold text-blue-950 bg-blue-100/70 px-2 py-0.5 rounded-md">
                          {item.avg.toFixed(1)} / 10
                        </span>
                      </div>
                    </div>
                    <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-blue-900 transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-[11px] text-slate-500 italic mt-3">
              * Điểm số mang tính chất minh họa giúp giáo viên theo dõi tổng quan năng lực tiếp thu của từng lớp.
            </p>
          </div>
        </div>

        {/* Cột phải: CÔNG VIỆC CẦN CHÚ Ý (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <h3 className="text-base sm:text-lg font-bold text-slate-900 font-serif-literary">
                Công việc cần chú ý
              </h3>
            </div>
            <span className="text-xs font-semibold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">
              {urgentAssignments.length + importantNotes.length} việc
            </span>
          </div>

          <div className="space-y-3.5 overflow-y-auto max-h-[380px] pr-1">
            
            {/* Bài tập sắp đến hạn / quá hạn */}
            {urgentAssignments.map(asm => (
              <div 
                key={asm.id}
                onClick={() => onNavigate('assignments')}
                className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/50 hover:bg-amber-100/50 transition cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                    asm.status === 'Quá hạn' 
                      ? 'bg-rose-100 text-rose-800' 
                      : 'bg-amber-200 text-amber-900'
                  }`}>
                    {asm.status}
                  </span>
                  <span className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Hạn: {asm.dueDate}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 mt-2 line-clamp-1">
                  [{asm.className}] {asm.title}
                </h4>
                <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-600">
                  <span>Chưa nộp: <strong className="text-amber-900">{asm.totalCount - asm.completedCount} em</strong></span>
                  <span className="text-blue-800 font-semibold hover:underline">Chi tiết &rarr;</span>
                </div>
              </div>
            ))}

            {/* Ghi chú quan trọng của giáo viên */}
            {importantNotes.map(note => (
              <div 
                key={note.id}
                onClick={() => onNavigate('notes')}
                className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-100/50 transition cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-blue-200 text-blue-900 flex items-center gap-1">
                    <BookmarkCheck className="w-3 h-3" />
                    Ghi chú quan trọng
                  </span>
                  <span className="text-[11px] text-slate-500">{note.date}</span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 mt-2">
                  {note.title}
                </h4>
                <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">
                  {note.content}
                </p>
                <div className="mt-2 text-[10px] text-blue-900 font-semibold">
                  Lớp: {note.relatedClassName}
                </div>
              </div>
            ))}

            {/* Học sinh cần kèm cặp hoặc khích lệ */}
            {studentsNeedingAttention.length > 0 && (
              <div 
                onClick={() => onNavigate('students')}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-700">
                    Theo dõi học sinh cần kèm cặp
                  </span>
                  <span className="text-[11px] bg-slate-200 text-slate-800 px-2 py-0.5 rounded-full font-bold">
                    {studentsNeedingAttention.length} em
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {studentsNeedingAttention.slice(0, 3).map(s => (
                    <span key={s.id} className="text-[11px] bg-white border border-slate-200 px-2 py-0.5 rounded-md text-slate-700">
                      {s.name}
                    </span>
                  ))}
                  {studentsNeedingAttention.length > 3 && (
                    <span className="text-[11px] text-slate-500 self-center">
                      +{studentsNeedingAttention.length - 3} em khác
                    </span>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>

      </div>

    </div>
  );
};
