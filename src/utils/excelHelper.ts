/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as XLSX from 'xlsx';
import { Student, ClassItem } from '../types';

export interface ParsedStudentRow {
  stt?: number | string;
  name: string;
  gender: 'Nam' | 'Nữ';
  dob: string;
  className?: string;
  classId?: string;
  status: 'Giỏi' | 'Khá' | 'Đạt' | 'Cần cố gắng';
  regularScore1?: number;
  regularScore2?: number;
  regularScore3?: number;
  midtermScore?: number;
  finalScore?: number;
  completedAssignments: number;
  totalAssignments: number;
  note: string;
  isValid: boolean;
  error?: string;
}

// Hàm chuẩn hóa chuỗi tiêu đề để tìm cột linh hoạt
function normalizeHeader(header: string): string {
  return header
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

// Chuyển đổi định dạng ngày tháng từ Excel (số serial hoặc chuỗi)
function parseExcelDate(val: any): string {
  if (!val) return '2012-01-01';

  // Nếu là số serial ngày của Excel (ví dụ 40909)
  if (typeof val === 'number') {
    try {
      const dateObj = XLSX.SSF.parse_date_code(val);
      if (dateObj) {
        const y = String(dateObj.y).padStart(4, '20');
        const m = String(dateObj.m).padStart(2, '0');
        const d = String(dateObj.d).padStart(2, '0');
        return `${y}-${m}-${d}`;
      }
    } catch {
      // Bỏ qua nếu lỗi
    }
  }

  const str = String(val).trim();
  // Khớp dd/mm/yyyy hoặc dd-mm-yyyy
  const dmyMatch = str.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})$/);
  if (dmyMatch) {
    const d = dmyMatch[1].padStart(2, '0');
    const m = dmyMatch[2].padStart(2, '0');
    const y = dmyMatch[3];
    return `${y}-${m}-${d}`;
  }

  // Khớp yyyy-mm-dd
  const ymdMatch = str.match(/^(\d{4})[/\-.](\d{1,2})[/\-.](\d{1,2})$/);
  if (ymdMatch) {
    const y = ymdMatch[1];
    const m = ymdMatch[2].padStart(2, '0');
    const d = ymdMatch[3].padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  return '2012-01-01';
}

// Chuyển đổi điểm số an toàn (0.0 đến 10.0)
function parseScoreValue(val: any): number | undefined {
  if (val === undefined || val === null || val === '') return undefined;
  let numStr = String(val).trim().replace(',', '.');
  const num = parseFloat(numStr);
  if (isNaN(num)) return undefined;
  return Math.max(0, Math.min(10, Math.round(num * 10) / 10));
}

