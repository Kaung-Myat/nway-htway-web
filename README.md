# Nway Htway Web App

A menstrual cycle tracking application built as a Telegram Web App using React. This application helps users track their menstrual cycles, predict upcoming periods, and identify ovulation days.

## 🌸 Features

- **Cycle Tracking**: Log your menstrual periods and track your cycle history
- **Prediction**: Predict upcoming periods based on your cycle history
- **Ovulation Tracking**: Identify potential ovulation days for fertility awareness
- **Calendar View**: Visual calendar showing past periods, predicted periods, and ovulation days
- **Telegram Integration**: Seamlessly integrates with Telegram as a Web App
- **Burmese Language Support**: User interface in Burmese language

## 🛠️ Tech Stack

- **Frontend**: React 19
- **Styling**: CSS with custom styling
- **Date Handling**: date-fns
- **Icons**: Lucide React
- **Calendar Component**: react-calendar
- **Build Tool**: Vite
- **Linting**: ESLint

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
```

2. Navigate to the project directory:
```bash
cd nway-htway-web
```

3. Install dependencies:
```bash
npm install
```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and visit the URL provided in the terminal

### Environment Configuration

The application uses a backend API for user data and cycle tracking. The API URL is currently hardcoded in `App.jsx`:

```javascript
const BOT_API_URL = "https://nway-htway-bot.vercel.app";
```

## 📱 Usage

### Telegram Web App Integration

This application is designed to run as a Telegram Web App. When running in the Telegram environment:

- The app automatically adapts to the user's Telegram theme
- User data is retrieved from Telegram's initialization data
- Data is sent back to the bot using Telegram's `sendData` method

### Main Features

1. **Dashboard View**:
   - Shows current cycle day and days until next period
   - Displays cycle progress with a visual indicator
   - Provides button to log a new period

2. **Calendar View**:
   - Color-coded calendar showing:
     - Past periods (pink)
     - Predicted periods (light pink)
     - Ovulation days (green)
   - Allows date selection for detailed information

## 📁 Project Structure

```
src/
├── App.jsx          # Main application component with dashboard and calendar views
├── App.css          # Styles for the application components
├── main.jsx         # Entry point of the React application
├── index.css        # Global styles
└── assets/          # Static assets (if any)
```

## 🔧 Available Scripts

In the project directory, you can run:

- `npm run dev` - Starts the development server
- `npm run build` - Builds the application for production
- `npm run lint` - Runs ESLint to check for code issues
- `npm run preview` - Locally preview the production build

## 🎨 Styling

The application uses CSS variables that integrate with Telegram's theme system:

- `--primary`: Primary button color (from Telegram theme)
- `--primary-text`: Primary button text color (from Telegram theme)
- `--bg-color`: Background color (from Telegram theme)
- `--card-bg`: Card background color (from Telegram theme)
- `--text-main`: Main text color (from Telegram theme)
- `--text-muted`: Muted text color (from Telegram theme)

## 📊 API Integration

The application communicates with a backend service at `https://nway-htway-bot.vercel.app` to:

- Fetch user cycle data
- Send period log entries
- Retrieve predictions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Issues

If you encounter any issues or have feature requests, please open an issue in the repository.

## 🙏 Acknowledgments

- Built with React and Vite
- Calendar component from react-calendar
- Icons from Lucide React
- Date manipulation with date-fns