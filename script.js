const DEFAULT_LOGO = "lo.jpeg";

const USERS_DB = {
    "mking": "hamoking",
    "kar9em": "Kiko9_67"
};

const TARGET_ADMIN_EMAILS = ["kimo.ahmed.102015@gmail.com", "medokoket1@gmail.com"];

const EMAILJS_PUBLIC_KEY = "x4dopn6z9s8bgUW_J";
const EMAILJS_SERVICE_ID = "service_pjpg71k";
const EMAILJS_TEMPLATE_ID = "template_2ihmoqu";

let emailJsReady = false;

(function loadEmailJsSdk() {
    if (window.emailjs) {
        window.emailjs.init(EMAILJS_PUBLIC_KEY);
        emailJsReady = true;
        return;
    }
    const sdk = document.createElement('script');
    sdk.src = "https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js";
    sdk.onload = function() {
        if (window.emailjs) {
            window.emailjs.init(EMAILJS_PUBLIC_KEY);
            emailJsReady = true;
        }
    };
    document.head.appendChild(sdk);
})();

let currentUser = sessionStorage.getItem('schoolUcl32_activeUser') || null;
let guestUnlocked = sessionStorage.getItem('schoolUcl32_guestUnlocked') === 'true';
let generatedAccessCode = sessionStorage.getItem('schoolUcl32_accessCode') || null;

let teams = JSON.parse(localStorage.getItem('schoolUcl32_teams_v1')) || [];
let matches = JSON.parse(localStorage.getItem('schoolUcl32_matches_v1')) || [];
let schedules = JSON.parse(localStorage.getItem('schoolUcl32_schedules_v1')) || [];
let chatMessages = JSON.parse(localStorage.getItem('schoolUcl32_chat_v1')) || [];
let currentLang = localStorage.getItem('schoolUcl32_lang') || 'ar';

let uploadedLogoBase64 = "";
let activeTeamId = null;
let isChatOpen = false;

const UCL_BRACKET_STAGES = [
    { key: "دور الـ 32", targetMatches: 16 },
    { key: "دور الـ 16", targetMatches: 8 },
    { key: "ربع النهائي", targetMatches: 4 },
    { key: "نصف النهائي", targetMatches: 2 },
    { key: "النهائي", targetMatches: 1 }
];

const NEXT_STAGE_MAP = {
    "دور الـ 32": "دور الـ 16",
    "دور الـ 16": "ربع النهائي",
    "ربع النهائي": "نصف النهائي",
    "نصف النهائي": "النهائي",
    "النهائي": "بطل الأبطال"
};

