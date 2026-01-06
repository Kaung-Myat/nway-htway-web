import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format, addDays, subDays, isSameDay } from 'date-fns';
import { Heart, Calendar as CalIcon } from 'lucide-react'; // Activity Icon ဖြုတ်လိုက်ပါပြီ
import './App.css';

// ⚠️ YOUR BOT URL
const BOT_API_URL = "https://nway-htway-bot.vercel.app";

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [user, setUser] = useState(null);
  const [cycleData, setCycleData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form Data (Date only now)
  const [selectedDate, setSelectedDate] = useState(new Date());

  // --- 1. Init & Fetch ---
  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();

      const root = document.documentElement;
      if (tg.themeParams.button_color) root.style.setProperty('--primary', tg.themeParams.button_color);
      if (tg.themeParams.secondary_bg_color) root.style.setProperty('--bg-color', tg.themeParams.secondary_bg_color);

      if (tg.initDataUnsafe?.user) {
        const telegramUser = tg.initDataUnsafe.user;
        setUser(telegramUser);

        fetch(`${BOT_API_URL}/api/user?chatId=${telegramUser.id}`)
          .then(res => res.json())
          .then(data => {
            setCycleData(data);
            setLoading(false);
          })
          .catch(err => {
            console.error("Fetch Error:", err);
            setLoading(false);
          });
      } else {
        setUser({ first_name: "Test User" });
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  // --- 2. Logic Functions ---
  const sendDataToBot = (action) => {
    const tg = window.Telegram.WebApp;
    // Mood/Symptoms မပါတော့ဘဲ Date ပဲ ပို့ပါမယ်
    const payload = {
      action: action,
      date: selectedDate.toISOString()
    };
    tg.sendData(JSON.stringify(payload));
    tg.close();
  };

  // --- Calendar Checkers ---
  const isPastPeriod = (date) => {
    if (!cycleData?.history) return false;
    return cycleData.history.some(startStr => {
      const startDate = new Date(startStr);
      for (let i = 0; i < 5; i++) {
        if (isSameDay(date, addDays(startDate, i))) return true;
      }
      return false;
    });
  };

  const isPredictedPeriod = (date) => {
    if (!cycleData?.lastLogDate || !cycleData?.cycleLength) return false;
    const lastDate = new Date(cycleData.lastLogDate);
    const nextStartDate = addDays(lastDate, cycleData.cycleLength);
    for (let i = 0; i < 5; i++) {
      if (isSameDay(date, addDays(nextStartDate, i))) return true;
    }
    return false;
  };

  const isOvulationDay = (date) => {
    if (!cycleData?.lastLogDate || !cycleData?.cycleLength) return false;
    const lastDate = new Date(cycleData.lastLogDate);
    const nextStartDate = addDays(lastDate, cycleData.cycleLength);
    const ovulationDate = subDays(nextStartDate, 14);
    return (
      isSameDay(date, ovulationDate) ||
      isSameDay(date, addDays(ovulationDate, 1)) ||
      isSameDay(date, subDays(ovulationDate, 1))
    );
  };

  // --- 3. Views ---

  // Dashboard (Home Tab)
  const DashboardView = () => {
    if (loading) return <div style={{ textAlign: 'center', marginTop: 50 }}>Loading...</div>;

    if (!cycleData || !cycleData.found) {
      return (
        <div style={{ padding: '20px', textAlign: 'center', marginTop: '50px' }}>
          <h2>မင်္ဂလာပါ {user?.first_name || 'Sis'}! 👋</h2>
          <div className="card">
            <p>ရာသီမှတ်တမ်း မရှိသေးပါဘူးရှင်။</p>
            <p style={{ color: 'var(--text-muted)' }}>စတင်မှတ်သားဖို့ အောက်ကခလုတ်ကို နှိပ်လိုက်ပါ။ 👇</p>
          </div>
          <button className="btn-primary" onClick={() => sendDataToBot('log_period')}>
            <Heart fill="white" size={20} /> စမှတ်မယ်
          </button>
        </div>
      );
    }

    let displayDay = cycleData.cycleLength - cycleData.daysUntil;
    let progressDeg = (displayDay / cycleData.cycleLength) * 360;
    let statusText = <>နောက်ရာသီလာဖို့ <strong>{cycleData.daysUntil} ရက်</strong> လိုပါသေးတယ်။</>;

    if (cycleData.daysUntil <= 0) {
      displayDay = "Late";
      progressDeg = 360;
      statusText = <>ရာသီလာမယ့်ရက်ထက် <strong>{Math.abs(cycleData.daysUntil)} ရက်</strong> ကျော်လွန်နေပါတယ်။</>;
    }

    return (
      <div style={{ padding: '20px', paddingBottom: '80px' }}>
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ margin: 0, fontSize: '24px' }}>မင်္ဂလာပါ {user?.first_name || 'Sis'}! 👋</h2>
        </div>

        <div className="card">
          <div className="cycle-progress">
            <div className="cycle-circle-border" style={{ transform: `rotate(${progressDeg}deg)` }}></div>
            <div className="cycle-text">
              <span className="cycle-day">{typeof displayDay === 'number' ? `Day ${displayDay}` : displayDay}</span>
              <br /><span className="cycle-label">of Cycle</span>
            </div>
          </div>
          <p style={{ textAlign: 'center', margin: 0 }}>{statusText}</p>
        </div>

        <button className="btn-primary" onClick={() => sendDataToBot('log_period')}>
          <Heart fill="white" size={20} /> ဒီနေ့ ရာသီလာတယ် (Log)
        </button>
      </div>
    );
  };

  // Calendar Tab
  const CalendarView = () => (
    <div style={{ padding: '20px', paddingBottom: '80px' }}>
      <h2 className="section-title">📅 ပြက္ခဒိန် & ခန့်မှန်းချက်</h2>
      <div className="card">
        <Calendar
          onChange={setSelectedDate} value={selectedDate} locale="en-US"
          tileClassName={({ date, view }) => {
            if (view === 'month') {
              if (isPastPeriod(date)) return 'tile-past';
              if (isPredictedPeriod(date)) return 'tile-predict';
              if (isOvulationDay(date)) return 'tile-fertile';
            }
          }}
        />
        <div className="legend-container">
          <div className="legend-item"><div className="legend-dot" style={{ background: 'var(--primary)' }}></div><span>ရာသီရက်</span></div>
          <div className="legend-item"><div className="legend-dot" style={{ background: 'var(--primary-light)' }}></div><span>ခန့်မှန်းရက်</span></div>
          <div className="legend-item"><div className="legend-dot" style={{ background: '#10b981' }}></div><span>မျိုးဥကြွေရက်</span></div>
        </div>
        <div style={{ marginTop: '16px', padding: '10px', background: 'var(--bg-color)', borderRadius: '8px', fontSize: '14px' }}>
          <strong>Selected:</strong> {format(selectedDate, 'MMM dd')} <br />
          {isPastPeriod(selectedDate) && <span style={{ color: 'var(--primary)' }}>• ရာသီလာခဲ့သောရက် ✅</span>}
          {isPredictedPeriod(selectedDate) && <span style={{ color: 'var(--primary)' }}>• လာနိုင်ချေရှိသောရက် 🌸</span>}
          {isOvulationDay(selectedDate) && <span style={{ color: '#10b981' }}>• ကိုယ်ဝန်ရနိုင်ချေများသောရက် 👶</span>}
        </div>
      </div>
    </div>
  );

  return (
    <div className="app-container">
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {activeTab === 'home' && <DashboardView />}
        {activeTab === 'calendar' && <CalendarView />}
      </div>
      <nav className="bottom-nav">
        <button className={`nav-item ${activeTab === 'home' ? 'active' : ''}`} onClick={() => setActiveTab('home')}><Heart size={24} /><span>Home</span></button>
        <button className={`nav-item ${activeTab === 'calendar' ? 'active' : ''}`} onClick={() => setActiveTab('calendar')}><CalIcon size={24} /><span>Calendar</span></button>
      </nav>
    </div>
  );
}

export default App;