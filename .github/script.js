const { jsPDF } = window.jspdf;

// Clean static Student Database setup (The 36 students as requested)
const DEFAULT_STUDENTS = [
    { id: "427", name: "MUHAMMAD T" },
    { id: "428", name: "MUHAMMAD RAFNAS B.C" },
    { id: "430", name: "MUHAMMED YASIR B.A" },
    { id: "431", name: "MUHAMMAD RAZI.B" },
    { id: "432", name: "MUHAMMED ASHFAQUE. K V" },
    { id: "433", name: "MUHAMMED RABEEH.T" },
    { id: "434", name: "MUHAMMED SHAMIL JALAL" },
    { id: "435", name: "MUHAMMED MUSTHAFA PC" },
    { id: "438", name: "AHMAD FADI P" },
    { id: "439", name: "ABDUL HADI P" },
    { id: "441", name: "FADHIL MOHAMMED NP" },
    { id: "442", name: "MUHAMMED AFROSH MP" },
    { id: "444", name: "IJLAN ABDULLA U.M" },
    { id: "448", name: "MUHAMMED RAZAL O" },
    { id: "449", name: "ABDU RAZIK  K.K" },
    { id: "450", name: "MUHAMMAD BILAL A. P" },
    { id: "451", name: "MUHAMMED FARIS" },
    { id: "452", name: "MUHAMMES SHABEEL MK" },
    { id: "453", name: "MUHAMMAD AMEEN. P" },
    { id: "454", name: "MUHAMMED RAHEES N C" },
    { id: "456", name: "SHIRIN MIRAS MUSTHAFA" },
    { id: "458", name: "MAHTHAB K" },
    { id: "459", name: "MUHAMMED VP" },
    { id: "462", name: "MUHAMMAD THANSEEH.P" },
    { id: "463", name: "MUHAMMED RISHAL" },
    { id: "464", name: "MOHAMMED ALI KHAN" },
    { id: "467", name: "MUHAMMED A" },
    { id: "469", name: "MUHAMMED AFNAS" },
    { id: "470", name: "MUHAMMED BINSHAD K" },
    { id: "569", name: "MUHAMMED HISHAM P" },
    { id: "581", name: "MUHAMMED THAMEEM T" },
    { id: "582", name: "MUHAMMED A" },
    { id: "583", name: "MUHAMMED HANOON K" },
    { id: "585", name: "MUHAMMED ANZIL EA" },
    { id: "586", name: "MUHAMMED NAJIL KV" },
    { id: "587", name: "MUHAMMED V" }
].map(student => ({
    ...student,
    email: `${student.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}@union.com`,
    phone: `9876540${student.id}`,
    photo: `https://api.dicebear.com/7.x/bottts/svg?seed=${student.name}`
}));

// Core App Databases (Clear initial states, strictly zero funds & empty registries)
let students = JSON.parse(localStorage.getItem('alif_students')) || DEFAULT_STUDENTS;
let classFunds = JSON.parse(localStorage.getItem('alif_classfunds')) || {};
let fundHistory = JSON.parse(localStorage.getItem('alif_fundhistory')) || [];

let programs = JSON.parse(localStorage.getItem('alif_programs')) || [];
let results = JSON.parse(localStorage.getItem('alif_results')) || [];
let notifications = JSON.parse(localStorage.getItem('alif_notifications')) || [];
let adminContacts = JSON.parse(localStorage.getItem('alif_contacts')) || [];

let passwords = JSON.parse(localStorage.getItem('alif_passwords')) || { admin: '263202' };

// Ensure all students start with exact 0 funds and default passwords
students.forEach(st => {
    if (!passwords[st.id]) {
        passwords[st.id] = '123456';
    }
    if (classFunds[st.id] === undefined) {
        classFunds[st.id] = 0; // Completely cleared initial funds!
    }
});

