import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format, differenceInDays, addDays } from 'date-fns';
import { Heart, Calendar as CalIcon, Activity, ChevronRight, Save } from 'lucide-react';
import './App.css';

// --- Constants & Data ---
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
  const [activeTab, setActiveTab] = useState('home'); // home, calendar, log
  const [user, setUser] = useState(null);

  // Data State
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedMood, setSelectedMood] = useState(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);

  // --- 1. Init (Telegram Setup) ---
  useEffect(() => {
    // Check if running in Telegram
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();

      // Theme Colors setting
      const root = document.documentElement;
      root.style.setProperty('--primary', tg.themeParams.button_color || '#db2777');
      root.style.setProperty('--bg-color', tg.themeParams.secondary_bg_color || '#fdf2f8');

      if (tg.initDataUnsafe?.user) {
        setUser(tg.initDataUnsafe.user);
      } else {
        // 🛠️ Local Dev အတွက် Mock Data (Telegram မဟုတ်ရင် ဒါပြမယ်)
        setUser({ first_name: "Local User (Test)" });
      }
    } else {
      // Telegram Script မရှိရင်တောင် မပျက်သွားအောင် ကာကွယ်ခြင်း
      console.log("Telegram WebApp Script not loaded yet.");
      setUser({ first_name: "Developer" });
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

    // Data Object to send
    const payload = {
      action: action, // 'log_period' or 'log_symptoms'
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
    // Note: In a real app, you would fetch the 'lastPeriodDate' from API.
    // For now, let's assume Cycle Day 14 for demo visually.
    const cycleDay = 14;

    return (
      <div style={{ padding: '20px', paddingBottom: '80px' }}>
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ margin: 0, fontSize: '24px' }}>မင်္ဂလာပါ {user?.first_name || 'Sis'}! 👋</h2>
          <p style={{ margin: '4px 0', color: '#6b7280' }}>ဒီနေ့ ကျန်းမာရေး ဂရုစိုက်နော်</p>
        </div>

        <div className="card">
          <div className="cycle-progress">
            <div className="cycle-circle-border" style={{ transform: `rotate(${cycleDay * 12}deg)` }}></div>
            <div className="cycle-text">
              <span className="cycle-day">Day {cycleDay}</span>
              <br />
              <span className="cycle-label">of Cycle</span>
            </div>
          </div>
          <p style={{ textAlign: 'center', margin: 0 }}>
            နောက်ရာသီလာဖို့ <strong>14 ရက်</strong> လိုပါသေးတယ်။
          </p>
        </div>

        <button className="btn-primary" onClick={() => sendDataToBot('log_period')}>
          <Heart fill="white" size={20} />
          ဒီနေ့ ရာသီလာတယ် (Log Period)
        </button>

        <div style={{ marginTop: '16px', textAlign: 'center' }}>
          <p style={{ fontSize: '14px', color: '#666' }} onClick={() => setActiveTab('log')}>
            နေမကောင်းဘူးလား? <span style={{ color: '#db2777', fontWeight: 'bold' }}>လက္ခဏာမှတ်မယ် 👉</span>
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
        <div style={{ marginTop: '16px', padding: '10px', background: '#f9fafb', borderRadius: '8px' }}>
          <p style={{ margin: 0, fontSize: '14px' }}>
            <strong>Selected:</strong> {format(selectedDate, 'MMM dd, yyyy')}
          </p>
        </div>
      </div>
      {/* ဒီနေရာမှာ History List ပြလို့ရပါတယ် */}
    </div>
  );

  // SCREEN 3: Symptom Logger
  const LoggerView = () => (
    <div style={{ padding: '20px', paddingBottom: '80px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 className="section-title">📝 မှတ်တမ်းတင်မယ်</h2>
        <span style={{ fontSize: '14px', color: '#666' }}>{format(selectedDate, 'MMM dd')}</span>
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