cd ../..

:: general dependencies installation
echo "Installing general dependencies."
timeout /t 5 /nobreak > NUL

winget install -e --id Git.Git
winget install -e --id Python.Python.3
winget install -e --id OpenJS.NodeJS
npm install npm@latest -g
winget install -e --id Anaconda.Anaconda3
winget install -e --id Kitware.CMake

:: basestation dependecnies installation
echo "Installing basestation dependencies."
timeout /t 5 /nobreak > NUL
cd cs-reminibot/basestation

:: Attempting normal basestation dependencies installation.
echo "Attempting normal basestation dependencies installation."
timeout /t 5 /nobreak > NUL
pip install -r requirements.txt

:: Attempting manual basestation dependencies installation with correct versions.
echo "Attempting manual basestation dependencies installation with correct versions."
timeout /t 5 /nobreak > NUL
pip install bcrypt==3.1.7   
pip install cffi==1.14.5
pip install click==6.7        
pip install Flask==1.1.1     
pip install Flask-API==2.0
pip install Flask-SQLAlchemy==2.4.1    
pip install itsdangerous==0.24
pip install Jinja2==2.10.1
pip install pycparser==2.19
pip install python-dotenv==0.15.0
pip install six==1.11.0            
pip install requests==2.22.0     
pip install SQLAlchemy==1.3.13    
pip install urllib3==1.25.8    
pip install Werkzeug==1.0.0
pip install pyaudio==0.2.11
pip install SpeechRecognition==3.8.1
pip install pint
pip install control

:: Attempting manual basestation dependencies installation with any versions.
echo "Attempting manual basestation dependencies installation with any versions."
timeout /t 5 /nobreak > NUL
pip install bcrypt   
pip install cffi
pip install click        
pip install Flask     
pip install Flask-API
pip install Flask-SQLAlchemy  
pip install itsdangerous
pip install Jinja2
pip install pycparser
pip install python-dotenv
pip install six            
pip install requests     
pip install SQLAlchemy  
pip install urllib3   
pip install Werkzeug
pip install pyaudio
pip install SpeechRecognition
pip install pint
pip install control

:: Attempting to install pyaudio with pipwin
pip install pipwin
pipwin install pyaudio


:: Attempting installing pyaudio with anaconda.
echo "Attempting installing pyaudio with anaconda."
timeout /t 5 /nobreak > NUL
conda install pyaudio

cd ..

:: GUI dependencies installation
cd static/gui

:: Attempting normal GUI dependencies installation.
echo "Attempting normal GUI dependencies installation." 
timeout /t 5 /nobreak > NUL
npm install

:: Attempting forceful GUI dependencies installation.
echo "Attempting forceful GUI dependencies installation." 
timeout /t 5 /nobreak > NUL
npm install --force

cd ../..

:: Vision system dependencies installation
cd vision/apriltag-py/python

:: Attempting to install Vision dependencies.
echo "Attempting to install Vision dependencies."
timeout /t 5 /nobreak > NUL
pip install -r requirements.txt

:: Attempting to install AprilTag dependencies.
echo "Attempting to install AprilTag dependencies."
timeout /t 5 /nobreak > NUL
conda create --name opencv_py37 python=3.7 --file opencv_py37_conda-forge.txt -c conda-forge
conda activate opencv_py37

pip install https://github.com/ai4ce/pyAprilTag/releases/download/0.0.6/pyAprilTag-0.0.6-cp37-cp37m-win_amd64.whl

cd ../../../../installation_scripts