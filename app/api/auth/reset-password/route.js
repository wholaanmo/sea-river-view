// app/api/auth/reset-password/route.js
import { NextResponse } from 'next/server';
import { db } from '../../../../lib/firebase';          // client SDK for Firestore
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth as adminAuth } from '../../../../lib/firebaseAdmin';   // Admin SDK

export async function POST(request) {
  try {
    const { token, email, newPassword } = await request.json();

    if (!token || !email || !newPassword) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    // 1. Verify reset token from Firestore (client SDK)
    const resetRef = doc(db, 'passwordResets', token);
    const resetDoc = await getDoc(resetRef);

    if (!resetDoc.exists()) {
      return NextResponse.json({ error: 'Invalid or expired reset link' }, { status: 400 });
    }

    const resetData = resetDoc.data();

    if (resetData.used) {
      return NextResponse.json({ error: 'Reset link already used' }, { status: 400 });
    }
    if (resetData.email !== email) {
      return NextResponse.json({ error: 'Invalid reset link' }, { status: 400 });
    }
    if (new Date() > new Date(resetData.expiresAt)) {
      return NextResponse.json({ error: 'Reset link has expired' }, { status: 400 });
    }

    // 2. Update password using Admin SDK (always works on server)
    await adminAuth.updateUser(resetData.uid, { password: newPassword });

    // 3. Mark token as used
    await updateDoc(resetRef, { used: true, updatedAt: new Date().toISOString() });

    return NextResponse.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Failed to reset password. Please try again.' }, { status: 500 });
  }
}