const translations = {
    ar: {
        pageTitle: "دوري أبطال المدرسة - UEFA Champions League",
        langBtn: "English",
        loginTitle: "تسجيل الدخول للنظام",
        loginSubtitle: "أدخل اسم المستخدم وكلمة المرور للمتابعة",
        usernameLabel: "اسم المستخدم (Username)",
        passwordLabel: "كلمة المرور (Password)",
        loginBtn: "دخول",
        loginInvalid: "اسم المستخدم أو كلمة المرور غير صحيحة!",
        accessModalTitle: "طلب صلاحية التعديل (acsses)",
        accessModalDesc: "تم إرسال رسالة برمز التحقق إلى الإيميلات المخصصة. أدخل الرمز لفتح التعديل على كل شيء:",
        sendCodeEmailBtn: "إعادة إرسال الرمز للإيميل",
        accessCodePlaceholder: "أدخل الرمز المكون من 6 أرقام",
        verifyCodeBtn: "تفعيل التعديل",
        accessCodeInvalid: "الرمز غير صحيح! تأكد من الرمز المرسل للإيميل.",
        accessGrantedTitle: "تم تفعيل صلاحية التعديل الكاملة!",
        noEditPermission: "ليس لديك صلاحية التعديل في وضع الضيف (guest). اضغط على زر acsses لطلب رمز التفعيل.",
        welcomeUserText: (name) => `أهلاً بك ${name}!`,
        welcomeSubtext: "تم تسجيل الدخول بنجاح إلى دوري أبطال المدرسة",
        startNowBtn: "ابدأ الآن",
        logoutBtn: "خروج",
        chatTitle: "💬 شات المشرفين",
        chatPlaceholder: "اكتب رسالتك هنا...",
        chatSendBtn: "إرسال",
        chatClearBtn: "مسح",
        chatEmpty: "لا توجد رسائل بعد. ابدأ المحادثة!",
        appTitle: "دوري أبطال المدرسة ⭐",
        appSubtitle: "نظام التشامبيونز ليج الرسمي (من دور الـ 32 وحتى النهائي)",
        stageLabel: "المرحلة:",
        allStages: "جميع المراحل",
        primary: "ابتدائي",
        preparatory: "إعدادي",
        secondary: "ثانوي",
        categoryLabel: "القسم:",
        allCategories: "جميع الأقسام",
        languages: "لغات",
        arabic: "عربي",
        roundFilterLabel: "الدور:",
        allRounds: "جميع الأدوار",
        leaguePhase: "مرحلة الدوري",
        round32: "دور الـ 32 (Round of 32)",
        round16: "دور الـ 16 (Round of 16)",
        quarterFinal: "ربع النهائي (Quarter-Finals)",
        semiFinal: "نصف النهائي (Semi-Finals)",
        finalRound: "النهائي (Final) 🏆",
        friendlyMatches: "مباريات ودية",
        friendlyMatch: "مباراة ودية",
        addTeamTitle: "إضافة فريق / فصل مشارك في دوري الأبطال (32 فريقاً)",
        teamNameLabel: "اسم الفريق / الفصل",
        teamNamePlaceholder: "مثال: 5/A أو ريال مدريد...",
        teamStageLabel: "المرحلة الدراسية",
        teamCategoryLabel: "القسم",
        teamStatusLabel: "حالة الفريق في البطولة",
        inRound32: "في دور الـ 32",
        inRound16: "متأهل لدور الـ 16",
        inQuarter: "متأهل لربع النهائي",
        inSemi: "متأهل لنصف النهائي",
        inFinal: "طرف النهائي",
        championStatus: "بطل دوري الأبطال 🏆",
        eliminatedStatus: "خرج من البطولة",
        teamLogoLabel: "شعار الفريق (اللوجو)",
        registerTeamBtn: "تسجيل الفريق",
        teamsSectionTitle: "الفرق المشاركة في دوري الأبطال (اضغط على الفريق لعرض أو إدارة اللاعبين والأهداف والأسيستات)",
        bracketTitle: "شجرة دوري الأبطال الرسمية (UEFA Champions League Bracket: R32 → Final)",
        waitingMatchSlot: "في انتظار تحديد المباراة",
        scheduleSectionTitle: "جدول مباريات دوري الأبطال والمواعيد",
        firstTeamLabel: "الفريق الأول (Home)",
        secondTeamLabel: "الفريق الثاني (Away)",
        dateLabel: "التاريخ",
        timeLabel: "الوقت",
        venueLabel: "الملعب / المكان",
        venuePlaceholder: "ملعب المدرسة...",
        cupRoundLabel: "الدور",
        addScheduleBtn: "إضافة موعد مباراة",
        thDateTime: "التاريخ والوقت",
        thMatch: "المباراة",
        thStageCat: "المرحلة والقسم",
        thCupRound: "الدور",
        thVenue: "الملعب",
        thStatusScore: "الحالة / السكور",
        thActions: "إجراءات",
        recordMatchTitle: "تسجيل نتيجة مباراة في دوري الأبطال",
        saveResultBtn: "حفظ النتيجة",
        finishedMatchesTitle: "سجل مباريات دوري الأبطال المنتهية",
        uclStandingsTitle: "إحصائيات وترتيب الفرق في دوري الأبطال",
        thTeam: "الفريق / الفصل",
        thStage: "المرحلة",
        thCategory: "القسم",
        thPlayed: "لعب",
        thWon: "فاز",
        thDrawn: "تعادل",
        thLost: "خسر",
        thGD: "فارق",
        thPoints: "النقاط",
        thUclStatus: "الدور الحالي",
        scorersTitle: "قائمة هدافي دوري الأبطال وصناع الأهداف (الأسيستات)",
        thRank: "الترتيب",
        thPlayerName: "اسم اللاعب",
        thGrade: "الصف الدراسي",
        thGoals: "الأهداف ⚽",
        thAssists: "الأسيستات 🎯",
        thEdit: "تعديل",
        deleteTeamBtn: "حذف الفريق",
        playerNamePlaceholder: "اسم اللاعب بالكامل",
        playerGradePlaceholder: "الصف الدراسي",
        goalsPlaceholder: "أهداف",
        assistsPlaceholder: "أسيست",
        addPlayerBtn: "إضافة لاعب",
        thGradeShort: "الصف",
        thGoalsShort: "الأهداف",
        thAssistsShort: "الأسيستات",
        closeBtn: "إغلاق",
        noTeams: "لا توجد فرق أو فصول مسجلة حالياً.",
        addTeamFirst: "-- أضف فريقاً أولاً --",
        noSchedules: "لا توجد مواعيد مباريات مجدولة حالياً.",
        noMatches: "لا توجد مباريات مسجلة بعد.",
        noStandings: "لا توجد فرق لعرض ترتيبها.",
        noScorers: "لا يوجد لاعبون مسجلون حالياً.",
        noModalPlayers: "لا يوجد لاعبون مسجلون في هذا الفريق بعد.",
        playersCount: "عدد اللاعبين:",
        clickToManage: "اضغط للإدارة",
        clickToView: "اضغط للعرض",
        upcoming: "قادمة",
        recordResult: "تسجيل النتيجة",
        delete: "حذف",
        plusGoal: "+ هدف",
        plusAssist: "+ أسيست",
        deleteTeamTitle: "حذف الفريق",
        confirmDeleteTeam: (name) => `هل أنت متأكد من حذف "${name}" وجميع لاعبيه ومبارياته ومواعيده؟`,
        selectDiffTeams: "يرجى اختيار فريقين مختلفين!",
        enterGoalsFor: (name) => `أدخل أهداف ${name}:`,
        drawTitle: "تعادل بين الفريقين",
        drawSubtext: "نقطة لكل فريق (أو حسم بركلات الترجيح في الأدوار الإقصائية)",
        winnerTitle: "تهانينا للفائز المتأهل للدور التالي",
        championWinnerTitle: "⭐ بطل دوري أبطال المدرسة ⭐",
        hardLuckText: (name) => `هارد لك لـ ${name}`,
        badgeValues: {
            "ابتدائي": "ابتدائي",
            "إعدادي": "إعدادي",
            "ثانوي": "ثانوي",
            "لغات": "لغات",
            "عربي": "عربي",
            "دور الـ 32": "دور الـ 32",
            "دور الـ 16": "دور الـ 16",
            "ربع النهائي": "ربع النهائي",
            "نصف النهائي": "نصف النهائي",
            "النهائي": "النهائي 🏆",
            "بطل الأبطال": "بطل الأبطال 🏆",
            "خرج من البطولة": "خرج من البطولة",
            "مرحلة الدوري": "مرحلة الدوري",
            "ودي": "ودي"
        }
    },
    en: {
        pageTitle: "School Champions League - UEFA Champions League",
        langBtn: "العربية",
        loginTitle: "System Login",
        loginSubtitle: "Enter your username and password to continue",
        usernameLabel: "Username",
        passwordLabel: "Password",
        loginBtn: "Login",
        loginInvalid: "Invalid username or password!",
        accessModalTitle: "Request Edit Access (acsses)",
        accessModalDesc: "A verification code email has been sent to the designated admin emails. Enter the 6-digit code to unlock full editing:",
        sendCodeEmailBtn: "Resend Code to Email",
        accessCodePlaceholder: "Enter 6-digit code",
        verifyCodeBtn: "Unlock Editing",
        accessCodeInvalid: "Invalid code! Please check the code sent to the email.",
        accessGrantedTitle: "Full Edit Access Unlocked!",
        noEditPermission: "Editing is disabled in guest mode. Click the acsses button to enter an unlock code.",
        welcomeUserText: (name) => `Welcome ${name}!`,
        welcomeSubtext: "Successfully logged into the School Champions League",
        startNowBtn: "Start Now",
        logoutBtn: "Logout",
        chatTitle: "💬 Admins Chat",
        chatPlaceholder: "Type a message...",
        chatSendBtn: "Send",
        chatClearBtn: "Clear",
        chatEmpty: "No messages yet. Start chatting!",
        appTitle: "School Champions League ⭐",
        appSubtitle: "Official UCL Format (Round of 32 to the Final)",
        stageLabel: "Stage:",
        allStages: "All Stages",
        primary: "Primary",
        preparatory: "Preparatory",
        secondary: "Secondary",
        categoryLabel: "Division:",
        allCategories: "All Divisions",
        languages: "Languages",
        arabic: "Arabic",
        roundFilterLabel: "Round:",
        allRounds: "All Rounds",
        leaguePhase: "League Phase",
        round32: "Round of 32",
        round16: "Round of 16",
        quarterFinal: "Quarter-Finals",
        semiFinal: "Semi-Finals",
        finalRound: "Final 🏆",
        friendlyMatches: "Friendly Matches",
        friendlyMatch: "Friendly Match",
        addTeamTitle: "Add Participating Team / Class (32 Teams Format)",
        teamNameLabel: "Team / Class Name",
        teamNamePlaceholder: "e.g., 5/A or Real Madrid...",
        teamStageLabel: "Educational Stage",
        teamCategoryLabel: "Division",
        teamStatusLabel: "Tournament Stage",
        inRound32: "In Round of 32",
        inRound16: "Qualified to Round of 16",
        inQuarter: "Qualified to Quarter-Finals",
        inSemi: "Qualified to Semi-Finals",
        inFinal: "Finalist",
        championStatus: "UCL Champion 🏆",
        eliminatedStatus: "Eliminated",
        teamLogoLabel: "Team Logo",
        registerTeamBtn: "Register Team",
        teamsSectionTitle: "Participating Teams & Classes (Click a team to view or manage players, goals & assists)",
        bracketTitle: "Official UEFA Champions League Bracket (Round of 32 → Final)",
        waitingMatchSlot: "Awaiting Match Fixture",
        scheduleSectionTitle: "Champions League Schedule & Fixtures",
        firstTeamLabel: "Home Team",
        secondTeamLabel: "Away Team",
        dateLabel: "Date",
        timeLabel: "Time",
        venueLabel: "Stadium / Venue",
        venuePlaceholder: "School field...",
        cupRoundLabel: "Round",
        addScheduleBtn: "Add Match Fixture",
        thDateTime: "Date & Time",
        thMatch: "Match",
        thStageCat: "Stage & Division",
        thCupRound: "Round",
        thVenue: "Venue",
        thStatusScore: "Status / Score",
        thActions: "Actions",
        recordMatchTitle: "Record Champions League Match Result",
        saveResultBtn: "Save Result",
        finishedMatchesTitle: "Completed UCL Matches Log",
        uclStandingsTitle: "Champions League Teams Stats & Table",
        thTeam: "Team / Class",
        thStage: "Stage",
        thCategory: "Division",
        thPlayed: "P",
        thWon: "W",
        thDrawn: "D",
        thLost: "L",
        thGD: "GD",
        thPoints: "Pts",
        thUclStatus: "Current Stage",
        scorersTitle: "UCL Top Scorers & Assists Leaderboard",
        thRank: "Rank",
        thPlayerName: "Player Name",
        thGrade: "Grade",
        thGoals: "Goals ⚽",
        thAssists: "Assists 🎯",
        thEdit: "Edit",
        deleteTeamBtn: "Delete Team",
        playerNamePlaceholder: "Full Player Name",
        playerGradePlaceholder: "Grade / Class",
        goalsPlaceholder: "Goals",
        assistsPlaceholder: "Assists",
        addPlayerBtn: "Add Player",
        thGradeShort: "Grade",
        thGoalsShort: "Goals",
        thAssistsShort: "Assists",
        closeBtn: "Close",
        noTeams: "No teams or classes registered yet.",
        addTeamFirst: "-- Add a team first --",
        noSchedules: "No scheduled matches yet.",
        noMatches: "No completed matches yet.",
        noStandings: "No teams to display.",
        noScorers: "No players registered yet.",
        noModalPlayers: "No players registered in this team yet.",
        playersCount: "Players:",
        clickToManage: "Click to manage",
        clickToView: "Click to view",
        upcoming: "Upcoming",
        recordResult: "Enter Score",
        delete: "Delete",
        plusGoal: "+ Goal",
        plusAssist: "+ Assist",
        deleteTeamTitle: "Delete Team",
        confirmDeleteTeam: (name) => `Are you sure you want to delete "${name}" and all its players, matches, and fixtures?`,
        selectDiffTeams: "Please select two different teams!",
        enterGoalsFor: (name) => `Enter goals for ${name}:`,
        drawTitle: "Match Drawn",
        drawSubtext: "1 point each (or penalties in Knockout Stage)",
        winnerTitle: "Congratulations to the Advancing Winner",
        championWinnerTitle: "⭐ School Champions League Winner ⭐",
        hardLuckText: (name) => `Hard luck to ${name}`,
        badgeValues: {
            "ابتدائي": "Primary",
            "إعدادي": "Preparatory",
            "ثانوي": "Secondary",
            "لغات": "Languages",
            "عربي": "Arabic",
            "دور الـ 32": "Round of 32",
            "دور الـ 16": "Round of 16",
            "ربع النهائي": "Quarter-Finals",
            "نصف النهائي": "Semi-Finals",
            "النهائي": "Final 🏆",
            "بطل الأبطال": "UCL Champion 🏆",
            "خرج من البطولة": "Eliminated",
            "مرحلة الدوري": "League Phase",
            "ودي": "Friendly"
        }
    }
};

