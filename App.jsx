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
  query: rtdbQuery, // ប្តូរឈ្មោះ 'query' ទៅជា 'rtdbQuery' 
  orderByChild,
  equalTo,
  remove,
  get // !! ថ្មី !!
} = window.firebase;

const { useState, useEffect } = React;

const USER_PASSWORD = '4545ak0'; // !! ថ្មី !!: Password
const TOTAL_PASSES = 40;
const OVERTIME_LIMIT_MINUTES = 15;

// --- !! ថ្មី !!: ការកំណត់ Firebase សម្រាប់ "អាន" (Read) បញ្ជីឈ្មោះ ---
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

// --- !! ថ្មី !!: ការកំណត់ Firebase សម្រាប់ "សរសេរ" (Write) វត្តមាន ---
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


// --- កំណត់ថ្ងៃ ខែ ឆ្នាំ បច្ចុប្បន្ន ---
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

// --- !! ថ្មី !!: មុខងារជំនួយ គណនារយៈពេល (នាទី) ---
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


// --- SVG Icons ---
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
// !! ថ្មី !!: Icon សម្រាប់ Admin Menu
const IconDotsVertical = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path>
  </svg>
);
// !! ថ្មី !!: Icon សម្រាប់ Password
const IconLock = () => (
  <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
  </svg>
);

// =================================================================
// !! ថ្មី !!: ផ្លាស់ទី Components ទាំងអស់ចេញពី App
// =================================================================

const StudentCard = ({ student, pageKey, passesInUse, attendance, now, handleCheckOut, handleCheckIn, onDeleteClick }) => {
  
  const studentBreaks = attendance[student.id] || [];
  const activeBreak = studentBreaks.find(r => r.checkOutTime && !r.checkInTime);
  const completedBreaks = studentBreaks.filter(r => r.checkOutTime && r.checkInTime);
      
  let statusText = 'មិនទាន់សម្រាក';
  let statusClass = 'bg-gray-500 text-white'; 
  let canCheckIn = false; 
  let canCheckOut = true;
  let isSpecialCase = false; 
  
  let passesAvailable = TOTAL_PASSES - passesInUse;
  
  if (activeBreak) {
    const elapsedMins = calculateDuration(activeBreak.checkOutTime, now.toISOString());
    const isOvertime = elapsedMins > OVERTIME_LIMIT_MINUTES;
    statusText = `កំពុងសម្រាក (${elapsedMins} នាទី)`; 
    statusClass = isOvertime 
      ? 'bg-red-600 text-white animate-pulse' 
      : 'bg-yellow-500 text-white animate-pulse';
    canCheckIn = true; 
    canCheckOut = false; 
    if (activeBreak.breakType === 'special') {
        isSpecialCase = true;
    }
    
  } else if (completedBreaks.length > 0) {
    const lastBreak = completedBreaks[completedBreaks.length - 1]; 
    const duration = calculateDuration(lastBreak.checkOutTime, lastBreak.checkInTime);
    const isCompletedOvertime = duration > OVERTIME_LIMIT_MINUTES;
    const overtimeMins = isCompletedOvertime ? duration - OVERTIME_LIMIT_MINUTES : 0;
    
    statusText = isCompletedOvertime
      ? `សម្រាករួច (លើស ${overtimeMins} នាទី)`
      : `សម្រាករួច (${duration} នាទី)`; 
    statusClass = isCompletedOvertime
      ? 'bg-red-600 text-white' 
      : 'bg-green-600 text-white';
    canCheckIn = false;
    canCheckOut = true; 
    
    if (studentBreaks.some(r => r.breakType === 'special')) {
      isSpecialCase = true;
    }

  } else {
    statusText = 'មិនទាន់សម្រាក';
    statusClass = 'bg-gray-500 text-white';
    canCheckIn = false;
    canCheckOut = true;
  }
  
  if (passesAvailable <= 0 && canCheckOut) {
    canCheckOut = false; 
    statusText = 'កាតអស់! (40/40)';
    statusClass = 'bg-red-600 text-white';
  }
  
  const photoUrl =
    student.photoUrl ||
    `https://placehold.co/128x128/EBF4FF/76A9FA?text=${student.name ? student.name.charAt(0) : 'N'}`;

  return (
    <div
      key={`${pageKey}-${student.id}`} 
      className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-xl p-6 relative mt-16 max-w-md mx-auto"
    >
      {activeBreak && (
        <button
          onClick={(e) => onDeleteClick(e, student, activeBreak)}
          className="absolute top-4 right-4 text-red-300 bg-red-900/50 p-2 rounded-full transition-all hover:bg-red-500 hover:text-white"
          title="លុបទិន្នន័យនេះ"
        >
          <IconTrash />
        </button>
      )}
      
      <img
        src={photoUrl}
        alt={`រូបថតរបស់ ${student.name || 'និស្សិត'}`}
        className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2"
        onError={(e) => {
          e.target.src = `https://placehold.co/128x128/EBF4FF/76A9FA?text=${student.name ? student.name.charAt(0) : 'N'}`;
        }}
      />
      
      <div className="pt-16 text-center">
        <p className="text-3xl font-bold text-white">
          {student.name || 'គ្មានឈ្មោះ'}
        </p>
        <p className="text-lg text-blue-200">
          អត្តលេខ: {student.idNumber || 'N/A'}
        </p>
        <p className="text-lg text-blue-200">
          ថ្នាក់: {student.class || 'N/A'}
        </p>
      </div>
      
      <div className="my-6 text-center">
         <p className={`inline-flex items-center px-5 py-2 rounded-full text-md font-semibold ${statusClass}`}>
          {statusText}
          {isSpecialCase && <IconSpecial />}
        </p>
      </div>

      {(canCheckOut || canCheckIn) && (
        <div className="flex flex-col space-y-3">
          {canCheckOut && (
            <button
              onClick={() => handleCheckOut(student.id)}
              disabled={!canCheckOut} 
              className="flex items-center justify-center w-full px-4 py-4 rounded-full text-lg text-white font-bold transition-all transform hover:scale-105 shadow-lg bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
            >
              <IconCheckOut />
              ចេញសម្រាក
            </button>
          )}
          
          {canCheckIn && (
            <button
              onClick={() => handleCheckIn(student.id)}
              disabled={!canCheckIn}
              className="flex items-center justify-center w-full px-4 py-4 rounded-full text-lg text-blue-800 font-bold transition-all transform hover:scale-105 shadow-lg bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
            >
              <IconCheckIn />
              ចូលវិញ
            </button>
          )}
        </div>
      )}
      
      {!canCheckOut && statusText.startsWith('កាតអស់') && (
        <div className="flex items-center justify-center w-full px-4 py-4 rounded-full text-lg text-white font-bold bg-red-600/50 opacity-80 cursor-not-allowed">
          <IconNoSymbol />
          កាតចេញសម្រាកអស់
        </div>
      )}
    </div>
  );
};

