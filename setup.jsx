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

// !! ថ្មី !!: បង្កើត Container មួយក្នុង Global Scope
window.appSetup = {};

// =================================================================
// 1. CONSTANTS & CONFIGS
// =================================================================
window.appSetup.OVERTIME_LIMIT_MINUTES = 15;

window.appSetup.firebaseConfigRead = {
  apiKey: "AIzaSyAc2g-t9A7du3K_nI2fJnw_OGxhmLfpP6s",
  authDomain: "dilistname.firebaseapp.com",
  databaseURL: "https://dilistname-default-rtdb.firebaseio.com",
  projectId: "dilistname",
  storageBucket: "dilistname.firebasestorage.app",
  messagingSenderId: "897983357871",
  appId: "1:897983357871:web:42a046bc9fb3e0543dc55a",
  measurementId: "G-NQ798D9J6K"
};

window.appSetup.firebaseConfigWrite = {
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
window.appSetup.today = new Date();
window.appSetup.todayString = window.appSetup.today.toISOString().split('T')[0]; // 'YYYY-MM-DD'
window.appSetup.displayDate = window.appSetup.today.toLocaleString('km-KH', {
  weekday: 'long',
  day: '2-digit',
  month: 'long',
  year: 'numeric',
});

window.appSetup.getTodayLocalDateString = () => {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().split('T')[0];
};

window.appSetup.getTodayLocalMonthString = () => {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().substring(0, 7); // 'YYYY-MM'
};

window.appSetup.calculateDuration = (startTimeIso, endTimeIso) => {
  if (!startTimeIso || !endTimeIso) {
    return 0;
  }
  try {
    const start = new Date(startTimeIso);
    const end = new Date(endTimeIso);
    const diffMs = end.getTime() - start.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    return diffMins;
  } catch (e) {
    console.error("Error calculating duration:", e);
    return 0;
  }
};

// =================================================================
// 3. ICON COMPONENTS
// =================================================================
window.appSetup.IconCheckOut = () => (
  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
  </svg>
);
window.appSetup.IconCheckIn = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 003 3h1a3 3 0 003-3V7a3 3 0 00-3-3h-1a3 3 0 00-3 3v1"></path>
  </svg>
);
window.appSetup.IconSearch = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
  </svg>
);
window.appSetup.IconClock = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
  </svg>
);
window.appSetup.IconCheckCircle = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
  </svg>
);
window.appSetup.IconTicket = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"></path>
  </svg>
);
window.appSetup.IconClose = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
  </svg>
);
window.appSetup.IconTrash = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
  </svg>
);
window.appSetup.IconNoSymbol = () => (
  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path>
  </svg>
);
window.appSetup.IconAlert = () => (
  <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
  </svg>
);
window.appSetup.IconSpecial = () => (
  <svg className="w-4 h-4 ml-1.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
  </svg>
);
window.appSetup.IconDotsVertical = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path>
  </svg>
);
window.appSetup.IconLock = () => (
  <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
  </svg>
);
window.appSetup.IconQrCode = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4h4v4H4zM4 16h4v4H4zM16 4h4v4h-4zM16 16h4v4h-4zM10 4h4v4h-4zM10 16h4v4h-4zM4 10h4v4H4zM16 10h4v4h-4zM10 10h4v4h-4z"></path>
  </svg>
);
window.appSetup.IconPencil = () => (
  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z"></path>
  </svg>
);
window.appSetup.IconInfo = () => (
  <svg className="w-12 h-12 text-blue-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
);
window.appSetup.IconCheckCircleFill = () => (
  <svg className="w-12 h-12 text-green-500 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
);
window.appSetup.IconPencilSquare = () => (
  <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
);

// --- Icons សម្រាប់ Settings Page ---
window.appSetup.IconSettings = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
);
window.appSetup.IconLanguage = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m0 16v2m0-8v2M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12H3m18 0a9 9 0 00-9-9m9 9a9 9 0 01-9 9"></path></svg>
);
window.appSetup.IconPalette = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0c-1.657 0-3-1.343-3-3v-2c0-.621.504-1.125 1.125-1.125H9.875c.621 0 1.125.504 1.125 1.125v2c0 1.657-1.343 3-3 3z"></path></svg>
);
window.appSetup.IconToggleRight = () => (
  <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd"></path></svg>
);
window.appSetup.IconToggleLeft = () => (
  <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.707-10.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L9.414 11H13a1 1 0 100-2H9.414l1.293-1.293z" clipRule="evenodd"></path></svg>
);
window.appSetup.IconLockKey = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-12 0v1H7a2 2 0 00-2 2v8a2 2 0 002 2h10a2 2 0 002-2v-8a2 2 0 00-2-2h-1V9a6 6 0 0112 0zM9 9V7a3 3 0 013-3v0a3 3 0 013 3v2"></path></svg>
);
window.appSetup.IconChevronRight = () => (
  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
);


