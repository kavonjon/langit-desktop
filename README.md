# langit-desktop
Desktop application component of langit

## Notice

This is pre-production software and no warranty is provided in any way. User assumes full responsibility when using this software. Backup your data!

## Prerequisites

Requires Python 3.7-3.8

Tested mainly on Linux with Firefox

Firefox or Chrome recommended

## Install

### Unix based systems (Linux, Mac)

Clone or download this repository

Open terminal and navigate to repository folder

Run the following commands:

```bash
python -m venv venv

source venv/bin/activate

pip install -r requirements.txt

cd src/

python manage.py runserver

```

Keep that terminal window open and open another. Once again navigate to the repository folder.

Run the following commands:


```bash

source venv/bin/activate

cd src/

python manage.py monitorfiles

```

Your folder for managing collections is located at [repository_folder]/src/media/

To view the web application, open [repository_folder]/offline-web/index.html in a browser.

### Windows
Clone or download this repository

Open terminal and navigate to repository folder

Run the following commands:

```bash
python -m venv venv

venv\Scripts\activate

pip install -r requirements.txt

cd src

python manage.py runserver

```

Keep that terminal window open and open another. Once again navigate to the repository folder.

Run the following commands:


```bash

venv\Scripts\activate

cd src

python manage.py monitorfiles

```

Your folder for managing collections is located at [repository_folder]/src/media/

To view the web application, open [repository_folder]/offline-web/index.html in a browser.