// New Database Collections for Enhanced Features
let attendance = JSON.parse(localStorage.getItem('alif_attendance')) || [];
let parents = JSON.parse(localStorage.getItem('alif_parents')) || [];
let homework = JSON.parse(localStorage.getItem('alif_homework')) || [];
let reportCards = JSON.parse(localStorage.getItem('alif_reportcards')) || [];
let digitalIDs = JSON.parse(localStorage.getItem('alif_digitalids')) || [];
let chatMessages = JSON.parse(localStorage.getItem('alif_chatmessages')) || [];
let pushNotificationSettings = JSON.parse(localStorage.getItem('alif_push_settings')) || { enabled: true, sound: true };

// Initialize LocalStorage Synced State
function syncDatabase() {
    localStorage.setItem('alif_students', JSON.stringify(students));
    localStorage.setItem('alif_classfunds', JSON.stringify(classFunds));
    localStorage.setItem('alif_fundhistory', JSON.stringify(fundHistory));
    localStorage.setItem('alif_programs', JSON.stringify(programs));
    localStorage.setItem('alif_results', JSON.stringify(results));
    localStorage.setItem('alif_notifications', JSON.stringify(notifications));
    localStorage.setItem('alif_contacts', JSON.stringify(adminContacts));
    localStorage.setItem('alif_passwords', JSON.stringify(passwords));
    localStorage.setItem('alif_attendance', JSON.stringify(attendance));
    localStorage.setItem('alif_parents', JSON.stringify(parents));
    localStorage.setItem('alif_homework', JSON.stringify(homework));
    localStorage.setItem('alif_reportcards', JSON.stringify(reportCards));
    localStorage.setItem('alif_digitalids', JSON.stringify(digitalIDs));
    localStorage.setItem('alif_chatmessages', JSON.stringify(chatMessages));
    localStorage.setItem('alif_push_settings', JSON.stringify(pushNotificationSettings));
}
syncDatabase();

// UI View States
let userRole = null; // 'admin' or 'student' or 'parent'
let currentUser = null; // student object or admin or parent
let isParentMode = false; // Track parent login mode
let activeTab = 'dashboard';
let sidebarCollapsed = false;
let isDarkMode = true;

// New Feature State Variables
let isGeneratingQRCode = false;
let currentQRAttendanceCode = '';
let selectedStudentForAttendance = null;
let isGeneratingReportCard = false;
let isGeneratingDigitalID = false;
let activeChatRecipient = null;
let isExportingToExcel = false;

// AI State Parameters
let activeAISubTab = 'chat'; // 'chat', 'quiz', 'canvas', 'tutor', 'oral'
let activeQuizQuestions = [];
let currentQuizIndex = 0;
let userQuizScore = 0;
let currentQuizExplanation = '';
let isQuizGenerating = false;
let isPosterGenerating = false;
let generatedPosterUrl = '';
let activeVoiceAudio = null;

// ALIF AI Learning States
let activeStudyGuide = null;
let isTutorGenerating = false;
let isOralExamRunning = false;
let currentOralQuestion = '';
let idealAnswerCriteria = '';
let oralFeedback = null;
let isOralGenerating = false;
let oralSubject = 'Physics & Chemistry';
let oralQuestionIndex = 0;

// Retrieve API Key dynamically from local storage or fallback to compiler injection
function retrieveApiKey() {
    let injectedKey = ""; // Auto-injected by Canvas environment at runtime if left empty
    if (!injectedKey) {
        injectedKey = localStorage.getItem('alif_api_key') || "";
    }
    return injectedKey;
}

async function fetchGemini(systemInstruction, userPrompt) {
    const apiKey = retrieveApiKey();
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

    const payload = {
        contents: [{ parts: [{ text: userPrompt }] }],
        systemInstruction: {
            parts: [{ text: systemInstruction }]
        }
    };

    let delay = 1000;
    const maxRetries = 3;
    for (let i = 0; i < maxRetries; i++) {
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`HTTP status error: ${response.status}`);
            }

            const result = await response.json();
            const aiText = result.candidates?.[0]?.content?.parts?.[0]?.text;
            if (aiText) return aiText;
            throw new Error("Received empty response from the generative model.");
        } catch (error) {
            if (i === maxRetries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, delay));
            delay *= 2;
        }
    }
}