function t(key) {
    return translations[currentLang][key] || key;
}

function tVal(val) {
    return translations[currentLang].badgeValues[val] || val;
}

function canEdit() {
    if (!currentUser) return false;
    if (USERS_DB[currentUser]) return true;
    if (currentUser === 'guest' && guestUnlocked) return true;
    return false;
}

function isGuestReadOnly() {
    return currentUser === 'guest' && !guestUnlocked;
}

function applyPermissionsUI() {
    const accessBtn = document.getElementById('guestAccessBtn');
    if (isGuestReadOnly()) {
        document.body.classList.add('guest-readonly');
        if (accessBtn) accessBtn.classList.remove('hidden');
    } else {
        document.body.classList.remove('guest-readonly');
        if (accessBtn) accessBtn.classList.add('hidden');
    }

    const displayEl = document.getElementById('loggedUserDisplay');
    if (displayEl && currentUser) {
        displayEl.textContent = currentUser === 'guest' && guestUnlocked ? 'guest (Unlocked)' : currentUser;
    }
}

function loginAsGuest() {
    currentUser = 'guest';
    guestUnlocked = false;
    sessionStorage.setItem('schoolUcl32_activeUser', 'guest');
    sessionStorage.setItem('schoolUcl32_guestUnlocked', 'false');
    document.getElementById('loginError').classList.add('hidden');
    checkAuth();
    showWelcomeCelebration('guest');
}

function generateSixDigitCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function triggerAccessEmail(code) {
    const sendToAll = () => {
        TARGET_ADMIN_EMAILS.forEach(email => {
            window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
                to_email: email,
                access_code: code
            });
        });
    };

    if (window.emailjs) {
        if (!emailJsReady) {
            window.emailjs.init(EMAILJS_PUBLIC_KEY);
            emailJsReady = true;
        }
        sendToAll();
    } else {
        setTimeout(() => {
            if (window.emailjs) {
                window.emailjs.init(EMAILJS_PUBLIC_KEY);
                emailJsReady = true;
                sendToAll();
            }
        }, 1200);
    }
}

function requestGuestAccess() {
    if (!isGuestReadOnly()) return;
    if (!generatedAccessCode) {
        generatedAccessCode = generateSixDigitCode();
        sessionStorage.setItem('schoolUcl32_accessCode', generatedAccessCode);
    }
    triggerAccessEmail(generatedAccessCode);
    document.getElementById('accessError').classList.add('hidden');
    document.getElementById('accessCodeInput').value = '';
    document.getElementById('accessModal').classList.remove('hidden');
}

function resendAccessEmail() {
    if (!generatedAccessCode) {
        generatedAccessCode = generateSixDigitCode();
        sessionStorage.setItem('schoolUcl32_accessCode', generatedAccessCode);
    }
    triggerAccessEmail(generatedAccessCode);
}

function closeAccessModal() {
    document.getElementById('accessModal').classList.add('hidden');
}

document.getElementById('accessCodeForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const enteredCode = document.getElementById('accessCodeInput').value.trim();
    const errorBox = document.getElementById('accessError');

    if (generatedAccessCode && enteredCode === generatedAccessCode) {
        guestUnlocked = true;
        sessionStorage.setItem('schoolUcl32_guestUnlocked', 'true');
        sessionStorage.removeItem('schoolUcl32_accessCode');
        generatedAccessCode = null;
        errorBox.classList.add('hidden');
        closeAccessModal();
        applyPermissionsUI();
        initChatWidget();
        renderAll();
        if (activeTeamId) renderModalPlayers();
        showWelcomeCelebration(t('accessGrantedTitle'));
    } else {
        errorBox.textContent = t('accessCodeInvalid');
        errorBox.classList.remove('hidden');
    }
});

