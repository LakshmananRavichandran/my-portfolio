import cv2
import numpy as np

cap = cv2.VideoCapture('public/character.mp4')
frames = []
while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break
    frames.append(cv2.resize(frame, (160, 90)))
cap.release()

# We have 240 frames. Let's create a 16 columns x 15 rows grid.
grid_w, grid_h = 16, 15
cell_w, cell_h = 160, 90

grid_img = np.zeros((grid_h * cell_h, grid_w * cell_w, 3), dtype=np.uint8)

for i, f in enumerate(frames):
    r = i // grid_w
    c = i % grid_w
    
    # put text on the frame
    cv2.putText(f, str(i), (5, 20), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)
    
    grid_img[r*cell_h:(r+1)*cell_h, c*cell_w:(c+1)*cell_w] = f

cv2.imwrite('grid.jpg', grid_img)
print("Saved grid.jpg")
