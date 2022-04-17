from django.apps import AppConfig


class CmConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'cm'

    def ready(self):
        # importing model classes
        from .models import CollItemFile  # or...
        CollItemFile = self.get_model('CollItemFile')

        # # registering signals with the model's string label
        # pre_save.connect(receiver, sender='app_label.MyModel')



class ScriptTrackerConfig(AppConfig):
    # default_auto_field = 'django.db.models.BigAutoField'
    name = 'scriptTracker'

    def ready(self):
        # importing model classes
        from .models import ScriptTracker  # or...
        ScriptTracker = self.get_model('ScriptTracker')

        last_update = ScriptTracker.objects.get(name='last_update')
        last_update.updated = datetime.datetime.now()
        last_update.save()

        # # registering signals with the model's string label
        # pre_save.connect(receiver, sender='app_label.MyModel')