function initChatWidget() {
    const existing = document.getElementById('floatingChatWidget');
    if (isGuestReadOnly()) {
        if (existing) existing.remove();
        return;
    }
    if (existing) return;

    const styleEl = document.createElement('style');
    styleEl.textContent = `
        #floatingChatWidget {
            position: fixed;
            bottom: 20px;
            inset-inline-start: 20px;
            z-index: 2500;
            font-family: 'Cairo', sans-serif;
        }
        .chat-toggle-btn {
            background: linear-gradient(135deg, #060d24, #1e40af);
            color: #ffffff;
            border: 2px solid #38bdf8;
            padding: 0.7rem 1.2rem;
            border-radius: 50px;
            font-weight: 800;
            font-size: 0.95rem;
            cursor: pointer;
            box-shadow: 0 8px 20px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            gap: 0.5rem;
            transition: transform 0.2s;
        }
        .chat-toggle-btn:hover {
            transform: translateY(-2px);
        }
        .chat-window {
            width: 340px;
            max-width: calc(100vw - 40px);
            background: #ffffff;
            border-radius: 16px;
            border: 2px solid #060d24;
            box-shadow: 0 15px 40px rgba(0,0,0,0.35);
            overflow: hidden;
            margin-bottom: 10px;
            display: flex;
            flex-direction: column;
        }
        .chat-window.hidden {
            display: none !important;
        }
        .chat-header {
            background: linear-gradient(135deg, #040817, #0b1942);
            color: #38bdf8;
            padding: 0.7rem 1rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-weight: 800;
            font-size: 0.95rem;
        }
        .chat-header-btns {
            display: flex;
            gap: 0.4rem;
            align-items: center;
        }
        .chat-clear-btn {
            background: rgba(239, 68, 68, 0.85);
            color: #fff;
            border: none;
            padding: 0.2rem 0.5rem;
            border-radius: 6px;
            font-size: 0.75rem;
            font-weight: 700;
            cursor: pointer;
        }
        .chat-close-btn {
            background: none;
            border: none;
            color: #fff;
            font-size: 1.3rem;
            cursor: pointer;
            line-height: 1;
        }
        .chat-body {
            height: 270px;
            overflow-y: auto;
            padding: 0.8rem;
            background: #f8fafc;
            display: flex;
            flex-direction: column;
            gap: 0.55rem;
        }
        .chat-bubble {
            max-width: 82%;
            padding: 0.5rem 0.75rem;
            border-radius: 12px;
            font-size: 0.88rem;
            line-height: 1.4;
            word-wrap: break-word;
        }
        .chat-bubble.me {
            align-self: flex-start;
            background: #0b1942;
            color: #ffffff;
            border-bottom-right-radius: 3px;
        }
        .chat-bubble.other {
            align-self: flex-end;
            background: #e2e8f0;
            color: #0f172a;
            border-bottom-left-radius: 3px;
        }
        .chat-meta {
            display: flex;
            justify-content: space-between;
            gap: 0.6rem;
            font-size: 0.72rem;
            margin-bottom: 0.2rem;
            opacity: 0.85;
            font-weight: 700;
        }
        .chat-bubble.me .chat-meta {
            color: #38bdf8;
        }
        .chat-bubble.other .chat-meta {
            color: #0b1942;
        }
        .chat-form {
            display: flex;
            padding: 0.55rem;
            background: #ffffff;
            border-top: 1px solid #e2e8f0;
            gap: 0.4rem;
        }
        .chat-form input {
            flex: 1;
            padding: 0.45rem 0.7rem;
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            font-size: 0.88rem;
        }
        .chat-form button {
            background: #10b981;
            color: #fff;
            border: none;
            padding: 0.45rem 0.85rem;
            border-radius: 8px;
            font-weight: 700;
            cursor: pointer;
        }
    `;
    document.head.appendChild(styleEl);

    const widget = document.createElement('div');
    widget.id = 'floatingChatWidget';
    widget.innerHTML = `
        <div id="chatWindow" class="chat-window hidden">
            <div class="chat-header">
                <span id="chatHeaderTitle">${t('chatTitle')}</span>
                <div class="chat-header-btns">
                    <button type="button" id="chatClearBtn" class="chat-clear-btn" onclick="clearChatMessages()">${t('chatClearBtn')}</button>
                    <button type="button" class="chat-close-btn" onclick="toggleChatWindow()">&times;</button>
                </div>
            </div>
            <div id="chatBody" class="chat-body"></div>
            <form id="userChatForm" class="chat-form">
                <input type="text" id="userChatInput" placeholder="${t('chatPlaceholder')}" autocomplete="off" required>
                <button type="submit" id="chatSendBtn">${t('chatSendBtn')}</button>
            </form>
        </div>
        <button type="button" class="chat-toggle-btn" onclick="toggleChatWindow()">
            <span id="chatToggleLabel">${t('chatTitle')}</span>
        </button>
    `;
    document.getElementById('appWrapper').appendChild(widget);

    document.getElementById('userChatForm').addEventListener('submit', function(e) {
        e.preventDefault();
        if (!canEdit()) return;
        const input = document.getElementById('userChatInput');
        const text = input.value.trim();
        if (!text) return;

        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        chatMessages = JSON.parse(localStorage.getItem('schoolUcl32_chat_v1')) || [];
        chatMessages.push({
            id: Date.now(),
            sender: currentUser,
            text: text,
            time: timeStr
        });

        localStorage.setItem('schoolUcl32_chat_v1', JSON.stringify(chatMessages));
        input.value = '';
        renderChatMessages();
    });

    window.addEventListener('storage', function(e) {
        if (e.key === 'schoolUcl32_chat_v1') {
            chatMessages = JSON.parse(e.newValue) || [];
            renderChatMessages();
        }
    });

    renderChatMessages();
}

function toggleChatWindow() {
    if (!canEdit()) return;
    const win = document.getElementById('chatWindow');
    if (!win) return;
    isChatOpen = !isChatOpen;
    if (isChatOpen) {
        win.classList.remove('hidden');
        chatMessages = JSON.parse(localStorage.getItem('schoolUcl32_chat_v1')) || [];
        renderChatMessages();
    } else {
        win.classList.add('hidden');
    }
}

function clearChatMessages() {
    if (!canEdit()) return;
    chatMessages = [];
    localStorage.setItem('schoolUcl32_chat_v1', JSON.stringify(chatMessages));
    renderChatMessages();
}

function renderChatMessages() {
    const body = document.getElementById('chatBody');
    if (!body) return;
    body.innerHTML = "";

    if (chatMessages.length === 0) {
        body.innerHTML = `<p style="text-align:center;color:#64748b;font-size:0.85rem;margin-top:1rem;">${t('chatEmpty')}</p>`;
        return;
    }

    chatMessages.forEach(msg => {
        const isMe = msg.sender === currentUser;
        const div = document.createElement('div');
        div.className = `chat-bubble ${isMe ? 'me' : 'other'}`;
        div.innerHTML = `
            <div class="chat-meta">
                <span>${msg.sender}</span>
                <span>${msg.time}</span>
            </div>
            <div>${escapeHtml(msg.text)}</div>
        `;
        body.appendChild(div);
    });

    body.scrollTop = body.scrollHeight;
}

