from django.db import models
from django.contrib.auth.models import AbstractUser
from django.db.models.signals import post_save
from django.dispatch import receiver

class User(AbstractUser):
    pass

class Note(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="owned_notes")
    title = models.CharField(max_length=20)
    content = models.CharField(max_length=512)
    collaborators = models.ManyToManyField(User, related_name="collaborated_notes")
    created_at = models.DateTimeField(auto_now_add=True)
    star = models.ManyToManyField(User, related_name="starred_notes", blank=True)
    def __str__(self):
        return self.title

class Board(models.Model):
    title = models.CharField(max_length=20)
    creator = models.OneToOneField(User, on_delete=models.CASCADE, related_name='board')
    collaborators = models.ManyToManyField(User, related_name='collaborated_boards', blank=True)

    def __str__(self):
        return self.title

class Card(models.Model):
    STATUS_CHOICES = (
        ('to_do', 'To Do'),
        ('in_progress', 'In Progress'),
        ('done', 'Done'),
    )
    title = models.CharField(max_length=20)
    content = models.CharField(max_length=128)
    created_at = models.DateTimeField(auto_now_add=True)
    deadline = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='to_do')
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    board = models.ForeignKey(Board, on_delete=models.CASCADE, related_name='cards')

    def __str__(self):
        return self.title

@receiver(post_save, sender=User)
def create_user_board(sender, instance, created, **kwargs):
    if created:
        board_title = f"{instance.username}'s Task Board"
        Board.objects.create(title=board_title, creator=instance)
    
class Event(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='events')
    title = models.CharField(max_length=100)
    description = models.CharField(max_length=128, null=True, blank=True)
    date = models.DateField()

    def __str__(self):
        return self.title