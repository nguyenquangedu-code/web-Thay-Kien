/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  AppData, 
  ActiveTab, 
  ClassItem, 
  Student, 
  Lesson, 
  Assignment, 
  TeacherNote 
} from './types';
import { 
  loadAppData, 
  saveAppData, 
  resetToInitialData, 
  exportDataAsJson, 
  importDataFromJson,
  exportSingleFileHtml 
} from './utils/storage';

// Components
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Toast } from './components/Toast';
import { DashboardView } from './components/DashboardView';
import { ClassesView } from './components/ClassesView';
import { StudentsView } from './components/StudentsView';
import { LessonsView } from './components/LessonsView';
import { AssignmentsView } from './components/AssignmentsView';
import { GradesView } from './components/GradesView';
import { StatsView } from './components/StatsView';
import { NotesView } from './components/NotesView';
import { SearchResultsModal } from './components/SearchResultsModal';

export default function App() {
  const [data, setData] = useState<AppData>(() => loadAppData());
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [studentClassFilter, setStudentClassFilter] = useState<string | undefined>(undefined);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Lưu trữ tự động mỗi khi appData thay đổi
  useEffect(() => {
    saveAppData(data);
  }, [data]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
  };

  // Class Actions
  const handleSaveClass = (classItem: ClassItem) => {
    setData(prev => {
      const exists = prev.classes.some(c => c.id === classItem.id);
      const newClasses = exists
        ? prev.classes.map(c => c.id === classItem.id ? classItem : c)
        : [...prev.classes, classItem];
      return { ...prev, classes: newClasses };
    });
  };

  const handleDeleteClass = (classId: string) => {
    setData(prev => ({
      ...prev,
      classes: prev.classes.filter(c => c.id !== classId),
      students: prev.students.filter(s => s.classId !== classId)
    }));
  };

  const handleViewStudentsOfClass = (classId: string) => {
    setStudentClassFilter(classId);
    setActiveTab('students');
  };

  // Student Actions
  const handleSaveStudent = (student: Student) => {
    setData(prev => {
      const exists = prev.students.some(s => s.id === student.id);
      const newStudents = exists
        ? prev.students.map(s => s.id === student.id ? student : s)
        : [...prev.students, student];

      // Cập nhật sĩ số lớp
      const updatedClasses = prev.classes.map(cls => {
        const count = newStudents.filter(s => s.classId === cls.id).length;
        return { ...cls, studentCount: count };
      });

      return { ...prev, students: newStudents, classes: updatedClasses };
    });
  };

  const handleSaveStudents = (newStudentsList: Student[], targetClassId: string, mode: 'append' | 'replace' = 'append') => {
    setData(prev => {
      let mergedStudents: Student[];
      if (mode === 'replace' && targetClassId) {
        // Thay thế toàn bộ học sinh của lớp được chọn
        const remaining = prev.students.filter(s => s.classId !== targetClassId);
        mergedStudents = [...remaining, ...newStudentsList];
      } else {
        // Bổ sung hoặc cập nhật nếu trùng họ tên trong cùng lớp
        const existingList = [...prev.students];
        for (const newStd of newStudentsList) {
          const matchIdx = existingList.findIndex(
            s => s.id === newStd.id || (s.name.trim().toLowerCase() === newStd.name.trim().toLowerCase() && s.classId === newStd.classId)
          );
          if (matchIdx !== -1) {
            existingList[matchIdx] = { ...existingList[matchIdx], ...newStd };
          } else {
            existingList.push(newStd);
          }
        }
        mergedStudents = existingList;
      }

      // Cập nhật lại sĩ số cho tất cả các lớp
      const updatedClasses = prev.classes.map(cls => {
        const count = mergedStudents.filter(s => s.classId === cls.id).length;
        return { ...cls, studentCount: count };
      });

      return { ...prev, students: mergedStudents, classes: updatedClasses };
    });
  };

  const handleDeleteStudent = (studentId: string) => {
    setData(prev => {
      const newStudents = prev.students.filter(s => s.id !== studentId);
      const updatedClasses = prev.classes.map(cls => {
        const count = newStudents.filter(s => s.classId === cls.id).length;
        return { ...cls, studentCount: count };
      });
      return { ...prev, students: newStudents, classes: updatedClasses };
    });
  };

  const handleUpdateStudentScores = (studentId: string, updates: Partial<Student>) => {
    setData(prev => ({
      ...prev,
      students: prev.students.map(s => s.id === studentId ? { ...s, ...updates } : s)
    }));
  };

  // Lesson Actions
  const handleSaveLesson = (lesson: Lesson) => {
    setData(prev => {
      const exists = prev.lessons.some(l => l.id === lesson.id);
      const newLessons = exists
        ? prev.lessons.map(l => l.id === lesson.id ? lesson : l)
        : [...prev.lessons, lesson];
      return { ...prev, lessons: newLessons };
    });
  };

  const handleDeleteLesson = (lessonId: string) => {
    setData(prev => ({
      ...prev,
      lessons: prev.lessons.filter(l => l.id !== lessonId)
    }));
  };

  const handleToggleLessonStatus = (lessonId: string) => {
    setData(prev => ({
      ...prev,
      lessons: prev.lessons.map(l => {
        if (l.id !== lessonId) return l;
        const nextStatus: Lesson['status'] = l.status === 'Đã hoàn thành' ? 'Đang thực hiện' : 'Đã hoàn thành';
        return { ...l, status: nextStatus };
      })
    }));
    showToast('Đã cập nhật tiến độ bài học!', 'success');
  };

  // Assignment Actions
  const handleSaveAssignment = (assignment: Assignment) => {
    setData(prev => {
      const exists = prev.assignments.some(a => a.id === assignment.id);
      const newAssignments = exists
        ? prev.assignments.map(a => a.id === assignment.id ? assignment : a)
        : [...prev.assignments, assignment];
      return { ...prev, assignments: newAssignments };
    });
  };

  const handleDeleteAssignment = (assignmentId: string) => {
    setData(prev => ({
      ...prev,
      assignments: prev.assignments.filter(a => a.id !== assignmentId)
    }));
  };

  // Note Actions
  const handleSaveNote = (note: TeacherNote) => {
    setData(prev => {
      const exists = prev.notes.some(n => n.id === note.id);
      const newNotes = exists
        ? prev.notes.map(n => n.id === note.id ? note : n)
        : [note, ...prev.notes];
      return { ...prev, notes: newNotes };
    });
  };

  const handleDeleteNote = (noteId: string) => {
    setData(prev => ({
      ...prev,
      notes: prev.notes.filter(n => n.id !== noteId)
    }));
  };

  const handleToggleNoteImportant = (noteId: string) => {
    setData(prev => ({
      ...prev,
      notes: prev.notes.map(n => n.id === noteId ? { ...n, isImportant: !n.isImportant } : n)
    }));
  };

  // Search & Navigation
  const handleOpenSearchModal = () => {
    setIsSearchModalOpen(true);
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'add_lesson':
        setActiveTab('lessons');
        break;
      case 'add_assignment':
        setActiveTab('assignments');
        break;
      case 'add_student':
        setActiveTab('students');
        break;
      case 'add_note':
        setActiveTab('notes');
        break;
      case 'open_grades':
        setActiveTab('grades');
        break;
      default:
        break;
    }
  };

  // Backup, Restore & Standalone HTML
  const handleExportJson = () => {
    exportDataAsJson(data);
    showToast('Đã tải xuống tệp dữ liệu JSON thành công!', 'success');
  };

  const handleImportJson = (content: string) => {
    const result = importDataFromJson(content);
    if (result.success && result.data) {
      setData(result.data);
      saveAppData(result.data);
      showToast('Đã khôi phục toàn bộ dữ liệu từ tệp JSON thành công!', 'success');
    } else {
      showToast(result.error || 'Có lỗi khi nhập dữ liệu!', 'error');
    }
  };

  const handleResetData = () => {
    const initial = resetToInitialData();
    setData(initial);
    showToast('Đã khôi phục dữ liệu mẫu ban đầu của thầy Kiên!', 'info');
  };

  const handleExportSingleHtml = () => {
    exportSingleFileHtml(data);
    showToast('Đã xuất thành công tệp HTML offline độc lập!', 'success');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans-app antialiased text-slate-900 selection:bg-blue-900 selection:text-white">
      
      {/* Top Header */}
      <Header
        teacher={data.teacher}
        onOpenSearch={handleOpenSearchModal}
        onExportJson={handleExportJson}
        onImportJson={handleImportJson}
        onResetData={handleResetData}
        onExportHtml={handleExportSingleHtml}
        onToggleMobileMenu={() => setIsMobileSidebarOpen(prev => !prev)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main Body with Sidebar */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto p-3 sm:p-5 gap-5">
        
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            if (tab !== 'students') {
              setStudentClassFilter(undefined);
            }
          }}
          data={data}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Dynamic Tab Views */}
        <main className="flex-1 min-w-0">
          {activeTab === 'dashboard' && (
            <DashboardView
              data={data}
              onNavigate={setActiveTab}
              onQuickAction={handleQuickAction}
            />
          )}

          {activeTab === 'classes' && (
            <ClassesView
              data={data}
              onSaveClass={handleSaveClass}
              onDeleteClass={handleDeleteClass}
              onViewClassStudents={handleViewStudentsOfClass}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'students' && (
            <StudentsView
              data={data}
              initialClassFilter={studentClassFilter}
              onSaveStudent={handleSaveStudent}
              onSaveStudents={handleSaveStudents}
              onDeleteStudent={handleDeleteStudent}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'lessons' && (
            <LessonsView
              data={data}
              onSaveLesson={handleSaveLesson}
              onDeleteLesson={handleDeleteLesson}
              onToggleLessonStatus={handleToggleLessonStatus}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'assignments' && (
            <AssignmentsView
              data={data}
              onSaveAssignment={handleSaveAssignment}
              onDeleteAssignment={handleDeleteAssignment}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'grades' && (
            <GradesView
              data={data}
              onUpdateStudentScores={handleUpdateStudentScores}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'stats' && (
            <StatsView
              data={data}
            />
          )}

          {activeTab === 'notes' && (
            <NotesView
              data={data}
              onSaveNote={handleSaveNote}
              onDeleteNote={handleDeleteNote}
              onToggleImportant={handleToggleNoteImportant}
              onShowToast={showToast}
            />
          )}
        </main>

      </div>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-4 px-6 text-center text-xs text-slate-500">
        <p className="font-serif-literary text-slate-700 font-bold">
          QUẢN TRỊ HỌC TẬP NGỮ VĂN – NGUYỄN QUANG KIÊN
        </p>
        <p className="text-[11px] text-slate-400 mt-1">
          Giáo viên Ngữ văn • Trường THCS Thái Phiên • Dữ liệu lưu trữ bảo mật cục bộ tại trình duyệt (LocalStorage & Hoạt động 100% Offline)
        </p>
      </footer>

      {/* Search Modal */}
      <SearchResultsModal
        query={searchQuery}
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        data={data}
        onNavigate={setActiveTab}
      />

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

    </div>
  );
}
