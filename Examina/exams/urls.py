from django.urls import path
from .views import CategoryListView , QuestionsByCategoryView
from .views import SubmitStudentAnswers

urlpatterns = [
    path('category/', CategoryListView.as_view(), name='categories'),
    path("questions/<str:category_name>/", QuestionsByCategoryView.as_view()),
    path("submitAnswers/", SubmitStudentAnswers.as_view()),
]


