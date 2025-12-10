from django.db import models
from .managers import CustomUserManager 
from django.contrib.auth.models import AbstractUser


class Person(AbstractUser):
    id = models.AutoField(primary_key=True) 
    email = models.EmailField(unique=True)
    Status=models.CharField(max_length=20,default='active')
    token_version = models.IntegerField(default=1)
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name'] 
    objects = CustomUserManager()

    # @property
    # def id(self):
    #   return self.PersonID

    def str(self):
        return f'{self.first_name} {self.last_name}'
    

class Teacher(models.Model):
    TeacherID = models.AutoField(primary_key=True)
    Person = models.OneToOneField(Person, on_delete=models.CASCADE)
    Age = models.IntegerField()
    
    StarTotalPoints = models.IntegerField(default=0)  # مجموع نقاط التقييم (لحساب المتوسط)
    RatingCount = models.IntegerField(default=0)      # عدد مرات تقييم أسئلة الأستاذ
    Stared = models.BooleanField(default=False)       # True إذا حصل على نجمة واحدة على الأقل
    StarLevel = models.ForeignKey(
        'StarLevel', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        default=None,
        related_name='teachers'
    )  # يمثل عدد النجوم الحالي حسب المستوى


    QuestionsAdded = models.IntegerField(default=0)
    QuestionsEdited = models.IntegerField(default=0)
    QuestionsDeleted = models.IntegerField(default=0)

    Permissions = models.BooleanField(default=True)
    Manager = models.ForeignKey('self', null=True, blank=True, on_delete=models.SET_NULL)

    def __str__(self):
        return f'Teacher {self.Person.first_name} {self.Person.last_name}'





class Student(models.Model):
    StudentID = models.AutoField(primary_key=True)
    Person = models.OneToOneField(Person, on_delete=models.CASCADE)
    Level = models.ForeignKey('Level', on_delete=models.SET_NULL, null=True)
    StudentPoints = models.IntegerField(default=0)

    def __str__(self):
        return f'Student {self.Person.first_name} {self.Person.last_name}'


class Profile(models.Model):
    ProfileID = models.AutoField(primary_key=True)
    Person = models.OneToOneField(Person, on_delete=models.CASCADE , related_name='profile')
    ProfilePicture = models.ImageField(upload_to='profile_pics/', null=True, blank=True)
    Bio = models.TextField(null=True, blank=True)

    def __str__(self):
        return f'Profile of {self.Person.first_name} {self.Person.last_name}'


class Level(models.Model):
    LevelID = models.AutoField(primary_key=True)
    LevelName = models.CharField(max_length=100)
    subLevel=models.IntegerField(null=True)
    MinPointsRequired = models.IntegerField()
    MaxPoints = models.IntegerField()

    def __str__(self):
        return f'Level {self.LevelName}'



class StarLevel(models.Model):
    StarID = models.AutoField(primary_key=True)
    MinRating = models.FloatField()  # أقل متوسط تقييم للحصول على هذا المستوى
    MaxRating = models.FloatField()  # أعلى متوسط تقييم
    NumStars = models.IntegerField()  # عدد النجوم المقابل
    Description = models.CharField(max_length=200, null=True, blank=True)

    def __str__(self):
        return f"{self.NumStars} Stars ({self.MinRating}-{self.MaxRating})"
    

