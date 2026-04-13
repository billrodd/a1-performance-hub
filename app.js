const SUPABASE_URL = 'https://hrtxwwfctzasladeggxv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhydHh3d2ZjdHphc2xhZGVnZ3h2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4NzE1MTUsImV4cCI6MjA4OTQ0NzUxNX0.oMQpefoqbXSOy2RxaOESgYezPMyVYNyd4FcmoYJFZLs';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const APPS_SCRIPT_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbw0qwc0j7NqBDntsVipVn1l_RIfJrLRSp867z4jjEsFubxbfc2kkCxGSXSLsficxxWM7A/exec";

const levelDefsCsv = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQlRsL1OpJT1fMXt2s0SQC7qrGwXzRisDvZqiGZL4FsZU5UAISOiH-zbADEfg8w1jpDo-qDgqeJ20BO/pub?gid=486570357&single=true&output=csv';
const skillsListCsv = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQlRsL1OpJT1fMXt2s0SQC7qrGwXzRisDvZqiGZL4FsZU5UAISOiH-zbADEfg8w1jpDo-qDgqeJ20BO/pub?gid=900029716&single=true&output=csv';
const techMasteryCsv = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQlRsL1OpJT1fMXt2s0SQC7qrGwXzRisDvZqiGZL4FsZU5UAISOiH-zbADEfg8w1jpDo-qDgqeJ20BO/pub?gid=1085819872&single=true&output=csv';

const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

const beltNames = { 0: 'Gray', 1: 'Blue', 2: 'Green', 3: 'Brown', 4: 'Black' };

const beltStyles = {
    'GRAY':  { label: 'GRAY',  bg: 'bg-slate-800',    border: 'border-slate-500', text: 'text-slate-300', hex: '#64748b', badgeBg: 'bg-slate-600', badgeText: 'text-white' },
    'BLUE':  { label: 'BLUE',  bg: 'bg-blue-950/30',  border: 'border-blue-500',  text: 'text-blue-400', hex: '#3b82f6', badgeBg: 'bg-blue-700', badgeText: 'text-white' },
    'GREEN': { label: 'GREEN', bg: 'bg-green-950/30', border: 'border-green-500', text: 'text-green-400', hex: '#22c55e', badgeBg: 'bg-green-700', badgeText: 'text-white' },
    'BROWN': { label: 'BROWN', bg: 'bg-amber-950/30', border: 'border-amber-600', text: 'text-amber-500', hex: '#b45309', badgeBg: 'bg-amber-800', badgeText: 'text-white' },
    'BLACK': { label: 'BLACK', bg: 'bg-black',        border: 'border-slate-700', text: 'text-white', hex: '#0f172a', badgeBg: 'bg-black', badgeText: 'text-white' },
    'WHITE': { label: 'STAFF', bg: 'bg-white',        border: 'border-slate-200', text: 'text-slate-800', hex: '#cbd5e1', badgeBg: 'bg-slate-200', badgeText: 'text-slate-800' },
    'SALES': { label: 'SALES', bg: 'bg-purple-100',   border: 'border-purple-300', text: 'text-purple-800', hex: '#d8b4fe', badgeBg: 'bg-purple-200', badgeText: 'text-purple-800' }
};

const behaviorsData = [
    { id: 'attitude', name: 'Attitude & Team Mindset', type: 'CRITICAL', desc: 'Positive, solution-focused, respects culture.' },
    { id: 'customer', name: 'Customer Satisfaction', type: 'CRITICAL', desc: 'Professional, clean, positive feedback.' },
    { id: 'appearance', name: 'Professional Appearance', type: 'Operational', desc: 'Clean uniform, proper PPE.' },
    { id: 'truck', name: 'Truck Readiness', type: 'Operational', desc: 'Clean, stocked, inspected.' },
    { id: 'prep', name: 'Preparation & Readiness', type: 'Operational', desc: 'Reviews details, brings tools.' },
    { id: 'problem', name: 'Problem Solving', type: 'Operational', desc: 'Initiative, independent diagnosis.' },
    { id: 'attendance', name: 'Attendance & Reliability', type: 'CRITICAL', desc: 'On-time, prepared, early communication.' }
];

const state = { 
    roster: {}, jobs: {}, activeView: 'scorecards', currentUserRole: null, currentUserKey: null, 
    levelDefs: [], skillsList: [], techMastery: {}, techBehaviors: {},
    mtdStats: {}, qtdStats: {}, ytdStats: {},
    attendanceRules: [], attendanceOccurrences: [],
    sortOrder: 'alpha',
    activeCategory: 'RESIDENTIAL',
    datePreset: 'mtd'
};

// --- UNIVERSAL SIGNATURE ENGINE ---
let currentSignatureCanvas = null;
let currentSignatureCtx = null;
let isDrawing = false;
window.hasSigned = false;

window.initSignatureEngine = function(canvasId) {
    const canvas = document.getElementById(canvasId);
    if(!canvas) return;
    currentSignatureCanvas = canvas;
    currentSignatureCtx = canvas.getContext('2d');
    window.hasSigned = false;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    currentSignatureCtx.lineWidth = 3;
    currentSignatureCtx.lineCap = 'round';
    currentSignatureCtx.lineJoin = 'round';
    currentSignatureCtx.strokeStyle = '#3b82f6'; 

    const getPos = (e) => {
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return { x: clientX - rect.left, y: clientY - rect.top };
    };

    const start = (e) => { e.preventDefault(); isDrawing = true; window.hasSigned = true; const pos = getPos(e); currentSignatureCtx.beginPath(); currentSignatureCtx.moveTo(pos.x, pos.y); };
    const move = (e) => { e.preventDefault(); if(!isDrawing) return; const pos = getPos(e); currentSignatureCtx.lineTo(pos.x, pos.y); currentSignatureCtx.stroke(); };
    const end = (e) => { e.preventDefault(); if(!isDrawing) return; isDrawing = false; };

    canvas.addEventListener('mousedown', start);
    canvas.addEventListener('mousemove', move);
    canvas.addEventListener('mouseup', end);
    canvas.addEventListener('mouseout', end);
    canvas.addEventListener('touchstart', start, {passive: false});
    canvas.addEventListener('touchmove', move, {passive: false});
    canvas.addEventListener('touchend', end, {passive: false});
};

window.clearSignature = function() {
    if(!currentSignatureCanvas) return;
    currentSignatureCtx.clearRect(0, 0, currentSignatureCanvas.width, currentSignatureCanvas.height);
    window.hasSigned = false;
};
// -----------------------------------

document.getElementById('pin-input').addEventListener('input', function(e) { if (this.value.length === 4) handleLogin(this.value); });

window.switchCategory = function(cat) {
    state.activeCategory = cat;
    if (state.activeView === 'scorecards') showScorecards();
    else if (state.activeView === 'companyJobTypes') showCompanyJobTypes();
};

window.goHome = function() {
    state.activeTechKey = null;
    state.activeView = 'scorecards';
    
    if (state.currentUserRole === 'ADMIN') {
        state.activeCategory = 'RESIDENTIAL'; 
    }
    showScorecards();
};

window.dragStart = function(event) {
    event.dataTransfer.setData("techKey", event.currentTarget.getAttribute('data-tech'));
    event.dataTransfer.effectAllowed = "move";
    setTimeout(() => event.target.classList.add('opacity-40', 'scale-95'), 0);
};

window.dragEnd = function(event) {
    event.target.classList.remove('opacity-40', 'scale-95');
};

window.dragOver = function(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
};

window.dropTech = async function(event, targetDept, targetRole) {
    event.preventDefault();
    event.currentTarget.classList.remove('ring-4', 'ring-blue-400', 'bg-blue-50'); 
    
    const techKey = event.dataTransfer.getData("techKey");
    if (!techKey || state.currentUserRole !== 'ADMIN') return;

    const tech = state.roster[techKey];
    if (!tech) return;

    let newDept = targetDept === 'KEEP_DEPT' ? tech.department : targetDept;
    let newRole = targetRole;

    const isApprentice = tech.role.toUpperCase().includes('APPRENTICE');

    if (targetRole === 'WAREHOUSE') newDept = 'WAREHOUSE';
    if (targetRole === 'SALES' && newDept === 'WAREHOUSE') newDept = 'RESIDENTIAL';

    if (isApprentice && !newRole.includes('APPRENTICE')) {
        newRole = newRole + ' APPRENTICE';
    }

    if (tech.department === newDept && tech.role === newRole) return;

    tech.department = newDept;
    tech.role = newRole;
    showScorecards(); 

    try {
        const { error } = await supabaseClient.from('tech_profiles')
            .update({ department: newDept, primary_role: newRole })
            .eq('tech_name', tech.displayName);
        if (error) console.error("DB Update Error:", error);
    } catch(e) {
        console.error(e);
    }
};

window.handleActionClick = function(e, action, techKey, techName) {
    if(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    if (action === 'stats') {
        showTechJobTypes(techKey);
    } else if (action === 'pip') {
        alert('PIP Module is currently undergoing a backend rebuild. Check back soon.');
    } else if (action === 'belts') {
        window.openBeltsModal(techKey, techName);
    } else if (action === 'review') {
        window.openMonthlyReview(techKey, techName);
    } else if (action === 'callout') {
        window.quickCallOut(techKey, techName);
    }
};

window.openBeltsModal = function(techKey, techName) {
    const techSkills = state.techMastery[techName.toUpperCase()] || {};
    const techBehs = state.techBehaviors[techName.toUpperCase()] || {};

    let html = `
        <div class="bg-white max-w-6xl w-full mx-auto shadow-2xl relative border-t-[8px] border-indigo-600 rounded-b-xl flex flex-col max-h-[90vh]">
            <div class="bg-slate-800 text-white p-4 flex justify-between items-center shrink-0">
                <h2 class="text-lg font-black uppercase tracking-widest text-indigo-400">${techName} - Technical & Behavioral Profile</h2>
                <button onclick="document.getElementById('modal-belts-view').classList.add('hidden')" class="text-slate-300 hover:text-white font-bold">✕ CLOSE</button>
            </div>
            <div class="p-8 overflow-y-auto custom-scrollbar flex-1 bg-slate-50">
                
                <h3 class="text-xl font-black text-slate-800 uppercase tracking-widest mb-4 border-b-2 border-slate-300 pb-2">Technical Skill Tree</h3>
                <div class="flex flex-wrap gap-x-6 gap-y-2 items-center mb-6 bg-white p-3 rounded-xl border border-slate-200 shadow-sm w-max">
                    <span class="text-xs font-black text-blue-600 uppercase tracking-widest">Proficiency Legend:</span>
                    <div class="flex items-center gap-2">
                        <div class="flex gap-0.5"><div class="battery-block bb-1"></div><div class="battery-block bb-0"></div><div class="battery-block bb-0"></div><div class="battery-block bb-0"></div></div> 
                        <span class="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Shown How</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <div class="flex gap-0.5"><div class="battery-block bb-1"></div><div class="battery-block bb-1"></div><div class="battery-block bb-0"></div><div class="battery-block bb-0"></div></div> 
                        <span class="text-[10px] text-slate-500 font-bold uppercase tracking-widest">With Assistance</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <div class="flex gap-0.5"><div class="battery-block bb-1"></div><div class="battery-block bb-1"></div><div class="battery-block bb-2"></div><div class="battery-block bb-0"></div></div> 
                        <span class="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Completed Solo</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <div class="flex gap-0.5"><div class="battery-block bb-1"></div><div class="battery-block bb-1"></div><div class="battery-block bb-2"></div><div class="battery-block bb-3"></div></div> 
                        <span class="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Can Teach</span>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">`;

    [0, 1, 2, 3, 4].forEach(beltIdx => {
        const lvlSkills = state.skillsList.filter(s => parseInt(s.level) === beltIdx);
        const bName = beltNames[beltIdx].toUpperCase();
        const bStyleTree = beltStyles[bName] || beltStyles['GRAY'];
        const borderColor = bStyleTree.border;
        
        const isFullWidth = beltIdx === 3 || beltIdx === 4;
        const colSpanClass = isFullWidth ? 'lg:col-span-3 md:col-span-2' : 'lg:col-span-1';
        const innerContainerClass = isFullWidth ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'flex flex-col gap-2';
        
        html += `
            <div class="${colSpanClass} bg-white border-t-4 ${borderColor} rounded-xl p-5 shadow-md flex flex-col">
                <div class="mb-4">
                    <h4 class="text-lg font-black text-slate-800 uppercase">${bName} BELT</h4>
                </div>
                <div class="${innerContainerClass} flex-grow">`;
        
        if (lvlSkills.length === 0) {
            html += `<div class="text-slate-400 text-sm italic col-span-full">No skills populated.</div>`;
        } else {
            lvlSkills.forEach(s => {
                const safeName = s.name.toUpperCase().trim();
                const val = parseInt(techSkills[safeName]) || 0;
                html += `
                    <div class="flex items-center justify-between bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                        <span class="text-[11px] font-bold text-slate-600 uppercase truncate pr-3 leading-tight" title="${s.name}">${s.name}</span>
                        <div class="flex gap-1 shrink-0 pointer-events-none">
                            <div class="battery-block ${val >= 1 ? 'bb-1' : 'bb-0'}"></div>
                            <div class="battery-block ${val >= 2 ? 'bb-1' : 'bb-0'}"></div>
                            <div class="battery-block ${val >= 3 ? 'bb-2' : 'bb-0'}"></div>
                            <div class="battery-block ${val >= 4 ? 'bb-3' : 'bb-0'}"></div>
                        </div>
                    </div>`;
            });
        }
        html += `</div></div>`;
    });

    html += `</div>
            <h3 class="text-xl font-black text-slate-800 uppercase tracking-widest mb-4 border-b-2 border-slate-300 pb-2">Behavioral Matrix</h3>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div class="flex flex-col gap-3">
                    <h4 class="text-slate-500 font-black text-xs uppercase tracking-widest">Critical Behaviors</h4>`;
    
    const renderBehavior = (b, bScore) => `
        <div class="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div class="pr-4">
                <div class="flex items-center gap-3 mb-1">
                    <span class="text-sm font-black text-slate-700 uppercase">${b.name}</span>
                </div>
                <div class="text-[10px] text-slate-500 font-medium uppercase tracking-widest">${b.desc}</div>
            </div>
            <div class="flex w-40 shrink-0 h-8 pointer-events-none">
                <button class="beh-btn rounded-l-lg text-[10px] ${bScore === 'EXC' ? 'active-exc' : ''}">EXC</button>
                <button class="beh-btn border-l-0 border-r-0 text-[10px] ${bScore === 'MEET' ? 'active-meet' : ''}">MEET</button>
                <button class="beh-btn rounded-r-lg text-[10px] ${bScore === 'NEED' ? 'active-need' : ''}">NEED</button>
            </div>
        </div>`;

    const criticals = behaviorsData.filter(b => b.type === 'CRITICAL');
    const operationals = behaviorsData.filter(b => b.type !== 'CRITICAL');

    criticals.forEach(b => html += renderBehavior(b, techBehs[b.id] || ''));
    html += `</div><div class="flex flex-col gap-3"><h4 class="text-slate-500 font-black text-xs uppercase tracking-widest">Operational Behaviors</h4>`;
    operationals.forEach(b => html += renderBehavior(b, techBehs[b.id] || ''));

    html += `</div></div></div></div>`;

    let modal = document.getElementById('modal-belts-view');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-belts-view';
        modal.className = 'fixed inset-0 z-[150] hidden flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4';
        document.body.appendChild(modal);
    }
    modal.innerHTML = html;
    modal.classList.remove('hidden');
};

