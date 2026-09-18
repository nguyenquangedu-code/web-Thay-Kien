/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { 
  FileSpreadsheet, 
  UploadCloud, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  Check, 
  RefreshCw,
  FileText,
  HelpCircle
} from 'lucide-react';
import { ClassItem, Student } from '../types';
import { 
  parseStudentExcelFile, 
  downloadStudentTemplateExcel, 
  ParsedStudentRow 
} from '../utils/excelHelper';

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  classes: ClassItem[];
  defaultClassId?: string;
  onImportSuccess: (newStudents: Student[], targetClassId: string, mode: 'append' | 'replace') => void;
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({
  isOpen,
  onClose,
  classes,
  defaultClassId,
  onImportSuccess,
  onShowToast
}) => {
  const [targetClassId, setTargetClassId] = useState<string>(
    (defaultClassId && defaultClassId !== 'ALL') ? defaultClassId : (classes[0]?.id || '')
  );
  const [preferFileClass, setPreferFileClass] = useState<boolean>(true);
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedStudentRow[]>([]);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const currentClass = classes.find(c => c.id === targetClassId);

  const handleFileChange = async (file: File) => {
    // Kiểm tra đuôi file
    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const fileName = file.name.toLowerCase();
    const isValidExt = validExtensions.some(ext => fileName.endsWith(ext));

    if (!isValidExt) {
      setParseError('Vui lòng chọn tệp định dạng Excel (.xlsx, .xls) hoặc .csv');
      return;
    }

    setSelectedFile(file);
    setIsParsing(true);
    setParseError(null);

    try {
      const result = await parseStudentExcelFile(file, classes, targetClassId);
      setParsedRows(result.rows);
      if (result.rows.length === 0) {
        setParseError('Không tìm thấy dòng dữ liệu học sinh nào trong tệp.');
      }
    } catch (err: any) {
      setParseError(err.message || 'Có lỗi xảy ra khi đọc tệp Excel.');
      setParsedRows([]);
    } finally {
      setIsParsing(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDownloadTemplate = () => {
    downloadStudentTemplateExcel(currentClass ? currentClass.name : '9A1');
    onShowToast('Đã tải xuống tệp Excel mẫu thành công!', 'success');
  };

  const handleConfirmImport = () => {
    const validRows = parsedRows.filter(r => r.isValid);
    if (validRows.length === 0) {
      onShowToast('Không có học sinh hợp lệ nào để nhập.', 'error');
      return;
    }

    // Chuyển đổi thành mảng Student
    const now = Date.now();
    const studentsToAdd: Student[] = validRows.map((r, idx) => {
      // Xác định lớp
      let assignedClass = targetClassId;
      if (preferFileClass && r.classId) {
        assignedClass = r.classId;
      }

      return {
        id: `std-${now}-${idx}-${Math.random().toString(36).substr(2, 5)}`,
        name: r.name,
        classId: assignedClass,
        gender: r.gender,
        dob: r.dob,
        status: r.status,
        regularScore1: r.regularScore1,
        regularScore2: r.regularScore2,
        regularScore3: r.regularScore3,
        midtermScore: r.midtermScore,
        finalScore: r.finalScore,
        completedAssignments: r.completedAssignments,
        totalAssignments: r.totalAssignments,
        note: r.note
      };
    });

    onImportSuccess(studentsToAdd, targetClassId, importMode);
    onShowToast(`Đã nhập thành công ${studentsToAdd.length} học sinh vào hệ thống!`, 'success');
    onClose();
  };

  const validCount = parsedRows.filter(r => r.isValid).length;
  const invalidCount = parsedRows.length - validCount;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg font-serif-literary flex items-center gap-2">
                <span>Nhập Danh Sách Học Sinh Từ File Excel</span>
                <span className="text-[11px] font-sans font-medium px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 border border-emerald-400/30">
                  .xlsx / .xls / .csv
                </span>
              </h3>
              <p className="text-xs text-blue-200 mt-0.5">
                Nhập nhanh cả danh sách lớp môn Ngữ văn mà không cần gõ thủ công từng em
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-sm flex-1">

          {/* Quick Guidance & Download Template */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 bg-blue-50/60 border border-blue-200/80 rounded-xl">
            <div className="flex items-start gap-2.5">
              <HelpCircle className="w-5 h-5 text-blue-900 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-700 leading-relaxed">
                <span className="font-bold text-blue-950">Chưa có file mẫu chuẩn? </span>
                Thầy có thể tải mẫu Excel sẵn các cột (STT, Họ tên, Ngày sinh, Giới tính, Điểm TX, GK, CK, Ghi chú) để điền nhanh.
              </div>
            </div>
            <button
              onClick={handleDownloadTemplate}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-blue-900 border border-blue-300 text-xs font-bold rounded-lg shadow-2xs hover:shadow transition shrink-0"
            >
              <Download className="w-3.5 h-3.5 text-blue-700" />
              <span>Tải file Excel mẫu (.xlsx)</span>
            </button>
          </div>

          {/* Options: Target Class & Mode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Lớp học tiếp nhận danh sách <span className="text-rose-500">*</span>
              </label>
              <select
                value={targetClassId}
                onChange={(e) => setTargetClassId(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-900/30 font-medium text-slate-800"
              >
                {classes.map(c => (
                  <option key={c.id} value={c.id}>
                    Lớp {c.name} (Khối {c.grade} • Hiện có {c.studentCount} học sinh)
                  </option>
                ))}
              </select>
              <label className="flex items-center gap-2 mt-2 text-xs text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferFileClass}
                  onChange={(e) => setPreferFileClass(e.target.checked)}
                  className="rounded text-blue-900 focus:ring-blue-900"
                />
                <span>Tự động nhận diện nếu file Excel có cột &quot;Lớp&quot;</span>
              </label>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Phương thức nạp dữ liệu
              </label>
              <div className="space-y-2">
                <label className="flex items-start gap-2 text-xs text-slate-700 cursor-pointer p-1.5 rounded-lg hover:bg-white">
                  <input
                    type="radio"
                    name="importMode"
                    value="append"
                    checked={importMode === 'append'}
                    onChange={() => setImportMode('append')}
                    className="mt-0.5 text-blue-900 focus:ring-blue-900"
                  />
                  <div>
                    <span className="font-bold text-slate-900">Bổ sung vào danh sách</span>
                    <p className="text-[11px] text-slate-500">Giữ nguyên học sinh cũ, thêm các em mới trong file</p>
                  </div>
                </label>

                <label className="flex items-start gap-2 text-xs text-slate-700 cursor-pointer p-1.5 rounded-lg hover:bg-white">
                  <input
                    type="radio"
                    name="importMode"
                    value="replace"
                    checked={importMode === 'replace'}
                    onChange={() => setImportMode('replace')}
                    className="mt-0.5 text-rose-600 focus:ring-rose-500"
                  />
                  <div>
                    <span className="font-bold text-rose-700">Làm mới danh sách lớp</span>
                    <p className="text-[11px] text-slate-500">Xóa các học sinh hiện tại của lớp và thay bằng file này</p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Upload Drop Zone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
              isDragOver
                ? 'border-blue-900 bg-blue-50/70 scale-[0.99]'
                : selectedFile
                ? 'border-emerald-400 bg-emerald-50/30'
                : 'border-slate-300 hover:border-blue-900 bg-slate-50/50 hover:bg-blue-50/30'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleFileChange(e.target.files[0]);
                }
              }}
              accept=".xlsx, .xls, .csv"
              className="hidden"
            />

            <div className="flex flex-col items-center justify-center gap-2">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-900 flex items-center justify-center shadow-xs">
                {isParsing ? (
                  <RefreshCw className="w-6 h-6 animate-spin text-blue-900" />
                ) : selectedFile ? (
                  <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
                ) : (
                  <UploadCloud className="w-6 h-6 text-blue-900" />
                )}
              </div>

              {selectedFile ? (
                <div>
                  <p className="text-sm font-bold text-slate-900 flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Đã chọn tệp: {selectedFile.name}</span>
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Kích thước: {(selectedFile.size / 1024).toFixed(1)} KB • Nhấn để chọn file khác
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    Kéo thả tệp Excel vào đây hoặc <span className="text-blue-900 underline">bấm để duyệt tệp</span>
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Hỗ trợ các định dạng bảng tính: .xlsx, .xls, .csv (Tự động nhận diện các cột)
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Error message */}
          {parseError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{parseError}</span>
            </div>
          )}

          {/* Parsed Preview Table */}
          {parsedRows.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Xem trước danh sách ({parsedRows.length} dòng đọc được)
                  </h4>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                    {validCount} hợp lệ
                  </span>
                  {invalidCount > 0 && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold">
                      {invalidCount} lỗi
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-slate-500">Hiển thị tối đa 10 dòng đầu</span>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <div className="max-h-60 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider sticky top-0 border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3 w-10 text-center">STT</th>
                        <th className="py-2.5 px-3">Họ và tên</th>
                        <th className="py-2.5 px-3 text-center">Giới tính</th>
                        <th className="py-2.5 px-3">Ngày sinh</th>
                        <th className="py-2.5 px-3">Lớp gán</th>
                        <th className="py-2.5 px-3 text-center">TX1</th>
                        <th className="py-2.5 px-3 text-center">TX2</th>
                        <th className="py-2.5 px-3 text-center">GK</th>
                        <th className="py-2.5 px-3 text-center">CK</th>
                        <th className="py-2.5 px-3">Xếp loại</th>
                        <th className="py-2.5 px-3">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {parsedRows.slice(0, 10).map((r, i) => (
                        <tr key={i} className={r.isValid ? 'hover:bg-slate-50' : 'bg-rose-50/50'}>
                          <td className="py-2 px-3 text-center text-slate-500">{i + 1}</td>
                          <td className="py-2 px-3 font-semibold text-slate-900">{r.name || '(Trống)'}</td>
                          <td className="py-2 px-3 text-center text-slate-600">{r.gender}</td>
                          <td className="py-2 px-3 text-slate-600 font-mono">{r.dob}</td>
                          <td className="py-2 px-3">
                            <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-900 font-medium">
                              {r.className || (currentClass?.name || 'Mặc định')}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-center font-mono">{r.regularScore1 ?? '-'}</td>
                          <td className="py-2 px-3 text-center font-mono">{r.regularScore2 ?? '-'}</td>
                          <td className="py-2 px-3 text-center font-mono font-bold text-blue-900">{r.midtermScore ?? '-'}</td>
                          <td className="py-2 px-3 text-center font-mono font-bold text-amber-900">{r.finalScore ?? '-'}</td>
                          <td className="py-2 px-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              r.status === 'Giỏi' ? 'bg-emerald-100 text-emerald-800' :
                              r.status === 'Khá' ? 'bg-blue-100 text-blue-800' :
                              r.status === 'Đạt' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                            }`}>
                              {r.status}
                            </span>
                          </td>
                          <td className="py-2 px-3">
                            {r.isValid ? (
                              <span className="inline-flex items-center gap-1 text-emerald-700 font-medium text-[11px]">
                                <Check className="w-3.5 h-3.5" /> Hợp lệ
                              </span>
                            ) : (
                              <span className="text-rose-600 font-medium text-[11px]">{r.error}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {parsedRows.length > 10 && (
                  <div className="p-2 bg-slate-50 border-t border-slate-200 text-center text-xs text-slate-500">
                    Đang hiển thị 10 / {parsedRows.length} học sinh. Toàn bộ danh sách hợp lệ sẽ được lưu khi xác nhận.
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Footer actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3 shrink-0">
          <div className="text-xs text-slate-600 text-center sm:text-left">
            {parsedRows.length > 0 ? (
              <span>
                Sẵn sàng thêm <strong className="text-blue-950 font-bold">{validCount}</strong> học sinh vào{' '}
                <strong className="text-blue-950 font-bold">Lớp {currentClass?.name}</strong>.
              </span>
            ) : (
              <span>Chọn file Excel có danh sách học sinh để bắt đầu.</span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-xl transition"
            >
              Hủy bỏ
            </button>
            <button
              type="button"
              disabled={validCount === 0 || isParsing}
              onClick={handleConfirmImport}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold shadow transition ${
                validCount > 0 && !isParsing
                  ? 'bg-blue-900 hover:bg-blue-950 text-white cursor-pointer'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>Xác nhận nhập ({validCount} học sinh)</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
