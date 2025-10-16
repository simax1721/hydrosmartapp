#include <WiFi.h>
#include <Firebase_ESP_Client.h>

#include <DHT.h>
#include <Wire.h>
#include <BH1750.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <Adafruit_Sensor.h>
#include <SPI.h>

#include <WiFiUdp.h>
#include <NTPClient.h>

// ====== Konfigurasi WiFi ======
#define WIFI_SSID "CEK RIM KOPI-4G"
#define WIFI_PASSWORD "kopidingin"
// #define WIFI_SSID "."
// #define WIFI_PASSWORD "12345687"

// ====== Konfigurasi Firebase ======
#define API_KEY "AIzaSyDAxT3D-8hc1rLohWx0FKhfQwYqVPQkCz0"
#define DATABASE_URL "https://hydrosmart-6aab6-default-rtdb.asia-southeast1.firebasedatabase.app"
#define USER_EMAIL "mfadhlan1721@gmail.com"
#define USER_PASSWORD "IZZA1224"

// ====== OBJEK FIREBASE ======
FirebaseData fbData;
FirebaseAuth auth;
FirebaseConfig config;

// ====== PIN SENSOR ======
#define DHTPIN 5
#define DHTTYPE DHT22
#define DS18B20_PIN 32
#define TDS_PIN 35
#define PH_PIN 34

// ====== PIN RELAY ======
#define relay1lampu 33
#define relay2pompaIn 25
#define relay3pompaOut 26
#define relay4kipas 27

// ====== OBJEK SENSOR ======
DHT dht(DHTPIN, DHTTYPE);
BH1750 lightMeter;
OneWire oneWire(DS18B20_PIN);
DallasTemperature suhuAir(&oneWire);

// ====== VARIABEL SENSOR ======
float suhuUdara = -1;
float kelembabanUdara = -1;
float cahaya = -1;
float suhuAirValue = -1;
float ppm = -1;
float phair = -1;

// ====== INTERVAL ======
unsigned long lastReadTime = 0;
const unsigned long readInterval = 10000; // 10 detik

// ====== NTP Client (GMT+7) ======
WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP, "pool.ntp.org", 7 * 3600, 60000); // GMT+7, update tiap 60s

// untuk memastikan history hanya tersimpan sekali tiap jam
String lastSavedHour = "";

// ----------------- Helper: format timestamp hour (yyyy-mm-dd HH) -----------------
String getTimestampHour() {
  timeClient.update();
  time_t epoch = timeClient.getEpochTime();
  struct tm *lt = localtime(&epoch);

  char buf[20];
  // sprintf(buf, "%04d-%02d-%02d %02d",
  //         lt->tm_year + 1900,
  //         lt->tm_mon + 1,
  //         lt->tm_mday,
  //         lt->tm_hour);
  sprintf(buf, "%04d-%02d-%02d_%02d",
          lt->tm_year + 1900,
          lt->tm_mon + 1,
          lt->tm_mday,
          lt->tm_hour);
  return String(buf); // "2025-10-02 14"
}

// ----------------- Setup -----------------
void setup() {
  Serial.begin(115200);

  // Connect WiFi
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Menghubungkan ke WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(500);
  }
  Serial.println("\n✅ WiFi terhubung.");

  // Firebase config
  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;
  auth.user.email = USER_EMAIL;
  auth.user.password = USER_PASSWORD;

  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);
  Serial.println("✅ Firebase siap!");

  // NTP
  timeClient.begin();
  // tunggu NTP update pertama
  unsigned long startNtp = millis();
  while (!timeClient.update() && millis() - startNtp < 10000) {
    timeClient.forceUpdate();
    delay(200);
  }
  Serial.println("✅ NTP siap!");

  // Sensor init
  dht.begin();
  Wire.begin(22, 21);
  lightMeter.begin();
  suhuAir.begin();
  Serial.println("✅ Sensor siap!");

  // Relay init (aktif = LOW asumsi)
  pinMode(relay1lampu, OUTPUT);
  pinMode(relay2pompaIn, OUTPUT);
  pinMode(relay3pompaOut, OUTPUT);
  pinMode(relay4kipas, OUTPUT);

  digitalWrite(relay1lampu, HIGH);
  digitalWrite(relay2pompaIn, HIGH);
  digitalWrite(relay3pompaOut, HIGH);
  digitalWrite(relay4kipas, HIGH);
  Serial.println("✅ Relay siap!");
}

