import React, { useMemo } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { Heart } from 'lucide-react';
import { calculateProgressDegree, getStatusTextString, getDisplayDay } from '../../utils/cycleUtils';

const DashboardView = ({ loading, cycleData, user, onCheckInClick }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  if (!cycleData || !cycleData.found) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', marginTop: '50px' }}>
        <h2>မင်္ဂလာပါ {user?.first_name || 'Sis'}! 👋</h2>
        <Card>
          <p>ရာသီမှတ်တမ်း မရှိသေးပါဘူးရှင်။</p>
          <p style={{ color: 'var(--text-muted)' }}>စတင်မှတ်သားဖို့ အောက်ကခလုတ်ကို နှိပ်လိုက်ပါ။ 👇</p>
        </Card>
        <Button
          className="w-full mt-4 py-3 rounded-xl flex items-center justify-center gap-2"
          onClick={onCheckInClick}
        >
          <Heart fill="white" size={20} /> စမှတ်မယ်
        </Button>
      </div>
    );
  }

  // Memoize calculations to prevent unnecessary re-renders
  const { displayDay, progressDeg, statusTextString } = useMemo(() => {
    const displayDay = getDisplayDay(cycleData.cycleLength, cycleData.daysUntil);
    const progressDeg = calculateProgressDegree(cycleData.cycleLength, cycleData.daysUntil);
    const statusTextString = getStatusTextString(cycleData.daysUntil);

    return { displayDay, progressDeg, statusTextString };
  }, [cycleData]);

  // Convert the status text string to JSX with strong tags
  const statusText = useMemo(() => {
    if (cycleData.daysUntil <= 0) {
      const parts = statusTextString.split(/(\d+)/);
      return (
        <>
          ရာသီလာမယ့်ရက်ထက် <strong>{parts[1]}</strong> ရက် ကျော်လွန်နေပါတယ်။
        </>
      );
    } else {
      const parts = statusTextString.split(/(\d+)/);
      return (
        <>
          နောက်ရာသီလာဖို့ <strong>{parts[1]}</strong> ရက် လိုပါသေးတယ်။
        </>
      );
    }
  }, [statusTextString, cycleData.daysUntil]);

  return (
    <div style={{ padding: '20px', paddingBottom: '100px' }}>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ margin: 0, fontSize: '24px' }}>မင်္ဂလာပါ {user?.first_name || 'Sis'}! 👋</h2>
      </div>

      <Card className="text-center">
        <h3 className="text-pink-600 font-bold mb-2">{cycleData.phase || "Cycle Tracking"}</h3>
        <p className="text-sm text-gray-500 mb-4">{cycleData.phaseDescription}</p>

        <div className="cycle-progress">
          <div className="cycle-circle-border" style={{ transform: `rotate(${progressDeg}deg)` }}></div>
          <div className="cycle-text">
            <span className="cycle-day">{typeof displayDay === 'number' ? `Day ${displayDay}` : displayDay}</span>
            <br /><span className="cycle-label">of Cycle</span>
          </div>
        </div>
        <p style={{ textAlign: 'center', margin: 0 }}>{statusText}</p>
      </Card>

      <Button
        className="w-full mt-4 py-3 rounded-xl flex items-center justify-center gap-2"
        onClick={onCheckInClick}
      >
        <Heart fill="white" size={20} /> Log Period & Symptoms
      </Button>
    </div>
  );
};

export default DashboardView;