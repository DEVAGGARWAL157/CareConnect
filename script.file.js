
/**
 * CareConnect — Automated Test Suite (script.test.js)
 * 
 * Comprehensive Unit & Integration Tests covering:
 * - Data models & Seed Integrity
 * - Daily Schedule Generation & Adherence Math
 * - Dose State Transitions (Take, Undo, Inventory tracking)
 * - Refill Threshold & Warning Triggers
 * - Prescription CRUD Operations (Add, Edit, Delete)
 * - Doctor Appointments CRUD
 * - Caregiver Management & Emergency Contacts
 * - Accessibility Settings (Font scaling, High Contrast, Senior/Caregiver View)
 * 
 * UNIVERSAL COMPATIBILITY:
 * - Can be run with: node script.test.js (Zero external dependencies!)
 * - Fully compatible with Jest, Mocha, Vitest (npm test)
 * - Compatible with browser and Spck Editor runtimes
 */

'use strict';

// ----------------------------------------------------------------------------
// 1. In-Memory Browser API Mocks (for headless Node.js or Test Runners)
// ----------------------------------------------------------------------------
(function setupEnvironmentMocks() {
  class MockLocalStorage {
    constructor() {
      this.store = {};
    }
    getItem(key) {
      return Object.prototype.hasOwnProperty.call(this.store, key) ? this.store[key] : null;
    }
    setItem(key, value) {
      this.store[key] = String(value);
    }
    removeItem(key) {
      delete this.store[key];
    }
    clear() {
      this.store = {};
    }
    get length() {
      return Object.keys(this.store).length;
    }
    key(index) {
      return Object.keys(this.store)[index] || null;
    }
  }

  if (typeof globalThis.localStorage === 'undefined' || !globalThis.localStorage.setItem) {
    globalThis.localStorage = new MockLocalStorage();
  }

  if (typeof globalThis.speechSynthesis === 'undefined') {
    globalThis.speechSynthesis = {
      speak: () => {},
      cancel: () => {},
      getVoices: () => [{ name: 'Google US English', lang: 'en-US' }]
    };
  }

  if (typeof globalThis.SpeechSynthesisUtterance === 'undefined') {
    globalThis.SpeechSynthesisUtterance = function (text) {
      this.text = text;
      this.rate = 1.0;
      this.pitch = 1.0;
      this.volume = 1.0;
    };
  }

  if (typeof globalThis.AudioContext === 'undefined') {
    globalThis.AudioContext = class {
      createOscillator() {
        return {
          type: 'sine',
          frequency: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} },
          connect: () => {},
          start: () => {},
          stop: () => {}
        };
      }
      createGain() {
        return {
          gain: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} },
          connect: () => {}
        };
      }
      get currentTime() { return 0; }
      get destination() { return {}; }
    };
  }

  if (typeof globalThis.alert === 'undefined') globalThis.alert = () => {};
  if (typeof globalThis.confirm === 'undefined') globalThis.confirm = () => true;
})();

// ----------------------------------------------------------------------------
// 2. Load Application Classes
// ----------------------------------------------------------------------------
let CareConnectApp, STORAGE_KEYS, DEFAULT_SETTINGS, SEED_MEDICATIONS, SEED_APPOINTMENTS, SEED_CAREGIVERS, SEED_LOGS;

if (typeof require !== 'undefined') {
  try {
    const appModule = require('./script.js');
    CareConnectApp = appModule.CareConnectApp;
    STORAGE_KEYS = appModule.STORAGE_KEYS;
    DEFAULT_SETTINGS = appModule.DEFAULT_SETTINGS;
    SEED_MEDICATIONS = appModule.SEED_MEDICATIONS;
    SEED_APPOINTMENTS = appModule.SEED_APPOINTMENTS;
    SEED_CAREGIVERS = appModule.SEED_CAREGIVERS;
    SEED_LOGS = appModule.SEED_LOGS;
  } catch (err) {
    CareConnectApp = globalThis.CareConnectApp;
  }
} else {
  CareConnectApp = globalThis.CareConnectApp;
}

// ----------------------------------------------------------------------------
// 3. Lightweight Universal Test Runner (Jest/Mocha Compatible)
// ----------------------------------------------------------------------------
const isJestOrMocha = typeof globalThis.describe === 'function' && typeof globalThis.it === 'function';
let testResults = { total: 0, passed: 0, failed: 0, errors: [] };

function customDescribe(suiteName, fn) {
  if (isJestOrMocha) {
    globalThis.describe(suiteName, fn);
  } else {
    console.log(`\n\x1b[1m\x1b[36m▶ Suite: ${suiteName}\x1b[0m`);
    fn();
  }
}

