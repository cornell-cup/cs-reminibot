FROM python:3.7 as python

# set a directory for the app
WORKDIR /py

# copy all the files to the container
COPY . ./minibot
COPY ../vision ./vision
COPY ../static/gui ./static/gui

# install dependencies
RUN pip install --no-cache-dir -r ./minibot/basestation_requirements_shared.txt
RUN pip install --no-cache-dir -r ../vision/requirements.in

RUN apt-get update -y
RUN apt-get upgrade -y
RUN apt-get install nodejs npm -y
RUN npm install ./static/gui --force

CMD ["sh", "run_BS.sh"]