document.addEventListener('DOMContentLoaded', function () {
    let isRequesting = false;
    const currentDate = new Date();
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    let currentMonth = currentDate.getMonth();
    let currentYear = currentDate.getFullYear();

    const monthNameEl = document.getElementById('month-name');
    const daysContainer = document.getElementById('days-container');
    const calendarEvents = JSON.parse(document.querySelector('.calendar').getAttribute('data-events'));

    function renderCalendar() {
        
        daysContainer.innerHTML = '';
        monthNameEl.textContent = monthNames[currentMonth] + ' ' + currentYear;
        const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
        const startingDayOfWeek = firstDayOfMonth.getDay();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

        for (let i = 0; i < startingDayOfWeek; i++) {
            const li = document.createElement('li');
            li.textContent = '';
            daysContainer.appendChild(li);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const li = document.createElement('li');
            li.textContent = day;
        
            const eventsForDay = calendarEvents.filter(event => {
                const eventDate = new Date(event.date);
                const compareDate = new Date(currentYear, currentMonth, day);

                compareDate.setUTCHours(0, 0, 0, 0);
                eventDate.setUTCHours(0, 0, 0, 0);

                return eventDate.getTime() === compareDate.getTime();
            });
        
            if (eventsForDay.length > 0) {
                const eventBar = document.createElement('div');
                eventBar.classList.add('event-bar');
                const eventCountText = eventsForDay.length === 1 ? 'event' : 'events';
                eventBar.textContent = eventsForDay.length + ' ' + eventCountText;
                li.appendChild(eventBar);
            }
        
            daysContainer.appendChild(li);
        }
        
        const eventList = document.getElementById('event-list');
        eventList.innerHTML = '';
        
        const sortedEvents = calendarEvents.sort((a, b) => {
            return new Date(a.date) - new Date(b.date);
        });

        sortedEvents.forEach(event => {
            const listItem = document.createElement('div');
            listItem.classList.add('event-item');
            listItem.dataset.id = event.id;
            listItem.innerHTML = `
                <div class="event-title">${event.title}</div>
                <div class="event-date">${event.date}</div>
                <div class="event-content">${event.content}</div>
                ${event.id !== null ? `
                    <button class="edit-event-btn">Edit</button>
                    <button class="delete-event-btn">Delete</button>
                ` : '<span class="task-warning">Tasks can only be manipulated on the tasks page </span>'}
            `;
            eventList.appendChild(listItem);
        });
    }

    renderCalendar();

    document.getElementById('prev-btn').addEventListener('click', function () {
        if (currentMonth === 0) {
            currentMonth = 11;
            currentYear -= 1;
        } else {
            currentMonth -= 1;
        }
        renderCalendar();
    });

    document.getElementById('next-btn').addEventListener('click', function () {
        if (currentMonth === 11) {
            currentMonth = 0;
            currentYear += 1;
        } else {
            currentMonth += 1;
        }
        renderCalendar();
    });
    
    document.getElementById('event-list').addEventListener('click', function (event) {
        const target = event.target;
        const eventItem = target.closest('.event-item');
        if (eventItem) {
            const eventId = eventItem.dataset.id;
            if (target.classList.contains('edit-event-btn')) {
                const eventIdNumber = parseInt(eventId);
                const eventToEdit = calendarEvents.find(event => event.id === eventIdNumber);
                if (eventToEdit) {
                    
                    const modal = document.getElementById('editEvent');
                    
                    document.getElementById('editEventTitle').value = eventToEdit.title;
                    document.getElementById('editEventContent').value = eventToEdit.content;
                    document.getElementById('editEventDate').value = eventToEdit.date;
                    
                    modal.style.display = 'block';

                    const closeButton = modal.querySelector('.close');
                    closeButton.addEventListener('click', function() {
                        modal.style.display = 'none';
                        window.location.reload()
                    });

                    window.addEventListener('click', function(event) {
                        if (event.target == modal) {
                            modal.style.display = 'none';
                            window.location.reload()
                        }
                    });
                     
                    const editBtn = document.getElementById('edit-event-modal');
                    editBtn.addEventListener('click', function(event) {
                        event.preventDefault(); 
                        if (isRequesting) {
                            return;
                        }
                        isRequesting = true;

                        const editEventTitle = document.getElementById('editEventTitle').value;
                        const editEventContent = document.getElementById('editEventContent').value;
                        const editEventDate = document.getElementById('editEventDate').value;
                        
                        fetch(`/event_edit/${eventId}`, {
                            method: 'PUT',
                            body: JSON.stringify({
                                title: editEventTitle,
                                content: editEventContent,
                                date: editEventDate
                            })
                        })
                        .then(response => response.json())
                        .then(data => {
                            isRequesting = false;
                            modal.style.display = 'none';
                            
                            if (data.hasOwnProperty('error')) {
                                console.error('Error:', data.error);
                                alert(data.error);
                            } else {
                                window.location.reload();
                            }
                        })
                        .catch(error =>{
                            console.log('Error:', error)
                        });
                    });
                }
            } else if (target.classList.contains('delete-event-btn')) {
                event.stopPropagation();
                
                const modal = document.getElementById('deleteModal');
                modal.style.display = 'block';
    
                const closeButton = modal.querySelector('.close');
                closeButton.addEventListener('click', function() {
                    modal.style.display = 'none';
                    window.location.reload()
                });
    
                const cancelButton = document.querySelector('.cancel-button');
                cancelButton.addEventListener('click', function() {
                    modal.style.display = 'none';
                    window.location.reload()
                });
    
                window.addEventListener('click', function(event) {
                    if (event.target == modal) {
                        modal.style.display = 'none';
                        window.location.reload()
                    }
                });
                
                const deleteBtn = document.getElementById('delete-event-modal');
                deleteBtn.addEventListener('click', function(event) {
                    event.preventDefault(); 
                    if (isRequesting) {
                        return;
                    }
                    isRequesting = true;
                    fetch(`/event_delete/${eventId}`, {
                        method: 'DELETE'
                    })
                    .then(response => response.json())
                    .then(data => {
                        isRequesting = false;
                        modal.style.display = 'none';
                        
                        if (data.hasOwnProperty('error')) {
                            console.error('Error:', data.error);
                            alert(data.error);
                        } else {
                            window.location.reload();
                        }
                    })
                    .catch(error =>{
                        console.log('Error:', error)
                    });
                });
            }
        }
    });
    
    newEventBtn = document.getElementById('new-event-btn');
    newEventBtn.addEventListener('click', function(){
        const modal = document.getElementById('newEvent');
                    
        modal.style.display = 'block';

        const closeButton = modal.querySelector('.close');
        closeButton.addEventListener('click', function() {
            modal.style.display = 'none';
            window.location.reload()
        });

        window.addEventListener('click', function(event) {
            if (event.target == modal) {
                modal.style.display = 'none';
                window.location.reload()
            }
        });
         
        const newEventBtn = document.getElementById('new-event-modal');
        newEventBtn.addEventListener('click', function(event) {
            event.preventDefault(); 
            if (isRequesting) {
                return;
            }
            isRequesting = true;

            const newEventTitle = document.getElementById('newEventTitle').value;
            const newEventContent = document.getElementById('newEventContent').value;
            const newEventDate = document.getElementById('newEventDate').value;
            
            fetch('/event_create', {
                method: 'POST',
                body: JSON.stringify({
                    title: newEventTitle,
                    content: newEventContent,
                    date: newEventDate
                })
            })
            .then(response => response.json())
            .then(data => {
                isRequesting = false;
                modal.style.display = 'none';
                
                if (data.hasOwnProperty('error')) {
                    console.error('Error:', data.error);
                    alert(data.error);
                } else {
                    window.location.reload();
                }
            })
            .catch(error =>{
                console.log('Error:', error)
            });
        });
    });
});
