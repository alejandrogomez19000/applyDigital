# ApplyDigital Challenge

A React Native / Expo project that fetches mobile-related Hacker News stories, sends local notifications for relevant topics (Android/iOS), and caches favourites and deleted articles locally using AsyncStorage.

---

## 📚 Table of Contents

1. [About This Project](#-about-this-project)  
2. [Tech Stack](#-tech-stack)  
3. [Prerequisites](#-prerequisites)  
4. [Getting Started](#-getting-started)  
   - [Clone the Repo](#clone-the-repo)
   - [Install Dependencies](#install-dependencies)
5. [Running the App](#-running-the-app)  
   - [Expo Dev Server](#expo-dev-server)  
   - [Running on Android](#running-on-android)  
   - [Running on iOS](#running-on-ios-macos-only)  
6. [Notifications](#-notifications)  
7. [Testing](#-testing)  
8. [Project Structure](#-project-structure)  
9. [Scripts](#-scripts)  
10. [Future Improvements](#-future-improvements)  
11. [License](#-license)  

---

## 🔎 About This Project

`ApplyDigital Challenge` is an Expo/React-Native mobile app that:

- Fetches the latest **mobile-tagged** Hacker News articles via the HN Algolia API  
- Monitors for new Android/iOS-related articles while the app is open  
- Sends **local notifications** for newly detected articles  
- Navigates the user to an article modal when the notification is tapped  
- Allows users to **Favourite**, **Delete**, and **Persist** articles using `AsyncStorage`
- Uses a clean modular architecture with **custom hooks**, **Zustand stores**, and **TypeScript**

---

## 🧩 Tech Stack

- **React Native** (via Expo)
- **TypeScript**
- **expo-router** (file-based navigation)
- **expo-notifications** (local notifications)
- **Axios** (HN API client)
- **AsyncStorage** (`@react-native-async-storage/async-storage`)
- **Jest** + `@testing-library/react-native` (unit & integration tests)
- **Zustand** (state management)

---

## 🧰 Prerequisites

Install the following:

- **Node.js** (LTS recommended)
- **npm** or **yarn**
- **Expo Go** (on Android/iOS) — or an emulator/simulator  
- (Optional) Expo CLI  
  ```bash
  npm install -g expo-cli

---

## 🚀 Getting Started

- Clone the Repo

git clone https://github.com/alejandrogomez19000/applyDigital.git
cd applyDigital

- Install Dependencies

```
npm install
# or
yarn install
```
---

## 📱 Running the App

### Expo Dev Server

- Start the development server:

```
npm start
# or
npx expo start
# or
yarn start
```

This opens Expo Dev Tools.

Scan the QR code using Expo Go on your device, or follow the options below.

- To run on an emulator or connected device:

### Running on Android

```
npm run android
# or
npx expo run:android
```

### Running on iOS (macOS only)

```
npm run ios
# or
npx expo run:ios
```
---

## 🔔 Notifications (not working on Expo Go)

- This project uses expo-notifications with the following logic:

### When the app starts:

* Checks OS notification permission
* Loads cached filters (e.g., "android", "ios")
* Loads cached favourites / deleted articles

### While the app is open:

* Polls HN Algolia every minute (useArticlesPolling)
* Detects new articles only, comparing timestamps
* Filters articles by keywords (e.g., Android/iOS)
* Sends local notifications
* Tapping notifications triggers navigation via useNotificationNavigation

### Offline caching includes:

* Deleted articles
* Favourited articles
* Notification filters

Everything persists automatically via AsyncStorage.

---

## ⭐ Features

### Remove from the list or add to favourites

![ScreenRecording2025-12-04at1 19 04PM-ezgif com-optimize](https://github.com/user-attachments/assets/4fc45b17-10c6-480e-80b4-a4deefdcef79)

### Notifications and articles view

![ScreenRecording2025-12-04at1 19 04PM-ezgif com-optimize (1)](https://github.com/user-attachments/assets/f2fc41a0-88b6-4c06-9904-db52faeb7d30)

---

## 🧪 Testing

### This repository includes a complete Jest setup with mocks for:

* AsyncStorage
* expo-notifications
* expo-task-manager
* axios
* Zustand stores

### Run all tests

```
npm test
```

### Run tests in watch mode

```
npm test -- --watch
```

### Run a single test file

```
npx jest hooks/__tests__/useArticlesPolling.test.ts
```

---

## 📁 Project Structure

```txt
applyDigital/
├── api/               # Axios instance, notification permission helpers
├── app/               # expo-router screens and routes
├── hooks/             # custom hooks (polling, navigation, settings)
├── interfaces/        # TypeScript interfaces (Article, etc.)
├── store/             # Zustand stores (articles, notifications, filters)
├── utils/             # helpers (offline cache, time formatting, indexing)
├── constants/         # storage keys, enums, config constants
├── __tests__/         # Jest test files
└── package.json
```

---

## 🛠 Scripts

### Available npm scripts:

| Script              | Description                       |
| ------------------- | --------------------------------- |
| **npm start**       | Start Expo development server     |
| **npm run android** | Run on Android emulator/device    |
| **npm run ios**     | Run on iOS Simulator (macOS only) |
| **npm test**        | Run all Jest tests                |

## 📄 License

This project is licensed under the Apache-2.0 License.
See the LICENSE file for details.
