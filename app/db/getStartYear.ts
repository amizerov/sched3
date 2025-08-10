import sql from 'mssql';
import { connectToDb } from './connect';

export async function getStartYear(planId: number, facultyId: number): Promise<number | null> {
  try {
    await connectToDb();
    
    const query = `
      SELECT MIN(Year_Enter) AS StartYear
      FROM dbo.Plan_Year_Enter
      WHERE FK_Plan = ${planId}
        AND Nfirm   = ${facultyId};
    `;
    
    const result = await sql.query(query);
    
    return result.recordset[0]?.StartYear || null;
  } catch (error) {
    console.error('Error fetching start year:', error);
    return null;
  }
}