function escapeHtml(str) {
    return str.replace(/[&<>"']/g, function(m) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
}

function updateChatTranslations() {
    const titleEl = document.getElementById('chatHeaderTitle');
    const toggleEl = document.getElementById('chatToggleLabel');
    const inputEl = document.getElementById('userChatInput');
    const sendEl = document.getElementById('chatSendBtn');
    const clearEl = document.getElementById('chatClearBtn');
    if (titleEl) titleEl.textContent = t('chatTitle');
    if (toggleEl) toggleEl.textContent = t('chatTitle');
    if (inputEl) inputEl.placeholder = t('chatPlaceholder');
    if (sendEl) sendEl.textContent = t('chatSendBtn');
    if (clearEl) clearEl.textContent = t('chatClearBtn');
    renderChatMessages();
}

function spawnConfetti(containerId, count = 65) {
    const container = document.getElementById(containerId);
    container.innerHTML = "";
    const colors = ['#38bdf8', '#10b981', '#1e40af', '#fbbf24', '#a855f7', '#ffffff'];
    for (let i = 0; i < count; i++) {
        const piece = document.createElement('div');
        piece.className = 'confetti-piece';
        piece.style.left = Math.random() * 100 + 'vw';
        piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        piece.style.animationDuration = (Math.random() * 2 + 2) + 's';
        piece.style.animationDelay = (Math.random() * 0.6) + 's';
        container.appendChild(piece);
    }
}

function showWelcomeCelebration(username) {
    document.getElementById('welcomeTitle').textContent = t('welcomeUserText')(username);
    spawnConfetti('welcomeConfetti', 75);
    document.getElementById('welcomeOverlay').classList.remove('hidden');
}

function closeWelcomeCelebration() {
    document.getElementById('welcomeOverlay').classList.add('hidden');
}

function checkAuth() {
    if (currentUser && (USERS_DB[currentUser] || currentUser === 'guest')) {
        document.getElementById('loginOverlay').classList.add('hidden');
        document.getElementById('appWrapper').classList.remove('hidden');
        applyPermissionsUI();
        initChatWidget();
        renderAll();
    } else {
        document.getElementById('loginOverlay').classList.remove('hidden');
        document.getElementById('appWrapper').classList.add('hidden');
    }
}

document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    const errorBox = document.getElementById('loginError');

    if (USERS_DB[username] && USERS_DB[username] === password) {
        currentUser = username;
        guestUnlocked = false;
        sessionStorage.setItem('schoolUcl32_activeUser', username);
        sessionStorage.removeItem('schoolUcl32_guestUnlocked');
        errorBox.classList.add('hidden');
        this.reset();
        checkAuth();
        showWelcomeCelebration(username);
    } else {
        errorBox.textContent = t('loginInvalid');
        errorBox.classList.remove('hidden');
    }
});

function logoutUser() {
    currentUser = null;
    guestUnlocked = false;
    generatedAccessCode = null;
    sessionStorage.removeItem('schoolUcl32_activeUser');
    sessionStorage.removeItem('schoolUcl32_guestUnlocked');
    sessionStorage.removeItem('schoolUcl32_accessCode');
    closeAccessModal();
    closeWelcomeCelebration();
    checkAuth();
}

function applyLanguage() {
    const html = document.documentElement;
    html.lang = currentLang;
    html.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
    document.title = t('pageTitle');
    document.getElementById('langToggleBtn').textContent = t('langBtn');
    const loginLangBtn = document.getElementById('loginLangBtn');
    if (loginLangBtn) loginLangBtn.textContent = t('langBtn');

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (typeof translations[currentLang][key] === 'string') {
            el.textContent = translations[currentLang][key];
        }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (translations[currentLang][key]) {
            el.placeholder = translations[currentLang][key];
        }
    });

    if (currentUser && !document.getElementById('welcomeOverlay').classList.contains('hidden')) {
        document.getElementById('welcomeTitle').textContent = t('welcomeUserText')(currentUser);
    }

    updateChatTranslations();
}

function toggleLanguage() {
    currentLang = currentLang === 'ar' ? 'en' : 'ar';
    localStorage.setItem('schoolUcl32_lang', currentLang);
    applyLanguage();
    if (activeTeamId) {
        const team = teams.find(tm => tm.id === activeTeamId);
        if (team) {
            document.getElementById('modalTeamBadge').textContent = `${tVal(team.stage)} | ${tVal(team.category)} | ${tVal(team.status)}`;
        }
        renderModalPlayers();
    }
    if (currentUser) renderAll();
}

function saveData() {
    if (!canEdit()) return;
    localStorage.setItem('schoolUcl32_teams_v1', JSON.stringify(teams));
    localStorage.setItem('schoolUcl32_matches_v1', JSON.stringify(matches));
    localStorage.setItem('schoolUcl32_schedules_v1', JSON.stringify(schedules));
}

function previewLogo(event) {
    if (!canEdit()) return;
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        uploadedLogoBase64 = e.target.result;
        const preview = document.getElementById('logoPreview');
        preview.src = uploadedLogoBase64;
        preview.classList.remove('hidden');
    };
    reader.readAsDataURL(file);
}

function applyKnockoutAdvancement(teamAId, teamBId, scoreA, scoreB, round) {
    if (!NEXT_STAGE_MAP[round]) return;
    const teamA = teams.find(tm => tm.id === teamAId);
    const teamB = teams.find(tm => tm.id === teamBId);
    if (!teamA || !teamB) return;

    const nextStage = NEXT_STAGE_MAP[round];
    if (scoreA > scoreB) {
        teamA.status = nextStage;
        teamB.status = "خرج من البطولة";
    } else if (scoreB > scoreA) {
        teamB.status = nextStage;
        teamA.status = "خرج من البطولة";
    }
}

function showMatchResultAnimation(teamAId, teamBId, scoreA, scoreB, round) {
    const tA = teams.find(tm => tm.id === teamAId);
    const tB = teams.find(tm => tm.id === teamBId);
    if (!tA || !tB) return;

    const overlay = document.getElementById('celebrationOverlay');
    const icon = document.getElementById('celebrationIcon');
    const winnerTitle = document.getElementById('winnerTitle');
    const winnerLogo = document.getElementById('winnerLogo');
    const winnerName = document.getElementById('winnerName');
    const scoreBox = document.getElementById('celebrationScore');
    const loserText = document.getElementById('loserText');

    document.getElementById('confettiContainer').innerHTML = "";
    scoreBox.textContent = `${scoreA} - ${scoreB}`;

    if (scoreA === scoreB) {
        icon.textContent = "🤝";
        winnerTitle.textContent = t('drawTitle');
        winnerLogo.classList.add('hidden');
        winnerName.textContent = `${tA.name} & ${tB.name}`;
        loserText.textContent = t('drawSubtext');
    } else {
        const winner = scoreA > scoreB ? tA : tB;
        const loser = scoreA > scoreB ? tB : tA;

        icon.textContent = round === "النهائي" ? "👑" : "⭐";
        winnerTitle.textContent = round === "النهائي" ? t('championWinnerTitle') : t('winnerTitle');
        winnerLogo.src = winner.logo;
        winnerLogo.classList.remove('hidden');
        winnerName.textContent = winner.name;
        loserText.textContent = t('hardLuckText')(loser.name);
        spawnConfetti('confettiContainer', 75);
    }

    overlay.classList.remove('hidden');
}

function closeCelebration() {
    document.getElementById('celebrationOverlay').classList.add('hidden');
}

document.getElementById('teamForm').addEventListener('submit', function(e) {
    e.preventDefault();
    if (!canEdit()) {
        alert(t('noEditPermission'));
        return;
    }
    const name = document.getElementById('teamName').value.trim();
    const stage = document.getElementById('teamStage').value;
    const category = document.getElementById('teamCategory').value;
    const status = document.getElementById('teamStatus').value;

    if (!name) return;

    const newTeam = {
        id: Date.now(),
        name,
        stage,
        category,
        status,
        logo: uploadedLogoBase64 || DEFAULT_LOGO,
        players: []
    };

    teams.push(newTeam);
    saveData();

    this.reset();
    uploadedLogoBase64 = "";
    document.getElementById('logoPreview').classList.add('hidden');
    renderAll();
});

function deleteTeam(teamId, event) {
    if (event) event.stopPropagation();
    if (!canEdit()) {
        alert(t('noEditPermission'));
        return;
    }
    const team = teams.find(tm => tm.id === teamId);
    if (!team) return;

    if (!confirm(t('confirmDeleteTeam')(team.name))) return;

    teams = teams.filter(tm => tm.id !== teamId);
    matches = matches.filter(m => m.teamAId !== teamId && m.teamBId !== teamId);
    schedules = schedules.filter(sc => sc.teamAId !== teamId && sc.teamBId !== teamId);

    if (activeTeamId === teamId) closeModal();

    saveData();
    renderAll();
}

