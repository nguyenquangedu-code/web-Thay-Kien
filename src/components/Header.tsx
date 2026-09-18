import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, 
  Search, 
  Download, 
  Upload, 
  RotateCcw, 
  Menu, 
  FileCode2, 
  UserCheck, 
  Calendar,
  Sparkles
} from 'lucide-react';
import { TeacherProfile } from '../types';

interface HeaderProps {
  teacher: TeacherProfile;
  onOpenSearch: () => void;
  onExportJson: () => void;
  onImportJson: (content: string) => void;
  onResetData: () => void;
  onExportHtml: () => void;
  onToggleMobileMenu: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  teacher,
  onOpenSearch,
  onExportJson,
  onImportJson,
  onResetData,
  onExportHtml,
  onToggleMobileMenu,
  searchQuery,
  onSearchChange,
}) => {
  const [currentDateTime, setCurrentDateTime] = useState('');
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cập nhật đồng hồ và ngày tháng theo giờ Việt Nam
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
      const dayName = days[now.getDay()];
      const dateStr = now.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
      const timeStr = now.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      setCurrentDateTime(`${dayName}, ${dateStr} • ${timeStr}`);
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        onImportJson(content);
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white shadow-md border-b border-blue-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo, Avatar & Teacher Info */}
          <div className="flex items-center gap-3.5">
            <button
              onClick={onToggleMobileMenu}
              className="lg:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition"
              title="Mở menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="relative group flex items-center">
              {/* Teacher Avatar illustration */}
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 p-0.5 shadow-lg flex-shrink-0">
                <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-amber-300 font-bold text-lg relative overflow-hidden">
                  <span className="font-serif-literary tracking-wider">QK</span>
                  <div className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 rounded-full p-0.5">
                    <BookOpen className="w-3 h-3" />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white font-serif-literary">
                  QUẢN TRỊ HỌC TẬP NGỮ VĂN
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full">
                  <Sparkles className="w-3 h-3" />
                  THCS Thái Phiên
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 flex items-center gap-1.5 mt-0.5 font-medium">
                <span className="text-amber-300 font-semibold">{teacher.name}</span>
                <span className="text-slate-500">•</span>
                <span>{teacher.role}</span>
                <span className="hidden md:inline text-slate-500">•</span>
                <span className="hidden md:inline">{teacher.school}</span>
              </p>
            </div>
          </div>

          {/* Quick Search & Tools */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Quick Search Bar */}
            <div className="relative hidden md:block w-56 lg:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm nhanh học sinh, lớp, bài..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                onClick={onOpenSearch}
                className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-white/10 hover:bg-white/15 focus:bg-white/20 text-white placeholder-slate-400 rounded-xl border border-white/15 focus:outline-none focus:ring-2 focus:ring-amber-400/50 transition"
              />
            </div>

            <button
              onClick={onOpenSearch}
              className="md:hidden p-2 rounded-xl bg-white/10 text-slate-200 hover:text-white"
              title="Tìm kiếm"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Local Clock */}
            <div className="hidden xl:flex items-center gap-1.5 text-xs text-slate-300 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl font-mono">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>{currentDateTime || 'Đang đồng bộ...'}</span>
            </div>

            {/* Offline Single-File HTML Download */}
            <button
              onClick={onExportHtml}
              className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-semibold text-xs px-3 py-2 rounded-xl shadow transition"
              title="Tải về file HTML đơn chạy độc lập trên mọi máy tính không cần cài đặt hay mạng"
            >
              <FileCode2 className="w-4 h-4" />
              <span className="hidden sm:inline">Tải File HTML Offline</span>
            </button>

            {/* Export JSON */}
            <button
              onClick={onExportJson}
              className="hidden sm:flex items-center gap-1 text-xs text-slate-200 bg-white/10 hover:bg-white/20 border border-white/15 px-2.5 py-2 rounded-xl transition"
              title="Xuất dữ liệu dự phòng ra file JSON"
            >
              <Download className="w-3.5 h-3.5 text-blue-300" />
              <span className="hidden lg:inline">Xuất JSON</span>
            </button>

            {/* Import JSON */}
            <label
              className="hidden sm:flex items-center gap-1 text-xs text-slate-200 bg-white/10 hover:bg-white/20 border border-white/15 px-2.5 py-2 rounded-xl cursor-pointer transition"
              title="Nhập dữ liệu từ file JSON đã lưu"
            >
              <Upload className="w-3.5 h-3.5 text-emerald-300" />
              <span className="hidden lg:inline">Nhập JSON</span>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            {/* Reset to Sample Data Button */}
            <button
              onClick={() => setShowConfirmReset(true)}
              className="p-2 text-slate-300 hover:text-amber-300 hover:bg-white/10 rounded-xl transition"
              title="Khôi phục dữ liệu mẫu ban đầu"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Reset */}
      {showConfirmReset && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl text-slate-800 border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-2 font-serif-literary">
              Khôi phục dữ liệu mẫu?
            </h3>
            <p className="text-sm text-slate-600 mb-5 leading-relaxed">
              Thao tác này sẽ đặt lại danh sách lớp học, học sinh, bài giảng, bài tập và ghi chú về trạng thái mẫu ban đầu của môn Ngữ văn. Mọi thay đổi chưa sao lưu sẽ bị ghi đè.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmReset(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Hủy bỏ
              </button>
              <button
                onClick={() => {
                  onResetData();
                  setShowConfirmReset(false);
                }}
                className="px-4 py-2 text-sm font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow transition"
              >
                Xác nhận khôi phục
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
