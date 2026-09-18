// ============================================================================
// DỮ LIỆU MINH HỌA MẪU MÔN NGỮ VĂN – DÀNH CHO GIÁO VIÊN NGUYỄN QUANG KIÊN
// TRƯỜNG THCS THÁI PHIÊN
// ============================================================================
// Thầy Kiên có thể dễ dàng thay đổi các thông tin này trong giao diện
// hoặc trực tiếp tại file này khi cần thiết.
// ============================================================================

import { AppData } from '../types';

export const INITIAL_DATA: AppData = {
  teacher: {
    name: "Nguyễn Quang Kiên",
    role: "Giáo viên Ngữ văn",
    subject: "Ngữ văn",
    school: "Trường THCS Thái Phiên",
    email: "nguyenquang.edu@gmail.com",
    academicYear: "2025 - 2026"
  },
  classes: [
    {
      id: "cls-6a1",
      name: "6A1",
      grade: 6,
      studentCount: 38,
      room: "Phòng 101 - Dãy A",
      note: "Lớp sôi nổi, hào hứng với các hoạt động kể chuyện và đóng kịch văn học."
    },
    {
      id: "cls-7a1",
      name: "7A1",
      grade: 7,
      studentCount: 36,
      room: "Phòng 203 - Dãy B",
      note: "Lớp học đều, có nhiều học sinh viết cảm thụ văn học tốt."
    },
    {
      id: "cls-8a1",
      name: "8A1",
      grade: 8,
      studentCount: 40,
      room: "Phòng 302 - Dãy C",
      note: "Cần tăng cường rèn luyện kỹ năng viết đoạn văn nghị luận xã hội."
    },
    {
      id: "cls-9a1",
      name: "9A1",
      grade: 9,
      studentCount: 35,
      room: "Phòng 401 - Dãy C",
      note: "Khối 9 trọng điểm ôn thi vào lớp 10, học sinh có ý thức tự học cao."
    }
  ],
  students: [
    {
      id: "std-01",
      name: "Nguyễn Hoàng Nam",
      classId: "cls-6a1",
      gender: "Nam",
      dob: "2013-05-14",
      regularScore1: 8.5,
      regularScore2: 9.0,
      regularScore3: 8.0,
      midtermScore: 8.5,
      finalScore: 8.8,
      completedAssignments: 5,
      totalAssignments: 5,
      status: "Giỏi",
      note: "Phát biểu xây dựng bài tích cực, lời văn giàu cảm xúc."
    },
    {
      id: "std-02",
      name: "Trần Thị Mai Phương",
      classId: "cls-6a1",
      gender: "Nữ",
      dob: "2013-08-22",
      regularScore1: 9.0,
      regularScore2: 9.5,
      regularScore3: 9.0,
      midtermScore: 9.2,
      finalScore: 9.5,
      completedAssignments: 5,
      totalAssignments: 5,
      status: "Giỏi",
      note: "Chữ viết rất đẹp, bài văn miêu tả sâu sắc, đọc diễn cảm tốt."
    },
    {
      id: "std-03",
      name: "Lê Quốc Bảo",
      classId: "cls-6a1",
      gender: "Nam",
      dob: "2013-11-03",
      regularScore1: 6.0,
      regularScore2: 6.5,
      regularScore3: 5.5,
      midtermScore: 6.0,
      finalScore: 6.5,
      completedAssignments: 3,
      totalAssignments: 5,
      status: "Đạt",
      note: "Cần chú ý lỗi chính tả và quy tắc đặt câu trong bài viết."
    },
    {
      id: "std-04",
      name: "Phạm Quỳnh Nga",
      classId: "cls-7a1",
      gender: "Nữ",
      dob: "2012-02-18",
      regularScore1: 8.0,
      regularScore2: 8.5,
      regularScore3: 8.0,
      midtermScore: 8.0,
      finalScore: 8.5,
      completedAssignments: 5,
      totalAssignments: 5,
      status: "Giỏi",
      note: "Hiểu bài nhanh, năng khiếu phân tích hình ảnh tu từ."
    },
    {
      id: "std-05",
      name: "Vũ Đức Minh",
      classId: "cls-7a1",
      gender: "Nam",
      dob: "2012-07-09",
      regularScore1: 7.0,
      regularScore2: 7.5,
      regularScore3: 6.5,
      midtermScore: 7.0,
      finalScore: 7.5,
      completedAssignments: 4,
      totalAssignments: 5,
      status: "Khá",
      note: "Nắm vững ngữ pháp tiếng Việt, bài làm văn cần mở rộng vốn từ."
    },
    {
      id: "std-06",
      name: "Đỗ Thùy Linh",
      classId: "cls-7a1",
      gender: "Nữ",
      dob: "2012-10-30",
      regularScore1: 5.0,
      regularScore2: 4.5,
      regularScore3: 5.5,
      midtermScore: 4.8,
      finalScore: 5.2,
      completedAssignments: 2,
      totalAssignments: 5,
      status: "Cần cố gắng",
      note: "Còn rụt rè khi đọc bài, chưa hoàn thành bài tập về nhà đầy đủ."
    },
    {
      id: "std-07",
      name: "Hoàng Minh Đức",
      classId: "cls-8a1",
      gender: "Nam",
      dob: "2011-04-12",
      regularScore1: 8.5,
      regularScore2: 8.0,
      regularScore3: 9.0,
      midtermScore: 8.5,
      finalScore: 8.5,
      completedAssignments: 5,
      totalAssignments: 5,
      status: "Giỏi",
      note: "Khả năng lập luận chắc chắn, cảm thụ thơ ca cách mạng sâu sắc."
    },
    {
      id: "std-08",
      name: "Bùi Thanh Hằng",
      classId: "cls-8a1",
      gender: "Nữ",
      dob: "2011-09-25",
      regularScore1: 7.5,
      regularScore2: 7.0,
      regularScore3: 8.0,
      midtermScore: 7.5,
      finalScore: 7.8,
      completedAssignments: 5,
      totalAssignments: 5,
      status: "Khá",
      note: "Chăm chỉ, chịu khó ghi chép bài đầy đủ và cẩn thận."
    },
    {
      id: "std-09",
      name: "Đặng Quang Huy",
      classId: "cls-8a1",
      gender: "Nam",
      dob: "2011-12-19",
      regularScore1: 6.5,
      regularScore2: 6.0,
      regularScore3: 5.5,
      midtermScore: 6.0,
      finalScore: 6.2,
      completedAssignments: 3,
      totalAssignments: 5,
      status: "Đạt",
      note: "Cần rèn luyện cách liên kết câu và đoạn văn nghị luận."
    },
    {
      id: "std-10",
      name: "Ngô Ngọc Ánh",
      classId: "cls-9a1",
      gender: "Nữ",
      dob: "2010-01-15",
      regularScore1: 9.0,
      regularScore2: 9.0,
      regularScore3: 9.5,
      midtermScore: 9.0,
      finalScore: 9.2,
      completedAssignments: 5,
      totalAssignments: 5,
      status: "Giỏi",
      note: "Học sinh giỏi cấp trường, văn phong trong sáng, tư duy phân tích nhạy bén."
    },
    {
      id: "std-11",
      name: "Phan Gia Bảo",
      classId: "cls-9a1",
      gender: "Nam",
      dob: "2010-06-20",
      regularScore1: 7.5,
      regularScore2: 8.0,
      regularScore3: 7.0,
      midtermScore: 7.8,
      finalScore: 8.0,
      completedAssignments: 4,
      totalAssignments: 5,
      status: "Khá",
      note: "Có tiến bộ rõ rệt ở phần nghị luận văn học, tư duy logic."
    },
    {
      id: "std-12",
      name: "Trịnh Thu Trang",
      classId: "cls-9a1",
      gender: "Nữ",
      dob: "2010-10-05",
      regularScore1: 8.0,
      regularScore2: 8.5,
      regularScore3: 8.0,
      midtermScore: 8.2,
      finalScore: 8.5,
      completedAssignments: 5,
      totalAssignments: 5,
      status: "Giỏi",
      note: "Năng nổ trong các bài học nói và nghe, thuyết trình lưu loát."
    },
    {
      id: "std-13",
      name: "Nguyễn Tuấn Anh",
      classId: "cls-6a1",
      gender: "Nam",
      dob: "2013-03-28",
      regularScore1: 7.0,
      regularScore2: 7.5,
      regularScore3: 7.0,
      midtermScore: 7.2,
      finalScore: 7.5,
      completedAssignments: 4,
      totalAssignments: 5,
      status: "Khá",
      note: "Yêu thích đọc truyện thiếu nhi, nhớ cốt truyện rất nhanh."
    },
    {
      id: "std-14",
      name: "Hoàng Khánh Vy",
      classId: "cls-8a1",
      gender: "Nữ",
      dob: "2011-08-14",
      regularScore1: 4.5,
      regularScore2: 5.0,
      regularScore3: 5.0,
      midtermScore: 4.8,
      finalScore: 5.0,
      completedAssignments: 2,
      totalAssignments: 5,
      status: "Cần cố gắng",
      note: "Thầy cần quan tâm thêm, động viên nộp bài tập đúng hạn."
    }
  ],
  lessons: [
    {
      id: "lsn-01",
      title: "Bài học đường đời đầu tiên (Tô Hoài - Dế Mèn phiêu lưu ký)",
      grade: 6,
      classIds: ["cls-6a1"],
      topic: "Đọc hiểu văn bản",
      durationPeriods: 2,
      objectives: "Hiểu được diễn biến tâm lý và bài học đắt giá của Dế Mèn sau cái chết của Dế Choắt; rèn kỹ năng đọc diễn cảm và cảm thụ truyện đồng thoại.",
      notes: "Chuẩn bị tranh minh họa truyện Tô Hoài, phiếu học tập số 1 về ngoại hình và tính cách Dế Mèn.",
      status: "Đã hoàn thành"
    },
    {
      id: "lsn-02",
      title: "Thực hành Tiếng Việt: Biện pháp tu từ So sánh và Nhân hóa",
      grade: 6,
      classIds: ["cls-6a1"],
      topic: "Thực hành Tiếng Việt",
      durationPeriods: 1,
      objectives: "Nhận biết và phân tích được tác dụng gợi hình gợi cảm của so sánh, nhân hóa trong đoạn trích miêu tả Dế Mèn.",
      notes: "Trò chơi tìm nhanh biện pháp tu từ trên bảng phụ.",
      status: "Đang thực hiện"
    },
    {
      id: "lsn-03",
      title: "Người đàn ông cô độc giữa rừng (Đoàn Giỏi - Đất rừng phương Nam)",
      grade: 7,
      classIds: ["cls-7a1"],
      topic: "Đọc hiểu văn bản",
      durationPeriods: 2,
      objectives: "Cảm nhận vẻ đẹp tâm hồn khoáng đạt, yêu thiên nhiên và lòng yêu nước của chú Võ Tòng; nét đặc sắc của thiên nhiên phương Nam.",
      notes: "Chiếu video ngắn về hệ sinh thái rừng U Minh để học sinh dễ hình dung bối cảnh.",
      status: "Đã hoàn thành"
    },
    {
      id: "lsn-04",
      title: "Viết bài văn biểu cảm về con người hoặc sự việc giàu ý nghĩa",
      grade: 7,
      classIds: ["cls-7a1"],
      topic: "Viết bài văn",
      durationPeriods: 2,
      objectives: "Nắm được quy trình viết bài văn biểu cảm: tìm ý, lập dàn ý, chọn chi tiết đắt giá thể hiện cảm xúc chân thực.",
      notes: "Phát dàn ý mẫu và hướng dẫn cách lồng ghép yếu tố miêu tả.",
      status: "Chưa dạy"
    },
    {
      id: "lsn-05",
      title: "Đồng chí (Chính Hữu) – Tượng đài tình đồng đội người lính",
      grade: 8,
      classIds: ["cls-8a1"],
      topic: "Đọc hiểu văn bản",
      durationPeriods: 2,
      objectives: "Hiểu được cội nguồn, biểu hiện và vẻ đẹp thiêng liêng của tình đồng chí giữa những người lính nông dân trong kháng chiến chống Pháp.",
      notes: "Bật bài hát phổ thơ 'Đồng chí' làm phần khởi động gợi cảm xúc.",
      status: "Đang thực hiện"
    },
    {
      id: "lsn-06",
      title: "Lặng lẽ Sa Pa (Nguyễn Thành Long) – Vẻ đẹp người lao động thầm lặng",
      grade: 9,
      classIds: ["cls-9a1"],
      topic: "Đọc hiểu văn bản",
      durationPeriods: 3,
      objectives: "Phân tích vẻ đẹp cống hiến thầm lặng của anh thanh niên và các nhân vật phụ; nghệ thuật tạo tình huống và chất thơ bàng bạc của truyện.",
      notes: "Gợi ý liên hệ trách nhiệm của thế hệ trẻ với quê hương đất nước trong thời đại mới.",
      status: "Đang thực hiện"
    },
    {
      id: "lsn-07",
      title: "Nói và nghe: Thảo luận về một vấn đề đời sống phù hợp với lứa tuổi",
      grade: 9,
      classIds: ["cls-9a1"],
      topic: "Nói và nghe",
      durationPeriods: 1,
      objectives: "Rèn luyện sự tự tin khi nói trước đám đông, biết lắng nghe và phản biện lịch sự khi bàn luận về văn hóa đọc sách.",
      notes: "Chia lớp thành 4 nhóm tranh biện với thời gian quy định cụ thể.",
      status: "Chưa dạy"
    }
  ],
  assignments: [
    {
      id: "asm-01",
      title: "Viết đoạn văn (7-10 câu) cảm nhận về 3 câu thơ cuối bài thơ 'Đồng chí'",
      classId: "cls-8a1",
      className: "8A1",
      content: "Yêu cầu: Viết đoạn văn tổng - phân - hợp phân tích hình ảnh 'Đầu súng trăng treo' - biểu tượng đẹp đẽ của hiện thực và lãng mạn chiến trường.",
      assignedDate: "2026-09-14",
      dueDate: "2026-09-20",
      completedCount: 32,
      totalCount: 40,
      status: "Sắp đến hạn"
    },
    {
      id: "asm-02",
      title: "Phân tích bài học rút ra từ cái chết của Dế Choắt đối với Dế Mèn",
      classId: "cls-6a1",
      className: "6A1",
      content: "Yêu cầu: Trình bày bài học về tính kiêu ngạo, thói hung hăng và tinh thần sẻ chia với những người xung quanh (độ dài khoảng 1 trang vở).",
      assignedDate: "2026-09-08",
      dueDate: "2026-09-15",
      completedCount: 37,
      totalCount: 38,
      status: "Hoàn thành tốt"
    },
    {
      id: "asm-03",
      title: "Tìm 5 ví dụ biện pháp tu từ so sánh trong sách và giải thích tác dụng",
      classId: "cls-7a1",
      className: "7A1",
      content: "Yêu cầu: Kẻ bảng gồm cột 'Câu văn/thơ', 'Vế A', 'Từ so sánh', 'Vế B', 'Ý nghĩa biểu đạt'.",
      assignedDate: "2026-09-10",
      dueDate: "2026-09-16",
      completedCount: 34,
      totalCount: 36,
      status: "Hoàn thành tốt"
    },
    {
      id: "asm-04",
      title: "Lập dàn ý chi tiết bài văn nghị luận xã hội: Tinh thần tự giác học tập",
      classId: "cls-9a1",
      className: "9A1",
      content: "Yêu cầu: Lập đủ 3 phần Mở bài - Thân bài (Giải thích, Phân tích dẫn chứng, Bàn luận mở rộng, Bài học) - Kết bài.",
      assignedDate: "2026-09-05",
      dueDate: "2026-09-12",
      completedCount: 29,
      totalCount: 35,
      status: "Quá hạn"
    },
    {
      id: "asm-05",
      title: "Đoạn văn cảm nhận về vẻ đẹp người lao động thầm lặng qua nhân vật anh thanh niên",
      classId: "cls-9a1",
      className: "9A1",
      content: "Yêu cầu: Làm nổi bật tinh thần trách nhiệm, lòng yêu nghề và cách sống đẹp, khiêm tốn của anh thanh niên trong Lặng lẽ Sa Pa.",
      assignedDate: "2026-09-16",
      dueDate: "2026-09-22",
      completedCount: 18,
      totalCount: 35,
      status: "Sắp đến hạn"
    }
  ],
  notes: [
    {
      id: "not-01",
      title: "Nhắc nhở lớp 8A1 nộp bài tập đoạn văn thơ Đồng chí",
      content: "Thứ Sáu tiết 2 sẽ thu bài chấm điểm thường xuyên. Cần lưu ý các em hoàn thành đúng thời hạn và chú ý quy cách trình bày đoạn văn.",
      date: "2026-09-18",
      relatedClassId: "cls-8a1",
      relatedClassName: "8A1",
      priority: "Cao",
      isImportant: true
    },
    {
      id: "not-02",
      title: "Chuẩn bị đồ dùng và tranh ảnh bài Lặng lẽ Sa Pa cho lớp 9A1",
      content: "In bản đồ trạm khí tượng thủy văn Fansipan và hình ảnh tranh phong cảnh Sa Pa để học sinh cảm nhận rõ hơn về bối cảnh tác phẩm.",
      date: "2026-09-17",
      relatedClassId: "cls-9a1",
      relatedClassName: "9A1",
      priority: "Trung bình",
      isImportant: false
    },
    {
      id: "not-03",
      title: "Động viên và khen ngợi bài viết của em Trần Thị Mai Phương (6A1)",
      content: "Em Mai Phương có bài viết miêu tả cảnh đồng quê rất cảm động, vốn từ phong phú. Chọn đọc trước lớp trong giờ trả bài tuần tới để khuyến khích tinh thần học tập.",
      date: "2026-09-16",
      relatedClassId: "cls-6a1",
      relatedClassName: "6A1",
      priority: "Trung bình",
      isImportant: true
    },
    {
      id: "not-04",
      title: "Lên kế hoạch khảo sát chất lượng giữa học kỳ 1 môn Ngữ văn khối 9",
      content: "Phối hợp với tổ bộ môn Ngữ văn trường THCS Thái Phiên thống nhất ma trận đề thi giữa kỳ: 4 điểm Đọc hiểu, 6 điểm Làm văn (Nghị luận xã hội & Nghị luận văn học).",
      date: "2026-09-15",
      relatedClassId: "cls-9a1",
      relatedClassName: "9A1",
      priority: "Cao",
      isImportant: true
    }
  ],
  lastUpdated: new Date().toISOString()
};
