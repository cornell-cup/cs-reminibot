# import bs
# Minibot imports.
import sys
sys.path.insert(0,'..')
from basestation.base_station import BaseStation
from basestation import app # need this???
from basestation.user_database import Program, User, Chatbot as ChatbotTable
from basestation import app

import pytest
import unittest 


base_station = BaseStation(app.debug)

class TestChatbotDBMethods(TestCase):

  def test_make_user(self):
    base_station.register('user', 'pass')

  def add_context_entry(self):
    base_station.update_chatbot_context_db(id, 'context')
    self.assertEqual() # get the entry


  # make a user
  # check that the entries are empty
  # commit 1 entry
  # try to get it, make sure it's correct
  # commit 2nd entry
  # check it
  # clear entry
  # check
  # 


if __name__ == '__main__':
    unittest.main()