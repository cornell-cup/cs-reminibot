import binascii
import spidev
import time

spi = spidev.SpiDev()

#set which arduino to talk to. slave(0) for arduino 1 and slave(1) for arduino 2
def setSlave(PiBus):
  device = 0
  bus = PiBus
  spi.open(device,bus)
  spi.mode = 0
  spi.max_speed_hz = 115200

def transmit(message):  
  try:
   # while True:
     print (message)
     tx = spi.writebytes([message])
   #  time.sleep(10)
   #   rx = spi.readbytes(2)
   #   print('Read: 0x(0)'.format(binascii.hexlify(bytearray(rx))))
  finally:
    spi.close()


def fwd(power):
  setSlave(1)
  cmd = ord('F')
  #print b
  print(cmd)
  transmit(cmd)
  #cmd = ord(param) -- do some math on the param to separate different speeds. 
  #Maybe >100 one speed <100 another set speed
  
def back(power):
  setSlave(1)
  cmd = ord('B')
  #print b
  print(cmd)
  transmit(cmd)          

def left(power):
  setSlave(1)
  cmd = ord('L')
  #print b
  print(cmd)
  transmit(cmd) 
          
def right(power):
  setSlave(1)
  cmd = ord('R')
  #print b
  print(cmd)
  transmit(cmd)     

def stop():
  setSlave(1)
  cmd = ord('S')
  #print b
  print(cmd)
  transmit(cmd)       

def LineFollow():
  setSlave(1)
  cmd = ord('T') #for tape follow
  #print b
  print(cmd)
  transmit(cmd)

def ObjectDetection():
  setSlave(0)
  cmd = ord('O') 
  #print b
  print(cmd)
  transmit(cmd)            
                  