// !! កែសម្រួល !!: បន្ថែម 'isSelectionMode' ក្នុង props
const CompletedStudentListCard = ({ student, record, onClick, isSelected, onSelect, onDeleteClick, isSelectionMode }) => {
  
  const formatTime = (isoString) => {
    if (!isoString) return 'N/A';
    return new Date(isoString).toLocaleTimeString('km-KH', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const duration = calculateDuration(record?.checkOutTime, record?.checkInTime);
  
  const isOvertime = duration > OVERTIME_LIMIT_MINUTES;
  const overtimeMins = isOvertime ? duration - OVERTIME_LIMIT_MINUTES : 0;
  const cardColor = isOvertime 
    ? 'bg-red-800/30 backdrop-blur-lg border border-red-500/30' 
    : 'bg-white/10 backdrop-blur-lg'; 
  const durationColor = isOvertime ? 'text-red-300' : 'text-green-300';

  const photoUrl =
    student.photoUrl ||
    `https://placehold.co/64x64/EBF4FF/76A9FA?text=${student.name ? student.name.charAt(0) : 'N'}`;

  return (
    <div
      className={`w-full max-w-md mx-auto rounded-2xl shadow-lg p-4 mb-3 flex items-center space-x-4 transition-all ${cardColor} ${isSelectionMode ? 'cursor-pointer' : ''} ${isSelected ? 'ring-2 ring-blue-400' : ''}`}
      onClick={() => isSelectionMode ? onSelect() : (onClick ? onClick() : null)}
    >
      {isSelectionMode && (
        <input 
          type="checkbox"
          checked={isSelected}
          onChange={onSelect}
          className="form-checkbox h-6 w-6 text-blue-600 bg-gray-700 border-gray-500 rounded focus:ring-blue-500"
          onClick={(e) => e.stopPropagation()} 
        />
      )}
      <img
        src={photoUrl}
        alt={`រូបថតរបស់ ${student.name || 'និស្សិត'}`}
        className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md"
        onError={(e) => {
          e.target.src = `https://placehold.co/64x64/EBF4FF/76A9FA?text=${student.name ? student.name.charAt(0) : 'N'}`;
        }}
      />
      <div className="flex-1 text-left">
        <p className="text-xl font-bold text-white">
          {student.name || 'គ្មានឈ្មោះ'}
        </p>
        <p className="text-sm text-blue-200">
          ចេញ: {formatTime(record?.checkOutTime)} | ចូល: {formatTime(record?.checkInTime)}
        </p>
        {isOvertime && (
          <p className="text-sm font-semibold text-red-300">
            (លើស {overtimeMins} នាទី)
          </p>
        )}
        {record.breakType === 'special' && (
           <p className="text-sm font-semibold text-purple-300">
            (ករណីពិសេស)
           </p>
        )}
      </div>
      
      <div className="text-center px-2">
        <p className={`text-2xl font-bold ${durationColor}`}>{duration}</p>
        <p className="text-xs text-blue-200">នាទី</p>
      </div>
      
      {!isSelectionMode && (
        <button
          onClick={(e) => onDeleteClick(e)}
          className="p-3 rounded-full text-red-300 bg-white/10 transition-colors hover:bg-red-500 hover:text-white"
          title="លុបទិន្នន័យនេះ"
        >
          <IconTrash />
        </button>
      )}
    </div>
  );
};

const OnBreakStudentListCard = ({ student, record, elapsedMins, isOvertime, onCheckIn, onDeleteClick }) => {
  
  const cardColor = isOvertime 
    ? 'bg-red-800/30 backdrop-blur-lg border border-red-500/30' 
    : 'bg-yellow-500/20 backdrop-blur-lg border border-yellow-500/30'; 
  
  const textColor = isOvertime ? 'text-red-300' : 'text-yellow-300';

  const photoUrl =
    student.photoUrl ||
    `https://placehold.co/64x64/EBF4FF/76A9FA?text=${student.name ? student.name.charAt(0) : 'N'}`;

  return (
    <div className={`w-full max-w-md mx-auto rounded-2xl shadow-lg p-4 mb-3 flex items-center space-x-3 ${cardColor}`}>
      <img
        src={photoUrl}
        alt={`រូបថតរបស់ ${student.name || 'និស្សិត'}`}
        className="w-16 h-16 rounded-full object-cover border-2 border-white/50 shadow-md"
        onError={(e) => { e.target.src = `https://placehold.co/64x64/EBF4FF/76A9FA?text=${student.name ? student.name.charAt(0) : 'N'}`; }}
      />
      <div className="flex-1 text-left">
        <p className="text-xl font-bold text-white">
          {student.name || 'គ្មានឈ្មោះ'}
        </p>
        <p className={`text-sm font-semibold ${textColor} inline-flex items-center`}>
          {isOvertime ? "លើសម៉ោង!" : "កំពុងសម្រាក..."}
          {record.breakType === 'special' && (
            <span className="ml-2 px-2 py-0.5 text-xs text-purple-800 bg-purple-300 rounded-full">
              ពិសេស
            </span>
          )}
        </p>
      </div>
      
      <div className="text-center px-2">
        <p className={`text-2xl font-bold ${textColor}`}>{elapsedMins}</p>
        <p className="text-xs text-blue-200">នាទី</p>
      </div>
      
      <div className="flex flex-col space-y-2">
        <button
          onClick={() => onCheckIn()}
          className="p-3 rounded-full text-blue-800 bg-white transition-colors hover:bg-gray-200"
          title="ចុចចូលវិញ"
        >
          <IconCheckIn />
        </button>
        
        <button
          onClick={(e) => onDeleteClick(e)}
          className="p-3 rounded-full text-red-300 bg-white/10 transition-colors hover:bg-red-500 hover:text-white"
          title="លុបទិន្នន័យនេះ"
        >
          <IconTrash />
        </button>
      </div>
    </div>
  );
};

const PassesInfoPage = ({ studentsOnBreakCount, totalPasses }) => {
    const passesInUse = studentsOnBreakCount;
    const passesAvailable = totalPasses - passesInUse;
    
    return (
      <div className="w-full max-w-md mx-auto bg-white/10 backdrop-blur-lg rounded-3xl shadow-xl p-8 mt-16 text-center">
        <div className="mb-6">
          <IconTicket className="w-24 h-24 text-blue-200 mx-auto" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-4">
          ស្ថានភាពកាតចេញចូល
        </h2>
        
        <div className="mb-8">
          <p className="text-8xl font-bold text-white">{passesAvailable}</p>
          <p className="text-2xl text-blue-200">
            កាតនៅសល់
          </p>
        </div>
        
        <div className="flex justify-around text-white">
          <div className="text-center">
            <p className="text-4xl font-bold text-red-300">{passesInUse}</p>
            <p className="text-lg text-blue-200">កំពុងប្រើ</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold">{totalPasses}</p>
            <p className="text-lg text-blue-200">សរុប</p>
          </div>
        </div>
      </div>
    );
};

// --- !! ថ្មី !!: Modal សម្រាប់ Password ---
const PasswordConfirmationModal = ({ prompt, onSubmit, onCancel }) => {
  if (!prompt.isOpen) return null;
  
  const [password, setPassword] = useState("");
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(password);
  };
  
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
      onClick={onCancel} 
    >
      <div
        className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-6 text-center"
        onClick={(e) => e.stopPropagation()} 
      >
        <IconLock />
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          ទាមទារ Password
        </h3>
        <p className="text-gray-600 mb-4">
          {prompt.message}
        </p>
        <form onSubmit={handleSubmit}>
          <input 
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-lg"
            placeholder="Password..."
            autoFocus
          />
          {prompt.error && (
            <p className="text-red-500 text-sm mt-2">{prompt.error}</p>
          )}
          <div className="flex justify-center space-x-4 mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 rounded-full text-gray-700 bg-gray-200 hover:bg-gray-300 font-bold"
            >
              បោះបង់
            </button>
            <button
              type="submit"
              className="px-6 py-3 rounded-full text-white bg-blue-500 hover:bg-blue-600 font-bold"
            >
              បញ្ជាក់
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- !! ថ្មី !!: Modal សម្រាប់ Admin Actions ---
const AdminActionModal = ({ isOpen, onClose, onSelectClick, onBulkClick, isBulkLoading, bulkDeleteDate, setBulkDeleteDate, bulkDeleteMonth, setBulkDeleteMonth }) => {
  if (!isOpen) return null;
  
  return (
    <div 
      className="fixed inset-0 z-50 flex items-end justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose} 
    >
      <div
        className="w-full max-w-md bg-white rounded-t-2xl shadow-lg p-4"
        onClick={(e) => e.stopPropagation()} 
      >
        <div className="w-16 h-1.5 bg-gray-300 rounded-full mx-auto mb-4"></div>
        
        <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
          មុខងារ Admin
        </h3>
        
        <div className="space-y-3">
          <button
            onClick={onSelectClick}
            className="w-full px-4 py-3 text-left text-lg font-semibold text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-lg"
          >
            ជ្រើសរើស (Multi-Select)
          </button>
          
          {/* មុខងារលុបតាមថ្ងៃ */}
          <div className="p-4 bg-gray-100 rounded-lg">
            <label className="block text-lg font-semibold text-gray-800 mb-2">លុបតាមថ្ងៃ</label>
            <input 
              type="date"
              value={bulkDeleteDate}
              onChange={(e) => setBulkDeleteDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-lg"
            />
            <button
              onClick={() => onBulkClick('day')}
              className="w-full mt-2 px-4 py-3 text-lg font-bold text-white bg-red-500 hover:bg-red-600 rounded-lg disabled:opacity-50"
              disabled={isBulkLoading}
            >
              {isBulkLoading ? 'កំពុងលុប...' : 'លុបប្រចាំថ្ងៃ'}
            </button>
          </div>
          
          {/* មុខងារលុបតាមខែ */}
          <div className="p-4 bg-gray-100 rounded-lg">
            <label className="block text-lg font-semibold text-gray-800 mb-2">លុបតាមខែ</label>
            <input 
              type="month"
              value={bulkDeleteMonth}
              onChange={(e) => setBulkDeleteMonth(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-lg"
            />
            <button
              onClick={() => onBulkClick('month')}
              className="w-full mt-2 px-4 py-3 text-lg font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-50"
              disabled={isBulkLoading}
            >
              {isBulkLoading ? 'កំពុងលុប...' : 'លុបប្រចាំខែ'}
            </button>
          </div>
          
        </div>
      </div>
    </div>
  );
};

// --- !! ថ្មី !!: Header សម្រាប់ Page "បានចូល" ---
const CompletedListHeader = ({ onAdminClick, onMultiDeleteClick, onCancelMultiSelect, selectionCount, isSelectionMode }) => {
  return (
    <div className="w-full max-w-md mx-auto mb-4 flex justify-between items-center">
      {!isSelectionMode ? (
        <>
          <h2 className="text-2xl font-bold text-white">
            ប្រវត្តិ (ថ្ងៃនេះ)
          </h2>
          <button
            onClick={onAdminClick}
            className="p-3 rounded-full text-white bg-white/10 transition-colors hover:bg-white/30"
            title="មុខងារ Admin"
          >
            <IconDotsVertical />
          </button>
        </>
      ) : (
        <>
          <button
            onClick={onCancelMultiSelect}
            className="px-4 py-2 text-white font-semibold bg-gray-600/50 rounded-full hover:bg-gray-500/50"
          >
            បោះបង់
          </button>
          <button
            onClick={onMultiDeleteClick}
            disabled={selectionCount === 0}
            className="px-4 py-2 text-white font-bold bg-red-500 rounded-full hover:bg-red-600 disabled:opacity-50"
          >
            លុប ({selectionCount})
          </button>
        </>
      )}
    </div>
  );
};

const LoadingSpinner = () => (
  <div className="flex justify-center items-center mt-10">
    <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
  </div>
);

// !! ថ្មី !!: បន្ថែម Component នេះ
const DeleteConfirmationModal = ({ recordToDelete, onCancel, onConfirm }) => {
    if (!recordToDelete) return null;
    
    const { student } = recordToDelete;
    
    return (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
        onClick={onCancel} 
      >
        <div
          className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-6 text-center"
          onClick={(e) => e.stopPropagation()} 
        >
          <IconAlert />
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            លុបទិន្នន័យ?
          </h3>
          <p className="text-gray-600 mb-6">
            តើអ្នកប្រាកដទេថាចង់លុបទិន្នន័យសម្រាករបស់ <br/>
            <strong className="text-gray-800">{student.name}</strong>?
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={onCancel}
              className="px-6 py-3 rounded-full text-gray-700 bg-gray-200 hover:bg-gray-300 font-bold"
            >
              បោះបង់
            </button>
            <button
              onClick={onConfirm}
              className="px-6 py-3 rounded-full text-white bg-red-500 hover:bg-red-600 font-bold"
            >
              លុប
            </button>
          </div>
        </div>
      </div>
    );
  };

// =================================================================
// Component គោល
// =================================================================
function App() {
  const [dbRead, setDbRead] = useState(null); 
  const [dbWrite, setDbWrite] = useState(null); 
  
  const [userId, setUserId] = useState(null); 
  const [students, setStudents] = useState([]); 
  const [attendance, setAttendance] = useState({}); 
  
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState(""); 
  
  const [currentPage, setCurrentPage] = useState('search'); 
  
  const [authError, setAuthError] = useState(null); 
  
  const [modalStudent, setModalStudent] = useState(null);
  
  const [now, setNow] = useState(new Date());
  
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  
  const [passwordPrompt, setPasswordPrompt] = useState({ isOpen: false });
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedRecords, setSelectedRecords] = useState([]); // Array of record IDs
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [bulkDeleteMode, setBulkDeleteMode] = useState(null); // 'day' or 'month'
  const [bulkDeleteDate, setBulkDeleteDate] = useState(getTodayLocalDateString());
  const [bulkDeleteMonth, setBulkDeleteMonth] = useState(getTodayLocalMonthString());
  const [isBulkLoading, setIsBulkLoading] = useState(false);
  
  // !! ថ្មី !!: State សម្រាប់ Modal លុប (សាមញ្ញ)
  const [recordToDelete, setRecordToDelete] = useState(null); // { student, record }

  // --- មុខងារ TTS ---
  const speak = (text) => {
    try {
      if (!window.speechSynthesis) {
        console.warn("Browser does not support Speech Synthesis.");
        return;
      }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'km-KH'; 
      utterance.rate = 0.9; 
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error("Speech Synthesis Error:", e);
    }
  };

  // Effect សម្រាប់ Timer (1 វិនាទី)
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000); 
    return () => clearInterval(timer);
  }, []); 

  // ជំហានទី 1: ដំណើរការ Firebase ទាំងពីរ
  useEffect(() => {
    const initFirebase = async () => {
      try {
        const readApp = initializeApp(firebaseConfigRead, 'readApp');
        const authInstanceRead = getAuth(readApp);
        const dbInstanceRead = getDatabase(readApp);
        
        const writeApp = initializeApp(firebaseConfigWrite, 'writeApp');
        const authInstanceWrite = getAuth(writeApp);
        const dbInstanceWrite = getDatabase(writeApp);

        try {
          await signInAnonymously(authInstanceRead);
          console.log("Read App (dilistname) Signed in.");
          setDbRead(dbInstanceRead); 
        } catch (error) {
          console.error('Read App Auth Error:', error);
          if (error.code === 'auth/configuration-not-found') {
            setAuthError("!!! ERROR: សូមបើក 'Anonymous' Sign-in នៅក្នុង Firebase Project 'dilistname' (App អាន)។");
          } else {
            setAuthError(`Read Auth Error: ${error.message}`);
          }
        }
        
        onAuthStateChanged(authInstanceWrite, async (user) => {
          if (user) {
            console.log("Write App (brakelist) Signed in.");
            setUserId(user.uid);
            setDbWrite(dbInstanceWrite); 
          } else {
            try {
              await signInAnonymously(authInstanceWrite);
            } catch (authError) {
              console.error('Write App Auth Error:', authError);
              if (authError.code === 'auth/configuration-not-found') {
                setAuthError("!!! ERROR: សូមចូលទៅ Firebase Project 'brakelist-5f07f' -> Authentication -> Sign-in method -> ហើយចុចបើក 'Anonymous' provider។");
              } else {
                setAuthError(`Write Auth Error: ${authError.message}`);
              }
            }
          }
        });
        
      } catch (error) {
        console.error('Firebase Init Error:', error);
        setAuthError(`Firebase Init Error: ${error.message}`);
      }
    };
    
    initFirebase();
  }, []); 
  
  // ជំហានទី 2: ទាញទិន្នន័យ (ពី DB ផ្សេងគ្នា)
  useEffect(() => {
    if (dbRead && dbWrite) {
      setLoading(true);
      let studentLoading = true;
      
      const studentsRef = ref(dbRead, 'students');
      const unsubscribeStudents = onValue(
        studentsRef,
        (snapshot) => {
          const studentsData = snapshot.val();
          const studentList = [];
          if (studentsData) {
            Object.keys(studentsData).forEach((key) => {
              const student = studentsData[key];
              studentList.push({
                id: key, 
                ...student,
                name: student.name || student.ឈ្មោះ,
                idNumber: student.idNumber || student.អត្តលេខ,
                photoUrl: student.photoUrl || student.រូបថត,
                class: student.class || student.ថា្នក់,
              });
            });
          }
          studentList.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
          setStudents(studentList);
          console.log("Student list fetched successfully from 'dilistname'.");
          studentLoading = false;
          setLoading(false); 
        },
        (error) => {
          console.error('Student Fetch Error (RTDB - dbRead):', error);
          if (error.code === 'PERMISSION_DENIED') {
             setAuthError("!!! ERROR: 'dilistname' permission denied. សូមពិនិត្យ Security Rules របស់ 'dilistname' ឲ្យអនុញ្ញាតអាន (read) path '/students' (Rule ត្រូវជា 'auth != null')។");
          } else {
             setAuthError(`Student Fetch Error: ${error.message}`);
          }
          studentLoading = false;
          setLoading(false);
        },
      );

      const attendanceRef = ref(dbWrite, 'attendance');
      const qAttendance = rtdbQuery(
        attendanceRef,
        orderByChild('date'),
        equalTo(todayString),
      );
      const unsubscribeAttendance = onValue(
        qAttendance,
        (snapshot) => {
          const attMap = {};
          const attData = snapshot.val();
          if (attData) {
            Object.keys(attData).forEach((key) => {
              const data = attData[key];
              if (!attMap[data.studentId]) {
                attMap[data.studentId] = []; 
              }
              attMap[data.studentId].push({ id: key, ...data });
            });
          }
          for (const studentId in attMap) {
            attMap[studentId].sort((a, b) => new Date(a.checkOutTime) - new Date(b.checkOutTime));
          }
          setAttendance(attMap);
          console.log("Attendance data (as array map) fetched successfully from 'brakelist'.");
        },
        (error) => {
          console.error('Attendance Fetch Error (RTDB - dbWrite):', error);
          if (error.code === 'PERMISSION_DENIED') {
            setAuthError("!!! ERROR: 'brakelist-5f07f' permission denied. សូមពិនិត្យ Security Rules របស់ 'brakelist-5f07f' ឲ្យអនុញ្ញាតអាន (read) path '/attendance'។");
          } else {
            setAuthError(`Attendance Fetch Error: ${error.message}`);
          }
        },
      );
      
      return () => {
        unsubscribeStudents();
        unsubscribeAttendance();
      };
    }
  }, [dbRead, dbWrite, todayString]); 

  // --- ត្រង (Filter) និស្សិត (ប្រើក្នុង Render) ---
  const studentsOnBreak = students.filter(student => {
    const breaks = attendance[student.id] || [];
    return breaks.some(r => r.checkOutTime && !r.checkInTime); 
  });
  
  // --- មុខងារសម្រាប់កត់ត្រា (ប្រើ dbWrite) ---
  
  const handleCheckOut = async (studentId) => {
    const student = students.find(s => s.id === studentId);
    if (!student) {
      console.error("Check-out Error: Student not found for ID:", studentId);
      return;
    }
        
    if (!dbWrite) {
        console.error("Check-out Error: dbWrite is not initialized."); 
        return; 
    }
    
    const passesInUse = studentsOnBreak.length;
    if (passesInUse >= TOTAL_PASSES) {
      setAuthError(`!!! ERROR: កាតចេញសម្រាកអស់ហើយ! (${passesInUse}/${TOTAL_PASSES})`);
      return; 
    }
    
    speak(`${student.name || 'និស្សិត'} បានចេញក្រៅ`);

    const now = new Date();
    const studentBreaks = attendance[studentId] || [];
    const completedBreaks = studentBreaks.filter(r => r.checkInTime && r.checkOutTime);
    const breakCount = completedBreaks.length;
    
    let breakType = "normal"; 
    
    if (breakCount === 0) {
      breakType = "normal";
      console.log("Break 1 attempt.");
    } else if (breakCount === 1) {
      breakType = "normal";
      console.log("Break 2 attempt.");
    } else {
      breakType = "special"; // ករណីពិសេស
      console.log("Break 3+ (Special Case) attempt.");
    }
    
    const attendanceRef = ref(dbWrite, 'attendance');
    const newRecordRef = push(attendanceRef);
    try {
      await set(newRecordRef, {
        studentId: studentId, 
        date: todayString,
        checkInTime: null,
        checkOutTime: now.toISOString(), 
        breakType: breakType 
      });
      
      setSearchTerm('');
      setSelectedStudentId('');
      setSearchResults([]); 
      setIsSearchFocused(false); 
    } catch (error) {
      console.error('Check-out Error (RTDB - dbWrite):', error);
      if (error.code === 'PERMISSION_DENIED') {
         setAuthError("!!! ERROR: 'brakelist-5f07f' permission denied. សូមពិនិត្យ Security Rules របស់ 'brakelist-5f07f' ឲ្យអនុញ្ញាតសរសេរ (write) path '/attendance'។");
      }
    }
  };
  
  const handleCheckIn = async (studentId) => {
    const student = students.find(s => s.id === studentId);
    if (!student) {
      console.error("Check-in Error: Student not found for ID:", studentId);
      return;
    }
    
    speak(`${student.name || 'និស្សិត'} បានចូលមកវិញ`);
        
    if (!dbWrite) {
        console.error("Check-in Error: dbWrite is not initialized."); 
        return;
    }
    
    const studentBreaks = attendance[studentId] || [];
    const activeBreak = studentBreaks.find(r => r.checkOutTime && !r.checkInTime);
    
    if (!activeBreak) {
       console.error("Check-in Error: No active break found for this student.");
       return;
    }

    const now = new Date();
    const docId = activeBreak.id; 
    const docRef = ref(dbWrite, `attendance/${docId}`);
    try {
      await update(docRef, {
        checkInTime: now.toISOString(),
      });
      
      setSearchTerm(''); 
      setSelectedStudentId(''); 
      setSearchResults([]); 
      setIsSearchFocused(false); 
    } catch (error) {
      console.error('Check-in Error (RTDB - dbWrite):', error);
       if (error.code === 'PERMISSION_DENIED') {
         setAuthError("!!! ERROR: 'brakelist-5f07f' permission denied. សូមពិនិត្យ Security Rules របស់ 'brakelist-5f07f' ឲ្យអនុញ្ញាតសរសេរ (write) path '/attendance'។");
       }
    }
  };
  
  // --- !! ថ្មី !!: មុខងារលុប និង Password ---
  
  const handleOpenPasswordModal = (message, onConfirmCallback) => {
    setPasswordPrompt({
      isOpen: true,
      message: message,
      onConfirm: onConfirmCallback,
      error: null
    });
  };
  
  // !! ថ្មី !!: មុខងារលុប (សាមញ្ញ)
  const handleOpenDeleteModal_Simple = (e, student, record) => {
    e.stopPropagation();
    setRecordToDelete({ student, record });
  };
  
  const handlePasswordSubmit = (password) => {
    if (password === USER_PASSWORD) {
      passwordPrompt.onConfirm(); // ដំណើរការ
      setPasswordPrompt({ isOpen: false }); // បិទ Modal
    } else {
      setPasswordPrompt(prev => ({ ...prev, error: "Password មិនត្រឹមត្រូវ!" }));
    }
  };
  
  // -- 1. លុបតែមួយ (Single Delete) --
  const handleConfirmDelete_Single = async (recordId) => {
    if (!dbWrite) return;
    const docRef = ref(dbWrite, `attendance/${recordId}`);
    try {
      await remove(docRef);
      console.log("Delete successful!");
    } catch (error) {
      console.error('Delete Error (RTDB - dbWrite):', error);
      setAuthError(`Delete Error: ${error.message}`);
    }
  };
  
  // -- 2. លុបច្រើន (Multi-Select) --
  const handleToggleSelectionMode = () => {
    setIsSelectionMode(prev => !prev);
    setSelectedRecords([]);
    setShowAdminModal(false);
  };
  
  const handleRecordSelect = (recordId) => {
    setSelectedRecords(prev => 
      prev.includes(recordId) 
        ? prev.filter(id => id !== recordId) 
        : [...prev, recordId]
    );
  };
  
  const handleOpenDeleteSelected = () => {
    if (selectedRecords.length === 0) return;
    handleOpenPasswordModal(
      `តើអ្នកប្រាកដទេថាចង់លុប ${selectedRecords.length} record ដែលបានជ្រើសរើស?`,
      () => handleConfirmDelete_Multi()
    );
  };

  const handleConfirmDelete_Multi = async () => {
    if (!dbWrite || selectedRecords.length === 0) return;
    
    const updates = {};
    selectedRecords.forEach(recordId => {
      updates[`/attendance/${recordId}`] = null; // Set to null to delete
    });
    
    try {
      await update(ref(dbWrite), updates);
      console.log("Multi-delete successful!");
      handleToggleSelectionMode(); // ចេញពី Selection Mode
    } catch (error) {
      console.error('Multi-Delete Error (RTDB - dbWrite):', error);
      setAuthError(`Multi-Delete Error: ${error.message}`);
    }
  };
  
  // -- 3. លុបតាមថ្ងៃ/ខែ (Bulk Delete) --
  const handleOpenBulkDelete = (mode) => {
    setBulkDeleteMode(mode);
    setShowAdminModal(false);
    // បើក Password Modal *បន្ទាប់ពី* បិទ Admin Modal
    setTimeout(() => {
      handleOpenPasswordModal(
        mode === 'day' 
          ? `លុបទិន្នន័យតាមថ្ងៃ (${bulkDeleteDate})?` 
          : `លុបទិន្នន័យតាមខែ (${bulkDeleteMonth})?`,
        () => handleConfirmBulkDelete(mode)
      );
    }, 100);
  };
  
  const handleConfirmBulkDelete = async (mode) => {
    if (!dbWrite) return;
    setIsBulkLoading(true);
    setAuthError(null);
    
    try {
      const attendanceRef = ref(dbWrite, 'attendance');
      const allDataSnapshot = await get(attendanceRef);
      
      if (!allDataSnapshot.exists()) {
        console.log("No data to delete.");
        setIsBulkLoading(false);
        return;
      }
      
      const allData = allDataSnapshot.val();
      const updates = {};
      let count = 0;

      const filterDate = mode === 'day' ? bulkDeleteDate : bulkDeleteMonth;
      
      Object.keys(allData).forEach(recordId => {
        const record = allData[recordId];
        if (record && record.date) {
          const recordDate = record.date; // 'YYYY-MM-DD'
          
          if (mode === 'day' && recordDate === filterDate) {
            updates[`/attendance/${recordId}`] = null;
            count++;
          } else if (mode === 'month' && recordDate.startsWith(filterDate)) {
            updates[`/attendance/${recordId}`] = null;
            count++;
          }
        }
      });
      
      if (count > 0) {
        await update(ref(dbWrite), updates);
        console.log(`Successfully bulk-deleted ${count} records.`);
        alert(`លុប ${count} record បានជោគជ័យ!`);
      } else {
        console.log("No matching records found to delete.");
        alert("រកមិនឃើញទិន្នន័យសម្រាប់លុបទេ។");
      }
      
    } catch (error) {
      console.error('Bulk Delete Error:', error);
      setAuthError(`Bulk Delete Error: ${error.message}`);
    } finally {
      setIsBulkLoading(false);
      setBulkDeleteMode(null);
    }
  };
  
  // ------------------------------------
  
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setSelectedStudentId(""); 

    const normalizedSearch = String(value).replace(/\s+/g, '').toLowerCase();

    if (normalizedSearch === "") {
      setSearchResults([]); 
    } else {
      const matches = students.filter(student => 
        (student.name && student.name.replace(/\s+/g, '').toLowerCase().includes(normalizedSearch)) ||
        (student.idNumber && String(student.idNumber).replace(/\s+/g, '').includes(normalizedSearch))
      ).slice(0, 10); 
      setSearchResults(matches);
    }
  };
  
  const handleSelectStudentFromList = (student) => {
    setSearchTerm(student.name || String(student.idNumber)); 
    setSelectedStudentId(student.id); 
    setSearchResults([]); 
    setIsSearchFocused(false); 
  };

  // --- ត្រង (Filter) និង រៀបចំ (Sort) និស្សិត ---
  
  const sortedStudentsOnBreak = studentsOnBreak
    .map(student => {
      const breaks = attendance[student.id] || [];
      const activeBreak = breaks.find(r => r.checkOutTime && !r.checkInTime);
      
      if (!activeBreak) return null; 

      const elapsedMins = calculateDuration(activeBreak.checkOutTime, now.toISOString()); 
      const isOvertime = elapsedMins > OVERTIME_LIMIT_MINUTES; 
      return { student, record: activeBreak, elapsedMins, isOvertime };
    })
    .filter(Boolean) 
    .sort((a, b) => {
      if (a.isOvertime !== b.isOvertime) {
        return a.isOvertime ? -1 : 1;
      }
      return b.elapsedMins - a.elapsedMins;
    });

  const allCompletedBreaks = [];
  students.forEach(student => {
    const breaks = attendance[student.id] || [];
    breaks.forEach(record => {
      if (record.checkInTime && record.checkOutTime) {
        allCompletedBreaks.push({ student, record });
      }
    });
  });
  allCompletedBreaks.sort((a, b) => new Date(b.record.checkInTime) - new Date(a.record.checkInTime));
  
  
  const selectedStudent = students.find(s => s.id === selectedStudentId);

  // Component គោល
  return (
    <React.Fragment>
      {/* <style> បានផ្លាស់ទីទៅ <head> របស់ HTML */}

      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-indigo-700 font-kantumruy p-4">
        <div className="container mx-auto max-w-lg relative">
          
          <div 
            className={`transition-all duration-300 ease-in-out ${isSearchFocused ? '-translate-y-24' : 'translate-y-0'}`}
          >
            <h1 
              className="text-4xl font-bold text-center mb-2 text-white"
            >
              កត់ត្រាម៉ោងសម្រាក
            </h1>
            
            <p className="text-xl text-center text-blue-200 mb-6">
              {displayDate}
            </p>
          </div>


          {/* --- 2. TABS --- */}
          <div className={`w-full max-w-md mx-auto bg-white/10 backdrop-blur-sm rounded-full p-1 flex space-x-1 mb-6 transition-all duration-300 ease-in-out ${isSearchFocused ? '-translate-y-24' : 'translate-y-0'}`}>
            
            {/* Tab 1: ស្វែងរក */}
            <button
              onClick={() => setCurrentPage('search')}
              className={`w-1/4 px-2 py-3 rounded-full flex items-center justify-center transition-colors relative ${
                currentPage === 'search' 
                  ? 'bg-white text-blue-800 shadow-lg' 
                  : 'text-white'
              }`}
            >
              <span className="relative z-10 flex items-center">
                <IconSearch />
              </span>
            </button>
            
            {/* Tab 2: កំពុងសម្រាក */}
            <button
              onClick={() => setCurrentPage('onBreak')}
              className={`w-1/4 px-2 py-3 rounded-full flex items-center justify-center transition-colors relative ${
                currentPage === 'onBreak' 
                  ? 'bg-white text-blue-800 shadow-lg' 
                  : 'text-white'
              }`}
            >
              <span className="relative z-10 flex items-center">
                <IconClock />
                {studentsOnBreak.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {studentsOnBreak.length}
                  </span>
                )}
              </span>
            </button>
            
            {/* Tab 3: បានចូល */}
            <button
              onClick={() => setCurrentPage('completed')}
              className={`w-1/4 px-2 py-3 rounded-full flex items-center justify-center transition-colors relative ${
                currentPage === 'completed' 
                  ? 'bg-white text-blue-800 shadow-lg' 
                  : 'text-white'
              }`}
            >
              <span className="relative z-10 flex items-center">
                <IconCheckCircle />
                {allCompletedBreaks.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {allCompletedBreaks.length}
                  </span>
                )}
              </span>
            </button>
            
            {/* Tab 4: កាតចេញចូល */}
            <button
              onClick={() => setCurrentPage('passes')}
              className={`w-1/4 px-2 py-3 rounded-full flex items-center justify-center transition-colors relative ${
                currentPage === 'passes' 
                  ? 'bg-white text-blue-800 shadow-lg' 
                  : 'text-white'
              }`}
            >
              <span className="relative z-10 flex items-center">
                <IconTicket />
                {studentsOnBreak.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {studentsOnBreak.length}
                  </span>
                )}
              </span>
            </button>
          </div>

          {/* --- 3. ផ្នែក CONTENT --- */}
          
          {loading && <LoadingSpinner />}

          {authError && (
            <div className="mt-4 mb-4 text-center bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative max-w-md mx-auto" role="alert">
              <strong className="font-bold">បញ្ហា!</strong>
              <span className="block sm:inline ml-2">{authError}</span>
              <button onClick={() => setAuthError(null)} className="absolute top-0 bottom-0 right-0 px-4 py-3 text-red-700">✕</button>
            </div>
          )}
           
          {/* --- PAGE 1: ស្វែងរក --- */}
          {!loading && currentPage === 'search' && (
            <div 
              key="search-page"
              className="relative" 
            >
              <div className={`w-full max-w-md mx-auto transition-all duration-300 ease-in-out ${isSearchFocused ? '-translate-y-24' : 'mb-8'}`}>
                {students.length > 0 ? (
                  <div className="relative">
                    <input
                      type="text"
                      id="student-search"
                      value={searchTerm}
                      onChange={handleSearchChange}
                      onFocus={() => {
                        setIsSearchFocused(true);
                        setAuthError(null); 
                      }}
                      onBlur={() => {
                        setTimeout(() => {
                          if (!document.activeElement.classList.contains('search-result-button')) {
                            setIsSearchFocused(false); 
                            setSearchResults([]); 
                          }
                        }, 200); 
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.target.blur(); 
                          setIsSearchFocused(false);
                        }
                      }}
                      placeholder="ស្វែងរកអត្តលេខ/ឈ្មោះ" 
                      className="block w-full px-6 py-4 bg-white/20 border border-white/30 rounded-full text-white text-lg placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white shadow-inner"
                    />
                    
                    {isSearchFocused && searchResults.length > 0 && (
                      <div className="absolute z-10 w-full max-w-md mt-2 bg-white/90 backdrop-blur-lg rounded-2xl shadow-lg max-h-80 overflow-y-auto">
                        {searchResults.map(student => (
                          <button
                            key={student.id}
                            className="search-result-button flex items-center w-full p-3 space-x-3 text-left text-gray-800 hover:bg-blue-100 first:rounded-t-2xl last:rounded-b-2xl"
                            onMouseDown={() => handleSelectStudentFromList(student)}
                          >
                            <img
                              src={student.photoUrl || `https://placehold.co/40x40/EBF4FF/76A9FA?text=${student.name ? student.name.charAt(0) : 'N'}`}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                            <div>
                              <p className="font-bold">{student.name}</p>
                              <p className="text-sm text-gray-600">{student.idNumber}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                    
                  </div>
                ) : (
                  !authError && (
                    <div className="flex flex-col justify-center items-center mt-4">
                      <p className="text-gray-300 text-lg">
                        មិនមានទិន្នន័យនិស្សិត...
                      </p>
                      <p className="text-gray-400 text-sm mt-2">
                        (កំពុងព្យាយាមទាញពី `dilistname`...)
                      </p>
                    </div>
                  )
                )}
              </div>
              
              {selectedStudent && (
                <StudentCard 
                  student={selectedStudent} 
                  pageKey="search"
                  passesInUse={studentsOnBreak.length} 
                  attendance={attendance}
                  now={now}
                  handleCheckOut={handleCheckOut}
                  handleCheckIn={handleCheckIn}
                  onDeleteClick={handleOpenDeleteModal_Simple} // !! កែសម្រួល !!
                />
              )}
              {!selectedStudent && searchTerm !== "" && searchResults.length === 0 && isSearchFocused && (
                <p className="text-center text-white/70 text-lg mt-10">
                  រកមិនឃើញនិស្សិត...
                </p>
              )}
            </div>
          )}

          {/* --- PAGE 2: កំពុងសម្រាក --- */}
          {!loading && currentPage === 'onBreak' && (
            <div 
              key="on-break-page"
              className="pb-10"
            >
              {sortedStudentsOnBreak.length > 0 ? (
                sortedStudentsOnBreak.map(({ student, record, elapsedMins, isOvertime }) => (
                  <OnBreakStudentListCard 
                    key={record.id} 
                    student={student} 
                    record={record}
                    elapsedMins={elapsedMins} 
                    isOvertime={isOvertime}
                    onCheckIn={() => handleCheckIn(student.id)} 
                    onDeleteClick={(e) => handleOpenDeleteModal_Simple(e, student, record)} // !! កែសម្រួល !!
                  />
                ))
              ) : (
                <div className="mt-16 text-center">
                  <p className="text-white text-2xl font-semibold">
                    មិនមាននិស្សិតកំពុងសម្រាកទេ
                  </p>
                  <p className="text-blue-200 text-lg">
                    ទំព័រនេះនឹងបង្ហាញនិស្សិតដែលបានចុច "ចេញសម្រាក"។
                  </p>
                </div>
              )}
            </div>
          )}
          
          {/* --- PAGE 3: បានចូល (!! ថ្មី !!: បន្ថែម Header) --- */}
          {!loading && currentPage === 'completed' && (
            <div 
              key="completed-page"
              className="pb-10"
            >
              {/* !! ថ្មី !!: Header ថ្មីសម្រាប់ Admin Actions */}
              <CompletedListHeader 
                onAdminClick={() => setShowAdminModal(true)}
                onMultiDeleteClick={handleOpenDeleteSelected}
                onCancelMultiSelect={handleToggleSelectionMode}
                selectionCount={selectedRecords.length}
                isSelectionMode={isSelectionMode}
              />
              
              {allCompletedBreaks.length > 0 ? (
                allCompletedBreaks.map(({ student, record }) => (
                  <CompletedStudentListCard 
                    key={record.id} 
                    student={student}
                    record={record}
                    onClick={() => !isSelectionMode && null} 
                    isSelected={selectedRecords.includes(record.id)}
                    onSelect={() => handleRecordSelect(record.id)}
                    // !! កែសម្រួល !!: ប្រើ Password Modal (ត្រឹមត្រូវ)
                    onDeleteClick={(e) => handleOpenPasswordModal(
                      `លុប Record របស់ (${student.name})?`,
                      () => handleConfirmDelete_Single(record.id)
                    )}
                    isSelectionMode={isSelectionMode}
                  />
                ))
              ) : (
                <div className="mt-16 text-center">
                  <p className="text-white text-2xl font-semibold">
                    មិនមាននិស្សិតសម្រាករួចទេ
                  </p>
                  <p className="text-blue-200 text-lg">
                    ទំព័រនេះនឹងបង្ហាញនិស្សិតដែលបាន "ចូលវិញ"។
                  </p>
                </div>
              )}
            </div>
          )}
          
          {/* --- PAGE 4: កាតចេញចូល --- */}
          {!loading && currentPage === 'passes' && (
            <div 
              key="passes-page"
              className="pb-10"
            >
              <PassesInfoPage 
                studentsOnBreakCount={studentsOnBreak.length} 
                totalPasses={TOTAL_PASSES}
              />
            </div>
          )}
          
          {/* --- FOOTER (រួម) --- */}
          {!loading && (
             <p className="text-center text-xs text-blue-300 opacity-70 mt-8">
               អភិវឌ្ឍន៍កម្មវិធី : IT SUPPORT
             </p>
           )}
        </div>
        
        {/* --- MODAL (POP-UP) --- */}
        {modalStudent && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
            onClick={() => setModalStudent(null)} 
          >
            <div
              className="w-full max-w-lg"
              onClick={(e) => e.stopPropagation()} 
            >
              <StudentCard 
                student={modalStudent} 
                pageKey="modal"
                passesInUse={studentsOnBreak.length} 
                attendance={attendance}
                now={now}
                handleCheckOut={handleCheckOut}
                handleCheckIn={handleCheckIn}
                onDeleteClick={handleOpenDeleteModal_Simple} // !! កែសម្រួល !!
              />
              
              {/* ប៊ូតុងបិទ */}
              <button 
                onClick={() => setModalStudent(null)}
                className="absolute top-4 right-4 text-white bg-white/10 p-2 rounded-full transition-all hover:bg-white/30"
              >
                <IconClose />
              </button>
            </div>
          </div>
        )}
        
        {/* !! ថ្មី !!: Modal បញ្ជាក់ការលុប (សាមញ្ញ) */}
        <DeleteConfirmationModal 
          recordToDelete={recordToDelete}
          onCancel={() => setRecordToDelete(null)}
          onConfirm={() => {
            handleConfirmDelete_Single(recordToDelete.record.id);
            setRecordToDelete(null);
          }}
        />
        
        {/* !! ថ្មី !!: Modal សម្រាប់ Password */}
        <PasswordConfirmationModal 
          prompt={passwordPrompt}
          onCancel={() => setPasswordPrompt({ isOpen: false })}
          onSubmit={handlePasswordSubmit}
        />
        
        {/* !! ថ្មី !!: Modal សម្រាប់ Admin Actions */}
        <AdminActionModal 
          isOpen={showAdminModal}
          onClose={() => setShowAdminModal(false)}
          onSelectClick={handleToggleSelectionMode}
          onBulkClick={(mode) => handleOpenBulkDelete(mode)}
          isBulkLoading={isBulkLoading}
          bulkDeleteDate={bulkDeleteDate}
          setBulkDeleteDate={setBulkDeleteDate}
          bulkDeleteMonth={bulkDeleteMonth}
          setBulkDeleteMonth={setBulkDeleteMonth}
        />
        
      </div>
    </React.Fragment>
  );
}

// 7. Render App ទៅកាន់ 'root'
const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);
root.render(<App />);
