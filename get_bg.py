import cv2

cap = cv2.VideoCapture('public/character.mp4')
ret, frame = cap.read()
if ret:
    bg_color = frame[0, 0] # BGR
    print(f"Background color (BGR): {bg_color}")
    print(f"Background color (RGB hex): #{bg_color[2]:02x}{bg_color[1]:02x}{bg_color[0]:02x}")
cap.release()
