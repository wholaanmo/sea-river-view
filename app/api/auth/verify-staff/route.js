// app/api/auth/verify-staff/route.js
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const email = searchParams.get('email');
  
  // Redirect to the verification page with parameters
  const redirectUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/verify-staff?token=${token}&email=${email}`;
  
  return NextResponse.redirect(redirectUrl);
}