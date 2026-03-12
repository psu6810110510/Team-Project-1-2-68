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
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [scheduleStats, setScheduleStats] = useState<ScheduleStats | null>(null);
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
        setSchedules(response.data.data || []);
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
        setScheduleStats(statsResponse.data);
      } catch (err: any) {
        console.error('Error fetching schedule stats:', err);
      }
    };

    fetchStats();
  }, [selectedSchedule]);

  const handleLearningModeChange = (mode: LearningMode) => {
    setLearningMode(mode);
    setSelectedSchedule(null);
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

  const getAvailableSeats = () => {
    if (!selectedSchedule || !scheduleStats) return 0;
    if (!selectedSchedule.max_onsite_seats) return 999;
    return Math.max(0, selectedSchedule.max_onsite_seats - scheduleStats.onsite_count);
  };

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
          <label className="section-label">เลือกเวลาเรียน</label>
          {loading ? (
            <div className="loading">กำลังโหลดเวลาเรียน...</div>
          ) : schedules.length === 0 ? (
            <div className="no-schedules">ไม่มีเวลาเรียนที่สามารถจองได้</div>
          ) : (
            <div className="schedules-list">
              {schedules.map((schedule) => {
                const seats = getAvailableSeats();
                return (
                  <div
                    key={schedule.id}
                    className={`schedule-item ${
                      selectedSchedule?.id === schedule.id ? 'selected' : ''
                    }`}
                    onClick={() => {
                      if (seats > 0 || !schedule.max_onsite_seats) {
                        setSelectedSchedule(schedule);
                      }
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
                      {schedule.max_onsite_seats && (
                        <div className={`schedule-seats ${seats === 0 ? 'full' : ''}`}>
                          {'🪑 ' + seats + ' seats available'}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
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
