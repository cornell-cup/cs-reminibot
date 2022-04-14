import subprocess, sys
import tkinter as tk
from tkinter import filedialog

folder = ''

def select_folder():
    folder = filedialog.askdirectory()
    folder = folder if folder and folder.strip() != '' else "./"
    print(folder)
    cs_reminibot_filepath = folder+"/cs-reminibot/"
    run_bs_filepath = cs_reminibot_filepath+"run_BS.sh"
    print(run_bs_filepath)
    run_vision_filepath = cs_reminibot_filepath+"run_vision.sh"
    print(run_vision_filepath)

    run_BS_code = f"""
            #!/bin/bash
            cd {cs_reminibot_filepath}
            set -e
            trap "kill 0" EXIT

            echo "================= MINIBOT CLIENT GUI ================="
            cd static/gui
            npm run webpack &
            echo "=========== STARTING BASESTATION ==============="
            cd ../..
            flask run
        """

    run_vision_code = f"""
            #!/bin/bash
            cd {cs_reminibot_filepath}vision/apriltag-py/python/
            conda activate opencv_py37
            python calibrationgui.py
        """

    p = subprocess.call(["powershell.exe", 
        f"""
            #!/bin/bash
            cd {folder};

            #installing general dependencies;
            echo "Installing general dependencies.";
            sleep 5;
            brew install git;
            brew install python;
            brew install node@16;
            brew install --cask anaconda;
            brew install cmake

            #reloading updated path
            echo "export PATH=\$PATH:/home/user/test" >> ~/.bashrc
            PS1='$ '
            source ~/.bashrc 

            #cloning repo
            git clone https://github.com/cornell-cup/cs-reminibot.git

            cd cs-reminibot

            #switching to correct branch
            git checkout origin/vision_doc_updated_gui_interpolation

            #initializing kernals for anaconda use
            conda init bash

            #reloading updated path
            echo "export PATH=\$PATH:/home/user/test" >> ~/.bashrc
            PS1='$ '
            source ~/.bashrc 

        
            pwd; 
            echo hello; 
            cd vision/apriltag-py/python;
            pwd; 
            conda env remove -n opencv_py37 -y;
            echo Removed; 
            conda create --name opencv_py37 python=3.7 --file opencv_py37_conda-forge.txt -c conda-forge -y;
            echo Created; 
            conda activate opencv_py37;
            echo Activated; 
            pip3 install https://github.com/ai4ce/pyAprilTag/releases/download/0.0.6/pyAprilTag-0.0.6-cp37-cp37m-win_amd64.whl;
            echo Installed; 
            echo "Attempting to install Vision dependencies."
            pip3 install -r requirements.txt
            echo "Attempting to install Vision dependencies individually."
            pip3 install numpy
            pip3 install scikit-learn
            pip3 install requests
            pip3 install kivy


            cd ../../../basestation

            #Attempting normal basestation dependencies installation.
            echo "Attempting normal basestation dependencies installation."
            pip3 install -r requirements.txt

            #Attempting manual basestation dependencies installation with correct versions.
            echo "Attempting manual basestation dependencies installation with correct versions."
            pip3 install bcrypt==3.1.7   
            pip3 install cffi==1.14.5
            pip3 install click==6.7        
            pip3 install Flask==1.1.1     
            pip3 install Flask-API==2.0
            pip3 install Flask-SQLAlchemy==2.4.1    
            pip3 install itsdangerous==0.24
            pip3 install Jinja2==2.10.1
            pip3 install pycparser==2.19
            pip3 install python-dotenv==0.15.0
            pip3 install six==1.11.0            
            pip3 install requests==2.22.0     
            pip3 install SQLAlchemy==1.3.13    
            pip3 install urllib3==1.25.8    
            pip3 install Werkzeug==1.0.0
            pip3 install pyaudio==0.2.11
            pip3 install SpeechRecognition==3.8.1
            pip3 install pint
            pip3 install control

            #Attempting manual basestation dependencies installation with any versions.
            echo "Attempting manual basestation dependencies installation with any versions."
            pip3 install bcrypt   
            pip3 install cffi
            pip3 install click        
            pip3 install Flask     
            pip3 install Flask-API
            pip3 install Flask-SQLAlchemy  
            pip3 install itsdangerous
            pip3 install Jinja2
            pip3 install pycparser
            pip3 install python-dotenv
            pip3 install six            
            pip3 install requests     
            pip3 install SQLAlchemy  
            pip3 install urllib3   
            pip3 install Werkzeug
            pip3 install pyaudio
            pip3 install SpeechRecognition
            pip3 install pint
            pip3 install control

            #Attempting to install pyaudio with pip3win
            pip3 install pip3win
            pip3win install pyaudio

            cd ../installation_scripts
            ./Node_dependencies_install.sh

            cd ..


            echo '{run_BS_code}' >> {run_bs_filepath}


            echo '{run_vision_code}' >> {run_vision_filepath}

        """], 
        stdout=sys.stdout)


    
    with open(run_bs_filepath, 'w') as run_BS_file:
        run_BS_file.write(run_BS_code)

    with open(run_vision_filepath, 'w') as run_vision_file:
        run_vision_file.write(run_vision_code)



tk.Button(text='Click to Select Folder for Installation', 
       command=select_folder).pack(fill=tk.X)

tk.mainloop()


