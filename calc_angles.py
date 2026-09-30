import json
import math

with open('cursor_data.json', 'r') as f:
    data = json.load(f)

# Center of face (approximate)
cx, cy = 960, 450

for item in data:
    f_idx, x, y = item
    
    # Calculate angle in degrees
    dx = x - cx
    dy = y - cy
    angle = math.degrees(math.atan2(dy, dx))
    
    # Normalize to 0-360
    if angle < 0:
        angle += 360
        
    print(f"Frame {f_idx:3d}: Angle {angle:6.2f} (x={x}, y={y})")
