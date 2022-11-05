#define ACK 6
#define NACK 21
#define EOT 4
#define ENQ 5
#define START_SEQ_SIZE 2
#define END_SEQ_SIZE 2
​
#include <SPI.h>
#include "CRC.h"
#include <Wire.h>
#include <SPI.h>
#include <Adafruit_PN532.h>
​
// If using the breakout or shield with I2C, define just the pins connected
// to the IRQ and reset lines.  Use the values below (2, 3) for the shield!
#define PN532_IRQ (A3)
#define PN532_RESET (9) // Not connected by default on the NFC Shield
​
    // Or use this line for a breakout or shield with an I2C connection:
    Adafruit_PN532 nfc(PN532_IRQ, PN532_RESET);
​ volatile byte result;
const int limit = 22;
const int dataLimit = 22;
volatile char buf[limit];
volatile char dataBuf[dataLimit];
volatile int dataIdx = 0;
​ volatile byte idx;
volatile boolean process;
volatile boolean spiRead;
volatile byte updated;
volatile byte c;
int interruptPin = 10;
​ volatile int lightValue = 0;
​ void setup()
{
  Serial.begin(9600);
  Serial.println("Hello!");
  ​ nfc.begin();
  ​ uint32_t versiondata = nfc.getFirmwareVersion();
  if (!versiondata)
  {
    Serial.print("Didn't find PN53x board");
    while (1)
      ; // halt
  }
  ​
      // Got ok data, print it out!
      Serial.print("Found chip PN5");
  Serial.println((versiondata >> 24) & 0xFF, HEX);
  Serial.print("Firmware ver. ");
  Serial.print((versiondata >> 16) & 0xFF, DEC);
  Serial.print('.');
  Serial.println((versiondata >> 8) & 0xFF, DEC);
  ​
      // Set the max number of retry attempts to read from a card
      // This prevents us from waiting forever for a card, which is
      // the default behaviour of the PN532.
      nfc.setPassiveActivationRetries(0xFF);
  ​
      // configure board to read RFID tags
      nfc.SAMConfig();
  ​ Serial.println("Waiting for an ISO14443A card");
  ​
      // put your setup code here, to run once:
      pinMode(MISO, OUTPUT);
  SPCR |= bit(SPE); // slave ctrl register
  idx = 0;
  process = false;
  SPI.attachInterrupt();
  delay(1000);
  Serial.println("Ready");
}
​ ISR(SPI_STC_vect)
{
  if (spiRead)
  {
    // Send bytes from data buffer
    if (dataIdx == dataLimit)
    {
      spiRead = false;
      dataIdx = 0;
    }
    else
    {
      // Serial.print(dataIdx);
      SPDR = dataBuf[dataIdx];
      dataIdx++;
    }
  }
  else if (idx == limit)
  {
    SPDR = (byte)result;
  }
  else
  {
    // Normal message buf
    c = SPDR;
    buf[idx] = c;
    idx++;
    if (idx == limit)
    {
      process = true;
      if (checkBuffer())
      {
        SPDR = ACK;
      }
    }
  }
}
​ boolean success;
uint8_t uid[] = {0, 0, 0, 0}; // Buffer to store the returned UID
uint8_t uidLength;            // Length of the UID (4 or 7 bytes depending on ISO14443A card type)
​ void loop()
{
  // Check messages
  if (process)
  {
    if (checkBuffer() && !spiRead)
    {
      useBuffer();
      result = ACK;
    }
    else
    {
      result = NACK;
    }
    idx = 0;
    process = false;
  }
  ​ uid[0] = 0;
  uid[1] = 0;
  uid[2] = 0;
  uid[3] = 0;

  // Wait for an ISO14443A type cards (Mifare, etc.).  When one is found
  // 'uid' will be populated with the UID, and uidLength will indicate
  // if the uid is 4 bytes (Mifare Classic) or 7 bytes (Mifare Ultralight)
  ​ success = nfc.readPassiveTargetID(PN532_MIFARE_ISO14443A, &uid[0], &uidLength);
  if (success)
  {
    Serial.println("Found a card!");
    Serial.print("UID Length: ");
    Serial.print(uidLength, DEC);
    Serial.println(" bytes");
    Serial.print("UID Value: ");
    for (uint8_t i = 0; i < uidLength; i++)
    {
      Serial.print(" 0x");
      Serial.print(uid[i], HEX);
    }
    Serial.println("");
    // Wait 1 second before continuing
    delay(1000);
  }
  else
  {
    // PN532 probably timed out waiting for a card
    Serial.println("Timed out waiting for a card");
  }
}
​ bool checkBuffer()
{
  return validate_msg(buf, limit);
}
​ void useBuffer()
{
  // print the message you just got, but can decrease reliability
  //  Serial.print("Received message: ");
  //  for (int i = START_SEQ_SIZE + 2; i < limit - END_SEQ_SIZE; i++) {
  //    Serial.print(buf[i]);
  //  }
  //  Serial.print("\n");
  ​
      // Respond to message
      if (buf[4] == 'R' && buf[5] == 'F' && buf[6] == 'I' && buf[7] == 'D')
  {
    // LOAD = Next SPI transfers will data
    ​
        // Add start and end chars
        dataBuf[0] = 'C';
    dataBuf[1] = 'C';
    dataBuf[20] = 'R';
    dataBuf[21] = 'T';
    ​ if (buf[8] == 4)
    {
      // RFID
      dataBuf[4] = uid[0];
      dataBuf[5] = uid[1];
      dataBuf[6] = uid[2];
      dataBuf[7] = uid[3];
      ​
      // // light sensor
      // lightValue = analogRead(A0);
      // dataBuf[4] = (lightValue >> 24) & 0xFF;
      // dataBuf[5] = (lightValue >> 16) & 0xFF;
      // dataBuf[6] = (lightValue >> 8) & 0xFF;
      // dataBuf[7] = lightValue & 0xFF;
      // Serial.print("Light value is: ");
      // Serial.println(lightValue);
    }
    ​
        // Add checksum
        int hash = encode(dataBuf + 4, 22 - 6);
    dataBuf[3] = (byte)(hash & 0xFF);
    dataBuf[2] = (byte)((hash >> 8) & 0xFF);
    ​ spiRead = true;
    SPDR = dataBuf[0];
    dataIdx = 1;
  }
}