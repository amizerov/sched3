import { NextRequest, NextResponse } from 'next/server';
import getAvailableSemesters from '../../db/getAvailableSemesters';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const facultyId = parseInt(searchParams.get('facultyId') || '1');
  const planId = parseInt(searchParams.get('planId') || '368');

  try {
    const result = await getAvailableSemesters(facultyId, planId);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: 'Ошибка загрузки семестров' },
      { status: 500 }
    );
  }
}
