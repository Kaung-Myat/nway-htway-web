import { useState, useEffect, useCallback } from 'react';
import { Heart, Calendar as CalIcon, PlusCircle, Home } from 'lucide-react';
import './App.css';

// Import new organized components
import CheckInPage from './components/CheckInPage';
import DashboardView from './components/views/DashboardView';
import CalendarView from './components/views/CalendarView';
import { BOT_API_URL, TABS } from './utils/constants';

/**
 * Main application component
 */
function App() {
  // State management
  const [activeTab, setActiveTab] = useState(TABS.HOME); // 'home', 'calendar', 'checkin'
  const [user, setUser] = useState(null);
  const [cycleData, setCycleData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Selected date for calendar interactions
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Initialize the app
  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand(); // Full screen

      // Apply Telegram theme colors
      const root = document.documentElement;
      if (tg.themeParams.button_color) root.style.setProperty('--primary', tg.themeParams.button_color);
      if (tg.themeParams.secondary_bg_color) root.style.setProperty('--bg-color', tg.themeParams.secondary_bg_color);

      // Fetch user data
      if (tg.initDataUnsafe?.user) {
        const telegramUser = tg.initDataUnsafe.user;
        setUser(telegramUser);
        fetchCycleData(telegramUser.id);
      } else {
        // Fallback for testing
        setUser({ first_name: "Test User", id: 12345 }); // Dummy ID for testing
        fetchCycleData(12345);
      }
    } else {
      setLoading(false);
    }
  };

  const fetchCycleData = useCallback(async (userId) => {
    try {
      const response = await fetch(`${BOT_API_URL}/api/user?chatId=${userId}`);
      const data = await response.json();
      setCycleData(data);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // --- Navigation Handler ---
  const handleCheckInClick = () => {
    setActiveTab(TABS.CHECKIN);
  };

  const handleBackFromCheckIn = () => {
    setActiveTab(TABS.HOME);
    // Refresh data after logging
    if(user?.id) fetchCycleData(user.id);
  };

  return (
    <div className="app-container">
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* Render Views based on Active Tab */}
        {activeTab === TABS.HOME && (
          <DashboardView
            loading={loading}
            cycleData={cycleData}
            user={user}
            onCheckInClick={handleCheckInClick}
          />
        )}

        {activeTab === TABS.CALENDAR && (
          <CalendarView
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            cycleData={cycleData}
          />
        )}

        {/* Check-in Page takes full screen */}
        {activeTab === TABS.CHECKIN && (
            <CheckInPage
                user={user}
                onBack={handleBackFromCheckIn}
            />
        )}
      </div>

      {/* Bottom Navigation (Hidden on Check-in Page) */}
      {activeTab !== TABS.CHECKIN && (
        <nav className="bottom-nav">
          <button
            className={`nav-item ${activeTab === TABS.HOME ? 'active' : ''}`}
            onClick={() => setActiveTab(TABS.HOME)}
          >
            <Home size={24} />
            <span>Home</span>
          </button>

          {/* Central Log Button */}
          <button
            className="nav-item text-pink-500"
            onClick={handleCheckInClick}
          >
            <PlusCircle size={32} fill="var(--bg-color)" />
            <span>Log</span>
          </button>

          <button
            className={`nav-item ${activeTab === TABS.CALENDAR ? 'active' : ''}`}
            onClick={() => setActiveTab(TABS.CALENDAR)}
          >
            <CalIcon size={24} />
            <span>Calendar</span>
          </button>
        </nav>
      )}
    </div>
  );
}

export default App;