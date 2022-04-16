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

'''
TODO Create a Layout for the File Chooser
- The layout should begin hidden, however it will be displayed after a button is pressed
- Once the user has selected a file, there will be another button on the layout to exit out and make
  the layout hidden
- Then, use the user's input (whichever file was selected) in calibration function

'''

class FirstWindow(Screen):
	pass

class InputWindow(Screen):
	isShowChooser = BooleanProperty(False)
	def handle_input(self, row, col):
		try:
			row = int(row)
			col = int(col)
		except: 
			# display error msg
			pass

		if isinstance(row, int) and isinstance(col, int):
				if row > 2 and col > 2:
					checkerboard.checkerboardTest(row, col)
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
