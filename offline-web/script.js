'use strict';

const ontop = document.querySelector('.ontop');
const ontopAll = document.querySelectorAll('.ontop');
const overlay = document.querySelector('.overlay');
const btnsCloseOntop = document.querySelectorAll('.btn--close-ontop');
const section1 = document.querySelector('#section--1');
const nav = document.querySelector('.nav');

const btnSettings = document.querySelector('.nav__settings');
const settingsMenu = document.querySelector('.nav__settings_menu');
const settingsMenuGitSettings = document.querySelector('.settings__items__git_settings');

const ontopGitSettings = document.querySelector('.ontop__git_settings')
const ontopGitSettingsEnabled = document.querySelector('.ontop__git_settings__toggle')
const ontopGitSettingsName = document.querySelector('.ontop__git_settings__name--value')
const ontopGitSettingsEmail = document.querySelector('.ontop__git_settings__email--value')

const btnArchive = document.querySelector('.btn--archive');

const ontopNewCollection = document.querySelector('.ontop__new-collection');
const btnOpenOntopNewCollection = document.querySelector('.btn--show-ontop-new-collection');

const collectionsList = document.querySelector('.collections');
let collectionsListCollItemFiles;

const btnNewCollectionAdd = document.querySelector('.form__btn__new-collection');
const inputNewCollectionIdentifier = document.querySelector('.form__input__new-collection--identifier');

const ontopPreOpen = document.querySelector('.ontop__pre-open');
const btnPreOpenDont = document.querySelector('.form__btn__pre-open-dont');
const btnPreOpenOverwrite = document.querySelector('.form__btn__pre-open-overwrite');

const contentCollection = document.querySelector('.content__collection');
const contentCollectionIdentifierValue = document.querySelector('.collection__identifier--value');
const btnContentCollectionDelete = document.querySelector('.btn--collection__delete');
const contentCollectionNameValue = document.querySelector('.collection__name--value');
const contentCollectionDescriptionValue = document.querySelector('.collection__description--value');
const contentCollectionAcquisitionValue = document.querySelector('.collection__acquisition_info--value');
const contentCollectionScopeValue = document.querySelector('.collection__scope--value');
const contentCollectionItemListTitle = document.querySelector('.collection__itemlist__title');

const itemsInCollectionList = document.querySelector('.items_in_collection');
let itemsInCollectionListItems;

const btnNewItemAdd = document.querySelector('.btn--itemlist__search__add');
const inputItemListSearch = document.querySelector('.itemlist__search');

const contentItem = document.querySelector('.content__item');
const contentItemIdentifierValue = document.querySelector('.item__identifier--value');
const btnContentItemDelete = document.querySelector('.btn--item__delete');
const contentItemDescriptionValue = document.querySelector('.item__description--value');
const contentItemLanguages = document.querySelector('.item__languages');
let contentItemEachLanguageName;
let contentItemEachLanguageCode;
let contentItemEachLanguageSubject;
const btnNewLanguageInItem = document.querySelector('.btn--item__languages__add');
let btnNewLanguageInItemListener;
const contentItemRegionValue = document.querySelector('.item__region--value');
const contentItemPeople = document.querySelector('.item__people');
let contentItemEachPersonName;
let contentItemEachPersonRoles;
const btnNewPersonInItem = document.querySelector('.btn--item__people__add');
let btnNewPersonInItemListener;
const contentItemDateBeginValue = document.querySelector('.item__date_begin--value');
const contentItemDateEndValue = document.querySelector('.item__date_end--value');
const contentItemLinguisticTypeValue = document.querySelector('.item__linguistic_type--value');
const contentItemFileListTitle = document.querySelector('.item__filelist__title');


const filesInItemList = document.querySelector('.files_in_item');
let filesInItemListFiles;

const btnNewFileAdd = document.querySelector('.btn--filelist__search__add');
const inputFileListSearch = document.querySelector('.filelist__search');

const contentFile = document.querySelector('.content__file');
const contentFileIdentifierValue = document.querySelector('.file__identifier--value');
const contentFileFilenameValue = document.querySelector('.file__filename--value');
const contentFileFormatValue = document.querySelector('.file__format--value');
const contentFileExtentValue = document.querySelector('.file__extent--value');
const btnContentFileDelete = document.querySelector('.btn--file__delete');
const contentFileAudioPlayerContainer = document.querySelector('.content_file__audio');
const contentFileAudioPlayer = document.querySelector('.file__audio');
const contentFileAudioSource = document.querySelector('.file__audio_source');
const contentFileSearchBox = document.querySelector('.content_file__search');
const contentFileSearchValue = document.querySelector('.file__search--value');
let contentFileSearchValueListener;
const contentFileSearchTiers = document.querySelector('.file__search__tiers');
let contentFileSearchTiersSelect;
let contentFileSearchTiersSelectListener;
const contentFileAnnotations = document.querySelector('.file__annotations_list');
let contentFileAnnotationsVisible;
let contentFileAnnotationsFocus;

const ontopAnnotationsExport = document.querySelector('.ontop__export_annotations');
const btnAnnotationsExport = document.querySelector('.btn--file__annotations__export');
const annotationsExportFilterTiers = document.querySelector('.ontop__export_annotations__tiers');
const annotationsExportPrefixValue = document.querySelector('.ontop__export_annotations__prefix--value');
let annotationsExportFilterTiersSelect;
let annotationsExportListener;

let annotationTierLabels;
let annotationLines;
let annotationLinesListener;
let annotationValues;
let annotationValueActive;

const annotationsExportAnnotations = document.querySelector('.ontop__export_annotations__annotations_output');

const tooltipCollectionListCollection = document.querySelector('.tooltip__collection_list__collection');
const tooltipCollectionListCollectionGit = document.querySelector('.tooltip__collection_list__collection__git_toggle');
const btnTooltipCollectionListCollectionCommit = document.querySelector('.btn--tooltip__collection_list__collection__commit_now');

const tooltipCollectionListFile = document.querySelector('.tooltip__collection_list__file');
const tooltipCollectionListFileArchive = document.querySelector('.tooltip__collection_list__file__archive_toggle');

// let manageCollectionEditsBind;
let manageItemEditsBind;


// classes

class AnyFile {
  constructor(json) {
    this.id = json.id; //
    this.identifier = json.identifier;
    this.file = json.file;
    this.parent = json.parent;
  }
}

class CollItemFile extends AnyFile {

  constructor(json) {
    super(json);
    try { // parse JSON
      this.json = JSON.parse(json.json);
    }
    catch (e) { // load as string if not valid JSON
      this.json = json.json;
    }
    this.level = json.level;

  }

}

class Collection extends CollItemFile {
  constructor(json) {
    super(json);
  }
}

class Item extends CollItemFile {
  constructor(json) {
    super(json);
  }
}

class File extends CollItemFile {
  constructor(json) {
    super(json);
  }
}

class OtherFile extends AnyFile {
  constructor(json) {
    super(json);
  }
}


class App {
  #collections = {};
  #collectionsEdited = {};
  #items = {};
  #itemsEdited = {};
  #files = {};
  #filesEdited = {};
  #otherfiles = {};
  #otherfilesEdited = {};
  #settings = {};
  #activeItem = 0;
  #csrftoken = this._getCookie('csrftoken');
  #timeoutCollectionPage
  #timeoutItemPage
  #intervalPlayback
  #timeoutSearch
  #timeoutTooltip
  #timeoutGit
  #lastUpdatePush
  #lastUpdatePushTimer

  constructor() {

    document.addEventListener('keydown', this._escapeKeyAction.bind(this));
    document.addEventListener('click', this._clickawayEditAnnotation.bind(this));

    this._init();

    btnSettings.addEventListener('click', this._toggleSettingsMenu);
    settingsMenuGitSettings.addEventListener('click', this._openGitSettingsMenu);

    this._loadData();

    btnArchive.addEventListener('click', this._archive.bind(this));

    btnOpenOntopNewCollection.addEventListener('click', this._displayNewCollectionBox.bind(this));

    btnsCloseOntop.forEach((btn) => btn.addEventListener('click', this._hideAllOntop));
    overlay.addEventListener('click', this._hideAllOntop);

    btnNewCollectionAdd.addEventListener('click', this._createNewCollection.bind(this));
    btnNewItemAdd.addEventListener('click', this._createNewItem.bind(this));
    btnNewFileAdd.addEventListener('click', this._createNewFile.bind(this));

    this._listenCollectionEdits();
    this._listenItemEdits();
    this._listenFileEdits();
    this._listenTooltipEdits();

    btnContentCollectionDelete.addEventListener('click', this._deleteCollection.bind(this));
    btnContentItemDelete.addEventListener('click', this._deleteCollection.bind(this));
    btnContentFileDelete.addEventListener('click', this._deleteCollection.bind(this));


    this.#lastUpdatePushTimer = window.setInterval(this._checkUpdates.bind(this), 1000);

    //currently needed for languages/people
    manageItemEditsBind = this._manageItemEdits.bind(this)

    this.#intervalPlayback = window.setInterval(this._scrollPlayback.bind(this), 1000);


    btnAnnotationsExport.addEventListener('click', this._exportAnnotations.bind(this));

    annotationLinesListener = this._tierToggle.bind(this);
    tooltipCollectionListFile.addEventListener("mouseleave", this._hideTooltipCollectionList.bind(this));
    tooltipCollectionListCollection.addEventListener("mouseleave", this._hideTooltipCollectionList.bind(this));
    btnTooltipCollectionListCollectionCommit.addEventListener("click", this._gitCommitFromTooltip.bind(this));


    this.#settings = {"showAnnotationTiers" : true,
                      "search" : {},
                      "export" : {}}

