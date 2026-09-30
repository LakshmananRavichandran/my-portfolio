import json
import math

with open('cursor_data.json', 'r') as f:
    data = json.load(f)

cx, cy = 960, 540

directions = {
    "RIGHT": 0,
    "DOWN-RIGHT": 45,
    "DOWN": 90,
    "DOWN-LEFT": 135,
    "LEFT": 180,
    "UP-LEFT": 225,
    "UP": 270,
    "UP-RIGHT": 315
}

best_frames = {}

for name, target_angle in directions.items():
    best_radius = 0
    best_f = -1
    for item in data:
        f_idx, x, y = item
        dx = x - cx
        dy = y - cy
        
        angle = math.degrees(math.atan2(dy, dx))
        if angle < 0: angle += 360
        
        diff = abs(angle - target_angle)
        if diff > 180: diff = 360 - diff
        
        if diff < 25: # within 25 degrees
            radius = math.hypot(dx, dy)
            if radius > best_radius:
                best_radius = radius
                best_f = f_idx
                
    best_frames[name] = best_f

print("Best frames for 8 directions (angle-based):")
for k, v in best_frames.items():
    print(f"{k:12s}: Frame {v}")
