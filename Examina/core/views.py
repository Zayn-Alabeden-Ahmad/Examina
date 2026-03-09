from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Student , Teacher ,Level
from exams.models import Question
from core.serializers import StudentRegisterSerializer , LoginSerializer , MyTokenObtainPairSerializer
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated , AllowAny
from rest_framework.permissions import AllowAny, IsAuthenticated

def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

class StudentRegisterView(APIView):
    permission_classes = [AllowAny];
    def post(self, request):
        serializer = StudentRegisterSerializer(data=request.data)
        if serializer.is_valid():
            person = serializer.save()
            tokens = get_tokens_for_user(person)

            return Response({
                "message": "success",
                "refresh": tokens['refresh'],
                "access": tokens['access'],
            }, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    permission_classes = [AllowAny];
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]

        # تحديث status + last_login
        user.Status = "active"
        user.last_login = timezone.now()
        user.save(update_fields=["Status", "last_login"])

        tokens = MyTokenObtainPairSerializer.get_token(user)

        return Response({
            "refresh": str(tokens),
            "access": str(tokens.access_token),
        }, status=status.HTTP_200_OK)


class LogoutView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        user = request.user

        # إلغاء كل التوكنات القديمة عن طريق زيادة النسخة
        user.token_version += 1
        user.Status = "inactive"
        user.save(update_fields=["token_version", "Status"])

        return Response(
            {"message": "تم تسجيل الخروج بنجاح"},
            status=status.HTTP_205_RESET_CONTENT
        )

        
class HomeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        if hasattr(user, 'teacher'):
            teacher = user.teacher
            data = {
                "name": user.first_name,
                "stared":teacher.Stared,
                "NumStars": teacher.StarLevel.NumStars if teacher.StarLevel else 0,
                "status": user.Status,
                "profile_picture": user.profile.ProfilePicture.url if user.profile.ProfilePicture else None,

            }
        elif hasattr(user, 'student'):
            student = user.student
            data = {
                "name": user.first_name,
                "points": student.StudentPoints,
                "level": student.Level.LevelName if student.Level else None,
                "subLevel":student.Level.subLevel,
                "status": user.Status,
                "profile_picture": user.profile.ProfilePicture.url if user.profile.ProfilePicture else None,
                
            }
       
            
        return Response(data)



   

from django.shortcuts import get_object_or_404


from exams.serializers import QuestionSerializer
from .utils import award_teacher_question_achievements


 
class CreateQuestionAPIView(APIView):
    permission_classes = (IsAuthenticated,)  # فقط نثق بالـ router أنه خاص بالأساتذة

    def post(self, request):
        teacher = request.user.teacher  # بدون تحقق لأنك ضامن أنها موجودة

        serializer = QuestionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        q = serializer.save(Teacher=teacher)

        # تحديث عداد الإضافة
        teacher.QuestionsAdded += 1
        teacher.save(update_fields=['QuestionsAdded'])

        # منح إنجازات الأسئلة
        new_awards = award_teacher_question_achievements(teacher)

        return Response({
            "status": "created",
            "question": QuestionSerializer(q).data,
            "new_awards": new_awards,
        }, status=status.HTTP_201_CREATED)


class UpdateQuestionAPIView(APIView):
    permission_classes = (IsAuthenticated,)

    def put(self, request, pk):
        teacher = request.user.teacher
        question = get_object_or_404(Question, pk=pk)

        if question.Teacher != teacher:
            return Response({"detail": "Not allowed."}, status=status.HTTP_403_FORBIDDEN)

        serializer = QuestionSerializer(question, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        q = serializer.save()

        teacher.QuestionsEdited += 1
        teacher.save(update_fields=['QuestionsEdited'])

        new_awards = award_teacher_question_achievements(teacher)

        return Response({
            "status": "updated",
            "question": QuestionSerializer(q).data,
            "new_awards": new_awards,
        }, status=status.HTTP_200_OK)


class DeleteQuestionAPIView(APIView):
    permission_classes = (IsAuthenticated,)

    def delete(self, request, pk):
        teacher = request.user.teacher
        question = get_object_or_404(Question, pk=pk)

        if question.Teacher != teacher:
            return Response({"detail": "Not allowed."}, status=status.HTTP_403_FORBIDDEN)

        question.delete()

        teacher.QuestionsDeleted += 1
        teacher.save(update_fields=['QuestionsDeleted'])

        new_awards = award_teacher_question_achievements(teacher)

        return Response({
            "status": "deleted",
            "new_awards": new_awards,
        }, status=status.HTTP_200_OK)



class GetMyQuestionsAPIView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        teacher = request.user.teacher  # مضمون أنه موجود

        # إحضار الأسئلة الخاصة بهذا المدرّس فقط
        my_questions = Question.objects.filter(Teacher=teacher)

        serializer = QuestionSerializer(my_questions, many=True)

        return Response({
            "teacher_id": teacher.TeacherID,
            "total": my_questions.count(),
            "questions": serializer.data
        }, status=status.HTTP_200_OK)
    

    
