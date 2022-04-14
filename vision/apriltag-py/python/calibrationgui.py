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
	pass

class ProgressWindow(Screen):
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


'''
BoxLayout:
			id: fclayout
			pos_hint: {'center_x': 0.5, 'center_y': 0.5}
			size_hint_y: 0.1
			size_hint_x: 0.1
			#to draw an outline around the layout
			canvas:
				#draws the first rectangle (the one with the color that will outline the layout)
				Color:
					rgba: 1,0,0,1
				RoundedRectangle:
					pos: self.pos
					size: self.size
				#draws the second rectangle (the one where other widgets will be placed over)
				Color:
					rgba: 0.5,0.5,0.5,1
				RoundedRectangle:
					pos: self.x+5, self.y+5
					size: self.width-10, self.height-10
'''