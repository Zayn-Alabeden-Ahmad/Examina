from django.urls import path
from .views import CategoryListView , QuestionsByCategoryView
from .views import SubmitStudentAnswers

from .views import (
    ChallengeManagerView, GenerateChallengeQuestionsView,SubmitChallengeView
    , LevelListView
)

urlpatterns = [
    path('category/', CategoryListView.as_view(), name='categories'),
    path("questions/<str:category_name>/", QuestionsByCategoryView.as_view()),
    path("submitAnswers/", SubmitStudentAnswers.as_view()),
    path('levels/', LevelListView.as_view(), name='level-list'), # هي مشان ترجع لفلات تعرضا للاستاذ 
    path('challenges/', ChallengeManagerView.as_view(), name='challenge-list-create'), # هي مشان الاستاذ يعمل create challenge 
    path('challenges/student/<int:student_id>/', ChallengeManagerView.as_view(), name='student-challenges'), # بترد ال challenges for student 
    path('challenges/<int:challenge_id>/questions/<int:student_id>', GenerateChallengeQuestionsView.as_view(), name='generate-challenge-questions'), # هي بتولد اسئلة للطالب لما بدو يعمل challenge 
    path('challenges/submit/', SubmitChallengeView.as_view(), name='submit-challenge'), # هي مشان يعالج اجابات الطالب 
    # بدك تعمل واجها لاخر 4 و بدك تزبط المشكلة التالتة لان حل المفروض من الواجهة 
]


    

    
    

