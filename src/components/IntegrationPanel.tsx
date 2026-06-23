/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Copy, Check, FileCode, Terminal, HelpCircle, Server, ShieldCheck } from 'lucide-react';

export default function IntegrationPanel() {
  const [activeTab, setActiveTab] = useState<'deploy' | 'code' | 'rules'>('deploy');
  const [copiedFile, setCopiedFile] = useState<string | null>(null);

  const handleCopy = (fileName: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedFile(fileName);
    setTimeout(() => setCopiedFile(null), 3000);
  };

  const codeGS = `/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * GuruKu GAS Entry Point - Code.gs
 */

function doGet(e) {
  var template = HtmlService.createTemplateFromFile('index');
  return template.evaluate()
      .setTitle('GuruKu - Portal Akademik Guru')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1.0')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * Mendapatkan konfigurasi Firebase untuk Client-Side
 */
function getFirebaseConfig() {
  return {
    apiKey: PropertiesService.getScriptProperties().getProperty('FIREBASE_API_KEY') || 'MOCK_API_KEY',
    authDomain: PropertiesService.getScriptProperties().getProperty('FIREBASE_AUTH_DOMAIN') || 'guruku-auth.firebaseapp.com',
    projectId: PropertiesService.getScriptProperties().getProperty('FIREBASE_PROJECT_ID') || 'guruku-auth',
    storageBucket: PropertiesService.getScriptProperties().getProperty('FIREBASE_STORAGE_BUCKET') || 'guruku-auth.appspot.com',
    messagingSenderId: PropertiesService.getScriptProperties().getProperty('FIREBASE_MESSAGING_SENDER_ID') || '123456789',
    appId: PropertiesService.getScriptProperties().getProperty('FIREBASE_APP_ID') || '1:123:web:abc'
  };
}
`;

  const firebaseServiceGS = `/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * GuruKu Firebase REST API Integration - FirebaseService.gs
 */

var PROJECT_ID = PropertiesService.getScriptProperties().getProperty('FIREBASE_PROJECT_ID') || 'guruku-auth';
var DATABASE_SECRET = PropertiesService.getScriptProperties().getProperty('FIREBASE_DB_SECRET') || '';

function getFirestoreUrl(col, id) {
  var url = 'https://firestore.googleapis.com/v1/projects/' + PROJECT_ID + '/databases/(default)/documents/' + col;
  if (id) {
    url += '/' + id;
  }
  if (DATABASE_SECRET) {
    url += '?key=' + DATABASE_SECRET;
  }
  return url;
}

/**
 * Create / Simpan Data baru ke Firestore
 */
function createData(collection, data, customId) {
  var url = getFirestoreUrl(collection);
  var payload = {
    fields: Utils_convertToFirestoreFields(data)
  };
  
  var options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
  
  if (customId) {
    url = getFirestoreUrl(collection) + '?documentId=' + customId;
  }
  
  var response = UrlFetchApp.fetch(url, options);
  var responseText = response.getContentText();
  return JSON.parse(responseText);
}

/**
 * Read / Ambil Data dari Firestore berdasarkan ID
 */
function readData(collection, id) {
  var url = getFirestoreUrl(collection, id);
  var options = {
    method: 'get',
    muteHttpExceptions: true
  };
  
  var response = UrlFetchApp.fetch(url, options);
  if (response.getResponseCode() === 200) {
    var rawDoc = JSON.parse(response.getContentText());
    return Utils_parseFirestoreDocument(rawDoc);
  }
  return null;
}

/**
 * Update / Perbarui Data di Firestore berdasarkan ID
 */
function updateData(collection, id, data) {
  var url = getFirestoreUrl(collection, id);
  var payload = {
    fields: Utils_convertToFirestoreFields(data)
  };
  
  var options = {
    method: 'patch',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
  
  var response = UrlFetchApp.fetch(url, options);
  var responseText = response.getContentText();
  return JSON.parse(responseText);
}

/**
 * Delete / Hapus Data di Firestore berdasarkan ID
 */
function deleteData(collection, id) {
  var url = getFirestoreUrl(collection, id);
  var options = {
    method: 'delete',
    muteHttpExceptions: true
  };
  
  var response = UrlFetchApp.fetch(url, options);
  return response.getResponseCode() === 200;
}
`;

  const authGS = `/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * GuruKu Firebase Authentication Helper - Auth.gs
 */

/**
 * Verifikasi Session token dikirim dari dashboard client
 */
function validateSession(idToken) {
  // REST API Firebase Auth untuk verifikasi ID Token
  var url = 'https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=' + 
            PropertiesService.getScriptProperties().getProperty('FIREBASE_API_KEY');
  
  var options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({ idToken: idToken }),
    muteHttpExceptions: true
  };
  
  try {
    var response = UrlFetchApp.fetch(url, options);
    var responseCode = response.getResponseCode();
    var result = JSON.parse(response.getContentText());
    
    if (responseCode === 200 && result.users && result.users.length > 0) {
      var user = result.users[0];
      return {
        success: true,
        uid: user.localId,
        email: user.email,
        emailVerified: user.emailVerified
      };
    } else {
      return { success: false, error: result.error ? result.error.message : 'Invalid Token' };
    }
  } catch (err) {
    return { success: false, error: err.toString() };
  }
}
`;

  const utilsGS = `/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * GuruKu Helper Utilities - Utils.gs
 */

/**
 * Konversi JSON standar ke format Fields Firestore REST API
 */
function Utils_convertToFirestoreFields(obj) {
  var fields = {};
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      var val = obj[key];
      if (typeof val === 'string') {
        fields[key] = { stringValue: val };
      } else if (typeof val === 'number') {
        if (val % 1 === 0) {
          fields[key] = { integerValue: val.toString() };
        } else {
          fields[key] = { doubleValue: val };
        }
      } else if (typeof val === 'boolean') {
        fields[key] = { booleanValue: val };
      } else if (val === null) {
        fields[key] = { nullValue: null };
      } else if (Array.isArray(val)) {
        var arrayValues = [];
        for (var i = 0; i < val.length; i++) {
          arrayValues.push(Utils_convertToFirestoreFields({ temp: val[i] }).temp);
        }
        fields[key] = { arrayValue: { values: arrayValues } };
      } else if (typeof val === 'object') {
        fields[key] = { mapValue: { fields: Utils_convertToFirestoreFields(val) } };
      }
    }
  }
  return fields;
}

/**
 * Parsing Format Firestore REST API Document kembali ke JSON Biasa
 */
function Utils_parseFirestoreDocument(firestoreDoc) {
  var id = firestoreDoc.name.split('/').pop();
  var parsed = { id: id };
  
  if (firestoreDoc.fields) {
    for (var key in firestoreDoc.fields) {
      parsed[key] = Utils_parseFirestoreValue(firestoreDoc.fields[key]);
    }
  }
  return parsed;
}

function Utils_parseFirestoreValue(fieldObj) {
  if (fieldObj.stringValue !== undefined) return fieldObj.stringValue;
  if (fieldObj.integerValue !== undefined) return parseInt(fieldObj.integerValue, 10);
  if (fieldObj.doubleValue !== undefined) return parseFloat(fieldObj.doubleValue);
  if (fieldObj.booleanValue !== undefined) return fieldObj.booleanValue;
  if (fieldObj.nullValue !== undefined) return null;
  if (fieldObj.arrayValue !== undefined) {
    var vals = fieldObj.arrayValue.values || [];
    return vals.map(function(item) { return Utils_parseFirestoreValue(item); });
  }
  if (fieldObj.mapValue !== undefined) {
    var mapParsed = {};
    var mapFields = fieldObj.mapValue.fields || {};
    for (var subKey in mapFields) {
      mapParsed[subKey] = Utils_parseFirestoreValue(mapFields[subKey]);
    }
    return mapParsed;
  }
  return undefined;
}
`;

  const firestoreRules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Global safety net
    match /{document=**} {
      allow read, write: if false;
    }

    // Helper Functions
    function isSignedIn() {
      return request.auth != null;
    }

    function isVerified() {
      return isSignedIn() && request.auth.token.email_verified == true;
    }

    function getAdminData() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
    }

    function isAdmin() {
      return isVerified() && (
        getAdminData().role == 'admin' || 
        request.auth.token.email == 'tamrinspd25@gmail.com'
      );
    }

    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }

    // Collection: Users
    match /users/{userId} {
      allow get: if isVerified();
      allow list: if isAdmin();
      allow create: if isVerified() && request.resource.data.role == 'guru' || isAdmin();
      allow update: if isAdmin() || (isOwner(userId) && !request.resource.data.diff(resource.data).affectedKeys().hasAny(['role']));
      allow delete: if isAdmin();
    }

    // Collection: Subjects (Mata Pelajaran)
    match /subjects/{subjectId} {
      allow read: if isVerified();
      allow write: if isAdmin();
    }

    // Collection: Classes (Kelas)
    match /classes/{classId} {
      allow read: if isVerified();
      allow write: if isAdmin();
    }

    // Collection: Students (Siswa)
    match /students/{studentId} {
      allow read: if isVerified();
      allow write: if isAdmin();
    }

    // Collection: Grades (Nilai)
    match /grades/{gradeId} {
      allow read: if isVerified();
      allow create, update: if isVerified(); // Admin & Guru can grade
      allow delete: if isAdmin();
    }

    // Collection: Attendance (Absensi)
    match /attendance/{attendanceId} {
      allow read: if isVerified();
      allow write: if isVerified();
    }

    // Collection: Journals (Jurnal Mengajar)
    match /journals/{journalId} {
      allow read: if isVerified();
      allow create: if isVerified() && request.resource.data.guruId == request.auth.uid;
      allow update: if isVerified() && (resource.data.guruId == request.auth.uid || isAdmin());
      allow delete: if isAdmin();
    }
  }
}`;

  return (
    <div className="space-y-6" id="integration-panel-root">
      {/* Tab Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Server className="w-5 h-5 text-indigo-600 dark:text-indigo-400 animate-pulse" />
            Integrasi GAS & Firebase Hub
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Instruksi dan kode backend siap publish untuk Google Apps Script (GAS) dan Firebase.
          </p>
        </div>
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('deploy')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
              activeTab === 'deploy'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-800'
            }`}
          >
            <HelpCircle className="w-4 h-4 inline mr-1" />
            Panduan Deploy
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
              activeTab === 'code'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-800'
            }`}
          >
            <FileCode className="w-4 h-4 inline mr-1" />
            Apps Script (.gs)
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
              activeTab === 'rules'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4 inline mr-1" />
            Security Rules
          </button>
        </div>
      </div>

      {/* Tab Contents */}
      {activeTab === 'deploy' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fadeIn">
          {/* Panduan Firebase */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-950 flex items-center justify-center font-bold text-orange-600 dark:text-orange-400">1</span>
              <h3 className="font-bold text-slate-800 dark:text-slate-100">Langkah 1: Konfigurasi Firebase</h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Buat project Firestore di Firebase Console dan aktifkan Autentikasi menggunakan Email/Password dan Google Login.
            </p>
            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-lg space-y-2 border border-slate-100 dark:border-slate-900">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Langkah-langkah di Firebase:</h4>
              <ul className="text-xs text-slate-600 dark:text-slate-400 list-decimal list-inside space-y-1.5">
                <li>Buka <a href="https://console.firebase.google.com/" target="_blank" rel="noreferrer" className="text-indigo-600 dark:text-indigo-400 underline">Console Firebase</a></li>
                <li>Buat Database Firestore baru di mode <b>Lock Mode</b></li>
                <li>Aktifkan <b>Authentication → Sign-in Method</b>: Email/Password & Google</li>
                <li>Buka Settings Project (ikon Gigi) → Ambil kredensial Config (SDK Setup)</li>
                <li>Ke tab <i>Service accounts</i> → Generate Private Key baru / Database Secrets untuk integrasi REST API</li>
              </ul>
            </div>
          </div>

          {/* Panduan Google Apps Script */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center font-bold text-blue-600 dark:text-blue-400">2</span>
              <h3 className="font-bold text-slate-800 dark:text-slate-100">Langkah 2: Setup di Google Apps Script</h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Integrasikan frontend HTML dengan script backend (.gs). Apps Script bertindak sebagai web app hosting data ini.
            </p>
            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-lg space-y-2 border border-slate-100 dark:border-slate-900">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Langkah-langkah di GAS:</h4>
              <ul className="text-xs text-slate-600 dark:text-slate-400 list-decimal list-inside space-y-1.5">
                <li>Buka <a href="https://script.google.com/" target="_blank" rel="noreferrer" className="text-indigo-600 dark:text-indigo-400 underline">Google Apps Script</a></li>
                <li>Buat Project Baru dengan nama <b>GuruKu-Backend</b></li>
                <li>Buat file kode GS: <code className="text-indigo-600 dark:text-indigo-400 font-mono font-bold">Code.gs</code>, <code className="text-indigo-600 dark:text-indigo-400 font-mono font-bold">FirebaseService.gs</code>, <code className="text-indigo-600 dark:text-indigo-400 font-mono font-bold">Auth.gs</code>, dan <code className="text-indigo-600 dark:text-indigo-400 font-mono font-bold">Utils.gs</code></li>
                <li>Copas masing-masing isi kode dari panel sebelah</li>
                <li>Pergi ke Project Settings (Gigi roda) → Tambahkan <b>Script Properties</b> berikut:
                  <div className="mt-2 pl-3 border-l-2 border-amber-400 space-y-0.5 font-mono text-[11px] text-slate-500">
                    <div><b>FIREBASE_PROJECT_ID</b>: ID_project_anda</div>
                    <div><b>FIREBASE_API_KEY</b>: Key_web_api_anda</div>
                    <div><b>FIREBASE_DB_SECRET</b>: Rahasia_realdatabase_atau_service_account_token</div>
                  </div>
                </li>
                <li>Deploy sebagai <b>Web App</b> dengan konfigurasi: Berjalan sebagai (Me/Saya) dan Siapa yang memiliki akses (Anyone/Semua Orang).</li>
              </ul>
            </div>
          </div>

          {/* Arsitektur Info */}
          <div className="col-span-1 lg:col-span-2 bg-indigo-50 dark:bg-indigo-950/40 p-6 rounded-xl border border-indigo-100/40 dark:border-indigo-900/30">
            <h4 className="font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-2">
              <Terminal className="w-5 h-5 text-indigo-600" />
              Mengapa Sistem Hybrid Apps Script + Firebase?
            </h4>
            <p className="text-sm text-indigo-700 dark:text-indigo-400 mt-2 leading-relaxed">
              Arsitektur hybrid di GuruKu memanfaatkan kekuatan Google Workspace (Apps Script untuk ekspor dokumen, otomasi Google Sheet, integrasi PDF) yang disinkronisasikan secara real-time dengan basis data global yang super cepat dan aman dari <b>Firebase Firestore</b>. Dengan ini, guru mendapatkan kinerja premium, login Google Google-Native yang lancar, serta ketahanan data tinggi bahkan saat offline.
            </p>
          </div>
        </div>
      )}

      {activeTab === 'code' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Code.gs Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-900">
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-indigo-500" />
                <span className="font-bold text-slate-800 dark:text-slate-200">Code.gs</span>
                <span className="text-[10px] bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded font-mono font-bold">Main Server</span>
              </div>
              <button
                onClick={() => handleCopy('code.gs', codeGS)}
                className="flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 hover:border-slate-300 rounded shadow-xs text-slate-600 dark:text-slate-300 transition"
              >
                {copiedFile === 'code.gs' ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedFile === 'code.gs' ? 'Tersalin' : 'Salin Kode'}
              </button>
            </div>
            <pre className="p-5 font-mono text-[11px] md:text-xs overflow-x-auto text-slate-700 dark:text-slate-300 bg-slate-950 text-emerald-400 max-h-64 leading-relaxed">
              {codeGS}
            </pre>
          </div>

          {/* FirebaseService.gs Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-900">
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-orange-500" />
                <span className="font-bold text-slate-800 dark:text-slate-200">FirebaseService.gs</span>
                <span className="text-[10px] bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 px-2 py-0.5 rounded font-mono font-bold">Firestore REST</span>
              </div>
              <button
                onClick={() => handleCopy('firebaseservice', firebaseServiceGS)}
                className="flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 hover:border-slate-300 rounded shadow-xs text-slate-600 dark:text-slate-300 transition"
              >
                {copiedFile === 'firebaseservice' ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedFile === 'firebaseservice' ? 'Tersalin' : 'Salin Kode'}
              </button>
            </div>
            <pre className="p-5 font-mono text-[11px] md:text-xs overflow-x-auto text-slate-700 dark:text-slate-300 bg-slate-950 text-emerald-400 max-h-64 leading-relaxed">
              {firebaseServiceGS}
            </pre>
          </div>

          {/* Auth.gs Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-900">
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-emerald-500" />
                <span className="font-bold text-slate-800 dark:text-slate-200">Auth.gs</span>
                <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded font-mono font-bold">Auth Helper</span>
              </div>
              <button
                onClick={() => handleCopy('auth', authGS)}
                className="flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 hover:border-slate-300 rounded shadow-xs text-slate-600 dark:text-slate-300 transition"
              >
                {copiedFile === 'auth' ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedFile === 'auth' ? 'Tersalin' : 'Salin Kode'}
              </button>
            </div>
            <pre className="p-5 font-mono text-[11px] md:text-xs overflow-x-auto text-slate-700 dark:text-slate-300 bg-slate-950 text-emerald-400 max-h-64 leading-relaxed">
              {authGS}
            </pre>
          </div>

          {/* Utils.gs Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-900">
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-purple-500" />
                <span className="font-bold text-slate-800 dark:text-slate-200">Utils.gs</span>
                <span className="text-[10px] bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded font-mono font-bold">Serializer</span>
              </div>
              <button
                onClick={() => handleCopy('utils', utilsGS)}
                className="flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 hover:border-slate-300 rounded shadow-xs text-slate-600 dark:text-slate-300 transition"
              >
                {copiedFile === 'utils' ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedFile === 'utils' ? 'Tersalin' : 'Salin Kode'}
              </button>
            </div>
            <pre className="p-5 font-mono text-[11px] md:text-xs overflow-x-auto text-slate-700 dark:text-slate-300 bg-slate-950 text-emerald-400 max-h-64 leading-relaxed">
              {utilsGS}
            </pre>
          </div>
        </div>
      )}

      {activeTab === 'rules' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="bg-amber-50 dark:bg-amber-950/40 p-4 rounded-lg border border-amber-200/40 dark:border-amber-900/30 text-amber-800 dark:text-amber-300 text-xs flex gap-3">
            <ShieldCheck className="w-5 h-5 text-amber-500 flex-shrink-0" />
            <div>
              <span className="font-bold">Dokumen Aturan Keamanan (Zero-Trust)</span>
              <p className="mt-1 leading-relaxed">
                Rules di bawah mengunci DB Firestore Anda untuk model autentikasi multi-peran (Admin vs Guru). Admin memiliki kekuasaan penuh untuk mengedit referensi data master (Mata Pelajaran, Siswa, Kelas), sementara Guru dapat mengedit data akademik (Nilai, Absensi, Jurnal Mengajar) miliknya sendiri. Kunci keamanan ini memvalidasi ID Guru secara real-time.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-900">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-500" />
                <span className="font-bold text-slate-800 dark:text-slate-200">firestore.rules</span>
              </div>
              <button
                onClick={() => handleCopy('rules', firestoreRules)}
                className="flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 hover:border-slate-300 rounded shadow-xs text-slate-600 dark:text-slate-300 transition"
              >
                {copiedFile === 'rules' ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedFile === 'rules' ? 'Tersalin' : 'Salin Aturan Security'}
              </button>
            </div>
            <pre className="p-5 font-mono text-[11px] md:text-xs overflow-x-auto text-slate-400 bg-slate-950 text-emerald-400 max-h-96 leading-relaxed">
              {firestoreRules}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
