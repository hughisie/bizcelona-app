#!/usr/bin/env python3
"""Seamless crossfade loop for near-static drone footage.

  encode-crossfade.py <source> <start_s> <loop_s> <overlap_s> <WxH> <crop> <outname> [crf_x264] [crf_vp9]

Takes loop_s + overlap_s seconds of footage. The last overlap_s seconds fade in over the first overlap_s seconds of the
output, so the final frame is the frame that comes just before the first one: the loop point has no jump.
60 fps footage is reduced to a constant 30 fps by averaging pairs of frames (never an uneven drop).
"""
import os, subprocess, sys, tempfile
import numpy as np

src, start, loop, over, size, crop, out = sys.argv[1], float(sys.argv[2]), float(sys.argv[3]), float(sys.argv[4]), sys.argv[5], sys.argv[6], sys.argv[7]
crf264 = sys.argv[8] if len(sys.argv) > 8 else "24"
crf9 = sys.argv[9] if len(sys.argv) > 9 else "34"
W, H = (int(v) for v in size.split("x"))
FPS = 30
LF, XF = int(round(loop * FPS)), int(round(over * FPS))
tmp = os.path.join(os.environ.get("SCRATCH", tempfile.gettempdir()), os.path.basename(out) + ".raw")

vf = f"{crop}scale={W}:{H}:flags=lanczos,tmix=frames=2,select='not(mod(n\\,2))',setpts=N/({FPS}*TB)"
subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", str(start), "-t", str(loop + over + 0.1), "-i", src, "-vf", vf,
                "-r", str(FPS), "-vsync", "cfr", "-pix_fmt", "rgb24", "-f", "rawvideo", tmp], check=True)
S = np.memmap(tmp, dtype=np.uint8, mode="r").reshape(-1, H, W, 3)
assert len(S) >= LF + XF, (len(S), LF, XF)

enc = subprocess.Popen(
    ["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
     "-an", "-c:v", "libx264", "-preset", "slower", "-crf", crf264, "-profile:v", "high", "-pix_fmt", "yuv420p",
     "-g", "60", "-keyint_min", "30", "-sc_threshold", "0", "-bf", "2", "-movflags", "+faststart", "-vsync", "cfr", out + ".mp4"],
    stdin=subprocess.PIPE)
for k in range(LF):
    if k < XF:
        a = k / XF  # weight of the head; the tail fades out
        frame = (S[LF + k].astype(np.float32) * (1 - a) + S[k].astype(np.float32) * a + 0.5).astype(np.uint8)
    else:
        frame = np.asarray(S[k])
    enc.stdin.write(frame.tobytes())
enc.stdin.close(); enc.wait()
del S; os.remove(tmp)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", out + ".mp4", "-an", "-c:v", "libvpx-vp9", "-b:v", "0", "-crf", crf9,
                "-row-mt", "1", "-cpu-used", "1", "-g", "60", "-pix_fmt", "yuv420p", "-r", str(FPS), "-vsync", "cfr", out + ".webm"], check=True)
