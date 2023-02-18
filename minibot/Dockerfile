FROM python:3.7

# set a directory for the app
WORKDIR /minibot

# copy all the files to the container
COPY . .

# install dependencies
RUN pip install --no-cache-dir -r requirements_shared.txt

# define the port number the container should expose
EXPOSE 10000

# run the command
CMD ["python", "-u", "minibot.py", "-t"]