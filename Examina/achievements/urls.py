from django.urls import path
from .views import GetMyAchievements

urlpatterns = [
    # رابط نظيف ومباشر
    path('my-achievements/', GetMyAchievements.as_view(), name='my-achievements'),
]