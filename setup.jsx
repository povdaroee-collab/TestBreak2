// ហៅ Global Firebase functions
const {
  initializeApp,
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  getDatabase,
  ref,
  onValue,
  set,
  push,
  update,
  query: rtdbQuery, 
  orderByChild,
  equalTo,
  remove,
  get
} = window.firebase;

const { useState, useEffect } = React;

// =================================================================
// 1. CONSTANTS & CONFIGS
// =================================================================
const USER_PASSWORD = '4545ak0';
// const TOTAL_PASSES = 40; // !! លុប !!: យើងនឹងទាញពី Firebase វិញ
const OVERTIME_LIMIT_MINUTES = 15;

const firebaseConfigRead = {
  apiKey: "AIzaSyAc2g-t9A7du3K_nI2fJnw_OGxhmLfpP6s",
  authDomain: "dilistname.firebaseapp.com",
  databaseURL: "https://dilistname-default-rtdb.firebaseio.com",
  projectId: "dilistname",
  storageBucket: "dilistname.firebasestorage.app",
  messagingSenderId: "897983357871",
  appId: "1:897983357871:web:42a046bc9fb3e0543dc55a",
  measurementId: "G-NQ798D9J6K"
};

const firebaseConfigWrite = {
  apiKey: "AIzaSyA1YBg1h5PAxu3vB7yKkpcirHRmLVl_VMI",
  authDomain: "brakelist-5f07f.firebaseapp.com",
  databaseURL: "https://brakelist-5f07f-default-rtdb.firebaseio.com",
  projectId: "brakelist-5f07f",
  storageBucket: "brakelist-5f07f.firebasestorage.app",
  messagingSenderId: "1032751366057",
  appId: "1:1032751366057:web:b23f1e7f3a093a496a4eb8",
  measurementId: "G-51RMC51XZW"
};


// =================================================================
// 2. HELPER FUNCTIONS
// =================================================================
const today = new Date();
const todayString = today.toISOString().split('T')[0]; // 'YYYY-MM-DD'
const displayDate = today.toLocaleString('km-KH', {
  weekday: 'long',
  day: '2-digit',
  month: 'long',
  year: 'numeric',
});

const getTodayLocalDateString = () => {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().split('T')[0];
};

const getTodayLocalMonthString = () => {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().substring(0, 7); // 'YYYY-MM'
};

const calculateDuration = (startTimeIso, endTimeIso) => {
  if (!startTimeIso || !endTimeIso) {
    return 0;
  }
  try {
    const start = new Date(startTimeIso);
    const end = new Date(endTimeIso);
    const diffMs = end.getTime() - start.getTime();
    const diffMins = Math.floor(diffMs / 60000); // ប្តូរពី ms ទៅ នាទី
    return diffMins;
  } catch (e) {
    console.error("Error calculating duration:", e);
    return 0;
  }
};

// =================================================================
// 3. ICON COMPONENTS
// =================================================================
const IconCheckOut = () => (
  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
  </svg>
);
const IconCheckIn = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 003 3h1a3 3 0 003-3V7a3 3 0 00-3-3h-1a3 3 0 00-3 3v1"></path>
  </svg>
);
const IconSearch = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
  </svg>
);
const IconClock = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
  </svg>
);
const IconCheckCircle = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
  </svg>
);
const IconTicket = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"></path>
  </svg>
);
const IconClose = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
  </svg>
);
const IconTrash = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
  </svg>
);
const IconNoSymbol = () => (
  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path>
  </svg>
);
const IconAlert = () => (
  <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
  </svg>
);
const IconSpecial = () => (
  <svg className="w-4 h-4 ml-1.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
  </svg>
);
const IconDotsVertical = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path>
  </svg>
);
const IconLock = () => (
  <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
  </svg>
);
const IconQrCode = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4h4v4H4zM4 16h4v4H4zM16 4h4v4h-4zM16 16h4v4h-4zM10 4h4v4h-4zM10 16h4v4h-4zM4 10h4v4H4zM16 10h4v4h-4zM10 10h4v4h-4z"></path>
  </svg>
);
const IconPencil = () => (
  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z"></path>
  </svg>
);

// !! ថ្មី !!: Icon សម្រាប់ Info/Success Modals
const IconInfo = () => (
  <svg className="w-12 h-12 text-blue-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
);

const IconCheckCircleFill = () => (
  <svg className="w-12 h-12 text-green-500 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
);

// !! ថ្មី !!: Icon សម្រាប់ Input Prompt
const IconPencilSquare = () => (
  <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
);
