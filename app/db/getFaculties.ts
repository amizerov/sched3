import sql from 'mssql';
import { connectToDb } from "./connect";

export interface Faculty {
    Faculty_ID: number;
    Faculty_Name: string;
    God: number;
    Plans: number;
}

export default async function getFaculties(): Promise<{ faculties: Faculty[]; error: string | null }> 
{
    let faculties: Faculty[] = [];
    let error: string | null = null;
    try {
        await connectToDb();
        const result = await sql.query(`
            SELECT 
                f.Nfirm        AS Faculty_ID,   -- идентификатор факультета
                f.Firm_Name    AS Faculty_Name, -- полное название
                f.Short_Name   AS Short_Name,
				max(god) God,
                count(*) AS Plans
            FROM dbo.Educ_Plan AS p
            JOIN dbo.Firm      AS f ON p.Nfirm = f.Nfirm
            join Type_Firm t on f.FK_Type_Firm = t.PrK_Type_Firm
            -- при необходимости исключить закрытые планы, можно добавить условие:
            WHERE 1=1 
              -- AND p.Plan_Closed = 0
              AND FK_Type_Firm = 3
              AND NFirm_Parent = 99
            group by
                f.Nfirm,
                f.Firm_Name,
                f.Short_Name
            ORDER BY Faculty_ID
        `);
        
        faculties = result.recordset;
    } catch (e: Error | unknown) {
        if (e instanceof Error) {
            error = e.message;
        } else {
            error = String(e);
        }
    }

    return { faculties, error };
}
