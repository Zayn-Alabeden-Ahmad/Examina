from django.urls import path 
from core.views import StudentRegisterView
from core.views import LoginView, LogoutView , HomeView , CreateQuestionAPIView , UpdateQuestionAPIView , DeleteQuestionAPIView , GetMyQuestionsAPIView

urlpatterns = [
    path('register/student/', StudentRegisterView.as_view(), name='student-register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('home/',HomeView.as_view(),name="home"),
    path('addquestion/',CreateQuestionAPIView.as_view(), name="add-question"),
    path('questions/<int:pk>/update/', UpdateQuestionAPIView.as_view(), name='question-update'),
    path('questions/<int:pk>/delete/', DeleteQuestionAPIView.as_view(), name='question-delete'),
    path('myquestions/',GetMyQuestionsAPIView.as_view(),name="Questions"),
    
]
