import defusedxml.ElementTree as ET
import json, re

def read_elan(elan_filepath):
    root = ET.parse(elan_filepath).getroot()
    global annotations_meta
    annotations_meta = {"tiers" : read_tier_meta(root)}
    annotations_meta["tier_hierarchy"] = build_tier_hierarchy(root)
    annotations_meta["references"] = read_references(root, elan_filepath)
    sort_tier_meta()
    # print(json.dumps(annotations_meta, indent=4))
    # tier_hierarchy_json = json.dumps(tier_hierarchy, indent=4)
    global annotations
    annotations = {}
    read_elan_annotations(root, {"id" : None, "children" : annotations_meta["tier_hierarchy"]})
    sort_annotations()
    # print(json.dumps(annotations, indent=4))
    return annotations_meta, annotations

def make_new_dict_key(dictionary):
    return str(len(dictionary)+1)

def read_references(root, elan_filepath):
    elan_reference = root.find("HEADER/MEDIA_DESCRIPTOR")

    item_path_match = re.search(r"^(.*/).*?\.eaf$", elan_filepath)
    item_path = item_path_match.group(1)

    relative_url = elan_reference.get("RELATIVE_MEDIA_URL")
    if relative_url[0:2] == "./":
        relative_url = relative_url[2:]

    reference_path = item_path + relative_url

    references = {"1" : {"relative_url" : relative_url,
                         "url" : reference_path,
                         "mime_type" : elan_reference.get("MIME_TYPE")}}
    return references


def read_tier_meta(root):
    tier_meta = {}
    for tier in root.findall("TIER"):
        key = make_new_dict_key(tier_meta)
        tier_value = {"id" : tier.get("TIER_ID"),
                      "type_id" : tier.get("LINGUISTIC_TYPE_REF")}
        parent = tier.get("PARENT_REF")
        if parent:
            tier_value["parent"] = parent
        else:
            tier_value["parent"] = ""
        type = root.find("./LINGUISTIC_TYPE[@LINGUISTIC_TYPE_ID='%s']"%tier_value["type_id"]).get("CONSTRAINTS")
        if type:
            tier_value["type"] = type
            tier_value["type_description"] = root.find("./CONSTRAINT[@STEREOTYPE='%s']"%tier_value["type"]).get("DESCRIPTION")
        else:
             tier_value["type"] = ""
             tier_value["type_description"] = ""
        tier_meta[key] = tier_value
    return tier_meta


def populate_tier_hierarchy(tier_dictionary, tier_list, tier_enumerator):
    for index in range((len(tier_list)-1), -1, -1 ):
        if tier_list[index].get("PARENT_REF") == tier_dictionary["id"]:
            key = make_new_dict_key(tier_dictionary["children"])

            id = tier_list.pop(index).get("TIER_ID")
            tier_dictionary["children"][key] = {"id" : id,
                                   "children" : {}}

            get_tier_meta(id)["order"] = tier_enumerator
            tier_enumerator += 1
    return tier_dictionary, tier_enumerator


def build_tier_hierarchy(root):

    tier_hierarchy = {"id" : None,
                      "children" : {}}
    tier_list = root.findall("TIER")
    unpopped = 0
    tier_enumerator = 1
    tier_hierarchy, tier_enumerator = populate_tier_hierarchy(tier_hierarchy, tier_list, tier_enumerator)

    while len(tier_list) != unpopped:
        for tier in tier_hierarchy["children"].values():
            tier, tier_enumerator = populate_tier_hierarchy(tier, tier_list, tier_enumerator)
            for tier_child in tier["children"].values(): # support for grandchildren
                tier_child, tier_enumerator = populate_tier_hierarchy(tier_child, tier_list, tier_enumerator)
        unpopped = len(tier_list)

    return tier_hierarchy["children"]


def sort_tier_meta():
    sorted_list = sorted(annotations_meta["tiers"].values(), key=lambda x:x["order"])
    annotations_meta["tiers"] = {}
    for index, tier in enumerate(sorted_list, start=1):
        annotations_meta["tiers"][index] = tier


# for iter through heirarchy, to get tier id
# for each key, for each key, for each key (gets down to grandparents)

def get_object_by_value_in_object(parent_object, child_key, child_value):
    object = None
    for key, value in parent_object.items():
        if value[child_key] == child_value:
            object = parent_object[key]
    # if object == None:
    #     raise Exception('no child object in %s with %s "%s"'%(parent_object, child_key, child_value))
    # else:
    #     return object
    return object

def get_tier_meta(tier_id):
    return get_object_by_value_in_object(annotations_meta["tiers"], "id", tier_id)

