import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format, addDays, subDays, isSameDay } from 'date-fns';
import { Heart, Calendar as CalIcon } from 'lucide-react';
import './App.css';

/**
 * Base URL for the backend API that handles user data and cycle tracking
 * @type {string}
 */
const BOT_API_URL = "https://nway-htway-bot.vercel.app";

/**
 * Main application component for the Nway Htway menstrual cycle tracking app
 * @returns {JSX.Element} The main application UI
 */
function App() {
  // State management
  const [activeTab, setActiveTab] = useState('home'); // Current active tab (home or calendar)
  const [user, setUser] = useState(null); // Telegram user information
  const [cycleData, setCycleData] = useState(null); // Menstrual cycle data
  const [loading, setLoading] = useState(true); // Loading state for initial data fetch

  // Selected date for calendar interactions
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Initialize the app and fetch user data when component mounts
  useEffect(() => {
    initializeApp();
  }, []);

  /**
   * Initialize the application by setting up Telegram Web App integration
   * and fetching user cycle data from the backend
   */
  const initializeApp = async () => {
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();

      // Apply Telegram theme colors to CSS variables
      const root = document.documentElement;
      if (tg.themeParams.button_color) root.style.setProperty('--primary', tg.themeParams.button_color);
      if (tg.themeParams.secondary_bg_color) root.style.setProperty('--bg-color', tg.themeParams.secondary_bg_color);

      // Fetch user data from Telegram and then get cycle data from backend
      if (tg.initDataUnsafe?.user) {
        const telegramUser = tg.initDataUnsafe.user;
        setUser(telegramUser);

        try {
          const response = await fetch(`${BOT_API_URL}/api/user?chatId=${telegramUser.id}`);
          const data = await response.json();
          setCycleData(data);
        } catch (err) {
          console.error("Fetch Error:", err);
        } finally {
          setLoading(false);
        }
      } else {
        // Fallback for testing when not running in Telegram environment
        setUser({ first_name: "Test User" });
        setLoading(false);
      }
    } else {
      // Fallback when not running in Telegram environment
      setLoading(false);
    }
  };

  /**
   * Send data to the Telegram bot backend
   * @param {string} action - The action to perform (e.g., 'log_period')
   */
  const sendDataToBot = (action) => {
    const tg = window.Telegram.WebApp;
    // Send only the date, without mood/symptoms data
    const payload = {
      action: action,
      date: selectedDate.toISOString()
    };
    tg.sendData(JSON.stringify(payload));
    tg.close();
  };

  /**
   * Check if a given date is part of a past period
   * @param {Date} date - The date to check
   * @returns {boolean} True if the date is part of a past period
   */
  const isPastPeriod = (date) => {
    if (!cycleData?.history) return false;
    return cycleData.history.some(startStr => {
      const startDate = new Date(startStr);
      // Check if the date falls within a 5-day period window
      for (let i = 0; i < 5; i++) {
        if (isSameDay(date, addDays(startDate, i))) return true;
      }
      return false;
    });
  };

  /**
   * Check if a given date is predicted to be a period day
   * @param {Date} date - The date to check
   * @returns {boolean} True if the date is predicted to be a period day
   */
  const isPredictedPeriod = (date) => {
    if (!cycleData?.lastLogDate || !cycleData?.cycleLength) return false;
    const lastDate = new Date(cycleData.lastLogDate);
    const nextStartDate = addDays(lastDate, cycleData.cycleLength);
    // Check if the date falls within a 5-day predicted period window
    for (let i = 0; i < 5; i++) {
      if (isSameDay(date, addDays(nextStartDate, i))) return true;
    }
    return false;
  };

  /**
   * Check if a given date is an ovulation day (or close to it)
   * @param {Date} date - The date to check
   * @returns {boolean} True if the date is an ovulation day
   */
  const isOvulationDay = (date) => {
    if (!cycleData?.lastLogDate || !cycleData?.cycleLength) return false;
    const lastDate = new Date(cycleData.lastLogDate);
    const nextStartDate = addDays(lastDate, cycleData.cycleLength);
    // Ovulation typically occurs 14 days before the next period
    const ovulationDate = subDays(nextStartDate, 14);
    // Consider ovulation day and the day before and after
    return (
      isSameDay(date, ovulationDate) ||
      isSameDay(date, addDays(ovulationDate, 1)) ||
      isSameDay(date, subDays(ovulationDate, 1))
    );
  };

  // Create DashboardView component as a separate function
  const DashboardView = ({ loading, cycleData, user, sendDataToBot }) => {
    if (loading) return <div style={{ textAlign: 'center', marginTop: 50 }}>Loading...</div>;

    if (!cycleData || !cycleData.found) {
      // Show welcome message for new users without cycle history
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

    // Calculate current cycle day and progress
    let displayDay = cycleData.cycleLength - cycleData.daysUntil;
    let progressDeg = (displayDay / cycleData.cycleLength) * 360;
    let statusText = <>နောက်ရာသီလာဖို့ <strong>{cycleData.daysUntil} ရက်</strong> လိုပါသေးတယ်။</>;

    if (cycleData.daysUntil <= 0) {
      // Handle late periods
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

  // Create CalendarView component as a separate function
  const CalendarView = ({ selectedDate, setSelectedDate, isPastPeriod, isPredictedPeriod, isOvulationDay }) => (
    <div style={{ padding: '20px', paddingBottom: '80px' }}>
      <h2 className="section-title">📅 ပြက္ခဒိန် & ခန့်မှန်းချက်</h2>
      <div className="card">
        <Calendar
          onChange={setSelectedDate}
          value={selectedDate}
          locale="en-US"
          tileClassName={({ date, view }) => {
            if (view === 'month') {
              // Apply CSS classes based on the type of day
              if (isPastPeriod(date)) return 'tile-past';      // Past period days
              if (isPredictedPeriod(date)) return 'tile-predict'; // Predicted period days
              if (isOvulationDay(date)) return 'tile-fertile';    // Ovulation days
            }
          }}
        />
        {/* Legend explaining the color coding */}
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
        {/* Information about the selected date */}
        <div style={{
          marginTop: '16px',
          padding: '10px',
          background: 'var(--bg-color)',
          borderRadius: '8px',
          fontSize: '14px'
        }}>
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
        {activeTab === 'home' && <DashboardView loading={loading} cycleData={cycleData} user={user} sendDataToBot={sendDataToBot} />}
        {activeTab === 'calendar' && <CalendarView selectedDate={selectedDate} setSelectedDate={setSelectedDate} isPastPeriod={isPastPeriod} isPredictedPeriod={isPredictedPeriod} isOvulationDay={isOvulationDay} />}
      </div>
      {/* Bottom navigation bar */}
      <nav className="bottom-nav">
        <button
          className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => setActiveTab('home')}
        >
          <Heart size={24} />
          <span>Home</span>
        </button>
        <button
          className={`nav-item ${activeTab === 'calendar' ? 'active' : ''}`}
          onClick={() => setActiveTab('calendar')}
        >
          <CalIcon size={24} />
          <span>Calendar</span>
        </button>
      </nav>
    </div>
  );
}

export default App;