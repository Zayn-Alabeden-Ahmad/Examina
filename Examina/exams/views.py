from django.shortcuts import render

from core.models import Level , Teacher , Student

from achievements.models import Achievement , UserAchievement


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Question
from .serializers import CategorySerializer


from rest_framework import status
from .models import Question
from .serializers import QuestionSerializer
import random
from datetime import date
from django.db import transaction
from .models import Card, StudentChaosSession, Question, Answer, StudentAnswer
from .serializers import CardSerializer, StudentChaosSessionSerializer



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
        achievements = Achievement.objects.filter(TargetRole='Student',ActivityType ='student')
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



from .models import ChallengeExam , StudentChallenge
from .serializers import ChallengeExamSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from django.db.models import Max
import random

class ChallengeManagerView(APIView):
    permission_classes = [IsAuthenticated]
    # 1. API إضافة Challenge جديد
    def post(self, request):
        serializer = ChallengeExamSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # 2. API عرض التحديات للطالب مع حساب حالة القفل (Unlocked)
    def get(self, request, student_id):
        challenges = ChallengeExam.objects.all().order_by('MinPointsRequired')
        student = Student.objects.get(pk=student_id)
        data = []

        for challenge in challenges:
            is_unlocked = False
            
            # التحقق من شرط النقاط الأدنى
            if student.StudentPoints >= challenge.MinPointsRequired:
                # إذا لم يكن هناك تحدي سابق، يفتح تلقائياً
                if not challenge.PreviousChallengeID:
                    is_unlocked = True
                else:
                    # التحقق إذا نجح الطالب في التحدي السابق
                    prev_attempt = StudentChallenge.objects.filter(
                        Student=student, 
                        ChallengeExam=challenge.PreviousChallengeID,
                        IsCompleted=True
                    ).exists()
                    if prev_attempt:
                        is_unlocked = True

            challenge_data = ChallengeExamSerializer(challenge).data
            challenge_data['IsUnlocked'] = is_unlocked
            data.append(challenge_data)
            
        return Response(data)   



import random
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import ChallengeExam, Student, Question, StudentChallenge, Answer

class GenerateChallengeQuestionsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, challenge_id, student_id):
        try:
            challenge = ChallengeExam.objects.get(pk=challenge_id)
            student = Student.objects.get(pk=student_id)

            # --- التعديل هنا: البحث عن محاولة قائمة لم تنتهِ بعد ---
            existing_attempt = StudentChallenge.objects.filter(
                Student=student, 
                ChallengeExam=challenge, 
                ChallengeStatus='pending',
                IsCompleted=False
            ).first()

            # إذا في محاولة قديمة ومعها أسئلة، رجعها هي نفسها
            if existing_attempt and existing_attempt.Questions.exists():
                selected_questions = existing_attempt.Questions.all()
                total_required = existing_attempt.Scoreofchallenge
            else:
                # --- المنطق القديم تبعك لاختيار أسئلة جديدة ---
                min_pts = challenge.MinPointsRequired
                if min_pts <= 333: target_rates = [100]
                elif min_pts <= 999: target_rates = [100, 200]
                elif min_pts <= 1999: target_rates = [200]
                elif min_pts <= 2999: target_rates = [200, 300]
                else: target_rates = [300]

                questions_pool = list(Question.objects.filter(QuestionType='Challenge', Rate__in=target_rates))
                if len(questions_pool) < 10:
                    return Response({"error": "No enough questions found"}, status=404)
                
                selected_questions = random.sample(questions_pool, 10)
                total_required = sum(q.Points for q in selected_questions)

                # تحديث أو إنشاء سجل المحاولة
                attempt, _ = StudentChallenge.objects.update_or_create(
                    Student=student,
                    ChallengeExam=challenge,
                    defaults={
                        'Scoreofchallenge': total_required,
                        'ChallengeStatus': 'pending',
                        'IsCompleted': False,
                        'StartDate': timezone.now(),
                        'EndDate': timezone.now()
                    }
                )
                attempt.Questions.set(selected_questions)
                attempt.AttemptsCount += 1
                attempt.save()

            # --- بناء الرد (نفس كودك الأصلي) ---
            result = []
            for q in selected_questions:
                answers = Answer.objects.filter(Question=q).values('AnswerID', 'AnswerText')
                result.append({
                    'id': q.QuestionID,
                    'QuestionName': q.QuestionName,
                    'text': q.QuestionText,
                    'points': q.Points,
                    'answers': list(answers)
                })

            return Response({"Scoreofchallenge": total_required, "questions": result})

        except (ChallengeExam.DoesNotExist, Student.DoesNotExist):
            return Response({"error": "Data not found"}, status=404)



from datetime import date
from django.utils import timezone
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import ChallengeExam, Answer, StudentChallenge


from achievements.models import Achievement , UserAchievement