// =================================================================
// 4. TRANSLATIONS (ការបកប្រែ)
// =================================================================
window.appSetup.translations = {
  km: {
    // Titles & Tabs
    appTitle: "កត់ត្រាម៉ោងសម្រាក",
    search: "ស្វែងរក",
    onBreak: "កំពុងសម្រាក",
    completed: "បានចូល",
    settings: "ការកំណត់",
    adminFunctions: "មុខងារ Admin",
    
    // Search Page
    searchPlaceholder: "ស្វែងរកអត្តលេខ/ឈ្មោះ",
    studentNotFound: "រកមិនឃើញនិស្សិត...",
    
    // Student Card
    statusNotYet: "មិនទាន់សម្រាក",
    statusOnBreak: "កំពុងសម្រាក",
    statusPass: "កាត",
    statusMinutes: "នាទី",
    statusCompleted: "សម្រាករួច",
    statusOvertime: "លើស",
    statusPassOut: "កាតអស់!",
    checkOut: "ចេញសម្រាក",
    checkIn: "ចូលវិញ",
    passOutWarning: "កាតចេញសម្រាកអស់",
    idNumber: "អត្តលេខ",
    class: "ថ្នាក់",
    noName: "គ្មានឈ្មោះ",
    
    // On Break Page
    noStudentsOnBreak: "មិនមាននិស្សិតកំពុងសម្រាកទេ",
    overtimeExclamation: "លើសម៉ោង!",
    
    // Completed Page
    historyToday: "ប្រវត្តិ (ថ្ងៃនេះ)",
    noStudentsCompleted: "មិនមាននិស្សិតសម្រាករួចទេ",
    specialCase: "ករណីពិសេស",
    
    // Modals (General)
    passwordRequired: "ទាមទារ Password",
    passwordPrompt: "Password...",
    passwordError: "Password មិនត្រឹមត្រូវ!",
    cancel: "បោះបង់",
    confirm: "បញ្ជាក់",
    ok: "យល់ព្រម (OK)",
    delete: "លុប",
    
    // Delete Modals
    deleteConfirmTitle: "លុបទិន្នន័យ?",
    deleteConfirmMessage: (name) => `តើអ្នកប្រាកដទេថាចង់លុបទិន្នន័យសម្រាករបស់ ${name}?`,
    deleteSelectedTitle: (count) => `តើអ្នកប្រាកដទេថាចង់លុប ${count} record ដែលបានជ្រើសរើស?`,
    deleteByDateTitle: (date) => `លុបទិន្នន័យតាមថ្ងៃ (${date})?`,
    deleteByMonthTitle: (month) => `លុបទិន្នន័យតាមខែ (${month})?`,
    
    // Info/Alert Modals
    problem: "មានបញ្ហា",
    success: "បានជោគជ័យ",
    deleteSuccess: (count) => `លុប ${count} record បានជោគជ័យ!`,
    deleteNotFound: "រកមិនឃើញទិន្នន័យសម្រាប់លុបទេ។",
    invalidNumber: "សូមបញ្ចូលតែตัวเลขប៉ុណ្ណោះ។",
    
    // QR Scanner Modal
    scanTitle: "ស្កេនកាតចូលវិញ",
    scanCameraError: "មិនអាចបើកកាមេរ៉ាបាន។ សូមអនុញ្ញាត (Allow) កាមេរ៉ា។",
    scanProcessing: "កំពុងដំណើរការ...",
    scanSuccess: "ស្កេនបាន",
    scanFail: "បានចូលវិញហើយ",
    scanInvalid: "QR Code មិនត្រឹមត្រូវ។",
    scanPassNotFound: (passNumber) => `រកមិនឃើញអ្នកកំពុងប្រើកាត ${passNumber} ទេ។\nប្រហែលគាត់បានចូលវិញហើយ។`,

    // Settings Page
    passManagement: "ការគ្រប់គ្រងកាត",
    passTotal: "សរុប",
    passInUse: "កំពុងប្រើ",
    passAvailable: "នៅសល់",
    editPassTotal: "កែសម្រួលចំនួនកាតសរុប",
    editPassTotalPrompt: "សូមបញ្ចូលចំនួនកាតសរុបថ្មី:",
    passTotalSuccess: "ចំនួនកាតសរុបបានកែប្រែ!",
    
    security: "សុវត្ថិភាព",
    changePassword: "ផ្លាស់ប្ដូរ Password",
    changePasswordPrompt: "សូមបញ្ចូល Password ថ្មី:",
    changePasswordSuccess: "Password បានផ្លាស់ប្ដូរ!",
    
    checkInMethod: "របៀបចុចចូលវិញ",
    checkInMethodPrompt: "ទាមទារ Password ដើម្បីផ្លាស់ប្ដូរ",
    checkInScan: "បើកកាមេរ៉ាស្កេន",
    checkInAuto: "ចុចចូលដោយស្វ័យប្រវត្តិ",
    checkInModeSuccess: "របៀបចុចចូលវិញ បានផ្លាស់ប្ដូរ!",

    appearance: "រូបរាង",
    language: "ភាសា",
    background: "ផ្ទៃខាងក្រោយ",
    style: "ស្តាយ",

    // Admin Modal
    multiSelect: "ជ្រើសរើស (Multi-Select)",
    deleteByDate: "លុបតាមថ្ងៃ",
    deleteByMonth: "លុបតាមខែ",
    deleting: "កំពុងលុប...",
    deleteDaily: "លុបប្រចាំថ្ងៃ",
    deleteMonthly: "លុបប្រចាំខែ",
    
    // Footer
    footer: "អភិវឌ្ឍន៍កម្មវិធី : IT SUPPORT"
  },
  en: {
    // Titles & Tabs
    appTitle: "Break Time Logger",
    search: "Search",
    onBreak: "On Break",
    completed: "Completed",
    settings: "Settings",
    adminFunctions: "Admin Functions",
    
    // Search Page
    searchPlaceholder: "Search ID/Name",
    studentNotFound: "Student not found...",
    
    // Student Card
    statusNotYet: "Not on break",
    statusOnBreak: "On Break",
    statusPass: "Pass",
    statusMinutes: "mins",
    statusCompleted: "Completed",
    statusOvertime: "Overtime",
    statusPassOut: "No Passes!",
    checkOut: "Check Out",
    checkIn: "Check In",
    passOutWarning: "All passes are in use",
    idNumber: "ID",
    class: "Class",
    noName: "No Name",
    
    // On Break Page
    noStudentsOnBreak: "No students are currently on break",
    overtimeExclamation: "Overtime!",
    
    // Completed Page
    historyToday: "History (Today)",
    noStudentsCompleted: "No students have completed breaks yet",
    specialCase: "Special Case",

    // Modals (General)
    passwordRequired: "Password Required",
    passwordPrompt: "Password...",
    passwordError: "Incorrect Password!",
    cancel: "Cancel",
    confirm: "Confirm",
    ok: "OK",
    delete: "Delete",

    // Delete Modals
    deleteConfirmTitle: "Delete Record?",
    deleteConfirmMessage: (name) => `Are you sure you want to delete ${name}'s break record?`,
    deleteSelectedTitle: (count) => `Are you sure you want to delete the ${count} selected records?`,
    deleteByDateTitle: (date) => `Delete records for date (${date})?`,
    deleteByMonthTitle: (month) => `Delete records for month (${month})?`,

    // Info/Alert Modals
    problem: "Problem",
    success: "Success",
    deleteSuccess: (count) => `Successfully deleted ${count} records!`,
    deleteNotFound: "No records found to delete.",
    invalidNumber: "Please enter a valid number.",
    
    // QR Scanner Modal
    scanTitle: "Scan Card to Check In",
    scanCameraError: "Could not start camera. Please grant camera permission.",
    scanProcessing: "Processing...",
    scanSuccess: "Scanned",
    scanFail: "Already checked in",
    scanInvalid: "Invalid QR Code.",
    scanPassNotFound: (passNumber) => `Pass ${passNumber} is not currently in use.\nMaybe they already checked in.`,

    // Settings Page
    passManagement: "Pass Management",
    passTotal: "Total",
    passInUse: "In Use",
    passAvailable: "Available",
    editPassTotal: "Edit Total Passes",
    editPassTotalPrompt: "Enter new total number of passes:",
    passTotalSuccess: "Total passes updated!",
    
    security: "Security",
    changePassword: "Change Password",
    changePasswordPrompt: "Enter new admin password:",
    changePasswordSuccess: "Password updated!",
    
    checkInMethod: "Check-In Method",
    checkInMethodPrompt: "Password required to change",
    checkInScan: "Open QR Scanner",
    checkInAuto: "Check In Automatically",
    checkInModeSuccess: "Check-in method updated!",

    appearance: "Appearance",
    language: "Language",
    background: "Background",
    style: "Style",

    // Admin Modal
    multiSelect: "Multi-Select",
    deleteByDate: "Delete by Date",
    deleteByMonth: "Delete by Month",
    deleting: "Deleting...",
    deleteDaily: "Delete Daily",
    deleteMonthly: "Delete Monthly",
    
    // Footer
    footer: "Developed by: IT SUPPORT"
  }
};


// =================================================================
// 5. BACKGROUND STYLES
// =================================================================
window.appSetup.backgroundStyles = {
  style1: "bg-gradient-to-br from-blue-900 to-indigo-700", // Default
  style2: "bg-gradient-to-br from-gray-800 to-gray-900", // Dark
  style3: "bg-gradient-to-br from-purple-800 to-pink-700", // Purple
  style4: "bg-gradient-to-br from-green-800 to-blue-700", // Green
};

