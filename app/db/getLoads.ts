import sql from 'mssql';
import { connectToDb } from "./connect";
import { SubjectRow } from './models';

export default async function getLoads(
    faculty_id: number, plan_id: number, semester: number
): Promise<{ data: SubjectRow[]; error: string | null }> 
{
    let data: SubjectRow[] = [];
    let error: string | null = null;
    try {
        await connectToDb();
        const result = await sql.query(`
            EXEC am_GetSubjLoads2 ${faculty_id}, ${plan_id}, ${semester}
        `);
        data = result.recordset;
    } catch (e: Error | unknown) {
        if (e instanceof Error) {
        error = e.message;
        } else {
        error = String(e);
        }
    }

    return { data, error };
}
