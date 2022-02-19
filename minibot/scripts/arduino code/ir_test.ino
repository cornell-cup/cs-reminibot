#include <SPI.h>
#include <Servo.h>

// initialize the buffer
int bufSize = 4;
char buf[4];

int IRreciever = 6;

void setup() {
    Serial.begin(115200);
    SPCR |= bit(SPE);  // turn on SPI in slave mode

    // set up pin
    pinMode(IRreciever, INPUT);

    SPI.attachInterrupt();
}

// SPI interrupt routine
ISR(SPI_STC_vect) {
    byte c = SPDR;
    SPDR = c + 10;
}  // end of interrupt service routine (ISR) for SPI

void loop() {
    // put your main code here, to run repeatedly;
    delay(100);

    int statusSensor = digitalRead(IRreciever);
    SPDR = statusSensor;
    Serial.println(statusSensor);
}
