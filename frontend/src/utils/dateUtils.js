import { format, addDays, differenceInDays, startOfWeek, endOfWeek } from 'date-fns';
import { sr } from 'date-fns/locale';

export const formatDate = (date) => {
  return format(new Date(date), 'dd.MM.yyyy', { locale: sr });
};

export const formatPeriod = (startDate, endDate) => {
  return `${formatDate(startDate)} – ${formatDate(endDate)}`;
};

export const generateWeeksBetween = (startDate, endDate) => {
  const weeks = [];
  let current = new Date(startDate);
  
  while (current <= new Date(endDate)) {
    const weekStart = startOfWeek(current, { locale: sr });
    const weekEnd = endOfWeek(current, { locale: sr });
    
    weeks.push({
      weekStart,
      weekEnd,
      weekLabel: formatPeriod(weekStart, weekEnd)
    });
    
    current = addDays(current, 7);
  }
  
  return weeks;
};

export const calculateCoverage = (stockKg, consPerDayKg) => {
  if (!consPerDayKg) return { coverage2: 0, coverage1: 0 };
  
  const coverage2 = stockKg / consPerDayKg;
  const coverage1 = stockKg / (consPerDayKg / 2);
  
  return {
    coverage2: Number(coverage2.toFixed(2)),
    coverage1: Number(coverage1.toFixed(2))
  };
};

export const calculateConsumptionStats = (consumptions) => {
  if (!consumptions?.length) return null;
  
  const totalConsumption = consumptions.reduce((sum, c) => sum + c.consumptionUnits, 0);
  const totalCost = consumptions.reduce((sum, c) => sum + c.consumptionCost, 0);
  const avgConsumptionPerWeek = totalConsumption / consumptions.length;
  const avgCostPerWeek = totalCost / consumptions.length;
  
  return {
    totalConsumption,
    totalCost,
    avgConsumptionPerWeek,
    avgCostPerWeek
  };
};

export const getWeekNumber = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}; 