from random import randint
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
            python calibrationgui.py
        """

    install_code = f"""
    
            cd {folder}

            echo "Installing general dependencies."
            sleep 5
            brew install git
            brew install python
            brew install node@16
            brew install --cask anaconda
            brew install cmake


            sudo . ~/.bash_profile


            git clone https://github.com/cornell-cup/cs-reminibot.git

            cd cs-reminibot


            git checkout origin/vision_doc_updated_gui_interpolation

            conda init bash



            sudo . ~/.bash_profile

        
            pwd 
            echo hello 
            cd vision/apriltag-py/python
            


            echo "Attempting to install Vision dependencies."
            pip3 install -r requirements.txt
            echo "Attempting to install Vision dependencies individually."
            pip3 install numpy
            pip3 install scikit-learn
            pip3 install requests
            pip3 install kivy


            echo "Attempting to install AprilTag dependencies."
            sleep 5
            cd ..
            mkdir build
            cd build
            cmake .. -DCMAKE_BUILD_TYPE=Release
            make -j4

            sudo make install


            cd ../../../basestation

            echo "Attempting normal basestation dependencies installation."
            pip3 install -r requirements.txt


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
            pip3 install pint
            pip3 install control

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
            pip3 install pint
            pip3 install control


            conda install pyaudio

            cd ../installation_scripts
            ./Node_dependencies_install.sh

            cd ..


            echo '{run_BS_code}' >> {run_bs_filepath}

            chmod +x {run_bs_filepath}

            echo '{run_vision_code}' >> {run_vision_filepath}

            chmod +x {run_vision_filepath}

        """

    command = ""
    for line in install_code.splitlines():
        stripped_line = line.strip()
        if stripped_line != "":
            command += stripped_line+";"
    subprocess.call(command, stdout=sys.stdout, shell=True)


    with open(run_bs_filepath, 'w') as run_BS_file:
        run_BS_file.write(run_BS_code)

    with open(run_vision_filepath, 'w') as run_vision_file:
        run_vision_file.write(run_vision_code)
        

tk.Button(text='Click to Select Folder for Installation', 
       command=select_folder).pack(fill=tk.X)

tk.mainloop()