class SubmitChallengeView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        student_id = request.data.get('student_id')
        challenge_id = request.data.get('challenge_id')
        user_answers_ids = request.data.get('answers') # قائمة بـ IDs الإجابات

        try:
            student = Student.objects.get(pk=student_id)
            challenge = ChallengeExam.objects.get(pk=challenge_id)
            
            # الحل 1 & 2: جلب المحاولة والأسئلة المسموحة المرتبطة بها حصراً
            attempt = StudentChallenge.objects.prefetch_related('Questions').get(
                Student=student, 
                ChallengeExam=challenge
            )
            allowed_questions = attempt.Questions.all() 
            
        except StudentChallenge.DoesNotExist:
            return Response({"error": "يجب توليد الأسئلة أولاً لهذه المحاولة!"}, status=status.HTTP_400_BAD_REQUEST)
        except (Student.DoesNotExist, ChallengeExam.DoesNotExist):
            return Response({"error": "الطالب أو التحدي غير موجود"}, status=status.HTTP_404_NOT_FOUND)
        
        total_score = 0
        total_penalty = 0
        processed_question_ids = set() # لمنع التلاعب بتكرار إرسال إجابة صحيحة واحدة

        # 1. حساب النقاط والخصومات مع التحقق الأمني
        for ans_id in user_answers_ids:
            try:
                # جلب الإجابة مع السؤال المرتبط بها
                answer = Answer.objects.select_related('Question').get(pk=ans_id)
                question = answer.Question
                
                # --- الفلترة الأمنية (الحل الثاني) ---
                # نتحقق: هل السؤال جزء من الأسئلة المولدة للطالب؟ وهل تم معالجته مسبقاً؟
                if question in allowed_questions and question.QuestionID not in processed_question_ids:
                    processed_question_ids.add(question.QuestionID)
                    
                    if answer.IsCorrect:
                        total_score += question.Points
                    else:
                        # حساب الخصم بناءً على نسبة العقوبة المحددة في التحدي
                        penalty_amount = (challenge.PenaltyPoints / 100) * question.Points
                        total_penalty += penalty_amount
                        
            except Answer.DoesNotExist:
                continue

        # 2. الخصم المباشر من رصيد الطالب في حال وجود أخطاء (Penalty)
        if total_penalty > 0:
            student.StudentPoints = max(0, student.StudentPoints - total_penalty)
            student.save()

        # 3. تحديث بيانات المحاولة
        attempt.EndDate = timezone.now()
        attempt.ChallengeScore = total_score
        attempt.LevelAtAttempt = getattr(student, 'level', 0) 
        
        new_achievement_earned = None

        # 4. تقييم النتيجة (الحل الأول: التساوي التام مع السكور المطلوب للمحاولة)
        if total_score == attempt.Scoreofchallenge:
            attempt.ChallengeStatus = 'success'
            attempt.IsCompleted = True
            
            # إضافة سكور التحدي لرصيد الطالب الكلي
            student.StudentPoints += total_score
            student.save()

            # --- منطق الإنجازات (Achievements) ---
            eligible_achievement = Achievement.objects.filter(
                ActivityType='challenge',
                TargetRole='Student',
                PointsRequired__lte=student.StudentPoints
            ).exclude(
                userachievement__Person=student.Person
            ).order_by('-PointsRequired').first()

            if eligible_achievement:
                user_ach = UserAchievement.objects.create(
                    Person=student.Person,
                    Achievement=eligible_achievement,
                    DateEarned=date.today()
                )
                new_achievement_earned = {
                    "name": eligible_achievement.Name,
                    "description": eligible_achievement.Description,
                    "image": eligible_achievement.Image.url if eligible_achievement.Image else None,
                    "date_earned": user_ach.DateEarned
                }
        else:
            attempt.ChallengeStatus = 'fail'
            attempt.IsCompleted = False

        attempt.save()
        
        return Response({
            "status": attempt.ChallengeStatus,
            "score_achieved": total_score,
            "required_score": attempt.Scoreofchallenge, # عرض السكور الذي كان مطلوباً منه
            "penalty_deducted": total_penalty,
            "current_student_points": student.StudentPoints,
            "attempts_count": attempt.AttemptsCount,
            "new_achievement": new_achievement_earned
        })
    





from core.serializers import LevelSerializer

class LevelListView(APIView):
    def get(self, request):
        levels = Level.objects.all().order_by('MinPointsRequired')
        serializer = LevelSerializer(levels, many=True)
        return Response(serializer.data)
    
class ChaosEntryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        student = request.user.student
        today = date.today()

        session, _ = StudentChaosSession.objects.get_or_create(
            Student=student,
            DayKey=today
        )

        active_cards = list(Card.objects.filter(IsActive=True))
        if len(active_cards) < 3:
            return Response({"error": "Need at least 3 active cards."}, status=400)

        # بطاقة اليوم ثابتة لليوم
        if not session.DailyCard:
            session.DailyCard = random.choice(active_cards)
            session.save(update_fields=["DailyCard"])

        random_three = random.sample(active_cards, 3)

        return Response({
            "session": StudentChaosSessionSerializer(session).data,
            "random_cards": CardSerializer(random_three, many=True).data
        })
    


