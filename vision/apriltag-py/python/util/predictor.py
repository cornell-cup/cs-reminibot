import numpy as np

class Predictor:
  '''
  The Predictors class takes in a model as a parameter (i.e. LinearRegression), and it is used to more easily
  make predictions with the model
  '''
  def __init__(self, model=None):
    self.model = model
  def predict(self, point): 
    return self.predict_offset_given_model(self.model, point)
  def predict_offset_given_model(self, model, point):
    if model != None:
      return model.predict(np.array([point]))[0]  
    else:
      raise ValueError("Cannot use a model of None")

