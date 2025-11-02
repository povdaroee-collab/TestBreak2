// =================================================================
// 4. MAIN UI COMPONENTS
// =================================================================

const StudentCard = ({ student, pageKey, passesInUse, attendance, now, handleCheckOut, handleCheckIn, onDeleteClick, totalPasses }) => {
  
  const studentBreaks = attendance[student.id] || [];
  const activeBreak = studentBreaks.find(r => r.checkOutTime && !r.checkInTime);
  const completedBreaks = studentBreaks.filter(r => r.checkOutTime && r.checkInTime);
      
  let statusText = 'មិនទាន់សម្រាក';
  let statusClass = 'bg-gray-500 text-white'; 
  let canCheckIn = false; 
  let canCheckOut = true;
  let isSpecialCase = false; 
  
  // !! កែសម្រួល !!: ប្រើ totalPasses ពី State
  let passesAvailable = totalPasses - passesInUse;
  
  if (activeBreak) {
    const elapsedMins = calculateDuration(activeBreak.checkOutTime, now.toISOString());
    const isOvertime = elapsedMins > OVERTIME_LIMIT_MINUTES;
    
    // !! កែសម្រួល !!: បង្ហាញលេខកាត
    const passNumberDisplay = activeBreak.passNumber ? ` (${activeBreak.passNumber})` : '';
    statusText = `កំពុងសម្រាក${passNumberDisplay} (${elapsedMins} នាទី)`; 
    
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
  
  // !! កែសម្រួល !!: ប្រើ totalPasses ពី State
  if (passesAvailable <= 0 && canCheckOut) {
    canCheckOut = false; 
    statusText = `កាតអស់! (${passesInUse}/${totalPasses})`;
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
        
        {/* !! កែសម្រួល !!: បង្ហាញលេខកាត */}
        {record.passNumber && (
          <p className="text-sm font-semibold text-cyan-300">
            (កាត: {record.passNumber})
          </p>
        )}
        
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
        {/* !! កែសម្រួល !!: បង្ហាញលេខកាត */}
        <p className="text-sm text-blue-200">
          (កាត: {record.passNumber || '???'})
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

// !! កែសម្រួល !!: Page នេះត្រូវកែប្រែទាំងស្រុង
const PassesInfoPage = ({ passesInUse, totalPasses, onEditTotal }) => {
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
        
        {/* !! ថ្មី !!: ប៊ូតុងកែសម្រួល */}
        <div className="mt-8 border-t border-white/20 pt-6">
          <button
            onClick={onEditTotal}
            className="flex items-center justify-center w-full px-4 py-3 rounded-full text-lg text-white font-bold transition-all shadow-lg bg-blue-500 hover:bg-blue-600"
          >
            <IconPencil />
            កែសម្រួលចំនួនកាតសរុប
          </button>
        </div>
      </div>
    );
};

// ... (PasswordConfirmationModal, AdminActionModal, CompletedListHeader, LoadingSpinner, DeleteConfirmationModal)...
// (សូមដាក់ Components ទាំងអស់របស់អ្នកនៅទីនេះ)
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


// !! ថ្មី !!: Component សម្រាប់ QR Scanner Modal
const QrScannerModal = ({ isOpen, onClose, onScanSuccess }) => {
  const [errorMessage, setErrorMessage] = useState(null);
  
  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      // ត្រូវប្រាកដថា ID នេះមានក្នុង HTML
      const scannerId = "qr-reader"; 
      
      const html5QrCode = new Html5Qrcode(scannerId);
      const qrCodeSuccessCallback = (decodedText, decodedResult) => {
        // decodedText គឺជាអ្វីដែល QR Code មាន (ឧ. 'DD_01')
        html5QrCode.stop().then(() => {
          onScanSuccess(decodedText);
        }).catch(err => console.error("Error stopping scanner", err));
      };
      
      const config = { fps: 10, qrbox: { width: 250, height: 250 } };

      // ចាប់ផ្តើមស្កេន
      html5QrCode.start({ facingMode: "environment" }, config, qrCodeSuccessCallback)
        .catch(err => {
          console.error("Unable to start scanner", err);
          setErrorMessage("មិនអាចបើកកាមេរ៉ាបាន។ សូមអនុញ្ញាត (Allow) កាមេរ៉ា។");
        });
      
      // Cleanup function
      return () => {
        // ត្រូវប្រាកដថា .stop() ត្រូវបានហៅ
        html5QrCode.stop()
          .then(res => {
            console.log("QR Scanner stopped.");
          })
          .catch(err => {
            console.warn("QR Scanner stop error, probably already stopped.", err);
          });
      };
    }
  }, [isOpen, onScanSuccess]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-800 bg-gray-200 p-2 rounded-full z-10"
        >
          <IconClose />
        </button>
        
        <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
          ស្កេនកាតចូលវិញ
        </h3>
        
        {/* ទីតាំងសម្រាប់បង្ហាញកាមេរ៉ា */}
        <div id="qr-reader" className="w-full"></div>
        
        {errorMessage && (
          <p className="text-red-500 text-center mt-4">{errorMessage}</p>
        )}
      </div>
    </div>
  );
};