    this.#timeoutGit = window.setInterval(this._gitAutomatedCommits.bind(this), 600000);


  }


  _init() {
    contentCollectionIdentifierValue.value = '';
    contentCollectionItemListTitle.textContent = "Items in collection";
    contentCollectionNameValue.value = '';
    contentCollectionDescriptionValue.value = '';
    contentCollectionAcquisitionValue.value = '';
    contentCollectionScopeValue.value = '';

    contentItemIdentifierValue.value = '';
    contentItemFileListTitle.textContent = "Files in item";

    contentItemDescriptionValue.value = '';
    // contentItemLanguagesValue.value = '';
    contentItemRegionValue.value = '';
    // contentItemPeopleValue.value = '';
    contentItemDateBeginValue.value = '';
    contentItemDateEndValue.value = '';
    contentItemLinguisticTypeValue.value = '';

    contentFileIdentifierValue.value = '';
    contentFileFilenameValue.value = '';
    contentFileFormatValue.value = '';
    contentFileExtentValue.value = '';
    contentFileSearchValue.value = '';

    annotationsExportAnnotations.value = '';

    this._activateContentArea(contentCollection);
  }


  _toggleSettingsMenu(){
    settingsMenu.classList.toggle('hidden');
  }


  _openGitSettingsMenu(){
    settingsMenu.classList.add('hidden');
    overlay.classList.remove('hidden');
    ontopGitSettings.classList.remove('hidden');
  }


  async _checkUpdates() {
    const checkUpdateTime = await fetch('http://127.0.0.1:8000/api/last-update/')
    const checkUpdateTimeData = await checkUpdateTime.json()
    await this._pullUpdates(checkUpdateTimeData)
    // console.log(checkUpdateTimeData);


  }

  _pullUpdates(checkUpdateTimeData){
    if (!this.#lastUpdatePush || this.#lastUpdatePush < checkUpdateTimeData.updated) {
      this._loadData()
      this.#lastUpdatePush = checkUpdateTimeData.updated
      // console.log(this.#lastUpdatePush);
    }
  }

  async _loadData() {
    const collitemfiles = await fetch('http://127.0.0.1:8000/api/collitemfile/list/')
    const collitemfilesData = await collitemfiles.json()
    this.#collections = {};
    this.#items = {};
    this.#files = {};
    collitemfilesData.forEach((collitemfile) => {

      if (collitemfile.level === "collection") {
        this.#collections[collitemfile.id] = new Collection(collitemfile);
        this.#collections[collitemfile.id].items = {};

        //check if this is the first time the collection is being loaded into app
        if ( !this.#collectionsEdited.hasOwnProperty(collitemfile.id) ) {
          // if so, add the collection to the edited collection object
          this.#collectionsEdited[collitemfile.id] = new Collection(collitemfile);
          this.#collectionsEdited[collitemfile.id].items = {};
        }
      } else if (collitemfile.level === "item") {
        this.#items[collitemfile.id] = new Item(collitemfile);
        this.#items[collitemfile.id].files = {};

        //check if this is the first time the collection is being loaded into app
        if ( !this.#itemsEdited.hasOwnProperty(collitemfile.id) ) {
          // if so, add the collection to the edited collection object
          this.#itemsEdited[collitemfile.id] = new Item(collitemfile);
          this.#itemsEdited[collitemfile.id].files = {};
        }
      } else if (collitemfile.level === "file") {
        this.#files[collitemfile.id] = new File(collitemfile);
        this.#files[collitemfile.id].otherfiles = {};

        //check if this is the first time the collection is being loaded into app
        if ( !this.#filesEdited.hasOwnProperty(collitemfile.id) ) {
          // if so, add the collection to the edited collection object
          this.#filesEdited[collitemfile.id] = new File(collitemfile);
          this.#filesEdited[collitemfile.id].otherfiles = {};

        }
      }
    });

    const otherfiles = await fetch('http://127.0.0.1:8000/api/otherfile/list/')
    const otherfilesData = await otherfiles.json()
    this.#otherfiles = {};
    otherfilesData.forEach((otherfile) => {
      this.#otherfiles[otherfile.id] = new OtherFile(otherfile);

      //check if this is the first time the otherfile is being loaded into app
      if ( !this.#otherfilesEdited.hasOwnProperty(otherfile.id) ) {
        // if so, add the collection to the edited collection object
        this.#otherfilesEdited[otherfile.id] = new OtherFile(otherfile);
      }
    });


    Object.entries(this.#items).forEach(([id, item]) => {
      this.#collections[item.parent].items[id] = item
      // this.#collections[item.parent].items[id].files = {}

    });
    Object.entries(this.#files).forEach(([id, file]) => {
      this.#collections[this.#items[file.parent].parent].items[file.parent].files[id] = file

    });
    Object.entries(this.#otherfiles).forEach(([id, otherfile]) => {
      const filesInParentItem = this.#collections[this.#items[otherfile.parent].parent].items[otherfile.parent].files
      const json_file = this._getObjectByValueInObject(filesInParentItem, "identifier", otherfile.identifier.replace(/\.[^/.]+$/, ""))
      // console.log(json_file);
      if (json_file !== "error") {
        // console.log(otherfile);
        // console.log(json_file.id);
        filesInParentItem[json_file.id].otherfiles[id] = otherfile
      // console.log("start over penis");
      }

    });

    this._displayData();

    this._updateTooltipCollectionListCollection();

    if (this.#activeItem) {
      if (this.#activeItem.level === "collection") {
        this.#activeItem = this.#collections[this.#activeItem.id]
        this._openCollection(this.#activeItem)
      } else if (this.#activeItem.level === "item") {
        this.#activeItem = this.#items[this.#activeItem.id]
        this._openItem(this.#activeItem)
      } else if (this.#activeItem.level === "file") {
        this.#activeItem = this.#files[this.#activeItem.id]
        this._openFile(this.#activeItem)
      }

    }

    // call all builds

    //display sidebar

  }


  _displayCollection(collection){
    const html = `
      <li class="collitemfile_list collection_list" data-id="${collection.id}" data-level="${collection.level}">
        <h2 class="collection_list__title">${collection.identifier}</h2>
      </li>
    `;
    collectionsList.insertAdjacentHTML('beforeend', html)
  }

  _displayItem(item){
    const html = `
      <li class="collitemfile_list collection_list" data-id="${item.id}" data-level="${item.level}">
        <h2 class="collection_list__title">&nbsp;&nbsp;&nbsp;${item.identifier}</h2>
      </li>
    `;
    collectionsList.insertAdjacentHTML('beforeend', html)
  }

  _displayFile(file){
    const html = `
      <li class="collitemfile_list collection_list" data-id="${file.id}" data-level="${file.level}">
        <h2 class="collection_list__title">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${file.identifier}.json</h2>
      </li>
    `;
    collectionsList.insertAdjacentHTML('beforeend', html)
  }

  _displayOtherFile(otherfile, fileId){
    const html = `
      <li class="collitemfile_list collection_list" data-id="${fileId}" data-level="otherfile" data-other_id="${otherfile.id}">
        <h2 class="collection_list__title">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${otherfile.identifier}</h2>
      </li>
    `;
    collectionsList.insertAdjacentHTML('beforeend', html)
  }

  _displayData(){
    collectionsList.innerHTML = '';
    Object.entries(this.#collections).forEach(([id,collection]) => {
      this._displayCollection(collection);
      if (Object.entries(collection.items).length > 0) {
        Object.entries(collection.items).forEach(([id,item]) => {
            this._displayItem(item);
            if (Object.entries(item.files).length > 0) {
              Object.entries(item.files).forEach(([id, file]) => {
                  this._displayFile(file);
                  if (Object.entries(file.otherfiles).length > 0) {
                    Object.entries(file.otherfiles).forEach(([id, otherfile]) => {
                      this._displayOtherFile(otherfile, file.id);
                    });

                  }
              });
            }
        });
      }
    });

    collectionsListCollItemFiles = document.querySelectorAll('.collection_list');
    collectionsListCollItemFiles.forEach((collitemfile) => collitemfile.addEventListener('click', this._preOpenCollection.bind(this)));
    collectionsListCollItemFiles.forEach((collitemfile) => collitemfile.addEventListener('mouseover', this._showTooltipCollectionListTimer.bind(this)));
    collectionsListCollItemFiles.forEach((collitemfile) => collitemfile.addEventListener('mouseleave', function(){clearTimeout(this.#timeoutTooltip)}.bind(this)));


  }

  _setActiveItem(collitemfile){
    this.#activeItem = collitemfile;

    if (this.#activeItem) {
      let collectionIdentifier;
      let collectionId;
      if (this.#activeItem.level === "collection") {
        collectionIdentifier = this.#activeItem.identifier;
        collectionId = this.#activeItem.id
      } else if (this.#activeItem.level === "item") {
        const collection = this.#collections[this.#activeItem.parent]
        collectionIdentifier = collection.identifier;
        collectionId = collection.id
      } else if (this.#activeItem.level === "file") {
        const item = this.#items[this.#activeItem.parent]
        const collection = this.#collections[item.parent]
        collectionIdentifier = collection.identifier;
        collectionId = collection.id
      }
      if (collectionIdentifier.length > 10) {
        collectionIdentifier = `${collectionIdentifier.substr(0,10)}...`
      }
      btnArchive.innerHTML = `Archive ${collectionIdentifier}`
      btnArchive.dataset.collection = `${collectionId}`

    } else {
      btnArchive.innerHTML = "&nbsp;&nbsp;Archive&nbsp;&nbsp;"
      btnArchive.dataset.collection = "0"
    }
  }

  _showTooltipCollectionListTimer(e){
    this.#timeoutTooltip = setTimeout( function(){this._showTooltipCollectionList(e)}.bind(this), 500 );
  }

  _showTooltipCollectionList(e){
    const clicked = e.target.closest('.collitemfile_list');
    if (clicked.dataset.level === "collection") {
      tooltipCollectionListFile.classList.add('hidden');
      this._showTooltipCollectionListCollection(e);
    } else if (clicked.dataset.level === "file" || clicked.dataset.level === "otherfile") {
      tooltipCollectionListCollection.classList.add('hidden');
      this._showTooltipCollectionListFile(e);
    }

  }

  _showTooltipCollectionListCollection(e){
    const clicked = e.target.closest('.collitemfile_list');
    const collection = this.#collections[Number(clicked.dataset.id)];
    tooltipCollectionListCollection.classList.remove('hidden');
    tooltipCollectionListCollection.style.setProperty("left", (e.clientX-1) + "px");
    tooltipCollectionListCollection.style.setProperty("top", (e.clientY-1) + "px");
    tooltipCollectionListCollectionGit.dataset.id = collection.id;
    this._updateTooltipCollectionListCollection();
    this._updateTooltipCollectionListFile();

  }

  _updateTooltipCollectionListCollection(){
    if (!tooltipCollectionListCollectionGit.dataset.id) return;

    const collection = this.#collections[Number(tooltipCollectionListCollectionGit.dataset.id)];

    const checked = Boolean(collection.json.version_control.enabled === "yes");
    tooltipCollectionListCollection.querySelector(".tooltip__collection_list__collection__collection").innerHTML = `Collection: ${collection.identifier}`;
    tooltipCollectionListCollectionGit.checked = checked;

    const lastCommit = `Last commit:<br />
      ${collection.json.version_control.last}`
    tooltipCollectionListCollection.querySelector(".tooltip__collection_list__collection__last_commit").innerHTML = lastCommit

    if (checked) {
      btnTooltipCollectionListCollectionCommit.classList.remove("btn--inactive");
      btnTooltipCollectionListCollectionCommit.classList.add("btn--active");
    } else {
      btnTooltipCollectionListCollectionCommit.classList.remove("btn--active");
      btnTooltipCollectionListCollectionCommit.classList.add("btn--inactive");
    }
  }


  _showTooltipCollectionListFile(e){
    const clicked = e.target.closest('.collitemfile_list');
    const file = this.#files[Number(clicked.dataset.id)];
    tooltipCollectionListFile.classList.remove('hidden');
    tooltipCollectionListFile.style.setProperty("left", (e.clientX-1) + "px");
    tooltipCollectionListFile.style.setProperty("top", (e.clientY-1) + "px");
    tooltipCollectionListFileArchive.dataset.id = file.id;
    this._updateTooltipCollectionListFile()

  }

  _updateTooltipCollectionListFile(){
    if (!tooltipCollectionListFileArchive.dataset.id) return;

    const file = this.#files[Number(tooltipCollectionListFileArchive.dataset.id)];

    const checked = Boolean(file.json.archive.should === "yes");
    tooltipCollectionListFile.querySelector(".tooltip__collection_list__file__file").innerHTML = `File: ${file.identifier}`;
    tooltipCollectionListFileArchive.checked = checked;

    const lastArchive = `Last deposit generated:<br />
      ${file.json.archive.last}`
    tooltipCollectionListFile.querySelector(".tooltip__collection_list__file__last_archive").innerHTML = lastArchive
  }



  _listenTooltipEdits(){
    tooltipCollectionListCollectionGit.addEventListener('change', this._manageTooltipCollectionEdits.bind(this));
    tooltipCollectionListFileArchive.addEventListener('change', this._manageTooltipFileEdits.bind(this));
  }

  async _manageTooltipCollectionEdits(){
    this.#collectionsEdited[tooltipCollectionListCollectionGit.dataset.id].json.version_control.enabled = tooltipCollectionListCollectionGit.checked?"yes":"no";
    await this._updateCollItemFile(this.#collectionsEdited[tooltipCollectionListCollectionGit.dataset.id]);
    if (tooltipCollectionListCollectionGit.checked) {
      await this._gitInit(tooltipCollectionListCollectionGit.dataset.id)
    }
  }

  _manageTooltipFileEdits(){
    this.#filesEdited[tooltipCollectionListFileArchive.dataset.id].json.archive.should = tooltipCollectionListFileArchive.checked?"yes":"no";
    this._updateCollItemFile(this.#filesEdited[tooltipCollectionListFileArchive.dataset.id]);
  }

  _hideTooltipCollectionList(e){
    tooltipCollectionListCollection.classList.add('hidden');
    tooltipCollectionListFile.classList.add('hidden');
    // console.log(e);
  }

  _hideAllOntop(){
    ontopAll.forEach((ontop) => {
      ontop.classList.add('hidden');
    });
    overlay.classList.add('hidden');
  }

  _escapeKeyAction(e){
    if (e.key === 'Escape') {
      this._hideAllOntop();
    }
  }

  _displayNewCollectionBox(e){
    e.preventDefault();
    ontopNewCollection.classList.remove('hidden')
    overlay.classList.remove('hidden');
  }


  // _calculateCollectionId(){
  //   const collectionIds = this.#collections.map((collection) => collection.id);
  //   return Math.max(...collectionIds) + 1;
  // }


  _getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        // Does this cookie string begin with the name we want?
        if (cookie.substring(0, name.length + 1) === (name + '=')) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  }

  async _createNewCollitemfile(body){

    window.clearInterval(this.#lastUpdatePushTimer);

    const url = 'http://127.0.0.1:8000/api/collitemfile/create/'

    const postCollItemFile = await fetch(url, {
      method : 'POST',
      headers : {
        'Content-type':'application/json',
        'X-CSRFToken':this.#csrftoken
      },
      body : body
    })
    await this._loadData();
    await this._hideAllOntop();

    this.#lastUpdatePushTimer = window.setInterval(this._checkUpdates.bind(this), 1000);

    const postCollItemFileData = await postCollItemFile.json()
    return postCollItemFileData;
  }


  async _createNewCollection(e){
    e.preventDefault();

    // const newCollectionId = inputNewCollectionIdentifier.value

    const body = JSON.stringify({
      'identifier' : inputNewCollectionIdentifier.value,
      'file' : '',
      'level' : 'collection',
      'parent' : '',
    });

    const newCollection = await this._createNewCollitemfile(body)

    inputNewCollectionIdentifier.value = '';

    // console.log(ontopGitSettingsEnabled.checked);
    if (ontopGitSettingsEnabled.checked) {
      this.#collectionsEdited[newCollection.id].json.version_control.enabled = "yes";
      await this._updateCollItemFile(this.#collectionsEdited[newCollection.id]);
      await this._gitInit(newCollection.id)

    }
  }

  _createNewItem(e){
    e.preventDefault();
    const collectionId = contentCollection.dataset.id
    // console.log(collectionId);
    // console.log(inputItemListSearch.value);
    const body = JSON.stringify({
      'identifier' : inputItemListSearch.value,
      'file' : '',
      'level' : 'item',
      'parent' : collectionId,
    });
    // console.log(body);
    this._createNewCollitemfile(body)

    inputItemListSearch.value = '';
  }

  _createNewFile(e){
    e.preventDefault();
    const itemId = contentItem.dataset.id
    // console.log(collectionId);
    // console.log(inputItemListSearch.value);
    const body = JSON.stringify({
      'identifier' : inputFileListSearch.value,
      'file' : '',
      'level' : 'file',
      'parent' : itemId,
    });
    // console.log(body);
    this._createNewCollitemfile(body)

    inputFileListSearch.value = '';
  }

  async _loadCollection(id){
    const collection = await fetch(`http://127.0.0.1:8000/api/collitemfile/detail/${id}/`);
    const collectionData = await collection.json();
    return collectionData;
  }

  _displayPreOpenBox(e){
    e.preventDefault();
    ontopPreOpen.classList.remove('hidden')
    overlay.classList.remove('hidden');
  }

  _preOpenCollection(e) {
    const clicked = e.target.closest('.collitemfile_list');

    //guard clause
    if (!clicked) return;

    let collitemfile;
    if (clicked.dataset.level === "collection") {
      collitemfile = this.#collections[Number(clicked.dataset.id)];
    } else if (clicked.dataset.level === "item") {
      collitemfile = this.#items[Number(clicked.dataset.id)];
    } else if (clicked.dataset.level === "file" || clicked.dataset.level === "otherfile") {
      collitemfile = this.#files[Number(clicked.dataset.id)];
    }

    if (typeof collitemfile.json === 'string') {
      btnPreOpenDont.addEventListener('click', this._hideAllOntop);
      btnPreOpenOverwrite.addEventListener('click', this._hideAllOntop);
      if (collitemfile.level === "collection") {
        btnPreOpenOverwrite.addEventListener('click', this._openCollection.bind(this, collitemfile))
      } else if (collitemfile.level === "item") {
        btnPreOpenOverwrite.addEventListener('click', this._openItem.bind(this, collitemfile))
      } else if (collitemfile.level === "file") {
        btnPreOpenOverwrite.addEventListener('click', this._openFile.bind(this, collitemfile))
      }

      this._displayPreOpenBox(e)
    }
    else {
      if (collitemfile.level === "collection") {
        this._openCollection(collitemfile)
      } else if (collitemfile.level === "item") {
        this._openItem(collitemfile)
      } else if (collitemfile.level === "file") {
        this._openFile(collitemfile)
      }

    }

  }

  _openCollection(collection) {

    this._setActiveItem(collection);
    // this.#activeItem = collection

    if (typeof collection.json === 'string') {

      const blank_collection = {
        'identifier' : collection.identifier,
        'name' : '',
        'description' : '',
        'acquisition_info' : '',
        'scope_of_contents' : '',
      }
      collection.json = {...blank_collection}
      // console.log(collection.json);
      this.#collectionsEdited[collection.id].json = {...blank_collection}
      // console.log(this.#collectionsEdited[collection.id].json);
      // console.log(collection.json === this.#collectionsEdited[collection.id].json);
    }

    this._activateContentArea(contentCollection);

    contentCollection.dataset.id = collection.id;
    contentCollectionItemListTitle.textContent = `Items in ${collection.identifier}`;
    contentCollectionIdentifierValue.value = collection.identifier;
    contentCollectionNameValue.value = collection.json.name;
    contentCollectionDescriptionValue.value = collection.json.description;
    contentCollectionAcquisitionValue.value = collection.json.acquisition_info;
    contentCollectionScopeValue.value = collection.json.scope_of_contents;

    itemsInCollectionList.innerHTML = '';

    Object.entries(collection.items).forEach(([id,item]) => {
        this._addItemInCollection(item);
      });
    itemsInCollectionListItems = document.querySelectorAll('.collection__itemlist--item');
    itemsInCollectionListItems.forEach((item) => item.addEventListener('click', this._preOpenCollection.bind(this)));

  }

  _addItemInCollection(item){
    const html = `
                  <li class="collitemfile_list collection__itemlist--item" data-id="${item.id}" data-level="${item.level}">
                    <h2 class="collection__itemlist--item__identifier">${item.identifier}</h2>
                  </li>
    `;

    itemsInCollectionList.insertAdjacentHTML('beforeend', html)
  }


  _openItem(item) {

    this._setActiveItem(item);
    // this.#activeItem = item;

    if (typeof item.json === 'string') {

      const blank_item = {
        'identifier' : item.identifier,
        "description": "",
        "languages" : "",
        "region_description" : "",
        "description" : "",
        "people" : "",
        "date_begin" : "",
        "date_end" : "",
        "linguistic_type" : ""
      }
      item.json = {...blank_item}
      this.#itemsEdited[item.id].json = {...blank_item}

    }


    this._activateContentArea(contentItem);

    contentItem.dataset.id = item.id;
    contentItemFileListTitle.textContent = `Files in ${item.identifier}`;
    contentItemIdentifierValue.value = item.identifier;
    contentItemDescriptionValue.value = item.json.description;

    contentItemLanguages.innerHTML = '';
    if (Object.keys(item.json.languages).length == 0) {
      this._addLanguageRowToItem(item, null)
    } else {
      Object.entries(item.json.languages).forEach(([languageKey, language]) => {
        this._addLanguageRowToItem(item, languageKey)
      });
    }
    btnNewLanguageInItem.removeEventListener('click', btnNewLanguageInItemListener);
    btnNewLanguageInItemListener = this._addLanguageRowToItem.bind(this, item, null);
    btnNewLanguageInItem.addEventListener('click', btnNewLanguageInItemListener);


    contentItemRegionValue.value = item.json.region_description;

    contentItemPeople.innerHTML = '';
    if (Object.keys(item.json.people).length == 0) {
      this._addPersonRowToItem(item, null)
    } else {
      Object.entries(item.json.people).forEach(([personKey, person]) => {
        this._addPersonRowToItem(item, personKey)
      });
    }
    btnNewPersonInItem.removeEventListener('click', btnNewPersonInItemListener);
    btnNewPersonInItemListener = this._addPersonRowToItem.bind(this, item, null);
    btnNewPersonInItem.addEventListener('click', btnNewPersonInItemListener);

    contentItemDateBeginValue.value = item.json.date_begin;
    contentItemDateEndValue.value = item.json.date_end;
    contentItemLinguisticTypeValue.value = item.json.linguistic_type;

    filesInItemList.innerHTML = '';

    Object.entries(item.files).forEach(([id,file]) => {
        this._addFileInItem(file);
        if (Object.entries(file.otherfiles).length > 0) {
          Object.entries(file.otherfiles).forEach(([id, otherfile]) => {
            this._addOtherFileInItem(otherfile, file.id);
          });
        }
      });
    filesInItemListFiles = document.querySelectorAll('.item__filelist--file');
    filesInItemListFiles.forEach((file) => file.addEventListener('click', this._preOpenCollection.bind(this)));

  }

  _addPersonRowToItem(item, personKey){
    let name;
    let number;
    let depositorChecked = "";
    let speakerChecked = "";
    let participantChecked = "";
    let researcherChecked = "";
    let consultantChecked = "";
    let interviewerChecked = "";
    let recorderChecked = "";
    let authorChecked = "";

    if (personKey === null) {
      name = ""
      number = Object.keys(item.json.people).length + 1;
    } else {
      // console.log(item.json.people[personKey]);
      name = item.json.people[personKey].name
      number = personKey;
      if (item.json.people[personKey].roles) {
        depositorChecked = item.json.people[personKey].roles.indexOf("depositor") < 0 ? "" : "selected "
        speakerChecked = item.json.people[personKey].roles.indexOf("speaker") < 0 ? "" : "selected "
        participantChecked = item.json.people[personKey].roles.indexOf("participant") < 0 ? "" : "selected "
        researcherChecked = item.json.people[personKey].roles.indexOf("researcher") < 0 ? "" : "selected "
        consultantChecked = item.json.people[personKey].roles.indexOf("consultant") < 0 ? "" : "selected "
        interviewerChecked = item.json.people[personKey].roles.indexOf("interviewer") < 0 ? "" : "selected "
        recorderChecked = item.json.people[personKey].roles.indexOf("recorder") < 0 ? "" : "selected "
        authorChecked = item.json.people[personKey].roles.indexOf("author") < 0 ? "" : "selected "
      }
    }

    // const onChangeText = "app.#itemsEdited[" + item.id + "].json.people[" + number + "].roles = Array.from(this.selectedOptions).map(x=>x.value)"
    // onchange="${onChangeText}"
    const html = `
                <div class="item__field item__person" data-person="${number}">
                  <div class="item__field item__person__number">
                    ${number}.
                  </div>
                  <div class="item__field item__person__name">
                    <div>
                      Name:
                    </div>
                    <div>
                      <input type="text" class="item__input item__person__name--value" value = "${name}"/>
                    </div>
                  </div>
                  <div class="item__field item__person__roles">
                    <div>
                      Roles:
                    </div>
                    <div>
                      <select class="item__person__roles--select" name="item__person${number}__roles--select" id="item__person${number}__roles--select" multiple multiselect-hide-x="false">
                        <option ${depositorChecked}value="depositor">Depositor</option>
                        <option ${speakerChecked}value="speaker">Speaker</option>
                        <option ${participantChecked}value="participant">Participant</option>
                        <option ${researcherChecked}value="researcher">Researcher</option>
                        <option ${consultantChecked}value="consultant">Consultant</option>
                        <option ${interviewerChecked}value="interviewer">Interviewer</option>
                        <option ${recorderChecked}value="recorder">Recorder</option>
                        <option ${authorChecked}value="author">Author</option>
                      </select>
                    </div>
                  </div>
                </div>
    `;
    contentItemPeople.insertAdjacentHTML('beforeend', html)


    contentItemEachPersonName = document.querySelectorAll('.item__person__name--value');
    contentItemEachPersonName.forEach((contentItemPersonName) => {
      contentItemPersonName.removeEventListener('keyup', manageItemEditsBind)
      contentItemPersonName.addEventListener('keyup', manageItemEditsBind)
    });
    contentItemEachPersonRoles = document.querySelectorAll('.item__person__roles--select');
    contentItemEachPersonRoles.forEach((contentItemPersonRoles) => {
      contentItemPersonRoles.removeEventListener('change', manageItemEditsBind)
      contentItemPersonRoles.addEventListener('change', manageItemEditsBind)
    });

    multiselectDropdown(window.multiselectDropdownOptions, `[name="item__person${number}__roles--select"]`);
  }

  _addLanguageRowToItem(item, languageKey){
    let number;
    let name = "";
    let code = "";
    let subject = "";

    if (languageKey === null) {
      number = Object.keys(item.json.languages).length + 1;
    } else {
      number = languageKey;
      name = item.json.languages[languageKey].name
      code = item.json.languages[languageKey].code
      subject = item.json.languages[languageKey].subject
    }

    const html = `
                <div class="item__field item__language" data-language="${number}">
                  <div class="item__field item__language__number">
                    ${number}.
                  </div>
                  <div class="item__field item__language__name">
                    Language name:
                    <input type="text" class="item__input item__language__name--value" value = "${name}" />
                  </div>
                  <div class="item__field item__language__code">
                    ISO code/Glottocode:
                    <input type="text" class="item__input item__language__code--value" value = "${code}" />
                  </div>
                  <div class="item__field item__language__subject">
                    Subject language?:
                    <input type="checkbox" class="item__input item__language__subject--value" value="subject" ${subject?"checked ":""}/>
                  </div>
                </div>
    `;
    contentItemLanguages.insertAdjacentHTML('beforeend', html)

    contentItemEachLanguageName = document.querySelectorAll('.item__language__name--value');
    contentItemEachLanguageName.forEach((contentItemLanguageName) => {
      contentItemLanguageName.addEventListener('keyup', manageItemEditsBind)
    });
    contentItemEachLanguageCode = document.querySelectorAll('.item__language__code--value');
    contentItemEachLanguageCode.forEach((contentItemLanguageCode) => {
      contentItemLanguageCode.addEventListener('keyup', manageItemEditsBind)
    });
    contentItemEachLanguageSubject = document.querySelectorAll('.item__language__subject--value');
    contentItemEachLanguageSubject.forEach((contentItemLanguageSubject) => {
      contentItemLanguageSubject.addEventListener('change', manageItemEditsBind)
    });
  }

  _addFileInItem(file){
    const html = `
                  <li class="collitemfile_list item__filelist--file" data-id="${file.id}" data-level="${file.level}">
                    <h2 class="item__filelist--file__identifier">${file.identifier}.json</h2>
                  </li>
    `;

    filesInItemList.insertAdjacentHTML('beforeend', html)
  }

  _addOtherFileInItem(otherfile, fileId){
    const html = `
                  <li class="collitemfile_list item__filelist--file" data-id="${fileId}" data-level="otherfile" data-other_id="${otherfile.id}">
                    <h2 class="item__filelist--file__identifier">${otherfile.identifier}</h2>
                  </li>
    `;

    filesInItemList.insertAdjacentHTML('beforeend', html)
  }

  _openFile(file) {

        this._setActiveItem(file);
        // this.#activeItem = file;

        if (typeof file.json === 'string') {

          const blank_file = {
            'identifier' : file.identifier,
            "format": "",
            "extent" : ""
          }
          file.json = {...blank_file}
          this.#filesEdited[file.id].json = {...blank_file}
          // console.log("this is not happening");
        }

        this._initializeFile(file)

        this._activateContentArea(contentFile);

        contentFile.dataset.id = file.id;
        contentFileIdentifierValue.value = file.json.identifier;
        contentFileFilenameValue.value = file.json.filename;
        contentFileFormatValue.value = file.json.format;
        contentFileExtentValue.value = file.json.extent;

        contentFileAudioPlayerContainer.classList.add("hidden_off_screen")

        if (file.json.filename.substr(-4).match(/\.wav/i) ) {
          const filepath = file.file.match(/^(.*)\/(.*?)\.(.*?)$/)[1]
          console.log(filepath);
          contentFileAudioSource.src = filepath + "/" + file.json.filename;
          contentFileAudioSource.type = "audio/x-wav"
          contentFileAudioPlayer.load();
          contentFileAudioPlayerContainer.classList.remove("hidden_off_screen")
        }


        if (file.json.hasOwnProperty('annotations') && Object.entries(file.json.annotations).length > 0) {
          contentFileSearchBox.classList.remove("hidden");
          this._updateFileSearchTiersSelector(file);
          contentFileSearchTiersSelect = document.querySelector('.file__search__tiers__select');
        } else {
          contentFileSearchBox.classList.add("hidden");
        }

        if (file.json.hasOwnProperty("annotations_meta")){
          if (file.json.annotations_meta.hasOwnProperty("references")){
            if (file.json.annotations_meta.references.hasOwnProperty("1")){
              contentFileAudioSource.src = file.json.annotations_meta.references["1"].url
              contentFileAudioSource.type = file.json.annotations_meta.references["1"].mime_type
              contentFileAudioPlayer.load();
              contentFileAudioPlayerContainer.classList.remove("hidden_off_screen")
            }
          }
        }

        this._displayAnnotations(file)

        if (file.json.hasOwnProperty('annotations') && Object.entries(file.json.annotations).length > 0) {
          contentFileSearchValue.removeEventListener('keyup', contentFileSearchValueListener);
          contentFileSearchValueListener = this._filterAnnotations.bind(this, file);
          contentFileSearchValue.addEventListener('keyup', contentFileSearchValueListener);

          contentFileSearchTiersSelect.removeEventListener('change', contentFileSearchTiersSelectListener);
          contentFileSearchTiersSelectListener = this._manageFileSearchOptions.bind(this, file);
          contentFileSearchTiersSelect.addEventListener('change', contentFileSearchTiersSelectListener);
        }

  }


  _scrollPlayback(){
    if (this.#activeItem.level === "file") {
      if (contentFileAudioPlayer.currentTime > 0 && !contentFileAudioPlayer.paused && !contentFileAudioPlayer.ended) {
        contentFileAnnotationsVisible = document.querySelectorAll(".annotation")
        if (contentFileAnnotationsVisible.length > 0) {
          if (!contentFileAnnotationsFocus) {
            contentFileAnnotationsFocus = contentFileAnnotationsVisible[0];
          }
          const time = contentFileAudioPlayer.currentTime * 1000
          if ( !(contentFileAnnotationsFocus.dataset.timestamp_begin <= time && time <= contentFileAnnotationsFocus.dataset.timestamp_end) ) {
            const timelyAnnotations = [...contentFileAnnotationsVisible].filter(annotation => (annotation.dataset.timestamp_begin <= time && time <= annotation.dataset.timestamp_end));
            if (timelyAnnotations.length > 0) {
              // contentFileAnnotationsFocus = document.querySelector(`.annotation[data-id]`) timelyAnnotations[0];
              contentFileAnnotationsFocus = timelyAnnotations[0];
              contentFileAnnotationsFocus.scrollIntoView();
            }

          }
        }
      }
    }
  }


  _getObjectByValueInObject(parentObject, childKey, childValue){
    let object = "error"
    Object.entries(parentObject).forEach(([key, value]) => {
      if (value[childKey] === childValue) {
        object = parentObject[key]
      }
    });
    return object
  }

  _walkObjectTree(rootObject, childKey, functionToDo, indexStart = 0){
    let index = indexStart
    this._stepObjectTree(rootObject, childKey, functionToDo, index)
  }
  _stepObjectTree(object, childKey, functionToDo, index){
    // console.log(object);
    // console.log(childKey);
    Object.entries(object[childKey]).forEach(([key, value]) => {
      // console.log(key);
      // console.log(value);
      if (functionToDo(value, index)) {index++}
      index = this._stepObjectTree(value, childKey, functionToDo, index)
    });
    return index
  }

  // _enumerateTier(file, tier, index){
  //   // console.log(file);
  //   // console.log(tier);
  //   // console.log(index);
  //   const tier_meta = this._getObjectByValueInObject(file.json.annotations_meta.tiers, "id", tier.id)
  //
  //   tier_meta["langit__order"] = index
  //   return true
  // }

  _initializeFile(file){
    // if (file.json.hasOwnProperty("annotations_meta")) {
    //   this._walkObjectTree({"children" : file.json.annotations_meta.tier_hierarchy}, "children", this._enumerateTier.bind(this, file), 1)
    // }
  }



  _updateFileSearchTiersSelector(file){
    let html = `
    <div>
      <select class="file__search__tiers__select" name="file__search__tiers--select" id="file__search__tiers--select" multiple multiselect-hide-x="false">
    `
    let tierList;
    console.log(this.#settings.search[file.id]);
    if (!this.#settings.search.hasOwnProperty(file.id)) {
        this.#settings.search[file.id] = []
      }
    tierList = this.#settings.search[file.id]
    console.log(this.#settings.search[file.id]);


    Object.entries(file.json.annotations_meta.tiers).forEach(([key, tier]) => {
      html += `
          <option ${tierList.includes(tier.id) ? "selected " : ""}value="${tier.id}">${tier.id}</option>
      `
    });
    html += `
        </select>
      </div>
    `
    contentFileSearchTiers.innerHTML = html;
    multiselectDropdown(window.multiselectDropdownOptions, `[name="file__search__tiers--select"]`);
  }


  _filterAnnotations(file){

    //stop previous timer
    clearTimeout(this.#timeoutSearch);
    // restart timer
    this.#timeoutSearch = setTimeout( function() {
      this._displayAnnotations(file)
    }.bind(this), 100);
  }

  _displayAnnotations(file){
    contentFileAnnotations.innerHTML = '';
    // console.log(file);
    if (Object.entries(file.json.annotations).length > 0) {
      Object.entries(file.json.annotations).forEach(([id, annotation]) => {
        if (contentFileSearchValue.value === "") {
          this._displayAnnotation(id, annotation, file)
        } else if (this._searchAnnotation(new RegExp("("+contentFileSearchValue.value+")","i"), id, annotation, file)) {
          this._displayAnnotation(id, annotation, file)
        }
      });
    }

    annotationValues = document.querySelectorAll('.annotation--value')
    annotationValues.forEach((annotationValue) => {
      annotationValue.addEventListener('click', this._editAnnotation.bind(this))
    });
    annotationLines = document.querySelectorAll('.annotation__line')
    annotationLines.forEach((annotationLine) => {
      annotationLine.addEventListener('click', annotationLinesListener)
    });

  }

  _searchAnnotation(regex, id, annotation, file){
    // console.log(regex);
    // console.log(this.#settings.search[file.id]);
    let match = false;
    Object.entries(annotation).forEach(([tier, value]) => {
      // console.log(tier);
      // console.log(this.#settings.search[file.id].includes(tier));
      if (this.#settings.search[file.id].includes(tier)) {
        // console.log(tier);
        if (value.search(regex) >= 0) {
          // console.log(value.search(regex));
          match = true;
          return false
        }
      }
    });
    // console.log(match);
    return match
  }


  _displayAnnotation(id, annotation, file){
    const annotation_read = {...annotation};
    let timestampBegin;
    let timestampEnd;
    let timestampBeginHuman;
    let timestampEndHuman;
    let uniqueId;
    if (annotation_read.hasOwnProperty("timestamp_begin")) {
      timestampBegin = annotation_read["timestamp_begin"]
      delete annotation_read["timestamp_begin"]
    }
    if (annotation_read.hasOwnProperty("timestamp_end")) {
      timestampEnd = annotation_read["timestamp_end"]
      delete annotation_read["timestamp_end"]
    }
    if (annotation_read.hasOwnProperty("unique_id")) {
      uniqueId = annotation_read["unique_id"]
      delete annotation_read["unique_id"]
    }
    if (annotation_read.hasOwnProperty("timestamp_begin_human_readable")) {
      timestampBeginHuman = annotation_read["timestamp_begin_human_readable"]
      delete annotation_read["timestamp_begin_human_readable"]
    }
    if (annotation_read.hasOwnProperty("timestamp_end_human_readable")) {
      timestampEndHuman = annotation_read["timestamp_end_human_readable"]
      delete annotation_read["timestamp_end_human_readable"]
    }

    let html = `
                <li class="annotation" data-id="${id}" data-unique_id="${uniqueId}" data-timestamp_begin="${timestampBegin}" data-timestamp_end="${timestampEnd}">
                  <div class="annotation__timestamps">
                    <div>${timestampBeginHuman}</div>
                    <div>${timestampEndHuman}</div>
                  </div>
    `;

    Object.entries(annotation_read).forEach(([tierName, annotationValue]) => {
      html = this._addTierToAnnotation(html, tierName, annotationValue, file)
    });

    html += `
                </li>
    `

    contentFileAnnotations.insertAdjacentHTML('beforeend', html)
  }

  _addTierToAnnotation(html, tierName, annotationValue, file){

    const tier_meta = this._getObjectByValueInObject(file.json.annotations_meta.tiers, "id", tierName)

    html += `
                  <div class="annotation__line tier${tier_meta.order}">
                    <div class="annotation--tier">${tierName}</div>
                    <div class="annotation--value">${annotationValue}</div>
                  </div>
    `
    return html
  }

  _tierToggle(e){
    // console.log(e.layerX);
    // console.log(getComputedStyle(e.target).getPropertyValue('border-left-width'));
    if (!e.target.classList.contains("annotation--tier")) {
      const annotationLineBorderWidth = Number(getComputedStyle(e.target.closest(".annotation__line")).getPropertyValue('border-left-width').replace(/px$/, ''))
      // console.log(annotationLineBorderWidth);
      // console.log(Number(getComputedStyle(e.target).getPropertyValue('border-left-width').replace(/px$/, '')));
      if (e.layerX > annotationLineBorderWidth) {
        return
      }
    }
    annotationTierLabels = document.querySelectorAll('.annotation--tier')
    this.#settings.showAnnotationTiers = !this.#settings.showAnnotationTiers
    annotationTierLabels.forEach((annotationTierLabel) => {
      annotationTierLabel.classList.toggle('hidden_nowidth')
    });

  }


  _editAnnotation(e){

    const annotationActivated = e.target
    const text = annotationActivated.innerHTML;

    annotationActivated.innerHTML = `<input type="text" class="annotation--value--active" />`;
    annotationValueActive = annotationActivated.querySelector('.annotation--value--active');
    annotationValueActive.value = text;

  }

  _clickawayEditAnnotation(e){
    // if the target is the annotation active
    if (annotationValueActive) {
      if (!e.target.classList.contains("annotation--value--active")) {
        if (!e.target.classList.contains("annotation--value")) {
          // run closeedit
          this._closeEditAnnotation(e);
        }
      }
    }
  }

  _closeEditAnnotation(){
    annotationValueActive = document.querySelector('.annotation--value--active');
    const annotation = annotationValueActive.closest(".annotation")
    const annotationTier = annotationValueActive.closest(".annotation__line").querySelector(".annotation--tier")

    // find the place in json to save it
    const json_annotation = this._getObjectByValueInObject(this.#filesEdited[this.#activeItem.id].json.annotations, "unique_id", annotation.dataset.unique_id)
    // edit json
    json_annotation[annotationTier.innerText] = annotationValueActive.value
    // run update
    this._updateCollItemFile(this.#filesEdited[this.#activeItem.id])
    // convert back to text
    const annotationActivated = annotationValueActive.closest('.annotation--value');
    const text = annotationValueActive.value;
    annotationActivated.innerHTML = text;

    annotationValueActive = null;
  }


  _activateContentArea(contentArea) {

    contentArea.classList.remove('hidden');

    if (contentArea !== contentCollection) {
      contentCollection.classList.add('hidden');
    }
    if (contentArea !== contentItem) {
      contentItem.classList.add('hidden');
    }
    if (contentArea !== contentFile) {
      contentFile.classList.add('hidden');
    }

  }


  async _updateCollItemFile(collitemfile){
    // fetch()
      const url = `http://127.0.0.1:8000/api/collitemfile/update/${collitemfile.id}/`
      // console.log(JSON.stringify(collitemfile.json, null, 4));
      const postCollItemFile = await fetch(url, {
        method : 'POST',
        headers : {
          'Content-type':'application/json',
          'X-CSRFToken':this.#csrftoken
        },
        body : JSON.stringify({
          'id' : collitemfile.id,
          'identifier' : collitemfile.identifier,
          'file' : collitemfile.file,
          'json' : JSON.stringify(collitemfile.json, null, 4),
          'level' : collitemfile.level,
          'parent' : collitemfile.parent,
        })
      });

      this._loadData();

  }



  _listenCollectionEdits(){

    // event handler added to every collection page input

    contentCollectionIdentifierValue.addEventListener('keyup', this._manageCollectionEdits.bind(this));
    contentCollectionNameValue.addEventListener('keyup', this._manageCollectionEdits.bind(this));
    contentCollectionDescriptionValue.addEventListener('keyup', this._manageCollectionEdits.bind(this));
    contentCollectionAcquisitionValue.addEventListener('keyup', this._manageCollectionEdits.bind(this));
    contentCollectionScopeValue.addEventListener('keyup', this._manageCollectionEdits.bind(this));

  }

  _manageCollectionEdits(){

    //stop previous timer
    clearTimeout(this.#timeoutCollectionPage);
    // restart timer
    this.#timeoutCollectionPage = setTimeout( function() {
      const collectionId = contentCollection.dataset.id
      if (this.#activeItem.level === "collection" && String(this.#activeItem.id) === String(collectionId)) {
        this.#collectionsEdited[collectionId].identifier = contentCollectionIdentifierValue.value
        this.#collectionsEdited[collectionId].json.identifier = contentCollectionIdentifierValue.value
        this.#collectionsEdited[collectionId].json.name = contentCollectionNameValue.value
        this.#collectionsEdited[collectionId].json.description = contentCollectionDescriptionValue.value
        this.#collectionsEdited[collectionId].json.acquisition_info = contentCollectionAcquisitionValue.value
        this.#collectionsEdited[collectionId].json.scope_of_contents = contentCollectionScopeValue.value
        this._updateCollItemFile(this.#collectionsEdited[collectionId])
      }
    }.bind(this), 1000);
  }


  _listenItemEdits(){

    // event handler added to every collection page input

    contentItemIdentifierValue.addEventListener('keyup', this._manageItemEdits.bind(this));
    contentItemDescriptionValue.addEventListener('keyup', this._manageItemEdits.bind(this));
    // contentItemEachLanguageName handled in this._addLanguageRowToItem
    // contentItemEachLanguageCode handled in this._addLanguageRowToItem
    contentItemRegionValue.addEventListener('keyup', this._manageItemEdits.bind(this));
    // contentItemEachPersonName handled in this._addPersonRowToItem
    // contentItemEachPersonRoles handled in this._addPersonRowToItem
    contentItemDateBeginValue.addEventListener('keyup', this._manageItemEdits.bind(this));
    contentItemDateEndValue.addEventListener('keyup', this._manageItemEdits.bind(this));
    contentItemLinguisticTypeValue.addEventListener('keyup', this._manageItemEdits.bind(this));

  }


  _manageItemEdits(){

    //stop previous timer
    clearTimeout(this.#timeoutItemPage);
    // restart timer
    this.#timeoutItemPage = setTimeout( function() {
      const itemId = contentItem.dataset.id
      if (this.#activeItem.level === "item" && String(this.#activeItem.id) === String(itemId)) {
        this.#itemsEdited[itemId].identifier = contentItemIdentifierValue.value
        this.#itemsEdited[itemId].json.identifier = contentItemIdentifierValue.value
        this.#itemsEdited[itemId].json.description = contentItemDescriptionValue.value

        if ( typeof(this.#itemsEdited[itemId].json.languages) !== "object" ) {
          this.#itemsEdited[itemId].json.languages = {};
        }
        contentItemEachLanguageName.forEach((contentItemLanguageName, i) => {
          if ( typeof(this.#itemsEdited[itemId].json.languages[contentItemLanguageName.closest('.item__language').dataset.language]) !== "object" ) {
            this.#itemsEdited[itemId].json.languages[contentItemLanguageName.closest('.item__language').dataset.language] = {name: "", code: "", code_name: "", subject: ""};
          }
          this.#itemsEdited[itemId].json.languages[contentItemLanguageName.closest('.item__language').dataset.language].name = contentItemLanguageName.value
        });
        contentItemEachLanguageCode.forEach((contentItemLanguageCode, i) => {
          this.#itemsEdited[itemId].json.languages[contentItemLanguageCode.closest('.item__language').dataset.language].code = contentItemLanguageCode.value
        });
        contentItemEachLanguageSubject.forEach((contentItemLanguageSubject, i) => {
          this.#itemsEdited[itemId].json.languages[contentItemLanguageSubject.closest('.item__language').dataset.language].subject = contentItemLanguageSubject.checked?"subject":""
        });

        this.#itemsEdited[itemId].json.region_description = contentItemRegionValue.value

        if ( typeof(this.#itemsEdited[itemId].json.people) !== "object" ) {
          this.#itemsEdited[itemId].json.people = {};
        }
        contentItemEachPersonName.forEach((contentItemPersonName, i) => {
          if ( typeof(this.#itemsEdited[itemId].json.people[contentItemPersonName.closest('.item__person').dataset.person]) !== "object" ) {
            this.#itemsEdited[itemId].json.people[contentItemPersonName.closest('.item__person').dataset.person] = {name: "", roles:[]};
          }
          this.#itemsEdited[itemId].json.people[contentItemPersonName.closest('.item__person').dataset.person].name = contentItemPersonName.value
        });
        contentItemEachPersonRoles.forEach((contentItemPersonRoles, i) => {
          // console.log(Array.from(contentItemPersonRoles.selectedOptions.map(option=>option)));
          const selected = [];
          Object.entries(contentItemPersonRoles.selectedOptions).forEach(([id, option]) => {
            selected.push(option.value);
          });
          this.#itemsEdited[itemId].json.people[contentItemPersonRoles.closest('.item__person').dataset.person].roles = selected
          // console.log(selected);
        });


        this.#itemsEdited[itemId].json.date_begin = contentItemDateBeginValue.value
        this.#itemsEdited[itemId].json.date_end = contentItemDateEndValue.value
        this.#itemsEdited[itemId].json.linguistic_type = contentItemLinguisticTypeValue.value
        this._updateCollItemFile(this.#itemsEdited[itemId])
      }
    }.bind(this), 1000);
  }


  _listenFileEdits(){

    // event handler added to every collection page input

    contentFileIdentifierValue.addEventListener('keyup', this._manageFileEdits.bind(this));
    contentFileFilenameValue.addEventListener('keyup', this._manageFileEdits.bind(this));
    contentFileFormatValue.addEventListener('keyup', this._manageFileEdits.bind(this));
    contentFileExtentValue.addEventListener('keyup', this._manageFileEdits.bind(this));

  }

  _manageFileEdits(){

    //stop previous timer
    clearTimeout(this.#timeoutCollectionPage);
    // restart timer
    this.#timeoutCollectionPage = setTimeout( function() {
      const fileId = contentFile.dataset.id
      if (this.#activeItem.level === "file" && String(this.#activeItem.id) === String(fileId)) {
        this.#filesEdited[fileId].identifier = contentFileIdentifierValue.value
        this.#filesEdited[fileId].json.identifier = contentFileIdentifierValue.value
        this.#filesEdited[fileId].json.filename = contentFileFilenameValue.value
        this.#filesEdited[fileId].json.format = contentFileFormatValue.value
        this.#filesEdited[fileId].json.extent = contentFileExtentValue.value

        this._updateCollItemFile(this.#filesEdited[fileId])
      }
    }.bind(this), 1000);
  }

  _manageFileSearchOptions(file){
    const selected = [];
    Object.entries(contentFileSearchTiersSelect.selectedOptions).forEach(([id, option]) => {
      selected.push(option.value);
    });
    this.#settings.search[file.id] = selected
  }


  async _deleteCollection(e){

    const collectionId = e.target.closest('.content').dataset.id

    // add error handling: make sure this id exists

    const url = `http://127.0.0.1:8000/api/collitemfile/delete/${collectionId}/`

    const postCollection = await fetch(url, {
      method : 'DELETE',
      headers : {
        'Content-type':'application/json',
        'X-CSRFToken':this.#csrftoken
      }
    });

    this._setActiveItem(0)
    // this.#activeItem = 0;

    this._loadData();


  }


  _exportAnnotations(e){
    e.preventDefault();
    ontopAnnotationsExport.classList.remove('hidden')
    overlay.classList.remove('hidden');

    const clicked = e.target.closest('.content__file');
    const annotation = document.querySelectorAll('.annotation')[1];
    this._updateAnnotationExportTiersSelector(this.#files[clicked.dataset.id])
    annotationsExportFilterTiersSelect = document.querySelector('.export_annotations__tiers__select');

    annotationsExportPrefixValue.removeEventListener('keyup', annotationsExportListener);
    annotationsExportFilterTiersSelect.removeEventListener('change', annotationsExportListener);
    annotationsExportListener = this._manageAnnotationsExportOptions.bind(this, this.#files[clicked.dataset.id]);
    annotationsExportPrefixValue.addEventListener('keyup', annotationsExportListener);
    annotationsExportFilterTiersSelect.addEventListener('change', annotationsExportListener);

    this._displayAnnotationExport(annotation, this.#files[clicked.dataset.id])

  }

  _updateAnnotationExportTiersSelector(file){
    let html = `
    <div>
      <select class="export_annotations__tiers__select" name="export_annotations__tiers--select" id="export_annotations__tiers--select" multiple multiselect-hide-x="false">
    `
    let tierList;
    // console.log(this.#settings.export[file.id]);
    if (!this.#settings.export.hasOwnProperty(file.id)) {
        this.#settings.export[file.id] = []
      }
    tierList = this.#settings.export[file.id]
    // console.log(this.#settings.export[file.id]);


    Object.entries(file.json.annotations_meta.tiers).forEach(([key, tier]) => {
      html += `
          <option ${tierList.includes(tier.id) ? "selected " : ""}value="${tier.id}">${tier.id}</option>
      `
    });
    html += `
        </select>
      </div>
    `
    annotationsExportFilterTiers.innerHTML = html;
    multiselectDropdown(window.multiselectDropdownOptions, `[name="export_annotations__tiers--select"]`);
  }

  _manageAnnotationsExportOptions(file){
    const selected = [];
    Object.entries(annotationsExportFilterTiersSelect.selectedOptions).forEach(([id, option]) => {
      selected.push(option.value);
    });
    this.#settings.export[file.id] = selected

    const annotation = document.querySelectorAll('.annotation')[0];
    this._displayAnnotationExport(annotation, file)
  }

  _displayAnnotationExport(annotation, file){
    const annotation_read = {...file.json.annotations[annotation.dataset.id]}
    const parent_item = this.#items[file.parent].identifier
    let timestampBegin;
    let timestampEnd;
    let timestampBeginHuman;
    let timestampEndHuman;
    if (annotation_read.hasOwnProperty("timestamp_begin")) {
      timestampBegin = annotation_read["timestamp_begin"]
      delete annotation_read["timestamp_begin"]
    }
    if (annotation_read.hasOwnProperty("timestamp_end")) {
      timestampEnd = annotation_read["timestamp_end"]
      delete annotation_read["timestamp_end"]
    }
    if (annotation_read.hasOwnProperty("unique_id")) {
      delete annotation_read["unique_id"]
    }
    if (annotation_read.hasOwnProperty("timestamp_begin_human_readable")) {
      timestampBeginHuman = annotation_read["timestamp_begin_human_readable"]
      delete annotation_read["timestamp_begin_human_readable"]
    }
    if (annotation_read.hasOwnProperty("timestamp_end_human_readable")) {
      timestampEndHuman = annotation_read["timestamp_end_human_readable"]
      delete annotation_read["timestamp_end_human_readable"]
    }

    let text = `\\ex
\\begingl
`;

    const alphabet = "abcdefghijklmnopqrstuvwxyz";
    let iAlph = 0
    Object.entries(annotation_read).forEach(([tierName, annotationValue]) => {
      if (this.#settings.export[file.id].includes(tierName)) {
        text += `\\gl${alphabet[iAlph]} ${annotationValue}//
`;
        iAlph ++
      }
    });

    text += `\\glft \`${annotation_read["english translation"]}' \\hfill (${annotationsExportPrefixValue.value}: ${parent_item}, ${timestampBeginHuman}--${timestampEndHuman})//
`;

    text += `\\endgl
\\xe
`;

    annotationsExportAnnotations.value = text
  }



  async _gitInit(collectionId){
    //guard clause
    // if (!this.#activeItem.level === "collection") return;

    const url = `http://127.0.0.1:8000/api/git/init/${collectionId}/`

    const body = JSON.stringify({
      'name' : ontopGitSettingsName.value,
      'email' : ontopGitSettingsEmail.value,
    });

    const gitRepoInfo = await fetch(url, {
      method : 'POST',
      headers : {
        'Content-type':'application/json',
        'X-CSRFToken':this.#csrftoken
      },
      body: body
    });
  }

  async _gitCommitSingle(collectionId){

    const url = `http://127.0.0.1:8000/api/git/commit/${collectionId}/`

    const gitCommit = await fetch(url, {
      method : 'GET',
      headers : {
        'Content-type':'application/json',
        'X-CSRFToken':this.#csrftoken
      },
    });
  }

  _gitCommitFromTooltip(){
    if (!tooltipCollectionListCollectionGit.dataset.id) return;
    this._gitCommitSingle(tooltipCollectionListCollectionGit.dataset.id)
  }


  async _gitAutomatedCommits(){

    const url = `http://127.0.0.1:8000/api/git/commit-all/`

    const gitCommitAll = await fetch(url, {
      method : 'GET',
      headers : {
        'Content-type':'application/json',
        'X-CSRFToken':this.#csrftoken
      },
    });


  }


  async _archive(e) {
    e.preventDefault();

    //guard clause
    if (!this.#activeItem) return;
    // if (!this.#activeItem.level === "collection") return;

    const url = `http://127.0.0.1:8000/api/archive/${btnArchive.dataset.collection}/`

    const generateArchiveDeposit = await fetch(url, {
      method : 'GET',
      headers : {
        'Content-type':'application/json',
        'X-CSRFToken':this.#csrftoken
      },
    });

  }


}

const app = new App();



// //menu fade animation
//
// const handleHover = function(e) {
//
//   if (e.target.classList.contains('nav__link')) {
//     const link = e.target;
//     const siblings = link.closest('.nav').querySelectorAll('.nav__link');
//     const logo = link.closest('.nav').querySelector('img');
//     siblings.forEach((el) => {
//       if (el !== link) el.style.opacity = this;
//       logo.style.opacity = this;
//     });
//   };
// };
//
// //passing "Arguments" to handler function
// nav.addEventListener('mouseover', handleHover.bind(0.5));
//
// nav.addEventListener('mouseout',  handleHover.bind(1));
//
//
const header = document.querySelector('.header');
const navHeight = nav.getBoundingClientRect().height;

const stickNav = function (entries) {
  const [entry] = entries;
  // console.log(entry);
  if (!entry.isIntersecting) nav.classList.add('sticky')
  else nav.classList.remove('sticky')
};

const headerObserver = new IntersectionObserver(stickNav, {
  root:null,
  threshold:0,
  rootMargin: `-${navHeight}px`,
});

headerObserver.observe(header);


const contentFileAudioPlayerHeight = contentFileAudioPlayer.getBoundingClientRect().height;

const stickAudio = function (entries) {
  const [entry] = entries;
  // console.log(entry);
  if (!entry.isIntersecting) contentFileAudioPlayer.classList.add('sticky')
  else contentFileAudioPlayer.classList.remove('sticky')
};

const contentFileAudioPlayerContainerObserver = new IntersectionObserver(stickAudio, {
  root:null,
  threshold:0,
  rootMargin: `-${navHeight + contentFileAudioPlayerHeight}px`,
});

contentFileAudioPlayerContainerObserver.observe(contentFileAudioPlayerContainer);

// Responsive multiselect drop down menus taken and modified from https://github.com/admirhodzic/multiselect-dropdown
var style = document.createElement('style');
style.setAttribute("id","multiselect_dropdown_styles");
style.innerHTML = `
.multiselect-dropdown{
  display: inline-block;
  padding: 2px 5px 0px 5px;
  border-radius: 4px;
  border: solid 1px #ced4da;
  background-color: white;
  position: relative;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M2 5l6 6 6-6'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right .75rem center;
  background-size: 16px 12px;
}
.multiselect-dropdown span.optext, .multiselect-dropdown span.placeholder{
  margin-right:0.5em;
  margin-bottom:2px;
  padding:1px 0;
  border-radius: 4px;
  display:inline-block;
}
.multiselect-dropdown span.optext{
  background-color:lightgray;
  padding:1px 0.75em;
}
.multiselect-dropdown span.optext .optdel {
  float: right;
  margin: 0 -6px 1px 5px;
  font-size: 0.7em;
  margin-top: 2px;
  cursor: pointer;
  color: #666;
}
.multiselect-dropdown span.optext .optdel:hover { color: #c66;}
.multiselect-dropdown span.placeholder{
  color:#ced4da;
}
.multiselect-dropdown-list-wrapper{
  box-shadow: gray 0 3px 8px;
  z-index: 100;
  padding:2px;
  border-radius: 4px;
  border: solid 1px #ced4da;
  display: none;
  margin: -1px;
  position: absolute;
  top:0;
  left: 0;
  right: 0;
  background: white;
}
.multiselect-dropdown-list-wrapper .multiselect-dropdown-search{
  margin-bottom:5px;
}
.multiselect-dropdown-list{
  padding:2px;
  height: 15rem;
  overflow-y:auto;
  overflow-x: hidden;
}
.multiselect-dropdown-list::-webkit-scrollbar {
  width: 6px;
}
.multiselect-dropdown-list::-webkit-scrollbar-thumb {
  background-color: #bec4ca;
  border-radius:3px;
}

.multiselect-dropdown-list div{
  padding: 5px;
}
.multiselect-dropdown-list input{
  height: 1.15em;
  width: 1.15em;
  margin-right: 0.35em;
}
.multiselect-dropdown-list div.checked{
}
.multiselect-dropdown-list div:hover{
  background-color: #ced4da;
}
.multiselect-dropdown span.maxselected {width:100%;}
.multiselect-dropdown-all-selector {border-bottom:solid 1px #999;}
.placeholder{
  min-width: 15rem;
}
`;
document.head.appendChild(style);

function multiselectDropdown(options, single=null){
  var config={
    search:true,
    height:'15rem',
    placeholder:'select',
    txtSelected:'selected',
    txtAll:'All',
    txtRemove: 'Remove',
    txtSearch:'search',
    ...options
  };
  function newEl(tag,attrs){
    var e=document.createElement(tag);
    if(attrs!==undefined) Object.keys(attrs).forEach(k=>{
      if(k==='class') { Array.isArray(attrs[k]) ? attrs[k].forEach(o=>o!==''?e.classList.add(o):0) : (attrs[k]!==''?e.classList.add(attrs[k]):0)}
      else if(k==='style'){
        Object.keys(attrs[k]).forEach(ks=>{
          e.style[ks]=attrs[k][ks];
        });
       }
      else if(k==='text'){attrs[k]===''?e.innerHTML='&nbsp;':e.innerText=attrs[k]}
      else e[k]=attrs[k];
    });
    return e;
  }

  if (single === null) {
    var theSelector = document.querySelectorAll("select[multiple]")
  } else {
    var theSelector = document.querySelectorAll("select[multiple]" + single)

  }

  theSelector.forEach((el,k)=>{

    var div=newEl('div',{class:'multiselect-dropdown',style:{padding:config.style?.padding??''}});
    el.style.display='none';
    el.parentNode.insertBefore(div,el.nextSibling);
    var listWrap=newEl('div',{class:'multiselect-dropdown-list-wrapper'});
    var list=newEl('div',{class:'multiselect-dropdown-list',style:{height:config.height}});
    var search=newEl('input',{class:['multiselect-dropdown-search'].concat([config.searchInput?.class??'form-control']),style:{width:'100%',display:el.attributes['multiselect-search']?.value==='true'?'block':'none'},placeholder:config.txtSearch});
    listWrap.appendChild(search);
    div.appendChild(listWrap);
    listWrap.appendChild(list);

    el.loadOptions=()=>{
      list.innerHTML='';

      if(el.attributes['multiselect-select-all']?.value=='true'){
        var op=newEl('div',{class:'multiselect-dropdown-all-selector'})
        var ic=newEl('input',{type:'checkbox'});
        op.appendChild(ic);
        op.appendChild(newEl('label',{text:config.txtAll}));

        op.addEventListener('click',()=>{
          op.classList.toggle('checked');
          op.querySelector("input").checked=!op.querySelector("input").checked;

          var ch=op.querySelector("input").checked;
          list.querySelectorAll(":scope > div:not(.multiselect-dropdown-all-selector)")
            .forEach(i=>{if(i.style.display!=='none'){i.querySelector("input").checked=ch; i.optEl.selected=ch}});

          el.dispatchEvent(new Event('change'));
        });
        ic.addEventListener('click',(ev)=>{
          ic.checked=!ic.checked;
        });

        list.appendChild(op);
      }

      Array.from(el.options).map(o=>{
        var op=newEl('div',{class:o.selected?'checked':'',optEl:o})
        var ic=newEl('input',{type:'checkbox',checked:o.selected});
        op.appendChild(ic);
        op.appendChild(newEl('label',{text:o.text}));

        op.addEventListener('click',()=>{
          op.classList.toggle('checked');
          op.querySelector("input").checked=!op.querySelector("input").checked;
          op.optEl.selected=!!!op.optEl.selected;
          el.dispatchEvent(new Event('change'));
        });
        ic.addEventListener('click',(ev)=>{
          ic.checked=!ic.checked;
        });
        o.listitemEl=op;
        list.appendChild(op);
      });
      div.listEl=listWrap;

      div.refresh=()=>{
        div.querySelectorAll('span.optext, span.placeholder').forEach(t=>div.removeChild(t));
        var sels=Array.from(el.selectedOptions);
        if(sels.length>(el.attributes['multiselect-max-items']?.value??5)){
          div.appendChild(newEl('span',{class:['optext','maxselected'],text:sels.length+' '+config.txtSelected}));
        }
        else{
          sels.map(x=>{
            var c=newEl('span',{class:'optext',text:x.text, srcOption: x});
            if((el.attributes['multiselect-hide-x']?.value !== 'true'))
              c.appendChild(newEl('span',{class:'optdel',text:'x',title:config.txtRemove, onclick:(ev)=>{c.srcOption.listitemEl.dispatchEvent(new Event('click'));div.refresh();ev.stopPropagation();}}));

            div.appendChild(c);
          });
        }
        if(0==el.selectedOptions.length) div.appendChild(newEl('span',{class:'placeholder',text:el.attributes['placeholder']?.value??config.placeholder}));
      };
      div.refresh();
    }
    el.loadOptions();

    search.addEventListener('input',()=>{
      list.querySelectorAll(":scope div:not(.multiselect-dropdown-all-selector)").forEach(d=>{
        var txt=d.querySelector("label").innerText.toUpperCase();
        d.style.display=txt.includes(search.value.toUpperCase())?'block':'none';
      });
    });

    div.addEventListener('click',()=>{
      div.listEl.style.display='block';
      search.focus();
      search.select();
    });

    document.addEventListener('click', function(event) {
      if (!div.contains(event.target)) {
        listWrap.style.display='none';
        div.refresh();
      }
    });
  });
}

window.addEventListener('load',()=>{
  multiselectDropdown(window.multiselectDropdownOptions);
});

// export {msd};
