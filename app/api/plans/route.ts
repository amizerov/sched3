import { NextRequest, NextResponse } from 'next/server';
import getAvailablePlans from '../../db/getAvailablePlans';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const facultyId = parseInt(searchParams.get('facultyId') || '1');

  try {
    const result = await getAvailablePlans(facultyId);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: 'Ошибка загрузки планов' },
      { status: 500 }
    );
  }
}
