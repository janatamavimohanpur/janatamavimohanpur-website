document.addEventListener('DOMContentLoaded', () => {
    // --- STEP 1: PASTE YOUR 4 GOOGLE SHEET URLs HERE ---
    const coursesURL = 'PASTE_YOUR_COURSES_CSV_LINK_HERE';
    const noticesURL = 'PASTE_YOUR_NOTICES_CSV_LINK_HERE';
    const blogURL = 'PASTE_YOUR_BLOG_CSV_LINK_HERE';
    const contactFormURL = 'PASTE_YOUR_WEB_APP_URL_HERE';

    // --- Data Fetching Function ---
    async function fetchData(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Network response error from ${url}`);
            const csvText = await response.text();
            const lines = csvText.trim().split('\n');
            const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
            return lines.slice(1).map(line => {
                const values = line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g).map(v => v.trim().replace(/"/g, ''));
                let obj = {};
                headers.forEach((header, i) => { obj[header] = values[i] || ''; });
                return obj;
            });
        } catch (error) { console.error('Error fetching data:', error); return []; }
    }

    // --- Dynamic Content Display Function ---
    function displayContent(data, containerId, type) {
        const container = document.getElementById(containerId);
        if (!container) return;
        if (!data || data.length === 0) { container.innerHTML = '<p class="loading-message">No items to display.</p>'; return; }
        container.innerHTML = data.map((item, index) => {
            let iconClass, iconType;
            if (type === 'course') { iconClass = 'fas fa-book-reader'; iconType = 'course'; }
            else if (type === 'notice') { iconClass = 'fas fa-bell'; iconType = 'notice'; }
            else { iconClass = 'fas fa-newspaper'; iconType = 'blog'; }
            const meta = (type === 'course') ? `<div class="meta-item">Class: ${item.Class} | Subject: ${item.Subject}</div>` : `<div class="meta-item">Date: ${item.Date}</div>`;
            return `
                <div class="content-card scroll-animation" style="--delay: ${index * 100}ms;">
                    <div class="card-header">
                        <div class="card-icon-background ${iconType}"><i class="${iconClass}"></i></div>
                        <div class="card-title"><h3>${item.Title}</h3>${meta}</div>
                    </div>
                    <div class="card-body">
                        ${item.Images ? `<img src="${item.Images}" alt="${item.Title}" class="card-image">` : ''}
                        <p class="card-description">${item.Description}</p>
                        <div class="card-links">
                            ${item.PDF ? `<a href="${item.PDF}" target="_blank" class="card-button pdf"><i class="fas fa-file-pdf"></i> PDF</a>` : ''}
                            ${item.Videos ? `<a href="${item.Videos}" target="_blank" class="card-button video"><i class="fas fa-video"></i> Video</a>` : ''}
                        </div>
                    </div>
                </div>`;
        }).join('');
        activateScrollAnimations();
    }

    // --- Contact Form Submission ---
    const form = document.getElementById('contact-form-element');
    if (form) {
        form.addEventListener('submit', e => {
            e.preventDefault();
            const status = document.getElementById('form-status');
            status.textContent = 'Sending...';
            fetch(contactFormURL, { method: 'POST', body: new FormData(form) })
            .then(res => res.json()).then(data => {
                if (data.result === 'success') { status.textContent = 'Message Sent!'; status.style.color = 'green'; form.reset(); }
                else { throw new Error(data.error); }
            }).catch(error => { status.textContent = 'Error sending message.'; status.style.color = 'red'; });
        });
    }

    // --- Scroll Animation Activation ---
    function activateScrollAnimations() {
        const animatedElements = document.querySelectorAll('.scroll-animation');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); } });
        }, { threshold: 0.1 });
        animatedElements.forEach(el => observer.observe(el));
    }

    // --- Page Initialization ---
    async function initializePage() {
        if (document.getElementById('courses-list')) { displayContent(await fetchData(coursesURL), 'courses-list', 'course'); }
        if (document.getElementById('notices-list')) { displayContent(await fetchData(noticesURL), 'notices-list', 'notice'); }
        if (document.getElementById('blog-posts')) { displayContent(await fetchData(blogURL), 'blog-posts', 'blog'); }
        activateScrollAnimations();
    }

    initializePage();
});
