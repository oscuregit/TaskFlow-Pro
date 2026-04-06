# TaskFlow Pro 🚀

TaskFlow Pro is a comprehensive project and task management application designed for freelancers and small teams. It features a powerful Kanban board, financial tracking, client management, and a calendar view to keep your workflow organized and efficient.

## ✨ Features

- **📊 Kanban Board**: Drag-and-drop task management with status columns (To Do, In Progress, Waiting, Done).
- **📅 Calendar View**: Visualize your deadlines and schedule tasks with an intuitive calendar interface.
- **💰 Finance Management**: Track expected revenue and expenses per task. Supports multiple currencies (TRY, USD, EUR, GBP) with automatic conversion to TRY for totals.
- **👥 Client Management**: Keep track of your clients and associate them with specific tasks.
- **🌓 Dark Mode**: Seamlessly switch between light and dark themes.
- **🌍 Multi-language Support**: Fully localized in English and Turkish.
- **🔒 Secure Authentication**: Powered by Firebase (Google Sign-in and Email/Password).
- **📱 Responsive Design**: Optimized for both desktop and mobile devices.

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Backend/Database**: Firebase (Firestore & Authentication)
- **Date Handling**: date-fns

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- A Firebase project

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/taskflow-pro.git
   cd taskflow-pro
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Firebase Configuration**:
   Create a `firebase-applet-config.json` file in the root directory with your Firebase credentials:
   ```json
   {
     "apiKey": "YOUR_API_KEY",
     "authDomain": "YOUR_AUTH_DOMAIN",
     "projectId": "YOUR_PROJECT_ID",
     "storageBucket": "YOUR_STORAGE_BUCKET",
     "messagingSenderId": "YOUR_MESSAGING_SENDER_ID",
     "appId": "YOUR_APP_ID",
     "firestoreDatabaseId": "(default)"
   }
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Build for production**:
   ```bash
   npm run build
   ```

## 📝 License

This project is licensed under the Apache-2.0 License.

---
Developed with ❤️ by [Ozgur Avlamis](https://github.com/ozguravlamis)