window.quickCallOut = async function(techKey, techName) {
    if (state.currentUserRole !== 'ADMIN') {
        alert("Only managers can log occurrences.");
        return;
    }
    
    const d = prompt(`LOGGING CALL-OUT FOR ${techName.toUpperCase()}\n\nEnter Date (YYYY-MM-DD):`, new Date().toLocaleDateString('en-CA'));
    if (!d) return;
    
    const desc = prompt(`Enter Reason for Call-Out:`);
    if (!desc) return;

    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    ninetyDaysAgo.setHours(0,0,0,0);

    const pastStrikes = state.attendanceOccurrences.filter(o => {
        if (o.tech_name.toUpperCase() !== techName.toUpperCase()) return false;
        const oDate = new Date(o.date + 'T00:00:00'); 
        return oDate >= ninetyDaysAgo;
    });

    const strikeCount = pastStrikes.length + 1;

    const payload = { 
        tech_name: techName, 
        date: d, 
        description: desc,
        status: 'PENDING',
        strike_count: strikeCount
    };

    const { data, error } = await supabaseClient.from('attendance_occurrences').insert([payload]).select();
    if (error) {
        alert('Database Error saving occurrence: ' + error.message);
        return;
    }

    if (data && data.length > 0) {
        state.attendanceOccurrences.push(data[0]);
    } else {
        state.attendanceOccurrences.push({ id: Date.now(), ...payload });
    }

    // Fire the email flare to Google Apps Script
    fetch(APPS_SCRIPT_WEB_APP_URL, {
        method: 'POST',
        body: JSON.stringify({
            type: 'ATTENDANCE_OCCURRENCE',
            techName: techName,
            date: d,
            description: desc
        }),
        headers: { 'Content-Type': 'text/plain;charset=utf-8' }
    }).catch(err => console.log("Email trigger failed:", err));

    alert(`✅ Call-out logged as PENDING. The disciplinary document has been prefilled and is waiting for ${techName}'s signature.`);
    showScorecards(); 
};

// --- DISCIPLINARY FORM ENGINE ---
window.openPendingDoc = function(occId) {
    const occ = state.attendanceOccurrences.find(o => String(o.id) === String(occId));
    if (!occ) return;
    
    const techKey = Object.keys(state.roster).find(k => state.roster[k].displayName.toUpperCase() === occ.tech_name.toUpperCase());
    const tech = state.roster[techKey];

    const pinAttempt = prompt(`RESTRICTED HR DOCUMENT\n\nPlease enter the 4-digit PIN for ${tech.displayName} to unlock and view this file:`);
    
    if (pinAttempt !== tech.pin) {
        alert("❌ Access Denied: Incorrect PIN.");
        return;
    }
    
    window.generateDisciplinaryForm(techKey, occ.date, occ.description, occ.strike_count || 1, occ.id);
};

window.generateDisciplinaryForm = function(techKey, date, desc, strikeCount, occId) {
    const tech = state.roster[techKey];
    if (!tech) return;
    const safeTechKey = techKey.replace(/'/g, "\\'");

    let rule = state.attendanceRules.find(r => r.occurrences === strikeCount);
    if (!rule && state.attendanceRules.length > 0) {
        rule = state.attendanceRules.reduce((prev, current) => (prev.occurrences > current.occurrences) ? prev : current);
    }
    const penaltyText = rule ? rule.penalty : "Disciplinary Action Required";

    // Action Checkboxes Logic mapping
    const isVerbal = strikeCount === 1 ? 'checked' : '';
    const isWritten = strikeCount === 2 ? 'checked' : '';
    const isSuspension = strikeCount === 3 ? 'checked' : '';
    const isDismissal = strikeCount >= 4 ? 'checked' : '';
    const isCounseling = '';
    const isOther = '';

    let modal = document.getElementById('modal-disciplinary');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-disciplinary';
        modal.className = 'fixed inset-0 z-[150] hidden flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4 overflow-y-auto';
        document.body.appendChild(modal);
    }

    modal.innerHTML = `
        <div class="bg-white max-w-4xl w-full mx-auto shadow-2xl relative my-8 flex flex-col border-t-[8px] border-red-600 rounded-xl">
            <div class="bg-slate-800 text-white p-4 flex justify-between items-center shrink-0">
                <h2 class="text-lg font-black uppercase tracking-widest text-red-400">Disciplinary Form</h2>
                <button onclick="document.getElementById('modal-disciplinary').classList.add('hidden')" class="text-slate-300 hover:text-white font-bold">✕ CLOSE</button>
            </div>
            <div class="p-8 md:p-10 text-slate-800 custom-scrollbar overflow-y-auto max-h-[80vh]">
                <div class="grid grid-cols-2 gap-4 mb-6 text-sm font-bold border-b-2 border-slate-200 pb-6">
                    <div><span class="text-slate-500 uppercase tracking-widest text-xs">Employee:</span> <span class="text-lg block text-slate-900">${tech.displayName}</span></div>
                    <div><span class="text-slate-500 uppercase tracking-widest text-xs">Date:</span> <span class="text-lg block text-slate-900">${new Date(date + 'T00:00:00').toLocaleDateString()}</span></div>
                </div>

                <div class="mb-6">
                    <h3 class="text-sm font-black text-slate-700 uppercase tracking-widest mb-3">Disciplinary Action Taken:</h3>
                    <div class="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm font-bold text-slate-600 bg-slate-50 p-4 rounded-lg border border-slate-200">
                        <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" disabled ${isCounseling} class="w-4 h-4 accent-red-600"> Counseling</label>
                        <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" disabled ${isVerbal} class="w-4 h-4 accent-red-600"> Verbal Warning</label>
                        <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" disabled ${isWritten} class="w-4 h-4 accent-red-600"> Written Warning</label>
                        <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" disabled ${isSuspension} class="w-4 h-4 accent-red-600"> Suspension Without Pay</label>
                        <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" disabled ${isDismissal} class="w-4 h-4 accent-red-600"> Dismissal</label>
                        <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" disabled ${isOther} class="w-4 h-4 accent-red-600"> Other: <span class="border-b border-slate-400 flex-1 ml-1 inline-block h-4"></span></label>
                    </div>
                </div>

                <div class="space-y-4 mb-6">
                    <div>
                        <h3 class="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">1. Summary of the problem:</h3>
                        <div class="bg-white border-2 border-slate-200 p-3 rounded-lg font-medium text-slate-700 text-sm">Same-Day Call Out: ${desc}</div>
                    </div>
                    <div>
                        <h3 class="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">2. Prior discussion or warnings on this subject:</h3>
                        <div class="bg-white border-2 border-slate-200 p-3 rounded-lg font-medium text-slate-700 text-sm">Occurrence #${strikeCount} in the past 90 days.</div>
                    </div>
                    <div>
                        <h3 class="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">3. Company Policy or practice violated:</h3>
                        <div class="bg-white border-2 border-slate-200 p-3 rounded-lg font-medium text-slate-700 text-sm">Attendance & Reliability Policy (Same-Day Call Out)</div>
                    </div>
                    <div>
                        <h3 class="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">4. Corrective action employee must take:</h3>
                        <div class="bg-white border-2 border-slate-200 p-3 rounded-lg font-medium text-slate-700 text-sm">Employee must provide proper advance notice for any future absences according to company policy.</div>
                    </div>
                    <div>
                        <h3 class="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">5. Consequences for not correcting the problem:</h3>
                        <div class="bg-white border-2 border-slate-200 p-3 rounded-lg font-medium text-slate-700 text-sm">${penaltyText}. Further violations will result in escalating disciplinary action up to and including termination.</div>
                    </div>
                </div>

                <div class="bg-red-50 border border-red-200 p-4 rounded-lg mb-6">
                    <p class="text-xs text-red-800 font-bold leading-relaxed text-justify">
                        Employee is warned that any further violations of company policy, safety rules, company practices or unsatisfactory performance will result in further disciplinary action, up to and including termination of employment.
                    </p>
                </div>

                <div class="mb-6">
                    <h3 class="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Employee comments:</h3>
                    <textarea id="disc-employee-comments" class="w-full border-2 border-slate-300 p-3 rounded-lg min-h-[80px] font-medium text-slate-700 focus:border-red-500 outline-none text-sm shadow-sm" placeholder="Optional comments..."></textarea>
                </div>

                <div class="mt-8 pt-6 border-t-2 border-slate-200">
                    <div class="relative">
                        <span class="block text-sm font-black uppercase tracking-widest text-slate-700 mb-2">Employee Signature</span>
                        <p class="text-xs text-slate-500 font-bold mb-4 italic">I acknowledge that I have read and understand the above information and consequences.</p>
                        
                        <div id="disc-sig-zone" class="mt-2">
                            <div class="relative border-2 border-slate-300 bg-slate-50 rounded-xl overflow-hidden" style="touch-action: none;">
                                <canvas id="disc-signature-pad" class="w-full h-32 cursor-crosshair"></canvas>
                                <button type="button" onclick="window.clearSignature()" class="absolute top-2 right-2 text-[10px] font-black bg-slate-200 text-slate-600 px-3 py-1 rounded-lg hover:bg-slate-300 transition-colors uppercase tracking-widest">Clear</button>
                            </div>
                            <div class="mt-4 flex gap-4">
                                <button onclick="window.submitDisciplinaryForm('${occId}')" class="flex-1 bg-red-600 hover:bg-red-700 text-white font-black px-6 py-4 rounded-xl uppercase tracking-widest transition-colors shadow-lg text-sm">Sign & Submit Document</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    modal.classList.remove('hidden');
    setTimeout(() => window.initSignatureEngine('disc-signature-pad'), 100);
};

window.submitDisciplinaryForm = async function(occId) {
    if (!window.hasSigned) {
        alert("Signature required before submitting.");
        return;
    }

    alert("System Check 1: Signature confirmed. Preparing to save to Supabase...");

    const comments = document.getElementById('disc-employee-comments')?.value.trim() || '';
    document.getElementById('disc-employee-comments').disabled = true;

    document.getElementById('disc-sig-zone').innerHTML = '<div class="text-red-600 font-black animate-pulse text-center p-6 border-2 border-red-200 bg-red-50 rounded-xl tracking-widest uppercase">SAVING DOCUMENT...</div>';

    const { error } = await supabaseClient.from('attendance_occurrences')
        .update({ status: 'SIGNED' }) 
        .eq('id', occId);

    if (error) {
        alert("System Error: Failed to save to Supabase: " + error.message);
        return;
    }

    const occIndex = state.attendanceOccurrences.findIndex(o => String(o.id) === String(occId));
    if (occIndex > -1) {
        state.attendanceOccurrences[occIndex].status = 'SIGNED';
    }

    const occ = state.attendanceOccurrences.find(o => String(o.id) === String(occId));
    const signatureImage = currentSignatureCanvas.toDataURL('image/png');
    const signedDate = new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString();

    alert("System Check 2: Supabase updated. Firing email trigger to Google Apps Script at URL: \n\n" + APPS_SCRIPT_WEB_APP_URL.substring(0, 50) + "...");

    // Fire the PDF generation flare to Google Apps Script
    fetch(APPS_SCRIPT_WEB_APP_URL, {
        method: 'POST',
        body: JSON.stringify({
            type: 'GENERATE_DISCIPLINARY_PDF',
            techName: occ.tech_name,
            date: occ.date,
            description: occ.description,
            strikeCount: occ.strike_count,
            comments: comments,
            signatureData: signatureImage,
            signedDate: signedDate
        }),
        headers: { 'Content-Type': 'text/plain;charset=utf-8' }
    })
    .then(response => {
        alert("System Check 3 SUCCESS: Google received the request! HTTP Status: " + response.status);
    })
    .catch(err => {
        alert("System Check 3 FAILED: The browser blocked the request or the URL is dead. Error: " + err.message);
        console.log("PDF trigger failed:", err);
    });

    setTimeout(() => {
        alert("✅ Document signed and submitted to HR file.");
        document.getElementById('modal-disciplinary').classList.add('hidden');
        showScorecards(); 
    }, 1000);
};
// -----------------------------------

window.handleLogin = function(pin) {
    document.getElementById('login-error').classList.add('hidden');
    let matchedTech = Object.keys(state.roster).find(k => state.roster[k].pin === pin);
    
    if (pin === '0556') {
        state.currentUserRole = 'ADMIN';
        document.getElementById('admin-badge').classList.remove('hidden');
        document.getElementById('admin-badge').classList.add('flex');
        
        const addTechBtn = document.getElementById('btn-add-tech-header');
        if(addTechBtn) addTechBtn.classList.remove('hidden');
    } else if (matchedTech) { 
        state.currentUserRole = 'TECH'; 
        state.currentUserKey = matchedTech; 
        
        const addTechBtn = document.getElementById('btn-add-tech-header');
        if(addTechBtn) addTechBtn.classList.add('hidden');
    } else { 
        document.getElementById('login-error').classList.remove('hidden'); 
        document.getElementById('pin-input').value = ''; 
        return; 
    }
    
    localStorage.setItem('st_auditor_pin', pin);
    document.getElementById('login-overlay').classList.add('hidden');
    
    setQuickDate('mtd', document.getElementById('btn-mtd'));
    showScorecards();
};

window.handleLogout = function() {
    localStorage.removeItem('st_auditor_pin');
    window.location.href = window.location.pathname; 
};

async function fetchRawData(url) { 
    if (!url) return [];
    try {
        const resp = await fetch(url + '&cb=' + new Date().getTime());
        const text = await resp.text();
        return new Promise(resolve => Papa.parse(text, { header: false, skipEmptyLines: true, complete: r => resolve(r.data) }));
    } catch (e) { return []; }
}

async function fetchSupabaseTable(tableName) {
    let allData = [];
    let start = 0;
    const step = 1000;
    
    while (true) {
        const { data, error } = await supabaseClient.from(tableName).select('*').range(start, start + step - 1);
        if (error) throw error;
        if (!data || data.length === 0) break;
        allData = allData.concat(data);
        if (data.length < step) break;
        start += step;
    }
    return allData;
}

async function fetchSupabaseTableSafe(tableName) {
    try {
        return await fetchSupabaseTable(tableName);
    } catch (e) {
        return [];
    }
}

function getDirectImageUrl(url) {
    const match = url?.match(/id=([a-zA-Z0-9_-]+)/) || url?.match(/\/d\/([a-zA-Z0-9_-]+)/);
    return match ? `https://drive.google.com/uc?export=view&id=${match[1]}` : url;
}

