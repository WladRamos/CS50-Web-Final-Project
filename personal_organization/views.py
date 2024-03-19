from django.shortcuts import render
from django.contrib.auth import authenticate, login, logout
from django.http import HttpResponseRedirect, JsonResponse
from django.urls import reverse
from .models import User, Note, Card, Board, Event
from django.db import IntegrityError
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
import json
from datetime import datetime, timedelta

def index(request):
    user_id = request.user.id  
    latest_notes = Note.objects.filter(owner_id=user_id).order_by('-created_at')[:3]
    latest_shared_notes = Note.objects.filter(collaborators=user_id).order_by('-created_at')[:3]
    starred_notes = Note.objects.filter(star=user_id)
    deadline_date = datetime.now() + timedelta(days=10)
    upcoming_tasks = Card.objects.filter(assigned_to_id=user_id, deadline__lte=deadline_date).exclude(status='done')
    end_date = datetime.now() + timedelta(days=30)
    upcoming_events = Event.objects.filter(user_id=user_id, date__lte=end_date)

    return render(request, "personal_organization/index.html", {
        'latest_notes': latest_notes,
        'latest_shared_notes': latest_shared_notes,
        'starred_notes': starred_notes,
        'upcoming_tasks': upcoming_tasks,
        'upcoming_events': upcoming_events
    })

def login_view(request):
    if request.method == "POST":

        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)
        
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "personal_organization/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "personal_organization/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))

def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "personal_organization/register.html", {
                "message": "Passwords must match."
            })

        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "personal_organization/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "personal_organization/register.html")

@login_required
def notes(request):
    user_notes = Note.objects.filter(owner=request.user).order_by('-star', '-created_at')
    collaborated_notes = Note.objects.filter(collaborators=request.user).order_by('-star', '-created_at')

    return render(request, "personal_organization/notes.html", {
        'user_notes': user_notes,
        'collaborated_notes': collaborated_notes
    })

def tasks(request):
    
    user_created_boards = Board.objects.filter(creator=request.user)
    user_collaborated_boards = Board.objects.filter(collaborators=request.user)

    created_boards_with_cards = {}
    collaborated_boards_with_cards = {}

    for board in user_created_boards:
        cards = board.cards.all().order_by('status', 'created_at')
        created_boards_with_cards[board] = cards

    for board in user_collaborated_boards:
        cards = board.cards.all().order_by('status', 'created_at')
        collaborated_boards_with_cards[board] = cards

    return render(request, "personal_organization/tasks.html", {
        'created_boards_with_cards': created_boards_with_cards,
        'collaborated_boards_with_cards': collaborated_boards_with_cards
    })

def calendar(request):
    return render(request, "personal_organization/calendar.html")

@login_required
@csrf_exempt
def note_star(request, note_id):
    try:
        note = Note.objects.get(id=note_id)
        
        if request.user == note.owner or request.user in note.collaborators.all():
            if request.user in note.star.all():
                note.star.remove(request.user)
                starred = False
            else:
                note.star.add(request.user)
                starred = True
            return JsonResponse({'star': starred})
        else:
            return JsonResponse({'error': 'You do not have permission to star this note.'}, status=403)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@login_required
@csrf_exempt
def note_invite(request, note_id):
    if request.method == 'POST':
        try:
            note = Note.objects.get(id=note_id)
            data = json.loads(request.body)
            collaborator_email = data.get('collaborator_email')

            if request.user.email == collaborator_email:
                return JsonResponse({'error': 'Cannot invite yourself'}, status=400)

            try:
                collaborator = User.objects.get(email=collaborator_email)
            except User.DoesNotExist:
                return JsonResponse({'error': 'User not found'}, status=404)

            if collaborator not in note.collaborators.all():
                note.collaborators.add(collaborator)
                note.save()
                
                return JsonResponse({'message': f'Collaborator {collaborator_email} added successfully to the note'})

            return JsonResponse({'message': f'Collaborator {collaborator_email} is already collaborating on this note'})

        except Note.DoesNotExist:
            return JsonResponse({'error': 'Note not found'}, status=404)

    return JsonResponse({'error': 'Invalid request method'}, status=405)

