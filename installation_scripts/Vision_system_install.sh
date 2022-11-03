cd ../vision/apriltag-py/python
conda env remove -n opencv_py37 -y;
echo Removed; 
conda create --name opencv_py37 python=3.7 --file opencv_py37_conda-forge.txt -c conda-forge -y;
echo Created; 
conda activate opencv_py37;
echo Activated; 
pip install https://github.com/ai4ce/pyAprilTag/releases/download/0.0.6/pyAprilTag-0.0.6-cp37-cp37m-win_amd64.whl;
echo Installed; 
echo "Attempting to install Vision dependencies."
pip install -r requirements.txt
echo "Attempting to install Vision dependencies individually."
pip install numpy
pip install opencv-contrib-python
pip install opencv-python
pip install scikit-learn
pip install requests
pip install kivy
echo DONE
sleep 10