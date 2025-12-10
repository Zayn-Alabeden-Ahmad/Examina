from rest_framework import serializers

class CategorySerializer(serializers.Serializer):
    CategoryName = serializers.CharField()



from .models import Question, Answer


class AnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Answer
        fields = ["AnswerID", "AnswerText", "IsCorrect"]

class QuestionSerializer(serializers.ModelSerializer):
    answers = AnswerSerializer(source='answer_set', many=True)

    class Meta:
        model = Question
        fields = [
            "QuestionID",
            "QuestionName",
            "QuestionText",
            "Category",
            "Rate",
            "Points",
            "QuestionType",
            "answers",
        ]
    def create(self, validated_data):
        answers_data = validated_data.pop('answer_set', [])  # استخرج بيانات الإجابات
        question = Question.objects.create(**validated_data)
        for ans_data in answers_data:
            Answer.objects.create(Question=question, **ans_data)
        return question


class StudentAnswerInputSerializer(serializers.Serializer):
    questionId = serializers.IntegerField()
    answerId = serializers.IntegerField()
    pointsEarned = serializers.IntegerField()
    isCorrect = serializers.BooleanField()
    qRatedByStudent = serializers.IntegerField()
