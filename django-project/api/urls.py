from django.urls import path
from . import views

urlpatterns = [
    path('items/', views.items_list, name='items-list'),
    path('items/<int:item_id>/', views.item_detail, name='item-detail'),
]
