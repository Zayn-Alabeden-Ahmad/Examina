from django.utils import timezone
from .models import Achievement, UserAchievement

def check_and_award_achievements(person):
    """
    دالة موحدة تمنح الإنجازات للطالب والمعلم وتعيد الإنجازات الجديدة فقط.
    """
    new_awards = []
    
    # 1. تحديد نوع المستخدم والقيم الحالية
    if hasattr(person, 'student'):
        target_role = 'Student'
        current_value = person.student.StudentPoints
    elif hasattr(person, 'teacher'):
        target_role = 'Teacher'
        # جلب النجوم أو عدد الأسئلة المضافة (يمكنك اختيار المعيار الأهم هنا)
        current_value = person.teacher.StarLevel.NumStars if person.teacher.StarLevel else 0
    else:
        return []

    # 2. منح الإنجازات الجديدة (التي لم تسجل في الجدول نهائياً)
    earned_ids = UserAchievement.objects.filter(Person=person).values_list('Achievement_id', flat=True)
    
    # فلترة الإنجازات بناءً على الدور
    potential_achievements = Achievement.objects.filter(TargetRole=target_role).exclude(AchievementID__in=earned_ids)

    for ach in potential_achievements:
        is_eligible = False
        if target_role == 'Student' and ach.PointsRequired is not None:
            is_eligible = current_value >= ach.PointsRequired
        elif target_role == 'Teacher' and ach.numberofstars is not None:
            is_eligible = current_value >= ach.numberofstars

        if is_eligible:
            UserAchievement.objects.create(
                Person=person, 
                Achievement=ach, 
                DateEarned=timezone.now().date(),
                is_notified=False  # هامة جداً
            )

    # 3. جلب كل ما هو "غير مُخطر" (is_notified=False) وإعادته ثم تحويله لـ True
    unseen_achievements = UserAchievement.objects.filter(Person=person, is_notified=False)
    
    for ua in unseen_achievements:
        new_awards.append({
            "id": ua.Achievement.AchievementID,
            "name": ua.Achievement.Name,
            "description": ua.Achievement.Description,
            "image": ua.Achievement.Image.url if ua.Achievement.Image else None,
        })
        ua.is_notified = True
        ua.save()

    return new_awards