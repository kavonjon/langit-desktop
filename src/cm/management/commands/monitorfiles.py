import time, os, re, datetime, json
from cm.models import ScriptTracker, CollItemFile, OtherFile
from cm.views import get_file_modified_datetime
from django.core.management.base import BaseCommand

import cm.eaf2json2eaf as eje

from pathlib import Path
# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
media_path = str(BASE_DIR / 'media/')
media_path_length = len(media_path)

with open(BASE_DIR / 'static/file.json', 'r') as file:
    blank_file = json.load(file)

class Command(BaseCommand):
    def handle(self, **options):
        # now do the things that you want with your models here
        monitorfiles_tracker = ScriptTracker.objects.get(name='monitorfiles')
        monitorfiles_tracker.keep_running = True
        monitorfiles_tracker.currently_writing = False
        monitorfiles_tracker.save()

        last_update = ScriptTracker.objects.get(name='last_update')


        while True:
            if monitorfiles_tracker.keep_running:
                for root, dirs, files in os.walk(media_path):
                    if not monitorfiles_tracker.keep_running:
                        time.sleep(1)
                    for name in files:
                      current_path = os.path.join(root, name)[media_path_length:]
                      langit_deposits_match = re.search(r"^/[^/]{1,}/langit deposits", current_path)
                      if langit_deposits_match:
                          continue
                      collection_match = re.search(r"^/[^/]{1,}/([^/]{1,})\.json$", current_path)
                      item_match = re.search(r"^(/[^/]{1,})/([^/]{1,})/\2\.json$", current_path)
                      file_match_initial = re.search(r"^(/[^/]{1,}/([^/]{1,})/)([^/]{1,})\.json$", current_path)
                      file_match = None
                      if file_match_initial:
                          if file_match_initial.group(3) != file_match_initial.group(2):
                              file_match = file_match_initial
                      otherfile_match = re.search(r"^((/[^/]{1,}/([^/]{1,})/)([^/]{1,}))(\.(?!json)[^/]{1,})$", current_path)

                      # print(current_path)
                      if collection_match:
                          # print(collection_match.group(1))
                          # time.sleep(1)
                          identifier=collection_match.group(1)
                          level="collection"
                          parent=""
                      elif item_match:
                          # time.sleep(1)
                          identifier=item_match.group(2)
                          level="item"
                          parent_collection = CollItemFile.objects.get(file=media_path + item_match.group(1) + item_match.group(1) + ".json")
                          parent=parent_collection.id
                      elif file_match:
                          # time.sleep(1)
                          identifier=file_match.group(3)
                          level="file"
                          # print((media_path + file_match.group(1) + file_match.group(2) + ".json") )
                          parent_item = CollItemFile.objects.get(file= (media_path + file_match.group(1) + file_match.group(2) + ".json") )
                          parent=parent_item.id


                      if int(collection_match is not None) + int(item_match is not None) + int(file_match is not None) > 1:
                          raise Exception("Regex for %s in monitorfiles produced positives for multiple levels"%current_path)

                      if collection_match or item_match or file_match:
                          # print(collection_match.group(1))
                          file_mod_time = get_file_modified_datetime(media_path + current_path)
                          # print(file_mod_time)
                          collItemFileMatch = CollItemFile.objects.filter(file=media_path + current_path)
                          if collItemFileMatch:
                              collItemFile = CollItemFile.objects.get(file=media_path + current_path)

                          # print(collItemFile.updated)
                          # print(file_mod_time > collItemFile.updated)
                          if ( ( not collItemFileMatch ) or file_mod_time > collItemFile.updated):
                              # print(monitorfiles_tracker.keep_running)
                              monitorfiles_tracker.currently_writing = True
                              # print(monitorfiles_tracker.keep_running)
                              monitorfiles_tracker.save()
                              # print(monitorfiles_tracker.keep_running)

                              with open(media_path + current_path, 'r') as file:
                                  file_json = file.read()

                              collItemFile, created = CollItemFile.objects.get_or_create(file=media_path + current_path, defaults={"identifier": identifier, "json" : file_json, "level" : level, "parent" : parent})
                              if not created:
                                  collItemFile.json = file_json
                                  collItemFile.save()


                              monitorfiles_tracker.currently_writing = False
                              monitorfiles_tracker.save()

                              last_update.updated = datetime.datetime.now()
                              last_update.save()

                      if otherfile_match:
                          identifier=otherfile_match.group(4)
                          filename = otherfile_match.group(4) + otherfile_match.group(5)
                          if filename[-5:] == ".pfsx":
                              continue
                          parent_item = CollItemFile.objects.get(file=media_path + otherfile_match.group(2) + otherfile_match.group(3) + ".json")
                          parent=parent_item.id
                          file_mod_time = get_file_modified_datetime(media_path + current_path)
                          otherFile, created = OtherFile.objects.get_or_create(file=media_path + current_path, defaults={"identifier": filename, "parent" : parent})

                          if (created or file_mod_time > otherFile.updated):
                              monitorfiles_tracker.currently_writing = True
                              monitorfiles_tracker.save()
                              with open(media_path + otherfile_match.group(1) + ".json", "w") as write_file:
                                  new_otherfile_json = blank_file.copy()
                                  new_otherfile_json['identifier'] = identifier
                                  new_otherfile_json['filename'] = filename

                                  if filename[-4:] == ".eaf":
                                      annotations_meta, annotations = eje.read_elan(media_path + current_path)
                                      new_otherfile_json['annotations_meta'] = annotations_meta
                                      new_otherfile_json['annotations'] = annotations


                                  new_otherfile_json_dump = json.dumps(new_otherfile_json, separators=(",\n", " : "), indent=4)
                                  # print(new_otherfile_json_dump)
                                  write_file.write(new_otherfile_json_dump)

                              otherFile.save() # need to update updated field, even if nothing else

                              monitorfiles_tracker.currently_writing = False
                              monitorfiles_tracker.save()

                              last_update.updated = datetime.datetime.now()
                              last_update.save()



                for collItemFile in CollItemFile.objects.all():
                    if not monitorfiles_tracker.keep_running:
                        time.sleep(1)
                    if not os.path.isfile(collItemFile.file):
                        # print(collItemFile.file)

                        monitorfiles_tracker.currently_writing = True
                        monitorfiles_tracker.save()

                        collItemFile.delete()

                        monitorfiles_tracker.currently_writing = False
                        monitorfiles_tracker.save()

                        last_update.updated = datetime.datetime.now()
                        last_update.save()


                for otherFile in OtherFile.objects.all():
                    if not monitorfiles_tracker.keep_running:
                        time.sleep(1)
                    if not os.path.isfile(otherFile.file):
                        # print(otherFile.file)

                        monitorfiles_tracker.currently_writing = True
                        monitorfiles_tracker.save()

                        otherFile.delete()

                        monitorfiles_tracker.currently_writing = False
                        monitorfiles_tracker.save()

                        last_update.updated = datetime.datetime.now()
                        last_update.save()



                time.sleep(1)
