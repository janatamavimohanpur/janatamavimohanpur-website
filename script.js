document.addEventListener('DOMContentLoaded', () => {

    // --- URLs ---
    const coursesURL = 'PASTE_YOUR_COURSES_CSV_LINK_HERE';
    const noticesURL = 'PASTE_YOUR_NOTICES_CSV_LINK_HERE';
    const blogURL = 'PASTE_YOUR_BLOG_CSV_LINK_HERE';
    const contactFormURL = 'PASTE_YOUR_WEB_APP_URL_HERE';

    // Helper function to fetch and parse CSV data
    async function fetchData(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Network response was not ok');
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

    // Function to display content dynamically
    function displayContent(data, containerId, type) {
        const container = document.getElementById(containerId);
        if (!container) return; // If the container doesn't exist on this page, do nothing

        if (!data || data.length === 0) {
            container.innerHTML = '<p>No items to display at this moment.</p>';
            return;
        }

        container.innerHTML = data.map(item => {
            let meta = (type === 'course')
                ? `<span><strong>Class:</strong> ${item.Class}</span><span><strong>Subject:</strong> ${item.Subject}</span>`
                : `<span><strong>Date:</strong> ${item.Date}</span>`;

            return `
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
        }).join('');
    }
    
    // --- Page-specific logic ---
    // This will check which page is loaded and fetch the correct data
    async function initializePage() {
        if (document.getElementById('courses-list')) {
            const courses = await fetchData(coursesURL);
            displayContent(courses, 'courses-list', 'course');
        }
        if (document.getElementById('notices-list')) {
            const notices = await fetchData(noticesURL);
            displayContent(notices, 'notices-list', 'notice');
        }
        if (document.getElementById('blog-posts')) {
            const blogPosts = await fetchData(blogURL);
            displayContent(blogPosts, 'blog-posts', 'blog');
        }
    }

    // --- Contact Form Submission (only runs if the form exists on the page) ---
    const form = document.getElementById('contact-form-element');
    if (form) {
        form.addEventListener('submit', e => {
            e.preventDefault();
            const status = document.getElementById('form-status');
            status.textContent = 'Sending...';
            status.style.color = 'black';
            fetch(contactFormURL, { method: 'POST', body: new FormData(form) })
                .then(response => response.json())
                .then(data => {
                    if (data.result === 'success') {
                        status.textContent = 'Message sent successfully!';
                        status.style.color = 'green';
                        form.reset();
                    } else { throw new Error(data.error); }
                })
                .catch(error => {
                    status.textContent = 'Oops! There was a problem. Please try again.';
                    status.style.color = 'red';
                });
        });
    }

    // --- Run the initialization ---
    initializePage();
});
