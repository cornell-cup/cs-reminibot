class BuiltinScriptHandler(tornado.web.RequestHandler):

    def initialize(self, base_station):
        self.base_station = base_station
        self.props = script_handler_props

    def set_default_headers(self):
        return self.set_header("Content-Type", 'application/json')

    """
    Format for START requests:
    {
        op: 'START'
        path: <path to script to run, relative to root directory>
        script_name: <file to run>
        args: {
            <flag> : <value>
            ...
        }
    }
    """

    def make_cmd_str(self, req):
        # paths start from root directory
        script_name = "../" + req['path'] + "/" + req['script_name'] + " "
        args = ""
        for k in req['args'].keys():
            # add on any args
            args += "-{} {} ".format(k, req['args'][k])
        return script_name + args

    def post(self):
        req = json.loads(self.request.body.decode())
        res = None  # send this back to client

        # Check that our JSON is good
        if req['op'] == None:
            self.set_status(400, reason="missing op")
        elif req['op'] != 'START' and req['op'] != "STOP":
            self.set_status(400, reason="op must be START or STOP")
        elif req['op'] == 'START':
            # Start the requested script
            # TODO test for speed

            # Prep next id and command for new process to execute
            n = self.props['next_req_id']
            py_cmd_str = ("python3 " + self.make_cmd_str(req))
            py_cmd = list(filter(lambda x: x != "", py_cmd_str.split(" ")))
            print("ARGS: {}".format(py_cmd))
            print("Starting process: " + py_cmd_str)

            # Create the requested script's own process, and add it to the list
            # of procs.
            self.props['procs'][str(
                n)] = subprocess.Popen(py_cmd)

            # Respond to the client
            res = {
                "status": "OK",
                "handle": self.props['next_req_id']
            }
            self.props['next_req_id'] += 1
            self.write(json.dumps(res).encode())
            self.set_status(200)

        elif req['op'] == 'STOP':
            # Stop a script
            script_name = "../" + req['path'] + "/" + req['script_name']

            if req['handle'] == None:
                self.set_status(400, reason="missing handle")
            elif str(req['handle']) not in self.props['procs'].keys():
                print(
                    "Cannot stop non-existent process at handle {}".format(req['handle']))
                self.set_status(404, reason="Handle does not exist")
            else:
                self.props['procs'][str(req['handle'])].kill()
                print("Stopped process with handle {} running {}".format(
                    req['handle'], script_name))
                self.set_status(200)
        else:
            self.set_status(400)
