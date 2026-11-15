



(function () {
  'use strict';

  // --------------------------------------------------------------------------
  // 1. Initial State & Realistic Seed Data
  // --------------------------------------------------------------------------
  const STORAGE_KEYS = {
    MEDS: 'careconnect_medications_v1',
    DOSES: 'careconnect_doses_v1',
    APPTS: 'careconnect_appointments_v1',
    CAREGIVERS: 'careconnect_caregivers_v1',
    LOGS: 'careconnect_logs_v1',
    SETTINGS: 'careconnect_settings_v1'
  };

  const DEFAULT_SETTINGS = {
    theme: 'normal',       // 'normal' | 'high-contrast'
    fontSize: 'normal',    // 'normal' | 'large' | 'xlarge'
    userMode: 'senior',    // 'senior' | 'caregiver'
    voiceEnabled: true
  };

  const SEED_MEDICATIONS = [
    {
      id: 'med-1',
      name: 'Lisinopril',
      strength: '10 mg',
      condition: 'Blood Pressure & Heart Health',
      form: 'tablet',
      color: '#0284c7',
      times: ['Morning'],
      instructions: 'Take 1 tablet with a full glass of water after breakfast',
      remainingPills: 14,
      totalPills: 30,
      prescribedBy: 'Dr. Marcus Ross',
      refillThreshold: 5
    },
    {
      id: 'med-2',
      name: 'Metformin',
      strength: '500 mg',
      condition: 'Type 2 Diabetes Control',
      form: 'tablet',
      color: '#059669',
      times: ['Morning', 'Evening'],
      instructions: 'Take 1 tablet with morning and evening meals',
      remainingPills: 42,
      totalPills: 60,
      prescribedBy: 'Dr. Anita Patel',
      refillThreshold: 7
    },
    {
      id: 'med-3',
      name: 'Vitamin D3',
      strength: '1000 IU',
      condition: 'Bone & Joint Strength',
      form: 'capsule',
      color: '#d97706',
      times: ['Afternoon'],
      instructions: 'Take 1 softgel with lunch for best absorption',
      remainingPills: 3, // LOW REFILL TRIGGER FOR DEMO
      totalPills: 60,
      prescribedBy: 'Dr. Marcus Ross',
      refillThreshold: 5
    },
    {
      id: 'med-4',
      name: 'Atorvastatin',
      strength: '20 mg',
      condition: 'Cholesterol Management',
      form: 'tablet',
      color: '#7c3aed',
      times: ['Night'],
      instructions: 'Take 1 tablet at bedtime with water',
      remainingPills: 28,
      totalPills: 30,
      prescribedBy: 'Dr. Marcus Ross',
      refillThreshold: 5
    },
    {
      id: 'med-5',
      name: 'Moisturizing Eye Drops',
      strength: '2 Drops / eye',
      condition: 'Dry Eyes & Glaucoma Comfort',
      form: 'drops',
      color: '#0284c7',
      times: ['Morning', 'Afternoon'],
      instructions: 'Instill 2 drops in each eye; blink gently',
      remainingPills: 12,
      totalPills: 30,
      prescribedBy: 'Dr. James Chen',
      refillThreshold: 4
    }
  ];

  const SEED_APPOINTMENTS = [
    {
      id: 'appt-1',
      doctorName: 'Dr. Marcus Ross',
      specialty: 'Cardiologist (Heart Specialist)',
      clinic: 'St. Jude Heart Center, Suite 402',
      date: '2026-11-18',
      time: '10:30 AM',
      phone: '(555) 901-2345',
      notes: 'Review 6-month blood pressure logs and check Lisinopril efficacy.',
      transportNote: 'Daughter Sarah driving Eleanor to this visit.'
    },
    {
      id: 'appt-2',
      doctorName: 'Dr. Anita Patel',
      specialty: 'Endocrinologist (Diabetes Care)',
      clinic: 'Metro Health Diabetes Clinic, Room 210',
      date: '2026-12-04',
      time: '02:15 PM',
      phone: '(555) 789-0123',
      notes: 'Fasting HbA1c blood test review and foot sensory check.',
      transportNote: 'Need fasting 4 hours prior to appointment.'
    },
    {
      id: 'appt-3',
      doctorName: 'Dr. James Chen',
      specialty: 'Optometrist (Eye Care)',
      clinic: 'Vision Wellness Center, Suite 105',
      date: '2027-01-12',
      time: '09:00 AM',
      phone: '(555) 456-7890',
      notes: 'Annual dilated eye examination for diabetic retinal check.',
      transportNote: 'Wear sunglasses after appointment due to dilation.'
    }
  ];

  const SEED_CAREGIVERS = [
    {
      id: 'cg-1',
      name: 'Sarah Vance',
      relation: 'Daughter & Primary Guardian',
      phone: '(555) 234-5678',
      email: 'sarah.vance@example.com',
      isPrimary: true,
      role: 'Full Admin & Medical Proxy'
    },
    {
      id: 'cg-2',
      name: 'Robert Vance',
      relation: 'Son',
      phone: '(555) 876-5432',
      email: 'robert.vance@example.com',
      isPrimary: false,
      role: 'Emergency Contact & Alerts'
    },
    {
      id: 'cg-3',
      name: 'Nurse Maria Gonzalez, RN',
      relation: 'Visiting Home Nurse (Mon / Thu)',
      phone: '(555) 432-1098',
      email: 'maria.gonzalez@metrohomehealth.org',
      isPrimary: false,
      role: 'Medication Administration & Vitals'
    },
    {
      id: 'cg-4',
      name: 'Dr. Marcus Ross',
      relation: 'Primary Cardiologist',
      phone: '(555) 901-2345',
      email: 'dr.ross@stjudeheart.org',
      isPrimary: false,
      role: 'Prescribing Physician'
    }
  ];

  const SEED_LOGS = [
    {
      id: 'log-1',
      timestamp: 'Today at 08:05 AM',
      text: 'Lisinopril 10 mg marked as Taken by Eleanor',
      type: 'taken'
    },
    {
      id: 'log-2',
      timestamp: 'Today at 08:06 AM',
      text: 'Metformin 500 mg marked as Taken by Eleanor',
      type: 'taken'
    },
    {
      id: 'log-3',
      timestamp: 'Yesterday at 09:12 PM',
      text: 'Atorvastatin 20 mg marked as Taken by Eleanor',
      type: 'taken'
    }
  ];

  // --------------------------------------------------------------------------
  // 2. Application State Management
  // --------------------------------------------------------------------------
  class CareConnectApp {
    constructor() {
      this.settings = this.loadStorage(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
      this.medications = this.loadStorage(STORAGE_KEYS.MEDS, SEED_MEDICATIONS);
      this.appointments = this.loadStorage(STORAGE_KEYS.APPTS, SEED_APPOINTMENTS);
      this.caregivers = this.loadStorage(STORAGE_KEYS.CAREGIVERS, SEED_CAREGIVERS);
      this.activityLogs = this.loadStorage(STORAGE_KEYS.LOGS, SEED_LOGS);
      
      this.doses = this.loadStorage(STORAGE_KEYS.DOSES, null);
      if (!this.doses || !Array.isArray(this.doses) || this.doses.length === 0) {
        this.generateTodayDoses();
      }

      this.activeTab = 'today';
      this.editingMedId = null;
      this.speechSynth = window.speechSynthesis || null;

      this.init();
    }

    loadStorage(key, fallback) {
      try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : fallback;
      } catch (err) {
        return fallback;
      }
    }

    saveStorage(key, data) {
      try {
        localStorage.setItem(key, JSON.stringify(data));
      } catch (err) {
        console.error(`Error saving ${key}:`, err);
      }
    }

    generateTodayDoses() {
      const timeSlotOrder = {
        'Morning': '08:00 AM',
        'Afternoon': '01:00 PM',
        'Evening': '06:00 PM',
        'Night': '09:00 PM'
      };

      const doses = [];
      let counter = 1;

      this.medications.forEach(med => {
        med.times.forEach(slot => {
          let status = 'upcoming';
          let takenAt = null;

          if (slot === 'Morning') {
            status = 'taken';
            takenAt = '8:05 AM';
          } else if (slot === 'Afternoon') {
            status = 'due';
          }

          doses.push({
            id: `dose-${counter++}`,
            medId: med.id,
            medName: med.name,
            strength: med.strength,
            condition: med.condition,
            form: med.form,
            instructions: med.instructions,
            timeSlot: slot,
            timeLabel: timeSlotOrder[slot] || '12:00 PM',
            status: status,
            takenAt: takenAt
          });
        });
      });

      this.doses = doses;
      this.saveStorage(STORAGE_KEYS.DOSES, this.doses);
    }

    // --------------------------------------------------------------------------
    // 3. Audio & Voice Synthesis
    // --------------------------------------------------------------------------
    playSuccessChime() {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();

        const osc1 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc1.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.15);

        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45);

        osc1.connect(gain);
        gain.connect(ctx.destination);

        osc1.start();
        osc1.stop(ctx.currentTime + 0.45);
      } catch (e) {}
    }

    speak(text) {
      if (!this.speechSynth || !this.settings.voiceEnabled) return;
      this.speechSynth.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      const voices = this.speechSynth.getVoices();
      const preferred = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha')));
      if (preferred) utterance.voice = preferred;

      this.speechSynth.speak(utterance);
    }

    speakTodaysRoutine() {
      const total = this.doses.length;
      const taken = this.doses.filter(d => d.status === 'taken').length;
      const due = this.doses.filter(d => d.status === 'due');
      const upcoming = this.doses.filter(d => d.status === 'upcoming');

      let speech = `Hello Eleanor. You have taken ${taken} of ${total} medicines today. `;

      if (due.length > 0) {
        speech += `Right now, you have ${due.length} medicine due: ${due.map(d => `${d.medName} ${d.strength}`).join(', ')}. Please take them with water.`;
      } else if (upcoming.length > 0) {
        speech += `Your next scheduled medicine is ${upcoming[0].medName} in the ${upcoming[0].timeSlot}.`;
      } else {
        speech += `All your medicines for today are completed! Great job!`;
      }

      this.speak(speech);
      this.showToast('Reading today’s routine aloud...', 'info');
    }

    // --------------------------------------------------------------------------
    // 4. Dom Initialization & Event Bindings
    // --------------------------------------------------------------------------
    init() {
      this.applySettingsToDOM();
      this.startClock();
      this.bindEvents();
      this.render();
      this.checkRefillAlertsOnLoad();
    }

    startClock() {
      const update = () => {
        const timeEl = document.getElementById('liveClockTime');
        const dateEl = document.getElementById('liveClockDate');
        const heroDateEl = document.getElementById('heroDateGreeting');

        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const dateStr = now.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });

        if (timeEl) timeEl.textContent = timeStr;
        if (dateEl) dateEl.textContent = dateStr;
        if (heroDateEl) heroDateEl.textContent = dateStr;
      };

      update();
      setInterval(update, 1000);
    }

    applySettingsToDOM() {
      const body = document.body;

      if (this.settings.theme === 'high-contrast') {
        body.classList.add('theme-high-contrast');
        const btn = document.getElementById('toggleContrastBtn');
        if (btn) btn.classList.add('active');
      } else {
        body.classList.remove('theme-high-contrast');
      }

      body.classList.remove('font-large', 'font-xlarge');
      if (this.settings.fontSize === 'large') body.classList.add('font-large');
      if (this.settings.fontSize === 'xlarge') body.classList.add('font-xlarge');

      body.classList.remove('mode-senior', 'mode-caregiver');
      body.classList.add(`mode-${this.settings.userMode}`);

      const modeBadge = document.getElementById('activeModeBadge');
      if (modeBadge) {
        modeBadge.textContent = this.settings.userMode === 'senior' ? 'Senior Mode' : 'Caregiver Admin';
        modeBadge.className = `mode-badge ${this.settings.userMode}`;
      }

      const modeBtn = document.getElementById('toggleUserModeBtn');
      if (modeBtn) {
        modeBtn.innerHTML = this.settings.userMode === 'senior' 
          ? '<span>👥 Switch to Caregiver View</span>' 
          : '<span>👴 Switch to Senior View</span>';
      }
    }

    bindEvents() {
      document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const target = e.currentTarget.dataset.tab;
          this.switchTab(target);
        });
      });

      document.getElementById('fontDecBtn')?.addEventListener('click', () => this.setFontSize('normal'));
      document.getElementById('fontIncBtn')?.addEventListener('click', () => this.setFontSize('large'));
      document.getElementById('fontXlBtn')?.addEventListener('click', () => this.setFontSize('xlarge'));
      document.getElementById('toggleContrastBtn')?.addEventListener('click', () => this.toggleContrast());
      document.getElementById('toggleUserModeBtn')?.addEventListener('click', () => this.toggleUserMode());
      document.getElementById('speakRoutineBtn')?.addEventListener('click', () => this.speakTodaysRoutine());

      document.getElementById('emergencySosBtn')?.addEventListener('click', () => this.openModal('emergencyModal'));
      document.getElementById('closeEmergencyModalBtn')?.addEventListener('click', () => this.closeModal('emergencyModal'));

      document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
        backdrop.addEventListener('click', (e) => {
          if (e.target === backdrop) backdrop.classList.remove('active');
        });
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          document.querySelectorAll('.modal-backdrop.active').forEach(m => m.classList.remove('active'));
        }
      });

      document.getElementById('openAddMedModalBtn')?.addEventListener('click', () => this.openAddMedicineModal());
      document.getElementById('closeMedModalBtn')?.addEventListener('click', () => this.closeModal('medicationModal'));
      document.getElementById('cancelMedBtn')?.addEventListener('click', () => this.closeModal('medicationModal'));
      document.getElementById('medicationForm')?.addEventListener('submit', (e) => this.handleSaveMedicine(e));

      document.getElementById('openAddApptModalBtn')?.addEventListener('click', () => this.openAddApptModal());
      document.getElementById('closeApptModalBtn')?.addEventListener('click', () => this.closeModal('apptModal'));
      document.getElementById('cancelApptBtn')?.addEventListener('click', () => this.closeModal('apptModal'));
      document.getElementById('apptForm')?.addEventListener('submit', (e) => this.handleSaveAppt(e));

      document.getElementById('openAddCaregiverBtn')?.addEventListener('click', () => this.openModal('caregiverModal'));
      document.getElementById('closeCaregiverModalBtn')?.addEventListener('click', () => this.closeModal('caregiverModal'));
      document.getElementById('cancelCaregiverBtn')?.addEventListener('click', () => this.closeModal('caregiverModal'));
      document.getElementById('caregiverForm')?.addEventListener('submit', (e) => this.handleSaveCaregiver(e));

      document.getElementById('medSearchInput')?.addEventListener('input', (e) => this.renderMedicationList(e.target.value));
      document.getElementById('medTimeFilter')?.addEventListener('change', () => this.renderMedicationList());

      document.getElementById('resetDemoDataBtn')?.addEventListener('click', () => this.resetDemoData());
    }

    // --------------------------------------------------------------------------
    // 5. Settings Handlers
    // --------------------------------------------------------------------------
    setFontSize(size) {
      this.settings.fontSize = size;
      this.saveStorage(STORAGE_KEYS.SETTINGS, this.settings);
      this.applySettingsToDOM();
      this.showToast(`Font size set to ${size.toUpperCase()}`, 'info');
    }

    toggleContrast() {
      this.settings.theme = this.settings.theme === 'high-contrast' ? 'normal' : 'high-contrast';
      this.saveStorage(STORAGE_KEYS.SETTINGS, this.settings);
      this.applySettingsToDOM();
      const state = this.settings.theme === 'high-contrast' ? 'High Contrast Activated' : 'Standard Contrast Activated';
      this.showToast(state, 'info');
    }

    toggleUserMode() {
      this.settings.userMode = this.settings.userMode === 'senior' ? 'caregiver' : 'senior';
      this.saveStorage(STORAGE_KEYS.SETTINGS, this.settings);
      this.applySettingsToDOM();
      const msg = this.settings.userMode === 'senior' ? 'Switched to Senior Mode' : 'Switched to Caregiver Admin';
      this.showToast(msg, 'info');
      this.render();
    }

    switchTab(tabId) {
      this.activeTab = tabId;

      document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabId);
      });

      document.querySelectorAll('.tab-panel').forEach(panel => {
        panel.classList.toggle('active', panel.id === `tab-${tabId}`);
      });

      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // --------------------------------------------------------------------------
    // 6. Dose Actions (Take & Undo)
    // --------------------------------------------------------------------------
    takeDose(doseId) {
      const dose = this.doses.find(d => d.id === doseId);
      if (!dose) return;

      const now = new Date();
      const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      dose.status = 'taken';
      dose.takenAt = timeString;

      const med = this.medications.find(m => m.id === dose.medId);
      if (med && med.remainingPills > 0) {
        med.remainingPills -= 1;
        this.saveStorage(STORAGE_KEYS.MEDS, this.medications);
      }

      this.addAuditLog(`${dose.medName} (${dose.strength}) marked as Taken at ${timeString}`, 'taken');
      this.saveStorage(STORAGE_KEYS.DOSES, this.doses);
      this.playSuccessChime();
      this.speak(`Good job! You marked ${dose.medName} as taken.`);
      this.showToast(`Marked ${dose.medName} as Taken!`, 'success');

      this.render();

      if (med && med.remainingPills <= med.refillThreshold) {
        setTimeout(() => {
          this.showToast(`Refill Reminder: Only ${med.remainingPills} pills left of ${med.name}!`, 'warning');
        }, 1500);
      }
    }

    undoDose(doseId) {
      const dose = this.doses.find(d => d.id === doseId);
      if (!dose) return;

      dose.status = dose.timeSlot === 'Afternoon' ? 'due' : 'upcoming';
      dose.takenAt = null;

      const med = this.medications.find(m => m.id === dose.medId);
      if (med) {
        med.remainingPills += 1;
        this.saveStorage(STORAGE_KEYS.MEDS, this.medications);
      }

      this.addAuditLog(`${dose.medName} status was reverted by user`, 'missed');
      this.saveStorage(STORAGE_KEYS.DOSES, this.doses);
      this.showToast(`Reverted ${dose.medName} status`, 'info');
      this.render();
    }

    addAuditLog(text, type = 'taken') {
      const log = {
        id: `log-${Date.now()}`,
        timestamp: `Today at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        text: text,
        type: type
      };
      this.activityLogs.unshift(log);
      if (this.activityLogs.length > 50) this.activityLogs.pop();
      this.saveStorage(STORAGE_KEYS.LOGS, this.activityLogs);
    }

    // --------------------------------------------------------------------------
    // 7. Medicine CRUD Operations
    // --------------------------------------------------------------------------
    openAddMedicineModal() {
      this.editingMedId = null;
      document.getElementById('medModalTitle').textContent = 'Add New Prescription';
      document.getElementById('medicationForm').reset();
      this.openModal('medicationModal');
    }

    openEditMedicineModal(medId) {
      const med = this.medications.find(m => m.id === medId);
      if (!med) return;

      this.editingMedId = medId;
      document.getElementById('medModalTitle').textContent = `Edit ${med.name}`;

      document.getElementById('medNameInput').value = med.name;
      document.getElementById('medStrengthInput').value = med.strength;
      document.getElementById('medConditionInput').value = med.condition;
      document.getElementById('medFormSelect').value = med.form;
      document.getElementById('medInstructionsInput').value = med.instructions;
      document.getElementById('medRemainingInput').value = med.remainingPills;
      document.getElementById('medTotalInput').value = med.totalPills;
      document.getElementById('medDoctorInput').value = med.prescribedBy;

      document.querySelectorAll('input[name="medTimeSlot"]').forEach(cb => {
        cb.checked = med.times.includes(cb.value);
      });

      this.openModal('medicationModal');
    }

    handleSaveMedicine(e) {
      e.preventDefault();

      const name = document.getElementById('medNameInput').value.trim();
      const strength = document.getElementById('medStrengthInput').value.trim();
      const condition = document.getElementById('medConditionInput').value.trim();
      const form = document.getElementById('medFormSelect').value;
      const instructions = document.getElementById('medInstructionsInput').value.trim();
      const remainingPills = parseInt(document.getElementById('medRemainingInput').value, 10) || 30;
      const totalPills = parseInt(document.getElementById('medTotalInput').value, 10) || 30;
      const prescribedBy = document.getElementById('medDoctorInput').value.trim() || 'Dr. Marcus Ross';

      const times = [];
      document.querySelectorAll('input[name="medTimeSlot"]:checked').forEach(cb => {
        times.push(cb.value);
      });

      if (times.length === 0) {
        alert('Please select at least one scheduled time slot (e.g. Morning, Afternoon).');
        return;
      }

      if (this.editingMedId) {
        const index = this.medications.findIndex(m => m.id === this.editingMedId);
        if (index !== -1) {
          this.medications[index] = {
            ...this.medications[index],
            name,
            strength,
            condition,
            form,
            instructions,
            times,
            remainingPills,
            totalPills,
            prescribedBy
          };
          this.showToast(`Updated ${name} prescription!`, 'success');
        }
      } else {
        const newMed = {
          id: `med-${Date.now()}`,
          name,
          strength,
          condition,
          form,
          instructions,
          times,
          remainingPills,
          totalPills,
          prescribedBy,
          refillThreshold: 5,
          color: '#0284c7'
        };
        this.medications.push(newMed);
        this.showToast(`Added ${name} to medicine list!`, 'success');
      }

      this.saveStorage(STORAGE_KEYS.MEDS, this.medications);
      this.generateTodayDoses();
      this.closeModal('medicationModal');
      this.render();
    }

    deleteMedicine(medId) {
      const med = this.medications.find(m => m.id === medId);
      if (!med) return;

      const confirmed = confirm(`Are you sure you want to remove ${med.name} (${med.strength})?`);
      if (!confirmed) return;

      this.medications = this.medications.filter(m => m.id !== medId);
      this.saveStorage(STORAGE_KEYS.MEDS, this.medications);
      this.generateTodayDoses();
      this.addAuditLog(`Prescription for ${med.name} removed by caregiver`, 'missed');
      this.showToast(`Removed ${med.name}`, 'info');
      this.render();
    }

    // --------------------------------------------------------------------------
    // 8. Appointments CRUD
    // --------------------------------------------------------------------------
    openAddApptModal() {
      document.getElementById('apptForm').reset();
      this.openModal('apptModal');
    }

    handleSaveAppt(e) {
      e.preventDefault();

      const doctorName = document.getElementById('apptDoctorInput').value.trim();
      const specialty = document.getElementById('apptSpecialtyInput').value.trim();
      const clinic = document.getElementById('apptClinicInput').value.trim();
      const date = document.getElementById('apptDateInput').value;
      const time = document.getElementById('apptTimeInput').value;
      const phone = document.getElementById('apptPhoneInput').value.trim() || '(555) 000-0000';
      const notes = document.getElementById('apptNotesInput').value.trim();
      const transportNote = document.getElementById('apptTransportInput').value.trim();

      const newAppt = {
        id: `appt-${Date.now()}`,
        doctorName,
        specialty,
        clinic,
        date,
        time,
        phone,
        notes,
        transportNote
      };

      this.appointments.push(newAppt);
      this.saveStorage(STORAGE_KEYS.APPTS, this.appointments);
      this.closeModal('apptModal');
      this.showToast(`Scheduled visit with ${doctorName}!`, 'success');
      this.render();
    }

    deleteAppt(apptId) {
      if (!confirm('Cancel this doctor appointment?')) return;
      this.appointments = this.appointments.filter(a => a.id !== apptId);
      this.saveStorage(STORAGE_KEYS.APPTS, this.appointments);
      this.showToast('Appointment cancelled', 'info');
      this.render();
    }

    // --------------------------------------------------------------------------
    // 9. Caregivers CRUD
    // --------------------------------------------------------------------------
    handleSaveCaregiver(e) {
      e.preventDefault();
      const name = document.getElementById('cgNameInput').value.trim();
      const relation = document.getElementById('cgRelationInput').value.trim();
      const phone = document.getElementById('cgPhoneInput').value.trim();
      const email = document.getElementById('cgEmailInput').value.trim();
      const role = document.getElementById('cgRoleInput').value.trim();

      const newCg = {
        id: `cg-${Date.now()}`,
        name,
        relation,
        phone,
        email,
        role,
        isPrimary: false
      };

      this.caregivers.push(newCg);
      this.saveStorage(STORAGE_KEYS.CAREGIVERS, this.caregivers);
      this.closeModal('caregiverModal');
      this.showToast(`Added ${name} to care team!`, 'success');
      this.render();
    }

    // --------------------------------------------------------------------------
    // 10. Modals & Toasts
    // --------------------------------------------------------------------------
    openModal(id) {
      const modal = document.getElementById(id);
      if (modal) {
        modal.classList.add('active');
        const firstInput = modal.querySelector('input, button:not(.modal-close)');
        if (firstInput) firstInput.focus();
      }
    }

    closeModal(id) {
      const modal = document.getElementById(id);
      if (modal) modal.classList.remove('active');
    }

    showToast(message, type = 'info') {
      const container = document.getElementById('toastContainer');
      if (!container) return;

      const toast = document.createElement('div');
      toast.className = `toast toast-${type}`;
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');

      const icons = {
        success: '✅',
        warning: '⚠️',
        danger: '🚨',
        info: 'ℹ️'
      };

      toast.innerHTML = `
        <span style="font-size: 1.25rem;">${icons[type] || 'ℹ️'}</span>
        <span>${message}</span>
      `;

      container.appendChild(toast);

      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
      }, 4000);
    }

    checkRefillAlertsOnLoad() {
      const lowStock = this.medications.filter(m => m.remainingPills <= m.refillThreshold);
      if (lowStock.length > 0) {
        setTimeout(() => {
          this.showToast(`Low Supply Warning: ${lowStock.map(m => m.name).join(', ')} needs a pharmacy refill soon!`, 'warning');
        }, 800);
      }
    }

    resetDemoData() {
      if (confirm('Reset all demonstration data to factory defaults?')) {
        localStorage.clear();
        window.location.reload();
      }
    }

    // --------------------------------------------------------------------------
    // 11. Rendering Functions
    // --------------------------------------------------------------------------
    render() {
      this.renderAdherenceProgress();
      this.renderTodaySchedule();
      this.renderMedicationList();
      this.renderAppointments();
      this.renderCaregivers();
      this.renderAlertsAndLogs();
      this.updateBadges();
    }

    updateBadges() {
      const dueCount = this.doses.filter(d => d.status === 'due').length;
      const lowStockCount = this.medications.filter(m => m.remainingPills <= m.refillThreshold).length;
      const alertTotal = dueCount + lowStockCount;

      const badge = document.getElementById('alertsNavBadge');
      if (badge) {
        badge.textContent = alertTotal;
        badge.style.display = alertTotal > 0 ? 'inline-block' : 'none';
      }
    }

    renderAdherenceProgress() {
      const total = this.doses.length;
      const taken = this.doses.filter(d => d.status === 'taken').length;
      const due = this.doses.filter(d => d.status === 'due').length;
      const percent = total > 0 ? Math.round((taken / total) * 100) : 0;

      const takenEl = document.getElementById('statTakenDoses');
      const totalEl = document.getElementById('statTotalDoses');
      const percentEl = document.getElementById('statAdherencePercent');
      const barEl = document.getElementById('statProgressBarFill');
      const dueStatEl = document.getElementById('statDueCount');

      if (takenEl) takenEl.textContent = taken;
      if (totalEl) totalEl.textContent = total;
      if (percentEl) percentEl.textContent = `${percent}%`;
      if (barEl) barEl.style.width = `${percent}%`;
      if (dueStatEl) dueStatEl.textContent = due;

      const heroSub = document.getElementById('heroSubMessage');
      if (heroSub) {
        if (due > 0) {
          heroSub.innerHTML = `⚠️ <strong>${due} medication${due > 1 ? 's are' : ' is'} due right now.</strong> Please take with water.`;
        } else if (taken === total && total > 0) {
          heroSub.innerHTML = `🎉 <strong>All medicines for today are taken!</strong> Have a wonderful rest of your day.`;
        } else {
          heroSub.innerHTML = `Next scheduled dose is coming up. Eleanor has completed <strong>${taken} of ${total}</strong> routines.`;
        }
      }
    }

    renderTodaySchedule() {
      const container = document.getElementById('todaySlotsContainer');
      if (!container) return;

      const slots = ['Morning', 'Afternoon', 'Evening', 'Night'];
      const slotTimes = {
        Morning: '8:00 AM',
        Afternoon: '1:00 PM',
        Evening: '6:00 PM',
        Night: '9:00 PM'
      };
      const slotIcons = {
        Morning: '☀️',
        Afternoon: '🌤️',
        Evening: '🌅',
        Night: '🌙'
      };

      container.innerHTML = slots.map(slot => {
        const slotDoses = this.doses.filter(d => d.timeSlot === slot);
        if (slotDoses.length === 0) return '';

        const cardsHtml = slotDoses.map(dose => {
          const isTaken = dose.status === 'taken';
          const isDue = dose.status === 'due';

          let statusClass = 'status-upcoming';
          let tagHtml = '<span class="dose-status-tag tag-upcoming">Upcoming</span>';

          if (isTaken) {
            statusClass = 'status-taken';
            tagHtml = `<span class="dose-status-tag tag-taken">✅ Taken (${dose.takenAt})</span>`;
          } else if (isDue) {
            statusClass = 'status-due';
            tagHtml = '<span class="dose-status-tag tag-due">⏰ Due Now</span>';
          }

          return `
            <article class="dose-card ${statusClass}" aria-label="${dose.medName} ${dose.strength}">
              <div class="dose-header">
                <div class="dose-pill-badge">
                  <div class="pill-icon" aria-hidden="true">💊</div>
                  <div>
                    <h4 class="dose-name">${dose.medName} <span style="font-weight: 500; font-size: 1rem;">(${dose.strength})</span></h4>
                    <p class="dose-condition">${dose.condition}</p>
                  </div>
                </div>
                <div>${tagHtml}</div>
              </div>

              <div class="dose-meta">
                <div class="dose-instruction">
                  <span aria-hidden="true">📋</span>
                  <span>${dose.instructions}</span>
                </div>
              </div>

              <div class="dose-actions">
                ${!isTaken ? `
                  <button type="button" class="btn-take-dose" onclick="window.careConnect.takeDose('${dose.id}')" aria-label="Mark ${dose.medName} as taken">
                    <span aria-hidden="true">✓</span> Mark as Taken
                  </button>
                ` : `
                  <button type="button" class="btn-undo-dose" onclick="window.careConnect.undoDose('${dose.id}')" aria-label="Undo taken status for ${dose.medName}">
                    ↩ Undo
                  </button>
                `}
              </div>
            </article>
          `;
        }).join('');

        return `
          <div class="timeline-slot" aria-labelledby="slot-heading-${slot}">
            <div class="timeline-slot-header">
              <div class="slot-title" id="slot-heading-${slot}">
                <span aria-hidden="true">${slotIcons[slot]}</span>
                <h3>${slot} Routine</h3>
              </div>
              <span class="slot-time">${slotTimes[slot]}</span>
            </div>
            <div class="slot-cards-grid">
              ${cardsHtml}
            </div>
          </div>
        `;
      }).join('');
    }

    renderMedicationList(searchQuery = '') {
      const grid = document.getElementById('medListGrid');
      if (!grid) return;

      const timeFilter = document.getElementById('medTimeFilter')?.value || 'all';

      let filtered = this.medications.filter(med => {
        const matchesQuery = !searchQuery || 
          med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          med.condition.toLowerCase().includes(searchQuery.toLowerCase()) ||
          med.prescribedBy.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesTime = timeFilter === 'all' || med.times.includes(timeFilter);
        return matchesQuery && matchesTime;
      });

      if (filtered.length === 0) {
        grid.innerHTML = `
          <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; background: var(--color-bg-card); border-radius: var(--radius-md); border: 2px dashed var(--color-border);">
            <p style="font-size: 1.25rem; font-weight: 700;">No medications found matching your filter.</p>
            <p>Try searching for a different medicine or clear the search field.</p>
          </div>
        `;
        return;
      }

      grid.innerHTML = filtered.map(med => {
        const isLowRefill = med.remainingPills <= med.refillThreshold;

        return `
          <article class="med-card" aria-label="${med.name}">
            <div class="med-card-header">
              <div>
                <h3 class="med-title">${med.name}</h3>
                <span class="med-dose-strength">${med.strength} (${med.form})</span>
                <p style="font-size: 0.95rem; color: var(--color-text-muted); margin-top: 0.2rem;">${med.condition}</p>
              </div>
              <span class="med-refill-badge ${isLowRefill ? 'refill-low' : 'refill-ok'}">
                ${isLowRefill ? '⚠️ Refill Needed' : '📦 Stock Good'}
              </span>
            </div>

            <ul class="med-details-list">
              <li>
                <strong>Scheduled:</strong>
                <span>${med.times.join(', ')}</span>
              </li>
              <li>
                <strong>Instruction:</strong>
                <span>${med.instructions}</span>
              </li>
              <li>
                <strong>Doctor:</strong>
                <span>${med.prescribedBy}</span>
              </li>
              <li>
                <strong>Inventory:</strong>
                <span style="font-weight: 700; color: ${isLowRefill ? 'var(--color-danger)' : 'inherit'};">
                  ${med.remainingPills} of ${med.totalPills} remaining
                </span>
              </li>
            </ul>

            <div class="med-card-actions">
              <button type="button" class="btn btn-secondary" style="flex: 1;" onclick="window.careConnect.openEditMedicineModal('${med.id}')">
                ✏️ Edit
              </button>
              <button type="button" class="btn btn-danger-outline" onclick="window.careConnect.deleteMedicine('${med.id}')" aria-label="Delete ${med.name}">
                🗑️ Delete
              </button>
            </div>
          </article>
        `;
      }).join('');
    }

    renderAppointments() {
      const grid = document.getElementById('appointmentsGrid');
      if (!grid) return;

      if (this.appointments.length === 0) {
        grid.innerHTML = `
          <div style="grid-column: 1 / -1; text-align: center; padding: 2rem;">
            <p>No upcoming doctor appointments scheduled.</p>
          </div>
        `;
        return;
      }

      grid.innerHTML = this.appointments.map(appt => {
        return `
          <article class="appointment-card" aria-label="Appointment with ${appt.doctorName}">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 0.5rem;">
              <span class="appt-date-badge">
                📅 ${appt.date} • ${appt.time}
              </span>
              <button type="button" class="btn-undo-dose" onclick="window.careConnect.deleteAppt('${appt.id}')" title="Cancel Appointment">
                ✕
              </button>
            </div>

            <div>
              <h3 class="appt-doctor-name">${appt.doctorName}</h3>
              <p class="appt-specialty">${appt.specialty}</p>
            </div>

            <div class="appt-location">
              <span>📍</span>
              <span>${appt.clinic} (Call: ${appt.phone})</span>
            </div>

            ${appt.notes ? `
              <div class="appt-notes-box">
                <strong>Visit Goal:</strong> ${appt.notes}
              </div>
            ` : ''}

            ${appt.transportNote ? `
              <div style="font-size: 0.9rem; color: var(--color-primary-dark); font-weight: 600;">
                🚗 ${appt.transportNote}
              </div>
            ` : ''}
          </article>
        `;
      }).join('');
    }

    renderCaregivers() {
      const teamGrid = document.getElementById('caregiversGrid');
      if (teamGrid) {
        teamGrid.innerHTML = this.caregivers.map(cg => {
          return `
            <div class="caregiver-card">
              <div class="caregiver-avatar">
                ${cg.name.charAt(0)}
              </div>
              <div class="caregiver-info">
                <h4 class="caregiver-name">${cg.name}</h4>
                <div class="caregiver-relation">${cg.relation}</div>
                <div class="caregiver-contact">
                  <a href="tel:${cg.phone}">📞 ${cg.phone}</a>
                  <a href="mailto:${cg.email}">✉️ ${cg.email}</a>
                </div>
                <div style="margin-top: 0.5rem; font-size: 0.8rem; background: var(--color-bg-secondary); padding: 0.2rem 0.5rem; border-radius: var(--radius-sm); display: inline-block;">
                  Role: ${cg.role}
                </div>
              </div>
            </div>
          `;
        }).join('');
      }

      const emergList = document.getElementById('emergencyContactsList');
      if (emergList) {
        emergList.innerHTML = this.caregivers.map(cg => {
          return `
            <div class="emergency-contact-card ${cg.isPrimary ? 'primary' : ''}">
              <div>
                <div class="contact-name">${cg.name}</div>
                <div class="contact-relation">${cg.relation}</div>
              </div>
              <a href="tel:${cg.phone}" class="btn-call" onclick="window.careConnect.showToast('Connecting call to ${cg.name}...', 'info')">
                📞 Call ${cg.phone}
              </a>
            </div>
          `;
        }).join('');
      }
    }

    renderAlertsAndLogs() {
      const alertsContainer = document.getElementById('urgentAlertsContainer');
      const due = this.doses.filter(d => d.status === 'due');
      const lowStock = this.medications.filter(m => m.remainingPills <= m.refillThreshold);

      let alertsHtml = '';

      if (due.length > 0) {
        alertsHtml += `
          <div style="background-color: var(--color-warning-bg); border: 2px solid var(--color-warning); padding: 1.25rem; border-radius: var(--radius-md); margin-bottom: 1rem;">
            <h3 style="color: var(--color-warning); display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
              ⏰ Medicines Due Right Now (${due.length})
            </h3>
            <ul style="padding-left: 1.25rem;">
              ${due.map(d => `<li><strong>${d.medName} ${d.strength}</strong> — Scheduled for ${d.timeSlot} (${d.instructions})</li>`).join('')}
            </ul>
          </div>
        `;
      }

      if (lowStock.length > 0) {
        alertsHtml += `
          <div style="background-color: var(--color-danger-bg); border: 2px solid var(--color-danger); padding: 1.25rem; border-radius: var(--radius-md); margin-bottom: 1rem;">
            <h3 style="color: var(--color-danger); display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
              ⚠️ Low Supply & Prescription Refills Required
            </h3>
            <ul style="padding-left: 1.25rem;">
              ${lowStock.map(m => `<li><strong>${m.name}</strong>: Only <strong>${m.remainingPills} pills left</strong> (Threshold: ${m.refillThreshold}). Prescribed by ${m.prescribedBy}.</li>`).join('')}
            </ul>
          </div>
        `;
      }

      if (!alertsHtml) {
        alertsHtml = `
          <div style="background-color: var(--color-success-bg); border: 2px solid var(--color-success-border); padding: 1.25rem; border-radius: var(--radius-md); margin-bottom: 1rem;">
            <h3 style="color: var(--color-success); margin-bottom: 0.25rem;">✅ No Urgent Alerts</h3>
            <p>All routines are up to date and medication supplies are in good order.</p>
          </div>
        `;
      }

      if (alertsContainer) alertsContainer.innerHTML = alertsHtml;

      const logList = document.getElementById('activityLogList');
      if (logList) {
        logList.innerHTML = this.activityLogs.slice(0, 15).map(log => {
          return `
            <li class="activity-item ${log.type}">
              <span>${log.text}</span>
              <strong style="font-size: 0.85rem; color: var(--color-text-subtle);">${log.timestamp}</strong>
            </li>
          `;
        }).join('');
      }
    }
  }

  // Mount to Global Window
  document.addEventListener('DOMContentLoaded', () => {
    window.careConnect = new CareConnectApp();
  });

})();

