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
#define PN532_IRQ (2)   // pin 3 of the RJ12 17 (2)
#define PN532_RESET (3) // pin 4 of the RJ12 9  (3)

// Motors
int Rmotor = 12;
int RmotorPWM = 13;
int Lmotor = 8;
int LmotorPWM = 5;

int send_data[6];

// Or use this line for a breakout or shield with an I2C connection:
Adafruit_PN532 nfc(PN532_IRQ, PN532_RESET);

// initialize the buffer
int bufSize = 4;
char buf[4];
volatile byte pos = 0;
int valid;

void setup()
{
    Serial.begin(115200);
    pinMode(SCK, INPUT);
    pinMode(MISO, OUTPUT);
    pinMode(MOSI, INPUT);
    SPCR |= bit(SPE); // turn on SPI in slave mode

    // turn on the interrupt
    SPI.attachInterrupt();

    pos = 0;

    // motor setup
    pinMode(Rmotor, OUTPUT);
    pinMode(Lmotor, OUTPUT);
    // pinMode(RmotorPWM, OUTPUT);
    // pinMode(LmotorPWM, OUTPUT);
}

// SPI ISR (Interrupt Service Routine)
ISR(SPI_STC_vect)
{
    Serial.println("SPDR" + String(SPDR));

    byte c = SPDR; // get byte from the SPI data register

    // detect the beginning of the buffer, do not put it in the buffer
    if (c == '\n')
    {
        valid = true;
    }
    // detect the end character
    else if (c == '\r')
    {
        valid = false;
        pos = 0;
    }
    // put data into the buffer
    if ((valid == true) && (c != '\n') && (c != '\r'))
    {
        if (pos < bufSize)
        { /// sizeof buffer
            buf[pos] = c;
            pos++;
        }
    }
}

// boolean stop_motor = false;
boolean right = false;
boolean left = false;
boolean driveForward = false;

void check_buffer()
{
    Serial.println(buf[0]);
    if (buf[0] == 'S')
    {
        left = false;
        right = false;
        driveForward = false;
    }
    else if (buf[0] == 'L')
    {
        stop_motor = false;
        left = true;
        right = false;
        driveForward = false;
    }
    else if (buf[0] == 'R')
    {
        stop_motor = false;
        left = false;
        right = true;
        driveForward = false;
    }
    else if (buf[0] == 'F')
    {
        stop_motor = false;
        left = false;
        right = false;
        driveForward = true;
    }
}

void motor_control()
{
    check_buffer();
    while (stop_motor == true && left == false && right == false &&
           driveForward == false)
    {
        stopMotors();
    }

    // turn left
    while (stop_motor == false && left == true && right == false &&
           driveForward == false)
    {
        left();
        delay(200);
        drive_forward();
    }

    // turn righ
    while (stop_motor == false && left == false && right == true &&
           driveForward == false)
    {
        right();
        delay(200);
        drive_forward();
    }

    // go straight
    while (stop_motor == false && left == false && right == false &&
           driveForward == true)
    {
        drive_forward();
    }
}

void loop()
{
    delay(1000);
    // motor_control();
    digitalWrite(Rmotor, HIGH);
}

void left()
{
    digitalWrite(Rmotor, HIGH);
    digitalWrite(Lmotor, HIGH);
    analogWrite(RmotorPWM, 50);
    analogWrite(LmotorPWM, 90);
}

void right()
{
    digitalWrite(Rmotor, HIGH);
    digitalWrite(Lmotor, HIGH);
    analogWrite(RmotorPWM, 90);
    analogWrite(LmotorPWM, 50);
}

void drive_forward()
{
    digitalWrite(Rmotor, HIGH);
    digitalWrite(Lmotor, HIGH);
    analogWrite(RmotorPWM, 75);
    analogWrite(LmotorPWM, 75);
}

void stopMotors()
{
    digitalWrite(motorpin2, LOW); // stop
    digitalWrite(motorpin1, LOW);
}