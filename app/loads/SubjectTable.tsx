'use client';

import { SubjectRow } from '../db/models';
import PaginatedTable from './PaginatedTable';

export default function SubjectTable({ 
  data,
  facultyId,
  faculty,
  planId,
  plan,
  startYear
}: { 
  data: SubjectRow[];
  facultyId: number;
  faculty: string;
  planId: number;
  plan: string;
  startYear: number;
}) {

  return (
      <PaginatedTable 
        data={data} 
        facultyId={facultyId.toString()}
        faculty={faculty}
        planId={planId.toString()}
        plan={plan}
        startYear={startYear.toString()}
      />
  );
}
