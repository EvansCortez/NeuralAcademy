// 12-main.js
const fileInput = document.getElementById('pdf-file');
const uploadBtn = document.getElementById('upload-btn');
const uploadStatus = document.getElementById('upload-status');

const previewSection = document.getElementById('preview-section');
const fileInfoDiv = document.getElementById('file-info');
const textPreview = document.getElementById('text-preview');
const studyBtn = document.getElementById('study-btn');

const imageSection = document.getElementById('image-section');
const imageCountSpan = document.getElementById('image-count');
const imageGallery = document.getElementById('image-gallery');

const studySection = document.getElementById('study-section');
const studyContent = document.getElementById('study-content');

let lastFullText = '';


function setStatus(message, type = 'info') {
  uploadStatus.textContent = message;

  if (type === 'success') {
    uploadStatus.style.color = '#166534';
  } else if (type === 'error') {
    uploadStatus.style.color = '#b91c1c';
  } else {
    uploadStatus.style.color = '#374151';
  }
}


async function uploadPdf() {
  const file = fileInput.files[0];
  if (!file) {
    setStatus('Please choose a PDF first.', 'error');
    return;
  }

  if (!file.name.toLowerCase().endsWith('.pdf')) {
    setStatus('File must be a PDF.', 'error');
    return;
  }

  const formData = new FormData();
  formData.append('file', file);

  uploadBtn.disabled = true;
  studyBtn.disabled = true;
  setStatus('Uploading and processing PDF…', 'info');

  try {
    const res = await fetch('http://127.0.0.1:8000/upload', {
      method: 'POST',
      body: formData
    });

    if (!res.ok) {
      throw new Error(`Server error: ${res.status}`);
    }

    const data = await res.json();

    // File info (uses page_count from backend)
    fileInfoDiv.innerHTML = `
      <div><strong>File:</strong> ${data.filename || file.name}</div>
      <div><strong>Title:</strong> ${data.title || 'Untitled Document'}</div>
      <div><strong>Pages:</strong> ${data.page_count ?? 'N/A'}</div>
    `;

    // Text preview (uses text_preview + full_text)
    textPreview.textContent = data.text_preview || '';
    lastFullText = data.full_text || data.text_preview || '';

    // Images (uses base64 images from backend)
    const images = data.images || [];
    if (images.length > 0) {
      imageSection.classList.remove('hidden');
      imageCountSpan.textContent = images.length.toString();
      imageGallery.innerHTML = images
        .map(img => `
          <div>
            <img src="data:image/png;base64,${img.base64}"
                 alt="Page ${img.page} Image ${img.index}">
            <div class="image-info">Page ${img.page}, Image ${img.index}</div>
          </div>
        `)
        .join('');
    } else {
      imageSection.classList.add('hidden');
      imageGallery.innerHTML = '';
      imageCountSpan.textContent = '0';
    }

    previewSection.classList.remove('hidden');
    studySection.classList.add('hidden');
    setStatus(`Success! Processed ${data.page_count ?? '?'} pages.`, 'success');
    studyBtn.disabled = !lastFullText;

  } catch (err) {
    console.error(err);
    setStatus('Failed to upload or process PDF. Check if the backend is running.', 'error');
    previewSection.classList.add('hidden');
    imageSection.classList.add('hidden');
    studySection.classList.add('hidden');
  } finally {
    uploadBtn.disabled = false;
  }
}


async function generateStudySheet() {
  if (!lastFullText) return;

  studyBtn.disabled = true;
  studyContent.innerHTML = '<p>Generating study sheet…</p>';
  studySection.classList.remove('hidden');

  try {
    const res = await fetch('http://127.0.0.1:8000/generate-study-sheet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: lastFullText })
    });

    if (!res.ok) {
      throw new Error(`Server error: ${res.status}`);
    }

    const sheet = await res.json();

    const sectionsHtml = (sheet.sections || [])
      .map(sec => `
        <div class="study-section-card">
          <h4>${sec.title}</h4>
          <p>${sec.summary}</p>
          <ul>
            ${(sec.key_terms || []).map(t => `<li>${t}</li>`).join('')}
          </ul>
        </div>
      `)
      .join('');

    const questionsHtml =
      (sheet.questions || [])
        .map(q => `<li>${q}</li>`)
        .join('') || '<li>No questions generated.</li>';

    const tipsHtml =
      (sheet.tips || [])
        .map(t => `<li>${t}</li>`)
        .join('') || '<li>No tips available.</li>';

    studyContent.innerHTML = `
      <h3>Main Idea</h3>
      <p>${sheet.main_idea || 'No main idea available.'}</p>

      <h3>Sections</h3>
      ${sectionsHtml || '<p>No sections detected.</p>'}

      <h3>Practice Questions</h3>
      <ul>${questionsHtml}</ul>

      <h3>Study Tips</h3>
      <ul>${tipsHtml}</ul>

      <p style="margin-top:0.75rem;font-size:0.8rem;color:#6b7280;">
        Phase: ${sheet.phase || '2-structured-fake-ai'}
      </p>
    `;
  } catch (err) {
    console.error(err);
    studyContent.innerHTML = '<p style="color:#b91c1c;">Failed to generate study sheet.</p>';
  } finally {
    studyBtn.disabled = false;
  }
}

uploadBtn.addEventListener('click', uploadPdf);
studyBtn.addEventListener('click', generateStudySheet);
