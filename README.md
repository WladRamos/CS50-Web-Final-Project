# CS50W Capstone

Link to project demonstration video: https://youtu.be/-L8UwKCfr6w

My final project for CS50’s Web Programming with Python and JavaScript course is a website aimed at assisting users with personal organization, providing ways to create and share notes, manage task boards, contribute to third-party task boards, and mark events on their calendar.
I chose to develop a project with this scope because I consider it extremely important for individuals to plan and organize their tasks effectively to be more productive in their daily lives.
Additionally, I believe that the ease of access and centralization of tools such as note-taking, calendars, and task boards in one place can significantly enhance the efficiency and effectiveness of personal organization processes.
## Distinctiveness and Complexity

I believe my project meets the requirements of distinctiveness and complexity because it implements very different logics from those covered in the course, especially when it comes to the task board and calendar screens.

The task board screen was a major challenge because it was necessary to completely separate the task boards from the task cards within them, applying the necessary functionalities to each of them. Additionally, thinking of a way to iterate through the cards with a certain status to display them one below the other in the column corresponding to the status was quite difficult, and without a doubt, the solution I used is much more complex than any HTML template I've written before.

Regarding the calendar functionality, I also consider the way it was done to be quite different from anything else. The fact that almost all content displayed on the screen, such as the days of the month, with or without events, and the list of events, is generated by JavaScript makes it unique. Another very interesting aspect of this calendar is the ability to display the deadlines of the tasks assigned to the user, creating a connection between these two distinct functionalities of the website (tasks and calendar).

To conclude my justification for why my project meets the requirements of distinctiveness and complexity, I would like to highlight that this project deals with many possibilities of handling for the main elements (notes, task boards, task cards, and events). All these elements require multiple internal functionalities such as create, edit, delete, add and remove collaborators, update status, star marking, and handling all these events that can occur with an element made the code quite extensive and complex.

## What’s contained in each file

### layout.html

This file contains the sidebar with hyperlinks that allow navigation between the website's pages. The sidebar is present on all pages of the website.

### styles.css

This file contains the styling of the sidebar and the modals (pop-ups) that appear on all screens.

### index.html

This file contains a summary of the most important information for the user, such as starred notes, tasks about to expire, and upcoming events.

### login.html

This file contains the form for the user to log in to the system.

### register.html

This file contains the form for the user to register in the system.

### notes.html

This file contains the styling of the notes and defines how the notes are displayed on the screen and contains the form used to create new notes. This file also includes the modals that appear on the screen when a user tries to delete a note or invite a collaborator.
On this page, the user can:
1. Write a new note (title and content)
2. Star notes, making them appear on the home screen and higher on this screen
3. Delete notes (if created by you) and quit note (if you are invited to the note)
4. Edit a note
5. Invite users to access, read, edit, and invite other users to the note.

### notes.js

This file is responsible for capturing clicks on the star, invite, delete, edit buttons and also capturing the submit of a new note and making the necessary requests to the view that will change the information in the database as needed.

### tasks.html

This file contains the styling of the boards and task cards and defines how these two elements will be displayed on the screen, ensuring that the cards are always in the correct column according to their status. It also includes the modals that appear when the user tries to invite a collaborator, delete a board, add a task, edit a task, change the status of a task (move between To Do, In Progress, and Done), and view collaborators.
On this page, the user can:
1. Invite collaborators to their board
2. Add task cards to the board (Title, description, deadline, and assigned user)
3. View the list of collaborators and remove collaborators
4. Delete a task
5. Edit a task
6. Change the status of a task to move it between the To Do, In Progress, and Done columns

### tasks.js

This file is responsible for capturing clicks on the invite, delete, add task, and collaborators buttons of a board and making the necessary requests to the view that will change the information in the database as needed.

### taskCards.js

This file is responsible for capturing clicks on the internal buttons of the task cards, delete card, edit card, and update card status, and making the necessary requests to the view that will change the information in the database as needed.

### calendar.html

This file contains the styling of the calendar and the list of events, it contains the divs of the calendar days and the events list that will be dynamically filled by the calendar.js file. It also includes the modals that appear on the screen when a user wants to delete, create, or edit an event.
On this page, the user can:
1. Create a new event (title, description, and date)
2. Navigate through the months of the calendar using the next month and previous month buttons
3. Edit events
4. Delete events
(User can only manipulate events through this screen, tasks must be manipulated on the tasks screen)

### calendar.js

This file is responsible for dynamically generating the calendar days, filling them with a notice showing how many events exist on the day if there are any, and also for generating the events list with buttons to manipulate each event. It is also responsible for capturing clicks on the edit, delete, and create event buttons to make the necessary requests for the view to handle the event in the database.

## How to run your application

To run the project, simply be in the directory containing the manage.py file and run the command 'python manage.py runserver'. There is no need to install external libraries for the project to function.

