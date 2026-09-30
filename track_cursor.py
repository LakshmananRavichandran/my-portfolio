import cv2
import numpy as np

cap = cv2.VideoCapture('public/character.mp4')
frame_idx = 0

cursor_positions = []

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break
    
    # The cursor is a very bright white shape, possibly with a black border.
    # Let's convert to grayscale and threshold to find very bright spots.
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    
    # Cursor is usually #ffffff or close to it. Let's look for pixels > 240.
    _, thresh = cv2.threshold(gray, 245, 255, cv2.THRESH_BINARY)
    
    # We can also just look at the top-left to top-right to bottom-left to bottom-right,
    # but the character's face might also have some bright spots (like the eyes).
    # Let's find contours.
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    best_pt = None
    best_area = 0
    for cnt in contours:
        area = cv2.contourArea(cnt)
        if 10 < area < 1000: # cursor is small but not tiny
            M = cv2.moments(cnt)
            if M['m00'] != 0:
                cx = int(M['m10']/M['m00'])
                cy = int(M['m01']/M['m00'])
                # avoid character face which is roughly centered
                # face is around x: 800-1100, y: 300-700
                if 700 < cx < 1200 and 200 < cy < 800:
                    continue
                if area > best_area:
                    best_area = area
                    best_pt = (cx, cy)
    
    if best_pt:
        cursor_positions.append((frame_idx, best_pt[0], best_pt[1]))
    else:
        # maybe it's over the face or something
        pass
        
    frame_idx += 1

cap.release()

import json
with open('cursor_data.json', 'w') as f:
    json.dump(cursor_positions, f)
print("Found", len(cursor_positions), "cursor positions out of", frame_idx, "frames.")
