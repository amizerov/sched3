import sql from 'mssql';
import { connectToDb } from "./connect";

export default async function getAvailableSemesters(
    faculty_id: number, plan_id: number
): Promise<{ semesters: number[]; error: string | null }> 
{
    let semesters: number[] = [];
    let error: string | null = null;
    try {
        await connectToDb();
        // Получаем все записи для данного плана и извлекаем уникальные семестры
        const result = await sql.query(`GetPlanTermLoads ${faculty_id}, ${plan_id}, 0`);
        
        // Извлекаем уникальные семестры из результата
        const uniqueSemesters = [...new Set(result.recordset.map((row: any) => row.Semester))]
            .filter(sem => sem > 0) // исключаем 0
            .sort((a, b) => a - b); // сортируем по возрастанию
            
        semesters = uniqueSemesters;
    } catch (e: Error | unknown) {
        if (e instanceof Error) {
            error = e.message;
        } else {
            error = String(e);
        }
    }

    return { semesters, error };
}
