from django.urls import path
from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("notes", views.notes, name="notes"),
    path("tasks", views.tasks, name="tasks"),
    path("calendar", views.calendar, name="calendar"),
    path("note_star/<int:note_id>", views.note_star, name="note_star"),
    path("note_invite/<int:note_id>", views.note_invite, name="note_invite"),
    path("note_delete/<int:note_id>", views.note_delete, name="note_delete"),
    path("note_create", views.note_create, name="note_create"),
    path("note_edit/<int:note_id>", views.note_edit, name="note_edit"),
    path("board_delete/<int:board_id>", views.board_delete, name="board_delete"),
    path("board_invite/<int:board_id>", views.board_invite, name="board_invite"),
    path("board_add_task/<int:board_id>", views.board_add_task, name="board_add_task"),
    path("task_delete/<int:board_id>/<int:task_id>", views.task_delete, name="task_delete"),
    path("task_edit/<int:board_id>/<int:task_id>", views.task_edit, name="task_edit"),
    path("task_update_status/<int:board_id>/<int:task_id>", views.task_update_status, name="task_update_status"),
    path("board_collab_remove/<int:board_id>/<int:collab_id>", views.board_collab_remove, name="board_collab_remove"),
    path('calendar/', views.calendar, name='calendar'),
    path("event_delete/<int:event_id>", views.event_delete, name="event_delete"),
    path("event_edit/<int:event_id>", views.event_edit, name="event_edit"),
    path("event_create", views.event_create, name="event_create")
]