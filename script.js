document.addEventListener('DOMContentLoaded', () => {

    // --- URLs ---
    // STEP 1: Apne Google Sheets ke CSV links yahan paste karein
    const coursesURL = 'PASTE_YOUR_COURSES_CSV_LINK_HERE';
    const noticesURL = 'PASTE_YOUR_NOTICES_CSV_LINK_HERE';
    const blogURL = 'PASTE_YOUR_BLOG_CSV_LINK_HERE';
    // STEP 2: Apne Google Apps Script ka Web App URL yahan paste karein
    const contactFormURL = 'PASTE_YOUR_WEB_APP_URL_HERE';

    // --- Navigation Logic ---
    const navLinks = document.querySelectorAll('.nav-link');
    const pageSections = document.querySelectorAll('.page-section');

    function showPage(pageId) {
        pageSections.forEach(section => {
            section.classList.add('hidden');
            section.classList.remove('active');
        });
        document.getElementById(pageId).classList.add('active');
        document.getElementById(pageId).classList.remove('hidden');

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + pageId) {
                link.classList.add('active');
            }
        });
    }

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            showPage(targetId);
        });
    });

    // --- Data Fetching Logic ---
    async function fetchData(url) {
        try {
            const response = await fetch(url);
            const csvText = await response.text();
            const lines = csvText.trim().split('\n');
            const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
            return lines.slice(1).map(line => {
                const values = line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g).map(v => v.trim().replace(/"/g, ''));
                let obj = {};
                headers.forEach((header, i) => { obj[header] = values[i] || ''; });
                return obj;
            });
        } catch (error) { console.error('Error fetching data from ' + url, error); return []; }
    }

    // --- Dynamic Content Display ---
    function displayContent(data, containerId, type) {
        const container = document.getElementById(containerId);
        if (!data || data.length === 0) {
            container.innerHTML = '<p>No items to display at this moment.</p>';
            return;
        }
        let html = '';
        data.forEach(item => {
            let meta;
            if (type === 'course') meta = `<span><strong>Class:</strong> ${item.Class}</span><span><strong>Subject:</strong> ${item.Subject}</span>`;
            else meta = `<span><strong>Date:</strong> ${item.Date}</span>`;

            html += `
                <div class="content-item">
                    <h3>${item.Title}</h3>
                    <div class="item-meta">${meta}</div>
                    ${item.Images ? `<img src="${item.Images}" alt="${item.Title}" style="max-width:100%; height:auto; margin-bottom:1rem;">` : ''}
                    <p>${item.Description}</p>
                    <div class="item-links">
                        ${item.PDF ? `<a href="${item.PDF}" target="_blank">View PDF</a>` : ''}
                        ${item.Videos ? `<a href="${item.Videos}" target="_blank">Watch Video</a>` : ''}
                    </div>
                </div>`;
        });
        container.innerHTML = html;
    }

    // --- Contact Form Submission ---
    const form = document.getElementById('contact-form-element');
    const status = document.getElementById('form-status');
    form.addEventListener('submit', e => {
        e.preventDefault();
        status.textContent = 'Sending...';
        status.style.color = 'black';
        fetch(contactFormURL, { method: 'POST', body: new FormData(form) })
            .then(response => response.json())
            .then(data => {
                if (data.result === 'success') {
                    status.textContent = 'Message sent successfully!';
                    status.style.color = 'green';
                    form.reset();
                } else {
                    throw new Error(data.error || 'Unknown error');
                }
            })
            .catch(error => {
                status.textContent = 'Oops! There was a problem. Please try again.';
                status.style.color = 'red';
                console.error('Error!', error.message);
            });
    });

    // --- Initial Load ---
    async function initializeWebsite() {
        const courses = await fetchData(coursesURL);
        displayContent(courses, 'courses-list', 'course');
        
        const notices = await fetchData(noticesURL);
        displayContent(notices, 'notices-list', 'notice');
        
        const blogPosts = await fetchData(blogURL);
        displayContent(blogPosts, 'blog-posts', 'blog');
        
        showPage('home'); // Show home page by default
    }

    initializeWebsite();
});
