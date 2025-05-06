// static/js/script.js
document.addEventListener('DOMContentLoaded', function () {
    // DOM Elements
    const setLectureButton = document.getElementById('set-lecture');
    const lectureNameInput = document.getElementById('lecture-name');
    const currentLectureSpan = document.getElementById('current-lecture');
    const statusMessageSpan = document.getElementById('status-message');
    const personNameInput = document.getElementById('person-name');
    const personImageInput = document.getElementById('person-image');
    const uploadImageButton = document.getElementById('upload-image');
    const refreshAttendanceButton = document.getElementById('refresh-attendance');
    const attendanceRecordsDiv = document.getElementById('attendance-records');

    // Set Lecture Handler
    setLectureButton.addEventListener('click', function () {
        const lectureName = lectureNameInput.value.trim();

        if (!lectureName) {
            alert('Please enter a lecture name.');
            return;
        }

        fetch('/set_lecture', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ lecture_name: lectureName }),
        })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    currentLectureSpan.textContent = lectureName;
                    statusMessageSpan.textContent = 'Active - Recording Attendance';
                    statusMessageSpan.style.color = 'green';
                } else {
                    statusMessageSpan.textContent = 'Error: ' + data.message;
                    statusMessageSpan.style.color = 'red';
                }
            })
            .catch(error => {
                console.error('Error:', error);
                statusMessageSpan.textContent = 'Connection Error';
                statusMessageSpan.style.color = 'red';
            });
    });

    // Upload Image Handler
    uploadImageButton.addEventListener('click', function () {
        const name = personNameInput.value.trim();
        const imageFile = personImageInput.files[0];

        if (!name) {
            alert('Please enter a person name.');
            return;
        }

        if (!imageFile) {
            alert('Please select an image file.');
            return;
        }

        const formData = new FormData();
        formData.append('name', name);
        formData.append('image', imageFile);

        statusMessageSpan.textContent = 'Uploading and training...';
        statusMessageSpan.style.color = 'blue';

        fetch('/upload_image', {
            method: 'POST',
            body: formData,
        })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    statusMessageSpan.textContent = data.message;
                    statusMessageSpan.style.color = 'green';
                    personNameInput.value = '';
                    personImageInput.value = '';
                } else {
                    statusMessageSpan.textContent = 'Error: ' + data.message;
                    statusMessageSpan.style.color = 'red';
                }
            })
            .catch(error => {
                console.error('Error:', error);
                statusMessageSpan.textContent = 'Connection Error';
                statusMessageSpan.style.color = 'red';
            });
    });

    // Refresh Attendance Records Handler
    refreshAttendanceButton.addEventListener('click', function () {
        fetch('/get_attendance')
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    displayAttendanceRecords(data.data);
                } else {
                    attendanceRecordsDiv.innerHTML = `<p>Error: ${data.message}</p>`;
                }
            })
            .catch(error => {
                console.error('Error:', error);
                attendanceRecordsDiv.innerHTML = '<p>Failed to fetch attendance records.</p>';
            });
    });


    // new add from below 
    // function getActiveLectureTable() {
    //     const activeContent = document.querySelector('.lecture-content:not([style*="display: none"])');
    //     if (!activeContent) {
    //         alert('No active lecture selected!');
    //         return null;
    //     }
    //     return activeContent.querySelector('.attendance-table');
    // }
    
    // function exportToExcel() {
    //     const table = getActiveLectureTable();
    //     if (table) {
    //         const wb = XLSX.utils.table_to_book(table, { sheet: "Lecture Records" });
    //         XLSX.writeFile(wb, 'lecture_attendance.xlsx');
    //     }
    // }
    
    // function exportToPDF() {
    //     const table = getActiveLectureTable();
    //     if (table) {
    //         const lectureTitle = table.closest('.lecture-content').querySelector('h3')?.innerText || "Lecture PDF";
    //         const printWindow = window.open('', '', 'width=800,height=600');
    //         printWindow.document.write(`<html><head><title>${lectureTitle}</title></head><body>`);
    //         printWindow.document.write(`<h3>${lectureTitle}</h3>`);
    //         printWindow.document.write(table.outerHTML);
    //         printWindow.document.write('</body></html>');
    //         printWindow.document.close();
    //         printWindow.print();
    //     }
    // }
    
    // function printRecords() {
    //     const activeContent = document.querySelector('.lecture-content:not([style*="display: none"])');
    //     if (activeContent) {
    //         const printWindow = window.open('', '', 'width=900,height=650');
    //         printWindow.document.write('<html><head><title>Print Lecture Attendance</title></head><body>');
    //         printWindow.document.write(activeContent.innerHTML);
    //         printWindow.document.write('</body></html>');
    //         printWindow.document.close();
    //         printWindow.print();
    //     }
    // }

    // end here 




    // Function to display attendance records
    function displayAttendanceRecords(data) {
        if (Object.keys(data).length === 0) {
            attendanceRecordsDiv.innerHTML = '<p>No attendance records found.</p>';
            return;
        }

        let html = '<div class="lecture-tabs">';

        // Create tabs for each lecture
        Object.keys(data).forEach((lecture, index) => {
            html += `<div class="lecture-tab ${index === 0 ? 'active' : ''}" data-lecture="${lecture}">${lecture}</div>`;
        });

        html += '</div>';

        // Create tables for each lecture
        Object.keys(data).forEach((lecture, index) => {
            const records = data[lecture];

            html += `<div class="lecture-content" id="lecture-${lecture}" style="${index === 0 ? '' : 'display: none;'}">`;
            html += `<h3>${lecture} - ${records.length} Records</h3>`;

            if (records.length === 0) {
                html += '<p>No attendance records for this lecture.</p>';
            } else {
                html += `
                    <table class="attendance-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Date & Time</th>
                            </tr>
                        </thead>
                        <tbody>
                `;

                records.forEach(record => {
                    html += `
                        <tr>
                            <td>${record.name}</td>
                            <td>${record.timestamp}</td>
                        </tr>
                    `;
                });

                html += '</tbody></table>';
            }

            html += '</div>';
        });

        attendanceRecordsDiv.innerHTML = html;

        // Add event listeners to tabs
        document.querySelectorAll('.lecture-tab').forEach(tab => {
            tab.addEventListener('click', function () {
                const lecture = this.getAttribute('data-lecture');

                // Hide all content
                document.querySelectorAll('.lecture-content').forEach(content => {
                    content.style.display = 'none';
                });

                // Show selected content
                document.getElementById(`lecture-${lecture}`).style.display = 'block';

                // Update active tab
                document.querySelectorAll('.lecture-tab').forEach(t => {
                    t.classList.remove('active');
                });
                this.classList.add('active');
            });
        });
    }
});