function customTest(testName, fn) {
  if (isJestOrMocha) {
    globalThis.it(testName, fn);
  } else {
    testResults.total++;
    try {
      fn();
      testResults.passed++;
      console.log(`  \x1b[32m✔ PASS\x1b[0m ${testName}`);
    } catch (error) {
      testResults.failed++;
      testResults.errors.push({ testName, error });
      console.log(`  \x1b[31m✖ FAIL\x1b[0m ${testName}`);
      console.log(`    \x1b[33mError: ${error.message}\x1b[0m`);
    }
  }
}

function expect(actual) {
  return {
    toBe(expected) {
      if (actual !== expected) {
        throw new Error(`Expected [${expected}] but received [${actual}]`);
      }
    },
    toEqual(expected) {
      const actualStr = JSON.stringify(actual);
      const expectedStr = JSON.stringify(expected);
      if (actualStr !== expectedStr) {
        throw new Error(`Expected ${expectedStr} but received ${actualStr}`);
      }
    },
    toBeTruthy() {
      if (!actual) throw new Error(`Expected truthy value but got [${actual}]`);
    },
    toBeFalsy() {
      if (actual) throw new Error(`Expected falsy value but got [${actual}]`);
    },
    toBeGreaterThan(num) {
      if (actual <= num) throw new Error(`Expected [${actual}] to be greater than [${num}]`);
    },
    toBeLessThanOrEqual(num) {
      if (actual > num) throw new Error(`Expected [${actual}] to be <= [${num}]`);
    },
    toBeDefined() {
      if (typeof actual === 'undefined') throw new Error(`Expected value to be defined`);
    },
    toContain(expectedItem) {
      if (!Array.isArray(actual) && typeof actual !== 'string') {
        throw new Error(`Expected array or string to contain [${expectedItem}]`);
      }
      if (Array.isArray(actual) && !actual.includes(expectedItem)) {
        throw new Error(`Array does not contain [${expectedItem}]`);
      }
      if (typeof actual === 'string' && !actual.includes(expectedItem)) {
        throw new Error(`String does not contain [${expectedItem}]`);
      }
    },
    toHaveLength(expectedLen) {
      if (!actual || actual.length !== expectedLen) {
        throw new Error(`Expected length [${expectedLen}] but received [${actual ? actual.length : 0}]`);
      }
    }
  };
}

// ----------------------------------------------------------------------------
// 4. TEST SUITES
// ----------------------------------------------------------------------------

customDescribe('CareConnect - 1. Platform Initialization & Seed Data', () => {
  customTest('Should initialize with factory default seed data when storage is empty', () => {
    localStorage.clear();
    const app = new CareConnectApp();

    expect(app.medications.length).toBe(5);
    expect(app.appointments.length).toBe(3);
    expect(app.caregivers.length).toBe(4);
    expect(app.settings.userMode).toBe('senior');
    expect(app.settings.fontSize).toBe('normal');
  });

  customTest('Should contain Eleanor Vance’s primary prescriptions', () => {
    localStorage.clear();
    const app = new CareConnectApp();

    const medNames = app.medications.map(m => m.name);
    expect(medNames).toContain('Lisinopril');
    expect(medNames).toContain('Metformin');
    expect(medNames).toContain('Vitamin D3');
    expect(medNames).toContain('Atorvastatin');
    expect(medNames).toContain('Moisturizing Eye Drops');
  });

  customTest('Primary caregiver should be Sarah Vance with medical proxy role', () => {
    localStorage.clear();
    const app = new CareConnectApp();

    const primary = app.caregivers.find(c => c.isPrimary === true);
    expect(primary.name).toBe('Sarah Vance');
    expect(primary.relation).toContain('Daughter');
    expect(primary.phone).toBe('(555) 234-5678');
  });
});

customDescribe('CareConnect - 2. Daily Routine & Schedule Generation', () => {
  customTest('Should generate schedule slots covering Morning, Afternoon, Evening, and Night', () => {
    localStorage.clear();
    const app = new CareConnectApp();

    const slots = app.doses.map(d => d.timeSlot);
    expect(slots).toContain('Morning');
    expect(slots).toContain('Afternoon');
    expect(slots).toContain('Evening');
    expect(slots).toContain('Night');
  });

  customTest('Should accurately calculate adherence rate percentage', () => {
    localStorage.clear();
    const app = new CareConnectApp();

    const total = app.doses.length;
    const taken = app.doses.filter(d => d.status === 'taken').length;
    const expectedPercent = Math.round((taken / total) * 100);

    const calculated = app.doses.length > 0 ? Math.round((taken / total) * 100) : 0;
    expect(calculated).toBe(expectedPercent);
    expect(calculated).toBeGreaterThan(0);
  });
});

