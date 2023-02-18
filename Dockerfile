FROM python:3.7 as python

EXPOSE 8080

# set a directory for the app
WORKDIR /py

# copy all the files to the container
COPY ./basestation ./basestation
COPY ./vision ./vision
COPY ./static/gui ./static/gui
COPY ./run_BS.sh ./run_BS.sh
COPY ./.flaskenv ./.flaskenv
COPY ./app.py ./app.py
COPY ./minibot_server.py ./minibot_server.py

# install dependencies
RUN pip install --no-cache-dir -r ./basestation/basestation_requirements_shared.txt
RUN pip install --no-cache-dir -r ./vision/requirements.in
RUN pip install python-dotenv

RUN apt-get update -y
RUN apt-get upgrade -y
RUN apt-get install nodejs npm -y
RUN npm install ./static/gui --force
RUN apt-get install dos2unix
RUN dos2unix run_BS.sh
CMD ["sh", "run_BS.sh"]