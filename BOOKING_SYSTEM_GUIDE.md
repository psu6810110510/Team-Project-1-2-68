# 📚 Booking System Documentation

## ✅ System Status
- **Database**: PostgreSQL running on port 5435 ✓
- **Backend API**: NestJS running on port 3000 ✓
- **Frontend**: React/Vite running on port 5173 ✓

---

## 🎯 Booking System Features

### 1. **Core Booking Functionality**

#### Create Booking
- **Endpoint**: `POST /bookings`
- **Features**:
  - Users can book courses with different learning modes (ONLINE, ONSITE, HYBRID)
  - Automatic seat quota checking
  - Prevents double bookings for same schedule
  - Supports optional notes/comments

#### Get Booking Information
- **Get by ID**: `GET /bookings/:id`
- **Get by User**: `GET /bookings/user/:userId`
- **Get by Schedule**: `GET /bookings/schedule/:scheduleId`
- **Get Statistics**: `GET /bookings/schedule/:scheduleId/stats`

#### Manage Bookings
- **Confirm Booking**: `PUT /bookings/:id/confirm`
- **Cancel Booking**: `PUT /bookings/:id/cancel`

---

### 2. **Learning Modes**

The system supports three learning modes:

| Mode | Icon | Description |
|------|------|-------------|
| **ONLINE** | 💻 | Remote/virtual classes |
| **ONSITE** | 🏢 | In-person classes at physical location |
| **HYBRID** | 🔄 | Mixed online and in-person |

---

### 3. **Booking Status Flow**

```
PENDING → CONFIRMED → COMPLETED
   ↓
CANCELLED (at any time)
```

| Status | Description |
|--------|-------------|
| **PENDING** | Initial status, awaiting confirmation |
| **CONFIRMED** | Booking confirmed by admin/system |
| **COMPLETED** | Course completed |
| **CANCELLED** | Booking cancelled by user or admin |

---

### 4. **Seat Management**

#### Seat Quota System
- **SeatQuota Table**: Stores capacity limits per schedule and learning mode
- **Default Limits**: Falls back to `Schedule.max_onsite_seats` if no quota is set
- **Validation**: 
  - Counts PENDING + CONFIRMED bookings
  - Rejects booking if seats are full
  - Supports unlimited seats when quota is not set

---

### 5. **Frontend Components**

### BookingForm Component
**Location**: `src/components/BookingForm.tsx`

**Features**:
- Learning mode selection with visual buttons
- Schedule selection for ONSITE bookings only
- Available seats display
- Notes/comments field
- Real-time seat availability updates
- Error handling and validation

**Props**:
```typescript
interface BookingFormProps {
  courseId: string;          // Course identifier
  isOnline: boolean;         // Whether online option is available
  isOnsite: boolean;         // Whether onsite option is available
  onBookingComplete?: (bookingId: string) => void;  // Callback after success
  onClose?: () => void;      // Close button handler
}
```

### MyBookings Component
**Location**: `src/components/MyBookings.tsx`

**Features**:
- Display all user bookings with status
- Cancel booking functionality
- Booking details with dates and notes
- Status color coding
- Learning mode icons

### Cart Component Integration
**Location**: `src/components/Cart.tsx`

**Features**:
- Manage selected courses
- Payment integration with QR code
- Booking creation during checkout
- Course removal

---

### 6. **Backend Architecture**

### BookingService Methods
```typescript
// Create a new booking with validation
createBooking(dto: CreateBookingDto): Promise<Booking>

// Retrieve booking by ID
getBookingById(id: string): Promise<Booking>

// Get all bookings for a user
getBookingsByUser(userId: string): Promise<Booking[]>

// Get all bookings for a schedule
getBookingsBySchedule(scheduleId: string): Promise<Booking[]>

// Update booking status
updateBookingStatus(id: string, status: BookingStatus): Promise<Booking>

// Confirm a booking
confirmBooking(id: string): Promise<Booking>

// Cancel a booking
cancelBooking(id: string): Promise<Booking>

// Get onsite booked count for a course
getOnsiteBookedCountByCourse(courseId: string): Promise<number>

// Get statistics for a schedule
getBookingStats(scheduleId: string): Promise<BookingStats>
```

---

### 7. **Database Schema**

