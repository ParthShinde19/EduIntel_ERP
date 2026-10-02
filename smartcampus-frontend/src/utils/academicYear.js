/**
 * Returns dynamic list of Academic Years.
 * Automatically adds a new academic year every year on June 1st (01-June).
 * Currently includes up to 2026-2027 and dynamically rolls over.
 */
export const getAcademicYears = () => {
  const now = new Date();
  const currentCalendarYear = now.getFullYear(); // e.g. 2026
  const currentMonth = now.getMonth(); // 0 = Jan, 5 = June

  // If current month >= 5 (June or later), current active academic year starts at current calendar year (e.g. June 2026 -> 2026-2027)
  const maxStartYear = currentMonth >= 5 ? currentCalendarYear : currentCalendarYear - 1;
  const targetMaxYear = Math.max(2026, maxStartYear);

  const years = [];
  const startYear = 2021; // Baseline starting academic year

  for (let y = targetMaxYear; y >= startYear; y--) {
    years.push(`${y}-${y + 1}`);
  }

  return years;
};
