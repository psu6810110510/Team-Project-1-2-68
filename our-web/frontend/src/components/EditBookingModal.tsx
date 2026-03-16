import React, { useState, useEffect } from 'react';
import bookingAPI, { LearningMode, type Schedule, type Booking } from '../api/bookingAPI';
import { X, CheckCircle, Clock } from 'lucide-react';
import '../styles/BookingForm.css';

interface EditBookingModalProps {
  booking: Booking;
  courseId: string | undefined; // Used to fetch schedules if needed
  onSuccess: () => void;
  onClose: () => void;
}

const EditBookingModal: React.FC<EditBookingModalProps> = ({ booking, courseId, onSuccess, onClose }) => {
  const [learningMode, setLearningMode] = useState<LearningMode>(booking.learning_mode);
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>(booking.schedule_id);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [notes, setNotes] = useState(booking.notes || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSchedules = async () => {
      // We assume that the course ID might be needed to get schedules.
      // Alternatively, we could get all schedules, but it's better to fetch by course.
      // Since booking might only have schedule_id, the parent component needs to pass courseId.
      if (!courseId) return;
      try {
        const response = await bookingAPI.getSchedulesByCourse(courseId);
        setSchedules(response.data.data || []);
      } catch (err) {
        console.error('Failed to load schedules', err);
      }
    };
    fetchSchedules();
  }, [courseId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((learningMode === LearningMode.ONSITE || learningMode === LearningMode.HYBRID) && !selectedScheduleId) {
      setError('กรุณาเลือกรอบเรียน');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await bookingAPI.updateBooking(booking.id, {
        learning_mode: learningMode,
        schedule_id: selectedScheduleId,
        notes: notes
      });
      onSuccess();
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 409) {
        setError('ที่นั่งเต็มแล้วสำหรับรอบเรียน/รูปแบบที่เลือก');
      } else {
        setError('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
      }
    } finally {
      setLoading(false);
    }
  };

  const getModeLabel = (mode: LearningMode) => {
    switch (mode) {
      case LearningMode.ONLINE: return 'ออนไลน์ (เรียนผ่านวิดีโอ 100%)';
      case LearningMode.ONSITE: return 'ออนไซต์ (เรียนที่สถาบัน)';
      case LearningMode.HYBRID: return 'ผสมผสาน (เรียนออนไลน์และนัดพรีเซนต์)';
      default: return '';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      weekday: 'short', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="booking-modal-overlay">
      <div className="booking-modal">
        <div className="booking-modal-header">
          <h2>แก้ไขการจอง</h2>
          <button className="book-close-button" onClick={onClose}><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="booking-modal-body">
          {error && <div className="booking-error-banner">{error}</div>}

          <div className="booking-form-group">
            <label className="booking-form-label">รูปแบบการเรียนที่ต้องการเปลี่ยน</label>
            <div className="booking-mode-options">
              {Object.values(LearningMode).map(mode => (
                <div 
                  key={mode}
                  className={`booking-mode-option ${learningMode === mode ? 'selected' : ''}`}
                  onClick={() => setLearningMode(mode as LearningMode)}
                >
                  <div className="booking-mode-radio">
                    {learningMode === mode && <CheckCircle size={16} color="white" />}
                  </div>
                  <div className="booking-mode-info">
                    <span className="booking-mode-title">{mode}</span>
                    <span className="booking-mode-desc">{getModeLabel(mode as LearningMode)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {(learningMode === LearningMode.ONSITE || learningMode === LearningMode.HYBRID) && schedules.length > 0 && (
             <div className="booking-form-group">
               <label className="booking-form-label">เลือกรอบเวลาเรียนใหม่</label>
               <div className="booking-schedule-list">
                 {schedules.map(schedule => (
                   <div 
                     key={schedule.id}
                     className={`booking-schedule-option ${selectedScheduleId === schedule.id ? 'selected' : ''}`}
                     onClick={() => setSelectedScheduleId(schedule.id)}
                   >
                     <div className="booking-schedule-datetime">
                       <Clock size={16} />
                       {formatDate(schedule.start_time)} - {formatDate(schedule.end_time).split(' ')[1]}
                     </div>
                     <div className="booking-schedule-details">
                       <span>ห้อง: {schedule.room_location || 'ยังไม่กำหนด'}</span>
                     </div>
                   </div>
                 ))}
               </div>
             </div>
          )}

          <div className="booking-form-group">
            <label className="booking-form-label" htmlFor="booking-notes">หมายเหตุ (เพิ่มเติม)</label>
            <textarea 
              id="booking-notes"
              className="booking-textarea" 
              placeholder="ระบุข้อความเพิ่มเติมถึงผู้สอน (ไม่บังคับ)"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div className="booking-modal-footer">
            <button type="button" className="book-cancel-button" onClick={onClose} disabled={loading}>
              ยกเลิก
            </button>
            <button type="submit" className="book-submit-button" disabled={loading}>
              {loading ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBookingModal;
