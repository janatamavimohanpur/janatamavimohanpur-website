// Function to toggle the mobile navigation menu
const toggleMenu = () => {
    const navMenu = document.querySelector('.nav-menu');
    const menuToggle = document.querySelector('.menu-toggle');
    navMenu.classList.toggle('active');
    const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true' || false;
    menuToggle.setAttribute('aria-expanded', !isExpanded);
};

// Event listener for the menu toggle button
document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', toggleMenu);
    }
});

// Function to handle the year in the footer
const setFooterYear = () => {
    const yearElement = document.getElementById('year');
    if (yearElement) {
        const currentYear = new Date().getFullYear();
        yearElement.textContent = currentYear;
    }
};

// Intersection Observer for scroll animations
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.1 });

// Function to observe all elements with the 'scroll-animation' class
const animateOnScroll = () => {
    const animatedElements = document.querySelectorAll('.scroll-animation');
    animatedElements.forEach(el => observer.observe(el));
};

// Function to fetch and display content from a Google Sheet
const fetchData = async (sheetUrl, containerId, cardGenerator, pageName) => {
    const container = document.getElementById(containerId);
    if (!container) return;

    try {
        const response = await fetch(sheetUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.text();
        const rows = data.split('\n').slice(1).filter(row => row.trim() !== '');
        
        container.innerHTML = ''; // Clear loading message

        if (rows.length === 0) {
            container.innerHTML = `<p class="error-message">No ${pageName} available at the moment.</p>`;
            return;
        }

        const fragment = document.createDocumentFragment();
        rows.forEach(row => {
            const columns = row.split(',').map(col => col.trim());
            const card = cardGenerator(columns);
            if (card) {
                fragment.appendChild(card);
            }
        });
        container.appendChild(fragment);

    } catch (error) {
        console.error(`Failed to fetch data for ${pageName}:`, error);
        container.innerHTML = `<p class="error-message">Could not load ${pageName}. Please try again later.</p>`;
    }
};

// Card generation functions for each page
const createCourseCard = (data) => {
    if (data.length < 4) return null;
    const [id, title, description, pdfUrl, videoUrl] = data;
    const card = document.createElement('div');
    card.className = 'content-card scroll-animation';
    card.innerHTML = `
        <div class="card-header">
            <div class="card-icon-background course">
                <i class="fas fa-book-open" aria-hidden="true"></i>
            </div>
            <div class="card-title">
                <h3>${title}</h3>
                <span class="meta-item">Course ID: ${id}</span>
            </div>
        </div>
        <div class="card-body">
            <p class="card-description">${description}</p>
            <div class="card-links">
                ${pdfUrl ? `<a href="${pdfUrl}" class="card-button pdf" target="_blank" rel="noopener noreferrer"><i class="fas fa-file-pdf"></i> View PDF</a>` : ''}
                ${videoUrl ? `<a href="${videoUrl}" class="card-button video" target="_blank" rel="noopener noreferrer"><i class="fas fa-video"></i> Watch Video</a>` : ''}
            </div>
        </div>
    `;
    return card;
};

const createNoticeCard = (data) => {
    if (data.length < 3) return null;
    const [title, date, description] = data;
    const card = document.createElement('div');
    card.className = 'content-card scroll-animation';
    card.innerHTML = `
        <div class="card-header">
            <div class="card-icon-background notice">
                <i class="fas fa-bullhorn" aria-hidden="true"></i>
            </div>
            <div class="card-title">
                <h3>${title}</h3>
                <span class="meta-item"><i class="fas fa-calendar-alt"></i> ${date}</span>
            </div>
        </div>
        <div class="card-body">
            <p class="card-description">${description}</p>
        </div>
    `;
    return card;
};

const createBlogCard = (data) => {
    if (data.length < 4) return null;
    const [title, date, imageUrl, content] = data;
    const card = document.createElement('div');
    card.className = 'content-card scroll-animation';
    card.innerHTML = `
        <div class="card-header">
            <div class="card-icon-background blog">
                <i class="fas fa-newspaper" aria-hidden="true"></i>
            </div>
            <div class="card-title">
                <h3>${title}</h3>
                <span class="meta-item"><i class="fas fa-calendar-alt"></i> ${date}</span>
            </div>
        </div>
        <div class="card-body">
            <img src="${imageUrl}" alt="${title}" class="card-image">
            <p class="card-description">${content}</p>
        </div>
    `;
    return card;
};

// Main function to run on page load
const initializePage = () => {
    setFooterYear();
    animateOnScroll();

    const coursesSheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR6z-17vU9V3X1k7P_X1K1_z1K8X1q3V7G5G1Q1z2-3I1A5_2Z/pub?gid=0&single=true&output=csv';
    const noticesSheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ5gY-8o1B7X5O5H1c4H6F2G6H2S0T1I1W2M1S/pub?gid=0&single=true&output=csv';
    const blogSheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS5E-W3X6S8W7F3G8H2K3P7P7U7Y4/pub?gid=0&single=true&output=csv';

    if (document.getElementById('courses-list')) {
        fetchData(coursesSheetUrl, 'courses-list', createCourseCard, 'courses');
    }
    if (document.getElementById('notices-list')) {
        fetchData(noticesSheetUrl, 'notices-list', createNoticeCard, 'notices');
    }
    if (document.getElementById('blog-posts')) {
        fetchData(blogSheetUrl, 'blog-posts', createBlogCard, 'blog posts');
    }

    // Handle contact form submission
    const contactForm = document.getElementById('contact-form-element');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formStatus = document.getElementById('form-status');
            const formData = new FormData(contactForm);
            formStatus.textContent = 'Sending...';
            
            try {
                // Replace with your actual form submission endpoint (e.g., Google Sheets, Formspree, etc.)
                const response = await fetch('YOUR_FORM_SUBMISSION_ENDPOINT', {
                    method: 'POST',
                    body: formData,
                    mode: 'no-cors' // Use 'no-cors' if you are submitting to a service like Formspree
                });

                formStatus.textContent = 'Message sent successfully! We will get back to you shortly.';
                formStatus.style.color = 'green';
                contactForm.reset();

            } catch (error) {
                console.error('Form submission error:', error);
                formStatus.textContent = 'Failed to send message. Please try again.';
                formStatus.style.color = 'red';
            }
        });
    }
};

window.addEventListener('load', initializePage);
