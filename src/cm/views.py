import datetime
import json
import os, time
import shutil
import git

from openpyxl import Workbook, load_workbook
# from openpyxl.writer.excel import save_virtual_workbook

from django.utils.timezone import get_current_timezone
from django.utils.dateparse import parse_datetime
from django.utils.timezone import is_aware, make_aware

from django.shortcuts import render
from django.http import JsonResponse

from rest_framework.decorators import api_view
from rest_framework.response import Response
from .serializers import CollItemFileSerializer, OtherFileSerializer, ScriptTrackerSerializer

from .models import ScriptTracker, CollItemFile, OtherFile

from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver

import cm.eaf2json2eaf as eje

from pathlib import Path
# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent
with open(BASE_DIR / 'static/collection.json', 'r') as file:
    blank_collection = json.load(file)
with open(BASE_DIR / 'static/item.json', 'r') as file:
    blank_item = json.load(file)
with open(BASE_DIR / 'static/file.json', 'r') as file:
    blank_file = json.load(file)


# Create your views here.

@api_view(['GET'])
def apiOverview(request):
    api_urls = {
        'Last Update Datetime' : '/last-update/',
        'Coll/Item/File List' : '/collitemfile/list/',
        'Coll/Item/File Detail' : '/collitemfile/detail/<str:pk>/',
        'Coll/Item/File Create' : '/collitemfile/create/',
        'Coll/Item/File Update' : '/collitemfile/update/<str:pk>/',
        'Coll/Item/File Delete' : '/collitemfile/delete/<str:pk>/',
        'Other List' : '/otherfile/list/',
        'Collection git Initialize' : '/git/init/<str:pk>/',
        'Single Collection git Commit' : '/git/commit/<str:pk>/',
        'All Collections git Commit' : '/git/commit/all/',
        'Export Kaipu Deposit' : '/archive/',

    }

    return Response(api_urls)


@api_view(['GET'])
def getLastUpdatedTime(request):
    last_update = ScriptTracker.objects.get(name='last_update')

    serializer = ScriptTrackerSerializer(last_update, many=False)
    return Response(serializer.data)



