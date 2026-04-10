from django.db import models

# Create your models here.
from core.models import Person 

# core/models.py (تعديل Achievement فقط)

class Achievement(models.Model):
    ACTIVITY_CHOICES = [
        ('stars', 'Stars'),       # إنجاز مرتبط بعدد النجوم
        ('student', 'Student'),                
        ('questions_added', 'Questions Added'),# إنجاز مرتبط بعدد الأسئلة المضافة
        ('questions_edited', 'Questions Edited'),# تعديل الأسئلة
        ('questions_deleted', 'Questions Deleted'),
        ('challenge', 'Challenge'),
    ]

    AchievementID = models.AutoField(primary_key=True)
    Name = models.CharField(max_length=200)
    Description = models.TextField()
    Image = models.ImageField(upload_to='achievements/')
    PointsRequired = models.IntegerField()       # عتبة: لنجوم -> عدد نجوم، لنشاط -> عدد الأسئلة المطلوبة
    numberofstars = models.IntegerField(default=0)  # يستخدم عادة عند ActivityType='stars'
    ActivityType = models.CharField(max_length=50, choices=ACTIVITY_CHOICES, default='stars')
    TargetRole = models.CharField(max_length=50, choices=[('Student', 'Student'), ('Teacher', 'Teacher')])

    def __str__(self):
        return self.Name



class UserAchievement(models.Model):
    UserAchievementID = models.AutoField(primary_key=True)
    Person = models.ForeignKey(Person, on_delete=models.CASCADE)
    Achievement = models.ForeignKey(Achievement, on_delete=models.CASCADE)
    DateEarned = models.DateField()

    def __str__(self):
        return f'{self.Person.first_name} - {self.Achievement.Name}'
