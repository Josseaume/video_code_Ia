"""
Data center film — Manim Community (MIT) version.

Same storyboard as the Revideo and Three.js versions (../shared/spec.json).
Approach: a single ValueTracker clock drives an `always_redraw` that rebuilds the
frame as a pure function of time. Layout is authored in 1920x1080 pixel space
(origin at center, y down) and mapped to Manim units by `P()`.

Render:  manim -qh --fps 60 -r 1920,1080 --disable_caching datacenter.py DataCenter
"""
from __future__ import annotations

import json
import math
from functools import lru_cache
from pathlib import Path

import numpy as np
from manim import (
    DOWN, LEFT, ORIGIN, RIGHT, UP, Circle, Dot, Line, Rectangle, Scene, Text,
    ValueTracker, VGroup, always_redraw, config, linear,
)

SPEC = json.loads((Path(__file__).resolve().parent.parent / "shared" / "spec.json").read_text())
T = SPEC["t"]
C = SPEC["colors"]
L = SPEC["layout"]
FONT = SPEC["font"]
W, H = SPEC["video"]["width"], SPEC["video"]["height"]
DURATION = SPEC["video"]["duration"]

U = config.frame_height / H          # manim units per pixel
FS = U / 0.013556                     # manim font_size per pixel of em (JetBrains Mono)
SW = 1 / 1.35                         # manim stroke_width per pixel at 1080p


# ------------------------------------------------------------------ math ----
def clamp(v, lo=0.0, hi=1.0):
    return min(hi, max(lo, v))


def lerp(a, b, k):
    return a + (b - a) * k


def prog(t, a, b):
    return clamp((t - a) / (b - a))


def out_expo(k):
    return 1.0 if k >= 1 else 1 - 2 ** (-10 * k)


def in_out_expo(k):
    if k <= 0:
        return 0.0
    if k >= 1:
        return 1.0
    return 2 ** (20 * k - 10) / 2 if k < 0.5 else (2 - 2 ** (-20 * k + 10)) / 2


def smooth(k):
    return k * k * (3 - 2 * k)


def frac(v):
    return v - math.floor(v)


def hsh(a, b=0.0):
    return frac(math.sin(a * 127.1 + b * 311.7) * 43758.5453)


# ---------------------------------------------------------------- layout ----
EDGE = (0.0, -440.0)
FIBER_START = (-1300.0, -440.0)
SPINE_Y, LEAF_Y = -300.0, -60.0
RACK_W, RACK_H, RACK_TOP, RACK_STEP = 130.0, 380.0, 40.0, 175.0


def spine_x(i):
    return -450 + i * 300


def leaf_x(j):
    return -525 + j * 150


def rack_x(i):
    return -((L["racks"] - 1) * RACK_STEP) / 2 + i * RACK_STEP


def slot_y(j):
    return RACK_TOP + 22 + j * 29.5


SPINE = (spine_x(L["targetSpine"]), SPINE_Y)
LEAF = (leaf_x(L["targetLeaf"]), LEAF_Y)
RACK_IN = (rack_x(L["targetRack"]), RACK_TOP)


def camera(t):
    p1 = in_out_expo(prog(t, T["pullBack"], T["pullBack"] + 1.7))
    p2 = in_out_expo(prog(t, T["racksIn"] - 0.1, T["racksIn"] + 1.5))
    p3 = in_out_expo(prog(t, T["cooling"], T["response"]))
    c = in_out_expo(prog(t, T["collapse"], T["point"]))
    y = lerp(lerp(EDGE[1], -120, p1), 175, p2)
    s = lerp(lerp(1.9, 1.0, p1), 1.06, p2) * (1 + 0.05 * p3) * (1 - c)
    return 0.0, y, s


def mix(a, b, k):
    return (lerp(a[0], b[0], k), lerp(a[1], b[1], k))


def packet(t):
    arrive = (EDGE[0] - 36, EDGE[1])
    if t < T["packetArrive"]:
        pos = mix(FIBER_START, arrive, in_out_expo(prog(t, T["packetIn"], T["packetArrive"])))
    elif t < T["hopSpine"]:
        pos = mix(arrive, EDGE, out_expo(prog(t, T["packetArrive"], T["packetArrive"] + 0.4)))
    elif t < T["hopLeaf"]:
        pos = mix(EDGE, SPINE, in_out_expo(prog(t, T["hopSpine"], T["hopSpine"] + 0.6)))
    elif t < T["packetToRack"]:
        pos = mix(SPINE, LEAF, in_out_expo(prog(t, T["hopLeaf"], T["hopLeaf"] + 0.7)))
    else:
        pos = mix(LEAF, RACK_IN, in_out_expo(prog(t, T["packetToRack"], T["packetToRack"] + 0.4)))
    op = prog(t, T["packetIn"] - 0.3, T["packetIn"]) * (1 - prog(t, T["packetToRack"] + 0.35, T["packetToRack"] + 0.5))
    return pos, op


