import React from 'react';
import { 
  LayoutDashboard, 
  School, 
  Users, 
  BookOpenCheck, 
  FileEdit, 
  Star, 
  BarChart3, 
  Bookmark, 
  X,
  Feather,
  GraduationCap
} from 'lucide-react';
import { ActiveTab, AppData } from '../types';

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  data: AppData;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  data,
  isMobileOpen,
  onCloseMobile,
}) => {
  const menuItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'Tổng quan',
      icon: LayoutDashboard,
      badge: null,
      desc: 'Bảng điều khiển chung'
    },
    {
      id: 'classes' as ActiveTab,
      label: 'Lớp học',
      icon: School,
      badge: data.classes.length,
      desc: 'Quản lý các lớp'
    },
    {
      id: 'students' as ActiveTab,
      label: 'Học sinh',
      icon: Users,
      badge: data.students.length,
      desc: 'Danh sách học sinh'
    },
    {
      id: 'lessons' as ActiveTab,
      label: 'Bài học',
      icon: BookOpenCheck,
      badge: data.lessons.length,
      desc: 'Kế hoạch bài giảng'
    },
    {
      id: 'assignments' as ActiveTab,
      label: 'Bài tập',
      icon: FileEdit,
      badge: data.assignments.filter(a => a.status === 'Sắp đến hạn' || a.status === 'Quá hạn').length,
      desc: 'Giao bài & chấm bài'
    },
    {
      id: 'grades' as ActiveTab,
      label: 'Điểm số',
      icon: Star,
      badge: null,
      desc: 'Sổ điểm định kỳ'
    },
    {
      id: 'stats' as ActiveTab,
      label: 'Thống kê',
      icon: BarChart3,
      badge: null,
      desc: 'Biểu đồ tiến độ'
    },
    {
      id: 'notes' as ActiveTab,
      label: 'Ghi chú',
      icon: Bookmark,
      badge: data.notes.filter(n => n.isImportant).length,
      desc: 'Sổ tay sư phạm'
    }
  ];

  const handleSelect = (tab: ActiveTab) => {
    onTabChange(tab);
    onCloseMobile();
  };

  const navContent = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200/80 w-64 lg:w-72 select-none">
      
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
        <div className="flex items-center gap-2 text-slate-800 font-bold">
          <GraduationCap className="w-5 h-5 text-blue-900" />
          <span>DANH MỤC QUẢN LÝ</span>
        </div>
        <button
          onClick={onCloseMobile}
          className="p-1 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-200/50"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Literary quote badge */}
      <div className="p-4 mx-3 mt-3 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50/60 border border-amber-200/60 text-amber-950 flex items-start gap-2.5">
        <Feather className="w-4 h-4 text-amber-700 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-[11px] italic font-serif-literary text-amber-900 leading-snug">
            "Văn học là nhân học – nuôi dưỡng tâm hồn và bồi đắp nhân cách."
          </p>
          <p className="text-[10px] text-amber-800 font-semibold mt-1">
            Môn Ngữ văn THCS Thái Phiên
          </p>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleSelect(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all group ${
                isActive
                  ? 'bg-blue-900 text-white font-semibold shadow-md shadow-blue-950/15'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-blue-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-5 h-5 transition-transform group-hover:scale-105 ${
                    isActive ? 'text-amber-400' : 'text-slate-500 group-hover:text-blue-900'
                  }`}
                />
                <div className="text-left">
                  <div className="leading-tight">{item.label}</div>
                  <div className={`text-[10px] ${isActive ? 'text-blue-200' : 'text-slate-500'}`}>
                    {item.desc}
                  </div>
                </div>
              </div>

              {item.badge !== null && item.badge > 0 && (
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-amber-400 text-slate-950'
                      : 'bg-slate-200 text-slate-700 group-hover:bg-blue-100 group-hover:text-blue-900'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Teacher Status Footer */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/70">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-900 text-amber-300 flex items-center justify-center font-bold text-sm">
            QK
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-900 truncate">
              Thầy Nguyễn Quang Kiên
            </p>
            <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Đang hoạt động trên máy
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block sticky top-20 h-[calc(100vh-5rem)]">
        {navContent}
      </div>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-2xl z-10 animate-slide-right">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
};
