// Cấu trúc dữ liệu cho Web App Quản Trị Học Tập Ngữ Văn - Thầy Nguyễn Quang Kiên

export interface TeacherProfile {
  name: string;
  role: string;
  subject: string;
  school: string;
  email: string;
  academicYear: string;
}

export interface ClassItem {
  id: string;
  name: string; // ví dụ: "6A1", "7A1", "8A1", "9A1"
  grade: number; // 6, 7, 8, 9
  studentCount: number;
  room: string; // Phòng học
  note: string;
}

export interface Student {
  id: string;
  name: string;
  classId: string;
  gender: 'Nam' | 'Nữ';
  dob: string;
  // Điểm số môn Ngữ văn
  regularScore1?: number; // Điểm thường xuyên 1 (miệng / 15p)
  regularScore2?: number; // Điểm thường xuyên 2
  regularScore3?: number; // Điểm thường xuyên 3
  midtermScore?: number;  // Điểm giữa kỳ
  finalScore?: number;    // Điểm cuối kỳ
  // Tình trạng học tập
  completedAssignments: number;
  totalAssignments: number;
  status: 'Giỏi' | 'Khá' | 'Đạt' | 'Cần cố gắng';
  note: string;
}

export interface Lesson {
  id: string;
  title: string;
  grade: number; // 6, 7, 8, 9
  classIds: string[]; // Các lớp áp dụng
  topic: 'Đọc hiểu văn bản' | 'Thực hành Tiếng Việt' | 'Viết bài văn' | 'Nói và nghe' | 'Ôn tập & Đánh giá';
  durationPeriods: number; // Số tiết
  objectives: string; // Mục tiêu cần đạt
  notes: string; // Ghi chú chuẩn bị / đồ dùng dạy học
  status: 'Chưa dạy' | 'Đang thực hiện' | 'Đã hoàn thành';
}

export interface Assignment {
  id: string;
  title: string;
  classId: string;
  className: string;
  content: string; // Nội dung bài tập
  assignedDate: string; // YYYY-MM-DD
  dueDate: string;      // YYYY-MM-DD
  completedCount: number;
  totalCount: number;
  status: 'Hoàn thành tốt' | 'Sắp đến hạn' | 'Quá hạn';
}

export interface TeacherNote {
  id: string;
  title: string;
  content: string;
  date: string;
  relatedClassId: string;
  relatedClassName: string;
  priority: 'Cao' | 'Trung bình' | 'Thấp';
  isImportant: boolean;
}

export interface AppData {
  teacher: TeacherProfile;
  classes: ClassItem[];
  students: Student[];
  lessons: Lesson[];
  assignments: Assignment[];
  notes: TeacherNote[];
  lastUpdated: string;
}

export type ActiveTab = 
  | 'dashboard' 
  | 'classes' 
  | 'students' 
  | 'lessons' 
  | 'assignments' 
  | 'grades' 
  | 'stats' 
  | 'notes' 
  | 'settings';

export type TabType = ActiveTab;