def slot_activation(t, i, j):
    d = abs(i - L["targetRack"]) + abs(j - L["slotsPerRack"] / 2) * 0.35
    s = T["computeWave"] + d * 0.22
    return out_expo(prog(t, s, s + 0.5))


# ------------------------------------------------------------- drawing ----
class Frame:
    """Collects mobjects for one frame; world items go through the camera."""

    def __init__(self, t):
        self.t = t
        self.cx, self.cy, self.s = camera(t)
        self.g = VGroup()

    # coordinate mapping
    def P(self, x, y, world=True):
        if world:
            x, y = (x - self.cx) * self.s, (y - self.cy) * self.s
        return np.array([x * U, -y * U, 0.0])

    def k(self, world):
        return self.s if world else 1.0

    def line(self, a, b, color, width, opacity, world=True, glow=0.0, end=1.0):
        if opacity <= 0.003 or end <= 0.001:
            return
        b = (lerp(a[0], b[0], end), lerp(a[1], b[1], end))
        pa, pb = self.P(*a, world), self.P(*b, world)
        if np.allclose(pa, pb):
            return
        w = width * self.k(world)
        if glow > 0:
            for mult, op in ((5, 0.08), (2.6, 0.18)):
                self.g.add(Line(pa, pb, stroke_color=color, stroke_width=w * mult * SW, stroke_opacity=op * opacity * glow))
        self.g.add(Line(pa, pb, stroke_color=color, stroke_width=w * SW, stroke_opacity=clamp(opacity)))

    def rect(self, x, y, w, h, stroke=None, stroke_w=1.0, stroke_op=0.0, fill=None, fill_op=0.0, world=True, glow=0.0):
        k = self.k(world)
        if w * k * U < 1e-4 or h * k * U < 1e-4:
            return
        if glow > 0 and stroke:
            self.g.add(Rectangle(width=w * k * U, height=h * k * U, stroke_color=stroke, stroke_width=stroke_w * k * 4 * SW,
                                 stroke_opacity=0.18 * glow * stroke_op).move_to(self.P(x, y, world)))
        r = Rectangle(width=w * k * U, height=h * k * U,
                      stroke_color=stroke or C["bg"], stroke_width=stroke_w * k * SW if stroke else 0,
                      stroke_opacity=clamp(stroke_op), fill_color=fill or C["bg"], fill_opacity=clamp(fill_op))
        self.g.add(r.move_to(self.P(x, y, world)))

    def dot(self, x, y, r, color, opacity, world=True, glow=0.0):
        if opacity <= 0.003:
            return
        k = self.k(world)
        if r * k * U < 1e-4:
            return
        p = self.P(x, y, world)
        if glow > 0:
            for mult, op in ((3.2, 0.07), (1.9, 0.16)):
                self.g.add(Dot(p, radius=r * mult * k * U, color=color, fill_opacity=op * glow * opacity))
        self.g.add(Dot(p, radius=r * k * U, color=color, fill_opacity=clamp(opacity)))

    def ring(self, x, y, r, color, width, opacity, world=True):
        if opacity <= 0.003:
            return
        k = self.k(world)
        self.g.add(Circle(radius=r * k * U, stroke_color=color, stroke_width=width * k * SW, stroke_opacity=clamp(opacity))
                   .move_to(self.P(x, y, world)))

    def text(self, s, x, y, size, color, opacity, align="left", world=True, weight="NORMAL"):
        if opacity <= 0.003 or not s:
            return
        k = self.k(world)
        if size * k < 1:
            return
        m = cached_text(s, color, weight).copy()
        m.scale(size * k / 100)
        m.set_opacity(clamp(opacity))
        edge = {"left": LEFT, "right": RIGHT, "center": ORIGIN}[align]
        m.move_to(self.P(x, y, world), aligned_edge=edge)
        if align != "center":
            m.shift(UP * 0)  # vertical center already
        self.g.add(m)


@lru_cache(maxsize=4096)
def cached_text(s: str, color: str, weight: str = "NORMAL") -> Text:
    # authored at a 100px em, scaled per use
    return Text(s, font=FONT, font_size=100 * FS, color=color, weight=weight)


