#exams.task.py
from celery import shared_task
from django.db.models import F
from django.utils import timezone
from core.models import Teacher, StarLevel
from core.utils import award_teacher_star_achievements

@shared_task
def apply_teacher_rating(teacher_id, total_points, rated_count):
    teacher = Teacher.objects.get(pk=teacher_id)

    # تحديث النقاط وعدد مرات التقييم بطريقة متزامنة
    teacher.StarTotalPoints = (teacher.StarTotalPoints or 0) + total_points
    teacher.RatingCount = (teacher.RatingCount or 0) + rated_count

    avg_rating = teacher.StarTotalPoints / teacher.RatingCount if teacher.RatingCount > 0 else 0

    new_star_level = StarLevel.objects.filter(
        MinRating__lte=avg_rating,
        MaxRating__gte=avg_rating
    ).first()

   
    # تحقق إن حصل تغيير في StarLevel
    prev_level = teacher.StarLevel
    if new_star_level and (not prev_level or new_star_level.StarID != prev_level.StarID):
        teacher.StarLevel = new_star_level
        teacher.Stared = True if new_star_level.NumStars > 0 else False
        
        award_teacher_star_achievements(teacher, new_star_level)

    teacher.save()
    

