/* Full ESP32 sketch
   - Realtime updates: /hydrosmart/sensor/{namaSensor}
   - Hourly history:   /hydrosmart/history/{yyyy-mm-dd HH}/{namaSensor}
   - NTP (GMT+7) for timestamp
   - Relay control (manual/auto) and update /hydrosmart/controlAdvance/{nama}
*/

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

// ====== PIN RELAY ======
#define relay1lampu 33
#define relay2pompaIn 25
#define relay3pompaOut 26
#define relay4siram 27

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
  pinMode(relay4siram, OUTPUT);

  digitalWrite(relay1lampu, HIGH);
  digitalWrite(relay2pompaIn, HIGH);
  digitalWrite(relay3pompaOut, HIGH);
  digitalWrite(relay4siram, HIGH);
  Serial.println("✅ Relay siap!");
}

// ----------------- Loop -----------------
void loop() {
  // update NTP regularly
  timeClient.update();

  if (millis() - lastReadTime >= readInterval) {
    // baca sensor
    suhuUdara = dhtRead();
    kelembabanUdara = dhtReadHumidity();
    cahaya = bh1750Read();
    suhuAirValue = ds18b20Read();
    ppm = tdsRead();
    phair = phRead();

    Serial.printf("🌡 SuhuUdara: %.2f °C | 💧 Kelembapan: %.2f %% | 💡 Cahaya: %.2f Lux | 🌊 SuhuAir: %.2f °C | ppm: %.2f | pH: %.2f\n",
                  suhuUdara, kelembabanUdara, cahaya, suhuAirValue, ppm, phair);

    // kirim realtime ke /hydrosmart/sensor/...
    if (Firebase.ready()) {
      sensorToFirebaseRealtime("suhuudara", suhuUdara);
      sensorToFirebaseRealtime("kelembabanudara", kelembabanUdara);
      sensorToFirebaseRealtime("cahaya", cahaya);
      sensorToFirebaseRealtime("suhuair", suhuAirValue);
      sensorToFirebaseRealtime("ppm", ppm);
      sensorToFirebaseRealtime("phair", phair);

      // Simpan history per jam: hanya sekali saat jam berganti
      String curHour = getTimestampHour(); // "yyyy-mm-dd HH"
      if (curHour != lastSavedHour) {
        // simpan snapshot pada folder /hydrosmart/history/{yyyy-mm-dd HH}/...
        saveHistorySnapshot(curHour);
        lastSavedHour = curHour;
        Serial.println("✅ History hourly saved for: " + curHour);
      }
    } else {
      Serial.println("❌ Firebase belum siap, cek koneksi!");
    }

    // kontrol relay (nama yang dipakai konsisten dengan firebase: e.g. "lampuMode")
    kontrolRelay("lampuMode", relay1lampu);
    kontrolRelay("pompaInMode", relay2pompaIn);
    kontrolRelay("pompaOutMode", relay3pompaOut);
    kontrolRelay("siramMode", relay4siram);

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

float phRead() {
  // dummy pH sementara 5.5 - 7.5
  float ph = random(55, 75) / 10.0;
  return ph;
}

// ----------------- FIREBASE: realtime & history -----------------
void sensorToFirebaseRealtime(const String &node, float value) {
  
  String path = "/hydrosmart/sensor/" + node;
  if (Firebase.RTDB.setDouble(&fbData, path.c_str(), value)) {
    // berhasil
    //Serial.println("RT " + node + " -> " + String(value));
  } else {
    Serial.println("❌ RT gagal " + node + ": " + fbData.errorReason());
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

// ----------------- RELAY CONTROL & update status -----------------
void updateStatusFirebase(const String &nama, bool state) {
  String path = "/hydrosmart/controlAdvance/" + nama;
  if (!Firebase.RTDB.setBool(&fbData, path.c_str(), state)) {
    Serial.println("❌ Gagal update status " + nama + ": " + fbData.errorReason());
  }
}

void kontrolRelay(const String &nama, int pin) {
  bool modeAuto = false;
  bool stateManual = false;

  // Baca mode (path sesuai skema: /hydrosmart/control/{nama})
  String modePath = "/hydrosmart/control/" + nama;
  if (!Firebase.RTDB.getBool(&fbData, modePath.c_str())) {
    // bisa gagal baca (misal tidak ada) -> keluar
    //Serial.println("⚠ Gagal baca mode " + nama + ": " + fbData.errorReason());
    return;
  }
  modeAuto = fbData.boolData();

  // manual
  if (!modeAuto) {
    String advPath = "/hydrosmart/controlAdvance/" + nama;
    if (!Firebase.RTDB.getBool(&fbData, advPath.c_str())) {
      //Serial.println("⚠ Gagal baca controlAdvance " + nama + ": " + fbData.errorReason());
      return;
    }
    stateManual = fbData.boolData();

    if (stateManual) {
      digitalWrite(pin, LOW);  // aktif = LOW
      updateStatusFirebase(nama, true);
    } else {
      digitalWrite(pin, HIGH);
      updateStatusFirebase(nama, false);
    }
  } 
  // otomatis
  else {
    bool stateAuto = false;

    if (nama == "pompaOutMode") { // kipas
      if (suhuUdara >= 35.0) { digitalWrite(pin, LOW); stateAuto = true; }
      else { digitalWrite(pin, HIGH); stateAuto = false; }
    }
    else if (nama == "lampuMode") {
      if (cahaya <= 100.0) { digitalWrite(pin, LOW); stateAuto = true; }
      else { digitalWrite(pin, HIGH); stateAuto = false; }
    }
    else if (nama == "pompaInMode") {
      // sesuai tabel: ON kalau kondisi tidak ideal
      if (suhuAirValue >= 31 || ppm < 200 || ppm > 2000 || phair < 5.5 || phair > 7.5) {
        digitalWrite(pin, LOW); stateAuto = true;
      } else {
        digitalWrite(pin, HIGH); stateAuto = false;
      }
    }
    else if (nama == "siramMode") {
      // belum ada logika otomatis untuk siram -> default mati
      digitalWrite(pin, HIGH); stateAuto = false;
    }

    // update status di firebase agar UI tahu kondisi actual
    updateStatusFirebase(nama, stateAuto);
  }
}
