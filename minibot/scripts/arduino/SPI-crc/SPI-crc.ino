#define ACK 6
#define NACK 21
#define EOT 4
#define ENQ 5
#define START_SEQ_SIZE 2
#define END_SEQ_SIZE 2

#include <SPI.h>
#include "CRC.h"

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

void setup() {
  // put your setup code here, to run once:
  Serial.begin(115200);
  pinMode(MISO, OUTPUT);
  SPCR |= bit(SPE); // slave ctrl register
  idx = 0;
  process = false;
  SPI.attachInterrupt();
  delay(1000);
  Serial.println("Ready");
}

ISR (SPI_STC_vect) {
  if (spiRead) {
    // Send bytes from data buffer
    if (dataIdx == dataLimit) {
      spiRead = false;
      dataIdx = 0;
    } else {
      // Serial.print(dataIdx);
      SPDR = dataBuf[dataIdx];
      dataIdx++;
    }
  } else if (idx == limit) {
    SPDR = (byte)result;
  } else {
    // Normal message buf
    c = SPDR;
    buf[idx] = c;
    idx++;
    if (idx == limit) {
      process = true;
      if (checkBuffer()) {
        SPDR = ACK;
      }
    }
  }
}

void loop() {
  // Check messages
  if (process) {
    if (checkBuffer() && !spiRead) {
      useBuffer();
      result = ACK;
    } else {
      result = NACK;
    }
    idx = 0;
    process = false;
  }
}

bool checkBuffer(){
  return validate_msg(buf, limit);
}

void useBuffer() {
  // print the message you just got, but can decrease reliability
//  Serial.print("Received message: ");
//  for (int i = START_SEQ_SIZE + 2; i < limit - END_SEQ_SIZE; i++) {
//    Serial.print(buf[i]);
//  }
//  Serial.print("\n");

  // Respond to message
  if (buf[4]=='L' && buf[5]=='O' && buf[6]=='A' && buf[7]=='D') {
        // LOAD = Next SPI transfers will data

        // Add start and end chars
        dataBuf[0] = 'C'; dataBuf[1] = 'C';
        dataBuf[20] = 'R'; dataBuf[21] = 'T';


        if (buf[8] == 4) {
          // light sensor
          lightValue = analogRead(A0);
          dataBuf[4] = (lightValue >> 24) & 0xFF;
          dataBuf[5] = (lightValue >> 16) & 0xFF;
          dataBuf[6] = (lightValue  >> 8)  & 0xFF;
          dataBuf[7] = lightValue & 0xFF;
          Serial.print("Light value is: ");
          Serial.println(lightValue);
        }
        
        
        // Add checksum
        int hash = encode(dataBuf+4, 22-6);
        dataBuf[3] = (byte)(hash & 0xFF);
        dataBuf[2] = (byte)((hash>>8) & 0xFF);

        
        
        spiRead = true;
        SPDR = dataBuf[0];
        dataIdx = 1;
  }
}
