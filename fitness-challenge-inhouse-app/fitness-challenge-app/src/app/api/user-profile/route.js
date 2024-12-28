import { getFirestore } from 'firebase-admin/firestore';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  try {
    const db = getFirestore();
    const userDoc = await db.collection('users').doc(email).get();

    return NextResponse.json({ exists: userDoc.exists });
  } catch (error) {
    console.error('Error checking user profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 