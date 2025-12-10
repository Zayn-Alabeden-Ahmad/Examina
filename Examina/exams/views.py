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

class CategoryListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        categories = Question.objects.values("Category").distinct()
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data)



class QuestionsByCategoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, category_name):
        questions = Question.objects.filter(
            Category=category_name,
            QuestionType="Regular"
        ).prefetch_related("answer_set")

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
    def post(self, request):
        student = request.user.student
        serializer = StudentAnswerInputSerializer(data=request.data, many=True)
        serializer.is_valid(raise_exception=True)

        student_answers = []
        teacher_updates = {}
        total_points_earned = 0
        new_achievements = []

        for ans in serializer.validated_data:
            question = Question.objects.get(pk=ans["questionId"])
            answer = Answer.objects.get(pk=ans["answerId"])

            student_answers.append(
                StudentAnswer(
                    Student=student,
                    Question=question,
                    SelectedAnswer=answer,
                    IsCorrect=ans["isCorrect"],
                    PointsEarned=ans["pointsEarned"],
                    RateByStudent=ans["qRatedByStudent"],
                    AnsweredAt=timezone.now()
                )
            )

            total_points_earned += ans["pointsEarned"]

            # جمع تقييم الأساتذة
            teacher_id = question.Teacher.TeacherID
            if teacher_id not in teacher_updates:
                teacher_updates[teacher_id] = {"points": 0, "count": 0}
            teacher_updates[teacher_id]["points"] += ans["qRatedByStudent"]
            teacher_updates[teacher_id]["count"] += 1

        # حفظ إجابات الطالب دفعة واحدة
        StudentAnswer.objects.bulk_create(student_answers)

        # تحديث نقاط الطالب
        student.StudentPoints += total_points_earned

        # تحديث المستوى إذا تم الوصول لنقاط أعلى
        new_level = Level.objects.filter(
            MinPointsRequired__lte=student.StudentPoints,
            MaxPoints__gte=student.StudentPoints
        ).first()
        if new_level and student.Level != new_level:
            student.Level = new_level

        student.save()

        # التحقق من الإنجازات الجديدة
        achievements = Achievement.objects.filter(TargetRole='Student')
        for achievement in achievements:
            if student.StudentPoints >= achievement.PointsRequired:
                if not UserAchievement.objects.filter(Person=student.Person, Achievement=achievement).exists():
                    ua = UserAchievement.objects.create(
                        Person=student.Person,
                        Achievement=achievement,
                        DateEarned=timezone.now().date()
                    )
                    new_achievements.append({
                        "id": ua.Achievement.AchievementID,
                        "name": ua.Achievement.Name,
                        "description": ua.Achievement.Description,
                        "image": ua.Achievement.Image.url,
                        "points_required": ua.Achievement.PointsRequired
                    })

        # إرسال تحديث تقييم الأساتذة إلى Celery
        for teacher_id, data in teacher_updates.items():
            apply_teacher_rating.delay(
                teacher_id,
                data["points"],
                data["count"]
            )

        # الاستجابة للطالب
        return Response({
            "status": "success",
            "total_points_earned": total_points_earned,
            "current_points": student.StudentPoints,
            "current_level": student.Level.LevelName if student.Level else None,
            "new_achievements": new_achievements
        }, status=status.HTTP_200_OK)