void loop () {
  // update NTP regularly
  timeClient.update();

  if (millis() - lastReadTime >= readInterval) {

    suhuUdara = dhtRead();
    kelembabanUdara = dhtReadHumidity();
    cahaya = bh1750Read();
    suhuAirValue = ds18b20Read();
    ppm = tdsRead();
    phair = phRead();

    Serial.printf("🌡 SuhuUdara: %.2f °C | 💧 Kelembapan: %.2f %% | 💡 Cahaya: %.2f Lux | 🌊 SuhuAir: %.2f °C | ppm: %.2f | pH: %.2f\n",
                  suhuUdara, kelembabanUdara, cahaya, suhuAirValue, ppm, phair);

    if (Firebase.ready()) {
      sensorToFirebaseRealtime(suhuUdara, kelembabanUdara, cahaya, suhuAirValue, ppm, phair);

      // Simpan history per jam: hanya sekali saat jam berganti
      String curHour = getTimestampHour(); // "yyyy-mm-dd HH"
      if (curHour != lastSavedHour) {
        // simpan snapshot pada folder /hydrosmart/history/{yyyy-mm-dd HH}/...
        saveHistorySnapshot(curHour);
        lastSavedHour = curHour;
        Serial.println("✅ History hourly saved for: " + curHour);
      }

      // update kontrol (otomatis/manual)
      updateControl();
    }

    lastReadTime = millis(); 
  }

  
}

// ----------------- SENSOR FUNCTIONS -----------------
float dhtRead() {
  float t = dht.readTemperature();
  return isnan(t) ? -1 : t;
}

float dhtReadHumidity() {
  float h = dht.readHumidity();
  return isnan(h) ? -1 : h;
}

float bh1750Read() {
  float lux = lightMeter.readLightLevel();
  return isnan(lux) ? -1 : lux;
}

float ds18b20Read() {
  suhuAir.requestTemperatures();
  float v = suhuAir.getTempCByIndex(0);
  return (v == DEVICE_DISCONNECTED_C) ? -1 : v;
}

float tdsRead() {
  int sensorValue = analogRead(TDS_PIN);
  // map 0..4095 ke 0..1000 ppm (sesuaikan kalibrasi)
  float val = map(sensorValue, 0, 4095, 0, 1000);
  return val;
}

// data kalibrasi sensor ph
float PH4 = 3.30;
float PH7 = 2.51;

float PH_step;
// int nilai_analog_PH;
double TeganganPh;

float phRead() {

  float phValue;

  int nilaiADC = analogRead(PH_PIN);

  // Konversi nilai ADC (0–4095) ke tegangan (0–3.3V)
  TeganganPh = nilaiADC * (3.3 / 4095.0);

  // Hitung step perubahan tegangan antar 1 satuan pH
  PH_step = (PH4 - PH7) / 3.0;

  // Hitung nilai pH aktual
  phValue = 7.00 + ((PH7 - TeganganPh) / PH_step);

  // Debug serial
  // Serial.println("===== Pembacaan Sensor pH =====");
  // Serial.print("Nilai ADC pH: ");
  // Serial.println(nilaiADC);
  // Serial.print("Tegangan pH : ");
  // Serial.println(TeganganPh, 3);
  // Serial.print("Nilai pH Cairan: ");
  // Serial.println(phValue, 2);
  // Serial.println("----------------------------------");

  // kembalikan nilai pH
  return phValue;

  // dummy pH sementara 5.5 - 7.5
  float ph = random(55, 75) / 10.0;
  return ph;
}


