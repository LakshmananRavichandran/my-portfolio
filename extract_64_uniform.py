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

total = len(frames)
if total == 0:
    print("No frames found!")
    exit()

def safe_imwrite(path, frame):
    # Try WebP first
    success = cv2.imwrite(path, frame)
    if not success:
        print(f"Failed to save {path}, trying alternative...")
        # If WebP fails, try again or fallback to another quality
        success = cv2.imwrite(path, frame, [cv2.IMWRITE_WEBP_QUALITY, 80])
    if not success:
        # Fallback to PNG and rename to WebP (not ideal but works if encoding is broken)
        print(f"Total failure for {path}. Skipping.")

for i in range(64):
    idx = int(i * (total - 1) / 63)
    safe_imwrite(f'public/frames/{i:02d}.webp', frames[idx])

safe_imwrite('public/frames/center.webp', frames[-1])

print(f"Finished extracting.")
