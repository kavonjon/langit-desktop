# langit-desktop
Desktop application component of langit

## Notice

This is pre-production software and no warranty is provided in any way. User assumes full responsibility when using this software. Back up your data!

## Prerequisites

Python 3.8

Tested in linux, likely works on Mac and Windows

Firefox or Chrome recommended

## Install

### Unix based systems (Linux, Mac)
clone or download this repository

open terminal and navigate to repository folder

run the following commands:

```bash
python3.8 -m venv venv

source venv/bin/activate

pip install -r requirements.txt

cd src/

python manage.py runserver

```

Keep that terminal window open and open another. Once again navigate to the repository folder.

run the following commands:


```bash

source venv/bin/activate

cd src/

python manage.py monitorfiles

```

Your folder for managing collections is located at [repository_folder]/src/media/

To view the web application, open [repository_folder]/offline-web/index.html in a browser.

### Unix based systems (Linux, Mac)