// Helper to fetch structured JSON schemas from Gemini
async function fetchGeminiStructured(systemInstruction, userPrompt, schema) {
    const apiKey = retrieveApiKey();
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

    const payload = {
        contents: [{ parts: [{ text: userPrompt }] }],
        systemInstruction: {
            parts: [{ text: systemInstruction }]
        },
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: schema
        }
    };

    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error(`Structured API error: ${response.status}`);
    const result = await response.json();
    const jsonText = result.candidates?.[0]?.content?.parts?.[0]?.text;
    if (jsonText) return JSON.parse(jsonText);
    throw new Error("Empty structured JSON response.");
}

// Helper to generate posters/artwork via Google Imagen
async function fetchImagen(prompt) {
    const apiKey = retrieveApiKey();
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${apiKey}`;
    const payload = {
        instances: [{ prompt: prompt }],
        parameters: { "sampleCount": 1 }
    };

    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error(`Imagen API error: ${response.status}`);
    const result = await response.json();
    const base64Encoded = result.predictions?.[0]?.bytesBase64Encoded;
    if (base64Encoded) {
        return `data:image/png;base64,${base64Encoded}`;
    }
    throw new Error("Could not extract synthesized artwork.");
}

// Helper to generate Voice TTS (Text to Speech) using gemini-2.5-flash-preview-tts
async function fetchTTS(textToSpeak) {
    const apiKey = retrieveApiKey();
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`;

    const payload = {
        contents: [{
            parts: [{ text: textToSpeak }]
        }],
        generationConfig: {
            responseModalities: ["AUDIO"],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: "Puck" } // Upbeat, friendly tone
                }
            }
        }
    };

    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error(`TTS API error: ${response.status}`);
    const result = await response.json();
    const part = result?.candidates?.[0]?.content?.parts?.[0];
    const audioData = part?.inlineData?.data;
    const mimeType = part?.inlineData?.mimeType;

    if (audioData && mimeType && mimeType.startsWith("audio/")) {
        const sampleRateMatch = mimeType.match(/rate=(\d+)/);
        const sampleRate = sampleRateMatch ? parseInt(sampleRateMatch[1], 10) : 24000;
        const pcmBuffer = base64ToArrayBuffer(audioData);
        const pcm16 = new Int16Array(pcmBuffer);
        const wavBlob = pcmToWav(pcm16, sampleRate);
        return URL.createObjectURL(wavBlob);
    }
    throw new Error("No synthesized sound stream returned.");
}

function base64ToArrayBuffer(base64) {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}

function pcmToWav(pcm16, sampleRate) {
    const buffer = new ArrayBuffer(44 + pcm16.length * 2);
    const view = new DataView(buffer);

    // "RIFF"
    view.setUint8(0, 0x52); view.setUint8(1, 0x49); view.setUint8(2, 0x46); view.setUint8(3, 0x46);
    view.setUint32(4, 36 + pcm16.length * 2, true);
    // "WAVE"
    view.setUint8(8, 0x57); view.setUint8(9, 0x41); view.setUint8(10, 0x56); view.setUint8(11, 0x45);
    // "fmt "
    view.setUint8(12, 0x66); view.setUint8(13, 0x6d); view.setUint8(14, 0x74); view.setUint8(15, 0x20);
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    // "data"
    view.setUint8(36, 0x64); view.setUint8(37, 0x61); view.setUint8(38, 0x74); view.setUint8(39, 0x61);
    view.setUint32(40, pcm16.length * 2, true);

    for (let i = 0; i < pcm16.length; i++) {
        view.setInt16(44 + i * 2, pcm16[i], true);
    }

    return new Blob([view], { type: 'audio/wav' });
}

