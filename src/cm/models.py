from django.db import models
from pathlib import Path

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Create your models here.

class ScriptTracker(models.Model):
    name = models.CharField(max_length=255)
    keep_running = models.BooleanField()
    currently_writing = models.BooleanField()
    updated = models.DateTimeField(blank=True)
    def __str__(self):
        return self.name

class CollItemFile(models.Model):
    identifier = models.CharField(max_length=255)
    file = models.FilePathField(path= str(BASE_DIR / 'media'), recursive=True, null=True, blank=True)
    json = models.TextField(blank=True)
    level = models.CharField(max_length=255)
    parent = models.CharField(max_length=255, blank=True)
    updated = models.DateTimeField(blank=True)

    class Meta:
        ordering = ['identifier']
    def __str__(self):
        return self.identifier


class OtherFile(models.Model):
    identifier = models.CharField(max_length=255)
    file = models.FilePathField(path= str(BASE_DIR / 'media'), recursive=True, unique=True)
    parent = models.CharField(max_length=255)
    updated = models.DateTimeField(auto_now=True)
    class Meta:
        ordering = ['identifier']
    def __str__(self):
        return self.identifier
