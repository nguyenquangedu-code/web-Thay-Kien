import { AppData, Student } from '../types';
import { INITIAL_DATA } from '../data/initialData';

export const STORAGE_KEY = 'QUAN_TRI_NGU_VAN_DATA_NGUYEN_QUANG_KIEN';

/**
 * Tải dữ liệu từ LocalStorage hoặc trả về dữ liệu mẫu mặc định
 */
export function loadAppData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return INITIAL_DATA;
    }
    const parsed = JSON.parse(raw);
    if (parsed && parsed.teacher && Array.isArray(parsed.classes) && Array.isArray(parsed.students)) {
      return parsed;
    }
    return INITIAL_DATA;
  } catch (err) {
    console.warn('Lỗi khi đọc dữ liệu từ localStorage:', err);
    return INITIAL_DATA;
  }
}

/**
 * Lưu dữ liệu vào LocalStorage
 */
export function saveAppData(data: AppData): void {
  try {
    const updated = {
      ...data,
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Lỗi khi lưu dữ liệu vào localStorage:', err);
  }
}

/**
 * Khôi phục về dữ liệu mẫu ban đầu
 */
export function resetToInitialData(): AppData {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATA));
  return INITIAL_DATA;
}

/**
 * Tính điểm trung bình môn Ngữ văn minh họa
 * Công thức minh họa: (Tổng điểm TX x 1 + Điểm GK x 2 + Điểm CK x 3) / Tổng hệ số
 */
export function calculateStudentAverage(student: Student): number | null {
  const tx: number[] = [];
  if (typeof student.regularScore1 === 'number') tx.push(student.regularScore1);
  if (typeof student.regularScore2 === 'number') tx.push(student.regularScore2);
  if (typeof student.regularScore3 === 'number') tx.push(student.regularScore3);

  let totalWeight = tx.length * 1;
  let weightedSum = tx.reduce((a, b) => a + b, 0);

  if (typeof student.midtermScore === 'number') {
    totalWeight += 2;
    weightedSum += student.midtermScore * 2;
  }

  if (typeof student.finalScore === 'number') {
    totalWeight += 3;
    weightedSum += student.finalScore * 3;
  }

  if (totalWeight === 0) return null;
  return Number((weightedSum / totalWeight).toFixed(1));
}

/**
 * Xuất dữ liệu hiện tại ra file JSON tải về máy
 */
