"""
Django settings for myproject.
"""

SECRET_KEY = 'django-insecure-simple-key-for-demo'
DEBUG = True
ALLOWED_HOSTS = ['*']

INSTALLED_APPS = [
    'django.contrib.contenttypes',
    'django.contrib.auth',
]

MIDDLEWARE = []

ROOT_URLCONF = 'myproject.urls'

LANGUAGE_CODE = 'ru-ru'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True