function deleteActiveTeam() {
    if (!canEdit()) {
        alert(t('noEditPermission'));
        return;
    }
    if (activeTeamId) {
        deleteTeam(activeTeamId);
    }
}

function changeActiveTeamStatus(newStatus) {
    if (!canEdit() || !activeTeamId) return;
    const team = teams.find(tm => tm.id === activeTeamId);
    if (!team) return;
    team.status = newStatus;
    document.getElementById('modalTeamBadge').textContent = `${tVal(team.stage)} | ${tVal(team.category)} | ${tVal(team.status)}`;
    saveData();
    renderAll();
}

document.getElementById('scheduleForm').addEventListener('submit', function(e) {
    e.preventDefault();
    if (!canEdit()) {
        alert(t('noEditPermission'));
        return;
    }
    const teamAId = Number(document.getElementById('schedTeamA').value);
    const teamBId = Number(document.getElementById('schedTeamB').value);
    const date = document.getElementById('schedDate').value;
    const time = document.getElementById('schedTime').value;
    const venue = document.getElementById('schedVenue').value.trim();
    const round = document.getElementById('schedRound').value;

    if (!teamAId || !teamBId || teamAId === teamBId) {
        alert(t('selectDiffTeams'));
        return;
    }

    schedules.push({
        id: Date.now(),
        teamAId,
        teamBId,
        date,
        time,
        venue,
        round,
        played: false,
        scoreA: null,
        scoreB: null
    });

    schedules.sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
    saveData();
    this.reset();
    renderAll();
});

function recordScheduledMatch(schedId) {
    if (!canEdit()) {
        alert(t('noEditPermission'));
        return;
    }
    const sched = schedules.find(s => s.id === schedId);
    if (!sched) return;

    const tA = teams.find(tm => tm.id === sched.teamAId);
    const tB = teams.find(tm => tm.id === sched.teamBId);
    if (!tA || !tB) return;

    const scoreAInput = prompt(t('enterGoalsFor')(tA.name), "0");
    if (scoreAInput === null) return;
    const scoreBInput = prompt(t('enterGoalsFor')(tB.name), "0");
    if (scoreBInput === null) return;

    const scoreA = Math.max(0, Number(scoreAInput) || 0);
    const scoreB = Math.max(0, Number(scoreBInput) || 0);

    sched.played = true;
    sched.scoreA = scoreA;
    sched.scoreB = scoreB;

    matches.unshift({
        id: Date.now(),
        teamAId: sched.teamAId,
        teamBId: sched.teamBId,
        scoreA,
        scoreB,
        round: sched.round
    });

    applyKnockoutAdvancement(sched.teamAId, sched.teamBId, scoreA, scoreB, sched.round);
    saveData();
    renderAll();
    showMatchResultAnimation(sched.teamAId, sched.teamBId, scoreA, scoreB, sched.round);
}

function deleteSchedule(schedId) {
    if (!canEdit()) {
        alert(t('noEditPermission'));
        return;
    }
    schedules = schedules.filter(s => s.id !== schedId);
    saveData();
    renderAll();
}

document.getElementById('matchForm').addEventListener('submit', function(e) {
    e.preventDefault();
    if (!canEdit()) {
        alert(t('noEditPermission'));
        return;
    }
    const teamAId = Number(document.getElementById('teamA').value);
    const teamBId = Number(document.getElementById('teamB').value);
    const scoreA = Number(document.getElementById('scoreA').value);
    const scoreB = Number(document.getElementById('scoreB').value);
    const round = document.getElementById('matchRound').value;

    if (!teamAId || !teamBId || teamAId === teamBId) {
        alert(t('selectDiffTeams'));
        return;
    }

    matches.unshift({
        id: Date.now(),
        teamAId,
        teamBId,
        scoreA,
        scoreB,
        round
    });

    applyKnockoutAdvancement(teamAId, teamBId, scoreA, scoreB, round);
    saveData();
    this.reset();
    renderAll();
    showMatchResultAnimation(teamAId, teamBId, scoreA, scoreB, round);
});

