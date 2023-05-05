from django.db import models

# Create your models here.

class custom_game(models.Model):
    PLATFORMS = (
        ('platform_1', 'platform_1'),
        ('platform_2', 'platform_2'),
        ('platform_3', 'platform_3'),
    )
    BACKGROUNDS = (
        ('background_1', 'background_1'),
        ('background_2', 'background_2'),
        ('background_3', 'background_3'),
    )
    OBSTACLES = (
        ('obstacle_1', 'obstacle_1'),
        ('obstacle_2', 'obstacle_2'),
        ('obstacle_3', 'obstacle_3'),
    )
    platforms = models.CharField(max_length=10, choices=PLATFORMS)
    backgrounds = models.CharField(max_length=12, choices=BACKGROUNDS)
    obstacle = models.CharField(max_length=10, choices=OBSTACLES)