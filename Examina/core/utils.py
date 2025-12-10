from django.utils import timezone
from .models import Teacher
from achievements.models import Achievement, UserAchievement

def award_teacher_star_achievements(teacher: Teacher, created_star_level):
    """
    منح إنجازات تابعة للنجوم عندما يتغير StarLevel للأستاذ.
    created_star_level: StarLevel object (الجديد)
    """
    if not created_star_level:
        return []

    # اختر إنجازات المعلمة للنظام النجومي
    # نبحث عن Achievements من النوع 'stars' و TargetRole='Teacher' و numberofstars <= created_star_level.NumStars
    achs = Achievement.objects.filter(
        TargetRole='Teacher',
        ActivityType='stars',
        numberofstars__lte=created_star_level.NumStars
    )

    for ach in achs:
        exists = UserAchievement.objects.filter(Person=teacher.Person, Achievement=ach).exists()
        if not exists:
            ua = UserAchievement.objects.create(
                Person=teacher.Person,
                Achievement=ach,
                DateEarned=timezone.now().date()
            )



def award_teacher_question_achievements(teacher: Teacher):
    """
    منح إنجازات متعلقة بالأسئلة (added/edited/deleted) حسب العدّادات داخل teacher.
    ترجع قائمة الإنجازات الجديدة (قابلة للإرسال في الاستجابة).
    """
    new_awards = []

    # added
    achs = Achievement.objects.filter(TargetRole='Teacher', ActivityType='questions_added')
    for ach in achs:
        if teacher.QuestionsAdded >= ach.PointsRequired:
            if not UserAchievement.objects.filter(Person=teacher.Person, Achievement=ach).exists():
                ua = UserAchievement.objects.create(
                    Person=teacher.Person,
                    Achievement=ach,
                    DateEarned=timezone.now().date()
                )
                new_awards.append({
                    "id": ach.AchievementID,
                    "name": ach.Name,
                    "description": ach.Description,
                    "image": ach.Image.url if ach.Image else None,
                    "activity": ach.ActivityType,
                    "threshold": ach.PointsRequired
                })

    # edited
    achs = Achievement.objects.filter(TargetRole='Teacher', ActivityType='questions_edited')
    for ach in achs:
        if teacher.QuestionsEdited >= ach.PointsRequired:
            if not UserAchievement.objects.filter(Person=teacher.Person, Achievement=ach).exists():
                ua = UserAchievement.objects.create(
                    Person=teacher.Person,
                    Achievement=ach,
                    DateEarned=timezone.now().date()
                )
                new_awards.append({
                    "id": ach.AchievementID,
                    "name": ach.Name,
                    "description": ach.Description,
                    "image": ach.Image.url if ach.Image else None,
                    "activity": ach.ActivityType,
                    "threshold": ach.PointsRequired
                })

    # deleted
    achs = Achievement.objects.filter(TargetRole='Teacher', ActivityType='questions_deleted')
    for ach in achs:
        if teacher.QuestionsDeleted >= ach.PointsRequired:
            if not UserAchievement.objects.filter(Person=teacher.Person, Achievement=ach).exists():
                ua = UserAchievement.objects.create(
                    Person=teacher.Person,
                    Achievement=ach,
                    DateEarned=timezone.now().date()
                )
                new_awards.append({
                    "id": ach.AchievementID,
                    "name": ach.Name,
                    "description": ach.Description,
                    "image": ach.Image.url if ach.Image else None,
                    "activity": ach.ActivityType,
                    "threshold": ach.PointsRequired
                })

    return new_awards