// ----------------- Fungsi kirim data ke Firebase -----------------
void sensorToFirebaseRealtime(float suhuUdara, float kelembabanUdara, float cahaya, float suhuAir, float ppm, float phair) {
  String path = "/hydrosmart/sensor";

  FirebaseJson json;
  json.set("suhuudara", suhuUdara);
  json.set("kelembabanudara", kelembabanUdara);
  json.set("cahaya", cahaya);
  json.set("suhuair", suhuAir);
  json.set("ppm", ppm);
  json.set("phair", phair);

  if (Firebase.RTDB.setJSON(&fbData, path.c_str(), &json)) {
    Serial.println("✅ Data sensor berhasil dikirim ke Firebase!");
  } else {
    Serial.println("❌ Gagal kirim data: " + fbData.errorReason());
  }
}

// Simpan satu snapshot per jam pada node /hydrosmart/history/{yyyy-mm-dd HH}/...
void saveHistorySnapshot(const String &timestampHour) {
  // if (suhuUdara != -1) {
  //   if (!Firebase.RTDB.setDouble(&fbData, (base + "suhuudara").c_str(), suhuUdara)) {
  //     Serial.println("❌ History suhuudara gagal: " + fbData.errorReason());
  //   }
  // }
  // Parent path
  String base = "/hydrosmart/history/" + timestampHour + "/";

  // Set semua nilai (6 sensor)
  if (suhuUdara != -1)
    Firebase.RTDB.setDouble(&fbData, (base + "suhuudara").c_str(), suhuUdara);
  if (kelembabanUdara != -1)
    Firebase.RTDB.setDouble(&fbData, (base + "kelembabanudara").c_str(), kelembabanUdara);
  if (cahaya != -1)
    Firebase.RTDB.setDouble(&fbData, (base + "cahaya").c_str(), cahaya);
  if (suhuAirValue != -1)
    Firebase.RTDB.setDouble(&fbData, (base + "suhuair").c_str(), suhuAirValue);
  if (ppm != -1)
    Firebase.RTDB.setDouble(&fbData, (base + "ppm").c_str(), ppm);
  if (phair != -1)
    Firebase.RTDB.setDouble(&fbData, (base + "phair").c_str(), phair);

  // juga simpan human-readable time
  String readable = getFormattedTime(); // e.g. "2025-10-02 14:05:00"
  Firebase.RTDB.setString(&fbData, (base + "time").c_str(), readable);
}

// tambahan: format waktu lengkap yyyy-mm-dd HH:ii:ss
String getFormattedTime() {
  timeClient.update();
  time_t epoch = timeClient.getEpochTime();
  struct tm *lt = localtime(&epoch);

  char buf[25];
  sprintf(buf, "%04d-%02d-%02d %02d:%02d:%02d",
          lt->tm_year + 1900, lt->tm_mon + 1, lt->tm_mday,
          lt->tm_hour, lt->tm_min, lt->tm_sec);
  return String(buf);
}





// ----------------- Fungsi kontrol relay -----------------
FirebaseJson controlJson;
FirebaseJson controlAdvanceJson;

// Parsing nilai mode otomatis/manual
bool kipasModeControl = false;
bool lampuModeControl = false;
bool pompaModeControl = false;
// bool pompaOutModeControl = false;

// Parsing nilai manual controlAdvance
bool kipasModeControlAdvance = false;
bool lampuModeControlAdvance = false;
bool pompaInModeControlAdvance = false;
bool pompaModeControlAdvance = false;
bool pompaOutModeControlAdvance = false;

