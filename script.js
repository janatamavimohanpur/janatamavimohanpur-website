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
    
    // Close mobile menu when clicking on a link
    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            document.querySelector('.nav-menu').classList.remove('active');
            document.querySelector('.menu-toggle').setAttribute('aria-expanded', 'false');
        });
    });
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
        // For demonstration purposes, we'll simulate data
        // In a real implementation, you would fetch from Google Sheets
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate loading
        
        // Simulated data based on page type
        let simulatedData = [];
        if (pageName === 'courses') {
            simulatedData = [
                ['C001', 'Class 1-5 Elementary Education', 'Our elementary program focuses on building strong foundations in literacy, numeracy, and social skills through interactive learning methods.', 'https://example.com/syllabus.pdf', 'https://example.com/sample-class.mp4'],
                ['C002', 'Bachelor of Education (B.Ed.)', 'Our B.Ed. program prepares future educators with both theoretical knowledge and practical teaching experience in modern educational methodologies.', 'https://example.com/bed-syllabus.pdf', 'https://example.com/bed-overview.mp4']
            ];
        } else if (pageName === 'notices') {
            simulatedData = [
                ['Annual Sports Day', 'December 15, 2023', 'All students are invited to participate in our Annual Sports Day event. Registration forms available at the administration office.'],
                ['Parent-Teacher Meeting', 'November 30, 2023', 'Quarterly parent-teacher meeting will be held on November 30. Please schedule your appointment with the class teacher.']
            ];
        } else if (pageName === 'blog posts') {
            simulatedData = [
                ['Science Fair 2023 Results', 'October 20, 2023', 'https://via.placeholder.com/600x400.png?text=Science+Fair+2023', 'Our annual science fair showcased innovative projects from students across all grades. Congratulations to all participants and winners!']
            ];
        }
        
        container.innerHTML = ''; // Clear loading message

        if (simulatedData.length === 0) {
            container.innerHTML = `<p class="error-message">No ${pageName} available at the moment.</p>`;
            return;
        }

        const fragment = document.createDocumentFragment();
        simulatedData.forEach((row, index) => {
            const card = cardGenerator(row, index);
            if (card) {
                fragment.appendChild(card);
            }
        });
        container.appendChild(fragment);
        animateOnScroll();

    } catch (error) {
        console.error(`Failed to fetch data for ${pageName}:`, error);
        container.innerHTML = `<p class="error-message">Could not load ${pageName}. Please try again later.</p>`;
    }
};

// Card generation functions for each page
const createCourseCard = (data, index) => {
    if (data.length < 4) return null;
    const [id, title, description, pdfUrl, videoUrl] = data;
    const card = document.createElement('div');
    card.className = 'content-card scroll-animation';
    card.style.setProperty('--delay', `${index * 100}ms`);
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

const createNoticeCard = (data, index) => {
    if (data.length < 3) return null;
    const [title, date, description] = data;
    const card = document.createElement('div');
    card.className = 'content-card scroll-animation';
    card.style.setProperty('--delay', `${index * 100}ms`);
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

const createBlogCard = (data, index) => {
    if (data.length < 4) return null;
    const [title, date, imageUrl, content] = data;
    const card = document.createElement('div');
    card.className = 'content-card scroll-animation';
    card.style.setProperty('--delay', `${index * 100}ms`);
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

    // For demonstration, we'll use simulated data
    // In a real implementation, you would use actual Google Sheets URLs
    if (document.getElementById('courses-list')) {
        fetchData('', 'courses-list', createCourseCard, 'courses');
    }
    if (document.getElementById('notices-list')) {
        fetchData('', 'notices-list', createNoticeCard, 'notices');
    }
    if (document.getElementById('blog-posts')) {
        fetchData('', 'blog-posts', createBlogCard, 'blog posts');
    }

    // Handle contact form submission
    const contactForm = document.getElementById('contact-form-element');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formStatus = document.getElementById('form-status');
            const formData = new FormData(contactForm);
            formStatus.textContent = 'Sending...';
            formStatus.style.color = 'blue';
            
            try {
                // Simulate form submission
                await new Promise(resolve => setTimeout(resolve, 2000));
                
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