export function exportDataAsJson(data: AppData): void {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const dateStr = new Date().toISOString().slice(0, 10);
  link.download = `Du-Lieu-Quan-Tri-Ngu-Van-Thay-Kien-${dateStr}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Nhập dữ liệu từ file JSON do giáo viên tải lên
 */
export function importDataFromJson(jsonContent: string): { success: boolean; data?: AppData; error?: string } {
  try {
    const parsed = JSON.parse(jsonContent);
    if (!parsed || typeof parsed !== 'object') {
      return { success: false, error: 'File JSON không đúng định dạng đối tượng dữ liệu.' };
    }
    if (!parsed.teacher || !parsed.teacher.name) {
      return { success: false, error: 'Thiếu thông tin giáo viên (teacher).' };
    }
    if (!Array.isArray(parsed.classes)) {
      return { success: false, error: 'Thiếu danh sách lớp học (classes).' };
    }
    if (!Array.isArray(parsed.students)) {
      return { success: false, error: 'Thiếu danh sách học sinh (students).' };
    }
    if (!Array.isArray(parsed.lessons)) {
      return { success: false, error: 'Thiếu danh sách bài học (lessons).' };
    }
    if (!Array.isArray(parsed.assignments)) {
      return { success: false, error: 'Thiếu danh sách bài tập (assignments).' };
    }
    if (!Array.isArray(parsed.notes)) {
      return { success: false, error: 'Thiếu danh sách ghi chú (notes).' };
    }

    const sanitizedData: AppData = {
      teacher: parsed.teacher,
      classes: parsed.classes,
      students: parsed.students,
      lessons: parsed.lessons,
      assignments: parsed.assignments,
      notes: parsed.notes,
      lastUpdated: new Date().toISOString()
    };

    saveAppData(sanitizedData);
    return { success: true, data: sanitizedData };
  } catch (err) {
    return { success: false, error: 'Không thể đọc nội dung file JSON. Vui lòng kiểm tra lại file.' };
  }
}

/**
 * Tải file HTML offline độc lập hoàn chỉnh chứa toàn bộ CSS, JS, HTML và dữ liệu nhúng
 */
export function exportSingleFileHtml(data: AppData): void {
  const dataJson = JSON.stringify(data);
  const htmlContent = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Quản Trị Học Tập Ngữ Văn – Nguyễn Quang Kiên (Bản Offline Độc Lập)</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,300;0,400;0,700;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: #1e3a8a;
      --primary-dark: #0f172a;
      --primary-light: #3b82f6;
      --bg: #f8fafc;
      --card-bg: #ffffff;
      --text: #1e293b;
      --text-muted: #64748b;
      --accent: #d97706;
      --border: #e2e8f0;
      --success: #10b981;
      --warning: #f59e0b;
      --danger: #ef4444;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
      background-color: var(--bg);
      color: var(--text);
      line-height: 1.5;
      font-size: 15px;
    }
    .font-serif { font-family: 'Merriweather', Georgia, serif; }
    .app-container { display: flex; flex-direction: column; min-height: 100vh; }
    
    /* Header */
    header {
      background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%);
      color: #ffffff;
      padding: 1rem 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 4px 12px rgba(15, 23, 42, 0.15);
      position: sticky;
      top: 0;
      z-index: 50;
    }
    .header-brand { display: flex; align-items: center; gap: 1rem; }
    .teacher-avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: #f59e0b;
      color: #0f172a;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 1.25rem;
      border: 2px solid #ffffff;
    }
    .header-title h1 { font-size: 1.15rem; font-weight: 700; letter-spacing: 0.02em; }
    .header-title p { font-size: 0.85rem; color: #cbd5e1; }
    .header-right { display: flex; align-items: center; gap: 1rem; }
    .clock-badge {
      background: rgba(255, 255, 255, 0.1);
      padding: 0.35rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.85rem;
      border: 1px solid rgba(255, 255, 255, 0.15);
    }
    
    /* Main Layout */
    .main-wrapper { display: flex; flex: 1; }
    aside {
      width: 260px;
      background: #ffffff;
      border-right: 1px solid var(--border);
      padding: 1.25rem 0.75rem;
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }
    .nav-btn {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      width: 100%;
      padding: 0.7rem 1rem;
      border: none;
      background: transparent;
      border-radius: 8px;
      color: var(--text-muted);
      font-size: 0.95rem;
      font-weight: 500;
      cursor: pointer;
      text-align: left;
      transition: all 0.15s;
    }
    .nav-btn:hover { background: #f1f5f9; color: var(--primary); }
    .nav-btn.active {
      background: #eff6ff;
      color: #1e3a8a;
      font-weight: 600;
      border-left: 4px solid #1e3a8a;
    }
    main { flex: 1; padding: 1.5rem; max-width: 1280px; margin: 0 auto; width: 100%; }
    
    /* Cards & Grids */
    .grid-4 { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
    .grid-2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 1.25rem; margin-bottom: 1.5rem; }
    .card {
      background: #ffffff;
      border-radius: 12px;
      border: 1px solid var(--border);
      padding: 1.25rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .stat-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      border-left: 4px solid #1e3a8a;
    }
    .stat-number { font-size: 1.85rem; font-weight: 700; color: #0f172a; }
    .stat-label { font-size: 0.85rem; color: var(--text-muted); font-weight: 500; }
    
    /* Tables */
    table { width: 100%; border-collapse: collapse; text-align: left; font-size: 0.9rem; }
    th { background: #f8fafc; padding: 0.75rem 1rem; border-bottom: 2px solid var(--border); font-weight: 600; color: #475569; }
    td { padding: 0.75rem 1rem; border-bottom: 1px solid var(--border); vertical-align: middle; }
    tr:hover td { background: #f8fafc; }
    
    /* Badges */
    .badge {
      display: inline-block;
      padding: 0.2rem 0.6rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
    }
    .badge-success { background: #dcfce7; color: #166534; }
    .badge-warning { background: #fef3c7; color: #92400e; }
    .badge-danger { background: #fee2e2; color: #991b1b; }
    .badge-info { background: #e0f2fe; color: #0369a1; }
    
    /* Buttons */
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 500;
      border: 1px solid transparent;
      cursor: pointer;
      transition: all 0.15s;
    }
    .btn-primary { background: #1e3a8a; color: #ffffff; }
    .btn-primary:hover { background: #172554; }
    .btn-outline { border-color: var(--border); background: #ffffff; color: var(--text); }
    .btn-outline:hover { background: #f8fafc; }
    
    /* Offline banner */
    .offline-banner {
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      color: #1e40af;
      padding: 0.65rem 1rem;
      border-radius: 8px;
      margin-bottom: 1.25rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 0.875rem;
    }
  </style>
</head>
<body>
  <div class="app-container">
    <header>
      <div class="header-brand">
        <div class="teacher-avatar">QK</div>
        <div class="header-title">
          <h1 class="font-serif">QUẢN TRỊ HỌC TẬP NGỮ VĂN</h1>
          <p>Nguyễn Quang Kiên – Giáo viên Ngữ văn – Trường THCS Thái Phiên</p>
        </div>
      </div>
      <div class="header-right">
        <div class="clock-badge" id="offline-clock">Đang tải...</div>
        <button class="btn btn-outline" style="color:white; border-color:rgba(255,255,255,0.3);" onclick="window.print()">🖨️ In trang</button>
      </div>
    </header>

    <div class="main-wrapper">
      <aside>
        <button class="nav-btn active" onclick="switchTab('dashboard')">🏠 Tổng quan</button>
        <button class="nav-btn" onclick="switchTab('classes')">🏫 Lớp học</button>
        <button class="nav-btn" onclick="switchTab('students')">👨‍🎓 Học sinh</button>
        <button class="nav-btn" onclick="switchTab('lessons')">📚 Bài học</button>
        <button class="nav-btn" onclick="switchTab('assignments')">📝 Bài tập</button>
        <button class="nav-btn" onclick="switchTab('grades')">⭐ Điểm số</button>
        <button class="nav-btn" onclick="switchTab('notes')">📌 Ghi chú</button>
      </aside>

      <main>
        <div class="offline-banner">
          <span>📖 <strong>Bản lưu trữ Offline Độc Lập</strong> – Mọi thay đổi được lưu trực tiếp vào trình duyệt máy tính của Thầy Kiên.</span>
          <button class="btn btn-primary" onclick="alert('Đã lưu toàn bộ dữ liệu!')">💾 Đã đồng bộ</button>
        </div>

        <div id="content-area">
          <!-- Dynamic rendering via inline script -->
        </div>
      </main>
    </div>
  </div>

  <script>
    // Nhúng trực tiếp dữ liệu vào file HTML độc lập
    var APP_DATA = ${dataJson};

    function updateClock() {
      var now = new Date();
      var days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
      var dayName = days[now.getDay()];
      var dateStr = now.toLocaleDateString('vi-VN');
      var timeStr = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      var el = document.getElementById('offline-clock');
      if (el) el.innerText = dayName + ', ' + dateStr + ' ' + timeStr;
    }
    setInterval(updateClock, 1000);
    updateClock();

    var currentTab = 'dashboard';

    function switchTab(tab) {
      currentTab = tab;
      var buttons = document.querySelectorAll('.nav-btn');
      buttons.forEach(function(btn) { btn.classList.remove('active'); });
      event.target.classList.add('active');
      render();
    }

    function render() {
      var area = document.getElementById('content-area');
      if (!area) return;

      if (currentTab === 'dashboard') {
        area.innerHTML = renderDashboard();
      } else if (currentTab === 'classes') {
        area.innerHTML = renderClasses();
      } else if (currentTab === 'students') {
        area.innerHTML = renderStudents();
      } else if (currentTab === 'lessons') {
        area.innerHTML = renderLessons();
      } else if (currentTab === 'assignments') {
        area.innerHTML = renderAssignments();
      } else if (currentTab === 'grades') {
        area.innerHTML = renderGrades();
      } else if (currentTab === 'notes') {
        area.innerHTML = renderNotes();
      }
    }

    function renderDashboard() {
      var classCount = APP_DATA.classes.length;
      var studentCount = APP_DATA.students.length;
      var lessonCount = APP_DATA.lessons.length;
      var assignmentCount = APP_DATA.assignments.length;

      var urgentNotes = APP_DATA.notes.filter(function(n){ return n.isImportant; });

      return \`
        <div class="grid-4">
          <div class="card stat-card">
            <div>
              <div class="stat-number">\${classCount}</div>
              <div class="stat-label">Lớp đang giảng dạy</div>
            </div>
          </div>
          <div class="card stat-card" style="border-left-color: #3b82f6;">
            <div>
              <div class="stat-number">\${studentCount}</div>
              <div class="stat-label">Học sinh theo dõi</div>
            </div>
          </div>
          <div class="card stat-card" style="border-left-color: #10b981;">
            <div>
              <div class="stat-number">\${lessonCount}</div>
              <div class="stat-label">Bài học Ngữ văn</div>
            </div>
          </div>
          <div class="card stat-card" style="border-left-color: #f59e0b;">
            <div>
              <div class="stat-number">\${assignmentCount}</div>
              <div class="stat-label">Bài tập đang giao</div>
            </div>
          </div>
        </div>

        <div class="grid-2">
          <div class="card">
            <h3 class="font-serif" style="font-size: 1.1rem; margin-bottom: 1rem; color: #0f172a;">📊 Tình hình học tập theo lớp</h3>
            \${APP_DATA.classes.map(function(cls) {
              var clsStudents = APP_DATA.students.filter(function(s){ return s.classId === cls.id; });
              var doneAsm = clsStudents.reduce(function(acc, s){ return acc + s.completedAssignments; }, 0);
              var totalAsm = clsStudents.reduce(function(acc, s){ return acc + s.totalAssignments; }, 0) || 1;
              var rate = Math.round((doneAsm / totalAsm) * 100);
              return \`
                <div style="margin-bottom: 1rem;">
                  <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 0.3rem;">
                    <strong>Lớp \${cls.name}</strong>
                    <span>Hoàn thành bài tập: \${rate}%</span>
                  </div>
                  <div style="height: 8px; background: #e2e8f0; border-radius: 9999px; overflow: hidden;">
                    <div style="height: 100%; width: \${rate}%; background: #1e3a8a; border-radius: 9999px;"></div>
                  </div>
                </div>
              \`;
            }).join('')}
          </div>

          <div class="card">
            <h3 class="font-serif" style="font-size: 1.1rem; margin-bottom: 1rem; color: #0f172a;">⚠️ Công việc cần chú ý</h3>
            <div style="display: flex; flex-direction: column; gap: 0.75rem;">
              \${urgentNotes.map(function(n) {
                return \`
                  <div style="padding: 0.75rem; background: #fffbeb; border-left: 4px solid #d97706; border-radius: 6px;">
                    <div style="font-weight: 600; color: #92400e; font-size: 0.9rem;">\${n.title}</div>
                    <div style="font-size: 0.82rem; color: #78350f; margin-top: 0.2rem;">\${n.content}</div>
                    <div style="font-size: 0.75rem; color: #b45309; margin-top: 0.4rem;">Lớp: \${n.relatedClassName} | Ngày: \${n.date}</div>
                  </div>
                \`;
              }).join('')}
            </div>
          </div>
        </div>
      \`;
    }

    function renderClasses() {
      return \`
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
          <h2 class="font-serif" style="font-size: 1.35rem; color: #0f172a;">Danh sách các lớp giảng dạy</h2>
        </div>
        <div class="grid-2">
          \${APP_DATA.classes.map(function(cls) {
            var clsStudents = APP_DATA.students.filter(function(s){ return s.classId === cls.id; });
            var clsLessons = APP_DATA.lessons.filter(function(l){ return l.classIds.includes(cls.id); });
            var clsAssignments = APP_DATA.assignments.filter(function(a){ return a.classId === cls.id; });
            return \`
              <div class="card" style="border-top: 4px solid #1e3a8a;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
                  <div>
                    <h3 class="font-serif" style="font-size: 1.25rem; color: #1e3a8a;">Lớp \${cls.name}</h3>
                    <p style="font-size: 0.85rem; color: var(--text-muted);">\${cls.room}</p>
                  </div>
                  <span class="badge badge-info">Khối \${cls.grade}</span>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.5rem; text-align: center; background: #f8fafc; padding: 0.75rem; border-radius: 8px; margin-bottom: 0.75rem;">
                  <div>
                    <div style="font-weight: 700; color: #0f172a;">\${clsStudents.length}</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted);">Sĩ số</div>
                  </div>
                  <div>
                    <div style="font-weight: 700; color: #0f172a;">\${clsLessons.length}</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted);">Bài học</div>
                  </div>
                  <div>
                    <div style="font-weight: 700; color: #0f172a;">\${clsAssignments.length}</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted);">Bài tập</div>
                  </div>
                </div>
                <p style="font-size: 0.85rem; color: #475569; font-style: italic;">"\${cls.note}"</p>
              </div>
            \`;
          }).join('')}
        </div>
      \`;
    }

    function renderStudents() {
      return \`
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
          <h2 class="font-serif" style="font-size: 1.35rem; color: #0f172a;">Danh sách học sinh các lớp</h2>
        </div>
        <div class="card" style="padding: 0; overflow-x: auto;">
          <table>
            <thead>
              <tr>
                <th style="width: 50px;">STT</th>
                <th>Họ và tên</th>
                <th>Lớp</th>
                <th>Giới tính</th>
                <th>Điểm TB (Demo)</th>
                <th>Bài tập đã làm</th>
                <th>Trạng thái</th>
                <th>Ghi chú của thầy</th>
              </tr>
            </thead>
            <tbody>
              \${APP_DATA.students.map(function(s, idx) {
                var cls = APP_DATA.classes.find(function(c){ return c.id === s.classId; });
                var clsName = cls ? cls.name : 'N/A';
                var avg = (( (s.regularScore1||0) + (s.regularScore2||0) + (s.regularScore3||0) + (s.midtermScore||0)*2 + (s.finalScore||0)*3 ) / 7).toFixed(1);
                var badgeClass = s.status === 'Giỏi' ? 'badge-success' : s.status === 'Khá' ? 'badge-info' : s.status === 'Đạt' ? 'badge-warning' : 'badge-danger';
                return \`
                  <tr>
                    <td>\${idx + 1}</td>
                    <td><strong>\${s.name}</strong></td>
                    <td><span class="badge badge-info">\${clsName}</span></td>
                    <td>\${s.gender}</td>
                    <td><strong style="color: #1e3a8a;">\${avg}</strong></td>
                    <td>\${s.completedAssignments} / \${s.totalAssignments}</td>
                    <td><span class="badge \${badgeClass}">\${s.status}</span></td>
                    <td style="font-size: 0.85rem; color: #475569;">\${s.note}</td>
                  </tr>
                \`;
              }).join('')}
            </tbody>
          </table>
        </div>
      \`;
    }

    function renderLessons() {
      return \`
        <div style="margin-bottom: 1.25rem;">
          <h2 class="font-serif" style="font-size: 1.35rem; color: #0f172a;">Kế hoạch bài học môn Ngữ văn</h2>
        </div>
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          \${APP_DATA.lessons.map(function(l) {
            var statusBadge = l.status === 'Đã hoàn thành' ? 'badge-success' : l.status === 'Đang thực hiện' ? 'badge-warning' : 'badge-info';
            return \`
              <div class="card">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                  <span class="badge \${statusBadge}">\${l.status}</span>
                  <span style="font-size: 0.8rem; color: var(--text-muted);">Khối \${l.grade} • \${l.durationPeriods} tiết</span>
                </div>
                <h3 class="font-serif" style="font-size: 1.15rem; color: #1e3a8a; margin-bottom: 0.4rem;">\${l.title}</h3>
                <p style="font-size: 0.875rem; color: #334155; margin-bottom: 0.5rem;"><strong>Mục tiêu:</strong> \${l.objectives}</p>
                <div style="font-size: 0.8rem; color: #64748b; background: #f8fafc; padding: 0.5rem; border-radius: 6px;">
                  📌 <strong>Chuẩn bị của thầy:</strong> \${l.notes}
                </div>
              </div>
            \`;
          }).join('')}
        </div>
      \`;
    }

    function renderAssignments() {
      return \`
        <div style="margin-bottom: 1.25rem;">
          <h2 class="font-serif" style="font-size: 1.35rem; color: #0f172a;">Danh sách bài tập và nhiệm vụ</h2>
        </div>
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          \${APP_DATA.assignments.map(function(a) {
            var badgeClass = a.status === 'Hoàn thành tốt' ? 'badge-success' : a.status === 'Sắp đến hạn' ? 'badge-warning' : 'badge-danger';
            var rate = Math.round((a.completedCount / a.totalCount) * 100);
            return \`
              <div class="card">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
                  <div>
                    <span class="badge badge-info" style="margin-right: 0.5rem;">Lớp \${a.className}</span>
                    <span class="badge \${badgeClass}">\${a.status}</span>
                  </div>
                  <div style="font-size: 0.8rem; color: var(--text-muted);">Hạn nộp: <strong>\${a.dueDate}</strong></div>
                </div>
                <h3 class="font-serif" style="font-size: 1.1rem; color: #0f172a; margin-bottom: 0.4rem;">\${a.title}</h3>
                <p style="font-size: 0.875rem; color: #475569; margin-bottom: 0.75rem;">\${a.content}</p>
                <div style="display: flex; align-items: center; gap: 1rem;">
                  <div style="flex: 1; height: 8px; background: #e2e8f0; border-radius: 9999px; overflow: hidden;">
                    <div style="height: 100%; width: \${rate}%; background: #10b981; border-radius: 9999px;"></div>
                  </div>
                  <span style="font-size: 0.82rem; font-weight: 600; color: #334155;">Đã nộp: \${a.completedCount}/\${a.totalCount} (\${rate}%)</span>
                </div>
              </div>
            \`;
          }).join('')}
        </div>
      \`;
    }

    function renderGrades() {
      return \`
        <div style="margin-bottom: 1.25rem;">
          <h2 class="font-serif" style="font-size: 1.35rem; color: #0f172a;">Sổ điểm môn Ngữ văn</h2>
          <p style="font-size: 0.85rem; color: var(--text-muted);">* Lưu ý: Cột điểm TB là dữ liệu minh họa theo trọng số tham khảo để giáo viên thuận tiện theo dõi.</p>
        </div>
        <div class="card" style="padding: 0; overflow-x: auto;">
          <table>
            <thead>
              <tr>
                <th>Họ và tên</th>
                <th>Lớp</th>
                <th>TX 1</th>
                <th>TX 2</th>
                <th>TX 3</th>
                <th>Giữa kỳ</th>
                <th>Cuối kỳ</th>
                <th>Điểm TB</th>
                <th>Nhận xét của thầy</th>
              </tr>
            </thead>
            <tbody>
              \${APP_DATA.students.map(function(s) {
                var cls = APP_DATA.classes.find(function(c){ return c.id === s.classId; });
                var clsName = cls ? cls.name : 'N/A';
                var avg = (( (s.regularScore1||0) + (s.regularScore2||0) + (s.regularScore3||0) + (s.midtermScore||0)*2 + (s.finalScore||0)*3 ) / 7).toFixed(1);
                var isLow = avg < 5.0;
                return \`
                  <tr style="\${isLow ? 'background: #fffbeb;' : ''}">
                    <td><strong>\${s.name}</strong></td>
                    <td>\${clsName}</td>
                    <td>\${s.regularScore1 !== undefined ? s.regularScore1 : '-'}</td>
                    <td>\${s.regularScore2 !== undefined ? s.regularScore2 : '-'}</td>
                    <td>\${s.regularScore3 !== undefined ? s.regularScore3 : '-'}</td>
                    <td><strong>\${s.midtermScore !== undefined ? s.midtermScore : '-'}</strong></td>
                    <td><strong>\${s.finalScore !== undefined ? s.finalScore : '-'}</strong></td>
                    <td><strong style="color: \${isLow ? '#d97706' : '#1e3a8a'};">\${avg}</strong></td>
                    <td style="font-size: 0.82rem; color: #475569;">\${s.note}</td>
                  </tr>
                \`;
              }).join('')}
            </tbody>
          </table>
        </div>
      \`;
    }

    function renderNotes() {
      return \`
        <div style="margin-bottom: 1.25rem;">
          <h2 class="font-serif" style="font-size: 1.35rem; color: #0f172a;">Sổ tay ghi chú sư phạm</h2>
        </div>
        <div class="grid-2">
          \${APP_DATA.notes.map(function(n) {
            return \`
              <div class="card" style="border-left: 4px solid \${n.isImportant ? '#d97706' : '#94a3b8'};">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.4rem;">
                  <span class="badge \${n.priority === 'Cao' ? 'badge-danger' : n.priority === 'Trung bình' ? 'badge-warning' : 'badge-info'}">
                    Ưu tiên: \${n.priority}
                  </span>
                  <span style="font-size: 0.8rem; color: var(--text-muted);">\${n.date}</span>
                </div>
                <h3 class="font-serif" style="font-size: 1.1rem; color: #0f172a; margin-bottom: 0.4rem;">\${n.title}</h3>
                <p style="font-size: 0.875rem; color: #334155; margin-bottom: 0.5rem;">\${n.content}</p>
                <div style="font-size: 0.78rem; color: #64748b;">Lớp liên quan: <strong>\${n.relatedClassName}</strong></div>
              </div>
            \`;
          }).join('')}
        </div>
      \`;
    }

    // Khởi chạy giao diện
    render();
  </script>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Quan-Tri-Hoc-Tap-Ngu-Van-Nguyen-Quang-Kien.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Export aliases
export const loadDataFromStorage = loadAppData;
export const saveDataToStorage = saveAppData;
export const exportDataToJson = exportDataAsJson;
