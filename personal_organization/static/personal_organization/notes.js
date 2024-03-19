document.addEventListener("DOMContentLoaded", function() {
    const noteCards = document.querySelectorAll('.custom-card');
    let isRequesting = false;

    const createNoteForm = document.querySelector('#create-note-form')
    createNoteForm.addEventListener('submit', function(event){
        event.preventDefault(); 

        if (isRequesting) {
            return;
        }
        isRequesting = true;

        const formTitle = createNoteForm.querySelector('#title').value;
        const formContent = createNoteForm.querySelector('#content').value;

        fetch('/note_create', {
            method: 'POST',
            body: JSON.stringify({
                title: formTitle,
                content: formContent
            })
        })
        .then(response => response.json())
        .then(data => {
            
            if (data.hasOwnProperty('error')) {
                console.error('Error:', data.error);
                alert(data.error);
            }
            else{
                isRequesting = false;
                window.location.reload();
            }
        })
        .catch(error =>{
            console.log('Error:', error)
        });
    })

    noteCards.forEach(card => {
        card.addEventListener('click', function(event) {
            
            if (event.target.classList.contains('invite-button') || event.target.classList.contains('star') || event.target.classList.contains('delete-button') || event.target.classList.contains('edit-button')) {
                
                return;
            }
            
            const content = this.querySelector('.content');

            if (content.style.display === 'none') {
                content.style.display = 'block';
            } else {
                content.style.display = 'none';
            }
        });
        
        const star = card.querySelector('.star');
        if(star){
            star.addEventListener('click', function(event) {
                event.stopPropagation(); 
    
                const noteId = card.dataset.noteId;
    
                fetch(`/note_star/${noteId}`)
                .then(response => response.json())
                .then(data => {
                    
                    if (data.star) {
                        star.style.color = 'gold'; 
                    } else {
                        star.style.color = 'black'; 
                    }
                })
                .catch(error =>{
                    console.log('Error:', error)
                });
            });
        }
        
        const inviteButton = card.querySelector('.invite-button');
        if (inviteButton) {
            inviteButton.addEventListener('click', function(event) {
                event.stopPropagation(); 

                const noteId = card.dataset.noteId; 
                const modal = document.getElementById('inviteModal');
                modal.style.display = 'block';

                const closeButton = modal.querySelector('.close');
                closeButton.addEventListener('click', function() {
                    modal.style.display = 'none';
                });

                window.addEventListener('click', function(event) {
                    if (event.target == modal) {
                        modal.style.display = 'none';
                    }
                });

                const inviteForm = document.getElementById('inviteForm');
                inviteForm.addEventListener('submit', function(event) {
                    event.preventDefault(); 

                    if (isRequesting) {
                        return;
                    }
                    isRequesting = true;

                    const email = document.getElementById('email').value;

                    fetch(`/note_invite/${noteId}`, {
                        method: 'POST',
                        body: JSON.stringify({
                            collaborator_email: email
                        })
                    })
                    .then(response => response.json())
                    .then(data => {
                        
                        isRequesting = false;
                        
                        if (data.hasOwnProperty('message')) {
                            const messageContainer = document.createElement('div');
                            messageContainer.textContent = data.message;

                            
                            inviteForm.appendChild(messageContainer);
                        } 
                        else if (data.hasOwnProperty('error')) {
                            console.error('Error:', data.error);
                            
                        }
                    })
                    .catch(error =>{
                        console.log('Error:', error)
                    });
                });
            });
        }

        const deleteButton = card.querySelector('.delete-button');
        if(deleteButton){
            deleteButton.addEventListener('click', function(event) {
                event.stopPropagation(); 
                const noteId = card.dataset.noteId;
                const modal = document.getElementById('deleteModal');
                modal.style.display = 'block';
    
                const closeButton = modal.querySelector('.close');
                closeButton.addEventListener('click', function() {
                    modal.style.display = 'none';
                });
    
                const cancelButton = document.querySelector('.cancel-button');
                cancelButton.addEventListener('click', function() {
                    modal.style.display = 'none';
                });
    
                window.addEventListener('click', function(event) {
                    if (event.target == modal) {
                        modal.style.display = 'none';
                    }
                });
    
                const deleteBtn = document.getElementById('delete-note-modal');
                deleteBtn.addEventListener('click', function(event) {
                    event.preventDefault(); 
    
                    if (isRequesting) {
                        return;
                    }
                    isRequesting = true;
    
                    fetch(`/note_delete/${noteId}`, {
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
    
            });
        }

        const editButton = card.querySelector('.edit-button');
        if (editButton) {
            editButton.addEventListener('click', function (event) {
                event.preventDefault();

                const noteCard = event.target.closest('.container');
                const cardDetails = noteCard.querySelector('.card-details');
                const editForm = noteCard.querySelector('.edit-form');
                const editTitle = noteCard.querySelector('.edit-title');
                const editContent = noteCard.querySelector('.edit-content');
                const saveButton = noteCard.querySelector('.save-edit');
                const cancelButton = noteCard.querySelector('.cancel-edit');

                cardDetails.style.display = 'none';
                editForm.style.display = 'block';
                
                editContent.focus();

                cancelButton.addEventListener('click', function () {
                    cardDetails.style.display = 'block';
                    editForm.style.display = 'none';
                });

                saveButton.addEventListener('click', function () {
                    const newTitle = editTitle.value;
                    const newContent = editContent.value;

                    const noteId = noteCard.dataset.noteId;

                    fetch(`/note_edit/${noteId}`, {
                        method: 'PUT',
                        body: JSON.stringify({
                            title: newTitle,
                            content: newContent
                        })
                    })
                    .then(response => response.json())
                    .then(data => {
                        
                        
                        if (data.hasOwnProperty('error')) {
                            console.error('Error:', data.error);
                            alert(data.error);
                        }
                        else{
                            
                            noteCard.querySelector('.note-title').textContent = newTitle;
                            noteCard.querySelector('.note-content').textContent = newContent;
                            cardDetails.style.display = 'block';
                            editForm.style.display = 'none';
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                    });
                });
            });
        }
    });
});