def get_annotation_by_unique_id(annotation_unique_id):
    return get_object_by_value_in_object(annotations, "unique_id", annotation_unique_id)

def get_timestamp(root, time_slot_id):
    return root.find("./TIME_ORDER/TIME_SLOT/[@TIME_SLOT_ID='%s']"%time_slot_id).get("TIME_VALUE")

def make_human_readable_timestamp(timestamp_milliseconds):
    timestamp = int(timestamp_milliseconds)
    ms = timestamp%1000
    seconds=(timestamp/1000)%60
    seconds = int(seconds)
    minutes=(timestamp/(1000*60))%60
    minutes = int(minutes)
    hours=(timestamp/(1000*60*60))%24
    return "%02d:%02d:%02d.%03d" % (hours, minutes, seconds, ms)


def read_elan_annotations(root, tier_dictionary):
    if tier_dictionary["children"] == {}:
        return
    for tier in tier_dictionary["children"].values():
        read_tier_annotations(root, tier)
        read_elan_annotations(root, tier)

def read_tier_annotations(root, tier):

    tier_type = get_tier_meta(tier["id"])["type"]

    if tier_type == "":
        read_this_type_of_annotation = read_default_annotation
    elif tier_type == "Symbolic_Association":
        read_this_type_of_annotation = read_symbolic_association_annotation
    else:
        read_this_type_of_annotation = None

    annotation_list = root.findall("./TIER[@TIER_ID='%s']/ANNOTATION"%tier["id"])
    for annotation in annotation_list:
        read_this_type_of_annotation(root, annotation, tier)

def read_default_annotation(root, annotation, tier):
    alignable = annotation.find("ALIGNABLE_ANNOTATION")
    if alignable:
        key = make_new_dict_key(annotations)
        timestamp_begin = get_timestamp(root, alignable.get("TIME_SLOT_REF1"))
        timestamp_end = get_timestamp(root, alignable.get("TIME_SLOT_REF2"))
        annotations[key] = {tier["id"] : alignable.find("ANNOTATION_VALUE").text,
                            "unique_id" : alignable.get("ANNOTATION_ID"),
                            "timestamp_begin" : timestamp_begin,
                            "timestamp_begin_human_readable" : make_human_readable_timestamp(timestamp_begin),
                            "timestamp_end" : timestamp_end,
                            "timestamp_end_human_readable" : make_human_readable_timestamp(timestamp_end)}

def read_symbolic_association_annotation(root, annotation, tier):
    reference = annotation.find("REF_ANNOTATION")
    if reference:
        # tier_meta = get_tier_meta(tier["id"])
        # tier_parent_id = tier_meta["parent"]
        parent_annotation_id = reference.get("ANNOTATION_REF")
        parent_annotation = get_annotation_by_unique_id(parent_annotation_id)
        reference_value = reference.find("ANNOTATION_VALUE").text
        if reference_value:
            parent_annotation[tier["id"]] = reference_value
        else:
            parent_annotation[tier["id"]] = ""



def get_highest_tier_order(annotation):

    order_list = []
    for tier in annotation.keys():
        if get_tier_meta(tier):
            order_list.append(get_tier_meta(tier)["order"])
    print(order_list)
    return min(order_list)

def sort_annotations():
    global annotations
    sorted_list = sorted(annotations.values(), key=lambda x:(float(x["timestamp_begin"]), get_highest_tier_order(x)))
    annotations = {}
    for index, annotation in enumerate(sorted_list, start=1):
        annotations[index] = annotation

# for each annotation in tier
# check for tier type
# make annotation based on type/properties
# add as new annotation or addition to parent based on type/properties



def write_elan_annotation(elan_filepath, changes):
    current_annotations_meta, current_annotations = read_elan(elan_filepath)
    tree = ET.parse(elan_filepath)
    root = tree.getroot()

    for change in changes:
        change_tier = get_tier_meta(change["tier"])
        if change_tier["type"] == "":
            elan_annotation_value = root.find("./TIER[@TIER_ID='%s']/ANNOTATION/ALIGNABLE_ANNOTATION[@ANNOTATION_ID='%s']/ANNOTATION_VALUE"%(change["tier"],change["unique_id"]))
            elan_annotation_value.text = change["value"]
            tree.write(elan_filepath)
        elif change_tier["type"] == "Symbolic_Association":
            elan_annotation_value = root.find("./TIER[@TIER_ID='%s']/ANNOTATION/REF_ANNOTATION[@ANNOTATION_REF='%s']/ANNOTATION_VALUE"%(change["tier"],change["unique_id"]))
            elan_annotation_value.text = change["value"]
            tree.write(elan_filepath)
