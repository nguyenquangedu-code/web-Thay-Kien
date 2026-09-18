import React from 'react';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Award, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  BookOpen,
  School,
  Users
} from 'lucide-react';
import { AppData } from '../types';
import { calculateStudentAverage } from '../utils/storage';

interface StatsViewProps {
  data: AppData;
}

export const StatsView: React.FC<StatsViewProps> = ({ data }) => {
  const { classes, students, lessons, assignments } = data;

  // 1. Thống kê học sinh theo lớp
  const studentsByClass = classes.map(cls => {
    const count = students.filter(s => s.classId === cls.id).length;
    return { name: cls.name, count, grade: cls.grade };
  });
  const maxClassStudents = Math.max(...studentsByClass.map(c => c.count), 1);

  // 2. Thống kê xếp loại học lực
  const gradeDistribution = {
    gioi: students.filter(s => s.status === 'Giỏi').length,
    kha: students.filter(s => s.status === 'Khá').length,
    dat: students.filter(s => s.status === 'Đạt').length,
    canCoGang: students.filter(s => s.status === 'Cần cố gắng').length,
  };
  const totalStudents = students.length || 1;

  // 3. Thống kê bài tập
  const assignmentsStats = {
    good: assignments.filter(a => a.status === 'Hoàn thành tốt').length,
    upcoming: assignments.filter(a => a.status === 'Sắp đến hạn').length,
    overdue: assignments.filter(a => a.status === 'Quá hạn').length,
    total: assignments.length || 1
  };

  // 4. Thống kê bài học theo trạng thái
  const lessonStats = {
    completed: lessons.filter(l => l.status === 'Đã hoàn thành').length,
    inProgress: lessons.filter(l => l.status === 'Đang thực hiện').length,
    notStarted: lessons.filter(l => l.status === 'Chưa dạy').length,
    total: lessons.length || 1
  };

  // 5. Tỷ lệ nộp bài tập tổng thể
  const totalCompletedAssignments = students.reduce((acc, s) => acc + s.completedAssignments, 0);
  const totalPossibleAssignments = students.reduce((acc, s) => acc + s.totalAssignments, 0) || 1;
  const overallRate = Math.round((totalCompletedAssignments / totalPossibleAssignments) * 100);

  // Tính toán đường tròn SVG cho Donut Chart
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overallRate / 100) * circumference;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-serif-literary">
          Báo Cáo & Thống Kê Học Tập Ngữ Văn
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Biểu đồ trực quan xây dựng hoàn toàn bằng SVG và HTML thuần, đảm bảo hoạt động 100% khi chạy offline.
        </p>
      </div>

      {/* Grid biểu đồ hàng 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Biểu đồ cột: Số học sinh theo lớp */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <School className="w-5 h-5 text-blue-900" />
              <h3 className="text-base font-bold text-slate-900 font-serif-literary">
                Số học sinh phân bổ theo từng lớp
              </h3>
            </div>
            <span className="text-xs font-semibold text-slate-500">{students.length} học sinh</span>
          </div>

          <div className="pt-4">
            <div className="flex items-end justify-between gap-4 h-52 px-4 pb-4 border-b border-slate-200">
              {studentsByClass.map((item) => {
                const heightPercent = Math.round((item.count / maxClassStudents) * 100);
                return (
                  <div key={item.name} className="flex-1 flex flex-col items-center gap-2 group">
                    <span className="text-xs font-bold text-slate-700 opacity-90 group-hover:text-blue-900">
                      {item.count} em
                    </span>
                    <div className="w-full max-w-[48px] bg-slate-100 rounded-t-xl overflow-hidden h-40 flex items-end">
                      <div
                        className="w-full bg-gradient-to-t from-blue-950 to-blue-700 rounded-t-xl transition-all duration-500 group-hover:from-blue-900 group-hover:to-blue-500"
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>
                    <span className="text-xs font-extrabold text-slate-800">
                      Lớp {item.name}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between items-center text-[11px] text-slate-500 pt-3">
              <span>Đơn vị: Học sinh đã nhập vào hệ thống</span>
              <span>Tổng số: {classes.length} lớp học</span>
            </div>
          </div>
        </div>

        {/* Biểu đồ Donut: Tỷ lệ hoàn thành bài tập */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base font-bold text-slate-900 font-serif-literary">
                Tỷ lệ hoàn thành bài tập Ngữ văn
              </h3>
            </div>
            <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full">
              Chỉ số tích cực
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-around gap-6 pt-2">
            
            {/* Pure SVG Donut Chart */}
            <div className="relative w-40 h-40 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
                {/* Background circle */}
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  stroke="#e2e8f0"
                  strokeWidth="16"
                  fill="transparent"
                />
                {/* Foreground circle */}
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  stroke="#1e3a8a"
                  strokeWidth="16"
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-extrabold text-blue-950 font-serif-literary">
                  {overallRate}%
                </span>
                <span className="text-[10px] uppercase font-bold text-slate-500">Hoàn thành</span>
              </div>
            </div>

            {/* Legend & Details */}
            <div className="space-y-3 text-xs w-full max-w-[200px]">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between font-bold text-slate-800">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-900"></span>
                    Đã hoàn thành:
                  </span>
                  <span>{totalCompletedAssignments}</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">Số lượt nộp đúng yêu cầu</div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between font-bold text-slate-800">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span>
                    Chưa nộp:
                  </span>
                  <span>{totalPossibleAssignments - totalCompletedAssignments}</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">Cần thầy nhắc nhở thêm</div>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Grid biểu đồ hàng 2: Phân bố xếp loại & Kế hoạch bài dạy */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Phân bố xếp loại học lực */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-600" />
            <h3 className="text-base font-bold text-slate-900 font-serif-literary">
              Phân bố xếp loại học sinh
            </h3>
          </div>

          <div className="space-y-3.5 pt-2">
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  Học lực Giỏi
                </span>
                <span>{gradeDistribution.gioi} em ({Math.round((gradeDistribution.gioi / totalStudents) * 100)}%)</span>
              </div>
              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-600 rounded-full"
                  style={{ width: `${(gradeDistribution.gioi / totalStudents) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                  Học lực Khá
                </span>
                <span>{gradeDistribution.kha} em ({Math.round((gradeDistribution.kha / totalStudents) * 100)}%)</span>
              </div>
              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full"
                  style={{ width: `${(gradeDistribution.kha / totalStudents) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  Học lực Đạt
                </span>
                <span>{gradeDistribution.dat} em ({Math.round((gradeDistribution.dat / totalStudents) * 100)}%)</span>
              </div>
              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: `${(gradeDistribution.dat / totalStudents) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                  Cần cố gắng
                </span>
                <span>{gradeDistribution.canCoGang} em ({Math.round((gradeDistribution.canCoGang / totalStudents) * 100)}%)</span>
              </div>
              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-rose-500 rounded-full"
                  style={{ width: `${(gradeDistribution.canCoGang / totalStudents) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tiến độ bài dạy & Tình trạng bài tập */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-700" />
            <h3 className="text-base font-bold text-slate-900 font-serif-literary">
              Tiến độ bài học & Tình trạng bài tập
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200">
              <div className="text-2xl font-bold text-emerald-800 font-serif-literary">
                {lessonStats.completed} / {lessonStats.total}
              </div>
              <div className="text-xs font-semibold text-emerald-950 mt-1">Bài học đã hoàn thành</div>
              <div className="text-[11px] text-emerald-700 mt-0.5">
                {Math.round((lessonStats.completed / lessonStats.total) * 100)}% chương trình
              </div>
            </div>

            <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200">
              <div className="text-2xl font-bold text-amber-800 font-serif-literary">
                {lessonStats.inProgress}
              </div>
              <div className="text-xs font-semibold text-amber-950 mt-1">Bài đang thực hiện</div>
              <div className="text-[11px] text-amber-700 mt-0.5">Đang giảng trên lớp</div>
            </div>

            <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-200">
              <div className="text-2xl font-bold text-blue-900 font-serif-literary">
                {assignmentsStats.good}
              </div>
              <div className="text-xs font-semibold text-blue-950 mt-1">Bài tập nộp tốt</div>
              <div className="text-[11px] text-blue-700 mt-0.5">Học sinh hoàn thành đúng hạn</div>
            </div>

            <div className="p-4 bg-rose-50/60 rounded-xl border border-rose-200">
              <div className="text-2xl font-bold text-rose-800 font-serif-literary">
                {assignmentsStats.upcoming + assignmentsStats.overdue}
              </div>
              <div className="text-xs font-semibold text-rose-950 mt-1">Bài tập cần đôn đốc</div>
              <div className="text-[11px] text-rose-700 mt-0.5">Sắp đến hạn hoặc quá hạn</div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
