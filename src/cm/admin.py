from django.contrib import admin

from .models import ScriptTracker, CollItemFile, OtherFile

# Register your models here.

admin.site.register(ScriptTracker)
admin.site.register(CollItemFile)
admin.site.register(OtherFile)