@login_required
@csrf_exempt
def note_delete(request, note_id):
    if request.method == 'DELETE':
        try:
            note = Note.objects.get(id=note_id)

            if request.user == note.owner:
                note.delete()
                return JsonResponse({'message': f"Note {note_id} deleted"})
            elif request.user in note.collaborators.all():
                note.collaborators.remove(request.user)
                return JsonResponse({'message': f"stopped collaborating with note {note_id}"})
            else:
                return JsonResponse({'error': 'Unauthorized user'}, status=403)
        except Note.DoesNotExist:
            return JsonResponse({'error': 'Note not found'}, status=404)
    else: 
        return JsonResponse({'error': 'Invalid request method'}, status=405)
    
@csrf_exempt
def note_create(request):
    if request.method == 'POST':
        owner = request.user
        try:
            data = json.loads(request.body)
            title = data.get('title')
            content = data.get('content')

            if title is None or content is None:
                return JsonResponse({'error': 'Missing title or content'}, status=400)

            new_note = Note.objects.create(owner=owner, title=title, content=content)

            return JsonResponse({'success': 'Note created successfully', 'note_id': new_note.id})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)

@csrf_exempt
def note_edit(request, note_id):
    if request.method == 'PUT':

        note = Note.objects.get(id=note_id)
        
        if request.user == note.owner or request.user in note.collaborators.all():
            try:
                
                data = json.loads(request.body)
                
                note.title = data.get('title', note.title)
                note.content = data.get('content', note.content)
                note.save()
                
                return JsonResponse({'message': 'Note edited successfully'})
            except Exception as e:
                return JsonResponse({'error': str(e)}, status=500)
        else:
            return JsonResponse({'error': 'Unauthorized'}, status=403)
    
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)

@login_required
@csrf_exempt
def board_delete(request, board_id):
    if request.method == 'DELETE':
        try:
            board = Board.objects.get(id=board_id)

            if request.user == board.creator:
                return JsonResponse({'error': 'Cant delete your own board'}, status=403)
            elif request.user in board.collaborators.all():
                board.cards.filter(assigned_to=request.user).update(assigned_to=None)
                board.collaborators.remove(request.user)
                return JsonResponse({'message': f"stopped collaborating with board {board_id}"})
            else:
                return JsonResponse({'error': 'Unauthorized user'}, status=403)
        except Note.DoesNotExist:
            return JsonResponse({'error': 'Board not found'}, status=404)
    else: 
        return JsonResponse({'error': 'Invalid request method'}, status=405)
    
@login_required
@csrf_exempt
def board_invite(request, board_id):
    if request.method == 'POST':
        try:
            
            board = Board.objects.get(id=board_id)
            data = json.loads(request.body)
            collaborator_email = data.get('collaborator_email')

            if request.user.email == collaborator_email:
                return JsonResponse({'error': 'Cannot invite yourself'}, status=400)

            try:
                collaborator = User.objects.get(email=collaborator_email)
            except User.DoesNotExist:
                return JsonResponse({'error': 'User not found'}, status=404)

            if collaborator not in board.collaborators.all():
                board.collaborators.add(collaborator)
                board.save()
                
                return JsonResponse({'message': f'Collaborator {collaborator_email} added successfully to the board'})

            return JsonResponse({'message': f'Collaborator {collaborator_email} is already collaborating on this board'})

        except Note.DoesNotExist:
            return JsonResponse({'error': 'Board not found'}, status=404)

    return JsonResponse({'error': 'Invalid request method'}, status=405)