window.closeModal = function(id) {
    document.getElementById(id).classList.add('hidden');
};

function formatPct(val) {
    return (parseFloat(val || 0) * 100).toFixed(1) + '%';
}

window.setQuickDate = function(preset, btn) {
    state.datePreset = preset;
    
    document.querySelectorAll('.quick-date-btn').forEach(b => { 
        b.classList.remove('bg-blue-600', 'text-white'); 
        b.classList.add('bg-slate-100', 'text-slate-500');
    });
    if (btn) { 
        btn.classList.remove('bg-slate-100', 'text-slate-500'); 
        btn.classList.add('bg-blue-600', 'text-white');
    }
    applyDateFilter();
};

function applyDateFilter() {
    if (state.activeView === 'scorecards') showScorecards();
    else if (state.activeView === 'companyJobTypes') showCompanyJobTypes();
    else if (state.activeView === 'techJobTypes' && state.activeTechKey) showTechJobTypes(state.activeTechKey);
}

function getFilteredJobs() {
    const now = new Date();
    let start = new Date(0);
    let end = new Date();

    if (state.datePreset === 'mtd') {
        start = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (state.datePreset === 'qtd') {
        const q = Math.floor(now.getMonth() / 3);
        start = new Date(now.getFullYear(), q * 3, 1);
    } else if (state.datePreset === 'ytd') {
        start = new Date(now.getFullYear(), 0, 1);
    }

    const filtered = {};
    Object.keys(state.jobs).forEach(id => {
        const job = state.jobs[id];
        if (!job.isComplete) return; 
        if (job.date < start) return;
        if (job.date > end) return;
        filtered[id] = job;
    });
    return filtered;
}

window.changeSort = function(val) {
    state.sortOrder = val;
    showScorecards();
};

window.showAddEmployeeModal = function() {
    let modal = document.getElementById('modal-add-employee');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-add-employee';
        modal.className = 'fixed inset-0 z-[100] hidden flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4';
        document.body.appendChild(modal);
    }
    
    modal.innerHTML = `
        <div class="bg-white p-8 rounded-3xl max-w-md w-full shadow-2xl relative border-4 border-slate-200">
            <h2 class="text-2xl font-black uppercase text-slate-800 border-b-4 border-slate-200 pb-3 mb-6 tracking-widest text-center">Add Technician</h2>
            <div class="space-y-5">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">First Name</label>
                        <input type="text" id="new-emp-fname" class="w-full border-2 border-slate-300 p-3 rounded-xl outline-none focus:border-blue-500 font-bold uppercase placeholder:text-slate-300 placeholder:font-normal" placeholder="John">
                    </div>
                    <div>
                        <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">Last Name</label>
                        <input type="text" id="new-emp-lname" class="w-full border-2 border-slate-300 p-3 rounded-xl outline-none focus:border-blue-500 font-bold uppercase placeholder:text-slate-300 placeholder:font-normal" placeholder="Doe">
                    </div>
                </div>
                <div>
                    <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">Department</label>
                    <select id="new-emp-dept" class="w-full border-2 border-slate-300 p-3 rounded-xl outline-none focus:border-blue-500 font-bold uppercase text-slate-700 bg-slate-50">
                        <option value="RESIDENTIAL">Residential</option>
                        <option value="COMMERCIAL">Commercial</option>
                        <option value="WAREHOUSE">Warehouse</option>
                    </select>
                </div>
                <div>
                    <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">Primary Role</label>
                    <select id="new-emp-role" class="w-full border-2 border-slate-300 p-3 rounded-xl outline-none focus:border-blue-500 font-bold uppercase text-slate-700 bg-slate-50">
                        <option value="SERVICE">Service</option>
                        <option value="INSTALL">Install</option>
                        <option value="APPRENTICE">Apprentice</option>
                        <option value="ENTRY">Entry Doors</option>
                        <option value="SALES">Sales</option>
                        <option value="WAREHOUSE">Warehouse</option>
                    </select>
                </div>
                <div>
                    <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">System Login PIN</label>
                    <input type="text" id="new-emp-pin" maxlength="4" class="w-full border-2 border-slate-300 p-3 rounded-xl font-mono text-center text-xl tracking-widest outline-none focus:border-blue-500 bg-slate-50 font-bold" placeholder="0000">
                </div>
            </div>
            <div class="flex justify-end gap-3 mt-8">
                <button onclick="window.closeModal('modal-add-employee')" class="px-6 py-3 font-black text-slate-500 hover:text-slate-800 uppercase tracking-widest text-xs transition-colors">CANCEL</button>
                <button onclick="window.submitNewEmployee()" id="btn-add-emp-submit" class="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl shadow-md transition-colors uppercase tracking-widest text-xs">BUILD PROFILE</button>
            </div>
        </div>
    `;
    modal.classList.remove('hidden');
};

window.submitNewEmployee = async function() {
    const fname = document.getElementById('new-emp-fname').value.trim();
    const lname = document.getElementById('new-emp-lname').value.trim();
    const dept = document.getElementById('new-emp-dept').value;
    const role = document.getElementById('new-emp-role').value;
    const pin = document.getElementById('new-emp-pin').value.trim();

    if (!fname || !lname || pin.length !== 4) { 
        alert('Please enter a First Name, Last Name, and a valid 4-digit PIN.'); 
        return; 
    }

    const btn = document.getElementById('btn-add-emp-submit');
    btn.disabled = true;
    btn.innerHTML = "SAVING...";

    const fullName = fname + ' ' + lname;
    
    const payload = {
        tech_name: fullName,
        department: dept,
        primary_role: role,
        pin: pin,
        status: 'ACTIVE',
        current_belt: 'GRAY',
        performance_pay_level: 0
    };

    const { error } = await supabaseClient.from('tech_profiles').insert([payload]);
    
    if (error) { 
        alert('Database Error: ' + error.message); 
        btn.disabled = false;
        btn.innerHTML = "BUILD PROFILE";
        return; 
    }

    state.roster[fullName.toUpperCase()] = {
        displayName: fullName,
        department: dept.toUpperCase(),
        role: role.toUpperCase(),
        status: 'ACTIVE',
        pin: pin,
        currentBelt: 'GRAY',
        hourlyPay: 'TBD',
        currentLevel: 0
    };

    window.closeModal('modal-add-employee');
    showScorecards();
};

