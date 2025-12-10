from django.db import models
from  core.models import Teacher , Student , Level 

class Question(models.Model):
    QuestionID = models.AutoField(primary_key=True)
    QuestionName = models.CharField(max_length=200)
    QuestionText = models.TextField()
    Category = models.CharField(max_length=100)
    Rate = models.IntegerField(choices=[(100, 'Easy'), (200, 'Medium'), (300, 'Hard')])
    Points = models.IntegerField()
    QuestionType = models.CharField(max_length=50, choices=[('Regular', 'Regular'), ('Challenge', 'Challenge')])
    Teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE)

    def __str__(self):
        return self.QuestionName



class Answer(models.Model):
    AnswerID = models.AutoField(primary_key=True)
    Question = models.ForeignKey(Question, on_delete=models.CASCADE)
    AnswerText = models.TextField()
    IsCorrect = models.BooleanField()

    def __str__(self):
        return self.AnswerText



class ChallengeExam(models.Model):
    ChallengeExamID = models.AutoField(primary_key=True)
    ChallengeName = models.CharField(max_length=200)
    Description = models.TextField()
    PenaltyPoints = models.IntegerField(default=0)
    CreatedAt = models.DateTimeField(auto_now_add=True)
    IsUnlocked = models.BooleanField(default=False)
    MinLevelRequired = models.IntegerField()
    PreviousChallengeID = models.ForeignKey('self', null=True, blank=True, on_delete=models.SET_NULL)

    def __str__(self):
        return self.ChallengeName



class StudentChallenge(models.Model):
    StudentChallengeID = models.AutoField(primary_key=True)
    Student = models.ForeignKey(Student, on_delete=models.CASCADE)
    ChallengeExam = models.ForeignKey(ChallengeExam, on_delete=models.CASCADE)
    ChallengeStatus = models.CharField(max_length=50)
    ChallengeScore = models.IntegerField()
    LevelAtAttempt = models.IntegerField(default=0)
    AttemptsCount = models.IntegerField(default=1)
    StartDate = models.DateTimeField()
    EndDate = models.DateTimeField()
    IsCompleted = models.BooleanField(default=False)

    def __str__(self):
        return f'{self.Student.Person.first_name} - {self.ChallengeExam.ChallengeName}'



class StudentAnswer(models.Model):
    StudentAnswerID = models.AutoField(primary_key=True)
    Student = models.ForeignKey(Student, on_delete=models.CASCADE)
    Question = models.ForeignKey(Question, on_delete=models.CASCADE)
    SelectedAnswer = models.ForeignKey(Answer, on_delete=models.SET_NULL, null=True)
    IsCorrect = models.BooleanField()
    PointsEarned = models.IntegerField()
    RateByStudent = models.IntegerField()  # Rate given by the student for the question
    AnsweredAt = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.Student.Person.first_name} - {self.Question.QuestionName}'



