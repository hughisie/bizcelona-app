#!/usr/bin/env python3
"""Seamless eased ping-pong loop for slow, reversible drone moves.

  encode-pingpong.py <source> <start_s> <forward_s> <WxH> <crop> <outname> [crf_x264] [crf_vp9]

Plays forward_s seconds of footage and back again. Speed follows a half cosine, so the camera comes to rest at each turn
instead of bouncing, and the first and last frames are the same frame. The 60 fps source is resampled to a constant
30 fps by blending the two nearest source frames at each output time, so there are no repeated or dropped frames.
"""
import subprocess, sys, math
import numpy as np

src, start, fwd, size, crop, out = sys.argv[1], float(sys.argv[2]), float(sys.argv[3]), sys.argv[4], sys.argv[5], sys.argv[6]
crf264 = sys.argv[7] if len(sys.argv) > 7 else "24"
crf9 = sys.argv[8] if len(sys.argv) > 8 else "34"
W, H = (int(v) for v in size.split("x"))
FPS = 30

raw = subprocess.run(
    ["ffmpeg", "-v", "error", "-ss", str(start), "-t", str(fwd + 0.05), "-i", src,
     "-vf", f"{crop}scale={W}:{H}:flags=lanczos", "-pix_fmt", "rgb24", "-f", "rawvideo", "-"],
    capture_output=True, check=True).stdout
F = np.frombuffer(raw, dtype=np.uint8).reshape(-1, H, W, 3)
n = int(round(fwd * 59.94))
F = F[:n]
n = len(F)
total = int(round(2 * fwd * FPS))

enc = subprocess.Popen(
    ["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
     "-an", "-c:v", "libx264", "-preset", "slower", "-crf", crf264, "-profile:v", "high", "-pix_fmt", "yuv420p",
     "-g", "60", "-keyint_min", "30", "-sc_threshold", "0", "-bf", "2", "-movflags", "+faststart", "-vsync", "cfr", out + ".mp4"],
    stdin=subprocess.PIPE)
for k in range(total):
    u = k / total
    s = (1 - math.cos(2 * math.pi * u)) / 2
    pos = s * (n - 1)
    i = int(math.floor(pos)); f = pos - i
    j = min(i + 1, n - 1)
    frame = F[i] if f < 1e-6 else (F[i].astype(np.float32) * (1 - f) + F[j].astype(np.float32) * f + 0.5).astype(np.uint8)
    enc.stdin.write(frame.tobytes())
enc.stdin.close(); enc.wait()
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", out + ".mp4", "-an", "-c:v", "libvpx-vp9", "-b:v", "0", "-crf", crf9,
                "-row-mt", "1", "-cpu-used", "1", "-g", "60", "-pix_fmt", "yuv420p", "-r", str(FPS), "-vsync", "cfr", out + ".webm"], check=True)