@api_view(['GET'])
def collItemFileList(request):
    collItemFiles = CollItemFile.objects.all()

    # print(datetime.datetime.now())

    serializer = CollItemFileSerializer(collItemFiles, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def collItemFileDetail(request, pk):
    collItemFile = CollItemFile.objects.get(id=pk)

    # print(collItemFile.updated)


    serializer = CollItemFileSerializer(collItemFile, many=False)
    return Response(serializer.data)

@api_view(['POST'])
def collItemFileCreate(request):
    serializer = CollItemFileSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
    # collItemFile = CollItemFile.objects.get(identifier=serializer.data['identifier'])
    return Response(serializer.data)

@api_view(['GET'])
def otherFileList(request):
    otherFiles = OtherFile.objects.all()

    serializer = OtherFileSerializer(otherFiles, many=True)
    return Response(serializer.data)

@receiver(pre_save, sender=CollItemFile)
def pre_save_collItemFile(sender, instance, *args, **kwargs):
    monitorfiles_tracker = ScriptTracker.objects.get(name='monitorfiles')
    monitorfiles_tracker.keep_running = False
    monitorfiles_tracker.save()

    # I just commented this out. I would need a third flag to declare who is doing the save... not sure i need any of this
    # while monitorfiles_tracker.currently_writing:
    #     time.sleep(0.1)

    if instance.level == "collection":
        collItemFile_path = 'media/' + str(instance.identifier) + '/'
    elif instance.level == "item":
        parent_collection = CollItemFile.objects.get(pk=instance.parent)
        collItemFile_path = 'media/' + str(parent_collection.identifier) + '/' + str(instance.identifier) + '/'
    elif instance.level == "file":
        parent_item = CollItemFile.objects.get(pk=instance.parent)
        grandparent_collection = CollItemFile.objects.get(pk=parent_item.parent)
        collItemFile_path = 'media/' + str(grandparent_collection.identifier) + '/' + str(parent_item.identifier) + '/'

    try:
        old_instance = CollItemFile.objects.get(pk=instance.pk)
    except:
        old_instance = None
    if old_instance:
        if old_instance.identifier != instance.identifier:
            if instance.level == "collection":
                old_collItemFile_path = 'media/' + str(old_instance.identifier) + '/'
            elif instance.level == "item":
                old_collItemFile_path = 'media/' + str(old_instance.parent) + '/' + str(old_instance.identifier) + '/'
            elif instance.level == "file":
                old_parent_item = CollItemFile.objects.get(pk=instance.parent)
                old_collItemFile_path = 'media/' + str(old_parent_item.parent) + '/' + str(old_instance.parent) + '/'

            try:
                os.rename(BASE_DIR / old_collItemFile_path, BASE_DIR / collItemFile_path)

            except:
                pass#need to add error handling for when folder isn't made for reason other than 'exists'
            try:
                os.rename(BASE_DIR / (collItemFile_path + str(old_instance.identifier) + ".json"), \
                          BASE_DIR / (collItemFile_path + str(instance.identifier) + ".json"))
            except:
                pass # need error handling

        if instance.level == "collection":
            child_items = CollItemFile.objects.filter(level="item").filter(parent=old_instance.id)
            for child_item in child_items:
                child_item.parent = instance.id
                child_item.file = str( BASE_DIR / (collItemFile_path + str(child_item.identifier) + '/' + str(child_item.identifier) + ".json") )
                grandchild_files = CollItemFile.objects.filter(level="file").filter(parent=child_item.id)
                for grandchild_file in grandchild_files:
                    grandchild_file.parent = child_item.id
                    grandchild_file.file = str( BASE_DIR / (collItemFile_path + str(child_item.identifier) + '/' + str(grandchild_file.identifier) + ".json") )
        elif instance.level == "item":
            child_files = CollItemFile.objects.filter(level="file").filter(parent=old_instance.id)
            for child_file in child_files:
                child_file.parent = instance.id
                child_file.file = str( BASE_DIR / (collItemFile_path + str(child_file.identifier) + ".json") )

    instance.file = str( BASE_DIR / (collItemFile_path + str(instance.identifier) + ".json") )

    try:
        os.makedirs(BASE_DIR / collItemFile_path)
    except:
        pass#need to add error handling for when folder isn't made for reason other than 'exists'

    monitorfiles_tracker = ScriptTracker.objects.get(name='monitorfiles')

    # print(instance.identifier)
    # print(monitorfiles_tracker.currently_writing)
    if not monitorfiles_tracker.currently_writing: # if monitorfiles triggered this save, this cant happen
        with open(instance.file, "w") as write_file:
            write_file.write(instance.json)

        if instance.level == "file":
             instance_json = json.loads(instance.json)
             if instance_json["filename"][-4:] == ".eaf":
                 annotation_changes = [];
                 old_instance_json = json.loads(old_instance.json)
                 instance_annotations = instance_json['annotations']
                 old_instance_annotations = old_instance_json['annotations']

                 for old_annotation_key, old_annotation_values in old_instance_annotations.items():
                     if old_annotation_key in instance_annotations:
                         if old_instance_annotations[old_annotation_key] != instance_annotations[old_annotation_key]:
                             old_annotation = old_instance_annotations[old_annotation_key]
                             annotation = instance_annotations[old_annotation_key]
                             for old_annotation_tier, old_annotation_tier_value in old_annotation.items():
                                 if old_annotation_tier in annotation:
                                     if old_annotation[old_annotation_tier] != annotation[old_annotation_tier]:
                                         annotation_changes.append({"unique_id": annotation["unique_id"],
                                                                    "tier" : old_annotation_tier,
                                                                    "value" : annotation[old_annotation_tier]})
                 # print(annotation_changes)
                 eje.write_elan_annotation(str(BASE_DIR / (collItemFile_path + str(instance_json["filename"]))), annotation_changes)



    instance.updated = get_file_modified_datetime(instance.file)


def get_file_modified_datetime(path):
    # https://newbedev.com/parsing-a-datetime-string-into-a-django-datetimefield
    modified_time = os.path.getmtime(path)
    convert_time = time.localtime(modified_time)
    format_time = time.strftime('%Y-%m-%d %H:%M:%S', convert_time)
    dt = parse_datetime(format_time)
    if not is_aware(dt):
        dt = make_aware(dt)
    return dt



@receiver(post_save, sender=CollItemFile)
def add_json_to_collItemFile(sender, instance, created, *args, **kwargs):
    if instance.level == "collection":
        collItemFile_path = 'media/' + str(instance.identifier) + '/'
    elif instance.level == "item":
        parent_collection = CollItemFile.objects.get(pk=instance.parent)
        collItemFile_path = 'media/' + str(parent_collection.identifier) + '/' + str(instance.identifier) + '/'
    elif instance.level == "file":
        parent_item = CollItemFile.objects.get(pk=instance.parent)
        grandparent_collection = CollItemFile.objects.get(pk=parent_item.parent)
        collItemFile_path = 'media/' + str(grandparent_collection.identifier) + '/' + str(parent_item.identifier) + '/'

    if created:
        # try:
        #     os.makedirs(BASE_DIR / collItemFile_path)
        # except:
        #     pass#need to add error handling for when folder isn't made for reason other than 'exists'
        if instance.json == "":
            if instance.level == "collection":
                new_collitemfile_json = blank_collection.copy()
            elif instance.level == "item":
                new_collitemfile_json = blank_item.copy()
            elif instance.level == "file":
                new_collitemfile_json = blank_file.copy()
            new_collitemfile_json['identifier'] = instance.identifier
            instance.json = json.dumps(new_collitemfile_json, separators=(",\n", " : "), indent=4)
            instance.file = str( BASE_DIR / (collItemFile_path + str(instance.identifier) + ".json") )

        # with open(instance.file, "w") as write_file:
        #     write_file.write(instance.json)

            instance.save()

    monitorfiles_tracker = ScriptTracker.objects.get(name='monitorfiles')
    monitorfiles_tracker.keep_running = True
    monitorfiles_tracker.save()

    last_update = ScriptTracker.objects.get(name='last_update')
    last_update.updated = datetime.datetime.now()
    last_update.save()



@api_view(['POST'])
def collItemFileUpdate(request, pk):
    collItemFile = CollItemFile.objects.get(id=pk)
    with open(collItemFile.file, "r") as file:
        try:
            file_json = json.load(file)
        except:
            if collItemFile.level == "collection":
                file_json = blank_collection.copy()
            elif collItemFile.level == "item":
                file_json = blank_item.copy()
            elif collItemFile.level == "file":
                file_json = blank_file.copy()

    incoming_json = json.loads(request.data['json'])

    # print(incoming_json)

    for key, value in incoming_json.items():
        file_json[key] = value

    request.data['json'] = json.dumps(file_json, separators=(",\n", " : "))

    serializer = CollItemFileSerializer(instance=collItemFile,data=request.data)
    # print(serializer)
    if serializer.is_valid():
        serializer.save()
    return Response(serializer.data)

@api_view(['DELETE'])
def collItemFileDelete(request, pk):
    collItemFile = CollItemFile.objects.get(id=pk)
    collItemFile.delete()
    return Response('Item successfully deleted')


@api_view(['POST'])
def git_init(request, pk):
    collection = CollItemFile.objects.get(id=pk)

    if collection.level != 'collection':
        return Response('Selection is not a collection')

    collection_path = 'media/' + str(collection.identifier) + '/'

    git_user = {"name": request.data['name'],
                "email": request.data['email']
               }

    # go inside folder
    try:
        # use gitpython to check for git
        repo = git.Repo(collection_path)
    except git.exc.InvalidGitRepositoryError:
        # if doesn't exist, run init, add, username, email, and commit
        print("no repo")
        repo = git.Repo.init(collection_path)
        # repo.git.status()
        repo.config_writer().set_value("user", "name", git_user["name"]).release()
        repo.config_writer().set_value("user", "email", git_user["email"]).release()
        message_begin = "Repo initialized, "
        add_defaults_to_gitignore(collection_path)


    else:
        # if exists, return already exists
        message_begin = "Repo already exists, "
    finally:

        collection_json = json.loads(collection.json)
        collection_json["version_control"]["last"] = str(datetime.datetime.now()).split(".")[0]


        collection.json = json.dumps(collection_json, separators=(",\n", " : "))
        collection.save()

        run_git_commit(repo)
        return Response(message_begin + "new commit made")


def add_defaults_to_gitignore(collection_path):

    gitignore_text = """#langit
/langit exports/"""

    with open(collection_path + "/.gitignore", "w") as write_file:
        write_file.write(gitignore_text)


def run_git_commit(repo):
    repo.git.add(".")
    repo.git.commit(m="langit auto commit")


def git_commit(collection):

    collection_path = 'media/' + str(collection.identifier) + '/'

    # go inside folder
    try:
        # use gitpython to check for git
        repo = git.Repo(collection_path)
    except git.exc.InvalidGitRepositoryError:
        # if doesn't exist, return
        return Response("no repo")

    collection_json = json.loads(collection.json)
    collection_json["version_control"]["last"] = str(datetime.datetime.now()).split(".")[0]


    collection.json = json.dumps(collection_json, separators=(",\n", " : "))
    collection.save()

    run_git_commit(repo)


@api_view(['GET'])
def git_commit_single(request, pk):

    collection = CollItemFile.objects.get(id=pk)

    if collection.level != 'collection':
        return Response('Selection is not a collection')

    git_commit(collection)

    return Response("new commit made")

@api_view(['GET'])
def git_commit_all(request):

    collections = CollItemFile.objects.filter(level="collection")
    for collection in collections:
        collection_json = json.loads(collection.json)
        if collection_json["version_control"]["enabled"] == "yes":
            git_commit(collection)
            time.sleep(1)

    return Response("new commits made")

@api_view(['GET'])
def build_kaipu_export(request, pk):
    collection = CollItemFile.objects.get(id=pk)

    if collection.level != 'collection':
        return Response('Selection is not a collection')

    # make directories for deposit
    collection_deposits_path = 'media/' + str(collection.identifier) + '/langit deposits/'
    try:
        os.makedirs(BASE_DIR / collection_deposits_path)
    except:
        pass

    folder_suffix = ""
    folder_n = 0
    while folder_n < 10000: #just to stop the while loop before heat death of the universe
        test_dir = collection_deposits_path+str(datetime.date.today()) + folder_suffix
        # print(BASE_DIR / test_dir)
        if not os.path.isdir(BASE_DIR / test_dir):
            try:
                os.makedirs(BASE_DIR / test_dir)
                break
            except:
                message = "couldn't make deposit dir on generating deposit"
                print(message)
                return Response(message)
        else:
            folder_n += 1
            folder_suffix = "-"+str(folder_n)


    # get items
    items = CollItemFile.objects.filter(level="item").filter(parent=pk)

    new_workbook = Workbook()
    sheet = new_workbook.active
    headers1 = ['Item Name',
                'File Name',
                'Content language name',
                'Content language code',
                'Subject language name',
                'Subject language code',
                'Subject language name, ISO',
                'Region Description',
                'Description',
                'Contributor: depositor',
                'Contributor: speaker',
                'Contributor: participant',
                'Contributor: researcher',
                'Contributor: consultant',
                'Contributor: interviewer',
                'Contributor: recorder',
                'Contributor: author',
                'Date begin',
                'Date end',
                'Linguistic type',
                'Type of media',
                'Running time of digital item',
                ]
    headers2 = ['dc.title[en_US]',
                'bitstreams',
                'dc.content.language[en_US]',
                'dc.content.languagecode[en_US]',
                'dc.subject.language[en_US]',
                'dc.subject.languagecode[en_US]',
                'dc.language.iso[en_US]',
                'dc.description.region[en_US]',
                'dc.description[en_US]',
                'dc.contributor.depositor[en_US]',
                'dc.contributor.speaker[en_US]',
                'dc.contributor.participant[en_US]',
                'dc.contributor.researcher[en_US]',
                'dc.contributor.consultant[en_US]',
                'dc.contributor.interviewer[en_US]',
                'dc.contributor.recorder[en_US]',
                'dc.contributor.author[en_US]',
                'dc.date.begin[en_US]',
                'dc.date.finish[en_US]',
                'dc.type.linguistictype[en_US]',
                'dc.format[en_US]',
                'dc.format.extent[en_US]',
                ]
    sheet.append(headers1)
    sheet.append(headers2)

    for item in items:
        item_json = json.loads(item.json)
        content_languages = []
        content_ISOs = []
        subject_languages = []
        subject_ISOs = []
        # print(item_json)
        for language in item_json["languages"].values():
            # print(language)
            content_languages.append(language["name"])
            content_ISOs.append(language["code"])
            if language["subject"] == "subject":
                subject_languages.append(language["name"])
                subject_ISOs.append(language["code"])
        depositor = []
        speaker = []
        participant = []
        researcher = []
        consultant = []
        interviewer = []
        recorder = []
        author = []
        for person in item_json["people"].values():
            if "depositor" in person["roles"]:
                depositor.append(person["name"])
            if "speaker" in person["roles"]:
                speaker.append(person["name"])
            if "participant" in person["roles"]:
                participant.append(person["name"])
            if "researcher" in person["roles"]:
                researcher.append(person["name"])
            if "consultant" in person["roles"]:
                consultant.append(person["name"])
            if "interviewer" in person["roles"]:
                interviewer.append(person["name"])
            if "recorder" in person["roles"]:
                recorder.append(person["name"])
            if "author" in person["roles"]:
                author.append(person["name"])

        # get files
        bitstreams = []
        format = []
        extent = []
        files = CollItemFile.objects.filter(level="file").filter(parent=item.id)
        for file in files:
            file_json = json.loads(file.json)
            if file_json["archive"]["should"] == "no":
                continue
            if file_json["filename"]:
                bitstreams.append(file_json["filename"])
            if file_json["format"]:
                format.append(file_json["format"])
            if file_json["extent"]:
                extent.append(file_json["extent"])
            shutil.copyfile(file.file, BASE_DIR / (test_dir + "/" + file_json["filename"] ) )
        if len(bitstreams) == 0:
            continue

        row = [item.identifier,
               "||".join(bitstreams),
               "||".join(content_languages),
               "||".join(content_ISOs),
               "||".join(subject_languages),
               "||".join(subject_ISOs),
               "",
               item_json["region_description"],
               item_json["description"],
               "||".join(depositor),
               "||".join(speaker),
               "||".join(participant),
               "||".join(researcher),
               "||".join(consultant),
               "||".join(interviewer),
               "||".join(recorder),
               "||".join(author),
               item_json["date_begin"],
               item_json["date_end"],
               item_json["linguistic_type"],
               "||".join(list(set(format))),
               "||".join(extent),
               ]
        sheet.append(row)



    filepath = BASE_DIR / (test_dir + "/" + collection.identifier + ".xlsx" )
    new_workbook.save(filepath)

    return Response('Archive deposit created')
