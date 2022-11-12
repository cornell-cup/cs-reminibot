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
from subprocess import call #to call calibration functions
from kivy.config import Config
import subprocess

Config.set('input', 'mouse', 'mouse,multitouch_on_demand')
running = []

class FirstWindow(Screen):
	pass

class InputWindow(Screen):
	showCalibrationChooser = BooleanProperty(False)
	showPositionChooser = BooleanProperty(False)
	showDirections = BooleanProperty(False)
	def handle_input(self, row, col, calibFile, posFile):
		try:
			row = int(row)
			col = int(col)
		except: 
			# TODO: display error msg
			raise Exception('Row or column input not accepted. ')
			

		if isinstance(row, int) and isinstance(col, int):
				if row > 2 and col > 2:
					# checkerboard.checkerboardTest(row, col)	
					#if calibFile or posFile is 0, then that means the default files should be used
					calibFile = calibFile[0] if len(calibFile) != 0 else "../calib/calibration.json"
					posFile = posFile[0] if len(posFile) != 0 else "../calib/calibration_board_positions.json"
					part1 = ["python3", "../part1_checkerboard.py", "-r", str(row),"-c", str(col),"-o",calibFile]
					part1_win = ["python3", "../part1_checkerboard.py", "-r", str(row),"-c", str(col),"-o",calibFile]
					part2 = ["python3", "../part2_tag_calib.py", "-cf", calibFile, "-pf", posFile, "-b", "4"]
					part2_win = ["python3", "../part2_tag_calib.py", "-cf", calibFile, "-pf", posFile, "-b", "4"]
					part3 = ["python3", "../part3_tag_locate.py", "-f", calibFile, "-s", "4", "-u", "http://localhost:8080/vision"]
					part3_win = ["python3", "../part3_tag_locate.py", "-f", calibFile, "-s", "4", "-u", "http://localhost:8080/vision"]

					try:
						call(part1_win)
						call(part2_win)
						call(part3_win)
					except:
						call(part1)
						call(part2)
						call(part3)
						

		else:
			# display error message
			pass


class DirectionsWindow(Screen):			
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
	for proc in running:
		proc.kill()

