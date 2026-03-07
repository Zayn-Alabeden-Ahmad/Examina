from django.shortcuts import render

from core.models import Level , Teacher 

from achievements.models import Achievement , UserAchievement


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Question
from .serializers import CategorySerializer


from rest_framework import status
from .models import Question
from .serializers import QuestionSerializer

from achievements.utils import check_and_award_achievements


class CategoryListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
  
        categories = Question.objects.values("Category").distinct()
        

        formatted_categories = [{"CategoryName": cat["Category"]} for cat in categories if cat["Category"]]
        
        return Response(formatted_categories)



class QuestionsByCategoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, category_name):

        difficulty_label = request.query_params.get('difficulty', 'Easy')
        
      
        difficulty_map = {
            'Easy': 100,
            'Medium': 200,
            'Hard': 300
        }
        difficulty_value = difficulty_map.get(difficulty_label, 100)

        questions = Question.objects.filter(
            Category=category_name,
            QuestionType="Regular",
            Rate=difficulty_value
        ).prefetch_related("answer_set").order_by('?')[:10] 

        serializer = QuestionSerializer(questions, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)



from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Question, Answer, StudentAnswer
from .serializers import StudentAnswerInputSerializer
from .tasks import apply_teacher_rating

class SubmitStudentAnswers(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        student = request.user.student
        
        # 1. استقبال البيانات وتدقيقها
        serializer = StudentAnswerInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        ans = serializer.validated_data
        
        # 2. جلب السؤال والإجابة
        question = Question.objects.get(pk=ans["questionId"])
        answer = Answer.objects.get(pk=ans["answerId"])

        # 3. إنشاء سجل إجابة الطالب
        student_answer = StudentAnswer.objects.create(
            Student=student,
            Question=question,
            SelectedAnswer=answer,
            IsCorrect=ans["isCorrect"],
            PointsEarned=ans["pointsEarned"],
            RateByStudent=ans["qRatedByStudent"],
            AnsweredAt=timezone.now()
        )

        total_points_earned = ans["pointsEarned"]

        # 4. تحديث نقاط الطالب والمستوى (Leveling System)
        student.StudentPoints += total_points_earned
        
        new_level = Level.objects.filter(
            MinPointsRequired__lte=student.StudentPoints,
            MaxPoints__gte=student.StudentPoints
        ).first()
        
        if new_level and student.Level != new_level:
            student.Level = new_level
        student.save()

        # 5. تحديث تقييم الأستاذ عبر Celery (تحديث النجوم خلف الكواليس)
        teacher_id = question.Teacher.TeacherID
        apply_teacher_rating.delay(
            teacher_id,
            ans["qRatedByStudent"], 
            1                       
        )

        new_achievements = check_and_award_achievements(request.user)

        # 7. الرد النهائي لـ React
        return Response({
            "status": "success",
            "total_points_earned": total_points_earned,
            "current_points": student.StudentPoints,
            "current_level": student.Level.LevelName if student.Level else None,
            "new_achievements": new_achievements # ستلتقطها SweetAlert2 في الفرونت آند
        }, status=status.HTTP_200_OK)