// Đọc file Excel từ File/Blob và trích xuất danh sách học sinh
export async function parseStudentExcelFile(
  file: File,
  availableClasses: ClassItem[],
  defaultClassId: string
): Promise<{ rows: ParsedStudentRow[]; totalFound: number; validCount: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'array', cellDates: true });
        
        // Lấy sheet đầu tiên
        const firstSheetName = workbook.SheetNames[0];
        if (!firstSheetName) {
          throw new Error('Tệp Excel không có trang tính (sheet) nào.');
        }

        const worksheet = workbook.Sheets[firstSheetName];
        // Đọc dữ liệu dạng mảng 2 chiều
        const rawJson: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, blankrows: false });

        if (!rawJson || rawJson.length === 0) {
          throw new Error('Tệp Excel trống hoặc không đọc được nội dung.');
        }

        // Tìm dòng tiêu đề (header row) phù hợp (chứa "họ tên" hoặc "stt" hoặc "tên")
        let headerRowIndex = -1;
        for (let i = 0; i < Math.min(10, rawJson.length); i++) {
          const row = rawJson[i];
          if (!row || !Array.isArray(row)) continue;
          const normalized = row.map(cell => normalizeHeader(String(cell || '')));
          if (
            normalized.some(h => h.includes('hoten') || h.includes('ten') || h.includes('hovaten') || h.includes('fullname')) ||
            (normalized.some(h => h.includes('stt')) && normalized.length >= 2)
          ) {
            headerRowIndex = i;
            break;
          }
        }

        if (headerRowIndex === -1) {
          // Nếu không tìm thấy, mặc định lấy dòng 0
          headerRowIndex = 0;
        }

        const headers = rawJson[headerRowIndex].map(cell => String(cell || '').trim());
        const headerMap: { [key: string]: number } = {};

        headers.forEach((h, colIdx) => {
          const norm = normalizeHeader(h);
          if (norm.includes('stt') || norm === 'no' || norm === 'tt') headerMap['stt'] = colIdx;
          else if (norm.includes('hoten') || norm.includes('hovaten') || norm.includes('fullname') || norm === 'tenhocsinh') headerMap['name'] = colIdx;
          else if (norm === 'ten' && headerMap['name'] === undefined) headerMap['name'] = colIdx;
          else if (norm.includes('hodem') || norm.includes('ho')) headerMap['ho'] = colIdx;
          else if (norm.includes('gioitinh') || norm === 'phai' || norm === 'gender' || norm === 'sex') headerMap['gender'] = colIdx;
          else if (norm.includes('ngaysinh') || norm === 'dob' || norm.includes('sinh') || norm.includes('birth')) headerMap['dob'] = colIdx;
          else if (norm.includes('lop') || norm === 'class' || norm === 'grade') headerMap['class'] = colIdx;
          else if (norm.includes('tx1') || norm.includes('mieng') || norm.includes('tx_1') || norm.includes('thuongxuyen1')) headerMap['tx1'] = colIdx;
          else if (norm.includes('tx2') || norm.includes('15p') || norm.includes('tx_2') || norm.includes('thuongxuyen2')) headerMap['tx2'] = colIdx;
          else if (norm.includes('tx3') || norm.includes('1tiet') || norm.includes('tx_3') || norm.includes('thuongxuyen3')) headerMap['tx3'] = colIdx;
          else if (norm.includes('giuaky') || norm.includes('gk') || norm.includes('giua_ky')) headerMap['gk'] = colIdx;
          else if (norm.includes('cuoiky') || norm.includes('ck') || norm.includes('cuoi_ky') || norm.includes('hocky')) headerMap['ck'] = colIdx;
          else if (norm.includes('ghichu') || norm.includes('nhanxet') || norm === 'note') headerMap['note'] = colIdx;
          else if (norm.includes('xeploai') || norm.includes('hocluc') || norm === 'status') headerMap['status'] = colIdx;
        });

        // Nếu không tìm thấy cột name bằng map, thử tìm cột có chứa chữ "Tên"
        if (headerMap['name'] === undefined) {
          const foundIdx = headers.findIndex(h => normalizeHeader(h).includes('ten'));
          if (foundIdx !== -1) headerMap['name'] = foundIdx;
          else {
            // Mặc định cột 1 nếu có STT ở cột 0, ngược lại cột 0
            headerMap['name'] = headers.length > 1 ? 1 : 0;
          }
        }

        const parsedRows: ParsedStudentRow[] = [];

        // Duyệt các dòng dữ liệu sau header
        for (let r = headerRowIndex + 1; r < rawJson.length; r++) {
          const row = rawJson[r];
          if (!row || !Array.isArray(row) || row.length === 0) continue;

          // Ghép họ và tên nếu tách 2 cột
          let studentName = '';
          if (headerMap['ho'] !== undefined && headerMap['name'] !== undefined && headerMap['ho'] !== headerMap['name']) {
            const ho = String(row[headerMap['ho']] || '').trim();
            const ten = String(row[headerMap['name']] || '').trim();
            studentName = `${ho} ${ten}`.trim();
          } else if (headerMap['name'] !== undefined) {
            studentName = String(row[headerMap['name']] || '').trim();
          }

          // Bỏ qua dòng trống hoàn toàn
          if (!studentName && row.every(c => c === undefined || c === null || String(c).trim() === '')) {
            continue;
          }

          // Kiểm tra nếu là dòng thống kê / footer
          const lowerName = studentName.toLowerCase();
          if (lowerName.startsWith('tổng') || lowerName.startsWith('danh sách') || lowerName.startsWith('giáo viên') || lowerName.startsWith('kí tên')) {
            continue;
          }

          // Giới tính
          let genderVal: 'Nam' | 'Nữ' = 'Nam';
          if (headerMap['gender'] !== undefined) {
            const gRaw = String(row[headerMap['gender']] || '').trim().toLowerCase();
            if (gRaw.includes('nữ') || gRaw.includes('nu') || gRaw === 'f' || gRaw === 'female') {
              genderVal = 'Nữ';
            }
          }

          // Ngày sinh
          const dobVal = headerMap['dob'] !== undefined ? parseExcelDate(row[headerMap['dob']]) : '2012-01-01';

          // Xác định lớp
          let assignedClassId = defaultClassId;
          let foundClassName = '';
          if (headerMap['class'] !== undefined) {
            const rawClass = String(row[headerMap['class']] || '').trim();
            foundClassName = rawClass;
            // Tìm lớp khớp trong availableClasses
            const matched = availableClasses.find(c => 
              c.name.toLowerCase() === rawClass.toLowerCase() ||
              c.name.toLowerCase().replace(/[^a-z0-9]/g, '') === rawClass.toLowerCase().replace(/[^a-z0-9]/g, '') ||
              c.id.toLowerCase() === rawClass.toLowerCase()
            );
            if (matched) {
              assignedClassId = matched.id;
              foundClassName = matched.name;
            }
          }

          // Điểm
          const tx1 = headerMap['tx1'] !== undefined ? parseScoreValue(row[headerMap['tx1']]) : undefined;
          const tx2 = headerMap['tx2'] !== undefined ? parseScoreValue(row[headerMap['tx2']]) : undefined;
          const tx3 = headerMap['tx3'] !== undefined ? parseScoreValue(row[headerMap['tx3']]) : undefined;
          const gk = headerMap['gk'] !== undefined ? parseScoreValue(row[headerMap['gk']]) : undefined;
          const ck = headerMap['ck'] !== undefined ? parseScoreValue(row[headerMap['ck']]) : undefined;

          // Xếp loại
          let statusVal: 'Giỏi' | 'Khá' | 'Đạt' | 'Cần cố gắng' = 'Khá';
          if (headerMap['status'] !== undefined) {
            const sRaw = String(row[headerMap['status']] || '').trim().toLowerCase();
            if (sRaw.includes('giỏi') || sRaw.includes('gioi')) statusVal = 'Giỏi';
            else if (sRaw.includes('khá') || sRaw.includes('kha')) statusVal = 'Khá';
            else if (sRaw.includes('đạt') || sRaw.includes('dat') || sRaw.includes('trung bình')) statusVal = 'Đạt';
            else if (sRaw.includes('cố gắng') || sRaw.includes('yeu') || sRaw.includes('yếu') || sRaw.includes('kem')) statusVal = 'Cần cố gắng';
          } else {
            // Tự tính xếp loại dựa trên điểm nếu có
            const scores = [tx1, tx2, tx3, gk, ck].filter(s => s !== undefined) as number[];
            if (scores.length > 0) {
              const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
              if (avg >= 8.0) statusVal = 'Giỏi';
              else if (avg >= 6.5) statusVal = 'Khá';
              else if (avg >= 5.0) statusVal = 'Đạt';
              else statusVal = 'Cần cố gắng';
            }
          }

          // Ghi chú
          const noteVal = headerMap['note'] !== undefined && row[headerMap['note']]
            ? String(row[headerMap['note']]).trim()
            : 'Được nhập từ file Excel';

          const isValid = studentName.trim().length > 0;
          const errorMsg = !isValid ? 'Thiếu họ và tên học sinh' : undefined;

          parsedRows.push({
            stt: headerMap['stt'] !== undefined ? row[headerMap['stt']] : parsedRows.length + 1,
            name: studentName,
            gender: genderVal,
            dob: dobVal,
            className: foundClassName,
            classId: assignedClassId,
            status: statusVal,
            regularScore1: tx1,
            regularScore2: tx2,
            regularScore3: tx3,
            midtermScore: gk,
            finalScore: ck,
            completedAssignments: 5,
            totalAssignments: 5,
            note: noteVal,
            isValid,
            error: errorMsg
          });
        }

        const validCount = parsedRows.filter(r => r.isValid).length;
        resolve({
          rows: parsedRows,
          totalFound: parsedRows.length,
          validCount
        });
      } catch (err: any) {
        reject(new Error(err.message || 'Lỗi khi đọc file Excel. Vui lòng kiểm tra lại định dạng file.'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Không thể đọc tệp tin đã chọn.'));
    };

    reader.readAsArrayBuffer(file);
  });
}