@login_required
@csrf_exempt
def board_add_task(request, board_id):
    if request.method == 'POST':
        try:
            board = Board.objects.get(id=board_id)

            if request.user == board.creator or request.user in board.collaborators.all():
                try: 
                    data = json.loads(request.body)
                    title = data.get('title')
                    content = data.get('content')
                    deadline_str = data.get('deadline')
                    assigned_to_username = data.get('assigned_to')

                    try:
                        assigned_user = None
                        if assigned_to_username:
                            assigned_user = User.objects.get(username=assigned_to_username)
                            if assigned_user != board.creator and assigned_user not in board.collaborators.all():
                                return JsonResponse({'error': 'Assigned User must have a link with the board'}, status=403)

                        deadline = None
                        if deadline_str:
                            deadline = datetime.strptime(deadline_str, '%Y-%m-%d')

                        newCard = Card.objects.create(title=title, content=content, deadline=deadline, assigned_to=assigned_user, board=board)
                        newCard.save()
                        
                        return JsonResponse({'message': 'New Task added successfully'})
                    except User.DoesNotExist:
                        return JsonResponse({'error': 'Assigned User not found'}, status=404)

                except Exception as e:
                    return JsonResponse({'error': str(e)}, status=500)
            else:
                
                return JsonResponse({'error': 'Unauthorized'}, status=403)

        except Note.DoesNotExist:
            return JsonResponse({'error': 'Board not found'}, status=404)

    return JsonResponse({'error': 'Invalid request method'}, status=405)

@login_required
@csrf_exempt
def task_delete(request, board_id, task_id):
    if request.method == 'DELETE':
        try:
            board = Board.objects.get(id=board_id)
            try:
                task = Card.objects.get(id=task_id)

                if request.user == board.creator or request.user in board.collaborators.all():
                    task.delete()
                    return JsonResponse({'message': f"task {task_id} deleted"})
                else:
                    return JsonResponse({'error': 'Unauthorized user'}, status=403)
            except Card.DoesNotExist:
                return JsonResponse({'error': 'Task not found'}, status=404)
        except Board.DoesNotExist:
            return JsonResponse({'error': 'Board not found'}, status=404)
    else: 
        return JsonResponse({'error': 'Invalid request method'}, status=405)


@login_required
@csrf_exempt
def task_edit(request, board_id, task_id):
    if request.method == 'PUT':
        try:
            board = Board.objects.get(id=board_id)
            try:
                task = Card.objects.get(id=task_id)

                if request.user == board.creator or request.user in board.collaborators.all():
                    
                    data = json.loads(request.body)
                    title = data.get('title')
                    content = data.get('content')
                    deadline_str = data.get('deadline')
                    assigned_to_username = data.get('assigned_to')

                    try:
                        assigned_user = None
                        if assigned_to_username:
                            assigned_user = User.objects.get(username=assigned_to_username)
                            if assigned_user != board.creator and assigned_user not in board.collaborators.all():
                                return JsonResponse({'error': 'Assigned User must have a link with the board'}, status=403)

                        deadline = None
                        if deadline_str:
                            deadline = datetime.strptime(deadline_str, '%Y-%m-%d')

                        task.title = title
                        task.content = content
                        task.deadline = deadline
                        task.assigned_to = assigned_user
                        task.save()
                        
                        return JsonResponse({'message': 'Task edited successfully'})
                    except User.DoesNotExist:
                        return JsonResponse({'error': 'Assigned User not found'}, status=404)
                else:
                    return JsonResponse({'error': 'Unauthorized user'}, status=403)
            except Card.DoesNotExist:
                return JsonResponse({'error': 'Task not found'}, status=404)
        except Board.DoesNotExist:
            return JsonResponse({'error': 'Board not found'}, status=404)
    else: 
        return JsonResponse({'error': 'Invalid request method'}, status=405)

@login_required
@csrf_exempt
def task_update_status(request, board_id, task_id):
    if request.method == 'PUT':
        try:
            board = Board.objects.get(id=board_id)
            try:
                task = Card.objects.get(id=task_id)

                if request.user == board.creator or request.user in board.collaborators.all():
                    
                    data = json.loads(request.body)
                    newStatus = data.get('status')

                    try:
                        task.status = newStatus
                        task.save()
                        
                        return JsonResponse({'message': 'Task status updated successfully'})
                    except Exception as e:
                        return JsonResponse({'error': 'Failed to save task'}, status=500)
                else:
                    return JsonResponse({'error': 'Unauthorized user'}, status=403)
            except Card.DoesNotExist:
                return JsonResponse({'error': 'Task not found'}, status=404)
        except Board.DoesNotExist:
            return JsonResponse({'error': 'Board not found'}, status=404)
    else: 
        return JsonResponse({'error': 'Invalid request method'}, status=405)

