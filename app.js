// Telegram WebApp initialization
const tg = window.Telegram.WebApp;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    // Expand to full height
    tg.expand();
    
    // Set header color
    tg.setHeaderColor('#1a1f2e');
    tg.setBackgroundColor('#0f1419');
    
    // Enable main button if needed
    // tg.MainButton.setText("ЗАВЕРШИТЬ");
    // tg.MainButton.show();
    
    initEventListeners();
    loadScheduleData();
    highlightCurrentLesson();
});

function initEventListeners() {
    // View toggle
    document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            
            const view = e.target.dataset.view;
            switchView(view);
        });
    });
    
    // Date selector
    document.querySelectorAll('.date-item').forEach(item => {
        item.addEventListener('click', (e) => {
            document.querySelectorAll('.date-item').forEach(i => i.classList.remove('active'));
            e.currentTarget.classList.add('active');
            
            const date = e.currentTarget.dataset.date;
            loadScheduleForDate(date);
            
            // Haptic feedback
            tg.HapticFeedback.impactOccurred('light');
        });
    });
    
    // Bottom navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
            
            const page = e.currentTarget.dataset.page;
            navigateToPage(page);
            
            tg.HapticFeedback.impactOccurred('light');
        });
    });
    
    // Settings button
    document.getElementById('settingsBtn')?.addEventListener('click', () => {
        tg.HapticFeedback.impactOccurred('medium');
        showSettings();
    });
    
    // Close button
    document.getElementById('closeBtn')?.addEventListener('click', () => {
        tg.close();
    });
    
    // Lesson cards click
    document.querySelectorAll('.lesson-card').forEach(card => {
        card.addEventListener('click', (e) => {
            tg.HapticFeedback.impactOccurred('light');
            showLessonDetails(card.dataset.lesson);
        });
    });
}

function switchView(view) {
    tg.HapticFeedback.selectionChanged();
    
    if (view === 'week') {
        // Show week view (implement later)
        tg.showAlert('Недельный просмотр в разработке');
    }
}

function loadScheduleForDate(date) {
    // Here you would fetch schedule for selected date
    console.log('Loading schedule for:', date);
    
    // Animate cards
    document.querySelectorAll('.lesson-card').forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(10px)';
        setTimeout(() => {
            card.style.transition = 'all 0.3s';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 50);
    });
}

function loadScheduleData() {
    // Fetch schedule from server or use static data
    // Example: fetch('/api/schedule')...
}

function highlightCurrentLesson() {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour * 60 + currentMinute;
    
    document.querySelectorAll('.lesson-card').forEach(card => {
        const timeStart = card.querySelector('.time-start').textContent;
        const [hours, minutes] = timeStart.split(':').map(Number);
        const lessonStart = hours * 60 + minutes;
        
        if (currentTime >= lessonStart && currentTime < lessonStart + 90) {
            card.style.border = '2px solid #10b981';
            card.style.background = '#1e293b';
        }
    });
}

function navigateToPage(page) {
    console.log('Navigate to:', page);
    // Implement page navigation
}

function showSettings() {
    tg.showPopup({
        title: 'Настройки',
        message: 'Выберите действие',
        buttons: [
            { id: 'theme', type: 'default', text: 'Тема' },
            { id: 'notifications', type: 'default', text: 'Уведомления' },
            { id: 'cancel', type: 'cancel', text: 'Отмена' }
        ]
    }, (buttonId) => {
        if (buttonId === 'theme') {
            tg.showAlert('Смена темы');
        } else if (buttonId === 'notifications') {
            tg.showAlert('Настройки уведомлений');
        }
    });
}

function showLessonDetails(lessonId) {
    tg.showPopup({
        title: `Пара ${lessonId}`,
        message: 'Подробная информация о занятии',
        buttons: [
            { type: 'default', text: 'OK' }
        ]
    });
}

// Handle theme changes
tg.onEvent('themeChanged', () => {
    // Update colors if needed
});

// Ready signal
tg.ready();