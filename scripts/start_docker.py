#!/usr/bin/python
import subprocess

subprocess.call("yarn build:dockers", shell=True)
subprocess.call("yarn start:dockers", shell=True)