function openModal(teamId) {
    activeTeamId = teamId;
    const team = teams.find(tm => tm.id === teamId);
    if (!team) return;

    document.getElementById('modalTeamName').textContent = team.name;
    document.getElementById('modalTeamLogo').src = team.logo;
    document.getElementById('modalTeamBadge').textContent = `${tVal(team.stage)} | ${tVal(team.category)} | ${tVal(team.status)}`;
    document.getElementById('modalTeamStatusSelect').value = team.status || "دور الـ 32";
    document.getElementById('playerStage').value = team.stage;
    document.getElementById('playerCategory').value = team.category;

    renderModalPlayers();
    document.getElementById('playersModal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('playersModal').classList.add('hidden');
    activeTeamId = null;
}

document.getElementById('playerForm').addEventListener('submit', function(e) {
    e.preventDefault();
    if (!canEdit()) {
        alert(t('noEditPermission'));
        return;
    }
    if (!activeTeamId) return;

    const team = teams.find(tm => tm.id === activeTeamId);
    const name = document.getElementById('playerName').value.trim();
    const stage = document.getElementById('playerStage').value;
    const grade = document.getElementById('playerGrade').value.trim();
    const category = document.getElementById('playerCategory').value;
    const goals = Number(document.getElementById('playerGoals').value) || 0;
    const assists = Number(document.getElementById('playerAssists').value) || 0;

    team.players.push({
        id: Date.now(),
        name,
        stage,
        grade,
        category,
        goals,
        assists
    });

    saveData();
    this.reset();
    document.getElementById('playerStage').value = team.stage;
    document.getElementById('playerCategory').value = team.category;
    renderModalPlayers();
    renderAll();
});

function updatePlayerStat(teamId, playerId, field, delta) {
    if (!canEdit()) {
        alert(t('noEditPermission'));
        return;
    }
    const team = teams.find(tm => tm.id === teamId);
    if (!team) return;
    const player = team.players.find(p => p.id === playerId);
    if (!player) return;

    player[field] = Math.max(0, (player[field] || 0) + delta);
    saveData();
    if (activeTeamId === teamId) renderModalPlayers();
    renderAll();
}

function deletePlayer(teamId, playerId) {
    if (!canEdit()) {
        alert(t('noEditPermission'));
        return;
    }
    const team = teams.find(tm => tm.id === teamId);
    if (!team) return;
    team.players = team.players.filter(p => p.id !== playerId);
    saveData();
    renderModalPlayers();
    renderAll();
}

function renderModalPlayers() {
    const team = teams.find(tm => tm.id === activeTeamId);
    const tbody = document.getElementById('modalPlayersList');
    tbody.innerHTML = "";
    const editable = canEdit();

    if (!team || team.players.length === 0) {
        tbody.innerHTML = `<tr><td colspan="${editable ? 7 : 6}">${t('noModalPlayers')}</td></tr>`;
        return;
    }

    team.players.forEach(p => {
        const actionsCell = editable ? `
            <td>
                <button class="btn-sm btn-plus" onclick="updatePlayerStat(${team.id}, ${p.id}, 'goals', 1)">${t('plusGoal')}</button>
                <button class="btn-sm btn-assist" onclick="updatePlayerStat(${team.id}, ${p.id}, 'assists', 1)">${t('plusAssist')}</button>
                <button class="btn-sm btn-del" onclick="deletePlayer(${team.id}, ${p.id})">${t('delete')}</button>
            </td>
        ` : ``;

        tbody.innerHTML += `
            <tr>
                <td><strong>${p.name}</strong></td>
                <td><span class="badge stage">${tVal(p.stage)}</span></td>
                <td>${p.grade}</td>
                <td><span class="badge">${tVal(p.category || team.category)}</span></td>
                <td><strong>${p.goals || 0}</strong></td>
                <td><strong>${p.assists || 0}</strong></td>
                ${actionsCell}
            </tr>
        `;
    });
}

function getFilteredTeams() {
    const stageFilter = document.getElementById('stageFilter').value;
    const catFilter = document.getElementById('categoryFilter').value;

    return teams.filter(tm => {
        const matchStage = stageFilter === "الكل" || tm.stage === stageFilter;
        const matchCat = catFilter === "الكل" || tm.category === catFilter;
        return matchStage && matchCat;
    });
}

function getStatusBadgeClass(status) {
    if (status === "بطل الأبطال") return "champion";
    if (status === "خرج من البطولة") return "eliminated";
    return "league";
}

function renderTeams() {
    const grid = document.getElementById('teamsGrid');
    const filtered = getFilteredTeams();
    const editable = canEdit();
    grid.innerHTML = "";

    if (filtered.length === 0) {
        grid.innerHTML = `<p>${t('noTeams')}</p>`;
        return;
    }

    filtered.forEach(team => {
        const deleteBtnHtml = editable
            ? `<button class="delete-school-btn" title="${t('deleteTeamTitle')}" onclick="deleteTeam(${team.id}, event)">&times;</button>`
            : ``;
        const hintText = editable ? t('clickToManage') : t('clickToView');
        const statusVal = team.status || "دور الـ 32";
        const cardExtraClass = statusVal === "خرج من البطولة" ? "eliminated-card" : (statusVal === "بطل الأبطال" ? "champion-card" : "");

        grid.innerHTML += `
            <div class="school-card ${cardExtraClass}" onclick="openModal(${team.id})">
                ${deleteBtnHtml}
                <img src="${team.logo}" alt="${team.name}">
                <h4>${team.name}</h4>
                <div class="badges">
                    <span class="badge stage">${tVal(team.stage)}</span>
                    <span class="badge">${tVal(team.category)}</span>
                    <span class="badge ${getStatusBadgeClass(statusVal)}">${tVal(statusVal)}</span>
                </div>
                <div class="school-players-count">${t('playersCount')} ${team.players.length} | ${hintText}</div>
            </div>
        `;
    });
}

function renderUclBracket() {
    const container = document.getElementById('uclBracketContainer');
    const stageFilter = document.getElementById('stageFilter').value;
    const catFilter = document.getElementById('categoryFilter').value;
    container.innerHTML = "";

    UCL_BRACKET_STAGES.forEach(stageObj => {
        const roundName = stageObj.key;
        const isFinal = roundName === "النهائي";

        const playedMatches = matches.filter(m => {
            if (m.round !== roundName) return false;
            const tA = teams.find(tm => tm.id === m.teamAId);
            const tB = teams.find(tm => tm.id === m.teamBId);
            if (!tA || !tB) return false;
            const matchStage = stageFilter === "الكل" || tA.stage === stageFilter || tB.stage === stageFilter;
            const matchCat = catFilter === "الكل" || tA.category === catFilter || tB.category === catFilter;
            return matchStage && matchCat;
        });

        const upcomingScheds = schedules.filter(sc => {
            if (sc.round !== roundName || sc.played) return false;
            const tA = teams.find(tm => tm.id === sc.teamAId);
            const tB = teams.find(tm => tm.id === sc.teamBId);
            if (!tA || !tB) return false;
            const matchStage = stageFilter === "الكل" || tA.stage === stageFilter || tB.stage === stageFilter;
            const matchCat = catFilter === "الكل" || tA.category === catFilter || tB.category === catFilter;
            return matchStage && matchCat;
        });

        let tiesHtml = "";

        playedMatches.forEach(m => {
            const tA = teams.find(tm => tm.id === m.teamAId);
            const tB = teams.find(tm => tm.id === m.teamBId);
            const aWon = m.scoreA > m.scoreB;
            const bWon = m.scoreB > m.scoreA;

            tiesHtml += `
                <div class="bracket-tie ${isFinal ? 'final-tie' : ''}">
                    <div class="bracket-team-row ${aWon ? 'winner-row' : ''}">
                        <div class="bracket-team-info">
                            <img src="${tA.logo}" alt="">
                            <span title="${tA.name}">${tA.name}</span>
                        </div>
                        <span class="bracket-score-box">${m.scoreA}</span>
                    </div>
                    <div class="bracket-team-row ${bWon ? 'winner-row' : ''}">
                        <div class="bracket-team-info">
                            <img src="${tB.logo}" alt="">
                            <span title="${tB.name}">${tB.name}</span>
                        </div>
                        <span class="bracket-score-box">${m.scoreB}</span>
                    </div>
                </div>
            `;
        });

        upcomingScheds.forEach(sc => {
            const tA = teams.find(tm => tm.id === sc.teamAId);
            const tB = teams.find(tm => tm.id === sc.teamBId);

            tiesHtml += `
                <div class="bracket-tie ${isFinal ? 'final-tie' : ''}">
                    <div class="bracket-team-row">
                        <div class="bracket-team-info">
                            <img src="${tA.logo}" alt="">
                            <span title="${tA.name}">${tA.name}</span>
                        </div>
                        <span class="bracket-score-box">-</span>
                    </div>
                    <div class="bracket-team-row">
                        <div class="bracket-team-info">
                            <img src="${tB.logo}" alt="">
                            <span title="${tB.name}">${tB.name}</span>
                        </div>
                        <span class="bracket-score-box">-</span>
                    </div>
                </div>
            `;
        });

        const totalShown = playedMatches.length + upcomingScheds.length;
        if (totalShown === 0) {
            tiesHtml = `<div class="bracket-empty-slot">${t('waitingMatchSlot')}</div>`;
        }

        container.innerHTML += `
            <div class="bracket-column">
                <div class="bracket-col-title ${isFinal ? 'final-col' : ''}">
                    ${tVal(roundName)} (${totalShown}/${stageObj.targetMatches})
                </div>
                <div class="bracket-matches-stack">${tiesHtml}</div>
            </div>
        `;
    });
}

function renderSelectOptions() {
    const selects = [
        document.getElementById('teamA'),
        document.getElementById('teamB'),
        document.getElementById('schedTeamA'),
        document.getElementById('schedTeamB')
    ];

    if (teams.length === 0) {
        selects.forEach(sel => sel.innerHTML = `<option value="">${t('addTeamFirst')}</option>`);
        return;
    }

    const options = teams.map(tm => `<option value="${tm.id}">${tm.name} (${tVal(tm.stage)} - ${tVal(tm.category)})</option>`).join('');
    selects.forEach((sel, idx) => {
        sel.innerHTML = options;
        if (teams.length > 1 && idx % 2 === 1) sel.selectedIndex = 1;
    });
}

function renderSchedule() {
    const tbody = document.getElementById('scheduleBody');
    const stageFilter = document.getElementById('stageFilter').value;
    const catFilter = document.getElementById('categoryFilter').value;
    const roundFilter = document.getElementById('roundFilter').value;
    const editable = canEdit();

    tbody.innerHTML = "";

    const filteredScheds = schedules.filter(sc => {
        const tA = teams.find(tm => tm.id === sc.teamAId);
        const tB = teams.find(tm => tm.id === sc.teamBId);
        if (!tA || !tB) return false;

        const matchStage = stageFilter === "الكل" || tA.stage === stageFilter || tB.stage === stageFilter;
        const matchCat = catFilter === "الكل" || tA.category === catFilter || tB.category === catFilter;
        const matchRound = roundFilter === "الكل" || sc.round === roundFilter;
        return matchStage && matchCat && matchRound;
    });

    if (filteredScheds.length === 0) {
        tbody.innerHTML = `<tr><td colspan="${editable ? 7 : 6}">${t('noSchedules')}</td></tr>`;
        return;
    }

    filteredScheds.forEach(sc => {
        const tA = teams.find(tm => tm.id === sc.teamAId);
        const tB = teams.find(tm => tm.id === sc.teamBId);
        const statusHtml = sc.played
            ? `<span class="match-score">${sc.scoreA} - ${sc.scoreB}</span>`
            : `<span class="badge upcoming">${t('upcoming')}</span>`;

        const actionBtn = sc.played
            ? ``
            : `<button class="btn-sm btn-plus" onclick="recordScheduledMatch(${sc.id})">${t('recordResult')}</button>`;

        const actionsCell = editable ? `
            <td>
                ${actionBtn}
                <button class="btn-sm btn-del" onclick="deleteSchedule(${sc.id})">${t('delete')}</button>
            </td>
        ` : ``;

        tbody.innerHTML += `
            <tr>
                <td><strong>${sc.date}</strong><br><small>${sc.time}</small></td>
                <td><strong>${tA.name}</strong> 🆚 <strong>${tB.name}</strong></td>
                <td><span class="badge stage">${tVal(tA.stage)}</span> <span class="badge">${tVal(tA.category)}</span></td>
                <td><span class="badge ${sc.round === 'ودي' ? 'friendly' : 'league'}">${tVal(sc.round)}</span></td>
                <td>${sc.venue}</td>
                <td>${statusHtml}</td>
                ${actionsCell}
            </tr>
        `;
    });
}

function renderMatches() {
    const list = document.getElementById('matchesList');
    const roundFilter = document.getElementById('roundFilter').value;
    list.innerHTML = "";

    const filteredMatches = matches.filter(m => roundFilter === "الكل" || m.round === roundFilter);

    if (filteredMatches.length === 0) {
        list.innerHTML = `<p>${t('noMatches')}</p>`;
        return;
    }

    filteredMatches.forEach(m => {
        const tA = teams.find(tm => tm.id === m.teamAId);
        const tB = teams.find(tm => tm.id === m.teamBId);
        if (!tA || !tB) return;

        list.innerHTML += `
            <div class="match-item">
                <span>${tA.name}</span>
                <span class="match-score">${m.scoreA} - ${m.scoreB}</span>
                <span>${tB.name}</span>
                <span class="badge ${m.round === 'ودي' ? 'friendly' : 'league'}">${tVal(m.round)}</span>
            </div>
        `;
    });
}

function renderUclStandings() {
    const filtered = getFilteredTeams();
    const tbody = document.getElementById('uclStandingsBody');
    tbody.innerHTML = "";

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="11">${t('noStandings')}</td></tr>`;
        return;
    }

    const stats = filtered.map(team => ({
        ...team,
        status: team.status || "دور الـ 32",
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        gf: 0,
        ga: 0,
        points: 0
    }));

    matches.forEach(m => {
        if (m.round === "ودي") return;
        const teamA = stats.find(s => s.id === m.teamAId);
        const teamB = stats.find(s => s.id === m.teamBId);
        if (!teamA || !teamB) return;

        teamA.played++;
        teamB.played++;
        teamA.gf += m.scoreA;
        teamA.ga += m.scoreB;
        teamB.gf += m.scoreB;
        teamB.ga += m.scoreA;

        if (m.scoreA > m.scoreB) {
            teamA.won++;
            teamA.points += 3;
            teamB.lost++;
        } else if (m.scoreB > m.scoreA) {
            teamB.won++;
            teamB.points += 3;
            teamA.lost++;
        } else {
            teamA.drawn++;
            teamB.drawn++;
            teamA.points += 1;
            teamB.points += 1;
        }
    });

    const stageOrder = {
        "بطل الأبطال": 7,
        "النهائي": 6,
        "نصف النهائي": 5,
        "ربع النهائي": 4,
        "دور الـ 16": 3,
        "دور الـ 32": 2,
        "خرج من البطولة": 1
    };

    stats.sort((a, b) => (stageOrder[b.status] || 0) - (stageOrder[a.status] || 0) || b.points - a.points || (b.gf - b.ga) - (a.gf - a.ga));

    stats.forEach((s, index) => {
        const gd = s.gf - s.ga;
        const gdStr = gd > 0 ? `+${gd}` : `${gd}`;

        tbody.innerHTML += `
            <tr>
                <td><strong>${index + 1}</strong></td>
                <td>
                    <div class="team-cell">
                        <img src="${s.logo}" alt="">
                        <span>${s.name}</span>
                    </div>
                </td>
                <td><span class="badge stage">${tVal(s.stage)}</span></td>
                <td><span class="badge">${tVal(s.category)}</span></td>
                <td>${s.played}</td>
                <td>${s.won}</td>
                <td>${s.drawn}</td>
                <td>${s.lost}</td>
                <td><strong>${gdStr}</strong></td>
                <td class="points-cell">${s.points}</td>
                <td><span class="badge ${getStatusBadgeClass(s.status)}">${tVal(s.status)}</span></td>
            </tr>
        `;
    });
}

function renderScorers() {
    const stageFilter = document.getElementById('stageFilter').value;
    const catFilter = document.getElementById('categoryFilter').value;
    const editable = canEdit();
    let allPlayers = [];

    teams.forEach(team => {
        team.players.forEach(player => {
            const pStage = player.stage || team.stage;
            const pCat = player.category || team.category;

            const matchStage = stageFilter === "الكل" || pStage === stageFilter;
            const matchCat = catFilter === "الكل" || pCat === catFilter;

            if (matchStage && matchCat) {
                allPlayers.push({
                    ...player,
                    stage: pStage,
                    category: pCat,
                    goals: player.goals || 0,
                    assists: player.assists || 0,
                    teamId: team.id,
                    teamName: team.name
                });
            }
        });
    });

    allPlayers.sort((a, b) => b.goals - a.goals || b.assists - a.assists);

    const tbody = document.getElementById('scorersBody');
    tbody.innerHTML = "";

    if (allPlayers.length === 0) {
        tbody.innerHTML = `<tr><td colspan="${editable ? 9 : 8}">${t('noScorers')}</td></tr>`;
        return;
    }

    allPlayers.forEach((p, index) => {
        const editCell = editable ? `
            <td>
                <button class="btn-sm btn-plus" onclick="updatePlayerStat(${p.teamId}, ${p.id}, 'goals', 1)">${t('plusGoal')}</button>
                <button class="btn-sm btn-assist" onclick="updatePlayerStat(${p.teamId}, ${p.id}, 'assists', 1)">${t('plusAssist')}</button>
            </td>
        ` : ``;

        tbody.innerHTML += `
            <tr>
                <td><strong>${index + 1}</strong></td>
                <td><strong>${p.name}</strong></td>
                <td><span class="badge stage">${tVal(p.stage)}</span></td>
                <td>${p.grade}</td>
                <td>${p.teamName}</td>
                <td><span class="badge">${tVal(p.category)}</span></td>
                <td class="points-cell">${p.goals} ⚽</td>
                <td class="assist-cell">${p.assists} 🎯</td>
                ${editCell}
            </tr>
        `;
    });
}

function renderAll() {
    renderTeams();
    renderUclBracket();
    renderSelectOptions();
    renderSchedule();
    renderMatches();
    renderUclStandings();
    renderScorers();
}

applyLanguage();
checkAuth();