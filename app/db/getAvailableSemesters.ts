export default function getAvailableSemesters(
    loads: Array<{ Semester: number }>
): { semesters: number[]; error: string | null } {
    try {
        const uniqueSemesters = [...new Set(loads.map(row => row.Semester))]
            .filter((sem): sem is number => typeof sem === 'number' && sem > 0)
            .sort((a, b) => a - b);
        return { semesters: uniqueSemesters, error: null };
    } catch (e: Error | unknown) {
        const error = e instanceof Error ? e.message : String(e);
        return { semesters: [], error };
    }
}