// Tạo và tải xuống file Excel mẫu chuẩn giáo dục THCS
export function downloadStudentTemplateExcel(selectedClassName: string = '9A1') {
  // Dữ liệu mẫu học sinh môn Ngữ văn
  const templateData = [
    {
      'STT': 1,
      'Họ và tên': 'Nguyễn Hoàng Nam',
      'Giới tính': 'Nam',
      'Ngày sinh': '15/04/2012',
      'Lớp': selectedClassName,
      'TX1 (Miệng)': 8.5,
      'TX2 (15p)': 8.0,
      'TX3 (1 tiết)': 8.5,
      'Giữa kỳ (GK)': 8.0,
      'Cuối kỳ (CK)': 8.5,
      'Xếp loại': 'Giỏi',
      'Ghi chú': 'Chăm chỉ, diễn đạt lưu loát'
    },
    {
      'STT': 2,
      'Họ và tên': 'Trần Thị Mai Phương',
      'Giới tính': 'Nữ',
      'Ngày sinh': '20/08/2012',
      'Lớp': selectedClassName,
      'TX1 (Miệng)': 9.0,
      'TX2 (15p)': 9.5,
      'TX3 (1 tiết)': 9.0,
      'Giữa kỳ (GK)': 9.0,
      'Cuối kỳ (CK)': 9.5,
      'Xếp loại': 'Giỏi',
      'Ghi chú': 'Cảm thụ văn học tốt, chữ viết đẹp'
    },
    {
      'STT': 3,
      'Họ và tên': 'Lê Đức Minh',
      'Giới tính': 'Nam',
      'Ngày sinh': '10/11/2012',
      'Lớp': selectedClassName,
      'TX1 (Miệng)': 7.0,
      'TX2 (15p)': 7.5,
      'TX3 (1 tiết)': 6.5,
      'Giữa kỳ (GK)': 7.0,
      'Cuối kỳ (CK)': 7.5,
      'Xếp loại': 'Khá',
      'Ghi chú': 'Nắm vững kiến thức Tiếng Việt'
    },
    {
      'STT': 4,
      'Họ và tên': 'Phạm Hải Đăng',
      'Giới tính': 'Nam',
      'Ngày sinh': '05/02/2012',
      'Lớp': selectedClassName,
      'TX1 (Miệng)': 6.0,
      'TX2 (15p)': 5.5,
      'TX3 (1 tiết)': 6.0,
      'Giữa kỳ (GK)': 5.5,
      'Cuối kỳ (CK)': 6.0,
      'Xếp loại': 'Đạt',
      'Ghi chú': 'Cần rèn luyện thêm kỹ năng viết đoạn văn'
    },
    {
      'STT': 5,
      'Họ và tên': 'Vũ Thùy Linh',
      'Giới tính': 'Nữ',
      'Ngày sinh': '12/09/2012',
      'Lớp': selectedClassName,
      'TX1 (Miệng)': 8.0,
      'TX2 (15p)': 7.5,
      'TX3 (1 tiết)': 8.0,
      'Giữa kỳ (GK)': 8.0,
      'Cuối kỳ (CK)': 8.0,
      'Xếp loại': 'Khá',
      'Ghi chú': 'Tích cực phát biểu xây dựng bài'
    }
  ];

  // Tạo Worksheet và Workbook
  const worksheet = XLSX.utils.json_to_sheet(templateData);

  // Căn chỉnh độ rộng cột
  worksheet['!cols'] = [
    { wch: 6 },   // STT
    { wch: 24 },  // Họ và tên
    { wch: 10 },  // Giới tính
    { wch: 13 },  // Ngày sinh
    { wch: 10 },  // Lớp
    { wch: 12 },  // TX1
    { wch: 12 },  // TX2
    { wch: 12 },  // TX3
    { wch: 14 },  // GK
    { wch: 14 },  // CK
    { wch: 12 },  // Xếp loại
    { wch: 35 },  // Ghi chú
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh_sach_hoc_sinh');

  // Tạo và tải file .xlsx
  XLSX.writeFile(workbook, `Mau_Danh_Sach_Hoc_Sinh_Ngu_Van_${selectedClassName}.xlsx`);
}
