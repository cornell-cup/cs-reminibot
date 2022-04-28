import kivy
from kivy.app import App
from kivy.uix.widget import Widget
from kivy.properties import ObjectProperty
from kivy.lang import Builder
from kivy.core.window import Window
from kivy.uix.screenmanager import ScreenManager, Screen, TransitionBase
from kivy.uix.textinput import TextInput
from kivy.uix.popup import Popup
from kivy.properties import BooleanProperty
import part1_checkerboard as checkerboard #importing the calibration function
from subprocess import call #to call calibration functions
from kivy.config import Config
Config.set('input', 'mouse', 'mouse,multitouch_on_demand')

class FirstWindow(Screen):
	pass

class InputWindow(Screen):
	showCalibrationChooser = BooleanProperty(False)
	showPositionChooser = BooleanProperty(False)
	def handle_input(self, row, col, calibFile, posFile):
		try:
			row = int(row)
			col = int(col)
		except: 
			# display error msg
			pass

		if isinstance(row, int) and isinstance(col, int):
				if row > 2 and col > 2:
					# checkerboard.checkerboardTest(row, col)
					#if calibFile or posFile is 0, then that means the default files should be used
					calibFile = calibFile[0] if len(calibFile) != 0 else "calibration.json"
					posFile = posFile[0] if len(posFile) != 0 else "calibration_board_positions.json"
					#

					call(f"python3 part2_tag_calib.py -cf {calibFile} -pf {posFile} -b 3.93701; python3 part3_tag_locate.py -f {calibFile} -s 3.93701 -u http://localhost:8080/vision", shell=True)
		else:
			# display error message
			pass


class ProgressWindow(Screen):			
	pass

class WindowManager(ScreenManager):
	pass

kv = Builder.load_file('boxlayout.kv')
#everytime in kivy, want to import something!



class CalibrationApp(App):
	def build(self):
		#33, 37, 41
		Window.clearcolor = (23/255, 37/255, 41/255, 1)
		return kv
		


if __name__ == '__main__':
	CalibrationApp().run()
