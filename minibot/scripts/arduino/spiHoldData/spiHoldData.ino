#define ACK 6
#define NACK 21
#define EOT 4
#define ENQ 5
#define START_SEQ_SIZE 2
#define END_SEQ_SIZE 2

#include <SPI.h>

byte result;
const int limit = 7;
const int dataLimit = 16;
int endIdx = 0;
char buf[limit];
volatile char dataBuf[dataLimit];
volatile int dataIdx = 0;

volatile byte idx;
volatile boolean process;
volatile boolean spiRead;
volatile byte updated;
volatile byte c;
int interruptPin = 10;


void setup() {
  // put your setup code here, to run once:
  Serial.begin(115200);
  pinMode(MISO, OUTPUT);
  SPCR |= bit(SPE); // slave ctrl register
  idx = 0;
  process = false;
  delay(1000);
  SPI.attachInterrupt();
  Serial.println("Ready");
//  dataBuf[0] = 'C';
//  dataBuf[1] = 'C';
//  dataBuf[2] = 'O';
//  dataBuf[3] = 'K';
//  dataBuf[4] = 'R';
//  dataBuf[5] = 'T';
  for (int i = 0; i < 16; i++){
    dataBuf[i] = 65 + i; // 65 is ASCII for A
  }
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
  if (process) {
    if (checkBuffer() && !spiRead) {
      result = ACK;
      if (buf[2] == 'R' && buf[3] == 'E' && buf[4] == 'D') {
        // RED = Next SPI transfers will data
        Serial.println("Entering reading mode");
        spiRead = true;
        SPDR = dataBuf[0];
        dataIdx = 1;
      }
      
    } else {
      result = NACK;
    }
    idx = 0;
    process = false;
  }
}

bool checkBuffer(){
  return (buf[0] == 'C' && buf[1] == 'C' && buf[5] == 'R' && buf[6] == 'T');
}

void printlnBuf() {
  for (int i = START_SEQ_SIZE; i < limit - END_SEQ_SIZE; i++) {
        Serial.print(buf[i]);
      }
  Serial.print("\n");
}
