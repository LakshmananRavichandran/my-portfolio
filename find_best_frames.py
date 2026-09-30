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
    best_score = -999999
    best_f = -1
    for item in data:
        f_idx, x, y = item
        dx = x - cx
        dy = y - cy
        
        # We want to maximize the projection of (dx, dy) onto the target direction vector
        target_rad = math.radians(target_angle)
        proj = dx * math.cos(target_rad) + dy * math.sin(target_rad)
        
        if proj > best_score:
            best_score = proj
            best_f = f_idx
            
    best_frames[name] = best_f

print("Best frames for 8 directions:")
for k, v in best_frames.items():
    print(f"{k:12s}: Frame {v}")
