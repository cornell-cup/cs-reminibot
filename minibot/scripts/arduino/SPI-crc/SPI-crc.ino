#include "CRC.h"

int arr[] = {1, 1, 2, 3, 5};

void setup() {
  // put your setup code here, to run once:
  Serial.begin(9600);
}

void loop() {
  // put your main code here, to run repeatedly:
  int x = encode(arr, sizeof(arr)/sizeof(arr[0]));
  String disp = String(x, HEX);
  Serial.println(disp);
}

bool validateMessage() {
   return false;
}
