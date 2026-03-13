import { useState, useEffect } from 'react';
import bookingAPI, { LearningMode, type Schedule, type ScheduleStats } from '../api/bookingAPI';
import '../styles/BookingForm.css';

interface BookingFormProps {
  courseId: string;
  isOnline: boolean;
  isOnsite: boolean;
  onBookingComplete?: (bookingId: string) => void;
  onClose?: () => void;
}

const BookingForm = ({
  courseId,
  isOnline,
  isOnsite,
  onBookingComplete,
  onClose,
}: BookingFormProps) => {
  const [learningMode, setLearningMode] = useState<LearningMode | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  // mapping schedule id -> stats
  const [statsMap, setStatsMap] = useState<Record<string, ScheduleStats>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch schedules when component mounts
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        setLoading(true);
        const response = await bookingAPI.getSchedulesByCourse(courseId);
        const list = response.data.data || [];
        setSchedules(list);

        // prefetch stats for each schedule so we can show availability immediately
        const statsPromises = list.map((sch) =>
          bookingAPI.getScheduleStats(sch.id).then((res) => res.data)
        );
        const allStats = await Promise.all(statsPromises);
        const map: Record<string, ScheduleStats> = {};
        allStats.forEach((s) => {
          map[s.schedule_id] = s;
        });
        setStatsMap(map);

        // หาเดือนเริ่มของคลาสแรกสุด (ถ้ามี)
        if (list.length > 0) {
          const firstDate = new Date(list[0].start_time);
          if (!isNaN(firstDate.getTime())) {
            setCurrentMonth(new Date(firstDate.getFullYear(), firstDate.getMonth(), 1));
          }
        }
      } catch (err: any) {
        setError('ไม่สามารถโหลดเวลาเรียนได้');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, [courseId]);

  // Fetch schedule stats when selected
  useEffect(() => {
    const fetchStats = async () => {
      if (!selectedSchedule) return;
      try {
        const statsResponse = await bookingAPI.getScheduleStats(selectedSchedule.id);
        // store in map as well
        setStatsMap((prev) => ({ ...prev, [selectedSchedule.id]: statsResponse.data }));
      } catch (err: any) {
        console.error('Error fetching schedule stats:', err);
      }
    };

    fetchStats();
  }, [selectedSchedule]);

  const handleLearningModeChange = (mode: LearningMode) => {
    setLearningMode(mode);
    setSelectedSchedule(null);
    setSelectedDate(null);
    setError(null);
  };

  const handleSubmit = async () => {
    try {
      if (!learningMode) {
        setError('กรุณาเลือกประเภทการเรียน');
        return;
      }

      if (learningMode === LearningMode.ONSITE && !selectedSchedule) {
        setError('กรุณาเลือกเวลาเรียน');
        return;
      }

      const scheduleId =
        learningMode === LearningMode.ONSITE
          ? selectedSchedule!.id
          : schedules[0]?.id;

      if (!scheduleId) {
        setError('ไม่พบเวลาเรียน');
        return;
      }

      const userStr = localStorage.getItem('user');
      if (!userStr) {
        setError('กรุณาเข้าสู่ระบบก่อน');
        return;
      }

      let userId: string | null = null;
      try {
        const user = JSON.parse(userStr);
        userId = user.id;
      } catch (e) {
        setError('ข้อมูลผู้ใช้ไม่ถูกต้อง');
        return;
      }

      if (!userId) {
        setError('ไม่พบรหัสผู้ใช้');
        return;
      }

      setSubmitting(true);
      const response = await bookingAPI.createBooking({
        user_id: userId,
        schedule_id: scheduleId,
        learning_mode: learningMode,
        notes: notes || undefined,
      });

      // Clear form
      setLearningMode(null);
      setSelectedSchedule(null);
      setNotes('');

      if (onBookingComplete) {
        onBookingComplete(response.data.id);
      }
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        'เกิดข้อผิดพลาดในการจองการเรียน';
      setError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };


  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // --- Calendar Helpers ---
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  // แมปวันที่เข้ากับลิสต์ของคลาส
  const getSchedulesForDate = (day: number) => {
    return schedules.filter(sch => {
      const schDate = new Date(sch.start_time);
      return schDate.getDate() === day &&
             schDate.getMonth() === currentMonth.getMonth() &&
             schDate.getFullYear() === currentMonth.getFullYear();
    });
  };

  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month); // 0 (Sun) - 6 (Sat)
    
    const days = [];
    const weekDays = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];

    // หัวตาราง (จันทร์ - อาทิตย์)
    const headerCells = weekDays.map((day, idx) => (
      <div key={`header-${idx}`} className="calendar-header-cell">
        {day}
      </div>
    ));

    // ช่องว่างก่อนเริ่มวันที่ 1
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-cell empty"></div>);
    }

    // วันที่ในเดือนนั้นๆ
    for (let d = 1; d <= daysInMonth; d++) {
      const dateSchedules = getSchedulesForDate(d);
      const hasClasses = dateSchedules.length > 0;
      
      const isSelected = selectedDate?.getDate() === d &&
                         selectedDate?.getMonth() === month &&
                         selectedDate?.getFullYear() === year;

      days.push(
        <div 
          key={d} 
          className={`calendar-cell ${hasClasses ? 'has-class' : ''} ${isSelected ? 'selected' : ''}`}
          onClick={() => {
            if (hasClasses) {
              const newSelectedDate = new Date(year, month, d);
              setSelectedDate(newSelectedDate);
              // reset selected schedule when viewing new date
              setSelectedSchedule(null);
            }
          }}
        >
          <span className="day-number">{d}</span>
          {hasClasses && <span className="class-indicator">•</span>}
        </div>
      );
    }

    return (
      <div className="calendar-container">
        <div className="calendar-nav">
          <button onClick={prevMonth} className="cal-nav-btn">{"<"}</button>
          <span className="cal-month-title">
            {currentMonth.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })}
          </span>
          <button onClick={nextMonth} className="cal-nav-btn">{">"}</button>
        </div>
        <div className="calendar-grid">
          {headerCells}
          {days}
        </div>
      </div>
    );
  };

  const filteredSchedules = selectedDate 
    ? schedules.filter(sch => {
        const schDate = new Date(sch.start_time);
        return schDate.getDate() === selectedDate.getDate() &&
               schDate.getMonth() === selectedDate.getMonth() &&
               schDate.getFullYear() === selectedDate.getFullYear();
      })
    : [];

  return (
    <div className="booking-form">
      <div className="booking-form-header">
        <h2>จองการเรียน</h2>
        {onClose && (
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        )}
      </div>

      {error && <div className="booking-error">{error}</div>}

      {/* Learning Mode Selection */}
      <div className="booking-section">
        <label className="section-label">เลือกประเภทการเรียน</label>
        <div className="learning-mode-options">
          {isOnline && (
            <button
              className={`mode-btn ${learningMode === LearningMode.ONLINE ? 'active' : ''}`}
              onClick={() => handleLearningModeChange(LearningMode.ONLINE)}
            >
              💻 ออนไลน์
            </button>
          )}
          {isOnsite && (
            <button
              className={`mode-btn ${learningMode === LearningMode.ONSITE ? 'active' : ''}`}
              onClick={() => handleLearningModeChange(LearningMode.ONSITE)}
            >
              🏢 ออนไซต์
            </button>
          )}
          {isOnline && isOnsite && (
            <button
              className={`mode-btn ${learningMode === LearningMode.HYBRID ? 'active' : ''}`}
              onClick={() => handleLearningModeChange(LearningMode.HYBRID)}
            >
              🔄 ผสมผสาน
            </button>
          )}
        </div>
      </div>

      {/* Schedule Selection for ONSITE */}
      {learningMode === LearningMode.ONSITE && (
        <div className="booking-section">
          <label className="section-label">📅 เลือกเวลาเรียน (ออนไซต์)</label>
          {loading ? (
            <div className="loading">กำลังโหลดเวลาเรียน...</div>
          ) : schedules.length === 0 ? (
            <div className="no-schedules">ไม่มีเวลาเรียนที่สามารถจองได้</div>
          ) : (
            <>
              {/* ส่วนแสดงปฏิทิน */}
              {renderCalendar()}

              {selectedDate && (
                <>
                  <div style={{ marginTop: '20px', marginBottom: '12px', fontSize: '0.95rem', color: '#1e293b', fontWeight: 'bold' }}>
                    ตารางเรียนวันที่ {formatDate(selectedDate.toISOString())}
                  </div>
                  <div className="schedules-list">
                    {filteredSchedules.map((schedule) => {
                  // use per-schedule stats if available
                  const statsForThis = statsMap[schedule.id];
                  const bookedSeats = statsForThis ? statsForThis.onsite_count : 0;
                  const totalSeats = schedule.max_onsite_seats || 999;
                  const availableSeats = Math.max(0, totalSeats - bookedSeats);
                  const isFull = totalSeats > 0 && availableSeats === 0;
                  
                  return (
                    <div
                      key={schedule.id}
                      className={`schedule-item ${
                        selectedSchedule?.id === schedule.id ? 'selected' : ''
                      } ${isFull ? 'disabled' : ''}`}
                      onClick={() => {
                        if (!isFull) {
                          setSelectedSchedule(schedule);
                        }
                      }}
                      style={{
                        opacity: isFull ? 0.5 : 1,
                        cursor: isFull ? 'not-allowed' : 'pointer',
                      }}
                    >
                      <div className="schedule-info">
                        <div className="schedule-date">
                          📅 {formatDate(schedule.start_time)}
                        </div>
                        <div className="schedule-time">
                          🕐 {new Date(schedule.start_time).toLocaleTimeString('th-TH', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}{' '}
                          -{' '}
                          {new Date(schedule.end_time).toLocaleTimeString('th-TH', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                        {schedule.room_location && (
                          <div className="schedule-location">
                            📍 {schedule.room_location}
                          </div>
                        )}
                        
                        {/* Seat Information */}
                        <div style={{
                          marginTop: '8px',
                          padding: '8px 10px',
                          backgroundColor: isFull ? '#fee2e2' : '#ecfdf5',
                          borderRadius: '6px',
                          fontSize: '0.9rem',
                          fontWeight: '500',
                          color: isFull ? '#991b1b' : '#065f46',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <div>
                            {isFull ? (
                              <>❌ เต็มแล้ว</>
                            ) : availableSeats < 5 ? (
                              <>⚠️ เหลือเพียง {availableSeats} ที่</>
                            ) : (
                              <>✅ ว่าง {availableSeats} ที่</>
                            )}
                          </div>
                          <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>
                            {availableSeats}/{totalSeats}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              </>
            )}
            </>
          )}
        </div>
      )}

      {/* Notes */}
      <div className="booking-section">
        <label className="section-label">หมายเหตุเพิ่มเติม (ไม่บังคับ)</label>
        <textarea
          className="booking-notes"
          placeholder="เช่น ข้อความพิเศษสำหรับผู้สอน..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />
      </div>

      {/* Submit Button */}
      <button
        className="booking-submit-btn"
        onClick={handleSubmit}
        disabled={
          submitting || (learningMode === LearningMode.ONSITE && !selectedSchedule)
        }
      >
        {submitting ? 'กำลังจอง...' : 'ยืนยันการจอง'}
      </button>
    </div>
  );
};

export default BookingForm;
