document.addEventListener('DOMContentLoaded', () => {

    // STEP 1: Apne saare 4 URLs yahan daalein
    const coursesURL = 'PASTE_YOUR_COURSES_CSV_LINK_HERE';
    const noticesURL = 'PASTE_YOUR_NOTICES_CSV_LINK_HERE';
    const blogURL = 'PASTE_YOUR_BLOG_CSV_LINK_HERE';
    const contactFormURL = 'PASTE_YOUR_WEB_APP_URL_HERE';

    // Yeh function Google Sheet se data laata hai
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

    // Yeh function data ko HTML mein badal kar page par dikhata hai
    function displayContent(data, containerId, type) {
        const container = document.getElementById(containerId);
        // YEH LINE SABSE ZAROORI HAI: Agar container (div) page par nahi hai, to function kuch nahi karega.
        if (!container) {
            return; 
        }

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
    
    // --- Page-specific Logic ---
    // Yeh function check karta hai ki kaun sa page khula hai aur usi ka data laata hai.
    async function initializePage() {
        // Agar 'courses-list' ID wala div milega, tabhi courses ka data load hoga.
        if (document.getElementById('courses-list')) {
            const courses = await fetchData(coursesURL);
            displayContent(courses, 'courses-list', 'course');
        }
        // Agar 'notices-list' ID wala div milega, tabhi notices ka data load hoga.
        if (document.getElementById('notices-list')) {
            const notices = await fetchData(noticesURL);
            displayContent(notices, 'notices-list', 'notice');
        }
        // Agar 'blog-posts' ID wala div milega, tabhi blog ka data load hoga.
        if (document.getElementById('blog-posts')) {
            const blogPosts = await fetchData(blogURL);
            displayContent(blogPosts, 'blog-posts', 'blog');
        }
    }

    // --- Contact Form ka Logic (Yeh sirf contact.html par chalega) ---
    const form = document.getElementById('contact-form-element');
    if (form) { // Agar form milega, tabhi yeh code chalega
        form.addEventListener('submit', e => {
            e.preventDefault();
            const status = document.getElementById('form-status');
            status.textContent = 'Sending...';
            // Baaki ka form submit logic...
            fetch(contactFormURL, { method: 'POST', body: new FormData(form) })
            .then(response => response.json())
            .then(data => {
                if(data.result === 'success') {
                    status.textContent = 'Message sent successfully!'; status.style.color = 'green'; form.reset();
                } else { throw new Error(data.error); }
            })
            .catch(error => {
                status.textContent = 'Oops! There was a problem.'; status.style.color = 'red';
            });
        });
    }

    // Script shuru karo
    initializePage();
});