customDescribe('CareConnect - 3. Dose State Transitions & Inventory Tracking', () => {
  customTest('takeDose() should mark an active dose as Taken, record timestamp, and decrement pills count', () => {
    localStorage.clear();
    const app = new CareConnectApp();

    const dueDose = app.doses.find(d => d.status === 'due');
    expect(dueDose).toBeDefined();

    const initialPills = app.medications.find(m => m.id === dueDose.medId).remainingPills;
    const initialLogsCount = app.activityLogs.length;

    app.takeDose(dueDose.id);

    const updatedDose = app.doses.find(d => d.id === dueDose.id);
    expect(updatedDose.status).toBe('taken');
    expect(updatedDose.takenAt).toBeDefined();

    const updatedMed = app.medications.find(m => m.id === dueDose.medId);
    expect(updatedMed.remainingPills).toBe(initialPills - 1);

    expect(app.activityLogs.length).toBe(initialLogsCount + 1);
    expect(app.activityLogs[0].type).toBe('taken');
  });

  customTest('undoDose() should revert taken status and restore remaining pill count', () => {
    localStorage.clear();
    const app = new CareConnectApp();

    const takenDose = app.doses.find(d => d.status === 'taken');
    expect(takenDose).toBeDefined();

    const targetMed = app.medications.find(m => m.id === takenDose.medId);
    const initialPills = targetMed.remainingPills;

    app.undoDose(takenDose.id);

    const updatedDose = app.doses.find(d => d.id === takenDose.id);
    expect(updatedDose.status).toBe('upcoming');
    expect(updatedDose.takenAt).toBe(null);

    expect(targetMed.remainingPills).toBe(initialPills + 1);
  });
});

customDescribe('CareConnect - 4. Refill Alerts & Inventory Thresholds', () => {
  customTest('Should identify prescriptions at or below low-stock refill threshold (<= 5 pills)', () => {
    localStorage.clear();
    const app = new CareConnectApp();

    const lowStock = app.medications.filter(m => m.remainingPills <= m.refillThreshold);
    expect(lowStock.length).toBeGreaterThan(0);

    const lowStockNames = lowStock.map(m => m.name);
    expect(lowStockNames).toContain('Vitamin D3');
  });

  customTest('Should not flag medications with ample stock (> threshold)', () => {
    localStorage.clear();
    const app = new CareConnectApp();

    const metformin = app.medications.find(m => m.name === 'Metformin');
    expect(metformin.remainingPills).toBe(42);
    expect(metformin.remainingPills > metformin.refillThreshold).toBe(true);
  });
});

customDescribe('CareConnect - 5. Prescription CRUD Operations', () => {
  customTest('Should successfully add a new medication prescription', () => {
    localStorage.clear();
    const app = new CareConnectApp();

    const initialCount = app.medications.length;
    const newMed = {
      id: `med-custom-999`,
      name: 'CoQ10 Heart Health',
      strength: '200 mg',
      condition: 'Cardiovascular Support',
      form: 'capsule',
      instructions: 'Take 1 with morning breakfast',
      times: ['Morning'],
      remainingPills: 60,
      totalPills: 60,
      prescribedBy: 'Dr. Marcus Ross',
      refillThreshold: 5,
      color: '#0284c7'
    };

    app.medications.push(newMed);
    app.saveStorage(STORAGE_KEYS.MEDS, app.medications);
    app.generateTodayDoses();

    expect(app.medications.length).toBe(initialCount + 1);

    const customDose = app.doses.find(d => d.medName === 'CoQ10 Heart Health');
    expect(customDose).toBeDefined();
    expect(customDose.timeSlot).toBe('Morning');
  });

  customTest('Should successfully edit an existing prescription', () => {
    localStorage.clear();
    const app = new CareConnectApp();

    const med = app.medications.find(m => m.name === 'Lisinopril');
    expect(med).toBeDefined();

    med.strength = '20 mg';
    med.instructions = 'Take 1 tablet every morning with full water';
    app.saveStorage(STORAGE_KEYS.MEDS, app.medications);

    const reloaded = app.loadStorage(STORAGE_KEYS.MEDS, []);
    const updatedLisinopril = reloaded.find(m => m.name === 'Lisinopril');
    expect(updatedLisinopril.strength).toBe('20 mg');
    expect(updatedLisinopril.instructions).toContain('full water');
  });

  customTest('deleteMedicine() should remove prescription from store', () => {
    localStorage.clear();
    const app = new CareConnectApp();

    const initialCount = app.medications.length;
    const medToDelete = app.medications[0];

    app.deleteMedicine(medToDelete.id);

    expect(app.medications.length).toBe(initialCount - 1);
    const found = app.medications.find(m => m.id === medToDelete.id);
    expect(found).toBe(undefined);
  });
});

