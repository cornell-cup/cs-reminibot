import kivy
from kivy.app import App
from kivy.uix.widget import Widget
from kivy.properties import ObjectProperty
from kivy.lang import Builder
from kivy.core.window import Window
from kivy.uix.screenmanager import ScreenManager, Screen, TransitionBase
from kivy.uix.textinput import TextInput
from kivy.uix.popup import Popup
import part1_checkerboard as checkerboard #importing the calibration function


class FirstWindow(Screen):
	pass

class InputWindow(Screen):
	pass

class WindowManager(ScreenManager):
	pass

kv = Builder.load_file('boxlayout.kv')
#everytime in kivy, want to import something!



class CalibrationApp(App):
	def build(self):
		Window.clearcolor = (153/255, 158/255, 154/255, 1)
		return kv
		


if __name__ == '__main__':
	CalibrationApp().run()