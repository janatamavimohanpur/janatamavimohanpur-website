document.addEventListener('DOMContentLoaded', () => {

    // STEP 1: Apne Google Sheets ke CSV links yahan paste karein
    const coursesURL = 'PASTE_YOUR_COURSES_CSV_LINK_HERE';
    const noticesURL = 'PASTE_YOUR_NOTICES_CSV_LINK_HERE';
    const blogURL = 'PASTE_YOUR_BLOG_CSV_LINK_HERE';

    // Helper function to fetch and parse CSV data
    async function fetchData(url) {
        try {
            const response = await fetch(url);
            const csvText = await response.text();
            const lines = csvText.trim().split('\n');
            const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
            return lines.slice(1).map(line => {
                const values = line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g).map(v => v.trim().replace(/"/g, ''));
                let obj = {};
                headers.forEach((header, i) => {
                    obj[header] = values[i] || '';
                });
                return obj;
            });
        } catch (error) {
            console.error('Error fetching data from ' + url, error);
            return [];
        }
    }

    // Function to display Courses
    function displayCourses(courses) {
        const container = document.getElementById('courses-list');
        if (!courses || courses.length === 0) {
            container.innerHTML = '<p>No courses or materials available right now.</p>';
            return;
        }
        container.innerHTML = courses.map(course => `
            <div class="content-item">
                <h3>${course.Title}</h3>
                <div class="item-meta">
                    <span><strong>Class:</strong> ${course.Class}</span>
                    <span><strong>Subject:</strong> ${course.Subject}</span>
                </div>
                ${course.Images ? `<img src="${course.Images}" alt="${course.Title}">` : ''}
                <p class="item-description">${course.Description}</p>
                <div class="item-links">
                    ${course.PDF ? `<a href="${course.PDF}" target="_blank">Download PDF</a>` : ''}
                    ${course.Videos ? `<a href="${course.Videos}" target="_blank">Watch Video</a>` : ''}
                </div>
            </div>
        `).join('');
    }

    // Function to display Notices and Blog Posts
    function displayPosts(posts, containerId) {
        const container = document.getElementById(containerId);
        if (!posts || posts.length === 0) {
            container.innerHTML = `<p>No items to display.</p>`;
            return;
        }
        container.innerHTML = posts.map(post => `
             <div class="content-item">
                <h3>${post.Title}</h3>
                <div class="item-meta">
                    <span><strong>Date:</strong> ${post.Date}</span>
                </div>
                ${post.Images ? `<img src="${post.Images}" alt="${post.Title}">` : ''}
                <p class="item-description">${post.Description}</p>
                 <div class="item-links">
                    ${post.PDF ? `<a href="${post.PDF}" target="_blank">Download PDF</a>` : ''}
                    ${post.Videos ? `<a href="${post.Videos}" target="_blank">Watch Video</a>` : ''}
                </div>
            </div>
        `).join('');
    }
    
    // Fetch all data and populate the page
    async function loadWebsiteData() {
        const courses = await fetchData(coursesURL);
        displayCourses(courses);

        const notices = await fetchData(noticesURL);
        displayPosts(notices, 'notices-list');

        const blogPosts = await fetchData(blogURL);
        displayPosts(blogPosts, 'blog-posts');
    }

    loadWebsiteData();
});
