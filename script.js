document.addEventListener('DOMContentLoaded', () => {
    // --- STEP 1: PASTE YOUR 4 GOOGLE SHEET URLs HERE ---
    const coursesURL = 'PASTE_YOUR_COURSES_CSV_LINK_HERE';
    const noticesURL = 'PASTE_YOUR_NOTICES_CSV_LINK_HERE';
    const blogURL = 'PASTE_YOUR_BLOG_CSV_LINK_HERE';
    const contactFormURL = 'PASTE_YOUR_WEB_APP_URL_HERE';

    // --- Mobile Navigation Toggle ---
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            const isExpanded = navMenu.classList.contains('active');
            menuToggle.setAttribute('aria-expanded', isExpanded);
        });
    }

    // --- Dynamic Footer Year ---
    const yearSpan = document.getElementById('year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // --- Data Fetching Function ---
    async function fetchData(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.statusText}`);
            }
            const csvText = await response.text();
            
            // Handle case where CSV might be empty or malformed
            const lines = csvText.trim().split('\n');
            if (lines.length < 2) {
                return [];
            }
            
            const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
            const data = lines.slice(1).map(line => {
                const values = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g).map(v => v.trim().replace(/"/g, ''));
                let obj = {};
                headers.forEach((header, i) => {
                    obj[header] = values[i] || '';
                });
                return obj;
            });
            return data;
        } catch (error) {
            console.error('Error fetching data:', error);
            // Return an empty array to prevent application from crashing
            return [];
        }
    }

    // --- Dynamic Content Display Function ---
    function displayContent(data, containerId, type) {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (!data || data.length === 0) {
            container.innerHTML = '<p class="loading-message">No items to display at this time. Please check back later.</p>';
            return;
        }
        
        container.innerHTML = data.map((item, index) => {
            let iconClass, iconType;
            if (type === 'course') { 
                iconClass = 'fas fa-book-reader'; 
                iconType = 'course'; 
            } else if (type === 'notice') { 
                iconClass = 'fas fa-bell'; 
                iconType = 'notice'; 
            } else { 
                iconClass = 'fas fa-newspaper'; 
                iconType = 'blog'; 
            }
            
            const meta = (type === 'course') ? 
                `<div class="meta-item">Class: ${item.Class || 'N/A'} | Subject: ${item.Subject || 'N/A'}</div>` : 
                `<div class="meta-item">Date: ${item.Date || 'N/A'}</div>`;
            
            const imageHtml = item.Images ? 
                `<img src="${item.Images}" alt="${item.Title || 'Card image'}" class="card-image">` : 
                '';
            
            const pdfButton = item.PDF ? 
                `<a href="${item.PDF}" target="_blank" class="card-button pdf"><i class="fas fa-file-pdf"></i> PDF</a>` : 
                '';
            
            const videoButton = item.Videos ? 
                `<a href="${item.Videos}" target="_blank" class="card-button video"><i class="fas fa-video"></i> Video</a>` : 
                '';

            return `
                <div class="content-card scroll-animation" style="--delay: ${index * 100}ms;">
                    <div class="card-header">
                        <div class="card-icon-background ${iconType}">
                            <i class="${iconClass}" aria-hidden="true"></i>
                        </div>
                        <div class="card-title">
                            <h3>${item.Title || 'Untitled'}</h3>
                            ${meta}
                        </div>
                    </div>
                    <div class="card-body">
                        ${imageHtml}
                        <p class="card-description">${item.Description || 'No description available.'}</p>
                        <div class="card-links">
                            ${pdfButton}
                            ${videoButton}
                        </div>
                    </div>
                </div>`;
        }).join('');
        activateScrollAnimations();
    }

    // --- Contact Form Submission ---
    const form = document.getElementById('contact-form-element');
    const formStatus = document.getElementById('form-status');
    if (form && formStatus) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            formStatus.textContent = 'Sending...';
            formStatus.style.color = '#555';
            
            try {
                const response = await fetch(contactFormURL, {
                    method: 'POST',
                    body: new FormData(form),
                    mode: 'no-cors' // Use no-cors for Google Apps Script
                });
                
                // Since 'no-cors' doesn't allow checking response status, we assume success
                formStatus.textContent = 'Message Sent Successfully!';
                formStatus.style.color = 'green';
                form.reset();
                
            } catch (error) {
                console.error('Form submission error:', error);
                formStatus.textContent = 'Error sending message. Please try again.';
                formStatus.style.color = 'red';
            }
        });
    }

    // --- Scroll Animation Activation ---
    function activateScrollAnimations() {
        const animatedElements = document.querySelectorAll('.scroll-animation');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => { 
                if (entry.isIntersecting) { 
                    entry.target.classList.add('visible'); 
                    observer.unobserve(entry.target); 
                } 
            });
        }, { threshold: 0.1 });
        animatedElements.forEach(el => observer.observe(el));
    }

    // --- Page Initialization ---
    async function initializePage() {
        if (document.getElementById('courses-list')) { 
            const coursesData = await fetchData(coursesURL);
            displayContent(coursesData, 'courses-list', 'course');
        }
        if (document.getElementById('notices-list')) { 
            const noticesData = await fetchData(noticesURL);
            displayContent(noticesData, 'notices-list', 'notice');
        }
        if (document.getElementById('blog-posts')) { 
            const blogData = await fetchData(blogURL);
            displayContent(blogData, 'blog-posts', 'blog');
        }
        activateScrollAnimations();
    }

    initializePage();
});
