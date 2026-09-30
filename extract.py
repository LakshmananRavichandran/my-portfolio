import cv2
import os

cap = cv2.VideoCapture('public/character.mp4')
count = 0
while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break
    if count % 12 == 0:
        cv2.imwrite(f'temp_frames/frame_{count:03d}.jpg', frame)
    count += 1
cap.release()