def rgba_op(base, k):
    return clamp(base * k)


# --------------------------------------------------------------- frame ----
def build(t: float) -> VGroup:
    F = Frame(t)
    s = F.s

    # backdrop: faint blueprint grid with slight parallax (screen space)
    G = 60
    offy = -frac((F.cy * 0.25) / G) * G
    for i in range(W // G + 2):
        x = -W / 2 + i * G
        F.line((x, -H / 2), (x, H / 2), C["line"], 1, 0.035, world=False)
    for j in range(H // G + 2):
        y = -H / 2 + j * G + offy
        F.line((-W / 2, y), (W / 2, y), C["line"], 1, 0.035, world=False)

    if s > 0.004:
        # fiber
        fiber_end = (EDGE[0] - 32, EDGE[1])
        F.line(FIBER_START, fiber_end, C["line"], 1.4, 0.28, end=out_expo(prog(t, T["fiberDraw"], T["fiberDraw"] + 1.4)))
        (px, py), pop = packet(t)
        if t < T["hopSpine"]:
            lit = 0.85 * (1 - prog(t, T["packetArrive"] + 0.4, T["hopSpine"]))
            F.line(FIBER_START, (min(px, fiber_end[0]), EDGE[1]), C["accent"], 2, lit, glow=1)

        # links
        for i in range(L["spines"]):
            s0 = T["linksDraw"] + i * 0.07
            F.line((EDGE[0], EDGE[1] + 32), (spine_x(i), SPINE_Y - 28), C["line"], 1.2, 0.16, end=out_expo(prog(t, s0, s0 + 0.9)))
            for j in range(L["leaves"]):
                s1 = T["linksDraw"] + 0.3 + (i * L["leaves"] + j) * 0.014
                F.line((spine_x(i), SPINE_Y + 28), (leaf_x(j), LEAF_Y - 24), C["line"], 1, 0.1, end=out_expo(prog(t, s1, s1 + 0.9)))

        route = [
            ((EDGE[0], EDGE[1] + 32), (SPINE[0], SPINE[1] - 28), T["hopSpine"], 0.6),
            ((SPINE[0], SPINE[1] + 28), (LEAF[0], LEAF[1] - 24), T["hopLeaf"], 0.7),
            ((LEAF[0], LEAF[1] + 24), RACK_IN, T["packetToRack"], 0.4),
        ]
        for a, b, st, d in route:
            op = 0.9 * (1 - 0.6 * prog(t, st + d + 0.6, st + d + 2.5)) * (1 - prog(t, T["collapse"] - 0.2, T["collapse"]))
            F.line(a, b, C["accent"], 2, op, end=in_out_expo(prog(t, st, st + d)), glow=1)

        # nodes
        def node(x, y, size, appear, hit):
            a = out_expo(prog(t, appear, appear + 0.5))
            if a <= 0:
                return
            sc = 0.6 + 0.4 * out_expo(prog(t, appear, appear + 0.6))
            on = hit is not None and t >= hit
            flash = 0.35 * math.exp(-max(0.0, t - hit) * 2.2) if on else 0
            F.rect(x, y, size * sc, size * sc, stroke=C["accent"] if on else C["line"], stroke_w=1.4,
                   stroke_op=a * (1 if on else 0.45), fill=C["accent"], fill_op=flash * a, glow=1 if on else 0)
            F.rect(x, y, size * 0.3 * sc, size * 0.3 * sc, fill=C["highlight"] if on else C["line"], fill_op=a * (1 if on else 0.25))

        node(EDGE[0], EDGE[1], 64, 0.35, T["packetArrive"])
        for i in range(L["spines"]):
            node(spine_x(i), SPINE_Y, 56, T["linksDraw"] + 0.1 + i * 0.06, T["hopSpine"] + 0.6 if i == L["targetSpine"] else None)
        for j in range(L["leaves"]):
            node(leaf_x(j), LEAF_Y, 48, T["linksDraw"] + 0.5 + j * 0.05, T["hopLeaf"] + 0.7 if j == L["targetLeaf"] else None)

        for (x, y), at in ((EDGE, T["packetArrive"]), (SPINE, T["hopSpine"] + 0.6), (LEAF, T["hopLeaf"] + 0.7)):
            if t >= at:
                k = out_expo(prog(t, at, at + 1.1))
                F.ring(x, y, (40 + 220 * k) / 2, C["accent"], 1.5, 0.8 * (1 - prog(t, at, at + 1.1)))

        # labels
        req = SPEC["copy"]["request"]
        n = int(prog(t, T["requestLabel"], T["requestLabel"] + 0.8) * len(req))
        F.text(req[:n], EDGE[0] - 60, EDGE[1] - 36, 18, C["highlight"], 1 - prog(t, T["pullBack"] + 0.6, T["pullBack"] + 1.2), align="right")
        net = SPEC["copy"]["network"]
        n = int(prog(t, T["networkLabel"], T["networkLabel"] + 0.6) * len(net))
        F.text(net[:n], EDGE[0] + 60, EDGE[1], 18, C["line"], 0.55)

        # racks
        for i in range(L["racks"]):
            rise = out_expo(prog(t, T["racksIn"] + i * 0.07, T["racksIn"] + i * 0.07 + 0.9))
            if rise <= 0:
                continue
            dy = 60 * (1 - rise)
            F.rect(rack_x(i), RACK_TOP + RACK_H / 2 + dy, RACK_W, RACK_H, stroke=C["line"], stroke_w=1.3, stroke_op=0.4 * rise)
            for j in range(L["slotsPerRack"]):
                a = slot_activation(t, i, j)
                h = hsh(i, j)
                fill = a * (0.18 + 0.32 * (0.6 + 0.4 * math.sin(t * (4 + h * 5) + h * 9)))
                F.rect(rack_x(i) - 6, slot_y(j) + 9.5 + dy, 98, 19, stroke=C["line"], stroke_w=1, stroke_op=0.12 * rise,
                       fill=C["accent"], fill_op=fill * rise)
                blink = 1 if frac(t * (0.7 + h * 1.6) + h) > 0.35 else 0.25
                if a > 0.05:
                    F.dot(rack_x(i) + 51, slot_y(j) + 9.5 + dy, 2.5, C["highlight"], 0.95 * blink * rise)
                else:
                    F.dot(rack_x(i) + 51, slot_y(j) + 9.5 + dy, 2.5, C["line"], 0.3 * blink * rise)
        floor = out_expo(prog(t, T["racksIn"], T["racksIn"] + 1.2))
        F.line((-640, RACK_TOP + RACK_H + 2), (640, RACK_TOP + RACK_H + 2), C["line"], 1.2, 0.3, end=floor)

        # airflow
        air = out_expo(prog(t, T["cooling"], T["cooling"] + 0.8)) * (1 - prog(t, T["collapse"] - 0.3, T["collapse"] + 0.1))
        if air > 0:
            lanes = L["racks"] + 1
            for k in range(54):
                lane = k % lanes
                x = rack_x(0) - RACK_STEP / 2 + lane * RACK_STEP + (hsh(k, 3) - 0.5) * 26
                f = frac(hsh(k, 5) + (t - T["cooling"]) * (0.45 + hsh(k, 4) * 0.35))
                y = RACK_TOP + RACK_H + 40 - f * (RACK_H + 30)
                F.line((x, y), (x, y + 22), C["line"], 1.4, 0.4 * math.sin(math.pi * f) * air)
            for k in range(60):
                rk = k % L["racks"]
                x0 = rack_x(rk) + (hsh(k, 7) - 0.5) * 100
                f = frac(hsh(k, 9) + (t - T["cooling"]) * (0.5 + hsh(k, 8) * 0.4))
                y = RACK_TOP - 6 - f * 300
                x = x0 + math.sin(f * 7 + k) * 10
                F.line((x, y), (x, y + 26), C["accent"], 1.8, 0.75 * math.sin(math.pi * f) * air, glow=0.6)

        # response tokens
        path = [RACK_IN, (LEAF[0], LEAF[1] + 24), (LEAF[0], LEAF[1] - 24), (SPINE[0], SPINE[1] + 28), (SPINE[0], -900.0)]

        def along(k):
            seg = len(path) - 1
            kk = clamp(k) * seg
            i = min(seg - 1, int(kk))
            f = kk - i
            return mix(path[i], path[i + 1], f)

        for k in range(10):
            st = T["response"] + k * 0.06
            if st <= t < st + 0.95:
                x, y = along(in_out_expo(prog(t, st, st + 0.9)))
                F.dot(x, y, 6 if k == 0 else 3.5, C["highlight"] if k == 0 else C["accent"], 1 - 0.07 * k, glow=1)

        # packet
        if pop > 0:
            pulse = 1 + 0.25 * math.sin(t * 8) * prog(t, T["packetArrive"], T["packetArrive"] + 0.2) * (1 - prog(t, T["hopSpine"] - 0.1, T["hopSpine"]))
            F.dot(px, py, 7 * pulse, C["highlight"], pop, glow=1.4)

    # HUD (screen space)
    hud_in = out_expo(prog(t, T["stats"] - 0.1, T["stats"] + 0.6)) * (1 - prog(t, T["collapse"] - 0.2, T["collapse"] + 0.2))
    if hud_in > 0:
        hx, hy = 700 + 40 * (1 - hud_in), -190
        F.line((hx - 28, hy - 10), (hx - 28, hy + 420), C["line"], 1, 0.16 * hud_in, world=False, end=hud_in)
        maxes = [100, 50, 15000]
        for k, st in enumerate(SPEC["copy"]["stats"]):
            at = T["stats"] + k * 0.18
            n = out_expo(prog(t, at, at + 1.6))
            y = hy + k * 92
            F.text(st["label"], hx, y, 16, C["line"], 0.5 * hud_in, world=False)
            val = f"{st['value'] * n:,.{st['decimals']}f}{st['unit']}"
            F.text(val, hx, y + 34, 34, C["highlight"], hud_in, world=False, weight="MEDIUM")
            F.rect(hx + 110, y + 62, 220, 3, fill=C["line"], fill_op=0.1 * hud_in, world=False)
            bw = 220 * (st["value"] / maxes[k]) * n
            if bw > 0.5:
                F.rect(hx + bw / 2, y + 62, bw, 3, fill=C["accent"], fill_op=hud_in, world=False)
        for k, st in enumerate(SPEC["copy"]["temps"]):
            at = T["temps"] + k * 0.2
            n = out_expo(prog(t, at, at + 1.4))
            a = prog(t, at, at + 0.3) * hud_in
            y = hy + 3 * 92 + 26 + k * 56
            F.text(st["label"], hx, y, 16, C["line"], 0.5 * a, world=False)
            F.text(f"{round(st['value'] * n)}{st['unit']}", hx + 220, y, 26, C["line"] if k == 0 else C["accent"],
                   (0.85 if k == 0 else 1) * a, align="right", world=False)

    # point + end card (screen space)
    size = 22
    end = SPEC["copy"]["endCard"]
    tw = len(end) * size * 0.6 * 1.08
    born = smooth(prog(t, T["collapse"] + 0.55, T["point"]))
    pulse = math.exp(-max(0.0, t - T["point"]) * 3.5) * (1 if t >= T["point"] else 0.4)
    rev = in_out_expo(prog(t, T["endReveal"], T["endReveal"] + T["endRevealDur"]))
    pre = out_expo(prog(t, T["endReveal"] - 0.35, T["endReveal"]))
    px = -tw / 2 * pre + tw * rev + 10 * rev
    to_caret = smooth(prog(rev, 0.85, 1))
    a_end = t - (T["endReveal"] + T["endRevealDur"])
    blink = clamp(0.5 + 1.6 * math.cos(a_end * math.pi * 2 * 1.6)) if 0 < a_end < 1.2 else 1
    fade = out_expo(prog(t, T["fadeOut"], DURATION - 0.04))

    if rev > 0:
        txt = cached_text(end, C["line"]).copy().scale(size / 100)
        txt.move_to(F.P(-tw / 2, 0, world=False), aligned_edge=LEFT)
        for ch in txt:
            cx = ch.get_center()[0] / U
            ch.set_opacity(0.92 * (1 - fade) * (1 if cx < px - 6 else 0))
        F.g.add(txt)
    if born > 0:
        r = born * 7 * (1 + 0.6 * pulse)
        w = r * 2 * (1 - to_caret) + 10 * to_caret
        h = r * 2 * (1 - to_caret) + size * 1.05 * to_caret
        op = born * blink * (1 - fade)
        if to_caret < 0.5:
            F.dot(px, 0, w / 2, C["highlight"], op, world=False, glow=1 + 1.5 * pulse)
        else:
            F.rect(px, 0, w, h, fill=C["accent"], fill_op=op, world=False)

    if fade > 0:
        F.rect(0, 0, W + 4, H + 4, fill=C["bg"], fill_op=fade, world=False)
    return F.g


class DataCenter(Scene):
    def construct(self):
        self.camera.background_color = C["bg"]
        clock = ValueTracker(0.0)
        self.add(always_redraw(lambda: build(clock.get_value())))
        self.play(clock.animate.set_value(DURATION), run_time=DURATION, rate_func=linear)
