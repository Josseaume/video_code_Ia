"""Render a single frame for previewing:  STILL_T=13.5 manim -s ... still.py Still"""
import os
from manim import Scene
from datacenter import build, C

class Still(Scene):
    def construct(self):
        self.camera.background_color = C["bg"]
        self.add(build(float(os.environ.get("STILL_T", "0"))))