### Bookings Table
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | FK to users |
| `schedule_id` | UUID | FK to schedules |
| `learning_mode` | ENUM | ONLINE, ONSITE, HYBRID |
| `status` | ENUM | PENDING, CONFIRMED, COMPLETED, CANCELLED |
| `booking_date` | TIMESTAMP | Date of class |
| `notes` | TEXT | Optional notes |
| `created_at` | TIMESTAMP | Record creation time |
| `updated_at` | TIMESTAMP | Last update time |

### SeatQuota Table
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `schedule_id` | UUID | FK to schedules |
| `learning_mode` | ENUM | ONLINE, ONSITE, HYBRID |
| `quota` | INTEGER | Capacity limit |
| `created_at` | TIMESTAMP | Record creation time |

---

### 8. **Sample Test Data**

**Test Accounts**:
```
Admin:
  Email: admin@born2code.com
  Password: password123

Teacher:
  Email: teacher@born2code.com
  Password: password123

Student:
  Email: student@born2code.com
  Password: password123
```

**Sample Courses**:
- Full Stack Web Development (Online + Onsite)
- React Advanced (Online)
- Node.js Mastery (Onsite)
- Data Science 101 (Hybrid)
- Cybersecurity Basics (Online)

**Sample Schedules**:
- Created for each course with different dates/times
- Full Stack: Tuesday & Thursday 14:00-17:00, Room 202 Building B
- Onsite courses: Various times with max 25 seats

---

### 9. **API Response Examples**

**Create Booking Response**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "PENDING",
  "learning_mode": "ONSITE",
  "message": "Booking created successfully"
}
```

**Get User Bookings Response**:
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "schedule_id": "550e8400-e29b-41d4-a716-446655440001",
      "learning_mode": "ONSITE",
      "status": "CONFIRMED",
      "created_at": "2025-03-12T10:30:00Z"
    }
  ],
  "total": 1,
  "user_id": "550e8400-e29b-41d4-a716-446655440002"
}
```

**Booking Stats Response**:
```json
{
  "schedule_id": "550e8400-e29b-41d4-a716-446655440001",
  "total": 15,
  "confirmed": 12,
  "online_booked": 8,
  "onsite_booked": 4,
  "max_onsite_seats": 25,
  "available_onsite_seats": 21
}
```

---

### 10. **Error Handling**

| Error | HTTP Code | Message |
|-------|-----------|---------|
| User not found | 404 | User not found |
| Schedule not found | 404 | Schedule not found |
| Booking not found | 404 | Booking not found |
| Already booked | 409 | User already booked this schedule |
| No seats available | 409 | No available seats for {learning_mode} booking |

---

### 11. **Usage Flow**

#### For Students:
1. Browse courses on `/courses`
2. View course details on `/course/:id`
3. Click "จองการเรียน" (Book learning)
4. Select learning mode (Online/Onsite/Hybrid)
5. Select schedule if onsite (optional notes)
6. View bookings in "My Bookings" section
7. Cancel bookings if needed

#### For Admins:
1. Monitor all bookings per schedule
2. Check booking statistics
3. View capacity and seat availability
4. Manage seat quotas per schedule

---

### 12. **Performance Considerations**

- Queries use TypeORM for efficient database access
- Seat counting includes PENDING + CONFIRMED status
- Pagination supported for large booking lists
- Schedule stats aggregated with SQL COUNT operations

---

## 📝 How to Use the Booking System

### Starting the System
```bash
# 1. Start Docker (PostgreSQL)
cd Team-Project-1-2-68/our-web
docker-compose up -d

# 2. Seed database
cd backend
npm run seed

# 3. Start backend
npm run start:dev

# 4. Start frontend (in new terminal)
cd ../frontend
npm run dev
```

### Testing the Booking System
1. Go to: `http://localhost:5173`
2. Click "เข้าสู่ระบบ" (Login)
3. Use student@born2code.com / password123
4. Go to "คอร์สทั้งหมด" (All Courses)
5. Select a course and click "จองการเรียน" (Book Learning)
6. Choose learning mode and schedule
7. Submit booking
8. View booked courses in profile

---

## 🚀 Future Enhancements

- [ ] Email notifications for booking confirmation
- [ ] Booking history and attendance tracking
- [ ] Waitlist management for full schedules
- [ ] Booking modification (change schedule/mode)
- [ ] Bulk booking operations
- [ ] Export booking reports (Excel/PDF)
- [ ] Calendar view for schedules
- [ ] SMS notifications
- [ ] Refund management
- [ ] Early bird discounts

---

**Last Updated**: March 12, 2026
**Version**: 1.0.0
