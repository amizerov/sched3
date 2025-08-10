import { NextRequest, NextResponse } from 'next/server';
import getLoads from '../../db/getLoads';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const facultyId = parseInt(searchParams.get('facultyId') || '0');
  const planId = parseInt(searchParams.get('planId') || '0');
  const semester = parseInt(searchParams.get('semester') || '0');

  try {
    const result = await getLoads(facultyId, planId, semester);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: 'Ошибка загрузки данных' },
      { status: 500 }
    );
  }
}
