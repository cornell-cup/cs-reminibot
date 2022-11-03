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
            Set-Location {folder}

            #installing general dependencies
            Write-Output "Installing general dependencies."
            Start-Sleep -s 5
            winget install -e --id Git.Git
            winget install -e --id Python.Python.3
            winget install -e --id OpenJS.NodeJS -v 16.12.0
            winget install -e --id Anaconda.Anaconda3
            winget install -e --id Kitware.CMake

            #reloading updated path
            $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User") 

            #cloning repo
            git clone https://github.com/cornell-cup/cs-reminibot.git

            Set-Location cs-reminibot

            #switching to correct branch
            git checkout origin/vision_doc_updated_gui_interpolation

            #initializing kernals for anaconda use
            conda init powershell
            conda init bash
            conda init cmd.exe

            #reloading updated path
            $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User") 

        """ + """
            Start-Process powershell {
                Get-Location; 
                Write-Output hello; 
                Set-Location vision/apriltag-py/python;
                Get-Location; 
                conda env remove -n opencv_py37 -y;
                Write-Output Removed; 
                conda create --name opencv_py37 python=3.7 --file opencv_py37_conda-forge.txt -c conda-forge -y;
                Write-Output Created; 
                conda activate opencv_py37;
                Write-Output Activated; 
                pip install https://github.com/ai4ce/pyAprilTag/releases/download/0.0.6/pyAprilTag-0.0.6-cp37-cp37m-win_amd64.whl;
                Write-Output Installed; 
                Write-Output "Attempting to install Vision dependencies."
                pip install -r requirements.txt
                Write-Output "Attempting to install Vision dependencies individually."
                pip install numpy
                pip install scikit-learn
                pip install requests
                pip install kivy
            }

        """ + f"""

            Set-Location basestation

            #Attempting normal basestation dependencies installation.
            Write-Output "Attempting normal basestation dependencies installation."
            pip install -r requirements.txt

            #Attempting manual basestation dependencies installation with correct versions.
            Write-Output "Attempting manual basestation dependencies installation with correct versions."
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
            pip install pint
            pip install control
            pip install pathfinding
            pip install collision

            #Attempting manual basestation dependencies installation with any versions.
            Write-Output "Attempting manual basestation dependencies installation with any versions."
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
            pip install pint
            pip install control
            pip install pathfinding
            pip install collision

            #Attempting to install pyaudio with pipwin
            pip install pipwin
            pipwin install pyaudio

            Set-Location ../installation_scripts
            ./Node_dependencies_install.sh

            Set-Location ..


            Set-Content {run_bs_filepath} '{run_BS_code}'


            Set-Content {run_vision_filepath} '{run_vision_code}'

        """], 
        stdout=sys.stdout)


    
    with open(run_bs_filepath, 'w') as run_BS_file:
        run_BS_file.write(run_BS_code)

    with open(run_vision_filepath, 'w') as run_vision_file:
        run_vision_file.write(run_vision_code)



tk.Button(text='Click to Select Folder for Installation', 
       command=select_folder).pack(fill=tk.X)

tk.mainloop()


