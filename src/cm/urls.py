from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from . import views

urlpatterns = [
    path('', views.apiOverview, name="api-overview"),
    path('last-update/', views.getLastUpdatedTime, name='last-update'),
    path('collitemfile/list/', views.collItemFileList, name='collitemfile-list'),
    path('collitemfile/detail/<str:pk>/', views.collItemFileDetail, name='collitemfile-detail'),
    path('collitemfile/create/', views.collItemFileCreate, name='collitemfile-create'),
    path('collitemfile/update/<str:pk>/', views.collItemFileUpdate, name='collitemfile-update'),
    path('collitemfile/delete/<str:pk>/', views.collItemFileDelete, name='collitemfile-delete'),
    path('otherfile/list/', views.otherFileList, name='otherfile-list'),
    path('git/init/<str:pk>/', views.git_init, name='git-init'),
    path('git/commit/<str:pk>/', views.git_commit_single, name='git-commit-single'),
    path('git/commit-all/', views.git_commit_all, name='git-commit-all'),
    path('archive/<str:pk>/', views.build_kaipu_export, name='build_kaipu_export'),
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
