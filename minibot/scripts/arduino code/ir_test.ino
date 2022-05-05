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

// IR
int IRPin = 7;

int send_data[6];

// Ultrasonic - J7

// Or use this line for a breakout or shield with an I2C connection:
Adafruit_PN532 nfc(PN532_IRQ, PN532_RESET);

// initialize the buffer
int bufSize = 4;
char buf[4];
volatile byte pos = 0;

boolean valid;

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
    pinMode(IRPin, INPUT);
}
int val;
int spdr_value;

// SPI ISR (Interrupt Service Routine)

boolean read_ir = false;
void check_buffer()
{
    if (buf[0] == 'T')
    {
        read_ir = true;
    }
    else
    {
        read_ir = false;
    }
}

ISR(SPI_STC_vect)
{
    Serial.println("SPDR " + String(SPDR));

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

    //    if (c == 'T') {
    //        read_IR();
    //        SPDR = val;
    //    }
    check_buffer();

    if (read_ir == true)
    {
        read_IR();
    }
}

void read_IR()
{
    val = digitalRead(IRPin);
    SPDR = val;
}

void loop()
{
    delay(100);

    // clear the buffer when a command is executed
    if (valid)
    {
        pos = 0;
        valid = false;
    }
}