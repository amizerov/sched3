import sql from 'mssql';
import { connectToDb } from "./connect";

export interface StudyPlan {
    Plan_ID: number;
    Plan_Name: string;
    Start_Year: number;
    Faculty_Name: string;
}

export default async function getAvailablePlans(
    faculty_id: number
): Promise<{ plans: StudyPlan[]; error: string | null }> 
{
    let plans: StudyPlan[] = [];
    let error: string | null = null;
    try {
        await connectToDb();
        // Получаем все доступные учебные планы для факультета
        const result = await sql.query(`
            -- @Nfirm – идентификатор факультета
            SELECT 
                p.PrK_Plan      AS Plan_ID,      -- код учебного плана
                p.Name_Plan     AS Plan_Name,    -- название плана
                p.God           AS Start_Year,   -- год создания
                f.Firm_Name     AS Faculty_Name, -- название факультета
                p.Date_Plan     AS Approval_Date, -- дата утверждения
                p.Num_Prot      AS Protocol_Number,-- номер протокола
                p.Fk_Type       AS Plan_Type,    -- код типа плана (бакалавриат, магистратура и т.п.)
                p.Fk_Form_Educ  AS Education_Form,-- код формы обучения (очная, заочная)
                p.Plan_Closed    AS Plan_Closed    -- признак закрытия плана (0 – действующий, 1 – закрыт)
            FROM dbo.Educ_Plan AS p join dbo.Firm AS f ON p.Nfirm = f.Nfirm
            WHERE p.Nfirm = ${faculty_id}          -- выбираем нужный факультет
            -- при необходимости исключить закрытые планы:
            -- AND p.Plan_Closed = 0
            ORDER BY p.God DESC, p.Name_Plan;
        `);
        
        plans = result.recordset;
    } catch (e: Error | unknown) {
        if (e instanceof Error) {
            error = e.message;
        } else {
            error = String(e);
        }
    }

    return { plans, error };
}
