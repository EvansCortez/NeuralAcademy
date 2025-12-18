// ALL ELEMENTS
const uploadBtn = document.getElementById('upload-btn');
const pdfFile = document.getElementById('pdf-file');
const statusDiv = document.getElementById('upload-status');
const previewSection = document.getElementById('preview-section');
const imageSection = document.getElementById('image-section');
const studySection = document.getElementById('study-section');
const studyBtn = document.getElementById('study-btn');
const textPreview = document.getElementById('text-preview');
const fileInfo = document.getElementById('file-info');
const studyContent = document.getElementById('study-content');
const imageGallery = document.getElementById('image-gallery');
const imageCount = document.getElementById('image-count');

// UPLOAD EVENT LISTENERS
uploadBtn.addEventListener('click', uploadPDF);
pdfFile.addEventListener('change', uploadPDF);

async function uploadPDF() {
    const file = pdfFile.files[0];
    if (!file) return statusDiv.textContent = '❌ Please select a PDF file';
    
    const formData = new FormData();
    formData.append('file', file);
    
    statusDiv.textContent = '⏳ Processing PDF...';
    uploadBtn.disabled = true;
    hideAllSections();
    
    try {
        const res = await fetch('http://127.0.0.1:8000/upload', {
            method: 'POST',
            body: formData
        });
        
        const data = await res.json();
        
        if (res.ok) {
            statusDiv.textContent = `✅ Success! ${data.pages} pages processed`;
            showPreview(data);
        } else {
            statusDiv.textContent = `❌ Error: ${data.detail}`;
        }
    } catch (error) {
        statusDiv.textContent = '❌ Backend not running? Start with: cd backend && python3 01-main.py';
        console.error(error);
    }
    
    uploadBtn.disabled = false;
}

function showPreview(data) {
    // FILE INFO
    fileInfo.innerHTML = `
        <div><strong>📁 Filename:</strong><br>${data.filename}</div>
        <div><strong>📚 Title:</strong><br>${data.title}</div>
        <div><strong>✍️ Author:</strong><br>${data.author}</div>
        <div><strong>📄 Pages:</strong><br>${data.pages}</div>
        <div><strong>🖼️ Images:</strong><br>${data.images?.length || 0}</div>
    `;
    
    // TEXT PREVIEW
    textPreview.textContent = data.preview || 'No text found';
    previewSection.classList.remove('hidden');
    studyBtn.disabled = false;
    
    // IMAGES
    if (data.images && data.images.length > 0) {
        imageCount.textContent = data.images.length;
        imageGallery.innerHTML = data.images.map((img, i) => `
            <div>
                <img src="data:image/png;base64,${img.base64}" 
                     alt="Page ${img.page} - Image ${img.index}"
                     title="Page ${img.page}, Image ${img.index}">
                <div class="image-info">
                    Page ${img.page} • ${img.width}x${img.height}
                </div>
            </div>
        `).join('');
        imageSection.classList.remove('hidden');
    }
}

studyBtn.addEventListener('click', async () => {
    studyBtn.disabled = true;
    studyBtn.textContent = 'Generating...';
    
    try {
        const res = await fetch('http://127.0.0.1:8000/study-sheet', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({text: textPreview.textContent})
        });
        
        const sheet = await res.json();
        studyContent.innerHTML = `
            <div style="background: #fff3cd; padding: 1.5rem; border-radius: 10px; margin: 1rem 0;">
                <h3 style="color: #856404;">💡 Main Idea</h3>
                <p>${sheet.main_idea}</p>
            </div>
            <div style="background: #d1ecf1; padding: 1.5rem; border-radius: 10px;">
                <h3 style="color: #0c5460;">🔑 Key Concepts</h3>
                <p>${sheet.concepts.join(', ')}</p>
            </div>
            <div style="font-style: italic; color: #6c757d; padding: 1rem; text-align: center;">
                ${sheet.examples.join(' | ')}
            </div>
        `;
        studySection.classList.remove('hidden');
    } catch (e) {
        studyContent.textContent = 'Study sheet generation failed';
    }
    
    studyBtn.disabled = false;
    studyBtn.textContent = '✨ Generate Study Sheet';
});

function hideAllSections() {
    previewSection.classList.add('hidden');
    imageSection.classList.add('hidden');
    studySection.classList.add('hidden');
}
