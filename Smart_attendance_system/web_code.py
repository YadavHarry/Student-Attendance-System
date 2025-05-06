from flask import Flask, render_template, Response, request
import cv2

app = Flask(__name__)
camera = cv2.VideoCapture(0)
lecture_name = ""

# Dummy face recognition function
def recognize_faces(frame):
    # Your logic to detect face, match, and update info
    return "John Doe", frame

@app.route('/')
def index():
    return render_template('attendance.html', lecture=lecture_name)

@app.route('/start', methods=['POST'])
def start_attendance():
    global lecture_name
    lecture_name = request.form['lecture']
    return render_template('attendance.html', lecture=lecture_name)

def generate_frames():
    while True:
        success, frame = camera.read()
        if not success:
            break
        else:
            name, processed_frame = recognize_faces(frame)
            # Encode frame as JPEG
            ret, buffer = cv2.imencode('.jpg', processed_frame)
            frame = buffer.tobytes()
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

if __name__ == "__main__":
    app.run(debug=True)