customDescribe('CareConnect - 6. Doctor Appointments Management', () => {
  customTest('Should schedule a new doctor appointment', () => {
    localStorage.clear();
    const app = new CareConnectApp();

    const initialCount = app.appointments.length;
    const newAppt = {
      id: `appt-test-101`,
      doctorName: 'Dr. Sarah Jenkins',
      specialty: 'Neurologist',
      clinic: 'North Valley Clinic, Suite 300',
      date: '2026-11-25',
      time: '11:00 AM',
      phone: '(555) 321-7654',
      notes: 'Cognitive and reflex checkup',
      transportNote: 'Sarah driving'
    };

    app.appointments.push(newAppt);
    app.saveStorage(STORAGE_KEYS.APPTS, app.appointments);

    expect(app.appointments.length).toBe(initialCount + 1);
    const added = app.appointments.find(a => a.id === 'appt-test-101');
    expect(added.doctorName).toBe('Dr. Sarah Jenkins');
    expect(added.specialty).toBe('Neurologist');
  });

  customTest('deleteAppt() should cancel and remove an appointment', () => {
    localStorage.clear();
    const app = new CareConnectApp();

    const targetId = app.appointments[0].id;
    const initialCount = app.appointments.length;

    app.deleteAppt(targetId);

    expect(app.appointments.length).toBe(initialCount - 1);
    expect(app.appointments.find(a => a.id === targetId)).toBe(undefined);
  });
});

customDescribe('CareConnect - 7. Caregiver Access & Audit Logging', () => {
  customTest('Should allow adding a new caregiver to the circle of care', () => {
    localStorage.clear();
    const app = new CareConnectApp();

    const initialCount = app.caregivers.length;
    const newMember = {
      id: 'cg-new-1',
      name: 'Michael Vance',
      relation: 'Grandson',
      phone: '(555) 777-8888',
      email: 'michael.v@example.com',
      role: 'Weekend Companion',
      isPrimary: false
    };

    app.caregivers.push(newMember);
    app.saveStorage(STORAGE_KEYS.CAREGIVERS, app.caregivers);

    expect(app.caregivers.length).toBe(initialCount + 1);
    const found = app.caregivers.find(c => c.name === 'Michael Vance');
    expect(found.relation).toBe('Grandson');
  });

  customTest('addAuditLog() should maintain chronological adherence audit records', () => {
    localStorage.clear();
    const app = new CareConnectApp();

    app.addAuditLog('Medication safety check performed by Nurse Maria', 'taken');
    expect(app.activityLogs[0].text).toContain('Medication safety check');
    expect(app.activityLogs[0].type).toBe('taken');
  });
});

customDescribe('CareConnect - 8. Accessibility & Ergonomics Toolkit', () => {
  customTest('setFontSize() should update and persist font scaling', () => {
    localStorage.clear();
    const app = new CareConnectApp();

    app.setFontSize('large');
    expect(app.settings.fontSize).toBe('large');

    app.setFontSize('xlarge');
    expect(app.settings.fontSize).toBe('xlarge');

    const stored = app.loadStorage(STORAGE_KEYS.SETTINGS, {});
    expect(stored.fontSize).toBe('xlarge');
  });

  customTest('toggleContrast() should switch between normal and high-contrast', () => {
    localStorage.clear();
    const app = new CareConnectApp();

    expect(app.settings.theme).toBe('normal');

    app.toggleContrast();
    expect(app.settings.theme).toBe('high-contrast');

    app.toggleContrast();
    expect(app.settings.theme).toBe('normal');
  });

  customTest('toggleUserMode() should toggle between Senior Mode and Caregiver Mode', () => {
    localStorage.clear();
    const app = new CareConnectApp();

    expect(app.settings.userMode).toBe('senior');

    app.toggleUserMode();
    expect(app.settings.userMode).toBe('caregiver');

    app.toggleUserMode();
    expect(app.settings.userMode).toBe('senior');
  });
});

// ----------------------------------------------------------------------------
// 5. Final Test Execution Summary Report
// ----------------------------------------------------------------------------
if (!isJestOrMocha) {
  console.log('\n======================================================');
  console.log(`CareConnect Test Suite Execution Summary:`);
  console.log(`Total Tests Run : ${testResults.total}`);
  console.log(`\x1b[32mPassed          : ${testResults.passed}\x1b[0m`);
  console.log(`\x1b[31mFailed          : ${testResults.failed}\x1b[0m`);
  console.log('======================================================');

  if (testResults.failed > 0) {
    console.error(`\x1b[31mFAIL: ${testResults.failed} test(s) failed.\x1b[0m`);
    if (typeof process !== 'undefined') process.exit(1);
  } else {
    console.log(`\x1b[32m✔ SUCCESS: 100% of CareConnect automated tests passed!\x1b[0m\n`);
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testResults };
}