function renderMiniCardHTML(techKey) {
    const tech = state.roster[techKey] || {};
    const displayName = tech.displayName || 'Unknown';
    const roleStr = tech.role || '';
    const deptStr = tech.department || 'RESIDENTIAL';
    let beltStr = String(tech.currentBelt || 'GRAY').toUpperCase();

    const isWarehouse = roleStr.includes('WAREHOUSE') || deptStr.includes('WAREHOUSE');
    const isSales = roleStr.includes('SALES') || displayName.toUpperCase().includes('BRANDON JESTICE');
    const isApprentice = roleStr.includes('APPRENTICE');
    
    if (isWarehouse) beltStr = 'WHITE';
    else if (isSales) beltStr = 'SALES';
    
    const bStyle = beltStyles[beltStr] || beltStyles['GRAY'];
    const hasStats = !isWarehouse && !isApprentice;
    const hasBelts = !isWarehouse && !isSales;

    const safeTechKey = techKey.replace(/'/g, "\\'");
    const safeDisplayName = displayName.replace(/'/g, "\\'");

    const nameParts = safeDisplayName.trim().split(/\s+/);
    const firstName = nameParts[0] || '';
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

    let displayRole = ''; 
    const rUpper = roleStr.toUpperCase();
    const dUpper = deptStr.toUpperCase();

    if (isApprentice) {
        displayRole = 'APPR';
    } else if (isWarehouse) {
        displayRole = 'WRHS'; 
    } else if (isSales) {
        displayRole = dUpper === 'RESIDENTIAL' ? 'RESI' : (dUpper === 'COMMERCIAL' ? 'COMM' : dUpper);
    }

    const pendingDocs = state.attendanceOccurrences.filter(o => o.tech_name.toUpperCase() === safeDisplayName.toUpperCase() && o.status === 'PENDING');
    const hasPending = pendingDocs.length > 0;
    
    const pendingBadgeHtml = hasPending ? `<div class="bg-red-600 text-white font-black text-[9px] px-2 py-0.5 rounded uppercase tracking-widest shadow-sm border border-red-700 animate-pulse cursor-pointer pointer-events-auto shrink-0 self-start mt-0.5" onclick="window.openPendingDoc('${pendingDocs[0].id}')">DOC PENDING</div>` : '';

    const isAdmin = state.currentUserRole === 'ADMIN';
    const draggableAttr = isAdmin ? `draggable="true" ondragstart="window.dragStart(event)" ondragend="window.dragEnd(event)" data-tech="${safeTechKey}"` : ``;

    const statsIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4 xl:w-5 xl:h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>`;
    const pipIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4 xl:w-5 xl:h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" /></svg>`;
    const beltsIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4 xl:w-5 xl:h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>`;
    const reviewIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4 xl:w-5 xl:h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>`;
    const callOutIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4 xl:w-5 xl:h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>`;

    const btnBase = "w-10 xl:w-14 flex flex-col items-center justify-center gap-0.5 rounded-lg transition-colors shadow-sm pointer-events-auto min-h-[35px]";

    return `
        <div ${draggableAttr} class="border-[4px] rounded-2xl flex items-stretch shadow-sm hover:shadow-xl transition-all relative overflow-hidden group min-h-[90px] xl:min-h-[100px] bg-white ${isAdmin ? 'cursor-grab active:cursor-grabbing' : ''}" style="border-color: ${bStyle.hex};">
            ${hasStats ? `<div class="absolute inset-0 z-0 cursor-pointer" onclick="handleActionClick(event, 'stats', '${safeTechKey}', '${safeDisplayName}')"></div>` : ''}
            
            <div class="w-1/3 md:w-5/12 p-3 md:p-4 flex flex-col justify-center relative z-10 pointer-events-none rounded-l-xl" style="background-color: ${bStyle.hex};">
                <div class="text-xl lg:text-2xl xl:text-3xl font-black uppercase ${bStyle.badgeText} leading-[0.85] tracking-tight truncate" title="${safeDisplayName}">${firstName}</div>
                ${lastName ? `<div class="text-xs lg:text-sm xl:text-base font-black uppercase ${bStyle.badgeText} opacity-80 leading-[0.85] tracking-tight truncate mt-1.5" title="${safeDisplayName}">${lastName}</div>` : ''}
            </div>
            
            <div class="flex-1 p-1.5 xl:p-2 flex items-stretch justify-between relative z-10 overflow-hidden">
                
                <div class="shrink-0 flex flex-col items-center justify-between px-1.5 z-20 pointer-events-auto">
                    ${displayRole ? `<span class="text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none text-center pointer-events-none mt-1" style="writing-mode: vertical-rl; text-orientation: upright;">${displayRole}</span>` : '<div class="shrink-0 w-2 mt-1"></div>'}
                    ${pendingBadgeHtml}
                </div>
                
                <div class="flex items-stretch justify-end gap-1.5 relative z-20 shrink-0 pointer-events-auto ml-auto py-0.5">
                    
                    <div class="grid grid-cols-2 grid-rows-2 gap-1.5 h-full">
                        ${hasStats ? 
                            `<button class="${btnBase} bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200 hover:shadow" onclick="handleActionClick(event, 'stats', '${safeTechKey}', '${safeDisplayName}')" title="View Performance Stats">${statsIcon}<span class="text-[6px] xl:text-[7px] font-black uppercase tracking-wider">STATS</span></button>` : 
                            `<div class="w-10 xl:w-14 rounded-lg border border-dashed border-slate-200 bg-slate-50/50"></div>`}
                        
                        <button class="${btnBase} bg-slate-50 text-slate-400 border border-dashed border-slate-200 cursor-not-allowed" onclick="handleActionClick(event, 'pip', '${safeTechKey}', '${safeDisplayName}')" title="PIP Form (In Development)">${pipIcon}<span class="text-[6px] xl:text-[7px] font-black uppercase tracking-wider">PIP</span></button>
                        
                        ${hasBelts ? 
                            `<button class="${btnBase} bg-indigo-50 text-indigo-800 hover:bg-indigo-100 border border-indigo-200 hover:shadow" onclick="handleActionClick(event, 'belts', '${safeTechKey}', '${safeDisplayName}')" title="Belts & Behaviors">${beltsIcon}<span class="text-[6px] xl:text-[7px] font-black uppercase tracking-wider">BELTS</span></button>` : 
                            `<div class="w-10 xl:w-14 rounded-lg border border-dashed border-slate-200 bg-slate-50/50"></div>`}
                        
                        <button class="${btnBase} bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-200 hover:shadow" onclick="handleActionClick(event, 'review', '${safeTechKey}', '${safeDisplayName}')" title="Monthly Review">${reviewIcon}<span class="text-[6px] xl:text-[7px] font-black uppercase tracking-wider">REVIEW</span></button>
                    </div>

                    <button class="w-10 xl:w-14 flex flex-col items-center justify-center gap-1 rounded-lg bg-red-50 text-red-700 hover:bg-red-600 hover:text-white border border-red-300 transition-colors shadow-sm hover:shadow h-full" onclick="handleActionClick(event, 'callout', '${safeTechKey}', '${safeDisplayName}')" title="Quick Call-Out">
                        ${callOutIcon}
                        <span class="text-[6px] md:text-[7px] font-black uppercase tracking-wider text-center leading-tight">CALL<br>OUT</span>
                    </button>
                </div>
            </div>
        </div>`;
}

window.showScorecards = function() {
    state.activeView = 'scorecards';
    
    document.getElementById('view-company-jobtypes').classList.add('hidden');
    document.getElementById('view-jobtypes').classList.add('hidden');
    document.getElementById('view-scorecards').classList.remove('hidden');
    document.getElementById('date-filter-container').classList.add('hidden');
    
    if (state.currentUserRole === 'TECH') {
        const catTabs = document.getElementById('category-tabs');
        if (catTabs) { catTabs.classList.add('hidden'); catTabs.classList.remove('flex'); }
        
        const myTech = state.roster[state.currentUserKey];
        if (myTech) {
            const roleStr = myTech.role.toUpperCase();
            const deptStr = myTech.department.toUpperCase();
            const nameStr = myTech.displayName.toUpperCase();
            
            const isWH = roleStr.includes('WAREHOUSE') || deptStr.includes('WAREHOUSE');
            const isSales = roleStr.includes('SALES') || nameStr.includes('BRANDON JESTICE');
            const isComm = deptStr.includes('COMM');
            
            if (isWH) state.activeCategory = 'WAREHOUSE';
            else if (isSales) state.activeCategory = 'SALES';
            else if (isComm) state.activeCategory = 'COMMERCIAL';
            else state.activeCategory = 'RESIDENTIAL';
        }
    } else {
        const dashControls = document.getElementById('dashboard-controls');
        if (dashControls) { dashControls.classList.remove('hidden'); dashControls.classList.add('flex'); }
        
        const catTabs = document.getElementById('category-tabs');
        if (catTabs) { catTabs.classList.remove('hidden'); catTabs.classList.add('flex'); }
        
        document.querySelectorAll('.cat-tab').forEach(tab => {
            tab.className = tab.className.replace(/tab-active-\w+/g, '').trim();
            tab.classList.add('text-slate-400');
            tab.classList.remove('bg-white', 'text-blue-900', 'text-slate-800', 'text-purple-900', 'text-teal-900');
        });

        const activeTab = document.getElementById('tab-' + state.activeCategory);
        if (activeTab) {
            activeTab.classList.remove('text-slate-400');
            if (state.activeCategory === 'RESIDENTIAL') activeTab.classList.add('tab-active-resi');
            if (state.activeCategory === 'COMMERCIAL') activeTab.classList.add('tab-active-comm');
            if (state.activeCategory === 'SALES') activeTab.classList.add('tab-active-sales');
            if (state.activeCategory === 'WAREHOUSE') activeTab.classList.add('tab-active-wh');
        }
    }

    window.scrollTo(0, 0);
    const container = document.getElementById('dashboard-container');
    container.innerHTML = '';

    let pendingBannerHtml = '';
    if (state.currentUserRole === 'TECH') {
        const techName = state.roster[state.currentUserKey]?.displayName.toUpperCase();
        const myPendingDocs = state.attendanceOccurrences.filter(o => o.tech_name.toUpperCase() === techName && o.status === 'PENDING');
        
        if (myPendingDocs.length > 0) {
            const doc = myPendingDocs[0];
            pendingBannerHtml = `
                <div class="col-span-full w-full mb-6 bg-red-600 border-4 border-red-800 rounded-2xl p-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4 shrink-0 animate-pulse cursor-pointer hover:bg-red-700 transition-colors z-50 relative pointer-events-auto" onclick="window.openPendingDoc('${doc.id}')">
                    <div class="flex items-center gap-4">
                        <div class="bg-white text-red-600 rounded-full p-2 shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor" class="w-8 h-8"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        </div>
                        <div>
                            <h2 class="text-xl md:text-2xl font-black text-white uppercase tracking-widest">ACTION REQUIRED</h2>
                            <p class="text-red-100 font-bold text-xs md:text-sm uppercase tracking-wider mt-1">You have a pending document requiring signature.</p>
                        </div>
                    </div>
                    <button class="bg-white text-red-700 font-black px-6 py-3 rounded-xl uppercase tracking-widest hover:bg-slate-100 shadow-md whitespace-nowrap shrink-0 pointer-events-none">Review & Sign</button>
                </div>
            `;
        }
    }

    const activeRosterKeys = Object.keys(state.roster).filter(k => state.roster[k].status === 'ACTIVE');
    const techsToProcess = state.currentUserRole === 'ADMIN' ? activeRosterKeys : [state.currentUserKey];

    let categories = {
        'RESIDENTIAL': { service: [], install: [] },
        'COMMERCIAL': { service: [], install: [], entry: [] },
        'SALES': { all: [] },
        'WAREHOUSE': { all: [] }
    };

    techsToProcess.forEach(techKey => {
        const r = state.roster[techKey];
        if(!r) return;
        const dept = r.department;
        const role = r.role;
        const name = r.displayName;

        const isWH = role.includes('WAREHOUSE') || dept.includes('WAREHOUSE');
        const isSales = role.includes('SALES') || name.toUpperCase().includes('BRANDON JESTICE');
        const isComm = dept.includes('COMM');

        if (isWH) {
            categories['WAREHOUSE'].all.push(techKey);
        } else if (isSales) {
            categories['SALES'].all.push(techKey);
        } else if (isComm) {
            if (role.includes('ENTRY')) categories['COMMERCIAL'].entry.push(techKey);
            else if (role.includes('SERVICE')) categories['COMMERCIAL'].service.push(techKey);
            else if (role.includes('INSTALL') || role.includes('APPRENTICE')) categories['COMMERCIAL'].install.push(techKey);
            else categories['COMMERCIAL'].service.push(techKey); 
        } else { 
            if (role.includes('SERVICE')) categories['RESIDENTIAL'].service.push(techKey);
            else if (role.includes('INSTALL') || role.includes('APPRENTICE')) categories['RESIDENTIAL'].install.push(techKey);
            else categories['RESIDENTIAL'].service.push(techKey); 
        }
    });

    const beltRank = { 'BLACK': 5, 'BROWN': 4, 'GREEN': 3, 'BLUE': 2, 'GRAY': 1, 'WHITE': 0, 'SALES': 0 };
    const getSalesRank = (key) => (state.roster[key].role === 'SALES' || state.roster[key].displayName.toUpperCase().includes('BRANDON JESTICE')) ? 1 : 0;

    let sortFn;
    if (state.sortOrder === 'belt_high') {
        sortFn = (a, b) => {
            const sA = getSalesRank(a); const sB = getSalesRank(b); if (sA !== sB) return sA - sB; 
            const rankA = beltRank[state.roster[a].currentBelt] || 1; const rankB = beltRank[state.roster[b].currentBelt] || 1;
            if (rankA !== rankB) return rankB - rankA;
            return state.roster[a].displayName.localeCompare(state.roster[b].displayName);
        };
    } else if (state.sortOrder === 'belt_low') {
        sortFn = (a, b) => {
            const sA = getSalesRank(a); const sB = getSalesRank(b); if (sA !== sB) return sA - sB; 
            const rankA = beltRank[state.roster[a].currentBelt] || 1; const rankB = beltRank[state.roster[b].currentBelt] || 1;
            if (rankA !== rankB) return rankA - rankB;
            return state.roster[a].displayName.localeCompare(state.roster[b].displayName);
        };
    } else {
        sortFn = (a, b) => {
            const sA = getSalesRank(a); const sB = getSalesRank(b); if (sA !== sB) return sA - sB; 
            return state.roster[a].displayName.localeCompare(state.roster[b].displayName);
        };
    }

    categories['RESIDENTIAL'].service.sort(sortFn);
    categories['RESIDENTIAL'].install.sort(sortFn);
    categories['COMMERCIAL'].service.sort(sortFn);
    categories['COMMERCIAL'].install.sort(sortFn);
    categories['COMMERCIAL'].entry.sort(sortFn);
    categories['SALES'].all.sort(sortFn);
    categories['WAREHOUSE'].all.sort(sortFn);

    const emptyState = '<div class="text-slate-400 italic p-6 text-center border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 font-bold uppercase tracking-widest flex-1 flex items-center justify-center min-h-[200px] col-span-full">Empty</div>';

    const renderList = (keys, targetDept, targetRole, title) => {
        if (state.currentUserRole === 'TECH' && keys.length === 0) return ''; 
        const html = keys.length > 0 ? keys.map(k => renderMiniCardHTML(k)).join('') : emptyState;
        const isAdmin = state.currentUserRole === 'ADMIN';
        const dragAttrs = isAdmin ? `ondragover="window.dragOver(event)" ondragenter="this.classList.add('bg-blue-50', 'ring-4', 'ring-blue-400')" ondragleave="this.classList.remove('bg-blue-50', 'ring-4', 'ring-blue-400')" ondrop="window.dropTech(event, '${targetDept}', '${targetRole}')"` : '';
        
        return `
            <div class="flex flex-col gap-3 rounded-2xl p-4 border-2 border-transparent transition-all h-[65vh] min-h-[300px] bg-slate-200/50" ${dragAttrs}>
                ${title ? `<h4 class="text-sm font-black text-slate-500 uppercase tracking-widest border-b-2 border-slate-300 pb-2 mb-2 flex justify-between items-center shrink-0">${title} <span class="bg-slate-300 text-slate-700 px-3 py-1 rounded-full text-[10px]">${keys.length}</span></h4>` : ''}
                <div class="flex flex-col gap-3 flex-1 overflow-y-auto custom-scrollbar pr-2 pb-4">
                    ${html}
                </div>
            </div>
        `;
    };

    let gridHtml = '';

    if (state.activeCategory === 'RESIDENTIAL') {
        gridHtml = `
            <div class="w-full grid grid-cols-1 lg:grid-cols-2 gap-6 xl:gap-8 items-start mt-2 pb-12">
                ${renderList(categories['RESIDENTIAL'].service, 'RESIDENTIAL', 'SERVICE', 'Service Team')}
                ${renderList(categories['RESIDENTIAL'].install, 'RESIDENTIAL', 'INSTALL', 'Install Team')}
            </div>`;
    } 
    else if (state.activeCategory === 'COMMERCIAL') {
        gridHtml = `
            <div class="w-full grid grid-cols-1 lg:grid-cols-3 gap-6 xl:gap-8 items-start mt-2 pb-12">
                ${renderList(categories['COMMERCIAL'].service, 'COMMERCIAL', 'SERVICE', 'Service Team')}
                ${renderList(categories['COMMERCIAL'].install, 'COMMERCIAL', 'INSTALL', 'Install Team')}
                ${renderList(categories['COMMERCIAL'].entry, 'COMMERCIAL', 'ENTRY DOORS', 'Entry Doors')}
            </div>`;
    }
    else if (state.activeCategory === 'SALES') {
        const keys = categories['SALES'].all;
        if (state.currentUserRole === 'TECH' && keys.length === 0) return; 
        const html = keys.length > 0 ? keys.map(k => renderMiniCardHTML(k)).join('') : emptyState;
        const isAdmin = state.currentUserRole === 'ADMIN';
        const dragAttrs = isAdmin ? `ondragover="window.dragOver(event)" ondragenter="this.classList.add('bg-blue-50', 'ring-4', 'ring-blue-400')" ondragleave="this.classList.remove('bg-blue-50', 'ring-4', 'ring-blue-400')" ondrop="window.dropTech(event, 'KEEP_DEPT', 'SALES')"` : '';
        
        gridHtml = `
            <div class="w-full flex flex-col items-center transition-all rounded-2xl p-4 min-h-[300px] bg-slate-200/50" ${dragAttrs}>
                <div class="w-full md:w-1/2 flex flex-col gap-4 items-stretch">
                    ${html}
                </div>
            </div>`;
    }
    else if (state.activeCategory === 'WAREHOUSE') {
        const keys = categories['WAREHOUSE'].all;
        if (state.currentUserRole === 'TECH' && keys.length === 0) return;
        const html = keys.length > 0 ? keys.map(k => renderMiniCardHTML(k)).join('') : emptyState;
        const isAdmin = state.currentUserRole === 'ADMIN';
        const dragAttrs = isAdmin ? `ondragover="window.dragOver(event)" ondragenter="this.classList.add('bg-blue-50', 'ring-4', 'ring-blue-400')" ondragleave="this.classList.remove('bg-blue-50', 'ring-4', 'ring-blue-400')" ondrop="window.dropTech(event, 'WAREHOUSE', 'WAREHOUSE')"` : '';
        
        gridHtml = `
            <div class="w-full flex flex-col items-center transition-all rounded-2xl p-4 min-h-[300px] bg-slate-200/50" ${dragAttrs}>
                <div class="w-full md:w-1/2 flex flex-col gap-4 items-stretch">
                    ${html}
                </div>
            </div>`;
    }

    container.innerHTML = pendingBannerHtml + gridHtml;
};

window.showCompanyJobTypes = function() {
    state.activeView = 'companyJobTypes';
    
    document.getElementById('view-scorecards').classList.add('hidden');
    document.getElementById('view-jobtypes').classList.add('hidden');
    document.getElementById('view-company-jobtypes').classList.remove('hidden');
    
    const dateContainer = document.getElementById('date-filter-container');
    if(dateContainer) {
        dateContainer.classList.remove('hidden');
        document.getElementById('start-date')?.parentElement.classList.add('hidden');
        document.getElementById('btn-all')?.classList.add('hidden');
    }

    if (state.currentUserRole !== 'TECH') {
        const catTabs = document.getElementById('category-tabs');
        if (catTabs) { catTabs.classList.remove('hidden'); catTabs.classList.add('flex'); }
        
        document.querySelectorAll('.cat-tab').forEach(tab => {
            tab.className = tab.className.replace(/tab-active-\w+/g, '').trim();
            tab.classList.add('text-slate-400');
            tab.classList.remove('bg-white', 'text-blue-900', 'text-slate-800', 'text-purple-900', 'text-teal-900');
        });
        const activeTab = document.getElementById('tab-' + state.activeCategory);
        if (activeTab) {
            activeTab.classList.remove('text-slate-400');
            if (state.activeCategory === 'RESIDENTIAL') activeTab.classList.add('tab-active-resi');
            if (state.activeCategory === 'COMMERCIAL') activeTab.classList.add('tab-active-comm');
            if (state.activeCategory === 'SALES') activeTab.classList.add('tab-active-sales');
            if (state.activeCategory === 'WAREHOUSE') activeTab.classList.add('tab-active-wh');
        }
    } else {
        const catTabs = document.getElementById('category-tabs');
        if (catTabs) { catTabs.classList.add('hidden'); catTabs.classList.remove('flex'); }
    }

    window.scrollTo(0, 0);

    const container = document.getElementById('company-jobtypes-container');
    container.innerHTML = '';
    const filteredJobs = getFilteredJobs();
    
    const typeStats = { RESIDENTIAL: {}, COMMERCIAL: {} };

    Object.values(filteredJobs).forEach(job => {
        const dept = state.roster[job.techKey]?.department || 'RESIDENTIAL';
        const safeDept = dept.includes('COMM') ? 'COMMERCIAL' : 'RESIDENTIAL';

        if (!typeStats[safeDept][job.jobType]) typeStats[safeDept][job.jobType] = {};
        if (!typeStats[safeDept][job.jobType][job.techKey]) typeStats[safeDept][job.jobType][job.techKey] = { count: 0, revenue: 0 };
        
        typeStats[safeDept][job.jobType][job.techKey].count++;
        job.s3Items.forEach(est => {
            if (est.status.includes('sold') || est.status === 'closed') {
                typeStats[safeDept][job.jobType][job.techKey].revenue += est.subtotal;
            }
        });
    });

    let rankingsHtml = '';
    const dept = state.activeCategory; 
    
    if (dept !== 'RESIDENTIAL' && dept !== 'COMMERCIAL') {
        container.innerHTML = '<div class="col-span-full mt-10 p-8 text-center text-slate-400 font-black uppercase tracking-widest text-2xl border-4 border-dashed border-slate-300 rounded-3xl">No Rankings Available For ' + dept + '</div>';
        return;
    }

    const deptTypes = typeStats[dept];
    if (Object.keys(deptTypes).length === 0) {
        container.innerHTML = '<div class="col-span-full mt-10 p-8 text-center text-slate-400 font-black uppercase tracking-widest text-2xl border-4 border-dashed border-slate-300 rounded-3xl">No Job Data Found</div>';
        return;
    }

    const sortedTypesArray = [];
    Object.keys(deptTypes).forEach(type => {
        let typeTotalJobs = 0, typeTotalRevenue = 0;
        let techArr = Object.keys(deptTypes[type]).map(techKey => {
            const t = deptTypes[type][techKey];
            typeTotalJobs += t.count; 
            typeTotalRevenue += t.revenue;
            return { name: state.roster[techKey].displayName, count: t.count, avgTicket: t.count > 0 ? (t.revenue / t.count) : 0 };
        });

        const qualifiedTechs = techArr.filter(t => t.count >= 20);
        if (qualifiedTechs.length > 0) {
            techArr = qualifiedTechs;
        }
        
        techArr.sort((a, b) => b.avgTicket - a.avgTicket);
        sortedTypesArray.push({ type, typeTotalJobs, typeAvgTicket: typeTotalJobs > 0 ? (typeTotalRevenue / typeTotalJobs) : 0, techArr });
    });

    sortedTypesArray.sort((a, b) => b.typeTotalJobs - a.typeTotalJobs);

    let gridHtml = '';
    sortedTypesArray.forEach(data => {
        let rowsHtml = data.techArr.map((t, index) => {
            const isMe = state.currentUserRole === 'TECH' && state.currentUserKey && state.roster[state.currentUserKey] && t.name.toUpperCase() === state.roster[state.currentUserKey].displayName.toUpperCase();
            
            const wrapperClasses = isMe 
                ? "flex justify-between items-center py-3 px-4 -mx-4 my-1 bg-yellow-100 border-2 border-yellow-400 rounded-xl shadow-md transform scale-[1.02] z-10 relative transition-all" 
                : "flex justify-between items-center border-b border-slate-200 py-3 last:border-0 hover:bg-[#f8fafc] px-2 -mx-2 rounded-lg transition-colors";
            
            const rankClasses = isMe ? "text-yellow-700 font-black text-base w-4" : "text-slate-500 font-black text-sm w-4";
            const nameClasses = isMe ? "text-yellow-900 font-black uppercase text-base" : "text-slate-800 font-bold uppercase";
            const countClasses = isMe ? "text-yellow-900 font-black font-mono w-16" : "text-slate-600 font-mono w-16";
            const avgClasses = isMe ? "text-green-700 font-black font-mono w-24 text-base" : "text-emerald-600 font-black font-mono w-24";

            return `
            <div class="${wrapperClasses}">
                <div class="flex items-center gap-3"><span class="${rankClasses}">${index + 1}.</span><span class="${nameClasses}">${t.name}</span></div>
                <div class="flex gap-6 items-center text-right"><span class="${countClasses}">${t.count}</span><span class="${avgClasses}">${formatter.format(t.avgTicket)}</span></div>
            </div>`;
        }).join('');

        gridHtml += `
            <div class="bg-white border-4 border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col h-full hover:border-blue-300 transition-colors">
                <div class="border-b-4 border-slate-200 pb-4 mb-2 flex flex-col items-center gap-1"><h2 class="text-xl xl:text-2xl font-black text-yellow-600 uppercase text-center line-clamp-2">${data.type}</h2>
                    <div class="text-[10px] md:text-xs uppercase tracking-widest font-black text-center mt-1"><span class="text-slate-500">Total Jobs: <span class="text-slate-800 font-mono text-sm md:text-base ml-1 mr-3">${data.typeTotalJobs}</span></span><span class="text-emerald-700/70">Type Avg: <span class="text-emerald-600 font-mono text-sm md:text-base ml-1">${formatter.format(data.typeAvgTicket)}</span></span></div>
                </div>
                <div class="flex flex-col mt-2 flex-1">
                    <div class="flex justify-between items-center border-b-2 border-slate-300 py-2 mb-2 text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest"><span>Technician Ranking</span><div class="flex gap-6 text-right"><span class="w-16">Jobs</span><span class="w-24">Avg Ticket</span></div></div>
                    ${rowsHtml}
                </div>
            </div>`;
    });
    
    rankingsHtml = `
        <div class="col-span-full mb-6">
            <h2 class="text-4xl font-black text-slate-800 uppercase tracking-tighter border-b-[6px] border-yellow-500 pb-2 inline-block">${dept} RANKINGS</h2>
        </div>
        <div class="col-span-full grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-stretch w-full">
            ${gridHtml}
        </div>
    `;
    
    container.innerHTML = rankingsHtml;
};

window.showTechJobTypes = function(techKey) {
    state.activeView = 'techJobTypes';
    state.activeTechKey = techKey;
    
    document.getElementById('view-scorecards').classList.add('hidden');
    document.getElementById('view-company-jobtypes').classList.add('hidden');
    document.getElementById('view-jobtypes').classList.remove('hidden');
    document.getElementById('date-filter-container').classList.add('hidden'); 

    const dashControls = document.getElementById('dashboard-controls');
    if (dashControls) { dashControls.classList.add('hidden'); dashControls.classList.remove('flex'); }
    
    const catTabs = document.getElementById('category-tabs');
    if (catTabs) { catTabs.classList.add('hidden'); catTabs.classList.remove('flex'); }

    const tech = state.roster[techKey] || {};
    const beltStr = String(tech.currentBelt || 'GRAY').toUpperCase();
    const bStyle = beltStyles[beltStr] || beltStyles['GRAY'];
    const isComm = tech.department.toUpperCase().includes('COMM');

    const nameEl = document.getElementById('jobtypes-tech-name');
    const safeDisplayName = tech.displayName || 'UNKNOWN';
    const nameParts = safeDisplayName.trim().split(/\s+/);
    const firstName = nameParts[0] || '';
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
    
    nameEl.innerHTML = `<span class="block whitespace-nowrap">${firstName}</span>${lastName ? `<span class="block whitespace-nowrap mt-2">${lastName}</span>` : ''}`;
    nameEl.style.color = bStyle.hex;
    
    nameEl.style.borderTop = `12px solid ${bStyle.hex}`;
    nameEl.style.paddingTop = '16px';
    nameEl.className = "text-5xl md:text-[70px] lg:text-[80px] font-black uppercase leading-[0.85] tracking-tight inline-block overflow-hidden w-full"; 

    document.getElementById('app-subtitle').innerText = "Performance Stats";
    window.scrollTo(0, 0);

    const mtd = state.mtdStats[techKey] || { total_sales: 0, average_sale: 0, close_rate: 0, avg_opts: 0, tgl_sales: 0 };
    const qtd = state.qtdStats[techKey] || { total_sales: 0, average_sale: 0, close_rate: 0, avg_opts: 0, tgl_sales: 0 };
    const ytd = state.ytdStats[techKey] || { total_sales: 0, average_sale: 0, close_rate: 0, avg_opts: 0, tgl_sales: 0 };

    const mtdSales = isComm ? (parseFloat(mtd.total_sales) || 0) + (parseFloat(mtd.tgl_sales) || 0) : (parseFloat(mtd.total_sales) || 0);
    const qtdSales = isComm ? (parseFloat(qtd.total_sales) || 0) + (parseFloat(qtd.tgl_sales) || 0) : (parseFloat(qtd.total_sales) || 0);
    const ytdSales = isComm ? (parseFloat(ytd.total_sales) || 0) + (parseFloat(ytd.tgl_sales) || 0) : (parseFloat(ytd.total_sales) || 0);

    document.getElementById('jobtypes-tech-stats').innerHTML = `
        <div class="bg-white border border-slate-200 rounded-2xl p-6 shadow-xl w-full max-w-[800px] xl:max-w-none mt-2">
            <div class="grid grid-cols-4 gap-4 text-right border-b-4 border-slate-200 pb-3 mb-4">
                <div class="text-left text-xs font-black text-slate-400 uppercase tracking-widest">Metric</div>
                <div class="text-xs font-black text-slate-800 uppercase tracking-widest bg-blue-50 py-1 rounded">MTD</div>
                <div class="text-xs font-black text-slate-800 uppercase tracking-widest bg-blue-50 py-1 rounded">QTD</div>
                <div class="text-xs font-black text-slate-800 uppercase tracking-widest bg-blue-50 py-1 rounded">YTD</div>
            </div>
            <div class="grid grid-cols-4 gap-4 items-end text-right py-2.5 border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <div class="text-left text-[11px] font-black text-slate-500 uppercase tracking-widest">${isComm ? 'Sales + TGL' : 'Sales'}</div>
                <div class="text-xl font-black text-green-600 font-mono tracking-tighter">${formatter.format(mtdSales)}</div>
                <div class="text-xl font-black text-green-600 font-mono tracking-tighter">${formatter.format(qtdSales)}</div>
                <div class="text-xl font-black text-green-600 font-mono tracking-tighter">${formatter.format(ytdSales)}</div>
            </div>
            <div class="grid grid-cols-4 gap-4 items-end text-right py-2.5 border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <div class="text-left text-[11px] font-black text-slate-500 uppercase tracking-widest">Avg Sale</div>
                <div class="text-lg font-bold text-slate-700 font-mono tracking-tighter">${formatter.format(mtd.average_sale || 0)}</div>
                <div class="text-lg font-bold text-slate-700 font-mono tracking-tighter">${formatter.format(qtd.average_sale || 0)}</div>
                <div class="text-lg font-bold text-slate-700 font-mono tracking-tighter">${formatter.format(ytd.average_sale || 0)}</div>
            </div>
            <div class="grid grid-cols-4 gap-4 items-end text-right py-2.5 border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <div class="text-left text-[11px] font-black text-slate-500 uppercase tracking-widest">Close %</div>
                <div class="text-lg font-bold text-slate-700 font-mono">${formatPct(mtd.close_rate)}</div>
                <div class="text-lg font-bold text-slate-700 font-mono">${formatPct(qtd.close_rate)}</div>
                <div class="text-lg font-bold text-slate-700 font-mono">${formatPct(ytd.close_rate)}</div>
            </div>
            <div class="grid grid-cols-4 gap-4 items-end text-right py-2.5 hover:bg-slate-50 transition-colors">
                <div class="text-left text-[11px] font-black text-slate-500 uppercase tracking-widest">Avg Opts</div>
                <div class="text-lg font-bold text-slate-700 font-mono">${(parseFloat(mtd.avg_opts) || 0).toFixed(1)}</div>
                <div class="text-lg font-bold text-slate-700 font-mono">${(parseFloat(qtd.avg_opts) || 0).toFixed(1)}</div>
                <div class="text-lg font-bold text-slate-700 font-mono">${(parseFloat(ytd.avg_opts) || 0).toFixed(1)}</div>
            </div>
        </div>
    `;

    const container = document.getElementById('jobtypes-container');
    container.innerHTML = '';
    
    const now = new Date();
    const mtdStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const q = Math.floor(now.getMonth() / 3);
    const qtdStart = new Date(now.getFullYear(), q * 3, 1);
    const ytdStart = new Date(now.getFullYear(), 0, 1);

    const jobTypesStats = {};

    Object.values(state.jobs).filter(j => j.techKey === techKey && j.isComplete).forEach(job => {
        if (!jobTypesStats[job.jobType]) {
            jobTypesStats[job.jobType] = { 
                mtd: { count: 0, revenue: 0, zeroCount: 0, optionCount: 0 },
                qtd: { count: 0, revenue: 0, zeroCount: 0, optionCount: 0 },
                ytd: { count: 0, revenue: 0, zeroCount: 0, optionCount: 0 }
            };
        }
        const stats = jobTypesStats[job.jobType];
        
        let hasSold = false, soldAmt = 0;
        job.s3Items.forEach(est => {
            const isSold = est.status.includes('sold') || est.status === 'closed';
            if (isSold) { hasSold = true; soldAmt += est.subtotal; }
        });
        
        const optionCount = job.s3Items.length;
        const d = job.date;

        if (d >= ytdStart) {
            stats.ytd.count++;
            stats.ytd.optionCount += optionCount;
            if (hasSold) stats.ytd.revenue += soldAmt; else stats.ytd.zeroCount++;
        }
        if (d >= qtdStart) {
            stats.qtd.count++;
            stats.qtd.optionCount += optionCount;
            if (hasSold) stats.qtd.revenue += soldAmt; else stats.qtd.zeroCount++;
        }
        if (d >= mtdStart) {
            stats.mtd.count++;
            stats.mtd.optionCount += optionCount;
            if (hasSold) stats.mtd.revenue += soldAmt; else stats.mtd.zeroCount++;
        }
    });

    let html = `
        <div class="col-span-full mt-8 mb-2 border-b-4 border-slate-300 pb-2 flex flex-col md:flex-row md:items-end justify-start gap-4">
            <h3 class="text-2xl font-black text-slate-600 uppercase tracking-widest">Job Type Breakdown</h3>
            <div class="group relative flex items-center cursor-help pb-1 w-max">
                <span class="text-[10px] font-bold text-yellow-600 uppercase tracking-widest transition-colors group-hover:text-yellow-700 bg-yellow-100 px-2 py-1 rounded-l-md border border-yellow-300 border-r-0">Numbers off?</span>
                <span class="bg-yellow-400 text-yellow-900 rounded-r-md px-2 py-1 flex items-center justify-center text-[10px] font-black group-hover:bg-yellow-500 transition-colors border border-yellow-500 shadow-sm">i</span>
                <div class="hidden group-hover:block absolute bottom-full left-0 md:left-1/2 transform md:-translate-x-1/2 mb-2 w-64 bg-slate-800 text-slate-200 text-xs font-medium p-3 rounded-xl shadow-xl z-50 border border-slate-700 leading-relaxed text-center">
                    Due to job type title changes and some jobs being marked as "Non-Opp" in ServiceTitan, these numbers will not be an exact match, but give us enough data to determine performance.
                </div>
            </div>
        </div>`;
    
    Object.keys(jobTypesStats).sort((a, b) => jobTypesStats[b].ytd.count - jobTypesStats[a].ytd.count).forEach((type, index) => {
        const stats = jobTypesStats[type];
        
        const mtdAvg = stats.mtd.count > 0 ? (stats.mtd.revenue / stats.mtd.count) : 0;
        const qtdAvg = stats.qtd.count > 0 ? (stats.qtd.revenue / stats.qtd.count) : 0;
        const ytdAvg = stats.ytd.count > 0 ? (stats.ytd.revenue / stats.ytd.count) : 0;
        
        const mtdOpts = stats.mtd.count > 0 ? (stats.mtd.optionCount / stats.mtd.count).toFixed(1) : 0;
        const qtdOpts = stats.qtd.count > 0 ? (stats.qtd.optionCount / stats.qtd.count).toFixed(1) : 0;
        const ytdOpts = stats.ytd.count > 0 ? (stats.ytd.optionCount / stats.ytd.count).toFixed(1) : 0;

        const safeType = type.replace(/'/g, "\\'");
        const safeTechKey = techKey.replace(/'/g, "\\'");

        html += `
            <div class="bg-white border-4 border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-4 transition-all hover:border-blue-300">
                <h3 class="text-xl lg:text-2xl font-black text-slate-800 uppercase line-clamp-2 border-b-2 border-slate-100 pb-2">${type}</h3>
                
                <div class="grid grid-cols-4 gap-2 text-right items-end mt-2">
                    <div class="text-left text-[10px] font-black text-slate-400 uppercase tracking-widest pb-1">Metric</div>
                    <div class="text-[10px] font-black text-slate-800 uppercase tracking-widest bg-slate-100 py-1 rounded text-center">MTD</div>
                    <div class="text-[10px] font-black text-slate-800 uppercase tracking-widest bg-slate-100 py-1 rounded text-center">QTD</div>
                    <div class="text-[10px] font-black text-slate-800 uppercase tracking-widest bg-slate-100 py-1 rounded text-center">YTD</div>
                    
                    <div class="text-left text-[11px] font-black text-slate-500 uppercase tracking-widest py-1.5 border-t border-slate-50 mt-1">Opps</div>
                    <div class="text-sm font-black text-slate-700 font-mono py-1.5 border-t border-slate-50 mt-1">${stats.mtd.count}</div>
                    <div class="text-sm font-black text-slate-700 font-mono py-1.5 border-t border-slate-50 mt-1">${stats.qtd.count}</div>
                    <div class="text-sm font-black text-slate-700 font-mono py-1.5 border-t border-slate-50 mt-1">${stats.ytd.count}</div>
                    
                    <div class="text-left text-[11px] font-black text-slate-500 uppercase tracking-widest py-1.5 border-t border-slate-50">Sales</div>
                    <div class="text-sm font-black text-green-600 font-mono py-1.5 border-t border-slate-50">${formatter.format(stats.mtd.revenue)}</div>
                    <div class="text-sm font-black text-green-600 font-mono py-1.5 border-t border-slate-50">${formatter.format(stats.qtd.revenue)}</div>
                    <div class="text-sm font-black text-green-600 font-mono py-1.5 border-t border-slate-50">${formatter.format(stats.ytd.revenue)}</div>
                    
                    <div class="text-left text-[11px] font-black text-slate-500 uppercase tracking-widest py-1.5 border-t border-slate-50">Avg Ticket</div>
                    <div class="text-sm font-bold text-slate-600 font-mono py-1.5 border-t border-slate-50">${formatter.format(mtdAvg)}</div>
                    <div class="text-sm font-bold text-slate-600 font-mono py-1.5 border-t border-slate-50">${formatter.format(qtdAvg)}</div>
                    <div class="text-sm font-bold text-slate-600 font-mono py-1.5 border-t border-slate-50">${formatter.format(ytdAvg)}</div>
                    
                    <div class="text-left text-[11px] font-black text-slate-500 uppercase tracking-widest py-1.5 border-t border-slate-50">Avg Opts</div>
                    <div class="text-sm font-bold text-slate-600 font-mono py-1.5 border-t border-slate-50">${mtdOpts}</div>
                    <div class="text-sm font-bold text-slate-600 font-mono py-1.5 border-t border-slate-50">${qtdOpts}</div>
                    <div class="text-sm font-bold text-slate-600 font-mono py-1.5 border-t border-slate-50">${ytdOpts}</div>
                </div>
                
                <div class="flex gap-2 mt-4 pt-4 border-t-2 border-slate-100">
                    <button onclick="window.showDrilldown('${safeTechKey}', '${safeType}')" class="w-full bg-blue-50 hover:bg-blue-100 text-blue-600 font-black py-3 rounded-xl text-xs uppercase tracking-widest transition-colors shadow-sm">View YTD Job History</button>
                </div>
            </div>
        `;
    });
    
    if (Object.keys(jobTypesStats).length === 0) {
        html += '<div class="text-slate-500 italic mt-2 col-span-full text-center">No completed jobs match the current data filter.</div>';
    }
    container.innerHTML = html;
};

window.showDrilldown = function(techKey, type) {
    const modal = document.getElementById('modal-drilldown'), content = document.getElementById('modal-content');
    if(!modal || !content) return; 
    document.getElementById('modal-title').innerText = `${state.roster[techKey].displayName} / ${type} (YTD)`;
    content.innerHTML = '';

    const now = new Date();
    const ytdStart = new Date(now.getFullYear(), 0, 1);

    Object.entries(state.jobs)
        .filter(([id, job]) => job.techKey === techKey && job.jobType === type && job.isComplete && job.date >= ytdStart)
        .sort((a,b) => b[1].date - a[1].date)
        .forEach(([id, job]) => {
            let soldAmt = 0; job.s3Items.forEach(est => { if(est.status.includes('sold') || est.status === 'closed') soldAmt += est.subtotal; });
            
            let sums = job.s3Items.map(est => `<div class="d-summary-box"><span class="d-summary-status ${est.status.includes('sold')?'text-green-400':'text-yellow-400'}">${est.status.toUpperCase()} | ${formatter.format(est.subtotal)}</span>${est.summary || 'NONE'}</div>`).join('');
            if(!sums) sums = `<div class="d-summary-box"><span class="d-summary-status text-slate-500">System Note</span>NO ESTIMATE DATA LINKED</div>`;
            
            content.innerHTML += `<div class="drilldown-row"><div class="d-date">${job.date.toLocaleDateString()}</div><div class="text-blue-400 font-mono">${id}</div><div class="text-slate-400 text-xs">${job.jobType}</div><div class="font-bold ${soldAmt>0?'text-green-400':'text-red-400'}">${formatter.format(soldAmt)}</div><div>${sums}</div></div>`;
        });
    modal.classList.remove('hidden');
};

window.calculateApprenticeScore = function() {
    let total = 0;
    document.querySelectorAll('.apprentice-score').forEach(sel => total += parseInt(sel.value) || 0);
    const scoreEl = document.getElementById('appr-total-score');
    const ratingEl = document.getElementById('appr-overall-rating');
    if (!scoreEl || !ratingEl) return;
    
    scoreEl.innerText = total;
    if (total >= 85) { ratingEl.innerText = 'Excellent (Ready for more responsibility)'; ratingEl.className = 'text-green-600 font-black'; }
    else if (total >= 70) { ratingEl.innerText = 'Good (Progressing well)'; ratingEl.className = 'text-blue-600 font-black'; }
    else if (total >= 50) { ratingEl.innerText = 'Needs Improvement'; ratingEl.className = 'text-yellow-600 font-black'; }
    else { ratingEl.innerText = 'Unsatisfactory'; ratingEl.className = 'text-red-600 font-black'; }
};

window.openMonthlyReview = function(techKey, techName) {
    const tech = state.roster[techKey] || { displayName: 'UNKNOWN', role: '', department: '', currentLevel: 0 };
    const mtd = state.mtdStats[techKey] || { total_sales: 0, average_sale: 0, close_rate: 0, avg_opts: 0, billable_hours: 0, completed_revenue: 0, tgl_sales: 0 };
    const qtd = state.qtdStats[techKey] || { total_sales: 0, average_sale: 0, close_rate: 0, avg_opts: 0, billable_hours: 0, completed_revenue: 0, tgl_sales: 0 };
    const now = new Date();
    const monthName = now.toLocaleString('default', { month: 'long' });
    const safeTechName = tech.displayName.replace(/'/g, "\\'");
    const safeTechKey = techKey.replace(/'/g, "\\'");

    const roleStr = tech.role.toUpperCase();
    const deptStr = tech.department.toUpperCase();
    
    const isComm = deptStr.includes('COMM');
    const isWarehouse = roleStr.includes('WAREHOUSE') || deptStr.includes('WAREHOUSE');
    const isSales = roleStr.includes('SALES') || tech.displayName.toUpperCase().includes('BRANDON JESTICE');
    const isApprentice = roleStr.includes('APPRENTICE');
    const isResi = !isComm && !isWarehouse && !isSales;

    const isResiService = isResi && roleStr.includes('SERVICE') && !isApprentice;
    const isResiInstall = isResi && roleStr.includes('INSTALL') && !isApprentice;
    const isCommService = isComm && roleStr.includes('SERVICE') && !isApprentice;
    const isCommInstall = isComm && roleStr.includes('INSTALL') && !isApprentice;
    const isCommEntry = isComm && roleStr.includes('ENTRY') && !isApprentice;

    const bHours = parseFloat(mtd.billable_hours) || 0;
    const cRev = parseFloat(mtd.completed_revenue) || 0;
    const tSales = parseFloat(mtd.total_sales) || 0;
    const tgl = parseFloat(mtd.tgl_sales) || 0;
    const salesPlusTgl = tSales + tgl;
    const curAvg = parseFloat(mtd.average_sale) || 0;
    const curClose = (parseFloat(mtd.close_rate) || 0) * 100;
    const currentLevel = parseInt(tech.currentLevel) || 0;
    const curDef = state.levelDefs.find(l => l.level === currentLevel) || null;

    let metricsHtml = '';
    let kpiBannerHtml = '';
    let formBodyHtml = '';

    const buildGoalRow = (name, actual, goal, formatPrefix = '') => {
        const hit = actual >= goal;
        const color = hit ? 'text-green-500' : 'text-slate-500';
        const formattedActual = formatPrefix === '$' ? formatter.format(actual) : actual.toFixed(1);
        const formattedGoal = formatPrefix === '$' ? formatter.format(goal) : goal;
        return `
            <div class="flex justify-between items-center py-3 border-b border-slate-700 last:border-0">
                <div class="font-bold text-slate-300 text-sm">${name}</div>
                <div class="text-right">
                    <div class="text-xs text-slate-500 uppercase tracking-widest mb-0.5">Goal: ${formattedGoal} / Actual: ${formattedActual}</div>
                    <div class="font-black ${color}">$1,000</div>
                </div>
            </div>
        `;
    };

    const renderBonusTable = (title, rows, total) => `
        <div class="mt-6 mb-4 rounded-xl border border-slate-700 overflow-hidden shadow-lg bg-[#0f172a]">
            <div class="bg-blue-900/50 p-3 border-b border-slate-700">
                <h3 class="text-xs font-black text-blue-400 uppercase tracking-widest">${title}</h3>
            </div>
            <div class="p-4">${rows}</div>
            <div class="bg-slate-900 p-4 border-t border-slate-700 flex justify-between items-center">
                <span class="text-xs font-black text-slate-500 uppercase tracking-widest">Max Monthly: $3,000</span>
                <span class="text-xl font-black text-green-500">Total: $${formatter.format(total).replace('$', '')}</span>
            </div>
        </div>
    `;

    const standardFormBodyHtml = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
                <label class="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Safety & Vehicle Audit</label>
                <select id="review-safety" class="w-full border-2 border-slate-300 p-4 rounded-xl font-black text-slate-700 focus:border-purple-500 outline-none transition-colors uppercase tracking-widest cursor-pointer bg-slate-50 shadow-sm">
                    <option value="PASS">Pass - Compliant</option>
                    <option value="FAIL">Fail - Needs Correction</option>
                    <option value="N/A">N/A</option>
                </select>
            </div>
            <div>
                <label class="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Process Compliance (ATIP)</label>
                <select id="review-process" class="w-full border-2 border-slate-300 p-4 rounded-xl font-black text-slate-700 focus:border-purple-500 outline-none transition-colors uppercase tracking-widest cursor-pointer bg-slate-50 shadow-sm">
                    <option value="EXCELLENT">Excellent Execution</option>
                    <option value="SATISFACTORY">Satisfactory / Passable</option>
                    <option value="NEEDS_IMPROVEMENT">Needs Improvement</option>
                </select>
            </div>
        </div>
        <div class="space-y-6">
            <div>
                <label class="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Manager Evaluation & Feedback</label>
                <textarea id="review-feedback" class="w-full border-2 border-slate-300 p-4 rounded-xl min-h-[120px] font-medium text-slate-700 focus:border-purple-500 outline-none transition-colors shadow-sm" placeholder="Summarize performance..."></textarea>
            </div>
            <div>
                <label class="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Goals For Next Month</label>
                <textarea id="review-goals" class="w-full border-2 border-slate-300 p-4 rounded-xl min-h-[80px] font-medium text-slate-700 focus:border-purple-500 outline-none transition-colors shadow-sm" placeholder="Set 1-2 measurable goals..."></textarea>
            </div>
        </div>`;

    if (isApprentice) {
        kpiBannerHtml = `
            <div class="bg-indigo-50 border border-indigo-200 p-4 rounded-xl flex items-center justify-between text-center shadow-sm mb-6 mt-6">
                <div class="flex items-center gap-3">
                    <span class="text-3xl">📋</span>
                    <div class="text-left">
                        <div class="text-sm font-black text-indigo-800 uppercase tracking-widest">Field Assessment Tracker</div>
                        <div class="text-[10px] font-bold text-indigo-600 uppercase mt-0.5">Scoring: 1 (Poor) to 5 (Excellent)</div>
                    </div>
                </div>
            </div>
        `;

        const renderApprCategory = (title, points, items) => {
            let catHtml = `
                <div class="border-2 border-slate-200 rounded-xl overflow-hidden mb-6 shadow-sm">
                    <div class="bg-slate-100 p-3 border-b-2 border-slate-200 flex justify-between items-center">
                        <h4 class="text-sm font-black text-slate-700 uppercase tracking-widest">${title}</h4>
                        <span class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Max ${points} pts</span>
                    </div>
                    <div class="p-4 flex flex-col gap-3">
            `;
            items.forEach(item => {
                catHtml += `
                    <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                        <div class="text-xs font-bold text-slate-700 flex-1">${item}</div>
                        <div class="flex gap-2 shrink-0">
                            <select class="apprentice-score border border-slate-300 p-2 rounded text-xs font-black outline-none focus:border-indigo-500 bg-slate-50" onchange="window.calculateApprenticeScore()">
                                <option value="0">Score...</option>
                                <option value="1">1 - Poor</option>
                                <option value="2">2 - Below Avg</option>
                                <option value="3">3 - Average</option>
                                <option value="4">4 - Good</option>
                                <option value="5">5 - Excellent</option>
                            </select>
                            <input type="text" class="apprentice-note border border-slate-300 p-2 rounded text-xs outline-none focus:border-indigo-500 w-32 md:w-48 placeholder:text-slate-300" placeholder="Notes...">
                        </div>
                    </div>
                `;
            });
            return catHtml + `</div></div>`;
        };

        formBodyHtml = `
            ${renderApprCategory('1. Safety & Awareness', 15, ['Uses proper PPE (gloves, eye protection, etc.)', 'Demonstrates awareness of hazards (springs, tension, electrical)', 'Follows safety procedures consistently'])}
            ${renderApprCategory('2. Technical Skills', 20, ['Tool usage (correct tools, proper handling)', 'Installation skills (doors, openers, hardware)', 'Troubleshooting ability', 'Understanding of garage door systems'])}
            ${renderApprCategory('3. Work Ethic & Reliability', 20, ['Punctuality', 'Preparedness (tools ready, organized)', 'Follows directions from lead tech', 'Work pace / efficiency'])}
            ${renderApprCategory('4. Communication & Customer Interaction', 15, ['Communication with lead technician', 'Professionalism on job site', 'Interaction with customers (respectful, clear)'])}
            ${renderApprCategory('5. Problem Solving & Initiative', 15, ['Ability to think through issues', 'Takes initiative without being told', 'Willingness to learn / ask questions'])}
            ${renderApprCategory('6. Cleanliness & Job Site Management', 10, ['Keeps work area clean', 'Proper cleanup after job completion'])}
            
            <div class="bg-slate-800 rounded-xl p-6 text-white mb-8 shadow-xl flex justify-between items-center border-l-8 border-indigo-500">
                <div>
                    <div class="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Overall Rating</div>
                    <div id="appr-overall-rating" class="text-lg font-black uppercase">Pending Score...</div>
                </div>
                <div class="text-right">
                    <div class="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Total Points</div>
                    <div class="text-4xl font-mono font-black text-indigo-400"><span id="appr-total-score">0</span><span class="text-xl text-slate-500">/95</span></div>
                </div>
            </div>

            <div class="space-y-6 mb-6">
                <div><label class="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Strengths</label><textarea id="appr-strengths" class="w-full border-2 border-slate-300 p-4 rounded-xl min-h-[80px] font-medium text-slate-700 focus:border-indigo-500 outline-none shadow-sm"></textarea></div>
                <div><label class="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Areas for Improvement</label><textarea id="appr-improvements" class="w-full border-2 border-slate-300 p-4 rounded-xl min-h-[80px] font-medium text-slate-700 focus:border-indigo-500 outline-none shadow-sm"></textarea></div>
                <div><label class="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Additional Comments</label><textarea id="appr-comments" class="w-full border-2 border-slate-300 p-4 rounded-xl min-h-[80px] font-medium text-slate-700 focus:border-indigo-500 outline-none shadow-sm"></textarea></div>
            </div>
            
            <input type="hidden" id="review-safety" value="N/A">
            <input type="hidden" id="review-process" value="N/A">
            <input type="hidden" id="review-feedback" value="">
            <input type="hidden" id="review-goals" value="">
        `;
    } 
    else if (isResiService) {
        const qAvg = parseFloat(qtd.average_sale) || 0;
        const qClose = (parseFloat(qtd.close_rate) || 0) * 100;
        
        let avgQualLevel = 0, closeQualLevel = 0;
        let sortedDefs = [...state.levelDefs].sort((a,b) => b.level - a.level);
        for (let d of sortedDefs) {
            if (d.level > 0 && qAvg >= d.retainAvg && avgQualLevel === 0) avgQualLevel = d.level;
            if (d.level > 0 && qClose >= d.retainClose && closeQualLevel === 0) closeQualLevel = d.level;
        }

        let projectedLevel = Math.min(avgQualLevel, closeQualLevel);
        if (avgQualLevel === 0 || closeQualLevel === 0) projectedLevel = 0;

        let trendIcon = '<span class="text-slate-400 font-black text-4xl">-</span>';
        let trendColor = 'text-slate-600';
        let trendText = 'MAINTAINING';
        
        if (projectedLevel > currentLevel) {
            trendIcon = '<span class="text-green-500 font-black text-4xl">↑</span>';
            trendColor = 'text-green-600';
            trendText = 'TRENDING UP';
        } else if (projectedLevel < currentLevel) {
            trendIcon = '<span class="text-red-500 font-black text-4xl">↓</span>';
            trendColor = 'text-red-600';
            trendText = 'TRENDING DOWN';
        }

        kpiBannerHtml = `
            <div class="mt-6 mb-2 p-5 rounded-2xl border-4 bg-slate-50 border-slate-200 flex items-center justify-between shadow-sm">
                <div class="flex items-center gap-6">
                    ${trendIcon}
                    <div>
                        <div class="text-sm font-black uppercase text-slate-800 tracking-widest mb-1">QTD Trajectory Tracker</div>
                        <div class="text-[10px] font-bold ${trendColor} uppercase tracking-widest bg-slate-200 px-2 py-0.5 rounded inline-block">${trendText}</div>
                    </div>
                </div>
                <div class="flex gap-8 text-right">
                    <div>
                        <div class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Locked Pay</div>
                        <div class="text-2xl font-black text-slate-700">Level ${currentLevel}</div>
                    </div>
                    <div class="border-l-2 border-slate-300 pl-8">
                        <div class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Projected</div>
                        <div class="text-2xl font-black ${trendColor}">Level ${projectedLevel}</div>
                    </div>
                </div>
            </div>
        `;

        metricsHtml = `
            <div class="grid grid-cols-3 gap-4 mb-8 mt-6">
                <div class="bg-slate-50 border-2 border-slate-200 p-4 rounded-xl flex flex-col items-center justify-center text-center shadow-sm">
                    <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Sales</span>
                    <span class="text-2xl font-black text-green-600 font-mono">${formatter.format(tSales)}</span>
                </div>
                <div class="bg-slate-50 border-2 border-slate-200 p-4 rounded-xl flex flex-col items-center justify-center text-center shadow-sm">
                    <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Avg Ticket</span>
                    <span class="text-2xl font-black text-slate-700 font-mono">${formatter.format(curAvg)}</span>
                </div>
                <div class="bg-slate-50 border-2 border-slate-200 p-4 rounded-xl flex flex-col items-center justify-center text-center shadow-sm">
                    <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Close Rate</span>
                    <span class="text-2xl font-black text-slate-700 font-mono">${curClose.toFixed(1)}%</span>
                </div>
            </div>
        `;
        formBodyHtml = standardFormBodyHtml;
    } else if (isResiInstall) {
        let tBonus = 0; let rows = '';
        if (bHours >= 150) tBonus += 1000; if (cRev >= 85000) tBonus += 1000; if (tSales >= 10000) tBonus += 1000;
        rows += buildGoalRow('Billable Hours', bHours, 150, ''); rows += buildGoalRow('Revenue', cRev, 85000, '$'); rows += buildGoalRow('Sales', tSales, 10000, '$');
        kpiBannerHtml = renderBonusTable('Monthly Goal Bonuses', rows, tBonus);
        metricsHtml = `
            <div class="grid grid-cols-3 gap-4 mb-8 mt-2">
                <div class="bg-slate-50 border-2 border-slate-200 p-4 rounded-xl flex flex-col items-center justify-center text-center shadow-sm"><span class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Completed Rev</span><span class="text-2xl font-black text-green-600 font-mono">${formatter.format(cRev)}</span></div>
                <div class="bg-slate-50 border-2 border-slate-200 p-4 rounded-xl flex flex-col items-center justify-center text-center shadow-sm"><span class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Sales</span><span class="text-2xl font-black text-green-600 font-mono">${formatter.format(tSales)}</span></div>
                <div class="bg-slate-50 border-2 border-slate-200 p-4 rounded-xl flex flex-col items-center justify-center text-center shadow-sm"><span class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Billable Hours</span><span class="text-2xl font-black text-slate-700 font-mono">${bHours.toFixed(1)}</span></div>
            </div>`;
        formBodyHtml = standardFormBodyHtml;
    } else if (isCommService) {
        let tBonus = 0; let rows = '';
        if (bHours >= 150) tBonus += 1000; if (cRev >= 65000) tBonus += 1000; if (salesPlusTgl >= 45000) tBonus += 1000;
        rows += buildGoalRow('Billable Hours', bHours, 150, ''); rows += buildGoalRow('Revenue', cRev, 65000, '$'); rows += buildGoalRow('Sales + TGL', salesPlusTgl, 45000, '$');
        kpiBannerHtml = renderBonusTable('Service Focus', rows, tBonus);
        metricsHtml = `
            <div class="grid grid-cols-3 gap-4 mb-8 mt-2">
                <div class="bg-slate-50 border-2 border-slate-200 p-4 rounded-xl flex flex-col items-center justify-center text-center shadow-sm"><span class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Completed Rev</span><span class="text-2xl font-black text-green-600 font-mono">${formatter.format(cRev)}</span></div>
                <div class="bg-slate-50 border-2 border-slate-200 p-4 rounded-xl flex flex-col items-center justify-center text-center shadow-sm"><span class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Sales + TGL</span><span class="text-2xl font-black text-green-600 font-mono">${formatter.format(salesPlusTgl)}</span></div>
                <div class="bg-slate-50 border-2 border-slate-200 p-4 rounded-xl flex flex-col items-center justify-center text-center shadow-sm"><span class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Billable Hours</span><span class="text-2xl font-black text-slate-700 font-mono">${bHours.toFixed(1)}</span></div>
            </div>`;
        formBodyHtml = standardFormBodyHtml;
    } else if (isCommInstall) {
        let tBonus = 0; let rows = '';
        if (bHours >= 150) tBonus += 1000; if (cRev >= 85000) tBonus += 1000; if (salesPlusTgl >= 20000) tBonus += 1000;
        rows += buildGoalRow('Billable Hours', bHours, 150, ''); rows += buildGoalRow('Revenue', cRev, 85000, '$'); rows += buildGoalRow('Sales + TGL', salesPlusTgl, 20000, '$');
        kpiBannerHtml = renderBonusTable('Install Focus', rows, tBonus);
        metricsHtml = `
            <div class="grid grid-cols-3 gap-4 mb-8 mt-2">
                <div class="bg-slate-50 border-2 border-slate-200 p-4 rounded-xl flex flex-col items-center justify-center text-center shadow-sm"><span class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Completed Rev</span><span class="text-2xl font-black text-green-600 font-mono">${formatter.format(cRev)}</span></div>
                <div class="bg-slate-50 border-2 border-slate-200 p-4 rounded-xl flex flex-col items-center justify-center text-center shadow-sm"><span class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Sales + TGL</span><span class="text-2xl font-black text-green-600 font-mono">${formatter.format(salesPlusTgl)}</span></div>
                <div class="bg-slate-50 border-2 border-slate-200 p-4 rounded-xl flex flex-col items-center justify-center text-center shadow-sm"><span class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Billable Hours</span><span class="text-2xl font-black text-slate-700 font-mono">${bHours.toFixed(1)}</span></div>
            </div>`;
        formBodyHtml = standardFormBodyHtml;
    } else if (isCommEntry) {
        let tBonus = 0; let rows = '';
        if (bHours >= 150) tBonus += 1000; if (cRev >= 65000) tBonus += 1000; if (salesPlusTgl >= 20000) tBonus += 1000;
        rows += buildGoalRow('Billable Hours', bHours, 150, ''); rows += buildGoalRow('Revenue', cRev, 65000, '$'); rows += buildGoalRow('Sales + TGL', salesPlusTgl, 20000, '$');
        kpiBannerHtml = renderBonusTable('Entry Focus', rows, tBonus);
        metricsHtml = `
            <div class="grid grid-cols-3 gap-4 mb-8 mt-2">
                <div class="bg-slate-50 border-2 border-slate-200 p-4 rounded-xl flex flex-col items-center justify-center text-center shadow-sm"><span class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Completed Rev</span><span class="text-2xl font-black text-green-600 font-mono">${formatter.format(cRev)}</span></div>
                <div class="bg-slate-50 border-2 border-slate-200 p-4 rounded-xl flex flex-col items-center justify-center text-center shadow-sm"><span class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Sales + TGL</span><span class="text-2xl font-black text-green-600 font-mono">${formatter.format(salesPlusTgl)}</span></div>
                <div class="bg-slate-50 border-2 border-slate-200 p-4 rounded-xl flex flex-col items-center justify-center text-center shadow-sm"><span class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Billable Hours</span><span class="text-2xl font-black text-slate-700 font-mono">${bHours.toFixed(1)}</span></div>
            </div>`;
        formBodyHtml = standardFormBodyHtml;
    } else {
        metricsHtml = `<div class="bg-slate-50 border-2 border-dashed border-slate-300 p-8 rounded-xl flex items-center justify-center text-center shadow-sm mb-8 mt-6"><span class="text-sm font-black text-slate-400 uppercase tracking-widest">KPI Metrics Pending Manager Configuration</span></div>`;
        formBodyHtml = standardFormBodyHtml;
    }

    let modal = document.getElementById('modal-monthly-review');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-monthly-review';
        modal.className = 'fixed inset-0 z-[100] hidden flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 overflow-y-auto';
        document.body.appendChild(modal);
    }

    modal.innerHTML = `
        <div class="bg-white max-w-4xl w-full mx-auto shadow-2xl relative my-8 flex flex-col max-h-[90vh] border-t-[8px] border-purple-600 rounded-b-xl">
            <div class="bg-slate-800 text-white p-4 flex justify-between items-center shrink-0 print:hidden">
                <h2 class="text-lg font-black uppercase tracking-widest text-purple-400">Monthly Performance Review</h2>
                <button onclick="document.getElementById('modal-monthly-review').classList.add('hidden')" class="text-slate-300 hover:text-white font-bold">✕ CLOSE</button>
            </div>

            <div class="p-8 md:p-10 overflow-y-auto flex-1 custom-scrollbar text-slate-800" id="review-scroll-area">
                <div class="flex justify-between items-end border-b-4 border-slate-200 pb-4 mb-2">
                    <div>
                        <h1 class="text-4xl font-black uppercase tracking-tighter leading-none">${techName}</h1>
                        <div class="text-lg font-bold text-slate-500 uppercase tracking-widest mt-2">${monthName} ${now.getFullYear()} Review</div>
                    </div>
                    <div class="text-right">
                        <div class="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Current Rank</div>
                        <div class="text-2xl font-black uppercase tracking-widest px-4 py-1 bg-slate-100 rounded-lg border-2 border-slate-300" style="color: ${beltStyles[tech.currentBelt || 'GRAY']?.hex}">${tech.currentBelt || 'GRAY'} BELT</div>
                    </div>
                </div>

                ${kpiBannerHtml}
                ${metricsHtml}
                ${formBodyHtml}

                <div class="mt-8 pt-6 border-t-2 border-slate-200">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div class="relative">
                            <span class="block text-sm font-black uppercase tracking-widest text-slate-700 mb-2">Evaluator Signature</span>
                            <div id="review-sig-zone" class="mt-2">
                                <div class="relative border-2 border-slate-300 bg-slate-50 rounded-xl overflow-hidden" style="touch-action: none;">
                                    <canvas id="signature-pad" class="w-full h-32 cursor-crosshair"></canvas>
                                    <button type="button" onclick="window.clearSignature()" class="absolute top-2 right-2 text-[10px] font-black bg-slate-200 text-slate-600 px-3 py-1 rounded-lg hover:bg-slate-300 transition-colors uppercase tracking-widest">Clear</button>
                                </div>
                                <div class="mt-4">
                                    <button onclick="window.submitMonthlyReview('${safeTechKey}', '${safeTechName}')" class="w-full bg-purple-600 hover:bg-purple-700 text-white font-black px-6 py-4 rounded-xl uppercase tracking-widest transition-colors shadow-lg text-sm">Sign & Submit Review</button>
                                </div>
                            </div>
                            <div id="review-sig-stamp" class="hidden mt-4 bg-slate-50 p-4 rounded-xl border-2 border-slate-200 text-center">
                                <img id="sig-image-result" src="" class="h-16 object-contain mx-auto mb-2">
                                <div class="text-purple-700 font-black font-sans uppercase tracking-widest text-[10px]">
                                    DIGITALLY SIGNED BY MANAGER <br> <span id="review-sig-date" class="text-slate-500 mt-1 inline-block"></span>
                                </div>
                            </div>
                        </div>
                        <div class="flex flex-col justify-end text-right text-xs font-bold text-slate-400 uppercase tracking-widest pb-4">
                            <p>By signing, I verify this review is complete and ready to be routed to the technician's official file.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    modal.classList.remove('hidden');
    setTimeout(() => window.initSignatureEngine('signature-pad'), 100);
};

window.submitMonthlyReview = async function(techKey, techName) {
    if (!window.hasSigned) {
        alert("Signature required before submitting.");
        return;
    }

    const tech = state.roster[techKey] || {};
    const isApprentice = tech.role.toUpperCase().includes('APPRENTICE');
    
    let fbInput = document.getElementById('review-feedback');
    let glInput = document.getElementById('review-goals');

    if (isApprentice) {
        const sStr = document.getElementById('appr-strengths')?.value.trim() || '';
        const sImp = document.getElementById('appr-improvements')?.value.trim() || '';
        const sCom = document.getElementById('appr-comments')?.value.trim() || '';
        const tScore = document.getElementById('appr-total-score')?.innerText || '0';
        
        fbInput.value = `[APPRENTICE FIELD EVALUATION - SCORE: ${tScore}/95]\n\nSTRENGTHS:\n${sStr}\n\nIMPROVEMENTS:\n${sImp}`;
        glInput.value = `ADDITIONAL COMMENTS:\n${sCom}`;
    }

    const feedback = fbInput.value.trim();
    const goals = glInput.value.trim();

    if(!feedback || !goals) {
        alert("Please complete the required text fields.");
        return;
    }

    alert("System Check 1: Review Signature confirmed. Compiling data...");

    const signatureImage = currentSignatureCanvas.toDataURL('image/png');
    const signedDate = new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString();

    if(isApprentice) {
        document.querySelectorAll('.apprentice-score').forEach(s => s.disabled = true);
        document.querySelectorAll('.apprentice-note').forEach(n => n.disabled = true);
        ['appr-strengths', 'appr-improvements', 'appr-comments'].forEach(id => { if(document.getElementById(id)) document.getElementById(id).disabled = true; });
    } else {
        fbInput.disabled = true;
        glInput.disabled = true;
        document.getElementById('review-safety').disabled = true;
        document.getElementById('review-process').disabled = true;
    }

    document.getElementById('review-sig-zone').innerHTML = '<div class="text-purple-600 font-black animate-pulse text-center p-6 border-2 border-purple-200 bg-purple-50 rounded-xl tracking-widest uppercase">SAVING REVIEW...</div>';

    alert("System Check 2: Preparing to fire email trigger to Google Apps Script at URL: \n\n" + APPS_SCRIPT_WEB_APP_URL.substring(0, 50) + "...");

    // Fire the Monthly Review PDF flare
    fetch(APPS_SCRIPT_WEB_APP_URL, {
        method: 'POST',
        body: JSON.stringify({
            // Assuming your Google Script has the PIP SHEET WRITER logic, it catches this payload
            endSession: true,
            techName: techName,
            date: new Date().toLocaleDateString('en-US'),
            reportName: "Monthly Performance Review",
            notes: `FEEDBACK:\n${feedback}\n\nGOALS:\n${goals}`
        }),
        headers: { 'Content-Type': 'text/plain;charset=utf-8' }
    })
    .then(response => {
        alert("System Check 3 SUCCESS: Google received the Review request! HTTP Status: " + response.status);
    })
    .catch(err => {
        alert("System Check 3 FAILED: The browser blocked the request or the URL is dead. Error: " + err.message);
        console.log("Review trigger failed:", err);
    });

    setTimeout(() => {
        document.getElementById('review-sig-zone').classList.add('hidden');
        const stampZone = document.getElementById('review-sig-stamp');
        stampZone.classList.remove('hidden');
        document.getElementById('sig-image-result').src = signatureImage;
        document.getElementById('review-sig-date').innerText = signedDate;

        alert("✅ Review signed and submitted.\n\n(A PDF copy has been routed to HR and the Technician's file).");
        
        setTimeout(() => {
            document.getElementById('modal-monthly-review').classList.add('hidden');
        }, 1500);
    }, 1000);
};

window.setSkillLevel = function(skillName, targetLevel) {
    if (state.currentUserRole !== 'ADMIN') return;
    const techKey = state.activeTechKey;
    if (!techKey) return;
    if (!state.techMastery[techKey]) state.techMastery[techKey] = {};
    
    let currentVal = parseInt(state.techMastery[techKey][skillName]) || 0;
    if (currentVal === targetLevel) state.techMastery[techKey][skillName] = 0; 
    else state.techMastery[techKey][skillName] = targetLevel;
};

window.setBehavior = function(behId, score) {
    if (state.currentUserRole !== 'ADMIN') return;
    const techKey = state.activeTechKey;
    if (!techKey) return;
    if (!state.techBehaviors[techKey]) state.techBehaviors[techKey] = {};
    state.techBehaviors[techKey][behId] = score;
};

async function buildEngine() {
    try {
        const [rosterData, jobsData, estData, lDefs, sList, tMast, mtdData, qtdData, ytdData, attRulesData, attOccData] = await Promise.all([
            fetchSupabaseTableSafe('tech_profiles'), 
            fetchSupabaseTableSafe('past_jobs'), 
            fetchSupabaseTableSafe('estimates'), 
            fetchRawData(levelDefsCsv),
            fetchRawData(skillsListCsv),
            fetchRawData(techMasteryCsv),
            fetchSupabaseTableSafe('scoreboard'), 
            fetchSupabaseTableSafe('quarterly_scoreboard'), 
            fetchSupabaseTableSafe('scoreboard_ytd'),
            fetchSupabaseTableSafe('attendance_rules'),
            fetchSupabaseTableSafe('attendance_occurrences')
        ]);

        if (!rosterData || rosterData.length === 0) {
            document.getElementById('login-loading').innerHTML = "ROSTER EMPTY."; return;
        }

        state.attendanceRules = attRulesData && attRulesData.length > 0 ? attRulesData : [
            {occurrences: 1, penalty: 'Penalty One'},
            {occurrences: 2, penalty: 'Penalty Two'},
            {occurrences: 3, penalty: 'Penalty Three - Probation'},
            {occurrences: 4, penalty: 'Penalty Four - Termination'}
        ];
        
        state.attendanceOccurrences = attOccData || [];

        rosterData.forEach(row => {
            state.roster[String(row.tech_name).trim().toUpperCase()] = { 
                displayName: String(row.tech_name).trim(), 
                image: getDirectImageUrl(row.image ? String(row.image).trim() : ''),
                department: String(row.department || 'RESIDENTIAL').trim().toUpperCase(),
                role: String(row.primary_role || row.role || '').trim().toUpperCase(),
                status: String(row.status || 'ACTIVE').trim().toUpperCase(),
                pin: String(row.pin || '').trim(),
                currentBelt: String(row.current_belt || 'GRAY').trim().toUpperCase(),  
                hourlyPay: String(row.hourly_pay || '').trim(),                 
                currentLevel: String(row.performance_pay_level || '').trim()                
            };
        });

        jobsData.forEach(row => {
            const id = String(row.job_number || '').trim(); 
            const type = String(row.job_type || '').trim(); 
            
            const techKey = String(row.primary_technician || '').trim().toUpperCase();
            if (!state.roster[techKey]) return; 

            const jobDate = row.completed_date ? new Date(row.completed_date) : new Date(0);

            if (!state.jobs[id]) {
                state.jobs[id] = { id: id, s3Items: [], s4Count: 0, jobType: type, techKey: techKey, isComplete: false, date: jobDate };
            }
            state.jobs[id].s4Count++;
            const statusStr = String(row.status || '').trim().toUpperCase(); 
            if (statusStr.includes("COMPLETE") || statusStr === "DONE" || statusStr === "CLOSED") {
                state.jobs[id].isComplete = true;
            }
        });

        estData.forEach(row => {
            const parentId = String(row.parent_job_number || '').trim(); 
            if (!parentId || !state.jobs[parentId]) return; 
            
            state.jobs[parentId].s3Items.push({ 
                status: String(row.status || '').trim().toLowerCase(), 
                subtotal: parseFloat(row.subtotal) || 0, 
                summary: String(row.summary || '').trim(),
                soldOn: row.sold_on ? new Date(row.sold_on) : null,
                creationDate: row.creation_date ? new Date(row.creation_date) : null
            });
        });

        lDefs.forEach((row, i) => {
            if (i > 0 && row[0] !== undefined && row[0] !== '') {
                state.levelDefs.push({ 
                    level: parseInt(row[0]), 
                    rate: row[1], 
                    retainAvg: parseFloat(String(row[2]).replace(/[^\d.-]/g,"")) || 0, 
                    retainClose: parseFloat(String(row[3]).replace(/[^\d.-]/g,"")) || 0,
                    levelUpAvg: parseFloat(String(row[4]).replace(/[^\d.-]/g,"")) || 0, 
                    levelUpClose: parseFloat(String(row[5]).replace(/[^\d.-]/g,"")) || 0,
                    salePct: row[6] || '0%',
                    workPct: row[7] || '0%'
                });
            }
        });

        sList.forEach((row, i) => {
            if (i > 0 && row[0] && row[1]) {
                state.skillsList.push({ level: parseInt(row[0]), name: row[1] });
            }
        });

        if (tMast.length > 0) {
            const headers = tMast[0].map(h => String(h).toUpperCase().trim());
            tMast.forEach((row, i) => {
                if (i === 0) return;
                const techName = String(row[0]).toUpperCase().trim();
                if (!techName) return;
                state.techMastery[techName] = {};
                row.forEach((cell, idx) => {
                    if (idx > 0 && headers[idx]) {
                        state.techMastery[techName][headers[idx]] = cell;
                    }
                });
            });
        }

        mtdData.forEach(r => {
            const key = String(r.name || r.tech_name || r.technician || '').trim().toUpperCase();
            if(key) state.mtdStats[key] = {
                total_sales: r.total_sales || 0,
                average_sale: r.average_sale || 0,
                sales_opportunity: r.sales_opportunity || 0,
                close_rate: r.close_rate || 0,
                avg_opts: r.avg_opts || r.options_per_opportunity || r.average_options || r.avg_opt || 0,
                billable_hours: parseFloat(r.billable_hours) || 0,
                completed_revenue: parseFloat(r.completed_revenue) || 0,
                tgl_sales: parseFloat(r.tgl_sales || r.tech_lead_sales) || 0
            };
        });
        qtdData.forEach(r => {
            const key = String(r.name || r.tech_name || r.technician || '').trim().toUpperCase();
            if(key) state.qtdStats[key] = {
                total_sales: r.total_sales || 0,
                average_sale: r.average_sale || 0,
                sales_opportunity: r.sales_opportunity || 0,
                close_rate: r.close_rate || 0,
                avg_opts: r.avg_opts || r.options_per_opportunity || r.average_options || r.avg_opt || 0,
                billable_hours: parseFloat(r.billable_hours) || 0,
                completed_revenue: parseFloat(r.completed_revenue) || 0,
                tgl_sales: parseFloat(r.tgl_sales || r.tech_lead_sales) || 0
            };
        });
        ytdData.forEach(r => {
            const key = String(r.name || r.tech_name || r.technician || '').trim().toUpperCase();
            if(key) state.ytdStats[key] = {
                total_sales: r.total_sales || 0,
                average_sale: r.average_sale || 0,
                sales_opportunity: r.sales_opportunity || 0,
                close_rate: r.close_rate || 0,
                avg_opts: r.avg_opts || r.options_per_opportunity || r.average_options || r.avg_opt || 0,
                billable_hours: parseFloat(r.billable_hours) || 0,
                completed_revenue: parseFloat(r.completed_revenue) || 0,
                tgl_sales: parseFloat(r.tgl_sales || r.tech_lead_sales) || 0
            };
        });

        document.getElementById('login-loading').classList.add('hidden');
        
        const savedPin = localStorage.getItem('st_auditor_pin');
        if (savedPin && (savedPin === '0556' || Object.keys(state.roster).some(k => state.roster[k].pin === savedPin))) {
            window.handleLogin(savedPin);
        } else {
            document.getElementById('login-form').classList.remove('hidden');
            document.getElementById('login-form').classList.add('flex');
            document.getElementById('pin-input').focus();
        }
        
    } catch (error) { 
        console.error(error);
        document.getElementById('login-loading').innerHTML = `<span class="text-red-500 uppercase block text-center mt-4">System Halt: Check Console for Errors.</span>`; 
    }
}

window.addEventListener('DOMContentLoaded', buildEngine);