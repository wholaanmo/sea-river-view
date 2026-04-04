// app/api/admin/send-refund-notification/route.js
import { NextResponse } from 'next/server';
import { db } from '../../../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { sendRefundNotificationEmail } from '../../../../lib/emailService';

export async function POST(request) {
  try {
    const { bookingId } = await request.json();

    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
    }

    // Fetch booking data from Firestore
    const bookingRef = doc(db, 'bookings', bookingId);
    const bookingSnap = await getDoc(bookingRef);

    if (!bookingSnap.exists()) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const booking = { id: bookingSnap.id, ...bookingSnap.data() };

    // Verify status is 'cancelled-by-guest'
    if (booking.status !== 'cancelled-by-guest') {
      return NextResponse.json({ error: 'Refund can only be sent for guest-cancelled reservations' }, { status: 400 });
    }

    // Send email
    const result = await sendRefundNotificationEmail(booking);

    if (result.success) {
      return NextResponse.json({ message: 'Refund notification email sent successfully' });
    } else {
      return NextResponse.json({ error: result.error || 'Failed to send email' }, { status: 500 });
    }
  } catch (error) {
    console.error('Refund notification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}