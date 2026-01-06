import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format } from 'date-fns';
import { Heart, Calendar as CalIcon, Activity, Save } from 'lucide-react';
import './App.css';

// ⚠️ CHANGE THIS TO YOUR BOT VERCEL URL
const BOT_API_URL = "https://nway-htway-bot.vercel.app";

// --- Constants ---
const MOODS = [
  { id: 'happy', icon: '😊', label: 'ပျော်' },
  { id: 'sad', icon: '😢', label: 'ဝမ်းနည်း' },
  { id: 'angry', icon: '😡', label: 'စိတ်တို' },
  { id: 'tired', icon: '😴', label: 'ပင်ပန်း' },
];

const SYMPTOMS = [
  { id: 'cramps', label: 'ဗိုက်နာ' },
  { id: 'headache', label: 'ခေါင်းကိုက်' },
  { id: 'acne', label: 'ဝက်ခြံ' },
  { id: 'backpain', label: 'ခါးနာ' },
  { id: 'bloating', label: 'လေပွ' },
];

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Real Data State
  const [cycleData, setCycleData] = useState(null);

  // Form Data State
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedMood, setSelectedMood] = useState(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);

  // --- 1. Init & Fetch Data ---
  useEffect(() => {
    // Check if running in Telegram
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();

      // Theme Colors setting (Also handled in CSS, this is backup)
      const root = document.documentElement;
      if (tg.themeParams.button_color) root.style.setProperty('--primary', tg.themeParams.button_color);
      if (tg.themeParams.secondary_bg_color) root.style.setProperty('--bg-color', tg.themeParams.secondary_bg_color);

      if (tg.initDataUnsafe?.user) {
        const telegramUser = tg.initDataUnsafe.user;
        setUser(telegramUser);

        // 🔥 FETCH REAL DATA FROM BOT API
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
        // Local Dev Mock
        setUser({ first_name: "Local User" });
        setLoading(false);
      }
    } else {
      console.log("Telegram Script missing");
      setLoading(false);
    }
  }, []);

  // --- 2. Helper Functions ---
  const toggleSymptom = (id) => {
    if (selectedSymptoms.includes(id)) {
      setSelectedSymptoms(selectedSymptoms.filter(s => s !== id));
    } else {
      setSelectedSymptoms([...selectedSymptoms, id]);
    }
  };

  const sendDataToBot = (action) => {
    const tg = window.Telegram.WebApp;
    const payload = {
      action: action,
      date: selectedDate.toISOString(),
      mood: selectedMood,
      symptoms: selectedSymptoms
    };
    tg.sendData(JSON.stringify(payload));
    tg.close();
  };

  // --- 3. Views (Screens) ---

  // SCREEN 1: Dashboard
  const DashboardView = () => {
    if (loading) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <p>အချက်အလက်များကို ရယူနေပါသည်...</p>
        </div>
      );
    }

    // Case A: No Data Found (New User)
    if (!cycleData || !cycleData.found) {
      return (
        <div style={{ padding: '20px', textAlign: 'center', marginTop: '50px' }}>
          <h2>မင်္ဂလာပါ {user?.first_name || 'Sis'}! 👋</h2>
          <div className="card">
            <p>ရာသီမှတ်တမ်း မရှိသေးပါဘူးရှင်။</p>
            <p style={{ color: 'var(--text-muted)' }}>စတင်မှတ်သားဖို့ အောက်ကခလုတ်ကို နှိပ်လိုက်ပါ။ 👇</p>
          </div>
          <button className="btn-primary" onClick={() => sendDataToBot('log_period')}>
            <Heart fill="white" size={20} />
            ဒီနေ့ ရာသီလာတယ် (စမှတ်မယ်)
          </button>
        </div>
      );
    }

    // Case B: Data Exists (Calculate Visuals)
    let displayDay = cycleData.cycleLength - cycleData.daysUntil;
    let progressDeg = (displayDay / cycleData.cycleLength) * 360;

    // Logic for "Late"
    let statusText = <>နောက်ရာသီလာဖို့ <strong>{cycleData.daysUntil} ရက်</strong> လိုပါသေးတယ်။</>;
    if (cycleData.daysUntil <= 0) {
      displayDay = "Late";
      progressDeg = 360; // Full circle
      statusText = <>ရာသီလာမယ့်ရက်ထက် <strong>{Math.abs(cycleData.daysUntil)} ရက်</strong> ကျော်လွန်နေပါတယ်။</>;
    }

    return (
      <div style={{ padding: '20px', paddingBottom: '80px' }}>
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ margin: 0, fontSize: '24px' }}>မင်္ဂလာပါ {user?.first_name || 'Sis'}! 👋</h2>
          <p style={{ margin: '4px 0', color: 'var(--text-muted)' }}>ဒီနေ့ ကျန်းမာရေး ဂရုစိုက်နော်</p>
        </div>

        <div className="card">
          <div className="cycle-progress">
            <div
              className="cycle-circle-border"
              style={{ transform: `rotate(${progressDeg}deg)` }}
            ></div>
            <div className="cycle-text">
              <span className="cycle-day">
                {typeof displayDay === 'number' ? `Day ${displayDay}` : displayDay}
              </span>
              <br />
              <span className="cycle-label">of Cycle</span>
            </div>
          </div>
          <p style={{ textAlign: 'center', margin: 0 }}>
            {statusText}
          </p>
        </div>

        <button className="btn-primary" onClick={() => sendDataToBot('log_period')}>
          <Heart fill="white" size={20} />
          ဒီနေ့ ရာသီလာတယ် (Log Period)
        </button>

        <div style={{ marginTop: '16px', textAlign: 'center' }}>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }} onClick={() => setActiveTab('log')}>
            နေမကောင်းဘူးလား? <span style={{ color: 'var(--primary)', fontWeight: 'bold', cursor: 'pointer' }}>လက္ခဏာမှတ်မယ် 👉</span>
          </p>
        </div>
      </div>
    );
  };

  // SCREEN 2: Calendar
  const CalendarView = () => (
    <div style={{ padding: '20px', paddingBottom: '80px' }}>
      <h2 className="section-title">📅 ပြက္ခဒိန်မှတ်တမ်း</h2>
      <div className="card">
        <Calendar
          onChange={setSelectedDate}
          value={selectedDate}
          locale="en-US"
        />
        <div style={{ marginTop: '16px', padding: '10px', background: 'var(--bg-color)', borderRadius: '8px' }}>
          <p style={{ margin: 0, fontSize: '14px' }}>
            <strong>Selected:</strong> {format(selectedDate, 'MMM dd, yyyy')}
          </p>
        </div>
      </div>
    </div>
  );

  // SCREEN 3: Symptom Logger
  const LoggerView = () => (
    <div style={{ padding: '20px', paddingBottom: '80px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 className="section-title">📝 မှတ်တမ်းတင်မယ်</h2>
        <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{format(selectedDate, 'MMM dd')}</span>
      </div>

      {/* Mood Selector */}
      <div className="card">
        <h3 className="section-title">စိတ်အခြေအနေ (Mood)</h3>
        <div className="mood-grid">
          {MOODS.map((m) => (
            <div
              key={m.id}
              className={`mood-item ${selectedMood === m.id ? 'selected' : ''}`}
              onClick={() => setSelectedMood(m.id)}
            >
              <span className="mood-icon">{m.icon}</span>
              <span className="mood-label">{m.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Symptoms Selector */}
      <div className="card">
        <h3 className="section-title">ရောဂါလက္ခဏာ (Symptoms)</h3>
        <div className="tags-container">
          {SYMPTOMS.map((s) => (
            <div
              key={s.id}
              className={`tag ${selectedSymptoms.includes(s.id) ? 'selected' : ''}`}
              onClick={() => toggleSymptom(s.id)}
            >
              {s.label}
            </div>
          ))}
        </div>
      </div>

      <button className="btn-primary" onClick={() => sendDataToBot('log_symptoms')}>
        <Save size={20} />
        သိမ်းဆည်းမယ် (Save)
      </button>
    </div>
  );

  return (
    <div className="app-container">
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {activeTab === 'home' && <DashboardView />}
        {activeTab === 'calendar' && <CalendarView />}
        {activeTab === 'log' && <LoggerView />}
      </div>

      {/* Bottom Navigation */}
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
        <button
          className={`nav-item ${activeTab === 'log' ? 'active' : ''}`}
          onClick={() => setActiveTab('log')}
        >
          <Activity size={24} />
          <span>Log</span>
        </button>
      </nav>
    </div>
  );
}

export default App;