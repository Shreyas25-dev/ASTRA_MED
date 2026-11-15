import React, { useState, useEffect, useRef, Component } from 'react';
import {
  Activity,
  Heart,
  Thermometer,
  Wind,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Rocket,
  Clock,
  Compass,
  Zap,
  Pill,
  Cpu,
  Utensils,
  Smile,
  RefreshCw,
  FastForward,
  Volume2,
  VolumeX,
  Send,
  Download,
  Table,
  Mic,
  Terminal
} from 'lucide-react';

// ============================================================================
// 1. REACT ERROR BOUNDARY (STRICT SANDBOX CRASH-PREVENTION ARCHITECTURE)
// ============================================================================
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMsg: '' };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, errorMsg: error?.message || 'Avionics Telemetry UI Exception' };
  }

  componentDidCatch(error, info) {
    console.error('ASTRAL-MED ErrorBoundary caught runtime exception:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#050B14] text-[#F3F8FC] flex flex-col items-center justify-center p-6 font-mono">
          <div className="bg-[#0D1B2A] border border-[#EF4444] p-6 rounded-lg max-w-lg w-full text-center space-y-4">
            <ShieldAlert className="w-12 h-12 text-[#EF4444] mx-auto" />
            <h2 className="text-lg font-bold tracking-wider uppercase text-[#EF4444]">
              Avionics Telemetry Fault Intercepted
            </h2>
            <p className="text-xs text-[#8FA9BE]">{this.state.errorMsg}</p>
            <button
              onClick={() => this.setState({ hasError: false, errorMsg: '' })}
              className="px-4 py-2 bg-[#12263A] border border-[#1D3A52] hover:border-[#38BDF8] text-xs uppercase tracking-widest text-[#38BDF8] rounded transition"
            >
              Reinitialize Flight Deck HUD
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ============================================================================
// 2. MISSION ARES-IV STATIC REFERENCE DATA
// ============================================================================
const CREW_PROFILES = [
  { id: 'CMDR', name: 'CMDR. V. KOWALSKI', role: 'Mission Commander', age: 41, blood: 'O+', careerDays: 318.6 },
  { id: 'FE1', name: 'DR. A. PATEL', role: 'Flight Surgeon / Bio-Spec', age: 36, blood: 'A+', careerDays: 194.2 },
  { id: 'PLT', name: 'MAJ. M. CHEN', role: 'Heliocentric Pilot', age: 38, blood: 'B-', careerDays: 256.0 },
  { id: 'MS1', name: 'ENGR. S. ROSSI', role: 'ECLSS & Payload Specialist', age: 33, blood: 'AB+', careerDays: 142.6 }
];

const SCENARIO_CHIPS = [
  {
    id: 'co2_corr',
    label: 'CO2-Hypoxia Link',
    shortTitle: 'CO2 SCRUBBER LAG VS. ALVEOLAR HYPOXIA CORRELATION',
    riskScore: 84,
    confidence: '96.4% (R² = 0.91)',
    summary:
      'Telemetry regression confirms a strong inverse correlation (R² = 0.91) between Habitat CDRA Bed-B CO2 partial pressure rise (2.8 -> 4.9 mmHg) and crew SpO2 desaturation (98% -> 89%). Elevated inspired CO2 shifts the oxyhemoglobin dissociation curve while stimulating sympathetic chemoreceptors.',
    differentials: [
      { name: 'Hypercapnic Alveolar Hypoventilation & Sympathetic Reflex', prob: 78 },
      { name: 'Microgravity Ventilation-Perfusion (V/Q) Mismatch', prob: 16 },
      { name: 'Primary Myocardial Arrhythmia', prob: 6 }
    ],
    forecast: 'Administering O2 @ 4L/min + switching CDRA to Zeolite Bed-A restores SpO2 >= 97% within 3.5 minutes.'
  },
  {
    id: 'traj_6h',
    label: '6h Vitals Forecast',
    shortTitle: '6-HOUR AUTONOMIC & CARDIOVASCULAR FORECAST',
    riskScore: 76,
    confidence: '92.8% (Monte Carlo)',
    summary:
      'Without pharmacological or vagal intervention, sympathetic positive-feedback projects HR reaching 128 BPM and HRV dropping below 16ms within 90 minutes, increasing cognitive fatigue and orthostatic intolerance.',
    differentials: [
      { name: 'With Locker B4 Propranolol 10mg + 4-7-8 Pacer: HR 69 BPM / HRV 62ms', prob: 94 },
      { name: 'Unmitigated Trajectory (No Intervention): HR 128 BPM / Stress 94%', prob: 88 },
      { name: 'Residual Sinus Tachycardia Post-Dose', prob: 8 }
    ],
    forecast: 'Propranolol 10mg oral achieves beta-1 blockade in 45 mins; 4-7-8 vagal pacer decelerates SA-node firing in < 90 seconds.'
  },
  {
    id: 'eva_bone',
    label: 'EVA Readiness Check',
    shortTitle: 'MARS ORBITAL EVA FITNESS & MUSCULOSKELETAL AUDIT',
    riskScore: 28,
    confidence: '98.2% (HRP Baseline)',
    summary:
      'Lumbar spine (98.4% baseline), femoral neck (97.9%), and lean muscle mass (99.1%) remain preserved on Transit Day 142 via daily ARED resistive load (115 mins, 790 kcal) and 42 ng/mL Vitamin D status. Acute EVA clearance is paused during active tachycardia.',
    differentials: [
      { name: 'Chronic Musculoskeletal Readiness for Mars Gravity (0.38G)', prob: 95 },
      { name: 'Acute Cardiopulmonary EVA Hold (When HR > 105 BPM)', prob: 89 },
      { name: 'Renal Calcium Oxalate Risk', prob: 12 }
    ],
    forecast: 'Clear for extravehicular activity once HR remains < 85 BPM and SpO2 >= 96%.'
  },
  {
    id: 'soap_note',
    label: 'Generate SOAP Note',
    shortTitle: 'AUTONOMOUS FLIGHT SURGEON CLINICAL SOAP RECORD',
    riskScore: 70,
    confidence: '99.0% (Verified)',
    summary:
      'SUBJECTIVE: Crew logs mild sinus congestion & exertional dyspnea during CDRA scrubber thermal lag. OBJECTIVE: HR 118 BPM, SpO2 89%, HRV 22ms, Temp 37.7°C, Cortisol 31.2 ug/dL, Cabin CO2 4.9 mmHg. ASSESSMENT: Acute hypercapnic sympathetic tachycardia. PLAN: Med-Bay Locker B4 Drawer 2 (Propranolol 10mg PO + O2 4L/min + 600mL ORS) & 4-7-8 vagal breathing.',
    differentials: [
      { name: 'ICD-10 R00.0 / T75.82: Microgravity Autonomic Tachycardia + CO2 Exposure', prob: 86 },
      { name: 'ICD-10 J96.91: Acute Mild Alveolar Hypoxemia', prob: 14 }
    ],
    forecast: 'Appended to Hermes-II medical ledger for delayed store-and-forward downlink to Houston JSC (14m 18s OWLT).'
  }
];

const RATION_ITEMS = [
  { id: 'r1', meal: 'Breakfast', name: 'Thermostabilized Berry Quinoa & Espresso Pouch', kcal: 540, protein: 18, sodium: 410, water: 350 },
  { id: 'r2', meal: 'Lunch', name: 'Rehydratable Lentil Curry & Whole-Wheat Tortilla', kcal: 780, protein: 34, sodium: 690, water: 500 },
  { id: 'r3', meal: 'Dinner', name: 'Irradiated Fajita Chicken & Spinach Medley', kcal: 820, protein: 48, sodium: 740, water: 450 },
  { id: 'r4', meal: 'Countermeasure', name: 'Med-Bay Oral Rehydration Electrolyte Pack (ORS)', kcal: 90, protein: 0, sodium: 520, water: 600 }
];

const OLLAMA_BASE_URL = 'http://localhost:11434';

const SYMPTOM_CHIPS = [
  'Space Adaptation Headache',
  'Nasal/Sinus Congestion',
  'Mild Dyspnea',
  'Visual Acuity Shift / SANS',
  'Fatigue',
  'Dizziness'
];

// ============================================================================
// 3. MAIN CLEAN & CLUTTER-FREE DASHBOARD COMPONENT
// ============================================================================
function AstralMedDashboard() {
  useEffect(() => {
    document.title = 'ASTRAL-MED | ARES-IV Mission Control';
  }, []);

  // Navigation & Filtering State
  const [activeTab, setActiveTab] = useState('BIOMETRICS');
  const [selectedCrew, setSelectedCrew] = useState(CREW_PROFILES[0]);
  const [tableFilter, setTableFilter] = useState('ALL'); // 'ALL' | 'VITALS' | 'SLEEP & ACTIVITY' | 'BONE & BIOMARKERS'

  // Simulation Speed & Phase State
  const [demoSpeed, setDemoSpeed] = useState(1); // 1x or 6x
  const [phase, setPhase] = useState('NOMINAL'); // 'NOMINAL' | 'CAUTION' | 'CRITICAL'
  const [cycleSeconds, setCycleSeconds] = useState(0); // 0..119 continuous scenario loop
  const [hrPollCountdown, setHrPollCountdown] = useState(60);
  const [tempPollCountdown, setTempPollCountdown] = useState(1800); // 30 minutes (1800s)

  // Voice-Over Synthesis State (Web Speech API)
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Refs for Single Master Clock & Voice Engine
  const demoSpeedRef = useRef(1);
  const phaseRef = useRef('NOMINAL');
  const cycleRef = useRef(0);
  const voiceEnabledRef = useRef(true);
  const breathingActiveRef = useRef(false);

  useEffect(() => {
    demoSpeedRef.current = demoSpeed;
  }, [demoSpeed]);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    voiceEnabledRef.current = voiceEnabled;
    if (!voiceEnabled && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [voiceEnabled]);

  // Complete Biometric & Biomarker State
  const [vitals, setVitals] = useState({
    hr: 68,
    spo2: 98,
    temp: 36.8,
    bpSys: 116,
    bpDia: 74,
    hrv: 64,
    stress: 21,
    sleepHours: 7.4,
    remPct: 24,
    deepPct: 21,
    circadianScore: 94,
    activityMins: 115,
    kcalBurned: 790,
    spineDensity: 98.4,
    femurDensity: 97.9,
    muscleMass: 99.1,
    cortisol: '11.4 ug/dL',
    crp: '0.6 mg/L',
    troponin: '< 0.01 ng/mL',
    vitD: '42.0 ng/mL'
  });

  // Tab 2: Spacecraft & Mars Transit Telemetry State
  const [spacecraft, setSpacecraft] = useState({
    metDays: 142,
    metHours: 14,
    metMins: 38,
    metSecs: 12,
    distanceKm: 168.42105, // million km
    velocityKms: 24.62,
    cabinPressure: 101.3,
    cabinTemp: 21.4,
    cabinHumidity: 44,
    co2MmHg: 2.8,
    co2Ppm: 3680,
    radCumulativeMsv: 184.6,
    radRateMsvDay: 1.28
  });

  // Live Telemetry Event Ledger
  const [telemetryLogs, setTelemetryLogs] = useState([
    {
      id: 'ev-1',
      met: '142d 14:38:00',
      category: 'SURVEILLANCE',
      parameter: 'ALL BIOMETRICS',
      value: 'HR 68 BPM | SpO2 98%',
      status: 'NOMINAL',
      action: '60s Nominal Polling Active — Crew Fit for Duty'
    },
    {
      id: 'ev-2',
      met: '142d 14:10:00',
      category: 'THERMAL POLL',
      parameter: 'CORE BODY TEMP',
      value: '36.8 °C',
      status: 'NOMINAL',
      action: '30-Minute Thermal Baseline Confirmed'
    }
  ]);

  // Tab 3: Symptoms, Nutrition & Wellbeing State
  const [loggedSymptoms, setLoggedSymptoms] = useState([
    { id: 1, name: 'Nasal/Sinus Congestion', severity: 'Mild', time: 'MET 142d 08:15' }
  ]);
  const [selectedSeverity, setSelectedSeverity] = useState('Mild');
  const [consumedRations, setConsumedRations] = useState(['r1', 'r2']);
  const [wellbeing, setWellbeing] = useState({
    mood: 8,
    focus: 8,
    soreness: 3,
    workload: 4
  });

  // Ollama / Edge-AI Flight Surgeon State (Defaults to Safe Simulated Mode)
  const [aiMode, setAiMode] = useState('SIMULATED'); // 'SIMULATED' | 'LIVE_OLLAMA'
  const [ollamaModel, setOllamaModel] = useState('llama3.2:3b');
  const [activeScenario, setActiveScenario] = useState(SCENARIO_CHIPS[0]);
  const [aiResponse, setAiResponse] = useState(
    'ASTRAL-MED EDGE-AI SURGEON ONLINE [MISSION ARES-IV]. All biometric and biomarker channels for CMDR. V. Kowalski are within nominal microgravity baselines. Next routine HR telemetry poll in 60s; core thermal poll in 30m.'
  );
  const [aiLoading, setAiLoading] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');

  // Guided 4-7-8 Vagal Breathing Pacer State
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathTick, setBreathTick] = useState(0); // 0..18 (4s Inhale, 7s Hold, 8s Exhale)

  useEffect(() => {
    breathingActiveRef.current = breathingActive;
  }, [breathingActive]);

  // ==========================================================================
  // NATIVE BROWSER VOICE-OVER SYNTHESIZER (WEB SPEECH API)
  // ==========================================================================
  const speakTelemetry = (text, forceInterrupt = true) => {
    if (!voiceEnabledRef.current) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    try {
      if (forceInterrupt) {
        window.speechSynthesis.cancel();
      }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.03;
      utterance.pitch = 0.96;
      utterance.volume = 1.0;

      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(
        (v) =>
          v.lang.startsWith('en') &&
          (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Microsoft'))
      );
      if (preferred) utterance.voice = preferred;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    } catch {
      setIsSpeaking(false);
    }
  };

  // Append to Telemetry Event Log
  const appendLog = (category, parameter, value, status, action) => {
    setTelemetryLogs((prev) => [
      {
        id: `ev-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        met: `142d ${String(spacecraft.metHours).padStart(2, '0')}:${String(spacecraft.metMins).padStart(2, '0')}:${String(
          spacecraft.metSecs
        ).padStart(2, '0')}`,
        category,
        parameter,
        value,
        status,
        action
      },
      ...prev.slice(0, 11)
    ]);
  };

  // Apply Phase Vitals Snapshot Helper
  const applyPhaseSnapshot = (targetPhase, announceVoice = true) => {
    phaseRef.current = targetPhase;
    setPhase(targetPhase);

    if (targetPhase === 'NOMINAL') {
      setHrPollCountdown(60);
      setVitals((v) => ({
        ...v,
        hr: 68,
        spo2: 98,
        temp: 36.8,
        bpSys: 116,
        bpDia: 74,
        hrv: 64,
        stress: 21,
        cortisol: '11.4 ug/dL',
        crp: '0.6 mg/L'
      }));
      setSpacecraft((s) => ({ ...s, co2MmHg: 2.8, co2Ppm: 3680 }));
      const msg =
        'AUTONOMOUS TRIAGE UPDATE: Vitals stabilized within NASA Nominal Flight Envelope (HR 68 BPM, SpO2 98%, HRV 64ms). Adaptive telemetry returned to 60-second surveillance polling. Astronaut cleared: FIT FOR MISSION DUTY.';
      setAiResponse(msg);
      appendLog('RECOVERY', 'CARDIOPULMONARY', 'HR 68 | SpO2 98%', 'NOMINAL', 'Restored 60s Nominal Surveillance');
      if (announceVoice) {
        speakTelemetry(
          'Countermeasure logged. Heart rate stabilized at 68 beats per minute, blood oxygen 98 percent. Returning to 60-second nominal surveillance.'
        );
      }
    } else if (targetPhase === 'CAUTION') {
      setHrPollCountdown(10);
      setVitals((v) => ({
        ...v,
        hr: 102,
        spo2: 93,
        temp: 37.3,
        bpSys: 132,
        bpDia: 84,
        hrv: 38,
        stress: 64,
        cortisol: '21.8 ug/dL',
        crp: '1.4 mg/L'
      }));
      setSpacecraft((s) => ({ ...s, co2MmHg: 4.1, co2Ppm: 5390 }));
      const msg =
        'CAUTION ADVISORY: Early sympathetic drift & localized cabin CO2 scrubber lag detected (4.1 mmHg). HR elevated to 102 BPM, SpO2 at 93%. Switching telemetry to 10-second High-Frequency Surveillance.';
      setAiResponse(msg);
      appendLog('THRESHOLD DRIFT', 'HR / CABIN CO2', '102 BPM | 4.1 mmHg', 'CAUTION', 'Switched to 10s Emergency Polling');
      if (announceVoice) {
        speakTelemetry(
          'Caution advisory. Early sympathetic drift and cabin C O 2 elevation detected. Switching to 10-second high frequency tracking.'
        );
      }
    } else if (targetPhase === 'CRITICAL') {
      setHrPollCountdown(10);
      setBreathingActive(true);
      setActiveScenario(SCENARIO_CHIPS[0]);
      setVitals((v) => ({
        ...v,
        hr: 118,
        spo2: 89,
        temp: 37.7,
        bpSys: 144,
        bpDia: 92,
        hrv: 22,
        stress: 86,
        cortisol: '31.2 ug/dL',
        crp: '2.3 mg/L'
      }));
      setSpacecraft((s) => ({ ...s, co2MmHg: 4.9, co2Ppm: 6440 }));
      const msg =
        'CRITICAL DISTRESS [NOT FIT FOR DUTY]: Microgravity tachycardia (118 BPM) and mild alveolar hypoxia (SpO2 89%) triggered by localized CO2 pocket (4.9 mmHg) + sympathetic surge. ACTION: Retrieve Propranolol 10mg + O2 Mask (Med-Bay Locker B4, Drawer 2) and follow the 4-7-8 Vagal Breathing Pacer.';
      setAiResponse(msg);
      appendLog(
        'MASTER ALARM',
        'HR / SpO2 / SNS',
        '118 BPM | SpO2 89%',
        'CRITICAL',
        'Prescribed Locker B4 Propranolol 10mg + O2 @ 4L/min + Vagal Pacer'
      );
      if (announceVoice) {
        speakTelemetry(
          'Warning. Critical biometric alert. Heart rate 118 beats per minute, blood oxygen 89 percent. High-frequency 10-second polling active. Retrieve Propranolol 10 milligrams and Oxygen mask from Med-Bay Locker B 4 Drawer 2.'
        );
      }
    }
  };

  // ==========================================================================
  // STRICT SINGLE MASTER CLOCK (1000ms) - EMPTY DEPENDENCY ARRAY
  // ==========================================================================
  useEffect(() => {
    const masterTimer = setInterval(() => {
      const speed = demoSpeedRef.current;

      // 1. Advance 120s Scenario Loop (0-59s Nominal, 60-71s Caution, 72-119s Critical)
      const nextCycle = (cycleRef.current + speed) % 120;
      cycleRef.current = nextCycle;
      setCycleSeconds(nextCycle);

      let expectedPhase = 'NOMINAL';
      if (nextCycle >= 60 && nextCycle < 72) {
        expectedPhase = 'CAUTION';
      } else if (nextCycle >= 72) {
        expectedPhase = 'CRITICAL';
      }

      if (expectedPhase !== phaseRef.current) {
        applyPhaseSnapshot(expectedPhase, true);
      }

      // 2. Adaptive HR/SpO2 Polling Countdown (60s Nominal / 10s Distress)
      setHrPollCountdown((prev) => {
        const nextVal = prev - speed;
        if (nextVal <= 0) {
          const isDistress = phaseRef.current !== 'NOMINAL';
          const delta = Math.floor(Math.random() * 5) - 2;
          setVitals((v) => ({
            ...v,
            hr: isDistress
              ? Math.min(126, Math.max(106, v.hr + delta))
              : Math.min(76, Math.max(63, v.hr + delta)),
            spo2: isDistress
              ? Math.min(91, Math.max(88, v.spo2 + (delta > 0 ? 1 : -1)))
              : 98
          }));
          return isDistress ? 10 : 60;
        }
        return nextVal;
      });

      // 3. 30-Minute Body Temp Polling Countdown
      setTempPollCountdown((prev) => {
        const nextTemp = prev - speed;
        return nextTemp <= 0 ? 1800 : nextTemp;
      });

      // 4. Advance Mission Elapsed Time (MET) & Spacecraft Distance
      setSpacecraft((prev) => {
        let secs = prev.metSecs + 1;
        let mins = prev.metMins;
        let hours = prev.metHours;
        let days = prev.metDays;
        if (secs >= 60) {
          secs = 0;
          mins += 1;
        }
        if (mins >= 60) {
          mins = 0;
          hours += 1;
        }
        if (hours >= 24) {
          hours = 0;
          days += 1;
        }
        return {
          ...prev,
          metDays: days,
          metHours: hours,
          metMins: mins,
          metSecs: secs,
          distanceKm: +(prev.distanceKm + 0.00024).toFixed(5)
        };
      });

      // 5. Advance 4-7-8 Breathing Pacer & Optional Voice Cue
      setBreathTick((prev) => {
        const nextTick = (prev + 1) % 19;
        if (breathingActiveRef.current && voiceEnabledRef.current) {
          if (nextTick === 0) speakTelemetry('Inhale slowly for 4 seconds.', false);
          if (nextTick === 4) speakTelemetry('Hold breath for 7 seconds.', false);
          if (nextTick === 11) speakTelemetry('Exhale slowly for 8 seconds.', false);
        }
        return nextTick;
      });
    }, 1000);

    return () => clearInterval(masterTimer);
  }, []);

  // ==========================================================================
  // HACKATHON CONTROLS & AI HANDLERS
  // ==========================================================================
  const handleForceDistress = () => {
    cycleRef.current = 75;
    setCycleSeconds(75);
    applyPhaseSnapshot('CRITICAL', true);
  };

  const handleRestoreNominal = () => {
    cycleRef.current = 0;
    setCycleSeconds(0);
    setBreathingActive(false);
    applyPhaseSnapshot('NOMINAL', true);
  };

  const handleSelectScenarioChip = (chip) => {
    setActiveScenario(chip);
    setAiResponse(`[${chip.shortTitle}]: ${chip.summary} FORECAST: ${chip.forecast}`);
    appendLog('AI SCENARIO', chip.label.toUpperCase(), `Risk ${chip.riskScore}/100`, phase, chip.shortTitle);
    speakTelemetry(`${chip.shortTitle}. ${chip.summary}`);
  };

  const handleExportTelemetry = () => {
    const payload = {
      mission: 'ARES-IV HERMES-II',
      crew: selectedCrew,
      status: phase,
      vitals,
      spacecraft,
      telemetryLogs,
      loggedSymptoms,
      wellbeing,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `astral-med-${selectedCrew.id.toLowerCase()}-day${spacecraft.metDays}.json`;
    a.click();
    URL.revokeObjectURL(url);
    speakTelemetry('Mission medical telemetry exported to JSON.');
  };

  // Safe Hybrid Ollama Consultation (30-second timeout + silent fallback)
  const runFlightSurgeonAnalysis = async (userQuery = '') => {
    setAiLoading(true);
    const promptText = `You are ASTRAL-MED, an onboard autonomous NASA Flight Surgeon AI on the Hermes-II Mars Transit Habitat (14m 18s comms delay to Earth). Speak directly to astronaut ${selectedCrew.name} in 3 concise, data-centric sentences citing exact metrics: Status=${phase}, HR=${vitals.hr} BPM, SpO2=${vitals.spo2}%, HRV=${vitals.hrv}ms, Cabin CO2=${spacecraft.co2MmHg} mmHg. ${
      userQuery ? `Astronaut asks: "${userQuery}"` : 'Provide clinical assessment and validate Med-Bay Locker B4 protocol.'
    }`;

    if (aiMode === 'LIVE_OLLAMA') {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      try {
        const res = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: ollamaModel,
            prompt: promptText,
            stream: false
          }),
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        if (!res.ok) throw new Error('Ollama HTTP error');
        const data = await res.json();
        const reply = data.response || 'Telemetry verified. Maintain current protocol.';
        setAiResponse(reply);
        setAiLoading(false);
        speakTelemetry(reply);
        return;
      } catch {
        clearTimeout(timeoutId);
      }
    }

    setTimeout(() => {
      let generatedReply = '';
      if (userQuery.trim()) {
        generatedReply = `[EDGE-AI RESPONSE TO "${userQuery.toUpperCase()}"]: With Earth 168.4M km away (14m 18s delay), live telemetry shows HR=${vitals.hr} BPM, SpO2=${vitals.spo2}%, HRV=${vitals.hrv}ms, and Cabin CO2=${spacecraft.co2MmHg} mmHg. ${
          phase === 'NOMINAL'
            ? `Vagal tone (${vitals.hrv}ms) and cortisol (${vitals.cortisol}) confirm full cardiovascular readiness; continue daily 115-min ARED load.`
            : `Elevated cabin CO2 (${spacecraft.co2MmHg} mmHg) is driving hypercapnic tachycardia—administer Locker B4 Drawer 2 Propranolol 10mg + O2 @ 4L/min and complete 3 cycles of 4-7-8 breathing.`
        }`;
      } else if (phase === 'NOMINAL') {
        generatedReply = `[EDGE-AI CLINICAL BRIEF]: ${selectedCrew.name} exhibits optimal microgravity adaptation (HR ${vitals.hr} BPM, SpO2 ${vitals.spo2}%, Core ${vitals.temp}°C, HRV ${vitals.hrv}ms). Spine bone density is ${vitals.spineDensity}% of baseline. Cleared for EVA and payload operations.`;
      } else {
        generatedReply = `[EDGE-AI INTERVENTION BRIEF]: ${selectedCrew.name}, your heart rate (${vitals.hr} BPM) and dip in SpO2 (${vitals.spo2}%) correlate with cabin CO2 elevation (${spacecraft.co2MmHg} mmHg). Retrieve the Supplemental O2 mask + Propranolol 10mg from Med-Bay Locker B4 (Drawer 2), and follow the 4-7-8 vagal breathing pacer.`;
      }
      setAiResponse(generatedReply);
      setAiLoading(false);
      speakTelemetry(generatedReply);
    }, 300);
  };

  // Nutrition Totals
  const nutritionTotals = consumedRations.reduce(
    (acc, id) => {
      const item = RATION_ITEMS.find((r) => r.id === id);
      if (item) {
        acc.kcal += item.kcal;
        acc.protein += item.protein;
        acc.sodium += item.sodium;
        acc.water += item.water;
      }
      return acc;
    },
    { kcal: 0, protein: 0, sodium: 0, water: 0 }
  );

  // Semantic Colors
  const isNominal = phase === 'NOMINAL';
  const isCaution = phase === 'CAUTION';
  const statusColorHex = isNominal ? '#38BDF8' : isCaution ? '#F59E0B' : '#EF4444';

  const getBadgeStyle = (st) => {
    if (st === 'CRITICAL') return 'bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/60';
    if (st === 'CAUTION') return 'bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/60';
    return 'bg-[#38BDF8]/15 text-[#38BDF8] border border-[#38BDF8]/40';
  };

  // 4-7-8 Breathing Pacer Helper
  const getBreathPhaseText = () => {
    if (breathTick < 4) return { label: 'INHALE SLOWLY (NOSE)', count: 4 - breathTick };
    if (breathTick < 11) return { label: 'HOLD BREATH (VAGAL LOCK)', count: 11 - breathTick };
    return { label: 'EXHALE PURSED LIPS', count: 19 - breathTick };
  };
  const breathState = getBreathPhaseText();

  // Clean Tabular Biometric Matrix Rows
  const biometricTableRows = [
    {
      id: 'hr',
      category: 'VITALS',
      param: 'Heart Rate (Lead-II ECG)',
      value: `${vitals.hr} BPM`,
      baseline: '60 – 100 BPM',
      poll: isNominal ? `60s (${hrPollCountdown}s)` : `10s (${hrPollCountdown}s)`,
      status: vitals.hr > 105 ? 'CRITICAL' : vitals.hr > 95 ? 'CAUTION' : 'NOMINAL'
    },
    {
      id: 'spo2',
      category: 'VITALS',
      param: 'Blood Oxygen Saturation (SpO2)',
      value: `${vitals.spo2}%`,
      baseline: '95 – 100%',
      poll: isNominal ? `60s (${hrPollCountdown}s)` : `10s (${hrPollCountdown}s)`,
      status: vitals.spo2 < 92 ? 'CRITICAL' : vitals.spo2 < 95 ? 'CAUTION' : 'NOMINAL'
    },
    {
      id: 'temp',
      category: 'VITALS',
      param: 'Core Body Temperature',
      value: `${vitals.temp} °C`,
      baseline: '36.5 – 37.5 °C',
      poll: `30m (${Math.floor(tempPollCountdown / 60)}m ${tempPollCountdown % 60}s)`,
      status: vitals.temp > 37.6 ? 'CAUTION' : 'NOMINAL'
    },
    {
      id: 'hrv',
      category: 'VITALS',
      param: 'Heart Rate Variability (HRV)',
      value: `${vitals.hrv} ms`,
      baseline: '45 – 85 ms',
      poll: 'Continuous',
      status: vitals.hrv < 28 ? 'CRITICAL' : vitals.hrv < 42 ? 'CAUTION' : 'NOMINAL'
    },
    {
      id: 'stress',
      category: 'VITALS',
      param: 'Sympathetic Stress Index',
      value: `${vitals.stress} / 100`,
      baseline: '< 40 / 100',
      poll: '10s Neural',
      status: vitals.stress > 75 ? 'CRITICAL' : vitals.stress > 50 ? 'CAUTION' : 'NOMINAL'
    },
    {
      id: 'sleep',
      category: 'SLEEP & ACTIVITY',
      param: 'Sleep Architecture & Circadian Align',
      value: `${vitals.sleepHours}h (REM ${vitals.remPct}% / Deep ${vitals.deepPct}%)`,
      baseline: '7.0 – 8.5 hrs',
      poll: 'Daily Log (94% Align)',
      status: 'NOMINAL'
    },
    {
      id: 'activity',
      category: 'SLEEP & ACTIVITY',
      param: 'Physical Activity (ARED + Treadmill)',
      value: `${vitals.activityMins} mins (${vitals.kcalBurned} kcal)`,
      baseline: '90 – 120 mins/day',
      poll: 'Daily Load',
      status: 'NOMINAL'
    },
    {
      id: 'bone',
      category: 'BONE & BIOMARKERS',
      param: 'Muscle & Bone Density (% Baseline)',
      value: `Spine ${vitals.spineDensity}% | Femur ${vitals.femurDensity}% | Muscle ${vitals.muscleMass}%`,
      baseline: '> 95.0% Earth Baseline',
      poll: 'Weekly Audit',
      status: 'NOMINAL'
    },
    {
      id: 'cortisol',
      category: 'BONE & BIOMARKERS',
      param: 'Salivary Cortisol (Stress Hormone)',
      value: vitals.cortisol,
      baseline: '6.0 – 18.0 ug/dL',
      poll: 'Lab Patch',
      status: isNominal ? 'NOMINAL' : isCaution ? 'CAUTION' : 'CRITICAL'
    },
    {
      id: 'crp',
      category: 'BONE & BIOMARKERS',
      param: 'C-Reactive Protein (CRP) & Troponin-I',
      value: `CRP: ${vitals.crp} | Trop-I: ${vitals.troponin}`,
      baseline: 'CRP < 1.0 mg/L',
      poll: 'Lab Patch',
      status: isNominal ? 'NOMINAL' : 'CAUTION'
    },
    {
      id: 'vitd',
      category: 'BONE & BIOMARKERS',
      param: 'Serum Vitamin D & Calcium Balance',
      value: vitals.vitD,
      baseline: '30 – 60 ng/mL',
      poll: 'Weekly Audit',
      status: 'NOMINAL'
    }
  ];

  const filteredBiometricRows = biometricTableRows.filter((row) => {
    if (tableFilter === 'ALL') return true;
    return row.category === tableFilter;
  });

  return (
    <div className="space-shell min-h-screen bg-[#050B14] text-[#F3F8FC] font-sans selection:bg-[#38BDF8]/30 pb-12">
      {/* Pure CSS Keyframes for ECG Waveform */}
      <style>{`
        @keyframes ecgScroll {
          0% { stroke-dashoffset: 600; }
          100% { stroke-dashoffset: 0; }
        }
        .ecg-line-nominal {
          stroke-dasharray: 600;
          animation: ecgScroll 3.2s linear infinite;
        }
        .ecg-line-distress {
          stroke-dasharray: 600;
          animation: ecgScroll 1.15s linear infinite;
        }

        :root { color-scheme: dark; }
        html { scroll-behavior: smooth; background: #050B14; }
        body { margin: 0; background: #050B14; }
        .space-shell { position: relative; isolation: isolate; overflow-x: clip; background: radial-gradient(ellipse at 12% 2%, rgba(14,116,144,.18), transparent 35%), radial-gradient(ellipse at 88% 16%, rgba(30,64,175,.16), transparent 32%), linear-gradient(180deg,#050B14 0%,#071321 48%,#050B14 100%); }
        .space-shell::before { content: ""; position: fixed; inset: 0; z-index: -1; pointer-events: none; opacity: .34; background-image: radial-gradient(1px 1px at 8% 18%,#d9f2ff 98%,transparent), radial-gradient(1px 1px at 26% 72%,#d9f2ff 98%,transparent), radial-gradient(1.5px 1.5px at 48% 32%,#fff 98%,transparent), radial-gradient(1px 1px at 68% 82%,#d9f2ff 98%,transparent), radial-gradient(1px 1px at 84% 22%,#fff 98%,transparent), radial-gradient(1px 1px at 94% 62%,#d9f2ff 98%,transparent); background-size: 260px 220px; animation: starDrift 90s linear infinite; }
        .space-shell::after { content: ""; position: fixed; inset: auto -20% -38% -20%; height: 55vh; z-index: -1; pointer-events: none; background: radial-gradient(ellipse,rgba(14,165,233,.09),transparent 68%); }
        @keyframes starDrift { from { transform: translateY(0); } to { transform: translateY(220px); } }
        @keyframes riseIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes orbitSpin { to { transform: rotate(360deg); } }
        @keyframes planetPulse { 0%,100% { box-shadow: 0 0 22px rgba(56,189,248,.25), inset -12px -8px 18px rgba(2,6,23,.7); } 50% { box-shadow: 0 0 42px rgba(56,189,248,.42), inset -12px -8px 18px rgba(2,6,23,.7); } }
        .space-shell main > section, .space-shell main > div { animation: riseIn .65s ease both; }
        .space-shell [class*="bg-[#0D1B2A]"] { background: rgba(10,27,44,.78); backdrop-filter: blur(12px); border-color: rgba(100,170,210,.22); box-shadow: 0 12px 36px rgba(0,0,0,.16), inset 0 1px rgba(255,255,255,.025); transition: border-color .25s ease, transform .25s ease, box-shadow .25s ease; }
        .space-shell [class*="bg-[#0D1B2A]"]:hover { border-color: rgba(125,211,252,.42); box-shadow: 0 16px 42px rgba(0,0,0,.24), 0 0 24px rgba(56,189,248,.045); }
        .space-shell button { transition: transform .18s ease, border-color .2s ease, background-color .2s ease, color .2s ease; }
        .space-shell button:hover { transform: translateY(-1px); }
        .space-shell button:active { transform: translateY(0) scale(.985); }
        .space-shell button:focus-visible, .space-shell select:focus-visible, .space-shell input:focus-visible { outline: 2px solid #7dd3fc; outline-offset: 3px; }
        .space-shell table tbody tr { transition: background-color .18s ease; }
        .mission-hero { background: linear-gradient(115deg,rgba(8,31,51,.96),rgba(8,24,43,.78) 55%,rgba(13,54,78,.55)); box-shadow: 0 22px 65px rgba(0,0,0,.24), inset 0 1px rgba(255,255,255,.05); }
        .mission-hero-grid { display: grid; grid-template-columns: minmax(0,1.4fr) minmax(220px,.6fr); align-items: center; gap: 1rem; min-height: 205px; }
        .mission-chip { padding: 7px 10px; border: 1px solid rgba(125,211,252,.2); border-radius: 999px; background: rgba(2,12,24,.38); color: #b9d6e9; font-size: 9px; letter-spacing: .1em; }
        .orbit-art { position: relative; height: 220px; display: grid; place-items: center; }
        .orbit-planet { width: 82px; height: 82px; border-radius: 50%; background: radial-gradient(circle at 32% 28%,#a5e5ff 0%,#2787bb 34%,#12466e 72%,#071827 100%); animation: planetPulse 4s ease-in-out infinite; }
        .orbit { position: absolute; width: 175px; height: 175px; border: 1px solid rgba(125,211,252,.35); border-radius: 50%; transform: rotate(-24deg) scaleY(.42); }
        .orbit-two { width: 245px; height: 245px; border-color: rgba(245,158,11,.28); transform: rotate(48deg) scaleY(.42); }
        .orbit span { position: absolute; width: 9px; height: 9px; top: 16%; left: 13%; border-radius: 50%; background: #7dd3fc; box-shadow: 0 0 14px #38bdf8; }
        .orbit-two span { background: #fbbf24; box-shadow: 0 0 14px #f59e0b; top: 12%; left: 82%; }
        .orbit-label { position: absolute; font: 9px ui-monospace,monospace; letter-spacing: .16em; color: #9dbbd0; }
        .orbit-label b { color: #7dd3fc; font-weight: 600; margin-left: 6px; }
        .orbit-label-top { top: 8px; right: 8px; } .orbit-label-bottom { bottom: 7px; left: 8px; }
        @media (max-width: 700px) { .mission-hero-grid { grid-template-columns: 1fr; } .orbit-art { height: 145px; transform: scale(.82); margin: -4px 0; } }
        @media (prefers-reduced-motion: reduce) { *,*::before,*::after { scroll-behavior: auto !important; animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; } }
      `}</style>

      {/* ==================================================================== */}
      {/* CLEAN TOP HEADER & SIMPLE 3-TAB NAVIGATION                           */}
      {/* ==================================================================== */}
      <header className="sticky top-0 z-30 bg-[#050F1D]/85 backdrop-blur-xl border-b border-sky-300/10 px-5 sm:px-7 py-3 shadow-[0_12px_35px_rgba(0,0,0,.18)]">
        <div className="max-w-[1600px] mx-auto flex flex-wrap items-center justify-between gap-4">
          {/* Brand & Mission Info */}
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-md bg-[#0D1B2A] border flex items-center justify-center"
              style={{ borderColor: statusColorHex }}
            >
              <Activity className="w-5 h-5" style={{ color: statusColorHex }} />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-base font-bold tracking-wider uppercase font-mono">
                  ASTRAL-MED
                </h1>
                <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded bg-[#12263A] border border-[#1D3A52] text-[#D7E7F5]">
                  MISSION ARES-IV • DAY 142/210
                </span>
              </div>
              <p className="text-xs text-[#8FA9BE] font-mono">
                Earth Dist: <span className="text-[#F3F8FC]">{spacecraft.distanceKm}M km</span> • One-Way Delay:{' '}
                <span className="text-[#F59E0B]">14m 18s (Autonomous Mode)</span>
              </p>
            </div>
          </div>

          {/* Duty Fitness Status Pill */}
          <div
            className={`px-4 py-1.5 rounded-md border flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider ${
              isNominal
                ? 'bg-[#38BDF8]/10 border-[#38BDF8]/50 text-[#38BDF8]'
                : isCaution
                ? 'bg-[#F59E0B]/15 border-[#F59E0B] text-[#F59E0B]'
                : 'bg-[#EF4444]/20 border-[#EF4444] text-[#EF4444] animate-pulse'
            }`}
          >
            {isNominal ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            <span>
              {isNominal
                ? 'FIT FOR DUTY (60s POLLING)'
                : isCaution
                ? 'CAUTION: BORDERLINE DRIFT (10s POLL)'
                : 'NOT FIT FOR DUTY — INTERVENTION REQUIRED (10s POLL)'}
            </span>
          </div>

          {/* Simple Controls Bar */}
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={selectedCrew.id}
              onChange={(e) => {
                const found = CREW_PROFILES.find((c) => c.id === e.target.value);
                if (found) {
                  setSelectedCrew(found);
                  speakTelemetry(`Switched crew monitor to ${found.name}.`);
                }
              }}
              aria-label="Select Crew Member"
              className="bg-[#0D1B2A] border border-[#1D3A52] text-xs font-mono text-[#F3F8FC] rounded-md px-3 py-1.5 focus:outline-none focus:border-[#D7E7F5]"
            >
              {CREW_PROFILES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.id})
                </option>
              ))}
            </select>

            <button
              onClick={() => {
                const next = !voiceEnabled;
                setVoiceEnabled(next);
                if (next) {
                  voiceEnabledRef.current = true;
                  speakTelemetry('Voice telemetry enabled.');
                }
              }}
              className={`px-3 py-1.5 rounded-md border text-xs font-mono uppercase flex items-center gap-1.5 transition ${
                voiceEnabled
                  ? 'bg-[#38BDF8]/15 border-[#38BDF8]/60 text-[#38BDF8]'
                  : 'bg-[#0D1B2A] border-[#1D3A52] text-[#8FA9BE]'
              }`}
            >
              {voiceEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              {voiceEnabled ? 'VOICE: ON' : 'VOICE: OFF'}
            </button>

            <button
              onClick={() => setDemoSpeed((s) => (s === 1 ? 6 : 1))}
              className={`px-3 py-1.5 rounded-md border text-xs font-mono uppercase flex items-center gap-1.5 transition ${
                demoSpeed === 6
                  ? 'bg-[#F59E0B]/20 border-[#F59E0B] text-[#F59E0B]'
                  : 'bg-[#0D1B2A] border-[#1D3A52] text-[#8FA9BE] hover:text-[#F3F8FC]'
              }`}
            >
              <FastForward className="w-3.5 h-3.5" />
              {demoSpeed === 1 ? '1x SPEED' : '6x DEMO'}
            </button>

            {isNominal ? (
              <button
                onClick={handleForceDistress}
                className="px-3.5 py-1.5 rounded-md bg-[#EF4444]/15 border border-[#EF4444]/70 hover:bg-[#EF4444]/30 text-[#EF4444] text-xs font-mono font-bold uppercase flex items-center gap-1.5 transition"
              >
                <Zap className="w-3.5 h-3.5" />
                FORCE DISTRESS
              </button>
            ) : (
              <button
                onClick={handleRestoreNominal}
                className="px-3.5 py-1.5 rounded-md bg-[#38BDF8]/15 border border-[#38BDF8]/70 hover:bg-[#38BDF8]/30 text-[#38BDF8] text-xs font-mono font-bold uppercase flex items-center gap-1.5 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                RESTORE NOMINAL
              </button>
            )}

            <button
              onClick={handleExportTelemetry}
              className="p-1.5 rounded-md bg-[#0D1B2A] border border-[#1D3A52] text-[#8FA9BE] hover:text-[#F3F8FC]"
              title="Download JSON Medical Log"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Clean 3-Tab Navigation Bar */}
        <div className="max-w-[1600px] mx-auto mt-3 pt-2.5 border-t border-[#1D3A52]/70 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            {[
              { id: 'BIOMETRICS', label: '01 // BIOMETRICS & AI FLIGHT SURGEON', icon: Table },
              { id: 'SPACECRAFT', label: '02 // SPACECRAFT & TRANSIT TELEMETRY', icon: Rocket },
              { id: 'WELLBEING', label: '03 // CREW LOGS, NUTRITION & WELLBEING', icon: Utensils }
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-md text-xs font-mono uppercase tracking-wider flex items-center gap-2 border transition ${
                    active
                      ? 'bg-[#12263A] border-[#F3F8FC] text-[#F3F8FC] font-bold'
                      : 'bg-[#07111F] border-[#1D3A52] text-[#8FA9BE] hover:text-[#F3F8FC] hover:bg-[#0D1B2A]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3 text-xs font-mono text-[#8FA9BE]">
            <span>
              Scenario Loop: <strong className="text-[#F3F8FC]">{cycleSeconds}s / 120s</strong>
            </span>
            <div className="w-28 h-1.5 bg-[#12263A] rounded overflow-hidden border border-[#1D3A52]">
              <div
                className="h-full transition-all duration-300"
                style={{ width: `${(cycleSeconds / 120) * 100}%`, backgroundColor: statusColorHex }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* ==================================================================== */}
      {/* MAIN CONTENT CONTAINER                                               */}
      {/* ==================================================================== */}
      <main className="max-w-[1600px] mx-auto px-5 sm:px-7 lg:px-10 pt-7">
        <section className="mission-hero mb-7 rounded-2xl border border-sky-300/20 p-5 sm:p-7 lg:p-8 overflow-hidden relative">
          <div className="mission-hero-grid">
            <div className="relative z-10 max-w-3xl">
              <div className="flex items-center gap-2 text-[10px] sm:text-xs tracking-[.24em] uppercase text-sky-200/80 font-mono mb-4">
                <span className="w-2 h-2 rounded-full bg-sky-300 animate-pulse" /> Deep Space Medical Operations <span className="text-slate-500">/</span> ARES-IV
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight leading-[1.05]">
                Mission health,<br className="hidden sm:block" /> <span className="text-sky-300">beyond Earth.</span>
              </h2>
              <p className="mt-4 max-w-xl text-sm sm:text-base text-slate-300/80 leading-relaxed">
                Autonomous crew monitoring, habitat telemetry and onboard decision support for the Hermes-II Mars transit.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <span className="mission-chip">MISSION ELAPSED · {spacecraft.metDays} DAYS</span>
                <span className="mission-chip">EARTH LINK · 14M 18S</span>
                <span className="mission-chip">
                  EDGE AI · {aiMode === 'LIVE_OLLAMA' ? 'OLLAMA CONNECTED MODE' : 'SIMULATION MODE'}
                </span>
              </div>
            </div>
            <div className="orbit-art" aria-hidden="true">
              <div className="orbit orbit-one">
                <span />
              </div>
              <div className="orbit orbit-two">
                <span />
              </div>
              <div className="orbit-planet">
                <span />
              </div>
              <div className="orbit-label orbit-label-top">
                HERMES-II <b>● LIVE</b>
              </div>
              <div className="orbit-label orbit-label-bottom">MARS TRANSIT // 67.8%</div>
            </div>
          </div>
          <div className="mt-6 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono uppercase tracking-[.16em] text-slate-400">
            <span>Flight deck interface · Concept demonstrator</span>
            <span className="text-amber-300/90">Simulation data — not for real-world medical decisions</span>
          </div>
        </section>

        {/* ================================================================== */}
        {/* TAB 1: BIOMETRICS & AI FLIGHT SURGEON (NO HUMAN MODEL, CLEAN 2-COL)*/}
        {/* ================================================================== */}
        {activeTab === 'BIOMETRICS' && (
          <div className="space-y-6">
            {/* TOP ROW: 4 HIGH-VISIBILITY KPI CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
              {/* KPI 1: Heart Rate + Scrolling ECG */}
              <div className="bg-[#0D1B2A] border border-[#1D3A52] rounded-lg p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs text-[#8FA9BE]">
                  <span className="flex items-center gap-1.5">
                    <Heart className="w-4 h-4" style={{ color: statusColorHex }} /> HEART RATE
                  </span>
                  <span style={{ color: statusColorHex }}>
                    {isNominal ? `60s Poll (${hrPollCountdown}s)` : `10s Poll (${hrPollCountdown}s)`}
                  </span>
                </div>
                <div className="my-2 flex items-baseline justify-between">
                  <div>
                    <span className="text-3xl font-bold" style={{ color: statusColorHex }}>
                      {vitals.hr}
                    </span>
                    <span className="text-xs text-[#8FA9BE] ml-1.5">BPM</span>
                  </div>
                  <span className="text-[11px] text-[#8FA9BE]">Norm: 60–100</span>
                </div>
                <div className="h-9 bg-[#07111F] border border-[#1D3A52] rounded overflow-hidden flex items-center">
                  <svg viewBox="0 0 500 80" className="w-full h-full">
                    <path
                      d="M 0 40 L 50 40 L 60 30 L 70 40 L 85 40 L 92 48 L 100 10 L 108 68 L 116 40 L 135 28 L 150 40 L 210 40 L 220 30 L 230 40 L 245 40 L 252 48 L 260 10 L 268 68 L 276 40 L 295 28 L 310 40 L 370 40 L 380 30 L 390 40 L 405 40 L 412 48 L 420 10 L 428 68 L 436 40 L 455 28 L 470 40 L 500 40"
                      fill="none"
                      stroke={statusColorHex}
                      strokeWidth="2.4"
                      className={isNominal ? 'ecg-line-nominal' : 'ecg-line-distress'}
                    />
                  </svg>
                </div>
              </div>

              {/* KPI 2: SpO2 Blood Oxygen */}
              <div className="bg-[#0D1B2A] border border-[#1D3A52] rounded-lg p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs text-[#8FA9BE]">
                  <span className="flex items-center gap-1.5">
                    <Wind className="w-4 h-4 text-[#D7E7F5]" /> BLOOD OXYGEN (SpO2)
                  </span>
                  <span className={vitals.spo2 < 92 ? 'text-[#EF4444] font-bold' : 'text-[#38BDF8]'}>
                    {vitals.spo2 < 92 ? 'HYPOXIA ALERT' : 'NOMINAL'}
                  </span>
                </div>
                <div className="my-2">
                  <span
                    className="text-3xl font-bold"
                    style={{ color: vitals.spo2 < 92 ? '#EF4444' : '#F3F8FC' }}
                  >
                    {vitals.spo2}%
                  </span>
                </div>
                <div className="text-xs text-[#8FA9BE] flex items-center justify-between pt-2 border-t border-[#12263A]">
                  <span>Baseline: &ge; 95%</span>
                  <span>Cabin CO2: {spacecraft.co2MmHg} mmHg</span>
                </div>
              </div>

              {/* KPI 3: Core Body Temperature (30-Min Poll) */}
              <div className="bg-[#0D1B2A] border border-[#1D3A52] rounded-lg p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs text-[#8FA9BE]">
                  <span className="flex items-center gap-1.5">
                    <Thermometer className="w-4 h-4 text-[#D7E7F5]" /> CORE BODY TEMP
                  </span>
                  <span className="text-[#38BDF8]">30-MIN INTERVAL</span>
                </div>
                <div className="my-2">
                  <span className="text-3xl font-bold text-[#F3F8FC]">{vitals.temp} °C</span>
                </div>
                <div className="text-xs text-[#8FA9BE] flex items-center justify-between pt-2 border-t border-[#12263A]">
                  <span>Baseline: 36.5–37.5°C</span>
                  <span>Next: {Math.floor(tempPollCountdown / 60)}m {tempPollCountdown % 60}s</span>
                </div>
              </div>

              {/* KPI 4: HRV & Autonomic Stress */}
              <div className="bg-[#0D1B2A] border border-[#1D3A52] rounded-lg p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs text-[#8FA9BE]">
                  <span>AUTONOMIC HRV & STRESS</span>
                  <span style={{ color: statusColorHex }}>Stress: {vitals.stress}%</span>
                </div>
                <div className="my-2 flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-[#F3F8FC]">{vitals.hrv}</span>
                  <span className="text-xs text-[#8FA9BE]">ms (RMSSD)</span>
                </div>
                <div className="w-full h-2 bg-[#12263A] rounded overflow-hidden">
                  <div
                    className="h-full transition-all"
                    style={{ width: `${vitals.stress}%`, backgroundColor: statusColorHex }}
                  />
                </div>
              </div>
            </div>

            {/* MAIN 2-COLUMN WORKSPACE: TABULAR MATRIX (LEFT 7) + PANTRY & OLLAMA AI (RIGHT 5) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* LEFT 7 COLUMNS: CLEAN TABULAR BIOMETRIC MATRIX + EVENT LOG */}
              <div className="lg:col-span-7 space-y-6">
                <div className="bg-[#0D1B2A] border border-[#1D3A52] rounded-lg overflow-hidden">
                  <div className="px-5 py-3.5 bg-[#12263A] border-b border-[#1D3A52] flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Table className="w-4 h-4 text-[#38BDF8]" />
                      <h2 className="text-xs font-mono font-bold uppercase tracking-wider">
                        ASTRONAUT BIOMETRIC & BIOMARKER TELEMETRY TABLE
                      </h2>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {['ALL', 'VITALS', 'SLEEP & ACTIVITY', 'BONE & BIOMARKERS'].map((flt) => (
                        <button
                          key={flt}
                          onClick={() => setTableFilter(flt)}
                          className={`px-2.5 py-1 rounded text-[10px] font-mono uppercase border transition ${
                            tableFilter === flt
                              ? 'bg-[#F3F8FC] text-[#050B14] border-[#F3F8FC] font-bold'
                              : 'bg-[#07111F] text-[#8FA9BE] border-[#1D3A52] hover:text-[#F3F8FC]'
                          }`}
                        >
                          {flt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse font-mono text-xs">
                      <thead>
                        <tr className="bg-[#07111F] text-[#8FA9BE] border-b border-[#1D3A52] uppercase text-[10px]">
                          <th className="py-3 px-4">Biometric Parameter</th>
                          <th className="py-3 px-4">Current Readout</th>
                          <th className="py-3 px-4">NASA Baseline</th>
                          <th className="py-3 px-4">Polling Schedule</th>
                          <th className="py-3 px-4 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#12263A]">
                        {filteredBiometricRows.map((row) => (
                          <tr
                            key={row.id}
                            className={`hover:bg-[#12263A]/60 transition ${
                              row.status === 'CRITICAL' ? 'bg-[#EF4444]/5' : ''
                            }`}
                          >
                            <td className="py-3 px-4 font-medium text-[#F3F8FC]">{row.param}</td>
                            <td className="py-3 px-4 font-bold text-[#F3F8FC]">{row.value}</td>
                            <td className="py-3 px-4 text-[#8FA9BE]">{row.baseline}</td>
                            <td className="py-3 px-4 text-[#8FA9BE]">{row.poll}</td>
                            <td className="py-3 px-4 text-right">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${getBadgeStyle(
                                  row.status
                                )}`}
                              >
                                {row.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Compact Telemetry Event Ledger */}
                <div className="bg-[#0D1B2A] border border-[#1D3A52] rounded-lg overflow-hidden font-mono">
                  <div className="px-5 py-3 bg-[#12263A] border-b border-[#1D3A52] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-[#D7E7F5]" />
                      <span className="text-xs font-bold uppercase tracking-wider">
                        RECENT TELEMETRY & MEDICAL EVENTS
                      </span>
                    </div>
                    <span className="text-[11px] text-[#8FA9BE]">Auto-Synced to Houston Downlink Queue</span>
                  </div>
                  <div className="overflow-x-auto max-h-48">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-[#07111F] text-[#8FA9BE] border-b border-[#1D3A52] uppercase text-[10px]">
                          <th className="py-2 px-4">MET</th>
                          <th className="py-2 px-4">Parameter</th>
                          <th className="py-2 px-4">Readout</th>
                          <th className="py-2 px-4">Status</th>
                          <th className="py-2 px-4">Action Logged</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#12263A]">
                        {telemetryLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-[#12263A]/40">
                            <td className="py-2 px-4 text-[#8FA9BE]">{log.met}</td>
                            <td className="py-2 px-4 font-bold text-[#F3F8FC]">{log.parameter}</td>
                            <td className="py-2 px-4 text-[#D7E7F5]">{log.value}</td>
                            <td className="py-2 px-4">
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${getBadgeStyle(log.status)}`}>
                                {log.status}
                              </span>
                            </td>
                            <td className="py-2 px-4 text-[#8FA9BE]">{log.action}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* RIGHT 5 COLUMNS: SHUTTLE MEDICAL PANTRY + INTERACTIVE OLLAMA EDGE-AI */}
              <div className="lg:col-span-5 space-y-6 font-mono">
                {/* Card 1: Shuttle Medical Pantry & 4-7-8 Breathing Protocol */}
                <div
                  className={`bg-[#0D1B2A] border rounded-lg p-5 space-y-4 transition-all ${
                    isNominal ? 'border-[#1D3A52]' : 'border-[#EF4444]'
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-[#1D3A52] pb-3">
                    <div className="flex items-center gap-2">
                      <Pill className="w-4 h-4" style={{ color: statusColorHex }} />
                      <h2 className="text-xs font-bold uppercase tracking-wider">
                        SHUTTLE MEDICAL PANTRY & COUNTERMEASURES
                      </h2>
                    </div>
                    <span
                      className="text-[10px] px-2.5 py-0.5 rounded uppercase font-bold"
                      style={{ backgroundColor: `${statusColorHex}20`, color: statusColorHex }}
                    >
                      {isNominal ? 'STANDBY' : 'PROTOCOL ACTIVE'}
                    </span>
                  </div>

                  {isNominal ? (
                    <div className="bg-[#07111F] border border-[#1D3A52] rounded-md p-4 text-xs text-[#8FA9BE] space-y-1.5">
                      <div className="text-[#38BDF8] font-bold">✓ CREW FIT FOR DUTY — NO MEDICATION REQUIRED</div>
                      <p>
                        All vitals within baseline. Scheduled maintenance: 115-min ARED resistance protocol & 400 IU Vitamin D3 supplement.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="bg-[#07111F] border border-[#EF4444]/60 rounded-md p-3.5 text-xs space-y-1.5">
                        <div className="text-[11px] text-[#F59E0B] font-bold uppercase">
                          1. MED-BAY LOCKER B4 &rarr; DRAWER 2 PRESCRIPTION:
                        </div>
                        <ul className="text-[#D7E7F5] list-disc list-inside space-y-1">
                          <li>
                            <strong>Propranolol 10mg Oral Tablet</strong> (Beta-1 blockade to reduce tachycardia)
                          </li>
                          <li>
                            <strong>Portable O2 Mask @ 4.0 L/min</strong> (Breathe for 5 mins until SpO2 &ge; 97%)
                          </li>
                          <li>
                            <strong>Oral Rehydration Salt (ORS) Pack</strong> (Mix with 600 mL water)
                          </li>
                        </ul>
                      </div>

                      {/* Guided 4-7-8 Vagal Nerve Breathing Pacer */}
                      <div className="bg-[#07111F] border border-[#1D3A52] rounded-md p-3.5">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] text-[#38BDF8] font-bold uppercase">
                            2. GUIDED 4-7-8 VAGAL BREATHING PACER:
                          </span>
                          <button
                            onClick={() => setBreathingActive(!breathingActive)}
                            className="px-2.5 py-0.5 rounded bg-[#12263A] border border-[#1D3A52] text-[10px] text-[#F3F8FC] hover:border-[#38BDF8]"
                          >
                            {breathingActive ? 'PAUSE PACER' : 'START PACER'}
                          </button>
                        </div>

                        {breathingActive ? (
                          <div className="flex items-center justify-between bg-[#0D1B2A] px-3.5 py-2.5 rounded border border-[#38BDF8]/50">
                            <div>
                              <div className="text-xs font-bold text-[#38BDF8]">{breathState.label}</div>
                              <div className="text-[11px] text-[#8FA9BE]">Activates parasympathetic vagal brake</div>
                            </div>
                            <div className="w-10 h-10 rounded-full border-2 border-[#38BDF8] flex items-center justify-center font-bold text-sm text-[#38BDF8]">
                              {breathState.count}s
                            </div>
                          </div>
                        ) : (
                          <div className="text-xs text-[#8FA9BE]">
                            Click <strong>START PACER</strong> for voice-guided 4s Inhale • 7s Hold • 8s Exhale.
                          </div>
                        )}
                      </div>

                      <button
                        onClick={handleRestoreNominal}
                        className="w-full py-2.5 rounded-md bg-[#38BDF8] hover:bg-[#38BDF8]/90 text-[#050B14] font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        ADMINISTER TREATMENT & STABILIZE VITALS
                      </button>
                    </div>
                  )}
                </div>

                {/* Card 2: Interactive Data-Centric Ollama Edge-AI Flight Surgeon */}
                <div className="bg-[#0D1B2A] border border-[#1D3A52] rounded-lg p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-[#1D3A52] pb-3">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-[#38BDF8]" />
                      <div>
                        <h2 className="text-xs font-bold uppercase tracking-wider">
                          OLLAMA EDGE-AI FLIGHT SURGEON
                        </h2>
                        <p className="text-[10px] text-[#8FA9BE]">Offline Onboard Clinical Decision Support</p>
                      </div>
                    </div>

                    <button
                      onClick={() => setAiMode((m) => (m === 'SIMULATED' ? 'LIVE_OLLAMA' : 'SIMULATED'))}
                      className={`px-2.5 py-1 rounded text-[10px] uppercase border transition ${
                        aiMode === 'LIVE_OLLAMA'
                          ? 'bg-[#38BDF8]/15 border-[#38BDF8] text-[#38BDF8]'
                          : 'bg-[#12263A] border-[#1D3A52] text-[#D7E7F5]'
                      }`}
                    >
                      {aiMode === 'SIMULATED' ? 'SIMULATED AI' : 'LIVE OLLAMA :11434'}
                    </button>
                  </div>

                  {/* Scenario Analysis Chips */}
                  <div>
                    <div className="text-[10px] text-[#8FA9BE] uppercase mb-2 flex items-center justify-between">
                      <span>CLICK SCENARIO ANALYSIS:</span>
                      <span className="text-[#38BDF8]">Model: {ollamaModel}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {SCENARIO_CHIPS.map((chip) => (
                        <button
                          key={chip.id}
                          onClick={() => handleSelectScenarioChip(chip)}
                          className={`px-3 py-1.5 rounded text-xs text-left border transition truncate ${
                            activeScenario.id === chip.id
                              ? 'bg-[#12263A] border-[#38BDF8] text-[#38BDF8] font-bold'
                              : 'bg-[#07111F] border-[#1D3A52] text-[#D7E7F5] hover:border-[#52525B]'
                          }`}
                        >
                          &bull; {chip.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Differential Diagnosis Probability Bars */}
                  <div className="bg-[#07111F] border border-[#1D3A52] rounded-md p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between text-[11px] border-b border-[#12263A] pb-1.5">
                      <span className="text-[#F3F8FC] font-bold truncate pr-2">
                        {activeScenario.shortTitle}
                      </span>
                      <span className="text-[#F59E0B] shrink-0">{activeScenario.confidence}</span>
                    </div>

                    <div className="space-y-1.5">
                      {activeScenario.differentials.map((diff, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between text-[11px]">
                            <span className="text-[#8FA9BE] truncate pr-2">{diff.name}</span>
                            <span className="text-[#F3F8FC] font-bold">{diff.prob}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-[#12263A] rounded overflow-hidden">
                            <div className="h-full bg-[#38BDF8]" style={{ width: `${diff.prob}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* AI Output Text */}
                    <div className="pt-2 border-t border-[#12263A] text-xs leading-relaxed text-[#D7E7F5]">
                      {aiLoading ? (
                        <div className="flex items-center gap-2 text-[#38BDF8]">
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Running onboard clinical inference...</span>
                        </div>
                      ) : (
                        <p>{aiResponse}</p>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-[#8FA9BE]">
                        Risk Score: <strong style={{ color: statusColorHex }}>{activeScenario.riskScore}/100</strong>
                      </span>
                      <button
                        onClick={() => {
                          setVoiceEnabled(true);
                          voiceEnabledRef.current = true;
                          speakTelemetry(aiResponse);
                        }}
                        className="px-2.5 py-1 rounded bg-[#12263A] border border-[#1D3A52] hover:border-[#38BDF8] text-[10px] text-[#38BDF8] flex items-center gap-1"
                      >
                        <Mic className="w-3 h-3" /> SPEAK BRIEF
                      </button>
                    </div>
                  </div>

                  {/* Custom Question Input */}
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          runFlightSurgeonAnalysis(customPrompt);
                          setCustomPrompt('');
                        }
                      }}
                      placeholder="Ask Flight Surgeon AI a question..."
                      className="flex-1 bg-[#07111F] border border-[#1D3A52] rounded-md px-3 py-2 text-xs text-[#F3F8FC] placeholder-[#52525B] focus:outline-none focus:border-[#D7E7F5]"
                    />
                    <button
                      onClick={() => {
                        runFlightSurgeonAnalysis(customPrompt);
                        setCustomPrompt('');
                      }}
                      className="px-3.5 py-2 bg-[#12263A] border border-[#1D3A52] hover:border-[#38BDF8] text-xs text-[#38BDF8] rounded-md flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      ASK
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================== */}
        {/* TAB 2: SPACECRAFT & MARS TRANSIT TELEMETRY                         */}
        {/* ================================================================== */}
        {activeTab === 'SPACECRAFT' && (
          <div className="space-y-6 font-mono">
            {/* Clean Orbital Transit Progress Card */}
            <div className="bg-[#0D1B2A] border border-[#1D3A52] rounded-lg p-5">
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-wider">
                    EARTH-TO-MARS HOHMANN TRANSFER // HERMES-II TRANSIT HABITAT
                  </h2>
                  <p className="text-xs text-[#8FA9BE]">
                    67.8% Transit Complete • Autonomous Medical Ops Required Beyond 5 Light-Minutes
                  </p>
                </div>
                <span className="text-xs px-3 py-1 rounded bg-[#12263A] border border-[#1D3A52] text-[#38BDF8]">
                  TRAJECTORY NOMINAL • MOI IN 67d 09h
                </span>
              </div>

              <div className="bg-[#07111F] border border-[#1D3A52] rounded-md p-4">
                <svg viewBox="0 0 800 120" className="w-full h-24">
                  <path d="M 70 85 Q 400 15 730 85" fill="none" stroke="#1D3A52" strokeWidth="3" strokeDasharray="6 6" />
                  <path d="M 70 85 Q 310 30 525 56" fill="none" stroke="#38BDF8" strokeWidth="3" />
                  <circle cx="70" cy="85" r="10" fill="#12263A" stroke="#D7E7F5" strokeWidth="2" />
                  <text x="70" y="110" textAnchor="middle" fill="#8FA9BE" fontSize="11">
                    EARTH (DEP)
                  </text>
                  <circle cx="525" cy="56" r="8" fill={statusColorHex} />
                  <text x="525" y="34" textAnchor="middle" fill="#F3F8FC" fontSize="11" fontWeight="bold">
                    HERMES-II ({spacecraft.distanceKm}M km)
                  </text>
                  <circle cx="730" cy="85" r="10" fill="#12263A" stroke="#F59E0B" strokeWidth="2" />
                  <text x="730" y="110" textAnchor="middle" fill="#F59E0B" fontSize="11">
                    MARS (MOI -67d)
                  </text>
                </svg>
              </div>
            </div>

            {/* Clean 8-Row Spacecraft & Environmental Telemetry Table */}
            <div className="bg-[#0D1B2A] border border-[#1D3A52] rounded-lg overflow-hidden">
              <div className="px-5 py-3.5 bg-[#12263A] border-b border-[#1D3A52] flex items-center justify-between">
                <span className="text-xs font-bold uppercase">
                  SPACECRAFT ASTRODYNAMICS & CABIN ENVIRONMENT TELEMETRY (8 CHANNELS)
                </span>
                <span className="text-xs text-[#38BDF8]">ECLSS & NAV ONLINE</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#07111F] text-[#8FA9BE] border-b border-[#1D3A52] uppercase text-[10px]">
                      <th className="py-3 px-5">Parameter</th>
                      <th className="py-3 px-5">Live Readout</th>
                      <th className="py-3 px-5">Nominal Flight Spec</th>
                      <th className="py-3 px-5">Operational Notes</th>
                      <th className="py-3 px-5 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#12263A]">
                    <tr>
                      <td className="py-3 px-5 font-bold">01 // Mission Elapsed Time (MET)</td>
                      <td className="py-3 px-5 text-[#F3F8FC]">
                        {spacecraft.metDays}d : {String(spacecraft.metHours).padStart(2, '0')}h :{' '}
                        {String(spacecraft.metMins).padStart(2, '0')}m : {String(spacecraft.metSecs).padStart(2, '0')}s
                      </td>
                      <td className="py-3 px-5 text-[#8FA9BE]">210d Transit Baseline</td>
                      <td className="py-3 px-5 text-[#8FA9BE]">Outbound Hohmann Transfer</td>
                      <td className="py-3 px-5 text-right">
                        <span className={`px-2 py-0.5 rounded text-[10px] ${getBadgeStyle('NOMINAL')}`}>NOMINAL</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-5 font-bold">02 // Total Time Spent in Space</td>
                      <td className="py-3 px-5 text-[#F3F8FC]">{selectedCrew.careerDays} Days</td>
                      <td className="py-3 px-5 text-[#8FA9BE]">&lt; 600 Days Career</td>
                      <td className="py-3 px-5 text-[#8FA9BE]">Cumulative microgravity exposure ({selectedCrew.name})</td>
                      <td className="py-3 px-5 text-right">
                        <span className={`px-2 py-0.5 rounded text-[10px] ${getBadgeStyle('NOMINAL')}`}>NOMINAL</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-5 font-bold">03 // Distance from Earth & Latency</td>
                      <td className="py-3 px-5 text-[#F59E0B] font-bold">
                        {spacecraft.distanceKm} M km (14m 18s One-Way)
                      </td>
                      <td className="py-3 px-5 text-[#8FA9BE]">28m 36s Round-Trip</td>
                      <td className="py-3 px-5 text-[#F59E0B]">Requires autonomous onboard AI medical triage</td>
                      <td className="py-3 px-5 text-right">
                        <span className={`px-2 py-0.5 rounded text-[10px] ${getBadgeStyle('NOMINAL')}`}>AUTONOMOUS</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-5 font-bold">04 // Speed of Spacecraft</td>
                      <td className="py-3 px-5 text-[#38BDF8] font-bold">{spacecraft.velocityKms} km/s (88,632 km/h)</td>
                      <td className="py-3 px-5 text-[#8FA9BE]">24.5 – 24.8 km/s</td>
                      <td className="py-3 px-5 text-[#8FA9BE]">Heliocentric coast velocity</td>
                      <td className="py-3 px-5 text-right">
                        <span className={`px-2 py-0.5 rounded text-[10px] ${getBadgeStyle('NOMINAL')}`}>NOMINAL</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-5 font-bold">05 // Time to Reach Mars (MOI)</td>
                      <td className="py-3 px-5 text-[#F3F8FC]">67d : 09h : 21m</td>
                      <td className="py-3 px-5 text-[#8FA9BE]">Gale Capture Orbit</td>
                      <td className="py-3 px-5 text-[#8FA9BE]">Countdown to Mars Orbit Insertion burn</td>
                      <td className="py-3 px-5 text-right">
                        <span className={`px-2 py-0.5 rounded text-[10px] ${getBadgeStyle('NOMINAL')}`}>ON SCHEDULE</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-5 font-bold">06 // Cabin Ambience</td>
                      <td className="py-3 px-5 text-[#F3F8FC]">
                        {spacecraft.cabinPressure} kPa • {spacecraft.cabinTemp}°C • {spacecraft.cabinHumidity}% RH
                      </td>
                      <td className="py-3 px-5 text-[#8FA9BE]">101.3 kPa / 20–23°C</td>
                      <td className="py-3 px-5 text-[#8FA9BE]">20.9% O2 / 4500K Circadian LED phase</td>
                      <td className="py-3 px-5 text-right">
                        <span className={`px-2 py-0.5 rounded text-[10px] ${getBadgeStyle('NOMINAL')}`}>NOMINAL</span>
                      </td>
                    </tr>
                    <tr className={spacecraft.co2MmHg > 4.0 ? 'bg-[#EF4444]/10' : ''}>
                      <td className="py-3 px-5 font-bold">07 // Cabin CO2 Level</td>
                      <td className="py-3 px-5 font-bold" style={{ color: statusColorHex }}>
                        {spacecraft.co2MmHg} mmHg ({spacecraft.co2Ppm} ppm)
                      </td>
                      <td className="py-3 px-5 text-[#8FA9BE]">&lt; 3.0 mmHg (&lt; 4000 ppm)</td>
                      <td className="py-3 px-5 text-[#D7E7F5]">
                        {spacecraft.co2MmHg > 4.0
                          ? 'CDRA scrubber lag correlates with crew SpO2 drop & tachycardia'
                          : 'Optimal scrubber efficiency'}
                      </td>
                      <td className="py-3 px-5 text-right">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] ${getBadgeStyle(
                            spacecraft.co2MmHg > 4.5 ? 'CRITICAL' : spacecraft.co2MmHg > 3.8 ? 'CAUTION' : 'NOMINAL'
                          )}`}
                        >
                          {spacecraft.co2MmHg > 4.5 ? 'CRITICAL' : spacecraft.co2MmHg > 3.8 ? 'CAUTION' : 'NOMINAL'}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-5 font-bold">08 // Radiation Dosimeter Level</td>
                      <td className="py-3 px-5 text-[#F3F8FC]">
                        {spacecraft.radCumulativeMsv} mSv ({spacecraft.radRateMsvDay} mSv/day GCR)
                      </td>
                      <td className="py-3 px-5 text-[#8FA9BE]">&lt; 600 mSv Mission Limit</td>
                      <td className="py-3 px-5 text-[#38BDF8]">Solar Particle Event (SPE) Shield Status: GREEN</td>
                      <td className="py-3 px-5 text-right">
                        <span className={`px-2 py-0.5 rounded text-[10px] ${getBadgeStyle('NOMINAL')}`}>NOMINAL</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================== */}
        {/* TAB 3: CREW LOGS, NUTRITION & WELLBEING CHECK-IN                   */}
        {/* ================================================================== */}
        {activeTab === 'WELLBEING' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-mono">
            {/* Column 1: Symptoms Log */}
            <div className="bg-[#0D1B2A] border border-[#1D3A52] rounded-lg p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-[#1D3A52] pb-3">
                <h2 className="text-xs font-bold uppercase">01 // CREW SYMPTOMS LOG</h2>
                <select
                  value={selectedSeverity}
                  onChange={(e) => setSelectedSeverity(e.target.value)}
                  aria-label="Select Symptom Severity"
                  className="bg-[#07111F] border border-[#1D3A52] text-xs px-2.5 py-1 rounded text-[#F3F8FC]"
                >
                  <option value="Mild">Mild</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Severe">Severe</option>
                </select>
              </div>

              <p className="text-xs text-[#8FA9BE]">
                Tap a symptom below to log for {selectedCrew.name}:
              </p>

              <div className="flex flex-wrap gap-2">
                {SYMPTOM_CHIPS.map((sym) => (
                  <button
                    key={sym}
                    onClick={() => {
                      const timestamp = `MET ${spacecraft.metDays}d ${String(spacecraft.metHours).padStart(2, '0')}:${String(
                        spacecraft.metMins
                      ).padStart(2, '0')}`;
                      setLoggedSymptoms((prev) => [
                        { id: Date.now(), name: sym, severity: selectedSeverity, time: timestamp },
                        ...prev
                      ]);
                      appendLog('SYMPTOM', sym.toUpperCase(), selectedSeverity, 'CAUTION', 'Logged by crew');
                      speakTelemetry(`Logged ${selectedSeverity} ${sym}.`);
                    }}
                    className="px-3 py-1.5 bg-[#07111F] hover:bg-[#12263A] border border-[#1D3A52] hover:border-[#D7E7F5] rounded text-xs text-[#D7E7F5] transition"
                  >
                    + {sym}
                  </button>
                ))}
              </div>

              <div className="pt-3 border-t border-[#12263A] space-y-2 max-h-60 overflow-y-auto">
                {loggedSymptoms.map((entry) => (
                  <div
                    key={entry.id}
                    className="bg-[#07111F] border border-[#1D3A52] rounded px-3 py-2 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="text-[#F3F8FC] font-medium">{entry.name}</div>
                      <div className="text-[10px] text-[#8FA9BE]">{entry.time}</div>
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                        entry.severity === 'Severe'
                          ? 'bg-[#EF4444]/20 text-[#EF4444]'
                          : entry.severity === 'Moderate'
                          ? 'bg-[#F59E0B]/20 text-[#F59E0B]'
                          : 'bg-[#12263A] text-[#8FA9BE]'
                      }`}
                    >
                      {entry.severity}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 2: Space Food & Hydration Tracker */}
            <div className="bg-[#0D1B2A] border border-[#1D3A52] rounded-lg p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-[#1D3A52] pb-3">
                <h2 className="text-xs font-bold uppercase">02 // SPACE FOOD & HYDRATION</h2>
                <Utensils className="w-4 h-4 text-[#38BDF8]" />
              </div>

              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="bg-[#07111F] border border-[#1D3A52] p-2.5 rounded">
                  <div className="text-[10px] text-[#8FA9BE]">KCAL</div>
                  <div className="text-sm font-bold text-[#F3F8FC]">{nutritionTotals.kcal}</div>
                </div>
                <div className="bg-[#07111F] border border-[#1D3A52] p-2.5 rounded">
                  <div className="text-[10px] text-[#8FA9BE]">PROTEIN</div>
                  <div className="text-sm font-bold text-[#38BDF8]">{nutritionTotals.protein}g</div>
                </div>
                <div className="bg-[#07111F] border border-[#1D3A52] p-2.5 rounded">
                  <div className="text-[10px] text-[#8FA9BE]">SODIUM</div>
                  <div className="text-sm font-bold text-[#F59E0B]">{nutritionTotals.sodium}mg</div>
                </div>
                <div className="bg-[#07111F] border border-[#1D3A52] p-2.5 rounded">
                  <div className="text-[10px] text-[#8FA9BE]">WATER</div>
                  <div className="text-sm font-bold text-[#D7E7F5]">{nutritionTotals.water}mL</div>
                </div>
              </div>

              <div className="space-y-2.5">
                {RATION_ITEMS.map((item) => {
                  const checked = consumedRations.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        setConsumedRations((prev) =>
                          checked ? prev.filter((i) => i !== item.id) : [...prev, item.id]
                        );
                        speakTelemetry(checked ? `Removed ${item.meal}` : `Logged ${item.meal}`);
                      }}
                      className={`p-3 rounded-md border cursor-pointer transition flex items-center justify-between ${
                        checked
                          ? 'bg-[#38BDF8]/10 border-[#38BDF8]/60'
                          : 'bg-[#07111F] border-[#1D3A52] hover:border-[#52525B]'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold text-[#F3F8FC]">
                          [{item.meal}] {item.name}
                        </div>
                        <div className="text-[11px] text-[#8FA9BE]">
                          {item.kcal} kcal • {item.protein}g Prot • {item.water}mL H2O
                        </div>
                      </div>
                      <span className="text-xs font-bold text-[#38BDF8] shrink-0 ml-2">
                        {checked ? 'LOGGED ✓' : '+ LOG'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Column 3: Daily Wellbeing Questionnaire */}
            <div className="bg-[#0D1B2A] border border-[#1D3A52] rounded-lg p-5 space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#1D3A52] pb-3">
                  <h2 className="text-xs font-bold uppercase">03 // WELLBEING CHECK-IN</h2>
                  <Smile className="w-4 h-4 text-[#D7E7F5]" />
                </div>

                {[
                  { key: 'mood', label: 'Mood & Isolation Morale (1-10)' },
                  { key: 'focus', label: 'Cognitive Focus & Alertness (1-10)' },
                  { key: 'soreness', label: 'Muscle / Joint Soreness (1-10)' },
                  { key: 'workload', label: 'Perceived Workload Stress (1-10)' }
                ].map((slider) => (
                  <div key={slider.key} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#8FA9BE]">{slider.label}</span>
                      <span className="text-[#F3F8FC] font-bold">{wellbeing[slider.key]} / 10</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={wellbeing[slider.key]}
                      onChange={(e) =>
                        setWellbeing({ ...wellbeing, [slider.key]: Number(e.target.value) })
                      }
                      className="w-full accent-[#38BDF8] cursor-pointer"
                    />
                  </div>
                ))}
              </div>

              <button
                onClick={() => {
                  setActiveTab('BIOMETRICS');
                  runFlightSurgeonAnalysis(
                    `Crew Wellbeing Check-In: Mood ${wellbeing.mood}/10, Focus ${wellbeing.focus}/10, Soreness ${wellbeing.soreness}/10, Workload ${wellbeing.workload}/10, Intake ${nutritionTotals.kcal} kcal / ${nutritionTotals.water}mL H2O`
                  );
                }}
                className="w-full py-3 rounded-md bg-[#F3F8FC] hover:bg-[#D7E7F5] text-[#050B14] font-bold text-xs uppercase tracking-wider transition"
              >
                SUBMIT CHECK-IN TO AI FLIGHT SURGEON
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AstralMedDashboard />
    </ErrorBoundary>
  );
}