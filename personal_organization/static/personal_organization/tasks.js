document.addEventListener("DOMContentLoaded", function() {
    const boards = document.querySelectorAll('.board');
    let isRequesting = false;

    boards.forEach(card => {

        const inviteButton = card.querySelector('.invite-button');
        if (inviteButton) {
            inviteButton.addEventListener('click', function(event) {
                event.stopPropagation(); 

                const boardId = card.dataset.boardId; 
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

                    fetch(`/board_invite/${boardId}`, {
                        method: 'POST',
                        body: JSON.stringify({
                            collaborator_email: email
                        })
                    })
                    .then(response => response.json())
                    .then(data => {
                        
                        isRequesting = false;
                        
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
        
        const deleteButton = card.querySelector('.delete-button');
        if(deleteButton){
            deleteButton.addEventListener('click', function(event) {
                event.stopPropagation(); 
                const boardId = card.dataset.boardId;

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

                const deleteForm = document.getElementById('deleteForm');
                deleteForm.addEventListener('submit', function(event) {
                    event.preventDefault(); 

                    if (isRequesting) {
                        return;
                    }
                    isRequesting = true;

                    fetch(`/board_delete/${boardId}`, {
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
        
        const addTaskButton = card.querySelector('.add-task-button');
        if (addTaskButton) {
            addTaskButton.addEventListener('click', function(event) {
                event.stopPropagation(); 

                const boardId = card.dataset.boardId; 

                const modal = document.getElementById('addTask');
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

                const addtaskForm = document.getElementById('addtaskForm');
                addtaskForm.addEventListener('submit', function(event) {
                    event.preventDefault(); 

                    if (isRequesting) {
                        return;
                    }
                    isRequesting = true;

                    const newTitle = document.getElementById('newTitle').value;
                    const newcontent = document.getElementById('newcontent').value;
                    const newDeadline = document.getElementById('newDeadline').value;
                    const newAssigned_to = document.getElementById('newAssigned_to').value;
        
                    fetch(`/board_add_task/${boardId}`, {
                        method: 'POST',
                        body: JSON.stringify({
                            title: newTitle,
                            content: newcontent,
                            deadline: newDeadline,
                            assigned_to:newAssigned_to
                        })
                    })
                    .then(response => response.json())
                    .then(data => {
                        
                        isRequesting = false;
                        
                        if (data.hasOwnProperty('error')) {
                            console.error('Error:', data.error);
                            alert(data.error);
                        }
                        else {
                            modal.style.display = 'none';
                            window.location.reload();
                        }
                    })
                    .catch(error =>{
                        console.log('Error:', error)
                    });
                });
            });
        }
        
        const collabButton = document.querySelector('.collaborators-button');
        if (collabButton) {
            collabButton.addEventListener('click', function(event) {
                event.stopPropagation(); 

                const modal = document.getElementById('collaboratorsModal');
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

                const removeButtons = document.querySelectorAll('.remove-collaborator-button');
                removeButtons.forEach(function(removeButton) {
                    removeButton.addEventListener('click', function(event) {
                        event.preventDefault(); 

                        const collaboratorId = this.parentNode.dataset.collaboratorId; 
                        const boardId = this.closest('.collaborator-box').dataset.boardId;

                        console.log("Board id: ", boardId)

                        if (isRequesting) {
                            return;
                        }
                        isRequesting = true;

                        fetch(`/board_collab_remove/${boardId}/${collaboratorId}`, {
                            method: 'DELETE'
                        })
                        .then(response => response.json())
                        .then(data => {
                            isRequesting = false;
                            
                            if (data.hasOwnProperty('error')) {
                                console.error('Error:', data.error);
                                alert(data.error);
                            } else {
                                modal.style.display = 'none';
                                window.location.reload();
                            }
                        })
                        .catch(error => {
                            console.error('Error:', error);
                            alert('Error removing collaborator');
                        });
                    });
                });
            });
        }
    });
});