// Play Synthesized Voice Output
async function playVoiceOver(text, buttonId) {
    const btn = document.getElementById(buttonId);
    const originalHTML = btn.innerHTML;

    try {
        if (activeVoiceAudio) {
            activeVoiceAudio.pause();
            activeVoiceAudio = null;
        }

        btn.innerHTML = `<i data-lucide="loader" class="w-3.5 h-3.5 animate-spin"></i> Speaking...`;
        lucide.createIcons();

        const audioUrl = await fetchTTS(text);
        activeVoiceAudio = new Audio(audioUrl);

        activeVoiceAudio.onended = () => {
            btn.innerHTML = originalHTML;
            lucide.createIcons();
        };

        await activeVoiceAudio.play();
        showNotification("Voice playback active!", "success");
    } catch (err) {
        console.error(err);
        showNotification("Could not load ALIF AI voice engine.", "error");
        btn.innerHTML = originalHTML;
        lucide.createIcons();
    }
}

// AI Quiz generator
async function generateAIQuiz(e) {
    e.preventDefault();
    const topicInput = document.getElementById('quiz-topic-input');
    const topic = topicInput?.value.trim();
    if (!topic) {
        showNotification('Please enter a quiz topic!', 'error');
        return;
    }

    isQuizGenerating = true;
    renderActiveTabContent();

    const schema = {
        type: "ARRAY",
        description: "A list of exactly 5 multiple choice questions on the requested topic.",
        items: {
            type: "OBJECT",
            properties: {
                question: { type: "STRING" },
                options: {
                    type: "ARRAY",
                    items: { type: "STRING" }
                },
                correctIndex: { type: "INTEGER" },
                explanation: { type: "STRING" }
            },
            required: ["question", "options", "correctIndex", "explanation"]
        }
    };

    const systemInstruction = `You are the master quiz creator for "ALIF CLASS UNION".
            Generate exactly 5 highly educational multiple-choice questions in English on the requested topic.
            Keep options challenging and include highly detailed explanations for each answer.`;

    try {
        const response = await fetchGeminiStructured(systemInstruction, `Topic: "${topic}"`, schema);
        activeQuizQuestions = response;
        currentQuizIndex = 0;
        userQuizScore = 0;
        currentQuizExplanation = '';
        showNotification("AI Quiz Arena loaded!", "success");
    } catch (err) {
        console.error(err);
        showNotification("Error generating Quiz. Try again.", "error");
    } finally {
        isQuizGenerating = false;
        renderActiveTabContent();
    }
}

function submitQuizAnswer(selectedIndex) {
    const q = activeQuizQuestions[currentQuizIndex];
    if (!q) return;

    const btns = document.querySelectorAll('.quiz-option-btn');
    btns.forEach((btn, idx) => {
        btn.disabled = true;
        if (idx === q.correctIndex) {
            btn.className = "w-full p-3 bg-emerald-600/30 border border-emerald-500/80 rounded-xl text-left font-bold text-emerald-200 text-xs";
        } else if (idx === selectedIndex) {
            btn.className = "w-full p-3 bg-rose-600/30 border border-rose-500/80 rounded-xl text-left font-bold text-rose-200 text-xs";
        } else {
            btn.className = "w-full p-3 bg-slate-950/40 border border-slate-900 rounded-xl text-left text-slate-500 text-xs";
        }
    });

    if (selectedIndex === q.correctIndex) {
        userQuizScore++;
        currentQuizExplanation = `🎯 Correct! ${q.explanation}`;
    } else {
        currentQuizExplanation = `❌ Incorrect. ${q.explanation}`;
    }

    document.getElementById('quiz-feedback-box').innerHTML = `
                <div class="p-4 rounded-xl bg-indigo-950/30 border border-indigo-900/40 text-indigo-300 text-xs leading-relaxed">
                    ${currentQuizExplanation}
                </div>
                <button onclick="advanceQuiz()" class="w-full mt-3 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-xs transition-all flex items-center justify-center gap-1.5 shadow-lg">
                    Next Question <i data-lucide="chevron-right" class="w-4 h-4"></i>
                </button>
            `;
    lucide.createIcons();
}

function advanceQuiz() {
    currentQuizIndex++;
    currentQuizExplanation = '';
    renderActiveTabContent();
}

function resetQuizArena() {
    activeQuizQuestions = [];
    currentQuizIndex = 0;
    userQuizScore = 0;
    currentQuizExplanation = '';
    renderActiveTabContent();
}

// ... [Continue with remaining JS from the HTML file]
