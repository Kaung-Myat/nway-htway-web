import React, { useMemo } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { addDays, subDays, isSameDay } from 'date-fns';
import Card from '../ui/Card';
import Button from '../ui/Button';

const CalendarView = ({ selectedDate, setSelectedDate, cycleData, isLogMode, onConfirm }) => {
  // Memoized helper functions for Calendar Logic to optimize performance
  const isPastPeriod = useMemo(() => (date) => {
    if (!cycleData?.history) return false;
    return cycleData.history.some(startStr => {
      const startDate = new Date(startStr);
      for (let i = 0; i < 5; i++) {
        if (isSameDay(date, addDays(startDate, i))) return true;
      }
      return false;
    });
  }, [cycleData?.history]);

  const isPredictedPeriod = useMemo(() => (date) => {
    if (!cycleData?.lastLogDate || !cycleData?.cycleLength) return false;
    const lastDate = new Date(cycleData.lastLogDate);
    const nextStartDate = addDays(lastDate, cycleData.cycleLength);
    for (let i = 0; i < 5; i++) {
      if (isSameDay(date, addDays(nextStartDate, i))) return true;
    }
    return false;
  }, [cycleData?.lastLogDate, cycleData?.cycleLength]);

  const isOvulationDay = useMemo(() => (date) => {
    if (!cycleData?.lastLogDate || !cycleData?.cycleLength) return false;
    const lastDate = new Date(cycleData.lastLogDate);
    const nextStartDate = addDays(lastDate, cycleData.cycleLength);
    const ovulationDate = subDays(nextStartDate, 14);
    return (
      isSameDay(date, ovulationDate) ||
      isSameDay(date, addDays(ovulationDate, 1)) ||
      isSameDay(date, subDays(ovulationDate, 1))
    );
  }, [cycleData?.lastLogDate, cycleData?.cycleLength]);

  // Memoize the tileClassName function to prevent unnecessary re-renders
  const tileClassName = useMemo(() => ({ date, view }) => {
    if (view === 'month') {
      if (isPastPeriod(date)) return 'tile-past';
      if (isPredictedPeriod(date)) return 'tile-predict';
      if (isOvulationDay(date)) return 'tile-fertile';
    }
  }, [isPastPeriod, isPredictedPeriod, isOvulationDay]);

  return (
    <div style={{ padding: '20px', paddingBottom: isLogMode ? '20px' : '100px' }}>
      <h2 className="section-title">
        {isLogMode ? "Choose the date your period started:" : "📅 ပြက္ခဒိန် & ခန့်မှန်းချက်"}
      </h2>
      <Card>
        <Calendar
          onChange={setSelectedDate}
          value={selectedDate}
          locale="en-US"
          tileClassName={tileClassName}
        />
        {!isLogMode && (
          <div className="legend-container">
            <div className="legend-item">
              <div className="legend-dot" style={{ background: 'var(--primary)' }}></div>
              <span>ရာသီရက်</span>
            </div>
            <div className="legend-item">
              <div className="legend-dot" style={{ background: 'var(--primary-light)' }}></div>
              <span>ခန့်မှန်းရက်</span>
            </div>
            <div className="legend-item">
              <div className="legend-dot" style={{ background: '#10b981' }}></div>
              <span>မျိုးဥကြွေရက်</span>
            </div>
          </div>
        )}
      </Card>

      {isLogMode && (
        <div style={{ padding: '20px' }}>
          <Button
            onClick={onConfirm}
            className="w-full py-3 rounded-xl font-bold text-lg"
          >
            Confirm: {selectedDate.toLocaleDateString()}
          </Button>
        </div>
      )}
    </div>
  );
};

export default CalendarView;