#define ACK 6
#define NACK 21
#define EOT 4
#define ENQ 5
#define START_SEQ_SIZE 2
#define END_SEQ_SIZE 2

#include <SPI.h>
#include "CRC.h"

volatile byte result;
const int limit = 11;
volatile char buf[limit];

volatile byte idx;
volatile boolean process;
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
  SPI.attachInterrupt();
  delay(1000);
  Serial.println("Ready");
}

ISR (SPI_STC_vect) { 
  // interrupt doesn't fire sometimes...
  if (idx == limit) {
    SPDR = (byte)result;
  } else {
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
    if (checkBuffer()) {
      result = ACK;
      useBuffer();
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
  // this just prints, but can be used to see the data inside
  for (int i = START_SEQ_SIZE + 2; i < limit - END_SEQ_SIZE; i++) {
    Serial.print(buf[i]);
  }
  Serial.print("\n");
}
