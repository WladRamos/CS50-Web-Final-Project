from django.contrib import admin
from .models import User, Note, Board, Card, Event
# Register your models here.

admin.site.register(User)
admin.site.register(Note)
admin.site.register(Board)
admin.site.register(Card)
admin.site.register(Event)
