from django.contrib import admin
from login_score.models import custom_game

# Register your models here.

@admin.register(custom_game)
class custom_gameAdmin(admin.ModelAdmin):
    pass
