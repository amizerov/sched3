import { NextRequest, NextResponse } from 'next/server';
import getFaculties from '../../db/getFaculties';

export async function GET() {
  try {
    const result = await getFaculties();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: 'Ошибка загрузки факультетов' },
      { status: 500 }
    );
  }
}