// ----------------- Fungsi kontrol relay -----------------
void kontrolRelay(String namaRelay, int pinRelay, bool modeRelay) {
  if (modeRelay) {
    digitalWrite(pinRelay, LOW);  // aktif (relay on)
    Serial.println("🔌 Manual " + namaRelay + " ON");
  } else {
    digitalWrite(pinRelay, HIGH); // nonaktif (relay off)
    Serial.println("🔌 Manual " + namaRelay + " OFF");
  }
}

// ----------------- Fungsi kontrol relay otomatis -----------------
void KontrolRelayOtomatis(String namaRelay, int pinRelay, bool modeRelay) {
  String path = "/hydrosmart/controlAdvance/" + namaRelay;

  if (modeRelay) {
    digitalWrite(pinRelay, LOW);  // aktif (relay on)
    Serial.println("🔌 Otomatis " + namaRelay + " ON");

    // Update status relay ke Firebase
    if (Firebase.RTDB.setBool(&fbData, path.c_str(), true)) {
      Serial.println("✅ Firebase update: " + path + " = true");
    } else {
      Serial.println("❌ Gagal update Firebase: " + fbData.errorReason());
    }

  } else {
    digitalWrite(pinRelay, HIGH); // nonaktif (relay off)
    Serial.println("🔌 Otomatis " + namaRelay + " OFF");

    // Update status relay ke Firebase
    if (Firebase.RTDB.setBool(&fbData, path.c_str(), false)) {
      Serial.println("✅ Firebase update: " + path + " = false");
    } else {
      Serial.println("❌ Gagal update Firebase: " + fbData.errorReason());
    }
  }
}

