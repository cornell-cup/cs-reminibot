#define ACK 6
#define NACK 21
#define EOT 4
#define ENQ 5
#define START_SEQ_SIZE 2
#define END_SEQ_SIZE 2

#include <SPI.h>
#include "CRC.h"
#include <Wire.h>
#include <PN532_I2C.h>
#include <PN532.h>
#include <NfcAdapter.h>
PN532_I2C pn532_i2c(Wire);
NfcAdapter nfc = NfcAdapter(pn532_i2c);

volatile byte result;
const int limit = 22;
const int dataLimit = 22;
volatile char buf[limit];
volatile char dataBuf[dataLimit];
volatile int dataIdx = 0;
volatile byte idx;
volatile boolean process;
volatile boolean spiRead;
volatile byte updated;
volatile byte c;
int interruptPin = 10;
volatile int lightValue = 0;

byte nuidPICC[4];

void setup()
{
  Serial.begin(115200);
  Serial.println("Hello!");
  nfc.begin();
  Serial.println("NFC Begin");

  // put your setup code here, to run once:
  pinMode(MISO, OUTPUT);
  pinMode(MOSI, INPUT);
  pinMode(SCK, INPUT);
  pinMode(SS, INPUT);

  SPCR |= bit(SPE); // slave ctrl register
  idx = 0;
  process = false;
  SPI.attachInterrupt();
  delay(1000);
  Serial.println("Ready");
}
ISR(SPI_STC_vect)
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

void loop()
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
}

bool checkBuffer()
{
  return validate_msg(buf, limit);
}

void useBuffer()
{
  // print the message you just got, but can decrease reliability
  Serial.print("Received message: ");
  for (int i = START_SEQ_SIZE + 2; i < limit - END_SEQ_SIZE; i++)
  {
    Serial.print(buf[i]);
  }
  Serial.print("\n");

  // Respond to message
  if (buf[4] == 'R' && buf[5] == 'F' && buf[6] == 'I' && buf[7] == 'D')
  {
    // Add start and end chars
    dataBuf[0] = 'C';
    dataBuf[1] = 'C';
    dataBuf[20] = 'R';
    dataBuf[21] = 'T';

    // RFID
    dataBuf[4] = nuidPICC[0];
    dataBuf[5] = nuidPICC[1];
    dataBuf[6] = nuidPICC[2];
    dataBuf[7] = nuidPICC[3];

    int hash = encode(dataBuf + 4, 22 - 6);
    dataBuf[3] = (byte)(hash & 0xFF);
    dataBuf[2] = (byte)((hash >> 8) & 0xFF);
    spiRead = true;
    SPDR = dataBuf[0];
    dataIdx = 1;
    readNFC();
  }
  else if (buf[4] == 'T' && buf[5] == 'E' && buf[6] == 'S' && buf[7] == 'T')
  {
    dataBuf[0] = 'C';
    dataBuf[1] = 'C';
    dataBuf[20] = 'R';
    dataBuf[21] = 'T';

    // RFID
    dataBuf[4] = 'T';
    dataBuf[5] = 'E';
    dataBuf[6] = 'X';
    dataBuf[7] = 'T';

    int hash = encode(dataBuf + 4, 22 - 6);
    dataBuf[3] = (byte)(hash & 0xFF);
    dataBuf[2] = (byte)((hash >> 8) & 0xFF);
    spiRead = true;
    SPDR = dataBuf[0];
    dataIdx = 1;
  }
}
void readNFC()
{
  if (nfc.tagPresent(100))
  {
    NfcTag tag = nfc.read();
    tag.print();
    tag.getUid(nuidPICC, 4);
  }
  else
  {
    Serial.println("Didn't find anything");
    nuidPICC[0] = 100;
    nuidPICC[1] = 100;
    nuidPICC[2] = 100;
    nuidPICC[3] = 100;
  }
}