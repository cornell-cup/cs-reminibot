#include <SPI.h>
#include <Servo.h>

// initialize the buffer
int bufSize = 4;
char buf[4];

int IRreciever = 9;

void setup() {
    Serial.begin(115200);
    SPCR |= bit(SPE);  // turn on SPI in slave mode

    // set up pin
    pinMode(IRreciever, INPUT);
}
void loop() {
    // put your main code here, to run repeatedly;
    delay(1000);

    int statusSensor = digitalRead(IRreciever);

    if (statusSensor == 1) {
        SPDR = cm;
        Serial.println("0");
    }
    if (statusSensor == 0) {
        SPDR = cm;
        Serial.println("1");
    }
}
