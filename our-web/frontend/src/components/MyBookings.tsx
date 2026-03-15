import { useEffect, useState } from 'react';
import bookingAPI, { type Booking, BookingStatus, LearningMode } from '../api/bookingAPI';
import EditBookingModal from './EditBookingModal';
import '../styles/MyBookings.css';

const MyBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
          setError('กรุณาเข้าสู่ระบบก่อน');
          setLoading(false);
          return;
        }

        let userId: string | null = null;
        try {
          const user = JSON.parse(userStr);
          userId = user.id;
        } catch (e) {
          setError('ข้อมูลผู้ใช้ไม่ถูกต้อง');
          setLoading(false);
          return;
        }

        if (!userId) {
          setError('ไม่พบรหัสผู้ใช้');
          setLoading(false);
          return;
        }

        const response = await bookingAPI.getBookingsByUser(userId);
        setBookings(response.data.data || []);
      } catch (err: any) {
        setError('ไม่สามารถโหลดรายการการจองได้');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('ต้องการยกเลิกการจองนี้หรือไม่?')) return;

    try {
      await bookingAPI.cancelBooking(bookingId);
      // Update the status of the cancelled booking instead of removing it from the list
      setBookings(bookings.map((b) => 
        b.id === bookingId ? { ...b, status: BookingStatus.CANCELLED } : b
      ));
    } catch (err: any) {
      alert('ไม่สามารถยกเลิกการจองได้');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.CONFIRMED:
        return 'confirmed';
      case BookingStatus.PENDING:
        return 'pending';
      case BookingStatus.COMPLETED:
        return 'completed';
      case BookingStatus.CANCELLED:
        return 'cancelled';
      case BookingStatus.WAITLIST:
        return 'waitlist';
      default:
        return 'pending';
    }
  };

  const getStatusLabel = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.CONFIRMED:
        return '✓ ยืนยันแล้ว';
      case BookingStatus.PENDING:
        return '⏳ รอยืนยัน';
      case BookingStatus.COMPLETED:
        return '✓ เสร็จสิ้น';
      case BookingStatus.CANCELLED:
        return '✕ ยกเลิกแล้ว';
      case BookingStatus.WAITLIST:
        return '⏳ รอคิว';
      default:
        return '-';
    }
  };

  const getModeIcon = (mode: LearningMode) => {
    switch (mode) {
      case LearningMode.ONLINE:
        return '💻';
      case LearningMode.ONSITE:
        return '🏢';
      case LearningMode.HYBRID:
        return '🔄';
      default:
        return '📚';
    }
  };

  const getModeLabel = (mode: LearningMode) => {
    switch (mode) {
      case LearningMode.ONLINE:
        return 'ออนไลน์';
      case LearningMode.ONSITE:
        return 'ออนไซต์';
      case LearningMode.HYBRID:
        return 'ผสมผสาน';
      default:
        return '-';
    }
  };

  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);

  if (loading) {
    return <div className="my-bookings-loading">กำลังโหลดรายการการจอง...</div>;
  }

  if (error) {
    return <div className="my-bookings-error">{error}</div>;
  }

  if (bookings.length === 0) {
    return (
      <div className="my-bookings">
        <h2>รายการการจอง</h2>
        <div className="my-bookings-empty">
          <p>📭 ยังไม่มีการจองการเรียน</p>
          <a href="/courses">ไปดูคอร์สทั้งหมด</a>
        </div>
      </div>
    );
  }

  return (
    <div className="my-bookings">
      <h2>รายการการจองของฉัน</h2>
      <p className="booking-count">จำนวนการจองทั้งหมด: {bookings.length}</p>

      <div className="bookings-list">
        {bookings.map((booking) => (
          <div key={booking.id} className="booking-card">
            <div className="booking-card-header">
              <div className="booking-mode">
                <span className="mode-icon">{getModeIcon(booking.learning_mode)}</span>
                <span className="mode-label">{getModeLabel(booking.learning_mode)}</span>
              </div>
              <div className={`booking-status ${getStatusColor(booking.status)}`}>
                {getStatusLabel(booking.status)}
              </div>
            </div>

            <div className="booking-card-content">
              <div className="booking-info">
                <p className="booking-label">รหัสการจอง</p>
                <p className="booking-value">{booking.id.substring(0, 8)}...</p>
              </div>

              <div className="booking-info">
                <p className="booking-label">เวลาที่จอง</p>
                <p className="booking-value">{formatDate(booking.created_at)}</p>
              </div>

              {booking.booking_date && (
                <div className="booking-info">
                  <p className="booking-label">วันที่เรียน</p>
                  <p className="booking-value">{formatDate(booking.booking_date)}</p>
                </div>
              )}

              {booking.notes && (
                <div className="booking-info">
                  <p className="booking-label">หมายเหตุ</p>
                  <p className="booking-value booking-notes">{booking.notes}</p>
                </div>
              )}
            </div>

            <div className="booking-card-footer">
              {booking.status === BookingStatus.PENDING ||
              booking.status === BookingStatus.CONFIRMED ||
              booking.status === BookingStatus.WAITLIST ? (
                <>
                  <button
                    className="booking-edit-btn"
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      background: 'white',
                      cursor: 'pointer',
                      fontWeight: 500,
                      color: '#475569',
                      marginRight: '12px'
                    }}
                    onClick={() => setEditingBooking(booking)}
                  >
                    ✎ แก้ไข
                  </button>
                  <button
                    className="booking-cancel-btn"
                    onClick={() => handleCancelBooking(booking.id)}
                  >
                    ยกเลิกการจอง
                  </button>
                </>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      {editingBooking && (
        <EditBookingModal 
          booking={editingBooking}
          // Note: In real setup you'd get courseId from booking details relations. Usually schedule comes with course.
          // Since our Booking interface doesn't neatly hold course_id at top level, we pass a helper if needed or modify the backend to return course_id.
          courseId={editingBooking.course_id} // Backend needs to pass course_id for this to fetch new schedules smoothly
          onSuccess={() => {
            setEditingBooking(null);
            // Refresh logic: for simplicity just reload window or mutate state
            window.location.reload(); 
          }}
          onClose={() => setEditingBooking(null)}
        />
      )}
    </div>
  );
};

export default MyBookings;
