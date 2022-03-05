// Bottom Arduino Motors, US sensor, reflectance, IR
// Top Arduino Speaker, RFID
#include <Adafruit_PN532.h>
#include <QTRSensors.h>
#include <SPI.h>
#include <Wire.h>
QTRSensors qtr;

// Bi-directinal SPI
// 13 SCK  (serial clock)
// 12 MISO (master in slave out)
// 11 MOSI (master out slave in)
// 10 SS (slave select)

// If using the breakout or shield with I2C, define just the pins connected
// to the IRQ and reset lines.  Use the values below (2, 3) for the shield!
// RFID module
#define PN532_IRQ (2)    // pin 3 of the RJ12 17 (2)
#define PN532_RESET (3)  // pin 4 of the RJ12 9  (3)

// Reflectance sensor
const uint8_t SensorCount = 4;  // use four sensors
uint16_t sensorValues[SensorCount];

// Motors
int Rmotor = 12;
int RmotorPWM = 13;
int Lmotor = 8;
int LmotorPWM = 5;

// IR
int IRPin = 4;

int send_data[6];

// Or use this line for a breakout or shield with an I2C connection:
Adafruit_PN532 nfc(PN532_IRQ, PN532_RESET);

// initialize the buffer
int bufSize = 4;
char buf[4];
volatile byte pos = 0;
int valid;

void setup() {
    Serial.begin(115200);
    pinMode(MISO, OUTPUT);
    SPCR |= bit(SPE);  // turn on SPI in slave mode
    //  pinMode(trigPin, OUTPUT);
    //  pinMode(echoPin, INPUT);
    //    pinMode(LED, OUTPUT);
    // turn on the interrupt
    SPI.attachInterrupt();

    pos = 0;
    for (int i = 2; i < 6; i++) {
        pinMode(i, INPUT);
    }
    for (int i = 10; i < 18; i++) {
        pinMode(i, OUTPUT);
    }
    // configure the sensors
    qtr.setTypeRC();
    qtr.setSensorPins((const uint8_t[]){3, 4, 5, 6}, SensorCount);
    // qtr.setEmitterPin(2);

    delay(500);
    Serial.println("Begin calibrations");
    pinMode(LED_BUILTIN, OUTPUT);
    digitalWrite(
        LED_BUILTIN,
        HIGH);  // turn on Arduino's LED to indicate we are in calibration mode
    // 2.5 ms RC read timeout (default) * 10 reads per calibrate() call
    // = ~25 ms per calibrate() call.
    // Call calibrate() 400 times to make calibration take about 10 seconds.
    for (uint16_t i = 0; i < 400; i++) {
        qtr.calibrate();
    }
    digitalWrite(LED_BUILTIN, LOW);  // turn off Arduino's LED to indicate we
                                     // are through with calibration

    // print the calibration minimum values measured when emitters were on
    // Serial.begin(9600);
    for (uint8_t i = 0; i < SensorCount; i++) {
        Serial.print(qtr.calibrationOn.minimum[i]);
        Serial.print(' ');
    }
    Serial.println();

    // print the calibration maximum values measured when emitters were on
    for (uint8_t i = 0; i < SensorCount; i++) {
        Serial.print(qtr.calibrationOn.maximum[i]);
        Serial.print(' ');
    }
    Serial.println();
    Serial.println();
    delay(1000);

    pinMode(Rmotor, OUTPUT);
    pinMode(Lmotor, OUTPUT);
    pinMode(RmotorPWM, OUTPUT);
    pinMode(LmotorPWM, OUTPUT);
}

// SPI ISR (Interrupt Service Routine)

ISR(SPI_STC_vect) {
    byte c = SPDR;  // get byte from the SPI data register
    // detect the beginning of the buffer, do not put it in the buffer
    if (c == '\n') {
        valid = true;
    }
    // detect the end character
    else if (c == '\r') {
        valid = false;
        //    buf[0] = 0;
        //    buf[1] = 0;
        pos = 0;
        //  process_it = true;
    }
    // put data into the buffer
    if ((valid == true) && (c != '\n') && (c != '\r')) {
        if (pos < bufSize) {  /// sizeof buffer
            buf[pos] = c;
            pos++;
        }
    }
}

void read_IR() {
    int val = digitalRead(IRPin);
    SPDR = val;
    Serial.println(val);
}

// boolean stop_motor = false;
// boolean right = false;
// boolean left = false;
// boolean driveForward = false;

void check_buffer() {
    Serial.println(buf[0]);

    //        stop_motor = true;
    //        left = false;
    //        right = false;
    //        driveForward = false;
    //    } else if (buf[0] == 'l') {
    //        stop_motor = false;
    //        left = true;
    //        right = false;
    //        driveForward = false;
    //    } else if (buf[0] == 'r') {
    //        stop_motor = false;
    //        left = false;
    //        right = true;
    //        driveForward = false;
    //    } else if (buf[0] == 'f') {
    //        stop_motor = false;
    //        left = false;
    //        right = false;
    //        driveForward = true;
    //    }
}

void motor_control() {
    //    check_buffer();
    //    while (stop_motor == true && left == false && right == false &&
    //           driveForward == false) {
    //        stopMotors();
    //    }
    //
    //    // turn left
    //    while (stop_motor == false && left == true && right == false &&
    //           driveForward == false) {
    //        left();
    //        delay(200);
    //        drive_forward();
    //    }
    //
    //    // turn righ
    //    while (stop_motor == false && left == false && right == true &&
    //           driveForward == false) {
    //        right();
    //        delay(200);
    //        drive_forward();
    //    }
    //
    //    // go straight
    //    while (stop_motor == false && left == false && right == false &&
    //           driveForward == true) {
    //        drive_forward();
    //    }
}

void loop() {
    // read calibrated sensor values and obtain a measure of the line position
    // from 0 to 5000 (for a white line, use readLineWhite() instead)
    // uint16_t position = qtr.readLineBlack(sensorValues);

    // print the sensor values as numbers from 0 to 1000, where 0 means maximum
    // reflectance and 1000 means minimum reflectance, followed by the line
    // position
    // for (uint8_t i = 0; i < SensorCount; i++) {
    //     Serial.print(sensorValues[i]);
    //     Serial.print('\t');
    // }
    // Serial.println(position);
    // // use sensor values to determine where line is and move accordingly
    // if ((sensorValues[1] > 500) || (sensorValues[2] > 500)) {
    //     stopMotors();
    // } else {
    //     motor_control();
    // }

    delay(1000);
    // read_IR();
    check_buffer();

    // clear the buffer when a command is executed

    //    if (!valid) {
    //        pos = 0;
    //        valid = false;
    //    }
}

void left() {
    digitalWrite(Rmotor, HIGH);
    digitalWrite(Lmotor, HIGH);
    analogWrite(RmotorPWM, 50);
    analogWrite(LmotorPWM, 90);
}

void right() {
    digitalWrite(Rmotor, HIGH);
    digitalWrite(Lmotor, HIGH);
    analogWrite(RmotorPWM, 90);
    analogWrite(LmotorPWM, 50);
}

void drive_forward() {
    digitalWrite(Rmotor, HIGH);
    digitalWrite(Lmotor, HIGH);
    analogWrite(RmotorPWM, 75);
    analogWrite(LmotorPWM, 75);
}

void stopMotors() {
    //    digitalWrite(motorpin2, LOW);  // stop
    //    digitalWrite(motorpin1, LOW);
}