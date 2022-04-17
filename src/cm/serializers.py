from rest_framework import serializers
from .models import ScriptTracker, CollItemFile, OtherFile

class CollItemFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CollItemFile
        fields = ['id', 'identifier', 'file', 'json', 'level', 'parent']

class OtherFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = OtherFile
        fields = ['id', 'identifier', 'file', 'parent']

class ScriptTrackerSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScriptTracker
        fields = ['updated']
