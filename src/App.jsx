import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format, addDays, subDays, isSameDay, parseISO } from 'date-fns';
import { Heart, Calendar as CalIcon, Activity, Save } from 'lucide-react';
import './App.css';

// ⚠️ YOUR BOT URL
const BOT_API_URL = "https://nway-htway-bot.vercel.app";

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
  const [cycleData, setCycleData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form Data
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedMood, setSelectedMood] = useState(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);

  // --- 1. Fetch Data ---
  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready(); tg.expand();

      const root = document.documentElement;
      if (tg.themeParams.button_color) root.style.setProperty('--primary', tg.themeParams.button_color);
      if (tg.themeParams.secondary_bg_color) root.style.setProperty('--bg-color', tg.themeParams.secondary_bg_color);

      if (tg.initDataUnsafe?.user) {
        const telegramUser = tg.initDataUnsafe.user;
        setUser(telegramUser);
        fetch(`${BOT_API_URL}/api/user?chatId=${telegramUser.id}`)
          .then(res => res.json())
          .then(data => { setCycleData(data); setLoading(false); })
          .catch(() => setLoading(false));
      } else {
        setUser({ first_name: "Test User" }); setLoading(false);
      }
    } else { setLoading(false); }
  }, []);

  const sendDataToBot = (action) => {
    const tg = window.Telegram.WebApp;
    const payload = { action, date: selectedDate.toISOString(), mood: selectedMood, symptoms: selectedSymptoms };
    tg.sendData(JSON.stringify(payload));
    tg.close();
  };

  const toggleSymptom = (id) => {
    selectedSymptoms.includes(id)
      ? setSelectedSymptoms(selectedSymptoms.filter(s => s !== id))
      : setSelectedSymptoms([...selectedSymptoms, id]);
  };

  // --- 🔥 CALENDAR LOGIC (The Brains) ---

  // ၁။ ပြီးခဲ့တဲ့ မှတ်တမ်း (Past) ဟုတ်လား?
  // (ရက်စွဲတစ်ခုတည်း မဟုတ်ဘဲ၊ ရာသီလာရင် ၅ ရက်ကြာတယ်လို့ ယူဆပြီး Range ပြပါမယ်)
  const isPastPeriod = (date) => {
    if (!cycleData?.history) return false;
    // History ထဲက ရက်စွဲတိုင်းအတွက် +5 ရက်အထိ စစ်မယ်
    return cycleData.history.some(startStr => {
      const startDate = new Date(startStr);
      // ရာသီစလာတဲ့ရက် ကနေ ၄ ရက်နောက်ပိုင်းအထိ (စုစုပေါင်း ၅ ရက်)
      for (let i = 0; i < 5; i++) {
        if (isSameDay(date, addDays(startDate, i))) return true;
      }
      return false;
    });
  };

  // ၂။ ခန့်မှန်းရက် (Prediction) ဟုတ်လား?
  const isPredictedPeriod = (date) => {
    if (!cycleData?.lastLogDate || !cycleData?.cycleLength) return false;

    // နောက်ဆုံးရာသီရက် + Cycle Length = ခန့်မှန်းရက်
    const lastDate = new Date(cycleData.lastLogDate);
    const nextStartDate = addDays(lastDate, cycleData.cycleLength);

    // ခန့်မှန်းရက် ကနေ ၅ ရက်စာ ပြမယ်
    for (let i = 0; i < 5; i++) {
      if (isSameDay(date, addDays(nextStartDate, i))) return true;
    }
    return false;
  };

  // ၃။ မျိုးဥကြွေရက် (Ovulation) ဟုတ်လား?
  const isOvulationDay = (date) => {
    if (!cycleData?.lastLogDate || !cycleData?.cycleLength) return false;

    const lastDate = new Date(cycleData.lastLogDate);
    const nextStartDate = addDays(lastDate, cycleData.cycleLength);

    // Ovulation က နောက်ရာသီမလာခင် ၁၄ ရက်အလိုမှာ ဖြစ်လေ့ရှိတယ်
    const ovulationDate = subDays(nextStartDate, 14);

    // မျိုးဥကြွေရက် နဲ့ သူ့ရှေ့နောက် ၁ ရက် (စုစုပေါင်း ၃ ရက်) ပြမယ်
    return (
      isSameDay(date, ovulationDate) ||
      isSameDay(date, addDays(ovulationDate, 1)) ||
      isSameDay(date, subDays(ovulationDate, 1))
    );
  };

  // --- VIEWS ---

  const DashboardView = () => { /* ... (Same as before) ... */
    return (<div>Dashboard Content Here (Use previous code)</div>);
  }; // (အစ်ကို့ရဲ့ Dashboard Code အဟောင်းအတိုင်းထားပါ)

  // ✅ UPDATED CALENDAR VIEW
  const CalendarView = () => (
    <div style={{ padding: '20px', paddingBottom: '80px' }}>
      <h2 className="section-title">📅 ပြက္ခဒိန် & ခန့်မှန်းချက်</h2>

      <div className="card">
        <Calendar
          onChange={setSelectedDate}
          value={selectedDate}
          locale="en-US"
          tileClassName={({ date, view }) => {
            if (view === 'month') {
              if (isPastPeriod(date)) return 'tile-past';         // အနီ
              if (isPredictedPeriod(date)) return 'tile-predict'; // ပန်းရောင်
              if (isOvulationDay(date)) return 'tile-fertile';    // အစိမ်း
            }
          }}
        />

        {/* Label / Legend Section */}
        <div className="legend-container">
          <div className="legend-item">
            <div className="legend-dot" style={{ background: 'var(--primary)' }}></div>
            <span>ရာသီလာခဲ့သောရက်</span>
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

        {/* Selected Date Info */}
        <div style={{ marginTop: '16px', padding: '10px', background: 'var(--bg-color)', borderRadius: '8px', fontSize: '14px' }}>
          <strong>Selected:</strong> {format(selectedDate, 'MMM dd')} <br />

          {isPastPeriod(selectedDate) && <span style={{ color: 'var(--primary)' }}>• ရာသီလာခဲ့သောရက် ✅</span>}
          {isPredictedPeriod(selectedDate) && <span style={{ color: 'var(--primary)' }}>• လာနိုင်ချေရှိသောရက် 🌸</span>}
          {isOvulationDay(selectedDate) && <span style={{ color: '#10b981' }}>• ကိုယ်ဝန်ရနိုင်ချေများသောရက် 👶</span>}
        </div>
      </div>
    </div>
  );

  const LoggerView = () => { /* ... (Same as before) ... */
    return (<div>Logger Content Here</div>);
  };

  // Main Render
  return (
    <div className="app-container">
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {activeTab === 'home' && <DashboardView />} {/* Use your existing Dashboard component logic here */}
        {activeTab === 'calendar' && <CalendarView />}
        {activeTab === 'log' && <LoggerView />} {/* Use your existing Logger component logic here */}
      </div>
      <nav className="bottom-nav">
        {/* ... (Nav buttons same as before) ... */}
        <button className={`nav-item ${activeTab === 'home' ? 'active' : ''}`} onClick={() => setActiveTab('home')}><Heart size={24} /><span>Home</span></button>
        <button className={`nav-item ${activeTab === 'calendar' ? 'active' : ''}`} onClick={() => setActiveTab('calendar')}><CalIcon size={24} /><span>Calendar</span></button>
        <button className={`nav-item ${activeTab === 'log' ? 'active' : ''}`} onClick={() => setActiveTab('log')}><Activity size={24} /><span>Log</span></button>
      </nav>
    </div>
  );
}

export default App;