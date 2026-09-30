import cv2
import os
import shutil

os.makedirs('public/frames', exist_ok=True)

cap = cv2.VideoCapture('public/character.mp4')
frames = []
while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break
    frames.append(frame)
cap.release()

# Keyframes mapping to 8 directions
# index 0: RIGHT (0 deg)
# index 1: DOWN-RIGHT (45 deg)
# index 2: DOWN (90 deg)
# index 3: DOWN-LEFT (135 deg)
# index 4: LEFT (180 deg)
# index 5: UP-LEFT (225 deg)
# index 6: UP (270 deg)
# index 7: UP-RIGHT (315 deg)

keyframe_indices = [71, 217, 212, 208, 60, 116, 16, 137]
center_idx = 239 # The end of the video

# Save center
cv2.imwrite('public/frames/center.webp', frames[center_idx], [cv2.IMWRITE_WEBP_QUALITY, 90])

# Generate 64 frames
for i in range(64):
    angle = i * (360 / 64)
    # Find which of the 8 keyframes is closest
    # The 8 keyframes are at 0, 45, 90, 135, 180, 225, 270, 315
    best_k = int(round(angle / 45.0)) % 8
    
    frame_to_write = frames[keyframe_indices[best_k]]
    
    cv2.imwrite(f'public/frames/{i:02d}.webp', frame_to_write, [cv2.IMWRITE_WEBP_QUALITY, 90])

print("Extracted 64 frames + center.webp to public/frames/")
