#!/usr/bin/env python3
"""
Captain Bond Shorts/Reels Renderer
Renders a spec.json → MP4 using Pillow frames + FFmpeg encode.
"""

import json, os, subprocess, sys, tempfile, shutil, math, re
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

FONT_PATH = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
FONT_PATH_LIGHT = "/System/Library/Fonts/HelveticaNeue.ttc"
FONT_PATH_REGULAR = "/System/Library/Fonts/Helvetica.ttc"

def ensure_dir(p):
    Path(p).parent.mkdir(parents=True, exist_ok=True)

def hex_to_rgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))

def interpolate_color(c1, c2, t):
    return tuple(int(a + (b-a)*t) for a,b in zip(c1, c2))

def draw_text_centered(draw, text, font, y, color, max_w):
    lines = []
    for word in text.split():
        if not lines:
            lines.append(word)
        else:
            test = lines[-1] + " " + word
            bbox = draw.textbbox((0,0), test, font=font)
            if bbox[2] - bbox[0] <= max_w:
                lines[-1] = test
            else:
                lines.append(word)
    total_h = sum(draw.textbbox((0,0), l, font=font)[3] - draw.textbbox((0,0), l, font=font)[1] for l in lines)
    cy = y - total_h // 2
    for line in lines:
        bbox = draw.textbbox((0,0), line, font=font)
        lw = bbox[2] - bbox[0]
        lh = bbox[3] - bbox[1]
        draw.text(((1080 - lw)//2, cy), line, font=font, fill=color)
        cy += lh + 8

def draw_bg(draw, w, h, color):
    draw.rectangle([(0,0),(w,h)], fill=hex_to_rgb(color))

def draw_gradient(draw, w, h, top_color, bottom_color):
    for y in range(h):
        t = y / h
        c = interpolate_color(hex_to_rgb(top_color), hex_to_rgb(bottom_color), t)
        draw.line([(0,y),(w,y)], fill=c)

def render_scene(scene, out_dir, idx, w, h, fps, bg_color):
    dur = scene["duration_sec"]
    text = scene.get("text", "")
    subtitle = scene.get("subtitle", "")
    gradient = scene.get("gradient", None)
    total_frames = int(dur * fps)
    
    font_size = scene.get("font_size", 72)
    sub_font_size = scene.get("sub_font_size", 42)
    
    # Load fonts
    try:
        font_main = ImageFont.truetype(FONT_PATH, font_size)
    except:
        font_main = ImageFont.load_default()
    try:
        font_sub = ImageFont.truetype(FONT_PATH_LIGHT, sub_font_size)
    except:
        font_sub = ImageFont.load_default()

    for f in range(total_frames):
        frame = Image.new("RGB", (w, h))
        draw = ImageDraw.Draw(frame)
        
        if gradient:
            draw_gradient(draw, w, h, gradient[0], gradient[1])
        else:
            draw_bg(draw, w, h, bg_color)
        
        # Draw accent line at top
        if f < total_frames * 0.15:
            progress = f / (total_frames * 0.15)
            line_w = int(w * 0.6 * progress)
            draw.rectangle([(w//2 - line_w//2, 120), (w//2 + line_w//2, 124)], fill="#a855f7" if "#" not in bg_color else hex_to_rgb("#a855f7"))
        
        # Main text with fade-in
        alpha = min(1.0, f / (fps * 0.4))
        text_color = (255, 255, 255) if alpha >= 1 else tuple(int(c * alpha) for c in (255, 255, 255))
        
        if text:
            y_text = h // 2 - 100 if subtitle else h // 2
            draw_text_centered(draw, text, font_main, y_text, text_color, int(w * 0.85))
        
        if subtitle:
            y_sub = h // 2 + 80 if text else h // 2
            sub_alpha = max(0, min(1.0, (f - fps * 0.3) / (fps * 0.3)))
            sub_color = (200, 200, 200) if sub_alpha >= 1 else tuple(int(c * sub_alpha) for c in (200, 200, 200))
            draw_text_centered(draw, subtitle, font_sub, y_sub, sub_color, int(w * 0.8))
        
        # Bottom watermark
        if f > total_frames - fps * 0.8:
            wm_alpha = (f - (total_frames - fps * 0.8)) / (fps * 0.8)
            if wm_alpha > 0:
                try:
                    font_wm = ImageFont.truetype(FONT_PATH_REGULAR, 28)
                except:
                    font_wm = ImageFont.load_default()
                wm_color = tuple(int(c * min(1.0, wm_alpha * 0.5)) for c in (180, 180, 180))
                wm_text = "captainbond.com"
                bbox = draw.textbbox((0,0), wm_text, font=font_wm)
                draw.text(((w - (bbox[2] - bbox[0]))//2, h - 80), wm_text, font=font_wm, fill=wm_color)
        
        frame.save(out_dir / f"frame_{idx:03d}_{f:05d}.png")

def render_spec(spec_path, output_dir="outputs/video-studio/final"):
    with open(spec_path) as f:
        spec = json.load(f)
    
    w = spec["output"]["width"]
    h = spec["output"]["height"]
    fps = spec["output"]["fps"]
    bg_color = spec.get("style", {}).get("background_color", "#0b1220")
    scenes = spec["scenes"]
    
    tmp_dir = Path("outputs/video-studio/tmp/frames")
    if tmp_dir.exists():
        shutil.rmtree(tmp_dir)
    tmp_dir.mkdir(parents=True)
    
    for i, scene in enumerate(scenes):
        render_scene(scene, tmp_dir, i, w, h, fps, bg_color)
    
    # Encode frames to video
    out_path = Path(output_dir) / f"{spec['project']['title']}.mp4"
    ensure_dir(out_path)
    
    cmd = [
        "ffmpeg", "-y",
        "-framerate", str(fps),
        "-pattern_type", "glob",
        "-i", f"{tmp_dir}/*.png",
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        "-b:v", spec["output"].get("video_bitrate", "6M"),
        "-movflags", "+faststart",
        str(out_path)
    ]
    
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"FFmpeg error: {result.stderr}")
        sys.exit(1)
    
    # Mix audio if voiceover or BGM specified
    audio_inputs = []
    filter_chains = []
    
    if spec.get("audio", {}).get("voiceover_path"):
        audio_inputs.append(spec["audio"]["voiceover_path"])
    if spec.get("audio", {}).get("bgm_path"):
        bgm_path = spec["audio"]["bgm_path"]
        bgm_vol = spec["audio"].get("bgm_volume", 0.15)
        audio_inputs.append(bgm_path)
    
    if audio_inputs:
        final_video = out_path.with_suffix(".tmp.mp4")
        os.rename(out_path, final_video)
        
        cmd2 = ["ffmpeg", "-y", "-i", str(final_video)]
        for a in audio_inputs:
            cmd2 += ["-i", a]
        
        # Build audio mix filter
        if len(audio_inputs) == 1:
            cmd2 += ["-c:v", "copy", "-map", "0:v:0", "-map", "1:a:0", "-shortest"]
        elif len(audio_inputs) == 2:
            cmd2 += ["-c:v", "copy", "-map", "0:v:0", "-map", "1:a:0", "-map", "2:a:0"]
            cmd2 += ["-filter_complex", f"[1:a]volume=1.0[a0];[2:a]volume={bgm_vol}[a1];[a0][a1]amix=inputs=2:duration=first[a]"]
            cmd2 += ["-map", "[a]", "-ac", "2"]
        
        cmd2 += ["-shortest", str(out_path)]
        result2 = subprocess.run(cmd2, capture_output=True, text=True)
        if result2.returncode != 0:
            print(f"Audio mix error: {result2.stderr}")
            sys.exit(1)
        final_video.unlink()
    
    shutil.rmtree(tmp_dir, ignore_errors=True)
    print(f"✅ {out_path} ({os.path.getsize(out_path) / 1024 / 1024:.1f} MB)")
    return str(out_path)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python scripts/render_video.py <spec.json>")
        sys.exit(1)
    render_spec(sys.argv[1])
