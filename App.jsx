// =================================================================
// 5. APP LOGIC & RENDER
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
  const [selectedRecords, setSelectedRecords] = useState([]);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [bulkDeleteMode, setBulkDeleteMode] = useState(null);
  const [bulkDeleteDate, setBulkDeleteDate] = useState(getTodayLocalDateString());
  const [bulkDeleteMonth, setBulkDeleteMonth] = useState(getTodayLocalMonthString());
  const [isBulkLoading, setIsBulkLoading] = useState(false);
  
  const [recordToDelete, setRecordToDelete] = useState(null);

  // States សម្រាប់ចំនួនកាត
  const [totalPasses, setTotalPasses] = useState(0); 

  // States សម្រាប់ QR Scanner ឆ្លាតវៃ
  const [showQrScanner, setShowQrScanner] = useState(false);
  const [isScannerBusy, setIsScannerBusy] = useState(false); 
  const [lastScannedInfo, setLastScannedInfo] = useState(null); 
  const [scannerTriggeredCheckIn, setScannerTriggeredCheckIn] = useState(null); 

  // States សម្រាប់ Modals ស្អាតៗ
  const [infoAlert, setInfoAlert] = useState({ isOpen: false, message: '', type: 'info' });
  const [inputPrompt, setInputPrompt] = useState({ isOpen: false });

  // --- States សម្រាប់ Settings Page ---
  const [language, setLanguage] = useState(localStorage.getItem('break_lang') || 'km');
  const [background, setBackground] = useState(localStorage.getItem('break_bg') || 'style1');
  const [adminPassword, setAdminPassword] = useState('4545ak0'); // Default (នឹងត្រូវបានទាញពី Firebase)
  const [checkInMode, setCheckInMode] = useState('scan'); // Default (នឹងត្រូវបានទាញពី Firebase)
  
  // Object បកប្រែភាសា
  const t = translations[language] || translations['km'];

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

  // --- Effects ---
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000); 
    return () => clearInterval(timer);
  }, []); 

  // Effect សម្រាប់រក្សាទុក Settings (Local)
  useEffect(() => {
    localStorage.setItem('break_lang', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('break_bg', background);
  }, [background]);


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
          setAuthError(`Read Auth Error: ${error.message}`);
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
              setAuthError(`Write Auth Error: ${authError.message}`);
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
      
      // 1. ទាញបញ្ជីឈ្មោះ (ពី dbRead)
      const studentsRef = ref(dbRead, 'students');
      const unsubscribeStudents = onValue(studentsRef, (snapshot) => {
          const studentsData = snapshot.val();
          const studentList = [];
          if (studentsData) {
            Object.keys(studentsData).forEach((key) => {
              const student = studentsData[key];
              studentList.push({
                id: key, ...student,
                name: student.name || student.ឈ្មោះ,
                idNumber: student.idNumber || student.អត្តលេខ,
                photoUrl: student.photoUrl || student.រូបថត,
                class: student.class || student.ថា្នក់,
              });
            });
          }
          studentList.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
          setStudents(studentList);
          console.log("Student list fetched.");
          setLoading(false); 
      }, (error) => {
          console.error('Student Fetch Error (dbRead):', error);
          setAuthError(`Student Fetch Error: ${error.message}`);
          setLoading(false);
      });

      // 2. ទាញទិន្នន័យវត្តមាន (ពី dbWrite)
      const attendanceRef = ref(dbWrite, 'attendance');
      const qAttendance = rtdbQuery(attendanceRef, orderByChild('date'), equalTo(todayString));
      const unsubscribeAttendance = onValue(qAttendance, (snapshot) => {
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
          console.log("Attendance data fetched/updated.");
      }, (error) => {
          console.error('Attendance Fetch Error (dbWrite):', error);
          setAuthError(`Attendance Fetch Error: ${error.message}`);
      });
      
      // 3. ទាញចំនួនកាតសរុប (ពី dbWrite)
      const passRef = ref(dbWrite, 'passManagement/totalPasses');
      const unsubscribePasses = onValue(passRef, (snapshot) => {
        const total = snapshot.val() || 0; 
        setTotalPasses(total);
        console.log(`Total passes set to: ${total}`);
      }, (error) => {
        console.error('Total Passes Fetch Error (dbWrite):', error);
      });
      
      // 4. ទាញ Password (ពី dbWrite)
      const passwordRef = ref(dbWrite, 'passManagement/adminPassword');
      const unsubscribePassword = onValue(passwordRef, (snapshot) => {
        const pass = snapshot.val();
        if (pass) {
          setAdminPassword(pass);
          console.log("Admin password fetched.");
        }
      }, (error) => {
        console.error('Admin Password Fetch Error (dbWrite):', error);
      });
      
      // 5. ទាញ របៀប Check-in (ពី dbWrite)
      const checkInModeRef = ref(dbWrite, 'passManagement/checkInMode');
      const unsubscribeCheckInMode = onValue(checkInModeRef, (snapshot) => {
        const mode = snapshot.val();
        if (mode) {
          setCheckInMode(mode);
          console.log(`Check-in mode set to: ${mode}`);
        }
      }, (error) => {
        console.error('Check-in Mode Fetch Error (dbWrite):', error);
      });
      
      return () => {
        unsubscribeStudents();
        unsubscribeAttendance();
        unsubscribePasses(); 
        unsubscribePassword();
        unsubscribeCheckInMode();
      };
    }
  }, [dbRead, dbWrite, todayString]); 

  // --- Data Preparation for Render ---
  const sortedStudentsOnBreak = students
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
  const studentsOnBreakCount = sortedStudentsOnBreak.length;
  
  
  // Effect សម្រាប់គ្រប់គ្រង Scanner បន្ទាប់ពី Firebase Update
  useEffect(() => {
    if (scannerTriggeredCheckIn) {
      
      const newStudentsOnBreak = students
        .map(student => {
          const breaks = attendance[student.id] || [];
          return breaks.find(r => r.checkOutTime && !r.checkInTime);
        })
        .filter(Boolean);
      
      const newCount = newStudentsOnBreak.length;
      console.log(`Scanner triggered check-in. New break count: ${newCount}`);
      
      if (newCount === 0) {
        console.log("Last student checked in. Closing scanner.");
        setShowQrScanner(false);
        setCurrentPage('completed'); 
        setIsScannerBusy(false); 
        setScannerTriggeredCheckIn(null); 
        
      } else {
        console.log("Students still on break. Restarting scanner...");
        setIsScannerBusy(false); 
        setScannerTriggeredCheckIn(null); 
      }
    }
  }, [attendance]); 


  // --- Helper function សម្រាប់ហៅ Alert ---
  const showAlert = (message, type = 'info') => {
    setInfoAlert({ isOpen: true, message, type });
  };
  
  // --- មុខងារសម្រាប់កត់ត្រា (ប្រើ dbWrite) ---
  
  const handleCheckOut = async (studentId) => {
    const student = students.find(s => s.id === studentId);
    if (!student || !dbWrite) return;
        
    if (studentsOnBreakCount >= totalPasses) {
      setAuthError(`${t.statusPassOut} (${studentsOnBreakCount}/${totalPasses})`);
      speak(t.statusPassOut);
      return; 
    }
    
    const usedPassNumbers = sortedStudentsOnBreak.map(b => b.record.passNumber).filter(Boolean);
    let nextPassNumber = null;
    for (let i = 1; i <= totalPasses; i++) {
      const passNum = 'DD_' + String(i).padStart(2, '0'); // ប្រើ 2 ខ្ទង់ (DD_01)
      if (!usedPassNumbers.includes(passNum)) {
        nextPassNumber = passNum;
        break;
      }
    }
    
    if (!nextPassNumber) {
      console.error("Logic Error: No available pass found.");
      setAuthError("!!! ERROR: មានបញ្ហាក្នុងការរកលេខកាតទំនេរ។");
      return;
    }

    const now = new Date();
    const studentBreaks = attendance[studentId] || [];
    const completedBreaks = studentBreaks.filter(r => r.checkInTime && r.checkOutTime);
    const breakCount = completedBreaks.length;
    let breakType = (breakCount >= 2) ? "special" : "normal";
    
    speak(`${student.name || t.noName} ${t.statusOnBreak} ${t.statusPass} ${nextPassNumber}`);
    
    const attendanceRef = ref(dbWrite, 'attendance');
    const newRecordRef = push(attendanceRef);
    try {
      await set(newRecordRef, {
        studentId: studentId, 
        date: todayString,
        checkInTime: null,
        checkOutTime: now.toISOString(), 
        breakType: breakType,
        passNumber: nextPassNumber 
      });
      
      setSearchTerm('');
      setSelectedStudentId('');
      setSearchResults([]); 
      setIsSearchFocused(false); 
    } catch (error) {
      console.error('Check-out Error (dbWrite):', error);
      setAuthError(`Check-out Error: ${error.message}`);
    }
  };
  
  const handleCheckIn = async (studentId) => {
    const student = students.find(s => s.id === studentId);
    if (!student || !dbWrite) {
      console.error("Check-in Error: Student or DB not found.");
      return;
    }
    
    const studentBreaks = attendance[studentId] || [];
    const activeBreak = studentBreaks.find(r => r.checkOutTime && !r.checkInTime);
    
    if (!activeBreak) {
       console.error("Check-in Error: No active break found.");
       return;
    }
    
    speak(`${student.name || t.noName} ${t.checkIn}`);
        
    const now = new Date();
    const docId = activeBreak.id; 
    const docRef = ref(dbWrite, `attendance/${docId}`);
    try {
      await update(docRef, { 
        checkInTime: now.toISOString(),
      });
      console.log(`Check-in update sent for ${student.name}`);
      
      setSearchTerm(''); 
      setSelectedStudentId(''); 
      setSearchResults([]); 
      setIsSearchFocused(false); 
      
    } catch (error) {
      console.error('Check-in Error (dbWrite):', error);
      setAuthError(`Check-in Error: ${error.message}`);
      setIsScannerBusy(false); 
      setScannerTriggeredCheckIn(null);
    }
  };
  
  // --- មុខងារលុប និង Password ---
  
  const handleOpenPasswordModal = (message, onConfirmCallback) => {
    setPasswordPrompt({
      isOpen: true,
      message: message,
      onConfirm: onConfirmCallback,
      error: null
    });
  };
  
  const handleOpenDeleteModal_Simple = (e, student, record) => {
    e.stopPropagation();
    setRecordToDelete({ student, record });
  };
  
  const handlePasswordSubmit = (password) => {
    if (password === adminPassword) {
      passwordPrompt.onConfirm();
      setPasswordPrompt({ isOpen: false });
    } else {
      setPasswordPrompt(prev => ({ ...prev, error: t.passwordError }));
    }
  };
  
  const handleConfirmDelete_Single = async (recordId) => {
    if (!dbWrite) return;
    const docRef = ref(dbWrite, `attendance/${recordId}`);
    try {
      await remove(docRef);
      console.log("Delete successful!");
    } catch (error) {
      console.error('Delete Error (dbWrite):', error);
      setAuthError(`Delete Error: ${error.message}`);
    }
  };
  
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
      t.deleteSelectedTitle(selectedRecords.length),
      () => handleConfirmDelete_Multi()
    );
  };

  const handleConfirmDelete_Multi = async () => {
    if (!dbWrite || selectedRecords.length === 0) return;
    const updates = {};
    selectedRecords.forEach(recordId => {
      updates[`/attendance/${recordId}`] = null;
    });
    try {
      await update(ref(dbWrite), updates);
      console.log("Multi-delete successful!");
      handleToggleSelectionMode();
    } catch (error) {
      console.error('Multi-Delete Error (dbWrite):', error);
      setAuthError(`Multi-Delete Error: ${error.message}`);
    }
  };
  
  const handleOpenBulkDelete = (mode) => {
    setBulkDeleteMode(mode);
    setShowAdminModal(false);
    setTimeout(() => {
      handleOpenPasswordModal(
        mode === 'day' 
          ? t.deleteByDateTitle(bulkDeleteDate)
          : t.deleteByMonthTitle(bulkDeleteMonth),
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
        showAlert(t.deleteNotFound, 'error');
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
          const recordDate = record.date;
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
        showAlert(t.deleteSuccess(count), 'success'); 
      } else {
        showAlert(t.deleteNotFound, 'error');
      }
    } catch (error) {
      console.error('Bulk Delete Error:', error);
      setAuthError(`Bulk Delete Error: ${error.message}`);
    } finally {
      setIsBulkLoading(false);
      setBulkDeleteMode(null);
    }
  };
  
  // --- មុខងារ Settings ថ្មី ---
  
  const handleEditTotalPasses = () => {
    handleOpenPasswordModal(
      t.passwordRequired,
      () => {
        setInputPrompt({
          isOpen: true,
          title: t.editPassTotal,
          message: t.editPassTotalPrompt,
          defaultValue: totalPasses,
          type: 'number',
          onSubmit: (newTotalString) => {
            const newTotal = parseInt(newTotalString);
            if (newTotalString && !isNaN(newTotal) && newTotal >= 0) {
              const passRef = ref(dbWrite, 'passManagement/totalPasses');
              set(passRef, newTotal)
                .then(() => {
                  showAlert(t.passTotalSuccess, 'success');
                })
                .catch(err => {
                  setAuthError(`Error setting total passes: ${err.message}`);
                });
            } else if (newTotalString) {
              showAlert(t.invalidNumber, 'error');
            }
            setInputPrompt({ isOpen: false }); 
          },
          onCancel: () => setInputPrompt({ isOpen: false })
        });
      }
    );
  };
  
  const handleEditPassword = () => {
    handleOpenPasswordModal(
      t.passwordRequired, // បញ្ចូល Password ចាស់
      () => {
        // បើ Password ចាស់ត្រូវ -> បើក Prompt សួរ Password ថ្មី
        setInputPrompt({
          isOpen: true,
          title: t.changePassword,
          message: t.changePasswordPrompt,
          defaultValue: '',
          type: 'text',
          onSubmit: (newPassword) => {
            if (newPassword && newPassword.length >= 6) {
              const passRef = ref(dbWrite, 'passManagement/adminPassword');
              set(passRef, newPassword)
                .then(() => {
                  showAlert(t.changePasswordSuccess, 'success');
                })
                .catch(err => {
                  setAuthError(`Error setting password: ${err.message}`);
                });
            } else if (newPassword) {
              showAlert("Password ត្រូវមានយ៉ាងតិច 6 តួអក្សរ", 'error');
            }
            setInputPrompt({ isOpen: false }); 
          },
          onCancel: () => setInputPrompt({ isOpen: false })
        });
      }
    );
  };

  const handleEditCheckInMode = () => {
    handleOpenPasswordModal(
      t.checkInMethodPrompt,
      () => {
        // បើ Password ត្រូវ -> ប្តូរ Mode
        const newMode = checkInMode === 'scan' ? 'auto' : 'scan';
        const modeRef = ref(dbWrite, 'passManagement/checkInMode');
        set(modeRef, newMode)
          .then(() => {
            showAlert(t.checkInModeSuccess, 'success');
          })
          .catch(err => {
            setAuthError(`Error setting check-in mode: ${err.message}`);
          });
      }
    );
  };
  
  // មុខងារ Check-in តាម QR (Logic ថ្មី)
  const handleCheckInByPassNumber = (passNumber) => {
    if (!passNumber || isScannerBusy) { 
      return;
    }
    
    const activeBreak = sortedStudentsOnBreak.find(b => b.record.passNumber === passNumber);
    
    if (activeBreak) {
      setIsScannerBusy(true); 
      setScannerTriggeredCheckIn(activeBreak.student.id); 
      setLastScannedInfo({ status: 'success', name: activeBreak.student.name || t.noName });
      
      handleCheckIn(activeBreak.student.id);
      
    } else {
      setLastScannedInfo({ status: 'fail', message: t.scanPassNotFound(passNumber) });
    }
  };
  
  // មុខងារសម្រាប់បើក QR Scanner
  const handleOpenQrScanner = () => {
    setLastScannedInfo(null);
    setScannerTriggeredCheckIn(null);
    setIsScannerBusy(false); 
    setShowQrScanner(true);
  };

  
  // --- Search Handlers ---
  
  // !! កែសម្រួល !!: បន្ថែម Status ទៅក្នុងលទ្ធផលស្វែងរក
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setSelectedStudentId(""); 
    
    const normalizedSearch = String(value).replace(/\s+/g, '').toLowerCase();

    if (normalizedSearch === "") {
      setSearchResults([]); 
    } else {
      // 1. ស្វែងរក
      const matches = students.filter(student => 
        (student.name && student.name.replace(/\s+/g, '').toLowerCase().includes(normalizedSearch)) ||
        (student.idNumber && String(student.idNumber).replace(/\s+/g, '').includes(normalizedSearch))
      ).slice(0, 10); 
      
      // 2. បន្ថែម Status ពី attendance (Realtime)
      const matchesWithStatus = matches.map(student => {
        const studentBreaks = attendance[student.id] || [];
        const activeBreak = studentBreaks.find(r => r.checkOutTime && !r.checkInTime);
        const completedBreaks = studentBreaks.filter(r => r.checkOutTime && r.checkInTime);

        let statusText = t.statusNotYet;
        let passNumber = null;
        let statusColor = 'text-gray-500';

        if (activeBreak) {
          statusText = t.statusOnBreak;
          passNumber = activeBreak.passNumber || null;
          statusColor = 'text-yellow-600'; // ពណ៌កំពុងសម្រាក
        } else if (completedBreaks.length > 0) {
          statusText = t.statusCompleted;
          statusColor = 'text-green-600'; // ពណ៌សម្រាករួច
        }
        
        return { ...student, statusText, passNumber, statusColor };
      });
      
      setSearchResults(matchesWithStatus); // 3. រក្សាទុកលទ្ធផលថ្មី
    }
  };
  
  const handleSelectStudentFromList = (student) => {
    setSearchTerm(student.name || String(student.idNumber)); 
    setSelectedStudentId(student.id); 
    setSearchResults([]); 
    setIsSearchFocused(false); 
  };


  // --- Main Render ---
  return (
    <React.Fragment>
      <div className={`min-h-screen ${backgroundStyles[background] || backgroundStyles['style1']} font-kantumruy p-4 transition-all duration-500`}>
        <div className="container mx-auto max-w-lg relative">
          
          <div 
            className={`transition-all duration-300 ease-in-out ${isSearchFocused ? '-translate-y-24' : 'translate-y-0'}`}
          >
            <h1 className="text-4xl font-bold text-center mb-2 text-white">
              {t.appTitle}
            </h1>
            <p className="text-xl text-center text-blue-200 mb-6">
              {displayDate}
            </p>
          </div>

          {/* --- TABS --- */}
          <div className={`w-full max-w-md mx-auto bg-white/10 backdrop-blur-sm rounded-full p-1 flex space-x-1 mb-6 transition-all duration-300 ease-in-out ${isSearchFocused ? '-translate-y-24' : 'translate-y-0'}`}>
            
            <button
              onClick={() => setCurrentPage('search')}
              className={`w-1/5 px-2 py-3 rounded-full flex items-center justify-center transition-colors relative ${
                currentPage === 'search' ? 'bg-white text-blue-800 shadow-lg' : 'text-white'
              }`}
            >
              <span className="relative z-10 flex items-center"><IconSearch /></span>
            </button>
            
            <button
              onClick={() => setCurrentPage('onBreak')}
              className={`w-1/5 px-2 py-3 rounded-full flex items-center justify-center transition-colors relative ${
                currentPage === 'onBreak' ? 'bg-white text-blue-800 shadow-lg' : 'text-white'
              }`}
            >
              <span className="relative z-10 flex items-center">
                <IconClock />
                {studentsOnBreakCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {studentsOnBreakCount}
                  </span>
                )}
              </span>
            </button>
            
            <button
              onClick={() => setCurrentPage('completed')}
              className={`w-1/5 px-2 py-3 rounded-full flex items-center justify-center transition-colors relative ${
                currentPage === 'completed' ? 'bg-white text-blue-800 shadow-lg' : 'text-white'
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
            
            <button
              onClick={handleOpenQrScanner}
              className={`w-1/5 px-2 py-3 rounded-full flex items-center justify-center transition-colors relative text-white`}
            >
              <span className="relative z-10 flex items-center">
                <IconQrCode />
              </span>
            </button>
            
            <button
              onClick={() => setCurrentPage('settings')}
              className={`w-1/5 px-2 py-3 rounded-full flex items-center justify-center transition-colors relative ${
                currentPage === 'settings' ? 'bg-white text-blue-800 shadow-lg' : 'text-white'
              }`}
            >
              <span className="relative z-10 flex items-center">
                <IconSettings />
              </span>
            </button>
            
          </div>

          {/* --- CONTENT --- */}
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
            <div key="search-page" className="relative">
              <div className={`w-full max-w-md mx-auto transition-all duration-300 ease-in-out ${isSearchFocused ? '-translate-y-24' : 'mb-8'}`}>
                {students.length > 0 ? (
                  <div className="relative">
                    <input
                      type="text"
                      id="student-search"
                      value={searchTerm}
                      onChange={handleSearchChange}
                      onFocus={() => { setIsSearchFocused(true); setAuthError(null); }}
                      onBlur={() => { setTimeout(() => { if (!document.activeElement.classList.contains('search-result-button')) { setIsSearchFocused(false); setSearchResults([]); } }, 200); }}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.target.blur(); setIsSearchFocused(false); } }}
                      placeholder={t.searchPlaceholder} 
                      className="block w-full px-6 py-4 bg-white/20 border border-white/30 rounded-full text-white text-lg placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white shadow-inner"
                    />
                    
                    {/* !! កែសម្រួល !!: បង្ហាញ Status ក្នុងលទ្ធផលស្វែងរក */}
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
                            <div className="flex-1">
                              <p className="font-bold">{student.name}</p>
                              <p className="text-sm text-gray-600">{student.idNumber}</p>
                            </div>
                            <div className="text-right">
                              <p className={`text-sm font-semibold ${student.statusColor}`}>
                                {student.statusText}
                              </p>
                              {student.passNumber && (
                                <p className="text-xs text-blue-600 font-bold">
                                  {t.statusPass}: {student.passNumber}
                                </p>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : ( !authError && <p className="text-gray-300 text-lg text-center">{t.studentNotFound}</p> )}
              </div>
              
              {selectedStudent && (
                <StudentCard 
                  student={selectedStudent} 
                  pageKey="search"
                  passesInUse={studentsOnBreakCount}
                  attendance={attendance}
                  now={now}
                  handleCheckOut={handleCheckOut}
                  handleCheckIn={handleCheckIn} 
                  handleOpenQrScanner={handleOpenQrScanner}
                  onDeleteClick={handleOpenDeleteModal_Simple}
                  totalPasses={totalPasses}
                  t={t}
                  checkInMode={checkInMode}
                />
              )}
              {!selectedStudent && searchTerm !== "" && searchResults.length === 0 && isSearchFocused && (
                <p className="text-center text-white/70 text-lg mt-10">{t.studentNotFound}</p>
              )}
            </div>
          )}

          {/* --- PAGE 2: កំពុងសម្រាក --- */}
          {!loading && currentPage === 'onBreak' && (
            <div key="on-break-page" className="pb-10">
              {sortedStudentsOnBreak.length > 0 ? (
                sortedStudentsOnBreak.map(({ student, record, elapsedMins, isOvertime }) => (
                  <OnBreakStudentListCard 
                    key={record.id} 
                    student={student} 
                    record={record}
                    elapsedMins={elapsedMins} 
                    isOvertime={isOvertime}
                    onCheckIn={() => handleCheckIn(student.id)} 
                    handleOpenQrScanner={handleOpenQrScanner}
                    onDeleteClick={(e) => handleOpenDeleteModal_Simple(e, student, record)}
                    t={t}
                    checkInMode={checkInMode}
                  />
                ))
              ) : (
                <div className="mt-16 text-center">
                  <p className="text-white text-2xl font-semibold">{t.noStudentsOnBreak}</p>
                </div>
              )}
            </div>
          )}
          
          {/* --- PAGE 3: បានចូល --- */}
          {!loading && currentPage === 'completed' && (
            <div key="completed-page" className="pb-10">
              <CompletedListHeader 
                onAdminClick={() => setShowAdminModal(true)}
                onMultiDeleteClick={handleOpenDeleteSelected}
                onCancelMultiSelect={handleToggleSelectionMode}
                selectionCount={selectedRecords.length}
                isSelectionMode={isSelectionMode}
                t={t}
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
                    onDeleteClick={(e) => handleOpenPasswordModal(t.deleteConfirmMessage(student.name), () => handleConfirmDelete_Single(record.id))}
                    isSelectionMode={isSelectionMode}
                    t={t}
                  />
                ))
              ) : (
                <div className="mt-16 text-center">
                  <p className="text-white text-2xl font-semibold">{t.noStudentsCompleted}</p>
                </div>
              )}
            </div>
          )}
          
          {/* --- PAGE 5: Settings --- */}
          {!loading && currentPage === 'settings' && (
            <SettingsPage
              t={t}
              language={language}
              setLanguage={setLanguage}
              background={background}
              setBackground={setBackground}
              checkInMode={checkInMode}
              onEditCheckInMode={handleEditCheckInMode}
              onEditPassword={handleEditPassword}
              passesInUse={studentsOnBreakCount}
              totalPasses={totalPasses}
              onEditTotalPasses={handleEditTotalPasses}
            />
          )}
          
          {!loading && (
             <p className="text-center text-xs text-blue-300 opacity-70 mt-8">{t.footer}</p>
           )}
        </div>
        
        {/* --- MODALS --- */}
        {modalStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md" onClick={() => setModalStudent(null)}>
            <div className="w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
              <StudentCard 
                student={modalStudent} 
                pageKey="modal"
                passesInUse={studentsOnBreakCount} 
                attendance={attendance}
                now={now}
                handleCheckOut={handleCheckOut}
                handleCheckIn={handleCheckIn}
                handleOpenQrScanner={handleOpenQrScanner}
                onDeleteClick={handleOpenDeleteModal_Simple}
                totalPasses={totalPasses}
                t={t}
                checkInMode={checkInMode}
              />
              <button onClick={() => setModalStudent(null)} className="absolute top-4 right-4 text-white bg-white/10 p-2 rounded-full transition-all hover:bg-white/30">
                <IconClose />
              </button>
            </div>
          </div>
        )}
        
        <DeleteConfirmationModal 
          recordToDelete={recordToDelete}
          onCancel={() => setRecordToDelete(null)}
          onConfirm={() => {
            handleConfirmDelete_Single(recordToDelete.record.id);
            setRecordToDelete(null);
          }}
          t={t}
        />
        
        <PasswordConfirmationModal 
          prompt={passwordPrompt}
          onCancel={() => setPasswordPrompt({ isOpen: false })}
          onSubmit={handlePasswordSubmit}
          t={t}
        />
        
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
          t={t}
        />
        
        <QrScannerModal 
          isOpen={showQrScanner}
          onClose={() => setShowQrScanner(false)}
          onScanSuccess={handleCheckInByPassNumber}
          lastScannedInfo={lastScannedInfo}
          isScannerBusy={isScannerBusy}
          t={t}
        />
        
        <InfoAlertModal
          alertInfo={infoAlert}
          onClose={() => setInfoAlert({ isOpen: false })}
          t={t}
        />
        
        <InputPromptModal
          promptInfo={inputPrompt}
          onCancel={inputPrompt.onCancel} 
          onSubmit={inputPrompt.onSubmit}
          t={t}
        />
        
      </div>
    </React.Fragment>
  );
}

// =================================================================
// 6. START APP
// =================================================================
const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);
root.render(<App />);