// ----------------- Fungsi update kontrol dari Firebase -----------------
void updateControl() {
  FirebaseJsonData data;

  // Ambil data mode otomatis/manual
  if (Firebase.RTDB.getJSON(&fbData, "/hydrosmart/control")) {
    controlJson = fbData.to<FirebaseJson>();
  } else {
    Serial.println("❌ Gagal ambil /control: " + fbData.errorReason());
    return;
  }

  // Ambil nilai dari JSON
  if (controlJson.get(data, "kipasMode")) kipasModeControl = data.to<bool>();
  if (controlJson.get(data, "lampuMode")) lampuModeControl = data.to<bool>();
  if (controlJson.get(data, "pompaMode")) pompaModeControl = data.to<bool>();
  // if (controlJson.get(data, "pompaOutMode")) pompaOutModeControl = data.to<bool>();

  // Ambil data manual controlAdvance
  if (Firebase.RTDB.getJSON(&fbData, "/hydrosmart/controlAdvance")) {
    controlAdvanceJson = fbData.to<FirebaseJson>();
  } else {
    Serial.println("❌ Gagal ambil /controlAdvance: " + fbData.errorReason());
    return;
  }

  if (controlAdvanceJson.get(data, "kipasMode")) kipasModeControlAdvance = data.to<bool>();
  if (controlAdvanceJson.get(data, "lampuMode")) lampuModeControlAdvance = data.to<bool>();
  if (controlAdvanceJson.get(data, "pompaInMode")) pompaInModeControlAdvance = data.to<bool>();
  if (controlAdvanceJson.get(data, "pompaMode")) pompaModeControlAdvance = data.to<bool>();
  if (controlAdvanceJson.get(data, "pompaOutMode")) pompaOutModeControlAdvance = data.to<bool>();

  // ======== KIPAS ========
  if (kipasModeControl) {
    if (suhuUdara >= 35.0) {
      KontrolRelayOtomatis("kipasMode", relay4kipas, true);
    } else {
      KontrolRelayOtomatis("kipasMode", relay4kipas, false);
    }
  } else {
    kontrolRelay("Kipas", relay4kipas, kipasModeControlAdvance);
  }

  // ======== LAMPU ========
  if (lampuModeControl) {
    if (cahaya <= 100.0) {
      KontrolRelayOtomatis("lampuMode", relay1lampu, true);
    } else {
      KontrolRelayOtomatis("lampuMode", relay1lampu, false);
    }
    
  } else {
    kontrolRelay("Lampu", relay1lampu, lampuModeControlAdvance);
  }

  // ========================= POMPA =========================
  static unsigned long pompaTimer = 0;
  static int pompaState = 0;  // 0: idle, 1: buang, 2: isi
  const unsigned long durasiPompa = 15000; // 15 detik per proses
  unsigned long now = millis();

  // ======== POMPA (otomatis / manual) ========
  if (pompaModeControl) {
    // =============== MODE OTOMATIS ===============
    if ((suhuAirValue <= 30.0) && (ppm >= 200 && ppm <= 2000) && (phair >= 5.5 && phair <= 7.5)) {
      if (pompaState != 0) {
        KontrolRelayOtomatis("pompaOutMode", relay3pompaOut, false);
        KontrolRelayOtomatis("pompaInMode", relay2pompaIn, false);
        pompaState = 0;
        Serial.println("💧 Kondisi air stabil — semua pompa dimatikan.");
      }
    } else {
      if (pompaState == 0) {
        Serial.println("⚠️ Air tidak stabil — mulai buang air.");
        KontrolRelayOtomatis("pompaOutMode", relay3pompaOut, true);
        KontrolRelayOtomatis("pompaInMode", relay2pompaIn, false);
        pompaTimer = millis();
        pompaState = 1;
      } 
      else if (pompaState == 1 && millis() - pompaTimer >= durasiPompa) {
        Serial.println("💧 Ganti ke mode isi air.");
        KontrolRelayOtomatis("pompaOutMode", relay3pompaOut, false);
        KontrolRelayOtomatis("pompaInMode", relay2pompaIn, true);
        pompaTimer = millis();
        pompaState = 2;
      } 
      else if (pompaState == 2 && millis() - pompaTimer >= durasiPompa) {
        Serial.println("✅ Proses penggantian air selesai.");
        KontrolRelayOtomatis("pompaInMode", relay2pompaIn, false);
        pompaState = 0;
      }
    }

  } else {
    // =============== MODE MANUAL ===============
    if (pompaModeControlAdvance) {
      // Jalankan siklus manual seperti otomatis, TANPA cek sensor
      if (pompaState == 0) {
        Serial.println("⚙️ Mode manual — mulai buang air.");
        KontrolRelayOtomatis("pompaOutMode", relay3pompaOut, true);
        KontrolRelayOtomatis("pompaInMode", relay2pompaIn, false);
        pompaTimer = millis();
        pompaState = 1;
      } 
      else if (pompaState == 1 && millis() - pompaTimer >= durasiPompa) {
        Serial.println("💧 Mode manual — ganti ke isi air.");
        KontrolRelayOtomatis("pompaOutMode", relay3pompaOut, false);
        KontrolRelayOtomatis("pompaInMode", relay2pompaIn, true);
        pompaTimer = millis();
        pompaState = 2;
      } 
      else if (pompaState == 2 && millis() - pompaTimer >= durasiPompa) {
        Serial.println("✅ Mode manual — proses selesai.");
        KontrolRelayOtomatis("pompaInMode", relay2pompaIn, false);
        pompaState = 0;

        // 🔄 Setelah selesai, set kembali ke false di Firebase
        if (Firebase.RTDB.setBool(&fbData, "/hydrosmart/controlAdvance/pompaMode", false)) {
          Serial.println("🔁 Reset manual pompa ke false di Firebase.");
        } else {
          Serial.println("❌ Gagal reset controlAdvance/pompaMode: " + fbData.errorReason());
        }
      }
    } else {
      // Jika mode manual tapi tombol belum ditekan
      if (pompaState != 0) {
        // Pastikan relay mati
        KontrolRelayOtomatis("pompaOutMode", relay3pompaOut, false);
        KontrolRelayOtomatis("pompaInMode", relay2pompaIn, false);
        pompaState = 0;
      }
    }
  }



}




