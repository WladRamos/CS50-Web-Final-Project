document.addEventListener("DOMContentLoaded", function () {
    let isRequesting = false;
    var cardBodies = document.querySelectorAll('.card-body');
    cardBodies.forEach(function (cardBody) {
        cardBody.addEventListener('click', function (event) {
            if (event.target.classList.contains('delete-card') || event.target.classList.contains('edit-card') || event.target.classList.contains('update-status-card')) {
                return;
            }
            var cardText = this.querySelector('.card-text');
            if (cardText.style.display === 'none') {
                cardText.style.display = 'block';
            } else {
                cardText.style.display = 'none';
            }
        });
    });
    
    document.querySelectorAll(".delete-card").forEach(function (button) {
        button.addEventListener("click", function (event) {
            event.stopPropagation();
            var cardId = button.closest(".card").dataset.cardId;
            var boardId = button.closest(".board").dataset.boardId;
             
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

            const deleteForm = document.getElementById('deleteForm');
            deleteForm.addEventListener('submit', function(event) {
                event.preventDefault(); 

                if (isRequesting) {
                    return;
                }
                isRequesting = true;

                fetch(`/task_delete/${boardId}/${cardId}`, {
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
    });

    document.querySelectorAll(".edit-card").forEach(function (button) {
        button.addEventListener("click", function (event) {
            event.stopPropagation();
            var cardId = button.closest(".card").dataset.cardId;
            var boardId = button.closest(".board").dataset.boardId;
            
            var cardTitle = button.closest(".card").querySelector(".card-title").innerText;
            var cardContent = button.closest(".card").querySelector(".card-text").innerText;
            var cardDeadline = button.closest(".card").querySelector(".card-deadline");
            var cardAssignedTo = button.closest(".card").querySelector(".card-assigned_to");
            var deadlineValue = cardDeadline ? cardDeadline.innerText.trim() : "";

            deadlineValue = deadlineValue.replace("Deadline: ", "");
            
            if (deadlineValue) {
                
                var match = deadlineValue.match(/(\w+) (\d+), (\d+)/);
                if (match) {
                    var month = match[1];
                    var day = match[2];
                    var year = match[3];

                    day = day.padStart(2, '0');

                    var monthNumber = {
                        "January": "01",
                        "February": "02",
                        "March": "03",
                        "April": "04",
                        "May": "05",
                        "June": "06",
                        "July": "07",
                        "August": "08",
                        "September": "09",
                        "October": "10",
                        "November": "11",
                        "December": "12"
                    };

                    deadlineValue = year + '-' + monthNumber[month] + '-' + day;
                }
            }

            var assignedToValue = cardAssignedTo ? cardAssignedTo.innerText.split(":")[1].trim() : "";

            const modal = document.getElementById('editTask');
            modal.style.display = 'block';

            document.getElementById("editTitle").value = cardTitle;
            document.getElementById("editcontent").value = cardContent;
            document.getElementById("editAssigned_to").value = assignedToValue;
            document.getElementById("editDeadline").value = deadlineValue;

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
            
            const editTaskForm = document.getElementById('editTaskForm');
            editTaskForm.addEventListener('submit', function(event) {
                event.preventDefault(); 

                if (isRequesting) {
                    return;
                }
                isRequesting = true;

                const editedTitle = document.getElementById('editTitle').value;
                const editedcontent = document.getElementById('editcontent').value;
                const editedDeadline = document.getElementById('editDeadline').value;
                const editedAssigned_to = document.getElementById('editAssigned_to').value;

                fetch(`/task_edit/${boardId}/${cardId}`, {
                    method: 'PUT',
                    body: JSON.stringify({
                        title: editedTitle,
                        content: editedcontent,
                        deadline: editedDeadline,
                        assigned_to:editedAssigned_to
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

    document.querySelectorAll(".update-status-card").forEach(function (button) {
        button.addEventListener("click", function (event) {
            event.stopPropagation();
    
            var cardId = button.closest(".card").dataset.cardId;
            var boardId = button.closest(".board").dataset.boardId;
            var currentStatus = button.closest(".card").querySelector(".current-status").dataset.status;
    
            const modal = document.getElementById('changeStatusModal');
            
            modal.querySelectorAll(".status-button").forEach(function (statusButton) {
                if (statusButton.dataset.status === currentStatus) {
                    statusButton.disabled = true;
                }
            });
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
    
            modal.querySelectorAll(".status-button").forEach(function (statusButton) {
                statusButton.addEventListener("click", function () {
                    var newStatus = statusButton.dataset.status;
                    if (newStatus !== currentStatus) {

                        if (isRequesting) {
                            return;
                        }
                        isRequesting = true;

                        fetch(`/task_update_status/${boardId}/${cardId}`, {
                            method: 'PUT',
                            body: JSON.stringify({ status: newStatus })
                        })
                        .then(response => response.json())
                        .then(data => {
                            isRequesting = false;
                            modal.style.display = 'none';

                            if (data.hasOwnProperty('error')) {
                                console.error('Error:', data.error);
                                alert(data.error);
                            } else {
                                window.location.reload()
                            }
                        })
                        .catch(error =>{
                            console.log('Error:', error)
                        });
                    }
                });
            });
        });
    });        
});