@login_required
@csrf_exempt
def board_collab_remove(request, board_id, collab_id):
    if request.method == 'DELETE':
        try:
            board = Board.objects.get(id=board_id)

            if request.user == board.creator:
                try:
                    collaborator = board.collaborators.get(pk=collab_id)
                    board.cards.filter(assigned_to=collaborator).update(assigned_to=None)
                    board.collaborators.remove(collaborator)
                    
                    return JsonResponse({'message': 'Collaborator removed successfully'})
                except board.collaborators.model.DoesNotExist:
                    return JsonResponse({'error': 'Collaborator not found in board'}, status=404)
                except Exception as e:
                    return JsonResponse({'error': 'Failed to remove collaborator'}, status=500)
            else:
                return JsonResponse({'error': 'Unauthorized user'}, status=403)
            
        except Board.DoesNotExist:
            return JsonResponse({'error': 'Board not found'}, status=404)
    else: 
        return JsonResponse({'error': 'Invalid request method'}, status=405)

@login_required
def calendar(request):
    user = request.user
    tasks = Card.objects.filter(assigned_to=user, deadline__isnull=False).exclude(status='done')
    events = Event.objects.filter(user=user)
    
    calendar_events = []
    for task in tasks:
        task_event = {
            'id': None,
            'title': task.title,
            'content': task.content,
            'date': task.deadline.strftime('%Y-%m-%d'),
        }
        calendar_events.append(task_event)

    for event in events:
        user_event = {
            'id': event.id,
            'title': event.title,
            'content': event.description,
            'date': event.date.strftime('%Y-%m-%d'),
        }
        calendar_events.append(user_event)
    
    events_json = json.dumps(calendar_events)

    return render(request, "personal_organization/calendar.html", {
        'events_json': events_json
    })

@login_required
@csrf_exempt
def event_delete(request, event_id):
    if request.method == 'DELETE':
        try:
            event = Event.objects.get(id=event_id)

            if request.user == event.user:
                try:
                    event.delete()

                    return JsonResponse({'message': 'Event deleted successfully'})
                except Exception as e:
                    return JsonResponse({'error': 'Failed to delete event'}, status=500)
            else:
                return JsonResponse({'error': 'Unauthorized user'}, status=403)
            
        except Board.DoesNotExist:
            return JsonResponse({'error': 'Event not found'}, status=404)
    else: 
        return JsonResponse({'error': 'Invalid request method'}, status=405)


@login_required
@csrf_exempt
def event_edit(request, event_id):
    if request.method == 'PUT':
        try:
            event = Event.objects.get(id=event_id)

            if request.user == event.user:
                
                data = json.loads(request.body)
                title = data.get('title')
                content = data.get('content')
                date = data.get('date')

                event.title = title
                event.description = content
                event.date = date
                event.save()
                
                return JsonResponse({'message': 'Event edited successfully'})
            else:
                return JsonResponse({'error': 'Unauthorized user'}, status=403)
        except Card.DoesNotExist:
            return JsonResponse({'error': 'Event not found'}, status=404)
    else: 
        return JsonResponse({'error': 'Invalid request method'}, status=405)


@login_required
@csrf_exempt
def event_create(request):
    if request.method == 'POST':
        user = request.user
        try:
            data = json.loads(request.body)
            title = data.get('title')
            content = data.get('content')
            date = data.get('date')

            new_event = Event.objects.create(user=user, title=title, description=content, date = date)

            return JsonResponse({'success': 'Event created successfully', 'event_id': new_event.id})
        except Exception as e:
            
            return JsonResponse({'error': str(e)}, status=500)
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)
    