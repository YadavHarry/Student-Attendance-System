from flask import Flask, render_template, Response, request, jsonify
import cv2
import os
import time

app = Flask(__name__)

# Global variables
camera = None
is_capturing = False
captured_frame = None
image_folder = 'images'

# Ensure directory exists
if not os.path.exists(image_folder):
    os.makedirs(image_folder)

def generate_frames():
    global camera, is_capturing, captured_frame
    
    if camera is None:
        camera = cv2.VideoCapture(0)
    
    while True:
        success, frame = camera.read()
        if not success:
            break
        
        # Draw a face area guide
        height, width = frame.shape[:2]
        center_x, center_y = width // 2, height // 2
        face_size = min(width, height) // 2
        
        # Draw a rectangle as a guide for face positioning
        cv2.rectangle(frame, 
                     (center_x - face_size//2, center_y - face_size//2),
                     (center_x + face_size//2, center_y + face_size//2),
                     (0, 255, 0), 2)
        
        # Add instruction text
        cv2.putText(frame, "Position face in green box and click 'Capture'", 
                   (30, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
        
        # If capture button was pressed, save this frame
        if is_capturing:
            captured_frame = frame.copy()
            is_capturing = False
            
        ret, buffer = cv2.imencode('.jpg', frame)
        frame_bytes = buffer.tobytes()
        
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

@app.route('/')
def index():
    return render_template('face_capture.html')

@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(), 
                   mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/capture', methods=['POST'])
def capture():
    global is_capturing
    is_capturing = True
    
    # Wait a bit to make sure the frame is captured
    time.sleep(0.2)
    
    return jsonify({"status": "success", "message": "Image captured"})

@app.route('/save', methods=['POST'])
def save_image():
    global captured_frame
    
    if captured_frame is None:
        return jsonify({"status": "error", "message": "No image captured"})
    
    data = request.get_json()
    student_name = data.get('name')
    
    if not student_name:
        return jsonify({"status": "error", "message": "Student name is required"})
    
    # Save the image with student name
    image_path = os.path.join(image_folder, f"{student_name}.jpg")
    cv2.imwrite(image_path, captured_frame)
    
    return jsonify({
        "status": "success", 
        "message": f"Image saved as {student_name}.jpg",
        "path": image_path
    })

if __name__ == '__main__':
    app.run(debug=True, port=5001)  # Using a different port than your main app