class ChaosSelectCardView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        student = request.user.student
        today = date.today()
        card_id = request.data.get("card_id")

        if not card_id:
            return Response({"error": "card_id is required"}, status=400)

        try:
            card = Card.objects.get(CardID=card_id, IsActive=True)
        except Card.DoesNotExist:
            return Response({"error": "Card not found"}, status=404)

        session, _ = StudentChaosSession.objects.get_or_create(Student=student, DayKey=today)
        session.ChosenCard = card
        session.save(update_fields=["ChosenCard", "UpdatedAt"])

        return Response({
            "message": "Card selected",
            "session": StudentChaosSessionSerializer(session).data
        }, status=200)
    
class ChaosQuestionsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        student = request.user.student
        today = date.today()

        try:
            session = StudentChaosSession.objects.select_related("ChosenCard").get(Student=student, DayKey=today)
        except StudentChaosSession.DoesNotExist:
            return Response({"error": "No chaos session for today."}, status=404)

        if not session.ChosenCard:
            return Response({"error": "No chosen card yet."}, status=400)

        card = session.ChosenCard
        qs = Question.objects.filter(QuestionType="Regular")

        if card.Type == "FORCE_CATEGORY":
            qs = qs.filter(Category=card.Value)

        if card.Type == "FORCE_DIFFICULTY":
            map_rate = {"Easy": 100, "Medium": 200, "Hard": 300}
            rate = map_rate.get(str(card.Value).strip(), 100)
            qs = qs.filter(Rate=rate)

        questions = qs.prefetch_related("answer_set").order_by("?")[:10]
        if not questions:
            return Response({"error": "No questions found for this card effect."}, status=404)

        payload = []
        for q in questions:
            answers = q.answer_set.all().values("AnswerID", "AnswerText")
            payload.append({
                "QuestionID": q.QuestionID,
                "QuestionName": q.QuestionName,
                "QuestionText": q.QuestionText,
                "Category": q.Category,
                "Rate": q.Rate,
                "Points": q.Points,
                "answers": list(answers)
            })

        return Response({
            "card": CardSerializer(card).data,
            "questions": payload
        }, status=200)
    
class SubmitChaosAnswersView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        student = request.user.student
        today = date.today()
        answers_payload = request.data.get("answers", [])

        try:
            session = StudentChaosSession.objects.select_related("ChosenCard").get(
                Student=student, DayKey=today
            )
        except StudentChaosSession.DoesNotExist:
            return Response({"error": "No chaos session."}, status=404)

        if not session.ChosenCard:
            return Response({"error": "No selected card."}, status=400)

        card = session.ChosenCard
        total_chaos = 0
        report = []
        correct_count = 0
        wrong_count = 0

        for item in answers_payload:
            qid = item.get("questionId")
            aid = item.get("answerId")
            if not qid or not aid:
                continue

            try:
                question = Question.objects.get(pk=qid)
                selected = Answer.objects.get(pk=aid, Question=question)
                correct_ans = Answer.objects.filter(Question=question, IsCorrect=True).first()
            except (Question.DoesNotExist, Answer.DoesNotExist):
                continue

            is_correct = bool(selected.IsCorrect)

            if is_correct:
                base_points = question.Points
                final_points = base_points

                if card.Type == "PERCENT_POINTS":
                    pct = int(card.Value)
                    final_points = int(base_points + (base_points * pct / 100))
                elif card.Type == "FLAT_POINTS":
                    flat = int(card.Value)
                    final_points = base_points + flat

                final_points = max(0, final_points)
                correct_count += 1
            else:
                base_points = 0
                final_points = 0
                wrong_count += 1

            total_chaos += final_points

            StudentAnswer.objects.create(
                Student=student,
                Question=question,
                SelectedAnswer=selected,
                IsCorrect=is_correct,
                PointsEarned=final_points,
                RateByStudent=0
            )

            report.append({
                "question_id": question.QuestionID,
                "question_text": question.QuestionText,
                "student_answer": selected.AnswerText,
                "correct_answer": correct_ans.AnswerText if correct_ans else "-",
                "is_correct": is_correct,
                "base_points": base_points,
                "final_points": final_points
            })

        # لا ترجع نجاح مع تقرير فارغ
        if not report:
            return Response({"error": "No valid answers were processed."}, status=400)

        session.ChaosScore += total_chaos
        session.save(update_fields=["ChaosScore", "UpdatedAt"])

        student.StudentPoints += total_chaos
        student.save(update_fields=["StudentPoints"])

        return Response({
            "status": "success",
            "chaos_score_gained": total_chaos,
            "current_chaos_score": session.ChaosScore,
            "current_student_points": student.StudentPoints,
            "correct_count": correct_count,
            "wrong_count": wrong_count,
            "report": report
        }, status=200)