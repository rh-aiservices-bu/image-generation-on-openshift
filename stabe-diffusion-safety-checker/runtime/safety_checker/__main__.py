import argparse
import kserve
from kserve import logging

from .safety_checker import SafetyChecker

parser = argparse.ArgumentParser(parents=[kserve.model_server.parser])

args, _ = parser.parse_known_args()

if __name__ == "__main__":
    safety_checker = SafetyChecker(
        name=args.model_name,
    )
    server = kserve.ModelServer()
    server.start(models=[safety_checker])