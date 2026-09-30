import cv2
from PIL import Image
import os

os.makedirs('public/frames', exist_ok=True)

cap = cv2.VideoCapture('public/character.mp4')
total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

if total == 0:
    print("No frames found!")
    exit()

target_indices = [int(i * (total - 1) / 63) for i in range(64)]

idx = 0
frame_count = 0
while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break
        
    frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    
    # Check if this frame is needed
    if idx in target_indices:
        # Find which index (0-63) it corresponds to
        for i, t in enumerate(target_indices):
            if t == idx:
                img = Image.fromarray(frame_rgb)
                img.save(f'public/frames/{i:02d}.webp', 'WEBP', quality=90)
                frame_count += 1
                
    # Center frame is the last one
    if idx == total - 1:
        img = Image.fromarray(frame_rgb)
        img.save('public/frames/center.webp', 'WEBP', quality=90)
        
    idx += 1

cap.release()
print(f"Finished extracting all frames via Pillow.")
